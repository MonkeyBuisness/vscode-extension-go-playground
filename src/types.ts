export const sanboxFileExtension: string = ".sandbox";
export const toyFileExtension: string = ".gotoy";
export const sanboxFileVersion = '1';

export interface SandoxFileData {
    version?: string | number;
    code?: string;
};

export interface ToyDefinition {
    name: string;
    template?: string;
};

export interface GoPlaygroundCompileResponse {
    errors?: string;
    events?: GoPlaygroundEvent[];
    isTest?: boolean;
    status?: number;
    testsFailed?: number;
    vetOK?: boolean;
}

export interface GoPlaygroundEvent {
    delay?: number;
    kind?: string;
    message?: string;
}

export interface GoPlaygroundFmtResponse {
    body?: string;
    error?: string;
}

export const presetToyDefinitions: ToyDefinition[] = [
    {
        name: 'Hello, playground!',
        template: `package main

import (
    "fmt"
)
        
func main() {
    fmt.Println("Hello, playground")
}

`
    }
];
