# LiteScript global environment declarations

node.js gobals compatible 
-------------------------

## global itself

    declare global var global:array

## global functions

    function require

## global namespaces / singletons

### public namespace process

        properties
            argv: array of string

        method cwd returns string //current working directory

        method exit(exitCode:number)


### public class Buffer

API compatible with nodejs Buffers

        properties  
            length

        method copy(dest:Buffer)

        method write(text:string, offset)
        
    append to namespace Buffer

        method byteLength(s:string)


### append to class Error

        properties
            code


