import * as vscode from 'vscode';
import { autoInjectable } from 'tsyringe';
import * as fs from 'fs';
import * as UniqueFileName from 'uniquefilename';
import { tmpdir } from 'os';
import * as path from 'path';

import {
    GoRawNotebookCell,
    golangLanguageId,
    notebookType,
    EnvDefinition,
} from '../types';
import { TextDecoder, TextEncoder } from 'util';
import { ExecutionListener, PlaygroundService } from '../_services/playground.service';
import { ConfigurationService } from '../_services/configuration.service';

type EnvPickItem = vscode.QuickPickItem & {index: number};

export class GoNotebook {
    private _controller?: GoNotebookController;

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.workspace.registerNotebookSerializer(notebookType, new GoNotebookSerializer())
        );

        this._controller = new GoNotebookController();
        context.subscriptions.push(this._controller);
    }

    public dispose(): void {
        this._controller?.dispose();
    }
}

class GoNotebookSerializer implements vscode.NotebookSerializer {
    
    public async deserializeNotebook(
        content: Uint8Array,
        _token: vscode.CancellationToken): Promise<vscode.NotebookData> {
        const contents = new TextDecoder().decode(content);
    
        let rawData: GoRawNotebookCell[] = [];
        try {
            rawData = <GoRawNotebookCell[]>JSON.parse(contents);
        } catch {
            rawData = [];
        }
        
        const cells = rawData.map(
            item => new vscode.NotebookCellData(item.kind, item.value, item.language)
        );
    
        return new vscode.NotebookData(cells);
    }

    public async serializeNotebook(
        data: vscode.NotebookData,
        _token: vscode.CancellationToken): Promise<Uint8Array> {       
        const contents: GoRawNotebookCell[] = data.cells
            .map<GoRawNotebookCell>((cell: vscode.NotebookCellData) => {
                return {
                    kind: cell.kind,
                    language: cell.languageId,
                    value: cell.value,
                } as GoRawNotebookCell;
            });
            
        return new TextEncoder().encode(JSON.stringify(contents));
    }
}

@autoInjectable()
class GoNotebookController {
    private static readonly _controllerId = notebookType;
    private static readonly _notebookType = notebookType;
    private static readonly _label = 'Go Notebook';
    private static readonly _supportedLanguages = [golangLanguageId];
    private static readonly _description = 'Run go code inside the notebook file';
    private readonly _controllers: vscode.NotebookController[] = [];
    private readonly _envs: EnvDefinition[] = [];
  
    constructor(
        private _playgroundService?: PlaygroundService,
        private _cfgService?: ConfigurationService) {
        this._envs = this._cfgService?.getConfiguration(
            ConfigurationService.envsCfg, []);
        this._controllers = this._envs.map<vscode.NotebookController>((env, i) => {
            const controller = vscode.notebooks.createNotebookController(
                `${GoNotebookController._controllerId}-${i + 1}`,
                GoNotebookController._notebookType,
                `${GoNotebookController._label} (${env.name})`,
            );
            controller.supportedLanguages = GoNotebookController._supportedLanguages;
            controller.supportsExecutionOrder = false;
            controller.detail = env.command || env.cloudURL;
            controller.description = GoNotebookController._description;
            controller.executeHandler = (
                cells: vscode.NotebookCell[],
                _notebook: vscode.NotebookDocument,
                _controller: vscode.NotebookController) => {
                    this._execute(cells, _controller, env);
                };

            return controller;
        });
    }

    public dispose() {
        this._controllers.forEach(c => c.dispose());
    }
  
    private async _execute(
        cells: vscode.NotebookCell[],
        controller: vscode.NotebookController,
        env: EnvDefinition) {
        cells.forEach(async (cell) => {
            let tmpFile: string = await UniqueFileName.get(
                path.join(tmpdir(), `notebook.${golangLanguageId}`));
            fs.writeFileSync(tmpFile, cell.document.getText());

            const execution = controller.createNotebookCellExecution(cell);
            execution.start(Date.now());
            execution.clearOutput(cell);

            const success = await this._playgroundService?.execute(
                env, tmpFile, undefined, this._defaultExecutionHandler(execution));

            execution.end(success, Date.now());
        });
    }

    private _defaultExecutionHandler(execution: vscode.NotebookCellExecution) : ExecutionListener {
        return {
            onError: (err: Error) => {
                execution.appendOutput([
                    new vscode.NotebookCellOutput([
                      vscode.NotebookCellOutputItem.error(err)
                    ])
                ]);
            },
            onResult: (result: string) => {
                execution.appendOutput(new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.text(result)
                ]));
            },
            onClear: () => {
                execution.clearOutput();
            }
        };
    }
}
