//Compiled by LiteScript compiler v0.7.9, source: /home/ltato/LiteScript/devel/source/v0.8/lib/logger.lite.md
// Logger Utility
// ==============

   // import color, ControlledError, GeneralOptions
   var color = require('./color.js');
   var ControlledError = require('./ControlledError.js');
   var GeneralOptions = require('./GeneralOptions.js');

// Dependencies:
// -------------

    //ifndef PROD_C

   // if type of process isnt 'undefined' #only import if we're on node
   if (typeof process !== 'undefined') {// #only import if we're on node
       // global import fs
       var fs = require('fs');
       // import mkPath
       var mkPath = require('./mkPath.js');
       
   };

    //endif


// ## Main namespace

   // namespace logger
   var logger={};

     //      properties

        // options: GeneralOptions
        // errorCount = 0
        // warningCount = 0

// if storeMessages, messages are pushed at messages[] instead of console.

        // storeMessages: boolean
        // messages: string Array = []
        logger.errorCount=0;
        logger.warningCount=0;
        logger.messages=[];

// Implementation
// ---------------

    // method init(options:GeneralOptions)
    logger.init = function(options){

       logger.options = options;

       logger.errorCount = 0;
       logger.warningCount = 0;

       logger.storeMessages = false;
       logger.messages = [];
    };


    // method debug
    logger.debug = function(){

       // if logger.options.debugEnabled
       if (logger.options.debugEnabled) {
           var args = Array.prototype.slice.call(arguments);
           console.error.apply(undefined, args);
       };
    };

    // method debugGroup
    logger.debugGroup = function(){

       // if logger.options.debugEnabled
       if (logger.options.debugEnabled) {
           console.error.apply(undefined, Array.prototype.slice.call(arguments));
           console.group.apply(undefined, Array.prototype.slice.call(arguments));
       };
    };

    // method debugGroupEnd
    logger.debugGroupEnd = function(){

       // if logger.options.debugEnabled
       if (logger.options.debugEnabled) {
           console.groupEnd();
       };
    };

    // method error
    logger.error = function(){

// increment error count

       logger.errorCount++;
       var args = Array.prototype.slice.call(arguments);

// add "ERROR:", send to debug logger

       args.unshift('ERROR:');
       logger.debug.apply(undefined, args);

// if messages should be stored...

       // if logger.storeMessages
       if (logger.storeMessages) {
           logger.messages.push(args.join(" "));
       }

// else, add red color, send to stderr
       
       else {
           args.unshift(color.red);
           args.push(color.normal);
           console.error.apply(undefined, args);
       };
    };


    // method warning
    logger.warning = function(){

       logger.warningCount++;
       var args = Array.prototype.slice.call(arguments);

       args.unshift('WARNING:');
       logger.debug.apply(undefined, args);

       // if logger.options.warningLevel > 0
       if (logger.options.warningLevel > 0) {

// if messages should be stored...

           // if logger.storeMessages
           if (logger.storeMessages) {
               logger.messages.push(args.join(" "));
           }

// else, add yellow color, send to stderr
           
           else {
               args.unshift(color.yellow);
               args.push(color.normal);
               console.error.apply(undefined, args);
           };
       };
    };

    // method msg
    logger.msg = function(){

       var args = Array.prototype.slice.call(arguments);

       logger.debug.apply(undefined, args);
       // if logger.options.verboseLevel >= 1
       if (logger.options.verboseLevel >= 1) {

// if messages should be stored...

           // if logger.storeMessages
           if (logger.storeMessages) {
               logger.messages.push(args.join(" "));
           }

// else, send to console
           
           else {
               console.log.apply(undefined, args);
           };
       };
    };


    // method info
    logger.info = function(){

       var args = Array.prototype.slice.call(arguments);
       // if logger.options.verboseLevel >= 2
       if (logger.options.verboseLevel >= 2) {
           logger.msg.apply(undefined, args);
       };
    };

    // method extra
    logger.extra = function(){

       var args = Array.prototype.slice.call(arguments);
       // if logger.options.verboseLevel >= 3
       if (logger.options.verboseLevel >= 3) {
           logger.msg.apply(undefined, args);
       };
    };


    // method getMessages
    logger.getMessages = function(){
// get & clear

       var result = logger.messages;
       logger.messages = [];
       return result;
    };


    // method throwControlled(msg)
    logger.throwControlled = function(msg){
// Throws Error, but with a "controlled" flag set,
// to differentiate from unexpected compiler errors

       logger.debug("Controlled ERROR:", msg);
       // throw new ControlledError(msg)
       throw new ControlledError(msg);
    };


module.exports=logger;
//# sourceMappingURL=logger.js.map