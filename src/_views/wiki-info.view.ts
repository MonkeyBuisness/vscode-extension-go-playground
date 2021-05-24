import fetch from 'node-fetch';
import * as vscode from 'vscode';

export class WikiInfoView {

    constructor() {}

    async show(url: string) {
        const panel = vscode.window.createWebviewPanel(
            'webview', url, vscode.ViewColumn.One, {
                enableScripts: true,
                enableCommandUris: true,
            });

        const wikiContent = await fetch(url);
        panel.webview.html = await wikiContent.text();
    }
}
