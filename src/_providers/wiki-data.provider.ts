import { autoInjectable } from 'tsyringe';
import * as vscode from 'vscode';
import { WikiDefinition } from '../types';
import { CommandService } from '../_services/command.service';
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
            return Promise.resolve(this._resolveWikiNodes());
        }

        return Promise.resolve(this._resolveWikiNodes(element.name));
    }

    private _resolveWikiNodes(nodeName?: string) : WikiNode[] {
        const children = this._resolveWikiChildren(nodeName);
        if (!children) {
            return [];
        }

        const nodes: WikiNode[] = [];
        for (let node of children) {
            const isFinal = node.nodes?.length;

            const wikiNode = new WikiNode(
                node.name, nodeName ? `${nodeName}/${node.name}` : node.name, node.link, node.description, 
                isFinal ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None);
            if (isFinal) {
                wikiNode.command = {
                    command: CommandService.prepareCommand(CommandService.openWikiURLCmd),
                    title: 'Open Wiki URL',
                    arguments: [node.link],
                };
            }

            nodes.push(wikiNode);
        }

        return nodes;
    }

    private _resolveWikiChildren(name?: string) : WikiDefinition[] | null {
        let children: WikiDefinition[] = this._presetWiki;
        if (!name) {
            return children;
        }

        const wikiPath = name.split('/');
        for (let p of wikiPath) {
            const node = this._findWikiNodeByName(p, children);
            if (!node) {
                return null;
            }

            children = node?.nodes || [];
        }
        
        return children;
    }

    private _findWikiNodeByName(nodeName: string, children: WikiDefinition[]) : WikiDefinition | null {
        for (let node of children) {
            if (node.name === nodeName) {
                return node;
            }
        }

        return null;
    }
}

export class WikiNode extends vscode.TreeItem {
    contextValue = 'wiki-node';

	constructor(
        public readonly label: string,
        public readonly name: string,
        public readonly link?: string,
        public readonly desc?: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState =
            vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(label, collapsibleState);

		this.tooltip = this.desc || this.label;
        if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.iconPath = ResourceService.iconPath('link.svg');
            this.contextValue += '-info';
        }
	}
}
