import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Path from 'path';
import * as UniqueFileName from 'uniquefilename';
import { SandboxDataProvider, SandboxNode } from './sandboxDataProvider';
import { sanboxFileExtension, SandoxFileData, sanboxFileVersion } from './types';

export class SandboxView {
	private _sandboxProvider: SandboxDataProvider;

	constructor(context: vscode.ExtensionContext, viewId: string, private sandboxDir: string) {
		this._sandboxProvider = new SandboxDataProvider(sandboxDir);
		vscode.window.registerTreeDataProvider(viewId, this._sandboxProvider);
		const sandboxView = vscode.window.createTreeView(viewId, {
			treeDataProvider: this._sandboxProvider,
			showCollapseAll: true,
		});

		context.subscriptions.push(sandboxView);
		vscode.commands.registerCommand(`${viewId}.refresh`, () => {
			this._sandboxProvider.refresh();
		});
		vscode.commands.registerCommand(`${viewId}.newItem`, () => {
			this.createNewSandbox();
		});
		vscode.commands.registerCommand(`${viewId}.item.delete`, (item) => {
			fs.unlink(item.filePath, (err) => {
				if (err) {
					vscode.window.showErrorMessage(`Could not delete ${item.filePath}: ${err}`);
					return;
				}
				
				this._sandboxProvider.refresh();
			});
		});
		vscode.commands.registerCommand(`${viewId}.item.open`, (item: SandboxNode) => {
			vscode.commands.executeCommand('go-playground.play', item);
		});
	}

	createNewSandbox() : void {
		vscode.window.showInputBox({
			prompt: 'Enter the new sandbox name'
		})
		.then(input => `${this.sandboxDir}${Path.sep}${input}${sanboxFileExtension}`)
		.then(filepath => UniqueFileName.get(filepath, {}))
		.then(filepath => {
			let fData: SandoxFileData = {
				version: sanboxFileVersion,
				code: ''
			};
			fs.writeFileSync(filepath, JSON.stringify(fData));

			this._sandboxProvider.findNodeByFilePath(filepath).then(
				(item) => {
					if (item) {
						vscode.commands.executeCommand('go-playground.play', item);
					}
				}
			);

			this._sandboxProvider.refresh();
		});
	}
}