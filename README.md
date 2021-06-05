# Rodem

Run the code on preformatted text in markdown
babel-like extension in Markdown(.md).

babel is org-mode extention in emacs.

execute code in markdown on vscode.


## Features

### execute code in Markdown

write code

![test screenshot](https://n9d.github.io/Rodem/images/rodem-javascript.png)

Press `F5` or `Ctrl-P -> Rodem: execute code` to execute

![test screenshot](https://n9d.github.io/Rodem/images/rodem-javascript2.png)


## default laungage

- javascript(js) -> `node`
- typescript(ts) -> `ts-node`
- ruby(rb)
- bash(sh)
- python(py)

### Experimental function
- rails(rails) -> `rails console`
- django(django) -> `python manage.py shell`
- django extension(django+) -> `python manage.py shell_plus`

## Requirements

none


## Extension Settings

if you would like to add language to this extension, edit `rodem.lang` in `settings.json`.

ex:
```
    "rodem.lang": {
        "sh": "bash",
        "bash":"bash",
        "zsh":"zsh",
    }
```
## Release Notes

### 0.1

Initial release of Rodem
