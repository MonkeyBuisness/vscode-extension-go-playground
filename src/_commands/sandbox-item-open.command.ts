import { SandboxNode } from '../_providers/sanbox-data.provider';
import { CommandHandler, CommandService } from '../_services/command.service';

export class SandboxOpenItemCommand implements CommandHandler {

    async execute(file?: string | SandboxNode) {
        if (!file) {
            return;
        }

        if (file instanceof SandboxNode) {
            file = file.filePath;
        }

        CommandService.executeCommand(CommandService.playCmd, file);
    }
}
