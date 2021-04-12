'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as Path from 'path';

import { SandboxView } from './sandboxView';
import { SandboxNode } from './sandboxDataProvider';
import { SandoxFileData } from './types';
import { ToyView } from './toyView';


const sandboxViewId: string = 'sandboxesView';
const toysViewId: string = 'toysView';


import { GoPlaygroundService } from './go-playground.service';

export function activate(context: vscode.ExtensionContext) {
    // init views.
    // TODO: replace with path from settings.
    new SandboxView(context, sandboxViewId, '/home/artsem/Downloads/playground');
    new ToyView(context, toysViewId, '/home/artsem/Downloads/playground');

    // https://github.com/GorvGoyl/Shortcut-Menu-Bar-VSCode-Extension
    

    GoPlaygroundService.compile('https://play.golang.org', `package main

    import (
        "fmt"
    )
    
    func main() {
        fmt.Println("Hello azaza")
    }
    `).then(
        res => {
            console.log(res);
        }
    ).catch(
        err => {
            console.log(err);
        }
    );


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

        let fContent: string = '';
        if (sandbox) {
            let sandboxData: string = fs.readFileSync(sandbox.filePath).toString();
            let fileData: SandoxFileData = JSON.parse(sandboxData);
            fContent = fileData.code || '';
        }

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

		let filepath = `${tempdir}${Path.sep}main.go`;
		fs.writeFile(filepath, fContent, null, () => {});

        vscode.workspace
            .openTextDocument(filepath)
            .then((doc) => {
                vscode.window.showTextDocument(doc);
            });
    });

    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === "yourid" && document.uri.scheme === "file") {
            // do work
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    const deleteOnExit = vscode.workspace
        .getConfiguration('createtmpfile')
        .get("deleteOnExit", false);
}
