'use strict';

import 'reflect-metadata';
import * as vscode from 'vscode';
import * as fs from 'fs';

import {
    golangLanguageId,
} from './types';

import { CommandService } from './_services/command.service';
import { PlayCommand } from './_commands/play.command';
import { ChangeSandboxDirectoryCommand } from './_commands/change-sandbox-dir.command';
import {container} from "tsyringe";
import { SandboxView } from './_views/sanbox.view';
import { ConfigurationService } from './_services/configuration.service';
import { ToyView } from './_views/toy.view';
import { SandboxOpenItemCommand } from './_commands/sandbox-item-open.command';
import { RefreshSanboxDirCommand } from './_commands/refresh-sandbox-dir.command';
import { NewSandboxCommand } from './_commands/new-sandbox.command';
import { SandboxDeleteItemCommand } from './_commands/sandbox-item-delete.command';
import { PlayToyCommand } from './_commands/play-toy.command';
import { NewToyCommand } from './_commands/new-toy.command';
import { DeleteToyCommand } from './_commands/delete-toy.command';
import { EditToyCommand } from './_commands/edit-toy.command';
import { EnvironmentView } from './_views/environment.view';
import { NewEnvCommand } from './_commands/new-env.command';
import { EditEnvCommand } from './_commands/edit-env.command';
import { DeleteEnvCommand } from './_commands/delete-env.command';
import { StatusBarView } from './_views/status-bar.view';
import { RunCommand } from './_commands/run.command';
import { HideEnvOnStatusBarCommand } from './_commands/hide-env-on-status-bar.command';
import { ShowEnvOnStatusBarCommand } from './_commands/show-env-on-status-bar.command';
import { WikiView } from './_views/wiki.view';

export function activate(context: vscode.ExtensionContext) {
    // register views.
    const cfgService = new ConfigurationService();
    cfgService.setContextValue(ConfigurationService.sandboxDirSpecifiedCtx, false);
    const sandboxesDir: string | undefined = cfgService.getConfiguration(
        ConfigurationService.sanboxesDirCfg, undefined);
    if (sandboxesDir) {
        if (!fs.existsSync(sandboxesDir)){
            fs.mkdirSync(sandboxesDir, { recursive: true });
        }
        cfgService.setContextValue(ConfigurationService.sandboxDirSpecifiedCtx, true);
    }
    container.register("ctx", { useValue: context });
    container.register("sandboxDir", { useValue: sandboxesDir || '' });
    container.resolve(SandboxView);
    container.resolve(ToyView);
    container.resolve(EnvironmentView);
    container.resolve(WikiView);
    StatusBarView.injectCtx(context);
    StatusBarView.refresh();
    StatusBarView.hide();
    
    // register commands.
    CommandService.registerCommand(
        context, CommandService.playCmd, new PlayCommand());
    CommandService.registerCommand(
        context, CommandService.changeSandboxDirCmd, new ChangeSandboxDirectoryCommand());
    CommandService.registerCommand(
        context, CommandService.sandboxOpenItemCmd, new SandboxOpenItemCommand());
    CommandService.registerCommand(
        context, CommandService.refreshSandboxDirCmd, new RefreshSanboxDirCommand());
    CommandService.registerCommand(
        context, CommandService.newSandboxCmd, new NewSandboxCommand());
    CommandService.registerCommand(
        context, CommandService.sandboxDeleteItemCmd, new SandboxDeleteItemCommand());
    CommandService.registerCommand(
        context, CommandService.playToyCmd, new PlayToyCommand());
    CommandService.registerCommand(
        context, CommandService.newToyCmd, new NewToyCommand());
    CommandService.registerCommand(
        context, CommandService.deleteToyCmd, new DeleteToyCommand());
    CommandService.registerCommand(
        context, CommandService.editToyCmd, new EditToyCommand());
    CommandService.registerCommand(
        context, CommandService.newEnvCmd, new NewEnvCommand());
    CommandService.registerCommand(
        context, CommandService.editEnvCmd, new EditEnvCommand());
    CommandService.registerCommand(
        context, CommandService.deleteEnvCmd, new DeleteEnvCommand());
    CommandService.registerCommand(
        context, CommandService.runCmd, new RunCommand());
    CommandService.registerCommand(
        context, CommandService.hideOnStatusBarEnvCmd, new HideEnvOnStatusBarCommand());
    CommandService.registerCommand(
        context, CommandService.showOnStatusBarEnvCmd, new ShowEnvOnStatusBarCommand());

    // set global listeners.
    const statusBarVisibilityListener = (doc: vscode.TextDocument) => {
        if (doc.languageId !== golangLanguageId) {
            StatusBarView.hide();
            return;
        }

        StatusBarView.show();
    };
    vscode.workspace.onDidOpenTextDocument(statusBarVisibilityListener);
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (!e) {
            return;
        }
        return statusBarVisibilityListener(e.document);
    });
}

export function deactivate() {}
