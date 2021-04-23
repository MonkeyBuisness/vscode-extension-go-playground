# Go Playground [VSCode](https://code.visualstudio.com/) Extension

Play with Go in your own Playground.

- [How to install](#installation)
- [Extension Settings](#extension-settings)
  - [Commands](#commands-list)
  - [Keywords](#keywords)
- [Releases]()

## Installation

Launch __VS Code__ Quick Open (`Ctrl+P`), paste the following command, and press enter.
```
ext install ArtsemHutarau.go-playground
```

Or follow the [marketplace](https://marketplace.visualstudio.com/items?itemName=ArtsemHutarau.go-playground) link for more info.

## Extension Settings

This extension contributes the following settings:

### Commands List

* `go-playground.play`: activate extension (call the **currently open** .go file to play if provided)
* `go-playground.changeSanboxDir`: change path of the [sandboxes directory](#keywords)

### Keywords

> **Sandox** - in the current version of the extension, it's just a file with `.go` extension.

> **Sandoxes Directory** - directory that contains the sanbox files (with `.go` extension). Used to store all sandbox files in one place.



## Release Notes

### 0.0.1

- Initial release

### 0.0.2

- Fixed bug with `undefined` initial value for a new created sandbox
- Sandbox directory settings are now saved in the `global` target space
- Added commands description

### 0.1.0

- Fixed bug with `undefined` file name for a new created sandbox
- Added extension icon
- Added async output for local runned sandboxes
