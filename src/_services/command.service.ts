import * as vscode from 'vscode';
import { extName } from '../types';

export interface CommandHandler {
    execute(...args: any[]) : any
}

export class CommandService {
    public static readonly playCmd: string = 'play';
    public static readonly changeSandboxDirCmd: string = 'changeSanboxDir';

    public static registerCommand(context: vscode.ExtensionContext, command: string, callback: CommandHandler) : void {
        const cmd = vscode.commands.registerCommand(`${extName}.${command}`,
            async (...args: any[]) => await callback.execute(...args));

        context.subscriptions.push(cmd);
    }

    public static executeCommand = async (command: string, ...args: any[]) => 
        vscode.commands.executeCommand(`${extName}.${command}`, args);
}
