import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { sanboxFileExtension, extName } from './types';

export class SandboxDataProvider implements vscode.TreeDataProvider<SandboxNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<SandboxNode | undefined | void> =
        new vscode.EventEmitter<SandboxNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<SandboxNode | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(private sandboxDir?: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setSandoxDir(dir: string) {
        this.sandboxDir = dir;
    }

    getTreeItem(element: SandboxNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: SandboxNode): vscode.ProviderResult<SandboxNode[]> {
        if (!this.sandboxDir) {
            return Promise.resolve([this._getFolderNotSpecifiedNode()]);
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

    private _getFolderNotSpecifiedNode() : SandboxNode {
        return {
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "sandbox-missing-item",
            fileName: "",
            filePath: "",
            iconPath: {
                light: path.join(__filename, '..', '..', 'resources', 'light', 'folder_info.svg'),
                dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder_info.svg')
            },
            label: "Missing the the sandoxes default folder. Please specify.",
            command: {
                command: `${extName}.changeSanboxDir`,
                title: "Set default sanboxes directory",
            },
        };
    }

    private _loadSandboxFiles() : SandboxNode[] {
        let nodes: SandboxNode[] = [];

        let files = fs.readdirSync(this.sandboxDir!, { withFileTypes: true });
        for (let file of files) {
            if (!file.isFile || !file.name.endsWith(sanboxFileExtension)) {
                continue;
            }

            nodes.push(new SandboxNode(file.name, path.join(this.sandboxDir!, file.name)));
        }

        return nodes;
    }
}

export class SandboxNode extends vscode.TreeItem {

	constructor(
        public readonly fileName: string,
		public readonly filePath: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState =
            vscode.TreeItemCollapsibleState.None,
        public readonly command?: vscode.Command
	) {
		super(path.parse(fileName).name, collapsibleState);

		this.tooltip = this.filePath;
		this.description = fs.statSync(filePath).ctime.toLocaleString();
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'sandox.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'sandox.svg')
	};

	contextValue = 'sandbox-item';
}