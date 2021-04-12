const { URLSearchParams } = require('url');
import fetch, { RequestInit } from "node-fetch";
import {
    PlaygroundCompileResponse,
    PlaygroundFmtResponse,
    Playground
} from './types';

export class GoPlaygroundService implements Playground {
    constructor(private _baseURL: string) {}

    async compile(body?: string) : Promise<PlaygroundCompileResponse> {
        let response = await fetch(`${this._baseURL}/compile`, GoPlaygroundService._pepareCompileBody(body));
        return (await response).json();
    }

    async format(body?: string) : Promise<PlaygroundFmtResponse> {
        let response = fetch(`${this._baseURL}/fmt`, GoPlaygroundService._pepareFmtBody(body));
        return (await response).json();
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
}