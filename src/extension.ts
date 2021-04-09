// import * as vscode from 'vscode';
// import { window, ExtensionContext, commands, workspace, Uri } 
// from 'vscode';
// import { TextEncoder } from 'util';

// export function activate(context: vscode.ExtensionContext) {

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('go-playground.play', () => {
// 		// Display a message box to the user.
// 		vscode.window.showInformationMessage('Welcome to the go-playground!');

// 		/*window.showInputBox({
// 			placeHolder: "Please enter a file name",
// 		}).then((fileName) => {
// 			if (fileName !== undefined) {
// 				let u = Uri.parse(resource.path + '/' + fileName + '.txt');
// 				return workspace.fs.writeFile(u, new TextEncoder().encode('Hello World'));
// 			}
// 		})*/

// 		openInUntitled('package main func() main() {}', 'go');
// 	});

// 	async function openInUntitled(content: string, language?: string) {
// 		const document = await vscode.workspace.openTextDocument({
// 			language,
// 			content,
// 		});
// 		vscode.window.showTextDocument(document);
// 		document.save();
// 	}

// 	context.subscriptions.push(disposable);
// }

// export function deactivate() {}

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as Path from 'path';
// import * as UniqueFileName from 'uniquefilename';

let created_files: any[] = [];


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const resolvePath = (filepath: string): string =>
    {
        if (filepath[0] === '~')
        {
            const hoveVar = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
            return Path.join(process.env[hoveVar]!, filepath.slice(1));
        }
        else
        {
            return Path.resolve(filepath);
        }
    };

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('go-playground.play', () => {
        // The code you place here will be executed every time your command is executed
        /*const inputOptions = {
            prompt: 'Set the new temporary file name'
        };*/

        const tempdir = resolvePath(
            vscode.workspace
                .getConfiguration('createtmpfile')
                .get('tmpDir') || os.tmpdir());

        const onError = (e: NodeJS.ErrnoException) =>
            vscode.window.showErrorMessage(e.message);

        /*vscode.window.showInputBox(inputOptions)
            .then(input => `${tempdir}${Path.sep}${input}`)
            .then(filepath => UniqueFileName.get(filepath, {}))
            .then(filepath =>
        {
            fs.writeFile(filepath, '', onError);
            created_files.push(filepath);

            vscode.workspace
                .openTextDocument(filepath)
                .then(vscode.window.showTextDocument);
        });*/

		let filepath = `${tempdir}${Path.sep}main.go`
		fs.writeFile(filepath, 'package main', null, () => {});
        created_files.push(filepath);

        vscode.workspace
            .openTextDocument(filepath)
            .then(vscode.window.showTextDocument);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    const deleteOnExit = vscode.workspace
        .getConfiguration('createtmpfile')
        .get("deleteOnExit", false);

    if (deleteOnExit)
    {
        for (const f of created_files)
        {
            fs.unlink(f, console.error);
        }
    }
}
