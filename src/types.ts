export interface SandoxFileData {
    version?: string | number;
    code?: string;
};

export interface ToyDefinition {
    name: string;
    template?: string;
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
    }
];
