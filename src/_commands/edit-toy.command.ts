import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { ToyView } from '../_views/toy.view';
import { ConfigurationService } from '../_services/configuration.service';
import { ToyDefinition } from '../types';
import { ToyNode } from '../_providers/toy-data.provider';
import { EditToyView } from '../_views/edit-toy.view';

@autoInjectable()
export class EditToyCommand implements CommandHandler {
    constructor(
        private _toyView?: ToyView,
        private _cfgService?: ConfigurationService,
    ) {}

    async execute(toyNode?: ToyNode) {
        if (!toyNode || !toyNode.nodeId) {
            return;
        }

        const editView = new EditToyView();
        editView.show({
            name: toyNode.label,
            template: toyNode.template,
        });

        editView.onSave((name?: string, template?: string) => {
            editView.close();

            if (!(name && template)) {
                return;
            }

            const toysCfg: ToyDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.toysCfg, []);
            toysCfg[toyNode.nodeId! - 1] = {
                name: name,
                template: template,
            };

            this._cfgService?.setConfiguration(ConfigurationService.toysCfg, toysCfg);
            this._toyView?.refresh();
        });
    }
}
