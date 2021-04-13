import * as vscode from 'vscode';
import { SandboxView } from './sandboxView';
import { StatusBar } from './statusBar';
import { ToyView } from './toyView';

export const sanboxFileExtension: string = '.go';
export const toyFileExtension: string = '.gotoy';
export const extName: string = 'go-playground';
export const golangLanguageId: string = 'go';
export const stdoutKind: string = 'stdout';

export interface ToyDefinition {
    name: string;
    template?: string;
};

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

export interface Playground {
    compile(fPath: string) : Promise<PlaygroundCompileResponse | void>
    format(fPath: string) : Promise<PlaygroundFmtResponse | void>
    share(fPath: string) : Promise<string | void>
}

export interface ExtCfg {
    runOutChan: vscode.OutputChannel;
    sandboxView: SandboxView;
    toysView: ToyView;
    cloudPlayground?: Playground;
    localPlayground?: Playground;
    statusBar?: StatusBar;
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
    },
    {
        name: 'Tests',
        template: `package main

import (
    "testing"
)
        
// LastIndex returns the index of the last instance of x in list, or
// -1 if x is not present. The loop condition has a fault that
// causes somes tests to fail. Change it to i >= 0 to see them pass.
func LastIndex(list []int, x int) int {
    for i := len(list) - 1; i > 0; i-- {
        if list[i] == x {
            return i
        }
    }
    return -1
}
        
func TestLastIndex(t *testing.T) {
    tests := []struct {
        list []int
        x    int
        want int
    }{
        {list: []int{1}, x: 1, want: 0},
        {list: []int{1, 1}, x: 1, want: 1},
        {list: []int{2, 1}, x: 2, want: 0},
        {list: []int{1, 2, 1, 1}, x: 2, want: 1},
        {list: []int{1, 1, 1, 2, 2, 1}, x: 3, want: -1},
        {list: []int{3, 1, 2, 2, 1, 1}, x: 3, want: 0},
    }
    for _, tt := range tests {
        if got := LastIndex(tt.list, tt.x); got != tt.want {
            t.Errorf("LastIndex(%v, %v) = %v, want %v", tt.list, tt.x, got, tt.want)
        }
    }
}

`
    }
];
