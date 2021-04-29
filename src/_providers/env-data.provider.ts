import * as vscode from 'vscode';
import { autoInjectable } from 'tsyringe';
import { EnvDefinition, presetEnvDefinitions } from '../types';
import { ResourceService } from '../_services/resource.service';
import { CommandService } from '../_services/command.service';
import { ConfigurationService } from '../_services/configuration.service';

@autoInjectable()
export class EnvDataProvider implements vscode.TreeDataProvider<EnvNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<EnvNode | undefined | void> =
        new vscode.EventEmitter<EnvNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<EnvNode | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(private _cfgService?: ConfigurationService) {
        const envs: EnvDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.envsCfg, []);
        if (!envs.length) {
            this._cfgService?.setConfiguration(ConfigurationService.envsCfg, presetEnvDefinitions);
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: EnvNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: EnvNode): vscode.ProviderResult<EnvNode[]> {
        return Promise.resolve(this._loadEnvs());
    }

    private _loadEnvs() : EnvNode[] {
        let nodes: EnvNode[] = [];

        const envs: EnvDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.envsCfg, []);

        for (let i = 0; i < envs.length; i++) {
            const env = envs[i];
            const node = new EnvNode(
                env.name, env.showOnStatusBar, env.command, env.description, env.cloudURL);
            node.nodeId = i + 1;

            node.command = {
                title: 'Edit Environment',
                arguments: [node],
                command: CommandService.prepareCommand(CommandService.editEnvCmd),
            };

            nodes.push(node);
        }

        return nodes;
    }
}

export class EnvNode extends vscode.TreeItem {
    public nodeId: number | undefined;

	constructor(
        public readonly name: string,
        public readonly showOnStatusBar: boolean,
		public readonly cmd?: string,
		public readonly description?: string,
		public readonly cloudURL?: string,
        public command?: vscode.Command,
	) {
		super(name, vscode.TreeItemCollapsibleState.None);

		this.tooltip = this.cloudURL || this.cmd || this.description;
		this.description = this.description || this.cloudURL || this.name;

        const icon = this.cloudURL ? 'env_cloud.svg' : 'env.svg';
        this.iconPath = ResourceService.iconPath(icon);
        this.contextValue = this.showOnStatusBar ? 'env-item' : 'env-item-hidden';
	}
}
