import * as vscode from 'vscode';

export class StatusBar {
    static createRunLocalItem(context: vscode.ExtensionContext) : vscode.StatusBarItem {
        let item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        item.command = 'statusBar.runLocal';
        context.subscriptions.push(item);
        item.text = 'Local Run';

        return item;
    }

    static createRunRemoteItem(context: vscode.ExtensionContext) : vscode.StatusBarItem {
        let item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        item.command = 'statusBar.runRemote';
        context.subscriptions.push(item);
        item.text = 'Remote Run';

        return item;
    }

    static createFormatLocalItem(context: vscode.ExtensionContext) : vscode.StatusBarItem {
        let item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
        item.command = 'statusBar.fmtLocal';
        context.subscriptions.push(item);
        item.text = 'Format (local)';

        return item;
    }

    static createFormatRemoteItem(context: vscode.ExtensionContext) : vscode.StatusBarItem {
        let item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
        item.command = 'statusBar.fmtRemote';
        context.subscriptions.push(item);
        item.text = 'Format (remote)';

        return item;
    }

    static createShareItem(context: vscode.ExtensionContext) : vscode.StatusBarItem {
        let item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 20);
        item.command = 'statusBar.share';
        context.subscriptions.push(item);
        item.text = 'Share';

        return item;
    }
}
