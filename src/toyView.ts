import * as vscode from 'vscode';
import * as fs from 'fs';
import { presetToyDefinitions } from './types';
import { ToyDataProvider } from './toyDataProvider';

export class ToyView {

	constructor(context: vscode.ExtensionContext, viewId: string, toyDir: string) {
		const toyProvider = new ToyDataProvider(toyDir, presetToyDefinitions);
		vscode.window.registerTreeDataProvider(viewId, toyProvider);
		const toysView = vscode.window.createTreeView(viewId, {
			treeDataProvider: toyProvider,
			showCollapseAll: true,
		});

		context.subscriptions.push(toysView);
		/*vscode.commands.registerCommand(`${viewId}.refresh`, () => {
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
		});*/
	}
}