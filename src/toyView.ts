import * as vscode from 'vscode';
import * as fs from 'fs';
import { presetToyDefinitions } from './types';
import { ToyDataProvider, ToyNode } from './toyDataProvider';

export class ToyView {
	private _toyProvider: ToyDataProvider;

	constructor(context: vscode.ExtensionContext, viewId: string, toyDir?: string) {
		this._toyProvider = new ToyDataProvider(presetToyDefinitions, toyDir);
		vscode.window.registerTreeDataProvider(viewId, this._toyProvider);
		const toysView = vscode.window.createTreeView(viewId, {
			treeDataProvider: this._toyProvider,
			showCollapseAll: true,
		});
		context.subscriptions.push(toysView);

		vscode.commands.registerCommand(`${viewId}.playToy`, (item: ToyNode) => {
			vscode.commands.executeCommand('go-playground.play', item.template);
		});
	}

	refresh() {
		this._toyProvider.refresh();
	}
}