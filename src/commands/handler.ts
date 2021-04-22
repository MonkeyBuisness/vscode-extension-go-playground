import * as vscode from 'vscode';
import { autoInjectable } from 'tsyringe';

export class CommandHandler {
    sayHello(ctx: vscode.ExtensionContext) {
        console.log("say");
        /*vscode.window.showOpenDialog({
            title: "Select Folder to Store Sanboxes",
            canSelectFolders: true
        });*/
    }
}

@autoInjectable()
export class TestService {

    constructor (private h?: CommandHandler) {
    }

    test(ctx: vscode.ExtensionContext) {
        this.h?.sayHello(ctx);
    }
}
