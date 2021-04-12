'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as Path from 'path';

import { SandboxView } from './sandboxView';
import { SandboxNode } from './sandboxDataProvider';
import { SandoxFileData, ExtCfg } from './types';
import { ToyView } from './toyView';

const extName: string = 'go-playground';
const sandboxViewId: string = 'sandboxesView';
const toysViewId: string = 'toysView';
const goPathEnv: string = "GOPATH";

import { GoPlaygroundService } from './go-playground.service';
import { LocalPlaygroundService } from './local-playground.service';
import { StatusBar } from './statusBar';
import { pathToFileURL } from 'node:url';

export function activate(context: vscode.ExtensionContext) {
    // init extension.
    const cfg = initExtension(context);

    let playCmd = vscode.commands.registerCommand('go-playground.play', async (sandbox : SandboxNode | undefined | null) => {
        if (!sandbox) {
            sandbox = await cfg.sandboxView.createNewSandbox();
            if (!sandbox) {
                return;
            }
        }

        // read sandbox file.
        let sandboxData: string = fs.readFileSync(sandbox.filePath).toString();
        let fileData: SandoxFileData = JSON.parse(sandboxData);
        let fContent: string = fileData.code || '';

		/*let filepath = `${tempdir}${Path.sep}playground.go`;
		fs.writeFile(filepath, fContent, null, () => {});

        vscode.workspace
            .openTextDocument(filepath)
            .then((doc) => {
                vscode.window.showTextDocument(doc);
            });*/
    });

    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.uri.scheme === "file") {
            // do work
        }
    });

    context.subscriptions.push(playCmd);
}

export function deactivate() {}

function initExtension(context: vscode.ExtensionContext) : ExtCfg {
    // init path to the sandboxes dir.
    const sandboxesDir : string = vscode.workspace.
        getConfiguration(extName).
        get('sandboxDir') || '';
    if (sandboxesDir) {
        if (!fs.existsSync(sandboxesDir)){
            fs.mkdirSync(sandboxesDir, { recursive: true });
        }
    }

    // create run output channel.
    let runOutput = vscode.window.createOutputChannel("Go Playground Run");

    // init views.
    let sandboxView = new SandboxView(context, sandboxViewId, sandboxesDir);
    let toysView = new ToyView(context, toysViewId);

    let cfg: ExtCfg = {
        sandboxesDir: sandboxesDir,
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
    }
    if (cfg.cloudPlayground) {
        cfg.statusBar.runRemoteItem = StatusBar.createRunRemoteItem(context);
        cfg.statusBar.shareItem = StatusBar.createShareItem(context);
        cfg.statusBar.formatItem = StatusBar.createFormatItem(context);
    }

    return cfg;
}
