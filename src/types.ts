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

export interface WikiDefinition {
    name: string;
    link?: string;
    description?: string;
    nodes?: WikiDefinition[];
};

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
        cloudURL: 'https://play.golang.org/compile',
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
        name: 'Format (remote)',
        description: 'Format GO On https://play.golang.org',
        cloudURL: 'https://play.golang.org/fmt',
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
        cloudURL: 'https://play.golang.org/share',
        description: 'Share GO Code',
        showOnStatusBar: true
    },
];

export const presetWiki: WikiDefinition[] = [
    {
        name: 'golang.org',
        description: 'The Go programming language is an open source project to make programmers more productive',
        nodes: [
            {
                name: 'Getting started',
                nodes: [
                    {
                        name: 'Installing Go',
                        description: 'Download and install Go quickly with the steps described here',
                        link: 'https://golang.org/doc/install',
                    },
                    {
                        name: 'Tutorial',
                        nodes: [
                            {
                                name: 'Getting started',
                                description: 'A brief Hello, World tutorial to get started. Learn a bit about Go code, tools, packages, and modules',
                                link: 'https://golang.org/doc/tutorial/getting-started',
                            },
                            {
                                name: 'Create a module',
                                description: 'A tutorial of short topics introducing functions, error handling, arrays, maps, unit testing, and compiling',
                                link: 'https://golang.org/doc/tutorial/create-module',
                            },
                        ],
                    },
                    {
                        name: 'Writing Web Applications',
                        description: 'Building a simple web application',
                        link: 'https://golang.org/doc/articles/wiki/',
                    },
                    {
                        name: 'How to write Go code',
                        description: 'This doc explains how to develop a simple set of Go packages inside a module, and it shows how to use the go command to build and test packages',
                        link: 'https://golang.org/doc/code',
                    },
                ],
            },
            {
                name: 'Using and understanding Go',
                nodes: [
                    {
                        name: 'Effective Go',
                        description: 'A document that gives tips for writing clear, idiomatic Go code. A must read for any new Go programmer. It augments the tour and the language specification, both of which should be read first',
                        link: 'https://golang.org/doc/effective_go',
                    },
                    {
                        name: 'Editor plugins and IDEs',
                        description: 'A document that summarizes commonly used editor plugins and IDEs with Go support',
                        link: 'https://golang.org/doc/editors',
                    },
                    {
                        name: 'Diagnostics',
                        description: 'Summarizes tools and methodologies to diagnose problems in Go programs',
                        link: 'https://golang.org/doc/diagnostics',
                    },
                    {
                        name: 'Managing dependencies',
                        description: 'When your code uses external packages, those packages (distributed as modules) become dependencies',
                        link: 'https://golang.org/doc/modules/managing-dependencies',
                    },
                    {
                        name: 'Developing modules',
                        nodes: [
                            {
                                name: 'Developing and publishing modules',
                                description: 'You can collect related packages into modules, then publish the modules for other developers to use. This topic gives an overview of developing and publishing modules',
                                link: 'https://golang.org/doc/modules/developing',
                            },
                            {
                                name: 'Module release and versioning workflow',
                                description: 'When you develop modules for use by other developers, you can follow a workflow that helps ensure a reliable, consistent experience for developers using the module. This topic describes the high-level steps in that workflow',
                                link: 'https://golang.org/doc/modules/release-workflow',
                            },
                            {
                                name: 'Managing module source',
                                description: 'When you`re developing modules to publish for others to use, you can help ensure that your modules are easier for other developers to use by following the repository conventions described in this topic',
                                link: 'https://golang.org/doc/modules/managing-source',
                            },
                            {
                                name: 'Developing a major version update',
                                description: 'A major version update can be very disruptive to your module`s users because it includes breaking changes and represents a new module. Learn more in this topic',
                                link: 'https://golang.org/doc/modules/major-version',
                            },
                            {
                                name: 'Publishing a module',
                                description: 'When you want to make a module available for other developers, you publish it so that it`s visible to Go tools. Once you`ve published the module, developers importing its packages will be able to resolve a dependency on the module by running commands such as go get',
                                link: 'https://golang.org/doc/modules/publishing',
                            },
                            {
                                name: 'Module version numbering',
                                description: 'A module`s developer uses each part of a module`s version number to signal the version’s stability and backward compatibility. For each new release, a module`s release version number specifically reflects the nature of the module`s changes since the preceding release',
                                link: 'https://golang.org/doc/modules/version-numbers',
                            },
                            {
                                name: 'Frequently Asked Questions (FAQ)',
                                description: 'Answers to common questions about Go',
                                link: 'https://golang.org/doc/faq',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'References',
                nodes: [
                    {
                        name: 'Package Documentation',
                        description: 'The documentation for the Go standard library',
                        link: 'https://golang.org/pkg/',
                    },
                    {
                        name: 'Command Documentation',
                        description: 'The documentation for the Go tools',
                        link: 'https://golang.org/doc/cmd',
                    },
                    {
                        name: 'Language Specification',
                        description: 'The official Go Language specification',
                        link: 'https://golang.org/ref/spec',
                    },
                    {
                        name: 'Go Modules Reference',
                        description: 'A detailed reference manual for Go`s dependency management system',
                        link: 'https://golang.org/ref/mod',
                    },
                    {
                        name: 'go.mod file reference',
                        description: 'Reference for the directives included in a go.mod file',
                        link: 'https://golang.org/doc/modules/gomod-ref',
                    },
                    {
                        name: 'The Go Memory Model',
                        description: 'A document that specifies the conditions under which reads of a variable in one goroutine can be guaranteed to observe values produced by writes to the same variable in a different goroutine',
                        link: 'https://golang.org/ref/mem',
                    },
                    {
                        name: 'Release History',
                        description: 'A summary of the changes between Go releases',
                        link: 'https://golang.org/doc/devel/release.html',
                    },
                ]
            },
            {
                name: 'From the Go Blog',
                description: 'The official blog of the Go project, featuring news and in-depth articles by the Go team and guests',
                link: 'https://blog.golang.org/',
            },
            {
                name: 'Wiki',
                description: 'The Go Wiki, maintained by the Go community, includes articles about the Go language, tools, and other resources',
                link: 'https://github.com/golang/go/wiki',
            },
            {
                name: 'Talks',
                nodes: [
                    {
                        name: 'A Video Tour of Go',
                        description: 'Three things that make Go fast, fun, and productive: interfaces, reflection, and concurrency. Builds a toy web crawler to demonstrate these',
                        link: 'https://research.swtch.com/gotour',
                    },
                    {
                        name: 'Code that grows with grace',
                        description: 'One of Go`s key design goals is code adaptability; that it should be easy to take a simple design and build upon it in a clean and natural way. In this talk Andrew Gerrand describes a simple "chat roulette" server that matches pairs of incoming TCP connections, and then use Go`s concurrency mechanisms, interfaces, and standard library to extend it with a web interface and other features. While the function of the program changes dramatically, Go`s flexibility preserves the original design as it grows',
                        link: 'https://vimeo.com/53221560',
                    },
                    {
                        name: 'More',
                        description: 'See the Go Talks site and wiki page for more Go talks',
                        link: 'https://github.com/golang/go/wiki/GoTalks',
                    },
                ],
            },
            {
                name: 'Non-English Documentation',
                description: 'See the NonEnglish page at the Wiki for localized documentation',
                link: 'https://github.com/golang/go/wiki/NonEnglish',
            },
        ],
    },
];
