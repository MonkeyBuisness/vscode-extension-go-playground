import { autoInjectable } from 'tsyringe';
import { CommandHandler, CommandService } from '../_services/command.service';
import { SandboxView } from '../_views/sanbox.view';

@autoInjectable()
export class NewSandboxCommand implements CommandHandler {

    constructor(private _sandboxView?: SandboxView) {}

    async execute() {
        let node = await this._sandboxView?.createNewSandbox();
        if (node) {
            CommandService.executeCommand(CommandService.playCmd, node.filePath);
        }
    }
}
