import { autoInjectable } from 'tsyringe';
import { CommandHandler } from '../_services/command.service';
import { PlaygroundService } from '../_services/playground.service';

@autoInjectable()
export class RunCommand implements CommandHandler {

    constructor(private _playgroundService?: PlaygroundService) {}

    async execute(args: string[]) {
        const cloudURL = args[0];
        const command = args[1];
    }
}
