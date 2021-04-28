import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { ConfigurationService } from '../_services/configuration.service';
import { EnvDefinition } from '../types';
import { EnvironmentView } from '../_views/environment.view';
import { EnvNode } from '../_providers/env-data.provider';

@autoInjectable()
export class DeleteEnvCommand implements CommandHandler {
    constructor(
        private _envView?: EnvironmentView,
        private _cfgService?: ConfigurationService,
    ) {}

    async execute(envNode?: EnvNode) {
        if (!envNode || !envNode.nodeId) {
            return;
        }

        const envsCfg: EnvDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.envsCfg, []);
        envsCfg.splice(envNode.nodeId - 1, 1);
        this._cfgService?.setConfiguration(ConfigurationService.envsCfg, envsCfg);

        this._envView?.refresh();
    }
}
