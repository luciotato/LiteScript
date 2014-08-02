# LiteScript global environment declarations

node.js gobals compatible 
-------------------------

## global itself

    declare global var global:array

## global functions

    function require

## global namespaces / singletons


### public class Buffer

        constructor new Buffer (subject, encoding) 

        properties
            offset:number
            length
            parent
        
        method asciiSlice() 
        method base64Slice() 
        method binarySlice() 
        method hexSlice() 
        method ucs2Slice() 
        method utf8Slice() 
        method asciiWrite() 
        method base64Write() 
        method binaryWrite() 
        method hexWrite() 
        method ucs2Write() 
        method utf8Write() 
        method readDoubleBE() 
        method readDoubleLE() 
        method readFloatBE() 
        method readFloatLE() 
        method writeDoubleBE() 
        method writeDoubleLE() 
        method writeFloatBE() 
        method writeFloatLE() 
        method toArrayBuffer() 
        method copy() 
        method fill() 
        method toString(encoding, startPos, endPos) 
        method inspect() 
        method get() 
        method set() 
        method write(string, offset, length, encoding) 
        method toJSON() 
        method slice(startPos, endPos) 
        method readUInt8(offset, noAssert) 
        method readUInt16LE(offset, noAssert) 
        method readUInt16BE(offset, noAssert) 
        method readUInt32LE(offset, noAssert) 
        method readUInt32BE(offset, noAssert) 
        method readInt8(offset, noAssert) 
        method readInt16LE(offset, noAssert) 
        method readInt16BE(offset, noAssert) 
        method readInt32LE(offset, noAssert) 
        method readInt32BE(offset, noAssert) 
        method writeUInt8(value, offset, noAssert) 
        method writeUInt16LE(value, offset, noAssert) 
        method writeUInt16BE(value, offset, noAssert) 
        method writeUInt32LE(value, offset, noAssert) 
        method writeUInt32BE(value, offset, noAssert) 
        method writeInt8(value, offset, noAssert) 
        method writeInt16LE(value, offset, noAssert) 
        method writeInt16BE(value, offset, noAssert) 
        method writeInt32LE(value, offset, noAssert) 
        method writeInt32BE(value, offset, noAssert) 
    
    append to namespace Buffer
        properties
            poolSize:number

        method isBuffer(b) 
        method isEncoding(encoding) 
        method concat(list, length) 
        method byteLength(str, enc) 

### append to class Error

        properties
            code


### public namespace process

        properties

            argv: array

            env:array

            versions: processVersions

            stdin:Stream
            stdout:Stream
            stderr:Stream

            moduleLoadList: array
            exitCode:number
            features:array
            pid:number
            execArgv:array

            debugPort:number
            version:string
            arch:string
            execPath:string
            title:string
            platform:string
            config
        
        method setgroups() 
        method setgid() 
        method uptime() 
        method nextTick(callback) 
        method removeListener(type, listener) 
        method getgroups() 
        method createAsyncListener(listener, callbacks, value) 
        method getgid() 
        method hrtime() 
        method initgroups() 
        method on(type, listener) 
        method addAsyncListener(listener, callbacks, value) 
        method memoryUsage() 
        method removeAsyncListener(obj) 
        method openStdin() 
        method reallyExit() 
        method chdir() 
        method cwd() 
        method setuid() 
        method assert(x, msg) 
        method addListener(type, listener) 
        method abort() 
        method getuid() 
        method dlopen() 
        method umask() 
        method exit(code) 
        method kill(pid, sig) 
        method binding() 
    
    
    public class EventEmitter
        
        constructor new EventEmitter () 
        
        properties
            domain
        
        method setMaxListeners(n) 
        method emit(type) 
        method addListener(type, listener) 
        method on(type, listener) 
        method once(type, listener) 
        method removeListener(type, listener) 
        method removeAllListeners(type) 
        method listeners(type) 
    
    append to namespace EventEmitter
        properties
            usingDomains:boolean
            defaultMaxListeners:number
        
        method listenerCount(emitter, type) 

    helper class processVersions
        properties 
            http_parser:string
            node:string
            uv:string
            zlib:string
            modules:string
            openssl:string
    

    helper class Stream
        properties 
            readable:boolean
            writable:boolean
            allowHalfOpen:boolean
            destroyed:boolean
            errorEmitted:boolean
            bytesRead:number
            columns:number
            rows:number
            fd:number
            destroySoon:function(er) 
            destroy:function(er) 
