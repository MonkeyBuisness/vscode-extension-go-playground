import * as vscode from 'vscode';
import { singleton, inject } from 'tsyringe';
import { EnvDataProvider } from '../_providers/env-data.provider';

@singleton()
export class EnvironmentView {
    public static readonly viewId: string = 'envsView';
	private _envProvider: EnvDataProvider;

	constructor(@inject("ctx") context: vscode.ExtensionContext) {
		this._envProvider = new EnvDataProvider();
		vscode.window.registerTreeDataProvider(EnvironmentView.viewId, this._envProvider);
		const toysView = vscode.window.createTreeView(EnvironmentView.viewId, {
			treeDataProvider: this._envProvider,
			showCollapseAll: true,
		});
		context.subscriptions.push(toysView);
	}

	refresh() {
		this._envProvider.refresh();
	}
}
