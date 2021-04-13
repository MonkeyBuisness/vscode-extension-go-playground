const { URLSearchParams } = require('url');
import fetch, { RequestInit } from "node-fetch";
import * as fs from 'fs';
import {
    PlaygroundCompileResponse,
    PlaygroundFmtResponse,
    Playground
} from './types';

export class GoPlaygroundService implements Playground {
    constructor(private _baseURL: string) {}

    async compile(fPath: string) : Promise<PlaygroundCompileResponse | void> {
        const body: string = fs.readFileSync(fPath).toString();
        let response = await fetch(`${this._baseURL}/compile`, GoPlaygroundService._pepareCompileBody(body));
        return (await response).json();
    }

    async format(fPath: string) : Promise<PlaygroundFmtResponse | void> {
        const body: string = fs.readFileSync(fPath).toString();
        let response = fetch(`${this._baseURL}/fmt`, GoPlaygroundService._pepareFmtBody(body));
        return (await response).json();
    }

    async share(fPath: string) : Promise<string | void> {
        const body: string = fs.readFileSync(fPath).toString();
        let response = fetch(`${this._baseURL}/share`, GoPlaygroundService._pepareShareBody(body));
        let shareId = await (await response).text();
        return `${this._baseURL}/p/${shareId}`;
    }

    private static _pepareCompileBody(body?: string) : RequestInit {
        const encodedParams = new URLSearchParams();
        encodedParams.set('version', '2');
        encodedParams.set('body', body);
        encodedParams.set('withVet', 'true');

        return {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            body: encodedParams
        };
    }

    private static _pepareFmtBody(body?: string) : RequestInit {
        const encodedParams = new URLSearchParams();
        encodedParams.set('body', body);

        return {
            method: 'POST',
            body: encodedParams
        };
    }

    private static _pepareShareBody(body?: string) : RequestInit {
        return {
            method: 'POST',
            body: body
        };
    }
}
