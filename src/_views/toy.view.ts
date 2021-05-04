import * as vscode from 'vscode';
import { singleton, inject } from "tsyringe";
import { presetToyDefinitions } from '../types';
import { ToyDataProvider } from '../_providers/toy-data.provider';

@singleton()
export class ToyView {
    public static readonly viewId: string = 'toysView';
	private _toyProvider: ToyDataProvider;

	constructor(@inject("ctx") context: vscode.ExtensionContext) {
		this._toyProvider = new ToyDataProvider(presetToyDefinitions);
		vscode.window.registerTreeDataProvider(ToyView.viewId, this._toyProvider);
		const toysView = vscode.window.createTreeView(ToyView.viewId, {
			treeDataProvider: this._toyProvider,
			showCollapseAll: true,
		});
		context.subscriptions.push(toysView);
	}

	refresh() {
		this._toyProvider.refresh();
	}
}
