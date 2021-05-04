import * as vscode from 'vscode';
import { autoInjectable } from 'tsyringe';
import { EnvDefinition, golangLanguageId } from '../types';
import { CommandHandler } from '../_services/command.service';
import { PlaygroundService } from '../_services/playground.service';
import { IOService } from '../_services/io.service';

@autoInjectable()
export class RunCommand implements CommandHandler {

    constructor(
        private _playgroundService?: PlaygroundService,
        private _ioService?: IOService,
    ) {}

    async execute(env?: EnvDefinition) {
        if (!env) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        const chan = this._ioService?.resolveOutputChannel(`GO Playground - ${env.name}`);
        chan?.clear();
        chan?.show();

        this._playgroundService?.execute(env, editor.document.uri.fsPath, chan);
    }
}
