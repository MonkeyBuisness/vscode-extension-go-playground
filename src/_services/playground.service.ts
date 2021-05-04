import * as vscode from 'vscode';
import * as fs from 'fs';
import { autoInjectable } from 'tsyringe';
const { spawn } = require('child_process');
import { EnvDefinition, golangLanguageId, stdoutKind } from '../types';
import { GoPlaygroundService, PlaygroundCompileResponse, PlaygroundFmtResponse } from './go-playground.service';

@autoInjectable()
export class PlaygroundService {
    private static readonly _sandboxEnvVar = '${{sandbox}}';

    constructor(private _goPlaygroundService?: GoPlaygroundService) {}

    async execute(env: EnvDefinition, filePath: string, out?: vscode.OutputChannel) {
        if (env.cloudURL) {
            const body: string = fs.readFileSync(filePath).toString();
            
            try {
                await this._sendToCloud(body, env.cloudURL, out);
            } catch(e) {
                out?.appendLine(`Could not execute command: ${e}`);
            } finally {
                return;
            }
        }

        return this._exec(filePath, env.command || '', out);
    }

    private async _sendToCloud(body: string, url: string, out?: vscode.OutputChannel) {
        if (url.endsWith('/compile')) {
            const compResponse = await this._goPlaygroundService?.compile(body, url);
            await PlaygroundService._cloudResponseCompile(compResponse, out);
            return;
        }

        if (url.endsWith('/fmt')) {
            const fmtBodyResponse = await this._goPlaygroundService?.format(body, url);
            if (fmtBodyResponse?.Error) {
                throw new Error(fmtBodyResponse?.Error);
            }

            PlaygroundService._cloudResponseFmt(fmtBodyResponse?.Body);
            return;
        }

        if (url.endsWith('/share')) {
            const shareLink = await this._goPlaygroundService?.share(body, url);
            out?.appendLine(`Your share link is ${shareLink}`);
            return;
        }

        const execResponse = this._goPlaygroundService?.exec(body, url);
        out?.appendLine(`Response: ${execResponse}`);
    }

    private async _exec(filePath: string, command: string, out?: vscode.OutputChannel) {
        command = command.replace(PlaygroundService._sandboxEnvVar, filePath);
        out?.appendLine(`Running: ${command}\n`);
        
        const commands = command.split(' ');
        try {
            const { stdout, stderr } = spawn(commands[0], commands.slice(1) || []);

            for await (const data of stdout) {
                if (!data) {
                    continue;
                }

                const log: string = data.toString();
                out?.append(log);
            }

            for await (const err of stderr) {
                if (!err) {
                    continue;
                }

                out?.append(err.toString());
            }
        } catch(e) {
            out?.appendLine(`Error ${e.code}: ${e.message}`);
        }
    }

    private static _cloudResponseFmt(response?: string) : void {
        if (!response) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== golangLanguageId) {
            return;
        }

        editor.edit(editorBuilder => {
            let firstLine = editor!.document.lineAt(0);
            let lastLine = editor!.document.lineAt(editor!.document.lineCount - 1);
            let textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
            editorBuilder.replace(textRange, response);
        });
    }

    private static async _cloudResponseCompile(cmpResp?: PlaygroundCompileResponse, out?: vscode.OutputChannel) {
        out?.appendLine(`[Status: ${cmpResp?.Status}]`);
        if (cmpResp?.IsTest) {
            out?.appendLine(`[Tests failed: ${cmpResp.TestsFailed}]`);
        }

        if (cmpResp?.Errors && cmpResp?.Errors.length) {
            out?.appendLine(cmpResp?.Errors);
            return;
        }

        if (!cmpResp?.Events) {
            return;
        }
        
        for (let e of cmpResp?.Events) {
            if (e.Kind !== stdoutKind) {
                continue;
            }
            
            if (e.Delay) {
                await PlaygroundService._delay(e.Delay / 1000000);
            }

            if (!e.Message) {
                continue;
            }

            // check for the clear symbol.
            if (e.Message!.charCodeAt(0) === 12) {
                out?.clear();
                e.Message = e.Message.slice(1);
            }
            
            out?.append(e.Message!);
        }
    }

    private static _delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
