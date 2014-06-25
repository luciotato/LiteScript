Log Utility
============

    import color

options
-------

    class LogOptions
        properties
            verbose: int = 1
            warning: int = 1
            storeMessages:boolean = false
            debug = new LogOptionsDebug

    class LogOptionsDebug
        properties
            enabled: boolean =  false
            file   : string = 'out/debug.log'


Dependencies:
-------------

    #ifndef PROD_C

    if type of process isnt 'undefined' #only import if we're on node
        global import fs
        import mkPath 

    #endif


## Main namespace / singleton

### export default namespace log

#### properties 

        options:LogOptions = new LogOptions
        errorCount = 0
        warningCount = 0

if options.storeMessages, messages are pused at messages[]
instead of console.

        messages: string Array = []

Implementation
---------------

#### method debug

        if .options.debug.enabled

            var args = arguments.toArray()

            #ifndef PROD_C
            if options.debug.file
                fs.appendFileSync options.debug.file, args.join(" ")+"\r\n"
            else
                console.log.apply console,args
            #endif

#### method debugClear ### clear debug file

        #ifdef PROD_C
        do nothing
        #else
        mkPath.toFile options.debug.file
        fs.writeFileSync options.debug.file,""
        #endif


#### method error
    
increment error count 

        .errorCount++
        var args = arguments.toArray()

add "ERROR:", send to debug log

        args.unshift('ERROR:');
        .debug.apply(this,args);

if messages should be stored...

        if .options.storeMessages
            .messages.push args.join(" ")

else, add red color, send to stderr

        else
            args.unshift(color.red);
            args.push(color.normal);
            console.error.apply(console,args);


#### method warning

        .warningCount++
        var args = arguments.toArray()
        args.unshift('WARNING:')
        .debug.apply(this,args)
        
        if .options.warning > 0

if messages should be stored...

            if .options.storeMessages
                .messages.push args.join(" ")

else, add yellow color, send to stderr

            else
                args.unshift(color.yellow);
                args.push(color.normal);
                console.error.apply(console,args);
        
#### method message

        var args = arguments.toArray()

        .debug.apply(this,args)
        if .options.verbose >= 1

if messages should be stored...

            if .options.storeMessages
                .messages.push args.join(" ")

else, send to console

            else 
                console.log.apply(console,args)


#### method info

        var args = arguments.toArray()
        if .options.verbose >= 2
            .message.apply(this,args)

#### method extra

        var args = arguments.toArray()
        if .options.verbose >= 3
            .message.apply(this,args)


#### method getMessages
get & clear

        var result = .messages
        .messages =[]
        return result


#### method throwControled(msg)
Throws Error, but with a "controled" flag set, 
to differentiate from unexpected compiler errors

        var e = new Error(msg)
        e.extra.set "controled", 1
        .debug "Controled ERROR:", e.message
        throw e

