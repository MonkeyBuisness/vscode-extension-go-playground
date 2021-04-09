'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as Path from 'path';

import { SandboxView } from './sandboxView';
import { SandboxNode } from './sandboxDataProvider';


const sandboxViewId: string = 'sandboxesView';


export function activate(context: vscode.ExtensionContext) {
    // init views.
    // TODO: replace with path from settings.
    new SandboxView(context, sandboxViewId, '/home/artsem/Downloads/playground');

    // https://github.com/GorvGoyl/Shortcut-Menu-Bar-VSCode-Extension
    


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

    let disposable = vscode.commands.registerCommand('go-playground.play', (sandbox : SandboxNode | undefined | null) => {
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
}
