import * as vscode from 'vscode';
import * as fs from 'fs';
const { spawn } = require('child_process');
import { EnvDefinition } from '../types';

export class PlaygroundService {
    private static readonly _sandboxEnvVar = '${{sandbox}}';

    async execute(env: EnvDefinition, filePath: string, out?: vscode.OutputChannel) {
        if (env.cloudURL) {
            const body: string = fs.readFileSync(filePath).toString();
            return this._sendToCloud(body, env.cloudURL, out);
        }

        return this._exec(filePath, env.command || '', out);
    }

    private async _sendToCloud(body: string, url: string, out?: vscode.OutputChannel) {}

    private async _exec(filePath: string, command: string, out?: vscode.OutputChannel) {
        command = command.replace(PlaygroundService._sandboxEnvVar, filePath);
        out?.appendLine(`Running: ${command}\n`);
        
        const commands = command.split(' ');
        try {
            const uu = spawn(commands[0], commands.slice(1));
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
}
