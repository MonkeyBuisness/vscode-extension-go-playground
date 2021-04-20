'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

import { SandboxView } from './sandboxView';
import { SandboxNode } from './sandboxDataProvider';
import {
    ExecCallback,
    ExtCfg,
    extName,
    golangLanguageId,
    Playground,
    stdoutKind 
} from './types';
import { ToyView } from './toyView';

const sandboxViewId: string = 'sandboxesView';
const toysViewId: string = 'toysView';
const goPathEnv: string = "GOPATH";

import { GoPlaygroundService } from './go-playground.service';
import { LocalPlaygroundService } from './local-playground.service';
import { StatusBar } from './statusBar';

// import { TestService } from './commands/handler';
// import { Injector } from './util';

export function activate(context: vscode.ExtensionContext) {
    /////////////
    const provider = new ColorsViewProvider(context.extensionUri);
    context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));
    //const h = Injector.resolve<TestService>(TestService);
    /////////////


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

/////////////////////////////////////////////////
class ColorsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'envView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}

	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>
				<button class="add-color-button">Add Color</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
//////////////////////////////////////////////////