import * as vscode from 'vscode';
import { singleton, inject } from "tsyringe";
import { presetWiki } from '../types';
import { WikiDataProvider } from '../_providers/wiki-data.provider';

@singleton()
export class WikiView {
    public static readonly viewId: string = 'wikiView';
	private _wikiProvider: WikiDataProvider;

	constructor(@inject("ctx") context: vscode.ExtensionContext) {
		this._wikiProvider = new WikiDataProvider(presetWiki);
		vscode.window.registerTreeDataProvider(WikiView.viewId, this._wikiProvider);
		const toysView = vscode.window.createTreeView(WikiView.viewId, {
			treeDataProvider: this._wikiProvider,
			showCollapseAll: true,
		});
		context.subscriptions.push(toysView);
	}

	refresh() {
		this._wikiProvider.refresh();
	}
}
