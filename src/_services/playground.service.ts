import * as vscode from 'vscode';
import * as fs from 'fs';
import { autoInjectable } from 'tsyringe';
const { spawn } = require('child_process');
import { EnvDefinition, golangLanguageId, stderrKind, stdoutKind } from '../types';
import { GoPlaygroundService, PlaygroundCompileResponse } from './go-playground.service';

export interface ExecutionListener {
    onError(err: Error) : void;
    onResult(result: string) : void;
    onClear() : void;
}

@autoInjectable()
export class PlaygroundService {
    private static readonly _sandboxEnvVar = '${{sandbox}}';
    private static _runningProc: any = null;

    constructor(private _goPlaygroundService?: GoPlaygroundService) {}

    public async execute(
        env: EnvDefinition,
        filePath: string,
        out?: vscode.OutputChannel,
        listener?: ExecutionListener) : Promise<boolean> {
        if (env.cloudURL) {
            const body: string = fs.readFileSync(filePath).toString();
            
            let success: boolean;
            try {
                success = await this._sendToCloud(body, env.cloudURL, out, listener);
            } catch(e) {
                const err = `Could not execute command: ${e}`;
                out?.appendLine(err);
                listener?.onError(new Error(err));
                return false;
            }

            return success;
        }

        return this._exec(filePath, env.command || '', out, listener);
    }

    public abortExecution() {
        this._goPlaygroundService?.abort();
        this._abort();
    }

    private _abort() : void {
        PlaygroundService._runningProc?.kill();
    }

    private async _sendToCloud(
        body: string,
        url: string,
        out?: vscode.OutputChannel,
        listener?: ExecutionListener) : Promise<boolean> {
        if (url.endsWith('/compile')) {
            const compResponse = await this._goPlaygroundService?.compile(body, url);
            return await PlaygroundService._cloudResponseCompile(compResponse, out, listener);
        }

        if (url.endsWith('/fmt')) {
            const fmtBodyResponse = await this._goPlaygroundService?.format(body, url);
            if (fmtBodyResponse?.Error) {
                throw new Error(fmtBodyResponse?.Error);
            }

            PlaygroundService._cloudResponseFmt(fmtBodyResponse?.Body);
            return true;
        }

        if (url.endsWith('/share')) {
            const shareLink = await this._goPlaygroundService?.share(body, url);
            out?.appendLine(`Your share link is ${shareLink}`);
            return true;
        }

        const execResponse = this._goPlaygroundService?.exec(body, url);
        out?.appendLine(`Response: ${execResponse}`);
        return true;
    }

    private async _exec(
        filePath: string,
        command: string,
        out?: vscode.OutputChannel,
        listener?: ExecutionListener) : Promise<boolean> {
        let success: boolean = true;
        command = command.replace(PlaygroundService._sandboxEnvVar, filePath);
        out?.appendLine(`Running: ${command}\n`);
        
        const commands = command.split(' ');
        try {
            PlaygroundService._runningProc = spawn(commands[0], commands.slice(1) || []);

            const { stdout, stderr } = PlaygroundService._runningProc;

            for await (const data of stdout) {
                if (PlaygroundService._runningProc.killed) {
                    break;
                }

                if (!data) {
                    continue;
                }

                const log: string = data.toString();
                out?.append(log);
                listener?.onResult(log);
            }

            for await (const err of stderr) {
                if (PlaygroundService._runningProc.killed) {
                    break;
                }

                if (!err) {
                    continue;
                }

                out?.append(err.toString());
                listener?.onError(new Error(err.toString()));
                success = false;
            }
        } catch(e: any) {
            const err = `Error ${e.code}: ${e.message}`;
            out?.appendLine(err);
            listener?.onError(new Error(err));
            success = false;
        } finally {
            if (PlaygroundService._runningProc.killed) {
                out?.appendLine('Canceled');
            }

            PlaygroundService._runningProc = null;
        }

        return success;
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

    private static async _cloudResponseCompile(
        cmpResp?: PlaygroundCompileResponse,
        out?: vscode.OutputChannel,
        listener?: ExecutionListener) : Promise<boolean> {
        const status = `[Status: ${cmpResp?.Status}]`;
        out?.appendLine(status);
        listener?.onResult(status);
        if (cmpResp?.IsTest) {
            const testsResponse = `[Tests failed: ${cmpResp.TestsFailed}]`;
            out?.appendLine(testsResponse);
            listener?.onResult(testsResponse);
        }

        if (cmpResp?.Errors && cmpResp?.Errors.length) {
            out?.appendLine(cmpResp?.Errors);
            listener?.onError(new Error(cmpResp?.Errors));
            return false;
        }

        if (!cmpResp?.Events) {
            return true;
        }
        
        for (let e of cmpResp?.Events) {
            if (e.Delay) {
                await PlaygroundService._delay(e.Delay / 1000000);
            }

            if (!e.Message) {
                continue;
            }

            // check for the clear symbol.
            if (e.Message!.charCodeAt(0) === 12) {
                out?.clear();
                listener?.onClear();
                e.Message = e.Message.slice(1);
            }
            
            out?.append(e.Message!);

            if (e.Kind === stdoutKind) {
                listener?.onResult(e.Message);
            } else if (e.Kind === stderrKind) {
                listener?.onError(new Error(e.Message));
            }
        }

        return true;
    }

    private static _delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
