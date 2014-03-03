Log Utility
============
(c) 2014 Lucio M. Tato


options
-------

    export var options  =

            verbose: 1

            warning: 1

            storeMessages: false

            debug:
                enabled: false
                file   : 'out/debug.log'

if options.storeMessages, messages are pused at messages[]
instead of console.

    var messages=[]


Colors
------

    export var color = 

      normal:   "\x1b[39;49m"
      red:      "\x1b[91m"
      yellow:   "\x1b[93m"
      green:    "\x1b[32m" 
 
    
Dependencies:
-------------

    if type of process isnt 'undefined' #only import if we're on node
        global import fs
        import mkPath 

###global declares, valid properties

    declare on Error
        soft, controled, code, stack

Implementation
---------------

    declare valid Array.prototype.slice.apply
    declare valid Array.prototype.join.apply
    declare valid console.log.apply
    declare valid console.error.apply

### export function debug

        if options.debug.enabled
            var args:array = Array.prototype.slice.apply(arguments)
            if options.debug.file
                fs.appendFileSync options.debug.file, args.join(" ")+"\r\n"
            else
                console.log.apply console,args

### append to namespace debug
#### method clear ### clear debug file

        mkPath.toFile options.debug.file
        fs.writeFileSync options.debug.file,""


### export function error
    
increment error count 

        error.count++
        var args:array = Array.prototype.slice.apply(arguments);

add "ERROR:", send to debug log

        args.unshift('ERROR:');
        debug.apply(this,args);

if messages should be stored...

        if options.storeMessages
            messages.push args.join(" ")

else, add red color, send to stderr

        else
            args.unshift(color.red);
            args.push(color.normal);
            console.error.apply(console,args);


### append to namespace error #to the function as namespace
        properties 
            count = 0  # now we have: log.error.count


### export function warning

        warning.count++
        var args:array = Array.prototype.slice.apply(arguments);
        args.unshift('WARNING:');
        debug.apply(this,args);
        if options.warning > 0

if messages should be stored...

            if options.storeMessages
                messages.push args.join(" ")

else, add yellow color, send to stderr

            else
                args.unshift(color.yellow);
                args.push(color.normal);
                console.error.apply(console,args);
        
### append to namespace warning #to the function as namespace
        properties 
            count = 0  # now we have: log.warning.count

### export function message

        debug.apply(this,arguments)
        if options.verbose >= 1

if messages should be stored...

            if options.storeMessages
                messages.push Array.prototype.join.call(arguments," ")

else, send to console

            else 
                console.log.apply(console,arguments)


### export function extra

        if options.verbose >= 2
            message.apply(this,arguments)


### export function getMessages
get & clear

        var result = messages
        messages =[]
        return result


### export function throwControled
Throws Error, but with a "controled" flag set, 
to differentiate from unexpected compiler errors

        var e = new Error(Array.prototype.slice.apply(arguments).join(" "))
        e.controled = true
        debug "Controled ERROR:", e.message
        throw e

