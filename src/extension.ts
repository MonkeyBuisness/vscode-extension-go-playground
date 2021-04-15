'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

import { SandboxView } from './sandboxView';
import { SandboxNode } from './sandboxDataProvider';
import { ExecCallback, ExtCfg, extName, golangLanguageId, stdoutKind } from './types';
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
            vscode.workspace.getConfiguration(extName).update('sandboxDir', sBoxesDir, vscode.ConfigurationTarget.Global);
            cfg.sandboxView.resyncSanboxes(sBoxesDir);
            cfg.toysView.refresh();
        }
    });
    let playCmd = vscode.commands.registerCommand(`${extName}.play`, async (sandbox : SandboxNode | string | undefined | null) => {
        let initialContent: string | undefined = undefined;
        if (typeof sandbox === 'string') {
            initialContent = sandbox;
            sandbox = undefined;
        }
        
        if (!sandbox) {
            sandbox = await cfg.sandboxView.createNewSandbox(initialContent);
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
    let runSandboxRemotelyCmd = vscode.commands.registerCommand(`${extName}.runRemote`, async () => {
        if (!cfg.cloudPlayground) {
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        compileRemotely(cfg, editor.document.uri.fsPath);
    });
    let fmtSandboxRemotelyCmd = vscode.commands.registerCommand(`${extName}.fmtRemote`, async () => {
        if (!cfg.cloudPlayground) {
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        let fmtCode = await fmtRemotely(cfg, editor.document.uri.fsPath);
        if (!fmtCode) {
            return;
        }

        editor.edit(editorBuilder => {
            let firstLine = editor!.document.lineAt(0);
            let lastLine = editor!.document.lineAt(editor!.document.lineCount - 1);
            let textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            editorBuilder.replace(textRange, fmtCode!);
        });
    });
    let shareSandboxRemotelyCmd = vscode.commands.registerCommand(`${extName}.share`, async () => {
        if (!cfg.cloudPlayground) {
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        shareRemotely(cfg, editor.document.uri.fsPath);
    });
    let runSandboxLocallyCmd = vscode.commands.registerCommand(`${extName}.runLocal`, async () => {
        if (!cfg.localPlayground) {
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        compileLocally(cfg, editor.document.uri.fsPath);
    });
    let fmtSandboxLocallyCmd = vscode.commands.registerCommand(`${extName}.fmtLocal`, async () => {
        if (!cfg.localPlayground) {
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        fmtLocally(cfg, editor.document.uri.fsPath);
    });
    context.subscriptions.push(
        playCmd,
        changeSanboxDirCmd,
        runSandboxRemotelyCmd,
        fmtSandboxRemotelyCmd,
        shareSandboxRemotelyCmd,
        runSandboxLocallyCmd,
        fmtSandboxLocallyCmd
    );

    // set global listeners.
    const statusBarVisibilityListener = (doc: vscode.TextDocument) => {
        if (doc.languageId !== golangLanguageId) {
            cfg.statusBar?.hide();
            return;
        }

        cfg.statusBar?.show();
    };
    vscode.workspace.onDidOpenTextDocument(statusBarVisibilityListener);
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (!e) {
            return;
        }
        return statusBarVisibilityListener(e.document);
    });
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

    cfg.statusBar = new StatusBar(
        context, cfg.localPlayground !== undefined, cfg.cloudPlayground !== undefined);

    return cfg;
}

async function compileRemotely(cfg: ExtCfg, fPath: string) {
    cfg.runOutChan.show();
    cfg.runOutChan.clear();

    let resp = await cfg.cloudPlayground?.compile(fPath);
    if (!resp) {
        return;
    }

    cfg.runOutChan.appendLine(`[Status: ${resp.Status}]`);
    if (resp.IsTest) {
        cfg.runOutChan.appendLine(`[Tests failed: ${resp.TestsFailed}]`);
    }

    if (resp.Errors) {
        cfg.runOutChan.appendLine(resp.Errors);
        return;
    }

    if (!resp.Events) {
        return;
    }

    for (let e of resp.Events!) {
        if (e.Kind !== stdoutKind) {
            continue;
        }
        
        if (e.Delay) {
            await delay(e.Delay / 1000000);
        }

        if (!e.Message) {
            continue;
        }

        // check for clear symbol.
        if (e.Message!.charCodeAt(0) === 12) {
            cfg.runOutChan.clear();
            e.Message = e.Message.slice(1);
        }
        
        cfg.runOutChan.append(e.Message!);
    }
}

async function fmtRemotely(cfg: ExtCfg, fPath: string) : Promise<string | undefined> {
    cfg.runOutChan.show();
    cfg.runOutChan.clear(); 

    let resp = await cfg.cloudPlayground?.format(fPath);
    if (!resp) {
        return;
    }

    if (resp.Error) {
        cfg.runOutChan.appendLine(resp.Error);
        return;
    }

    return resp.Body;
}

async function shareRemotely(cfg: ExtCfg, fPath: string) {
    cfg.runOutChan.show();
    cfg.runOutChan.clear();

    let resp = await cfg.cloudPlayground?.share(fPath);
    if (!resp) {
        return;
    }

    cfg.runOutChan.appendLine(`Your share link: ${resp}`);
}

async function compileLocally(cfg: ExtCfg, fPath: string) {
    cfg.runOutChan.show();
    cfg.runOutChan.clear();

    const callback: ExecCallback = {
        stdout: (data: string) => cfg.runOutChan.append(data)
    };

    let resp = await cfg.localPlayground?.compile(fPath, callback);
    if (!resp) {
        return;
    }
    cfg.runOutChan.clear();

    cfg.runOutChan.appendLine(`[Status: ${resp.Status}]`);

    if (resp.Errors) {
        cfg.runOutChan.appendLine(resp.Errors);
        return;
    }

    if (!resp.Events) {
        return;
    }

    for (let e of resp.Events!) {
        if (e.Kind !== stdoutKind) {
            continue;
        }

        if (!e.Message) {
            continue;
        }
        
        cfg.runOutChan.append(e.Message!);
    }
}

async function fmtLocally(cfg: ExtCfg, fPath: string) {
    cfg.runOutChan.show();
    cfg.runOutChan.clear();

    await cfg.localPlayground?.format(fPath);
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
