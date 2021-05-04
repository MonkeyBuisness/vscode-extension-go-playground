import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { SandboxView } from '../_views/sanbox.view';

@autoInjectable()
export class RefreshSanboxDirCommand implements CommandHandler {

    constructor(private _sanboxView?: SandboxView) {}

    async execute() {
        this._sanboxView?.refresh();
    }
}
