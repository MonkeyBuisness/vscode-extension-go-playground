import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ToyDefinition, toyFileExtension } from '../types';

export class ToyDataProvider implements vscode.TreeDataProvider<ToyNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<ToyNode | undefined | void> =
        new vscode.EventEmitter<ToyNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ToyNode | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(private _presetToys: ToyDefinition[]) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ToyNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ToyNode): vscode.ProviderResult<ToyNode[]> {
        return Promise.resolve(this._loadToys());
    }

    private _loadToys() : ToyNode[] {
        let nodes: ToyNode[] = [];

        // load default toys;
        for (let toy of this._presetToys) {
            nodes.push(new ToyNode(toy.name, true, toy.template || ''));
        }

        return nodes;
    }
}

export class ToyNode extends vscode.TreeItem {

	constructor(
        public readonly label: string,
		public readonly isPresetable: boolean,
        public readonly template: string,
        public readonly filePath?: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState =
            vscode.TreeItemCollapsibleState.None
	) {
		super(label, collapsibleState);

		this.tooltip = this.template;
        this.contextValue = 'toy';
        let icon: string = this.isPresetable ? 'default_toy.svg' : 'user_toy.svg';
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', icon),
		    dark: path.join(__filename, '..', '..', 'resources', 'dark', icon)
        };
	}
}
