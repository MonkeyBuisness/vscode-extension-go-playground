import * as path from 'path';

export interface ResourceIcon {
    dark: string,
    light: string,
}

export class ResourceService {

    static iconPath(name: string) : ResourceIcon {
        return {
            light: path.join(__filename, '..', '..', '..', 'resources', 'light', name),
            dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', name),
        };
    }
}
