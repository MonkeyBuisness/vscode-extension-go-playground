import * as vscode from 'vscode';
import { CommandHandler } from '../_services/command.service';
import { golangLanguageId } from '../types';

export class PlayCommand implements CommandHandler {

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

        const doc = await vscode.workspace.openTextDocument(filePath);
        if (doc.languageId !== golangLanguageId) {
            return;
        }

        vscode.window.showTextDocument(doc);
    }
}
