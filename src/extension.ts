'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as Path from 'path';

import { SandboxView } from './sandboxView';
import { SandboxNode } from './sandboxDataProvider';
import { ExtCfg, extName } from './types';
import { ToyView } from './toyView';

const sandboxViewId: string = 'sandboxesView';
const toysViewId: string = 'toysView';
const goPathEnv: string = "GOPATH";

import { GoPlaygroundService } from './go-playground.service';
import { LocalPlaygroundService } from './local-playground.service';
import { StatusBar } from './statusBar';

export function activate(context: vscode.ExtensionContext) {
    // init extension.
    const cfg = initExtension(context);

    // register commands.
    let changeSanboxDirCmd = vscode.commands.registerCommand(`${extName}.changeSanboxDir`, async () => {
        let fileUri = await vscode.window.showOpenDialog({
            title: "Select Folder to Store Sanboxes",
            canSelectFolders: true
        });
        if (fileUri && fileUri[0]) {
            const sBoxesDir = fileUri[0].fsPath;
            vscode.commands.executeCommand('setContext', `${extName}.sandboxDirSpecified`, true);
            vscode.workspace.getConfiguration(extName).update('sandboxDir', sBoxesDir);
            cfg.sandboxView.resyncSanboxes(sBoxesDir);
        }
    });
   
    let playCmd = vscode.commands.registerCommand(`${extName}.play`, async (sandbox : SandboxNode | undefined | null) => {
        if (!sandbox) {
            sandbox = await cfg.sandboxView.createNewSandbox();
            if (!sandbox) {
                return;
            }
        }

        // read sandbox file.
        let sandboxData: string = fs.readFileSync(sandbox.filePath).toString();

        // open file to edit.
        let doc = await vscode.workspace.openTextDocument(sandbox.filePath);
        vscode.window.showTextDocument(doc);
    });

    context.subscriptions.push(playCmd, changeSanboxDirCmd);
}

export function deactivate() {}

function initExtension(context: vscode.ExtensionContext) : ExtCfg {
    // init path to the sandboxes dir.
    let sandboxesDir: string | undefined = vscode.workspace.
        getConfiguration(extName).
        get('sandboxDir') || '';
    if (sandboxesDir.length && sandboxesDir !== '') {
        if (!fs.existsSync(sandboxesDir)){
            fs.mkdirSync(sandboxesDir, { recursive: true });
        }
        vscode.commands.executeCommand('setContext', `${extName}.sandboxDirSpecified`, true);
    } else {
        sandboxesDir = undefined;
    }

    // create run output channel.
    let runOutput = vscode.window.createOutputChannel("Go Playground Run");

    // init views.
    let sandboxView = new SandboxView(context, sandboxViewId, sandboxesDir);
    let toysView = new ToyView(context, toysViewId);

    let cfg: ExtCfg = {
        runOutChan: runOutput,
        sandboxView: sandboxView,
        toysView: toysView,
        statusBar: {}
    };

    // init local playground.
    if (process.env[goPathEnv]) {
        cfg.localPlayground = new LocalPlaygroundService();
    }

    // init cloud playground.
    const cloudAPI : string | undefined = vscode.workspace.
        getConfiguration(extName).
        get('cloudAPI');
    if (cloudAPI) {
        cfg.cloudPlayground = new GoPlaygroundService(cloudAPI);
    }

    // init status bar items.
    if (cfg.localPlayground) {
        cfg.statusBar.runLocalItem = StatusBar.createRunLocalItem(context);
        cfg.statusBar.formatLocalItem = StatusBar.createFormatLocalItem(context);
    }
    if (cfg.cloudPlayground) {
        cfg.statusBar.runRemoteItem = StatusBar.createRunRemoteItem(context);
        cfg.statusBar.shareItem = StatusBar.createShareItem(context);
        cfg.statusBar.formatRemoteItem = StatusBar.createFormatLocalItem(context);
    }

    return cfg;
}
