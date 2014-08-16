Logger Utility
==============


Dependencies:
-------------

    import color, ControlledError, GeneralOptions

    import fs, mkPath 

## Main namespace

### Namespace logger

#### properties 

        options: GeneralOptions
        errorCount = 0
        warningCount = 0

if storeMessages, messages are pushed at messages[] instead of console.

        storeMessages: boolean
        messages: string Array = []

Implementation
---------------

#### method init(options:GeneralOptions)

        logger.options = options

        logger.errorCount = 0
        logger.warningCount = 0

        logger.storeMessages=false
        logger.messages=[]
    

#### method debug

        if logger.options.debugEnabled
            var args = arguments.toArray()
            console.error.apply undefined,args

#### method debugGroup

        if logger.options.debugEnabled
            console.error.apply undefined,arguments
            console.group.apply undefined,arguments

#### method debugGroupEnd

        if logger.options.debugEnabled
            console.groupEnd

#### method error
    
increment error count 

        logger.errorCount++
        var args = arguments.toArray()

add "ERROR:", send to debug logger

        args.unshift('ERROR:')
        logger.debug.apply undefined,args

if messages should be stored...

        if logger.storeMessages
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

            if logger.storeMessages
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

            if logger.storeMessages
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

