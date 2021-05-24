import { autoInjectable } from 'tsyringe';
import { WikiNode } from '../_providers/wiki-data.provider';
import { CommandHandler } from '../_services/command.service';
import { WikiInfoView } from '../_views/wiki-info.view';

@autoInjectable()
export class OpenWikiURLCommand implements CommandHandler {

    constructor() {}

    async execute(wikiNode?: WikiNode) {
        if (!wikiNode || !wikiNode.link) {
            return;
        }

        const wikiInfoView = new WikiInfoView();
        wikiInfoView.show(wikiNode.link);
    }
}
