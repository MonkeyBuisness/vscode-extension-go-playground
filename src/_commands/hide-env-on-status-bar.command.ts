import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { ConfigurationService } from '../_services/configuration.service';
import { EnvDefinition } from '../types';
import { EnvironmentView } from '../_views/environment.view';
import { EnvNode } from '../_providers/env-data.provider';
import { StatusBarView } from '../_views/status-bar.view';

@autoInjectable()
export class HideEnvOnStatusBarCommand implements CommandHandler {
    constructor(
        private _envView?: EnvironmentView,
        private _cfgService?: ConfigurationService,
    ) {}

    async execute(envNode?: EnvNode) {
        if (!envNode || !envNode.nodeId) {
            return;
        }

        const envsCfg: EnvDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.envsCfg, []);
        envsCfg[envNode.nodeId - 1].showOnStatusBar = false;
        await this._cfgService?.setConfiguration(ConfigurationService.envsCfg, envsCfg);

        this._envView?.refresh();
        StatusBarView.refresh();
    }
}
