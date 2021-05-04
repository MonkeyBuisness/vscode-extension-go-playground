import * as vscode from 'vscode';
import { singleton, inject } from "tsyringe";
import * as UniqueFileName from 'uniquefilename';
import * as Path from 'path';
import * as fs from 'fs';
import { SandboxDataProvider, SandboxNode } from "../_providers/sanbox-data.provider";
import { sanboxFileExtension } from '../types';

@singleton()
export class SandboxView {
    public static readonly viewId: string = 'sandboxesView';
    private _sandboxProvider: SandboxDataProvider;

	constructor(
        @inject("ctx") context: vscode.ExtensionContext,
        @inject("sandboxDir") private _sandboxDir?: string,
    ){
		this._sandboxProvider = new SandboxDataProvider(this._sandboxDir);
		vscode.window.registerTreeDataProvider(SandboxView.viewId, this._sandboxProvider);
		const sandboxView = vscode.window.createTreeView(SandboxView.viewId, {
			treeDataProvider: this._sandboxProvider,
			showCollapseAll: true,
		});
		context.subscriptions.push(sandboxView);
	}

	async createNewSandbox(content?: string) : Promise<SandboxNode | null> {
		let fileName = await vscode.window.showInputBox({
			prompt: 'Enter the new sandbox name'
		});
		if (!fileName) {
			return null;
		}

		if (fileName.endsWith(sanboxFileExtension)) {
			fileName = fileName.slice(0, fileName.length - sanboxFileExtension.length);
		}

		let input: string = await UniqueFileName.get(
            `${this._sandboxDir}${Path.sep}${fileName}${sanboxFileExtension}`, {});
		fs.writeFileSync(input, content || '');
	
		this._sandboxProvider.refresh();

		return await this._sandboxProvider.findNodeByFilePath(input);
	}

	resyncSanboxes(newDir: string) : void {
		this._sandboxDir = newDir;
		this._sandboxProvider.setSandoxDir(newDir);
		this._sandboxProvider.refresh();
	}

	refresh() : void {
		this._sandboxProvider.refresh();
	}
}
