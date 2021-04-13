import * as vscode from 'vscode';
import { extName } from './types';

export class StatusBar {
    runLocalItem?: vscode.StatusBarItem;
    runRemoteItem?: vscode.StatusBarItem;
    formatLocalItem?: vscode.StatusBarItem;
    formatRemoteItem?: vscode.StatusBarItem;
    shareItem?: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext, withLocal: boolean = true, withRemote: boolean = true) {
        if (withLocal) {
            this.initRunLocalItem(context);
            this.initFormatLocalItem(context);
        }

        if (withRemote) {
            this.initRunRemoteItem(context);
            this.initFormatRemoteItem(context);
            this.initShareItem(context);
        }
    }

    initRunLocalItem(context: vscode.ExtensionContext) : void {
        this.runLocalItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.runLocalItem.command = `${extName}.runLocal`;
        context.subscriptions.push(this.runLocalItem);
        this.runLocalItem.text = 'Local Run';
    }

    initRunRemoteItem(context: vscode.ExtensionContext) : void {
        this.runRemoteItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.runRemoteItem.command = `${extName}.runRemote`;
        context.subscriptions.push(this.runRemoteItem);
        this.runRemoteItem.text = 'Remote Run';
    }

    initFormatLocalItem(context: vscode.ExtensionContext) : void {
        this.formatLocalItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
        this.formatLocalItem.command = `${extName}.fmtLocal`;
        context.subscriptions.push(this.formatLocalItem);
        this.formatLocalItem.text = 'Format (local)';
    }

    initFormatRemoteItem(context: vscode.ExtensionContext) : void {
        this.formatRemoteItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
        this.formatRemoteItem.command = `${extName}.fmtRemote`;
        context.subscriptions.push(this.formatRemoteItem);
        this.formatRemoteItem.text = 'Format (remote)';
    }

    initShareItem(context: vscode.ExtensionContext) : void {
        this.shareItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 20);
        this.shareItem.command = `${extName}.share`;
        context.subscriptions.push(this.shareItem);
        this.shareItem.text = 'Share';
    }

    hide() {
        this.runLocalItem?.hide();
        this.runRemoteItem?.hide();
        this.formatLocalItem?.hide();
        this.formatRemoteItem?.hide();
        this.shareItem?.hide();
    }

    show() {
        this.runLocalItem?.show();
        this.runRemoteItem?.show();
        this.formatLocalItem?.show();
        this.formatRemoteItem?.show();
        this.shareItem?.show();
    }
}
