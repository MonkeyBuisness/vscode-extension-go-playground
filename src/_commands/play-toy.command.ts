import { autoInjectable } from 'tsyringe';
import { CommandHandler, CommandService } from '../_services/command.service';
import { SandboxView } from '../_views/sanbox.view';
import { ToyNode } from '../_providers/toy-data.provider';

@autoInjectable()
export class PlayToyCommand implements CommandHandler {

    constructor(private _sandboxView?: SandboxView) {}

    async execute(node?: ToyNode) {
        if (!node) {
            return;
        }

        const sandbox = await this._sandboxView?.createNewSandbox(node.template);
        if (!sandbox) {
            return;
        }

        CommandService.executeCommand(CommandService.playCmd, sandbox.filePath);
    }
}
