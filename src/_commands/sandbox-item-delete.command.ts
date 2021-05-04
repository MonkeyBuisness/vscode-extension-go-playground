import * as vscode from 'vscode';
import * as fs from 'fs';
import { autoInjectable } from 'tsyringe';
import { SandboxNode } from '../_providers/sanbox-data.provider';
import { CommandHandler } from '../_services/command.service';
import { SandboxView } from '../_views/sanbox.view';

@autoInjectable()
export class SandboxDeleteItemCommand implements CommandHandler {

    constructor(private _sandboxView?: SandboxView) {}

    async execute(node?: SandboxNode) {
        if (!node) {
            return;
        }

        fs.unlink(node.filePath, (err) => {
            this._sandboxView?.refresh();
            
            if (err) {
                vscode.window.showErrorMessage(`Could not delete ${node.filePath}: ${err}`);
                return;
            }            
        });
    }
}
