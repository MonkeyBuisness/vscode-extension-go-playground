const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');
import {
    PlaygroundCompileResponse,
    PlaygroundFmtResponse,
    Playground,
    stdoutKind,
    ExecCallback
} from './types';

export class LocalPlaygroundService implements Playground {
    constructor() {}

    async compile(fPath: string, callback?: ExecCallback) : Promise<PlaygroundCompileResponse | void> {
        let resp: PlaygroundCompileResponse = {
            Status: 0,
            Events: []
        };

        try {
            const cmd = spawn('go', ['run', fPath]);

            for await (const data of cmd.stdout) {
                if (!data) {
                    continue;
                }

                const log: string = data.toString();
                callback?.stdout(log);
                resp.Events?.push({
                    Kind: stdoutKind,
                    Message: log,
                });
            }
        } catch (e) {
            resp.Errors = e.message;
            resp.Status = e.code;
        }

        return resp;
    }

    async format(fPath: string) : Promise<PlaygroundFmtResponse | void> {
        await exec(`go fmt ${fPath}`);
       
        return;
    }

    async share(fPath: string) : Promise<string | void> {
        return "";
    }
}
