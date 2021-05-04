import { autoInjectable } from 'tsyringe';
import { CommandHandler, CommandService } from '../_services/command.service';
import { ToyView } from '../_views/toy.view';
import { EditToyView } from '../_views/edit-toy.view';
import { ConfigurationService } from '../_services/configuration.service';
import { ToyDefinition } from '../types';

@autoInjectable()
export class NewToyCommand implements CommandHandler {
    constructor(
        private _toyView?: ToyView,
        private _cfgService?: ConfigurationService,
    ) {}

    async execute() {
        const editView = new EditToyView();
        editView.show();

        editView.onSave((name?: string, template?: string) => {
            editView.close();

            if (!(name && template)) {
                return;
            }

            const toysCfg: ToyDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.toysCfg, []);
            toysCfg.push({
                name: name,
                template: template,
            });
            this._cfgService?.setConfiguration(ConfigurationService.toysCfg, toysCfg);

            this._toyView?.refresh();
        });
    }
}
