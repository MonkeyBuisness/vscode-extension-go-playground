import * as vscode from 'vscode';
import { EnvDefinition, ToyDefinition } from '../types';
import { ResourceService } from '../_services/resource.service';

export class EditEnvView {
    private static readonly _editEnvTemplate: string = 'edit_env_template.html';
    private static readonly _editEnvTemplateStyles : string[] = [
        'vscode.css',
        'edit_env_template_styles.css'
    ];
    private _panel: vscode.WebviewPanel | undefined;
    private _html: string = '';
    private _saveHandler: ((name?: string, command?: string, description?: string, cloudURL?: string, showOnStatusBar?: boolean) => void) | undefined;

    constructor() {
        this._html = ResourceService.mediaContent(EditEnvView._editEnvTemplate);

        let styles: string = '';
        for (const style of EditEnvView._editEnvTemplateStyles) {
            styles = styles.concat(ResourceService.mediaContent(style));
        }
        this._html = this._html.replace('<style></style>', `<style>${styles}</style>`);
    }

    show(env?: EnvDefinition) : void {
        this._panel = vscode.window.createWebviewPanel(
            'webview', env ? 'Edit Environment' : 'Add a new Environment', vscode.ViewColumn.One, { enableScripts: true });

        this._panel.webview.html = this._html;
        this._panel.webview.onDidReceiveMessage((data : any | undefined) => {
            if (this._saveHandler) {
                this._saveHandler(data?.name, data?.command, data?.description, data?.cloudURL, data?.showOnStatusBar);
            }
		});

        if (env) {
            this._panel.webview.postMessage({
                name: env.name,
                command: env.command || '',
                description: env.description || '',
                cloudURL: env.cloudURL || '',
                showOnStatusBar: env.showOnStatusBar,
            });
        }
    }

    onSave(callback: (name?: string, command?: string, description?: string, cloudURL?: string) => void) : void {
        this._saveHandler = callback;
    }

    close() : void {
        this._panel?.dispose();
    }
}
