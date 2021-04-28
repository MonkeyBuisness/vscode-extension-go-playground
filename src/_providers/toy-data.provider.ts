import { autoInjectable } from 'tsyringe';
import * as vscode from 'vscode';
import { ToyDefinition } from '../types';
import { CommandService } from '../_services/command.service';
import { ConfigurationService } from '../_services/configuration.service';
import { ResourceService } from '../_services/resource.service';

@autoInjectable()
export class ToyDataProvider implements vscode.TreeDataProvider<ToyNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<ToyNode | undefined | void> =
        new vscode.EventEmitter<ToyNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ToyNode | undefined | void> =
        this._onDidChangeTreeData.event;
    private _userToys: ToyDefinition[] = [];

    constructor(
        private _presetToys: ToyDefinition[],
        private _cfgService?: ConfigurationService,
    ) {
        this._userToys = this._loadUserToys();
    }

    refresh(): void {
        this._userToys = this._loadUserToys();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ToyNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ToyNode): vscode.ProviderResult<ToyNode[]> {
        if (!element) {
            const systemToysNode = new ToyNode('Default', true, '',
                this._userToys.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded);
            systemToysNode.contextValue = 'system-root';

            const userToysNode = new ToyNode('My Toys', false, '', 
                this._userToys.length ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed);
            userToysNode.contextValue = 'user-root';

            return [systemToysNode, userToysNode];
        }

        if (element.contextValue === 'user-root') {
            return Promise.resolve(this._resolveUserToyNodes());
        }

        return Promise.resolve(this._resolveDefaultToyNodes());
    }

    private _resolveDefaultToyNodes() : ToyNode[] {
        let nodes: ToyNode[] = [];

        for (let toy of this._presetToys) {
            nodes.push(new ToyNode(toy.name, true, toy.template, vscode.TreeItemCollapsibleState.None));
        }

        return nodes;
    }

    private _resolveUserToyNodes() : ToyNode[] {
        let nodes: ToyNode[] = [];

        for (let i = 0; i < this._userToys.length; i++) {
            const toy = this._userToys[i];
            const toyNode = new ToyNode(toy.name, false, toy.template, vscode.TreeItemCollapsibleState.None);
            toyNode.nodeId = i + 1;
            toyNode.command = {
                command: CommandService.prepareCommand(CommandService.editToyCmd),
                title: 'Edit Toy',
                arguments: [toyNode],
            };
            nodes.push(toyNode);
        }

        return nodes;
    }

    private _loadUserToys() : ToyDefinition[] {
        return this._cfgService?.getConfiguration(ConfigurationService.toysCfg, []);
    }
}

export class ToyNode extends vscode.TreeItem {
    public nodeId: number | undefined;

	constructor(
        public readonly label: string,
		public readonly isPresetable: boolean,
        public readonly template?: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState =
            vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(label, collapsibleState);

		this.tooltip = this.template;
        this.contextValue = this.isPresetable ? 'toy' : 'user-toy';
        const icon: string = this.isPresetable ? 'default_toy.svg' : 'user_toy.svg';
        this.iconPath = ResourceService.iconPath(icon);
	}
}
