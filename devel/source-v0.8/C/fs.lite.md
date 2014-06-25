//-------------------------------------------------------
// Environment support to run LiteScritp as C-compiled bin
//-------------------------------------------------------

##Helper "fs" namespace
Provides a replacement for node's require('fs')

    global declare fsc from 'fs_native'

    export default namespace fs

        method existsSync(filename:string)
            var result = fsc_stat(filename)
            if result isnt 0, fs.throwTextErr result

        method readFileSync(filename) returns string
            return fsc_readFile(filename)

        method writeFileSync(filename) 
            var result = fsc_writeFile(filename)
            if result isnt 0, fs.throwTextErr result

        class Stat 
            properties
                st_size : number
                st_mtime : Date

        helper method throwTextErr(result)
            var message
            switch result
                case 2:  message= 'ENOENT'
                case 13: message= 'EACCESS'
                case 20: message= 'ENOTDIR'
                case 21: message='EISDIR'
                default message='ERR#{result}' 
            fail with message
