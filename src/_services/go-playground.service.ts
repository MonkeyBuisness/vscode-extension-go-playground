/* eslint-disable @typescript-eslint/naming-convention */
const { URLSearchParams } = require('url');
import { singleton } from 'tsyringe';
import fetch, { RequestInit } from "node-fetch";

export interface PlaygroundCompileResponse {
    Errors?: string;
    Events?: PlaygroundEvent[];
    IsTest?: boolean;
    Status?: number;
    TestsFailed?: number;
    VetOK?: boolean;
}

export interface PlaygroundEvent {
    Delay?: number;
    Kind?: string;
    Message?: string;
}

export interface PlaygroundFmtResponse {
    Body?: string;
    Error?: string;
}

@singleton()
export class GoPlaygroundService {

    async compile(body: string, url: string) : Promise<PlaygroundCompileResponse> {
        const response = await fetch(url, GoPlaygroundService._pepareCompileBody(body));
        return await response.json();
    }

    async format(body: string, url: string) : Promise<PlaygroundFmtResponse> {
        const response = await fetch(url, GoPlaygroundService._pepareFmtBody(body));
        return await response.json();
    }

    async share(body: string, url: string) : Promise<string> {
        const response = fetch(url, GoPlaygroundService._pepareShareBody(body));
        const shareId = await (await response).text();
        const baseURL = url.substring(0, url.lastIndexOf('/'));
        return `${baseURL}/p/${shareId}`;
    }

    async exec(body: string, url: string) : Promise<any> {
        const response = await fetch(url, GoPlaygroundService._pepareCompileBody(body));
        return await response.text();
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
