const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');
import {
    PlaygroundCompileResponse,
    PlaygroundFmtResponse,
    Playground,
    stdoutKind,
    ExecCallback,
    sanboxFileExtension
} from './types';

export class LocalPlaygroundService implements Playground {
    constructor() {}

    async compile(fPath: string, callback?: ExecCallback) : Promise<PlaygroundCompileResponse | void> {
        const isTest: boolean = fPath.endsWith(`_test${sanboxFileExtension}`);
        const commands: string[] = isTest ? ['test', '-v'] : ['run'];
        commands.push(fPath);

        let resp: PlaygroundCompileResponse = {
            Status: 0,
            Events: [],
            IsTest: isTest,
            TestsFailed: 0,
            Errors: ''
        };

        try {
            const { stdout, stderr } = spawn('go', commands);

            for await (const data of stdout) {
                if (!data) {
                    continue;
                }

                const log: string = data.toString();
                callback?.stdout(log);
                resp.Events?.push({
                    Kind: stdoutKind,
                    Message: log,
                });

                if (isTest) {
                    resp.TestsFailed! += (log.match(/--- FAIL:/g) || []).length;
                }
            }

            for await (const err of stderr) {
                if (!err) {
                    continue;
                }

                resp.Errors = resp.Errors!.concat(err.toString());
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
