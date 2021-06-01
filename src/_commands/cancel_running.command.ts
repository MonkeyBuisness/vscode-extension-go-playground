import { autoInjectable } from 'tsyringe';
import { CommandHandler, CommandService } from '../_services/command.service';
import { PlaygroundService } from '../_services/playground.service';

@autoInjectable()
export class CancelRunningCommand implements CommandHandler {

    constructor(private _playgroundService?: PlaygroundService) {}

    async execute() {
       this._playgroundService?.abortExecution();
    }
}
