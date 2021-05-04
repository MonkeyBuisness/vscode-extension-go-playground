import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { ConfigurationService } from '../_services/configuration.service';
import { EnvDefinition } from '../types';
import { EnvironmentView } from '../_views/environment.view';
import { EditEnvView } from '../_views/edit-env.view';

@autoInjectable()
export class NewEnvCommand implements CommandHandler {
    constructor(
        private _envView?: EnvironmentView,
        private _cfgService?: ConfigurationService,
    ) {}

    async execute() {
        const editView = new EditEnvView();
        editView.show();

        editView.onSave((name?: string, command?: string, description?: string, cloudURL?: string, showOnStatusBar?: boolean) => {
            editView.close();

            if (!name) {
                return;
            }

            const envsCfg: EnvDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.envsCfg, []);
            envsCfg.push({
                name: name,
                cloudURL: cloudURL,
                command: command,
                description: description,
                showOnStatusBar: showOnStatusBar || false,
            });
            this._cfgService?.setConfiguration(ConfigurationService.envsCfg, envsCfg);

            this._envView?.refresh();
        });
    }
}
