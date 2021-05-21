import { autoInjectable } from 'tsyringe';
import * as vscode from 'vscode';
import { WikiDefinition } from '../types';
import { ResourceService } from '../_services/resource.service';

@autoInjectable()
export class WikiDataProvider implements vscode.TreeDataProvider<WikiNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<WikiNode | undefined | void> =
        new vscode.EventEmitter<WikiNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<WikiNode | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(private _presetWiki: WikiDefinition[]) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: WikiNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: WikiNode): vscode.ProviderResult<WikiNode[]> {
        if (!element) {
            const nodes: WikiNode[] = [];

            for (let node of this._presetWiki) {
                nodes.push(...this._resolveWikiNodes(node.name));
            }

            return Promise.resolve(nodes);
        }

        return Promise.resolve(/*this._resolveWikiNodes(element)*/[]);
    }

    private _resolveWikiNodes(nodeName: string) : WikiNode[] {
        const _children = this._resolveWikiChildren(nodeName);



        /*let nodes: WikiNode[] = [];

        for (let wiki of this._presetWiki) {
            nodes.push(new WikiNode(toy.name, true, toy.template, vscode.TreeItemCollapsibleState.None));
        }

        return nodes;*/

        return [];
    }

    private _resolveWikiChildren(name: string) : WikiDefinition[] {
        const children: WikiDefinition[] = [];

        const wikiPath = name.split('//');
       // for () {}
        
        return children;
    }

    /*private _resolveUserToyNodes() : ToyNode[] {
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
    }*/
}

export class WikiNode extends vscode.TreeItem {
    contextValue = 'wiki-node';

	constructor(
        public readonly label: string,
        public readonly name: string,
        public readonly description?: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState =
            vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(label, collapsibleState);

		this.tooltip = this.description || this.label;
        if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.iconPath = ResourceService.iconPath('info.svg');
        }
	}
}
