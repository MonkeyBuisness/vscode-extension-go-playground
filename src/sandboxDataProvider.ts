import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const sanboxFileExtension: string = ".sandbox";

export class SandboxDataProvider implements vscode.TreeDataProvider<SandboxNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<SandboxNode | undefined | void> =
        new vscode.EventEmitter<SandboxNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<SandboxNode | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(private sandboxDir: string) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SandboxNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: SandboxNode): vscode.ProviderResult<SandboxNode[]> {
        return Promise.resolve(this._loadSandboxFiles());
    }

    private _loadSandboxFiles() : SandboxNode[] {
        let nodes: SandboxNode[] = [];

        let files = fs.readdirSync(this.sandboxDir, { withFileTypes: true });
        for (let file of files) {
            if (!file.isFile || !file.name.endsWith(sanboxFileExtension)) {
                continue
            }

            nodes.push(new SandboxNode(file.name, path.join(this.sandboxDir, file.name)));
        }

        return nodes
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
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'sandbox-item';
}