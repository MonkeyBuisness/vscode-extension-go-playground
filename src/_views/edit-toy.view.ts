import * as vscode from 'vscode';
import { ToyDefinition } from '../types';
import { ResourceService } from '../_services/resource.service';

export class EditToyView {
    private static readonly _editToyTemplate: string = 'edit_toy_template.html';
    private static readonly _editToyTemplateStyles : string[] = [
        'vscode.css',
        'edit_toy_template_styles.css'
    ];
    private _panel: vscode.WebviewPanel | undefined;
    private _html: string = '';
    private _saveHandler: ((name?: string, template?: string) => void) | undefined;

    constructor() {
        this._html = ResourceService.mediaContent(EditToyView._editToyTemplate);

        let styles: string = '';
        for (const style of EditToyView._editToyTemplateStyles) {
            styles = styles.concat(ResourceService.mediaContent(style));
        }
        this._html = this._html.replace('<style></style>', `<style>${styles}</style>`);
    }

    show(toy?: ToyDefinition) : void {
        this._panel = vscode.window.createWebviewPanel(
            'webview', toy ? 'Edit Toy' : 'Add a new Toy', vscode.ViewColumn.One, { enableScripts: true });

        this._panel.webview.html = this._html;
        this._panel.webview.onDidReceiveMessage((data : any | undefined) => {
            if (this._saveHandler) {
                this._saveHandler(data?.name, data?.template);
            }
		});

        if (toy) {
            this._panel.webview.postMessage({
                name: toy.name,
                template: toy.template || '',
            });
        }
    }

    onSave(callback: (name?: string, template?: string) => void) : void {
        this._saveHandler = callback;
    }

    close() : void {
        this._panel?.dispose();
    }
}
