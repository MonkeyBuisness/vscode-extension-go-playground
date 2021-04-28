import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { ToyView } from '../_views/toy.view';
import { EditToyView } from '../_views/edit-toy.view';

@autoInjectable()
export class NewToyCommand implements CommandHandler {
    constructor(private _toyView?: ToyView) {}

    async execute() {
        const editView = new EditToyView();
        editView.show({
            name: 'hello',
            template: 'world',
        });

        editView.onSave((name?: string, template?: string) => {
            editView.close();

            this._toyView?.refresh();
        });
    }
}
