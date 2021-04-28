import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { ConfigurationService } from '../_services/configuration.service';
import { EnvDefinition } from '../types';
import { EnvironmentView } from '../_views/environment.view';
import { EnvNode } from '../_providers/env-data.provider';
import { EditEnvView } from '../_views/edit-env.view';

@autoInjectable()
export class EditEnvCommand implements CommandHandler {
    constructor(
        private _envView?: EnvironmentView,
        private _cfgService?: ConfigurationService,
    ) {}

    async execute(envNode?: EnvNode) {
        if (!envNode || !envNode.nodeId) {
            return;
        }

        const editView = new EditEnvView();
        editView.show({
            name: envNode.name,
            description: envNode.description,
            cloudURL: envNode.cloudURL,
            command: envNode.cmd,
        });

        editView.onSave((name?: string, command?: string, description?: string, cloudURL?: string) => {
            editView.close();

            if (!name) {
                return;
            }

            const envsCfg: EnvDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.envsCfg, []);
            envsCfg[envNode.nodeId! - 1] = {
                name: name,
                cloudURL: cloudURL,
                command: command,
                description: description,
            };

            this._cfgService?.setConfiguration(ConfigurationService.envsCfg, envsCfg);
            this._envView?.refresh();
        });
    }
}
