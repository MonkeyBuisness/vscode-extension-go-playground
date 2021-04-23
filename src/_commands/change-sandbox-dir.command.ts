import * as vscode from 'vscode';
import { CommandHandler } from '../_services/command.service';
import { ConfigurationService } from '../_services/configuration.service';
import { autoInjectable } from 'tsyringe';
import { SandboxView } from '../_views/sanbox.view';
import { ToyView } from '../_views/toy.view';

@autoInjectable()
export class ChangeSandboxDirectoryCommand implements CommandHandler {

    constructor(
        private _cfgService?: ConfigurationService,
        private _sandboxView?: SandboxView,
        private _toyView?: ToyView,
    ) {}

    async execute() {
        const fileUri = await vscode.window.showOpenDialog({
            title: "Select Folder to Store Sanboxes",
            canSelectFolders: true
        });

        if (fileUri && fileUri[0]) {
            const sBoxesDir = fileUri[0].fsPath;
            this._cfgService?.setContextValue(ConfigurationService.sandboxDirSpecifiedCtx, true);
            this._cfgService?.setConfiguration(ConfigurationService.sanboxesDirCfg, sBoxesDir);
            this._sandboxView?.resyncSanboxes(sBoxesDir);
            this._toyView?.refresh();
        }
    }
}
