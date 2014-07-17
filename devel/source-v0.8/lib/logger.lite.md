Logger Utility
==============

    import color, ControlledError

options
-------

    class LogOptions
        properties
            verboseLevel = 1
            warningLevel = 1
            storeMessages = false
            debugOptions = new LogOptionsDebug

    class LogOptionsDebug
        properties
            enabled: boolean =  false
            file   : string = 'out/debug.logger'


Dependencies:
-------------

    #ifndef PROD_C

    if type of process isnt 'undefined' #only import if we're on node
        global import fs
        import mkPath 

    #endif


## Main namespace

### Namespace logger

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

        if logger.options.debugOptions.enabled

            var args = arguments.toArray()

            #ifdef PROD_C
            console.error.apply undefined,args
            #else
            if options.debug.file
                fs.appendFileSync options.debug.file, '#{args.join(" ")}\r\n'
            else
                console.error.apply undefined,args
            #endif


#### method debugGroup

        if logger.options.debugOptions.enabled
            console.error.apply undefined,arguments
            console.group.apply undefined,arguments

#### method debugGroupEnd

        if logger.options.debugOptions.enabled
            console.groupEnd

#### method debugClear ### clear debug file

        #ifdef PROD_C
        do nothing
        #else
        mkPath.toFile options.debug.file
        fs.writeFileSync options.debug.file,""
        #endif


#### method error
    
increment error count 

        logger.errorCount++
        var args = arguments.toArray()

add "ERROR:", send to debug logger

        args.unshift('ERROR:')
        logger.debug.apply undefined,args

if messages should be stored...

        if logger.options.storeMessages
            logger.messages.push args.join(" ")

else, add red color, send to stderr

        else
            args.unshift(color.red)
            args.push(color.normal)
            console.error.apply undefined,args


#### method warning

        logger.warningCount++
        var args = arguments.toArray()
        args.unshift('WARNING:')
        logger.debug.apply(undefined,args)
        
        if logger.options.warningLevel > 0

if messages should be stored...

            if logger.options.storeMessages
                logger.messages.push args.join(" ")

else, add yellow color, send to stderr

            else
                args.unshift(color.yellow);
                args.push(color.normal);
                console.error.apply(undefined,args);
        
#### method msg

        var args = arguments.toArray()

        logger.debug.apply(undefined,args)
        if logger.options.verboseLevel >= 1

if messages should be stored...

            if logger.options.storeMessages
                logger.messages.push args.join(" ")

else, send to console

            else 
                console.log.apply(undefined,args)


#### method info

        var args = arguments.toArray()
        if logger.options.verboseLevel >= 2
            logger.msg.apply(undefined,args)

#### method extra

        var args = arguments.toArray()
        if logger.options.verboseLevel >= 3
            logger.msg.apply(undefined,args)


#### method getMessages
get & clear

        var result = logger.messages
        logger.messages =[]
        return result


#### method throwControlled(msg)
Throws Error, but with a "controlled" flag set, 
to differentiate from unexpected compiler errors

        logger.debug "Controlled ERROR:", msg
        throw new ControlledError(msg)

