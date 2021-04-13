const util = require('util');
const exec = util.promisify(require('child_process').exec);
import {
    PlaygroundCompileResponse,
    PlaygroundFmtResponse,
    Playground,
    stdoutKind,
    PlaygroundEvent
} from './types';

export class LocalPlaygroundService implements Playground {
    constructor() {}

    async compile(fPath: string) : Promise<PlaygroundCompileResponse | void> {
        let resp: PlaygroundCompileResponse = {
            Status: 0
        };

        try {
            let { stdout } = await exec(`go run ${fPath}`);
            resp.Events = [{
                Kind: stdoutKind,
                Message: stdout,
            }];
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