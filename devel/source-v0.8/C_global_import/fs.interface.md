
    export default namespace fs

        method existsSync(filename:string)
        method readFileSync(filename) returns string
        method writeFileSync(filename) 
        method statSync(filename:string)
        method unlinkSync(filename:string)
        method mkdirSync(path:string, mode)

        class Stat 
            properties
                size : number
                mtime : Date
                mode: number

            method isDirectory returns boolean
            method isFile returns boolean
