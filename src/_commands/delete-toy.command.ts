import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { ToyView } from '../_views/toy.view';
import { ConfigurationService } from '../_services/configuration.service';
import { ToyDefinition } from '../types';
import { ToyNode } from '../_providers/toy-data.provider';

@autoInjectable()
export class DeleteToyCommand implements CommandHandler {
    constructor(
        private _toyView?: ToyView,
        private _cfgService?: ConfigurationService,
    ) {}

    async execute(toyNode?: ToyNode) {
        if (!toyNode || !toyNode.nodeId) {
            return;
        }

        const toysCfg: ToyDefinition[] = this._cfgService?.getConfiguration(ConfigurationService.toysCfg, []);
        toysCfg.splice(toyNode.nodeId - 1, 1);
        this._cfgService?.setConfiguration(ConfigurationService.toysCfg, toysCfg);

        this._toyView?.refresh();
    }
}
