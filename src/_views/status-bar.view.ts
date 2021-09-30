import * as vscode from 'vscode';
import { autoInjectable } from "tsyringe";
import { EnvDefinition } from "../types";
import { ConfigurationService } from "../_services/configuration.service";
import { CommandService } from '../_services/command.service';

@autoInjectable()
export class StatusBarView {
    private static _items: vscode.StatusBarItem[] = [];
    private static _context: vscode.ExtensionContext;

    private static _cancelRunningItem: vscode.StatusBarItem;

    static injectCtx(context: vscode.ExtensionContext) : void {
        StatusBarView._context = context;

        StatusBarView._cancelRunningItem =
            vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        StatusBarView._cancelRunningItem.text = 'Cancel running';
        StatusBarView._cancelRunningItem.command = {
            title: 'Cancel running',
            command: CommandService.prepareCommand(CommandService.cancelRunningCmd),
        };
        this._context.subscriptions.push(StatusBarView._cancelRunningItem);
    }

    static refresh() {
        const cfgService = new ConfigurationService();

        for (let item of this._items) {
            item.hide();
            item.dispose();
        }
        this._items = [];

        let envsCfg = cfgService.getConfiguration(ConfigurationService.envsCfg, []);
        envsCfg = envsCfg.filter((env: EnvDefinition) => env.showOnStatusBar);
        for (let i = 0; i < envsCfg.length; i++) {
            const env = envsCfg[i];

            const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100 - i);
            item.text = env.name;
            item.command = {
                title: 'Run On Playground',
                command: CommandService.prepareCommand(CommandService.runCmd),
                arguments: [env],
            };
            item.tooltip = env.description || env.cloudURL || env.name;
            item.show();

            this._context.subscriptions.push(item);

            this._items.push(item);
        }
    }

    static show() : void {
        for (let item of this._items) {
            item.show();
        }
    }

    static hide() : void {
        for (let item of this._items) {
            item.hide();
        }
    }

    static showCancelRunningItem() : void {
        StatusBarView.hide();
        StatusBarView._cancelRunningItem.show();
    }

    static hideCancelRunningItem() : void {
        StatusBarView.show();
        StatusBarView._cancelRunningItem.hide();
    }
}
