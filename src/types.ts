import * as vscode from 'vscode';
import { StatusBar } from './statusBar';

export const sanboxFileExtension: string = '.go';
export const toyFileExtension: string = '.gotoy';
export const extName: string = 'go-playground';
export const golangLanguageId: string = 'go';
export const stdoutKind: string = 'stdout';

export interface ToyDefinition {
    name: string;
    template?: string;
};

export interface EnvDefinition {
    name: string;
    command?: string;
    description?: string;
    cloudURL?: string;
    showOnStatusBar: boolean;
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

export interface ExecCallback {
    stdout(data?: string) : void
}

export interface Playground {
    compile(fPath: string, callback?: ExecCallback) : Promise<PlaygroundCompileResponse | void>
    format(fPath: string) : Promise<PlaygroundFmtResponse | void>
    share(fPath: string) : Promise<string | void>
}

export interface ExtCfg {
    runOutChan: vscode.OutputChannel;
    //sandboxView: SandboxView;
    //toysView: ToyView;
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
        name: 'Tests (Remote only)',
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
    },
    {
        name: 'Multiple files (Remote only)',
        template: `package main

import (
    "play.ground/foo"
)
        
func main() {
    foo.Bar()
}
        
-- go.mod --
module play.ground
        
-- foo/foo.go --
package foo
        
import "fmt"
        
func Bar() {
    fmt.Println("This function lives in an another file!")
}

`
    },
    {
        name: 'Display image',
        template: `package main

import (
    "bytes"
    "encoding/base64"
    "fmt"
    "image"
    "image/png"
)
        
var favicon = []byte{
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00,
    0x10, 0x00, 0x00, 0x00, 0x0f, 0x04, 0x03, 0x00, 0x00, 0x00, 0x1f, 0x5d, 0x52, 0x1c, 0x00, 0x00, 0x00, 0x0f, 0x50,
    0x4c, 0x54, 0x45, 0x7a, 0xdf, 0xfd, 0xfd, 0xff, 0xfc, 0x39, 0x4d, 0x52, 0x19, 0x16, 0x15, 0xc3, 0x8d, 0x76, 0xc7,
    0x36, 0x2c, 0xf5, 0x00, 0x00, 0x00, 0x40, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x95, 0xc9, 0xd1, 0x0d, 0xc0, 0x20,
    0x0c, 0x03, 0xd1, 0x23, 0x5d, 0xa0, 0x49, 0x17, 0x20, 0x4c, 0xc0, 0x10, 0xec, 0x3f, 0x53, 0x8d, 0xc2, 0x02, 0x9c,
    0xfc, 0xf1, 0x24, 0xe3, 0x31, 0x54, 0x3a, 0xd1, 0x51, 0x96, 0x74, 0x1c, 0xcd, 0x18, 0xed, 0x9b, 0x9a, 0x11, 0x85,
    0x24, 0xea, 0xda, 0xe0, 0x99, 0x14, 0xd6, 0x3a, 0x68, 0x6f, 0x41, 0xdd, 0xe2, 0x07, 0xdb, 0xb5, 0x05, 0xca, 0xdb,
    0xb2, 0x9a, 0xdd, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
}
        
// displayImage renders an image to the playground's console by
// base64-encoding the encoded image and printing it to stdout
// with the prefix "IMAGE:".
func displayImage(m image.Image) {
    var buf bytes.Buffer
    err := png.Encode(&buf, m)
    if err != nil {
        panic(err)
    }
    fmt.Println("IMAGE:" + base64.StdEncoding.EncodeToString(buf.Bytes()))
}
        
func main() {
    m, err := png.Decode(bytes.NewReader(favicon))
    if err != nil {
        panic(err)
    }
    displayImage(m)
}

`
    },
    {
        name: 'Sleep',
        template: `package main

import (
    "fmt"
    "math/rand"
    "time"
)
        
func main() {
    for i := 0; i < 10; i++ {
        dur := time.Duration(rand.Intn(1000)) * time.Millisecond
        fmt.Print("Sleeping for ")
        fmt.Println(dur)
        // Sleep for a random duration between 0-1000ms
        time.Sleep(dur)
    }
    fmt.Println("Done!")
}        

`
    },
    {
        name: 'Clear (Remote only)',
        template: `package main

import (
    "fmt"
    "strings"
    "time"
)
        
func main() {
    const col = 30
    // Clear the screen by printing \x0c.
    bar := fmt.Sprintf("\x0c[%%-%vs]", col)
    for i := 0; i < col; i++ {
        fmt.Printf(bar, strings.Repeat("=", i)+">")
        time.Sleep(100 * time.Millisecond)
    }
    fmt.Printf(bar+" Done!", strings.Repeat("=", col))
}           

`
    }
];

export const presetEnvDefinitions: EnvDefinition[] = [
    {
        name: 'Remote Run',
        description: 'Launch GO On https://play.golang.org',
        cloudURL: 'https://play.golang.org',
        showOnStatusBar: true
    },
    {
        name: 'Local Run',
        command: 'go run ${{sandbox}}',
        description: 'Run GO Locally',
        showOnStatusBar: true
    },
    {
        name: 'Format (local)',
        command: 'go fmt ${{sandbox}}',
        description: 'GO Format Locally',
        showOnStatusBar: true
    },
    {
        name: 'Test (local)',
        command: 'go test -v ${{sandbox}}',
        description: 'Run GO Test Locally',
        showOnStatusBar: false
    },
    {
        name: 'Share',
        cloudURL: 'https://play.golang.org',
        command: '%share%',
        description: 'Share GO Code',
        showOnStatusBar: true
    },
];
