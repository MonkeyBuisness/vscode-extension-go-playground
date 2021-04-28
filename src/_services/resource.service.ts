import * as path from 'path';
import * as fs from 'fs';

export interface ResourceIcon {
    dark: string,
    light: string,
}

export class ResourceService {

    static iconPath(name: string) : ResourceIcon {
        return {
            light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', name),
            dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', name),
        };
    }

    static mediaContent(name: string) : string {
        const fPath = path.join(__filename, '..', '..', '..', 'resources', 'media', name);

        return fs.readFileSync(fPath).toString();
    }
}
