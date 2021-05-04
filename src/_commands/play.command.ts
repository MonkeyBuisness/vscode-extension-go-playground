import * as vscode from 'vscode';
import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { golangLanguageId } from '../types';
import { SandboxView } from '../_views/sanbox.view';

@autoInjectable()
export class PlayCommand implements CommandHandler {

    constructor(private _sandboxView?: SandboxView) {}

    async execute(args: any[]) {
        let filePath: string | undefined;

        if (!args || !args.length) {
            const editor = vscode.window.activeTextEditor;
            filePath = editor?.document.uri.fsPath;
        } else {
            filePath = args[0];
        }

        if (!filePath) {
            return;
        }

        try {
            const doc = await vscode.workspace.openTextDocument(filePath);
            if (doc.languageId !== golangLanguageId) {
                return;
            }

            vscode.window.showTextDocument(doc);
        } catch (e) {
            vscode.window.showErrorMessage(`Could not open ${filePath}: ${e}`);
            this._sandboxView?.refresh();
        }
    }
}
