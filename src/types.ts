import * as vscode from 'vscode';
import { SandboxView } from './sandboxView';
import { ToyView } from './toyView';

export const sanboxFileExtension: string = ".go";
export const toyFileExtension: string = ".gotoy";
export const extName: string = 'go-playground';

export interface ToyDefinition {
    name: string;
    template?: string;
};

export interface PlaygroundCompileResponse {
    errors?: string;
    events?: PlaygroundEvent[];
    isTest?: boolean;
    status?: number;
    testsFailed?: number;
    vetOK?: boolean;
}

export interface PlaygroundEvent {
    delay?: number;
    kind?: string;
    message?: string;
}

export interface PlaygroundFmtResponse {
    body?: string;
    error?: string;
}

export interface Playground {
    compile(baseURL: string, body?: string) : Promise<PlaygroundCompileResponse>
    format(body?: string) : Promise<PlaygroundFmtResponse>
}

export interface ExtCfg {
    runOutChan: vscode.OutputChannel;
    sandboxView: SandboxView;
    toysView: ToyView;
    cloudPlayground?: Playground;
    localPlayground?: Playground;
    statusBar: {
        runLocalItem?: vscode.StatusBarItem;
        runRemoteItem?: vscode.StatusBarItem;
        formatLocalItem?: vscode.StatusBarItem;
        formatRemoteItem?: vscode.StatusBarItem;
        shareItem?: vscode.StatusBarItem;
    },
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
