const { URLSearchParams } = require('url');
import fetch, { RequestInit } from "node-fetch";
import {
    PlaygroundCompileResponse,
    PlaygroundFmtResponse,
    Playground
} from './types';

export class LocalPlaygroundService implements Playground {
    constructor() {}

    async compile(body?: string) : Promise<PlaygroundCompileResponse> {
        /*let response = await fetch(`${this._baseURL}/compile`, GoPlaygroundService._pepareCompileBody(body));
        return (await response).json();*/
        return {};
    }

    async format(body?: string) : Promise<PlaygroundFmtResponse> {
        /*let response = fetch(`${this._baseURL}/fmt`, GoPlaygroundService._pepareFmtBody(body));
        return (await response).json();*/
        return {};
    }

    async share(fPath: string) : Promise<string | void> {
        return "";
    }
}