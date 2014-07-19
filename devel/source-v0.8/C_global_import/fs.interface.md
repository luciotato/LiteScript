
    export default namespace fs

        method existsSync(filename:string)

        method readFileSync(filename) returns string
        method writeFileSync(filename) 

        method statSync(filename:string)
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
