const { URLSearchParams } = require('url');
import fetch, { RequestInit } from "node-fetch";
import FormData = require('form-data');
import { GoPlaygroundCompileResponse, GoPlaygroundFmtResponse } from './types';

export class GoPlaygroundService {
    static async compile(baseURL: string, body?: string) : Promise<GoPlaygroundCompileResponse> {
        let response = await fetch(`${baseURL}/compile`, GoPlaygroundService._pepareCompileBody(body));
        return (await response).json();
    }

    static async format(baseURL: string, body?: string) : Promise<GoPlaygroundFmtResponse> {
        let response = fetch(`${baseURL}/fmt`, GoPlaygroundService._pepareFmtBody(body));
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