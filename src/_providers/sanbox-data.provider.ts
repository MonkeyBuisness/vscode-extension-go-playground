import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { sanboxFileExtension, extName } from '../types';
import { ResourceService } from '../_services/resource.service';
import { CommandService } from '../_services/command.service';

export class SandboxDataProvider implements vscode.TreeDataProvider<SandboxNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<SandboxNode | undefined | void> =
        new vscode.EventEmitter<SandboxNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<SandboxNode | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(private _sandboxDir?: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setSandoxDir(dir: string) {
        this._sandboxDir = dir;
    }

    getTreeItem(element: SandboxNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: SandboxNode): vscode.ProviderResult<SandboxNode[]> {
        if (!this._sandboxDir) {
            return Promise.resolve([this._getMissingFolderNode()]);
        }

        return Promise.resolve(this._loadSandboxFiles());
    }

    async findNodeByFilePath(fPath: string) : Promise<SandboxNode | null> {
        let children: SandboxNode[] = await this.getChildren() || [];
        for (let child of children) {
            if (fPath === child.filePath) {
                return child;
            }
        }

        return null;
    }

    private _getMissingFolderNode() : SandboxNode {
        return {
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "sandbox-missing-item",
            fileName: "",
            filePath: "",
            iconPath: ResourceService.iconPath('folder_info.svg'),
            label: "Missing the the sandoxes default folder. Please specify.",
            command: {
                command: CommandService.prepareCommand(CommandService.changeSandboxDirCmd),
                title: "Set default sanboxes directory",
            },
        };
    }

    private _loadSandboxFiles() : SandboxNode[] {
        let nodes: SandboxNode[] = [];

        let files = fs.readdirSync(this._sandboxDir!, { withFileTypes: true });
        for (let file of files) {
            if (!file.isFile || !file.name.endsWith(sanboxFileExtension)) {
                continue;
            }

            let node = new SandboxNode(file.name, path.join(this._sandboxDir!, file.name));
            node.command = {
                command: CommandService.prepareCommand(CommandService.sandboxOpenItemCmd),
                title: 'Open On Playground',
                arguments: [node.filePath],
            };
            nodes.push(node);
        }

        return nodes;
    }
}

export class SandboxNode extends vscode.TreeItem {

	constructor(
        public readonly fileName: string,
		public readonly filePath: string,
        public command?: vscode.Command,
	) {
		super(path.parse(fileName).name, vscode.TreeItemCollapsibleState.None);

		this.tooltip = this.filePath;
		this.description = fs.statSync(filePath).ctime.toLocaleString();
	}

	iconPath = ResourceService.iconPath('sandox.svg');

	contextValue = 'sandbox-item';
}
