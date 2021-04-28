import * as vscode from 'vscode';
import { extName } from '../types';

export class ConfigurationService {
    public static readonly sanboxesDirCfg: string = 'sandboxDir';
    public static readonly sandboxDirSpecifiedCtx: string = 'sandboxDirSpecified';

    setContextValue(contextName: string, value: any) {
        vscode.commands.executeCommand('setContext', `${extName}.${contextName}`, value);
    }

    setConfiguration(cfgName: string, value: any) {
        vscode.workspace.getConfiguration(extName).update(cfgName, value, vscode.ConfigurationTarget.Global);
    }

    getConfiguration(cfgName: string, defaultValue?: any) : any {
        return vscode.workspace.getConfiguration(extName).get(cfgName) || defaultValue;
    }
}