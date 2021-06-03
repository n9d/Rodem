import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as temp from 'temp';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('rodem.executecode', () => {
		const code = extract();
		if (code.lang!=="nop") {
			const out = execute(code);
			output(code,out);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}


interface Code{
	lang: string,
	code: string,
	output: number[]
}

interface Out{
	stdout: string,
	stderr: string,
	status: string
}

function output(code:Code, out:Out){
	const editor = vscode.window.activeTextEditor;

	if (editor) {

		editor.edit(builder => {
			const doc : vscode.TextDocument = editor.document;
			if (code.output.length === 2){
				builder.replace(new vscode.Range(doc.lineAt(code.output[0]).range.start,doc.lineAt(code.output[1]).range.end), `\`\`\`output\n${out.stdout}\n\`\`\``);
			}else{
				builder.insert(new vscode.Position(code.output[0], 0),`\n\`\`\`output\n${out.stdout}\n\`\`\`\n`);
			}
		});

	}
}

// code実行時のエラー時の処理未実装
function execute(code:Code):Out {
	const lang = vscode.workspace.getConfiguration("rodem").lang[code.lang];

	if (lang){
		temp.track();
		const tempFile = temp.openSync('exec_code');
		fs.writeSync(tempFile.fd,code.code);
		const stdout = child_process.execSync(`cat ${tempFile.path} | ${lang}`, {timeout:10000}).toString();
		temp.cleanupSync();
		return {stdout:stdout,stderr:"",status:"success"};
	}
	return {stdout:"",stderr:"", status:"error"};
}


// 最終行に```で実行したときにバグがありそう
function extract():Code {
	const editor = vscode.window.activeTextEditor;
	if (editor){
		const doc : vscode.TextDocument = editor.document;
		const newline = "\n"; //NOTE: あとでエディタから改行コードを探って\nのところに置換する
		const txt = (doc.getText()+"\n```").split(newline);

		// NOTE: あとでflatmapで書き換えること
		const pre = txt.map((x,y)=>{return {text:x,line:y};})
			.filter(x=>String(x.text).match(/^```.*$/));

		const line = editor.selection.active.line;
		const start = max_by(pre, x=>x.line>=line?0:x.line);
		const end = min_by(pre, x=>x.line<=line?txt.length-1:x.line);
		const lang = (start?.text.match(/```(.+)$/)||[])[1];
		const nextStart = min_by(pre, (x:any)=>x.line<=Number(end?.line)?txt.length-1:x.line);
		const nextEnd = min_by(pre, (x:any)=>x.line<=Number(nextStart?.line)?txt.length-1:x.line);

		if (start && end && lang && lang!=="output") {
			return {
				lang: lang,
				code: txt.slice(start.line+1,end.line).join(newline),
				output: nextStart?.text.match(/```output$/) && nextEnd?.text.match(/```/) && nextStart.line<nextEnd.line? [nextStart.line,nextEnd.line] : [end.line+1]
			};
		}
	}
	return {lang:"nop",code:"",output:[]};
}



function max_by<T,U>(arr:T[], func:(arg:T)=>U):T{
    let [r, m] = [0, func(arr[0])];
    for(let i=0; i<arr.length; ++i) {
        let t = func(arr[i]);
        [r, m] = t > m ? [i, t] : [r, m];
    }
    return arr[r];
}

function min_by<T,U>(arr:T[], func:(arg:T)=>U):T{
    let [r, m] = [0, func(arr[0])];
    for(let i=0; i<arr.length; ++i) {
        let t = func(arr[i]);
        [r, m] = t < m ? [i, t] : [r, m];
    }
    return arr[r];
}
