'use strict';

import 'reflect-metadata';
import * as vscode from 'vscode';
import * as fs from 'fs';

import {
    ExecCallback,
    ExtCfg,
    extName,
    golangLanguageId,
    Playground,
    stdoutKind 
} from './types';

const sandboxViewId: string = 'sandboxesView';
const toysViewId: string = 'toysView';
const goPathEnv: string = "GOPATH";

import { GoPlaygroundService } from './go-playground.service';
import { LocalPlaygroundService } from './local-playground.service';
import { CommandService } from './_services/command.service';
import { PlayCommand } from './_commands/play.command';
import { ChangeSandboxDirectoryCommand } from './_commands/change-sandbox-dir.command';
import {container} from "tsyringe";
import { SandboxView } from './_views/sanbox.view';
import { ConfigurationService } from './_services/configuration.service';
import { ToyView } from './_views/toy.view';
import { SandboxOpenItemCommand } from './_commands/sandbox-item-open.command';
import { RefreshSanboxDirCommand } from './_commands/refresh-sandbox-dir.command';
import { NewSandboxCommand } from './_commands/new-sandbox.command';
import { SandboxDeleteItemCommand } from './_commands/sandbox-item-delete.command';
import { PlayToyCommand } from './_commands/play-toy.command';
import { NewToyCommand } from './_commands/new-toy.command';
import { DeleteToyCommand } from './_commands/delete-toy.command';
import { EditToyCommand } from './_commands/edit-toy.command';
import { EnvironmentView } from './_views/environment.view';
import { NewEnvCommand } from './_commands/new-env.command';
import { EditEnvCommand } from './_commands/edit-env.command';
import { DeleteEnvCommand } from './_commands/delete-env.command';
import { StatusBarView } from './_views/status-bar.view';
import { RunCommand } from './_commands/run.command';

export function activate(context: vscode.ExtensionContext) {
    // register views.
    const cfgService = new ConfigurationService();
    cfgService.setContextValue(ConfigurationService.sandboxDirSpecifiedCtx, false);
    const sandboxesDir: string | undefined = cfgService.getConfiguration(
        ConfigurationService.sanboxesDirCfg, undefined);
    if (sandboxesDir) {
        if (!fs.existsSync(sandboxesDir)){
            fs.mkdirSync(sandboxesDir, { recursive: true });
        }
        cfgService.setContextValue(ConfigurationService.sandboxDirSpecifiedCtx, true);
    }
    container.register("ctx", { useValue: context });
    container.register("sandboxDir", { useValue: sandboxesDir || '' });
    container.resolve(SandboxView);
    container.resolve(ToyView);
    container.resolve(EnvironmentView);
    StatusBarView.injectCtx(context);
    StatusBarView.refresh();
    StatusBarView.hide();
    
    // register commands.
    CommandService.registerCommand(
        context, CommandService.playCmd, new PlayCommand());
    CommandService.registerCommand(
        context, CommandService.changeSandboxDirCmd, new ChangeSandboxDirectoryCommand());
    CommandService.registerCommand(
        context, CommandService.sandboxOpenItemCmd, new SandboxOpenItemCommand());
    CommandService.registerCommand(
        context, CommandService.refreshSandboxDirCmd, new RefreshSanboxDirCommand());
    CommandService.registerCommand(
        context, CommandService.newSandboxCmd, new NewSandboxCommand());
    CommandService.registerCommand(
        context, CommandService.sandboxDeleteItemCmd, new SandboxDeleteItemCommand());
    CommandService.registerCommand(
        context, CommandService.playToyCmd, new PlayToyCommand());
    CommandService.registerCommand(
        context, CommandService.newToyCmd, new NewToyCommand());
    CommandService.registerCommand(
        context, CommandService.deleteToyCmd, new DeleteToyCommand());
    CommandService.registerCommand(
        context, CommandService.editToyCmd, new EditToyCommand());
    CommandService.registerCommand(
        context, CommandService.newEnvCmd, new NewEnvCommand());
    CommandService.registerCommand(
        context, CommandService.editEnvCmd, new EditEnvCommand());
    CommandService.registerCommand(
        context, CommandService.deleteEnvCmd, new DeleteEnvCommand());
    CommandService.registerCommand(
        context, CommandService.runCmd, new RunCommand());

    // set global listeners.
    const statusBarVisibilityListener = (doc: vscode.TextDocument) => {
        if (doc.languageId !== golangLanguageId) {
            StatusBarView.hide();
            return;
        }

        StatusBarView.show();
    };
    vscode.workspace.onDidOpenTextDocument(statusBarVisibilityListener);
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (!e) {
            return;
        }
        return statusBarVisibilityListener(e.document);
    });



    // init extension.
    //const cfg = initExtension(context);

    // register commands.
    /*let runSandboxRemotelyCmd = vscode.commands.registerCommand(`${extName}.runRemote`, async () => {
        if (!cfg.cloudPlayground) {
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        compile(cfg.cloudPlayground, cfg.runOutChan, editor.document.uri.fsPath);
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

        compile(cfg.localPlayground, cfg.runOutChan, editor.document.uri.fsPath);
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
        runSandboxRemotelyCmd,
        fmtSandboxRemotelyCmd,
        shareSandboxRemotelyCmd,
        runSandboxLocallyCmd,
        fmtSandboxLocallyCmd
    );*/
}

export function deactivate() {}
/*
function initExtension(context: vscode.ExtensionContext) : ExtCfg {
    

    // create run output channel.
    let runOutput = vscode.window.createOutputChannel("Go Playground");

    // init views.
    //let sandboxView = new SandboxView(context, sandboxViewId, sandboxesDir);
    //let toysView = new ToyView(context, toysViewId);

    let cfg: ExtCfg = {
        runOutChan: runOutput,
        //sandboxView: sandboxView,
        //toysView: toysView,
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

async function compile(playground: Playground, runOutChan: vscode.OutputChannel, fPath: string) {
    runOutChan.show();
    runOutChan.clear();

    const callback: ExecCallback = {
        stdout: (data: string) => runOutChan.append(data)
    };

    let resp = await playground.compile(fPath, callback);
    if (!resp) {
        return;
    }
    runOutChan.clear();

    runOutChan.appendLine(`[Status: ${resp.Status}]`);
    if (resp.IsTest) {
        runOutChan.appendLine(`[Tests failed: ${resp.TestsFailed}]`);
    }

    if (resp.Errors && resp.Errors.length) {
        runOutChan.appendLine(resp.Errors);
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
            runOutChan.clear();
            e.Message = e.Message.slice(1);
        }
        
        runOutChan.append(e.Message!);
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

async function fmtLocally(cfg: ExtCfg, fPath: string) {
    cfg.runOutChan.show();
    cfg.runOutChan.clear();

    await cfg.localPlayground?.format(fPath);
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
*/
