
fs as supported in LiteC-core

    export only namespace fs

        method existsSync(filename:string) returns boolean

        method readFileSync(filename) returns string
        method writeFileSync(filename, contents) 

        method statSync(filename:string) returns Stat
        method unlinkSync(filename:string)
        method mkdirSync(path:string, mode)

        method openSync(filename:string, mode:string)
        method writeSync(fd, buf)
        method closeSync(fd)

        class Stat 
            properties
                size : number
                mtime : Date
                mode: number

            method isDirectory returns boolean
            method isFile returns boolean
