import * as vscode from 'vscode';
import { singleton } from "tsyringe";

interface OutputChannel {
    name: string;
    chan: vscode.OutputChannel;
}

@singleton()
export class IOService {
    private _outChannels: OutputChannel[] = [];

    resolveOutputChannel(name: string) : vscode.OutputChannel {
        let chan = this._outChannels.find(c => c.name === name);
        if (chan) {
            return chan.chan;
        }

        const vsOutChan = vscode.window.createOutputChannel(name);
        chan = {
            chan: vsOutChan,
            name: name,
        };
        this._outChannels.push(chan);

        return chan.chan;
    }
}
