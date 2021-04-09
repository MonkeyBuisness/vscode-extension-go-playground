import * as vscode from 'vscode';
import * as fs from 'fs';
import { SandboxDataProvider } from './sandboxDataProvider';

export class SandboxView {

	constructor(context: vscode.ExtensionContext, viewId: string, sandboxDir: string) {
		const sandboxProvider = new SandboxDataProvider(sandboxDir);
		vscode.window.registerTreeDataProvider(viewId, sandboxProvider);
		const sandboxView = vscode.window.createTreeView(viewId, {
			treeDataProvider: sandboxProvider,
			showCollapseAll: true,
		});

		context.subscriptions.push(sandboxView);
		vscode.commands.registerCommand(`${viewId}.refresh`, () => {
			sandboxProvider.refresh();
		});
		vscode.commands.registerCommand(`${viewId}.item.delete`, (item) => {
			fs.unlink(item.filePath, (err) => {
				if (err) {
					vscode.window.showErrorMessage(`Could not delete ${item.filePath}: ${err}`);
					return
				}
				
				sandboxProvider.refresh();
			})
		});
		vscode.commands.registerCommand(`${viewId}.item.open`, (item) => {
			vscode.commands.executeCommand('go-playground.play', item)
		});
	}
}