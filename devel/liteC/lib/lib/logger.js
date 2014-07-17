//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/lib/logger.lite.md
// Logger Utility
// ==============

   // import color, ControlledError
   var color = require('./color.js');
   var ControlledError = require('./ControlledError.js');

// options
// -------

   // class LogOptions
   // constructor
   function LogOptions(){ // default constructor
        // properties
            // verboseLevel = 1
            // warningLevel = 1
            // storeMessages = false
            // debugOptions = new LogOptionsDebug
           this.verboseLevel=1;
           this.warningLevel=1;
           this.storeMessages=false;
           this.debugOptions=new LogOptionsDebug();
   };
   
   // end class LogOptions

   // class LogOptionsDebug
   // constructor
   function LogOptionsDebug(){ // default constructor
        // properties
            // enabled: boolean =  false
            // file   : string = 'out/debug.logger'
           this.enabled=false;
           this.file='out/debug.logger';
   };
   
   // end class LogOptionsDebug


// Dependencies:
// -------------

    //ifndef PROD_C

    //if type of process isnt 'undefined' #only import if we're on node
        //global import fs
        //import mkPath

    //endif


// ## Main namespace

   // namespace logger
   var logger={};

     //      properties

        // options:LogOptions = new LogOptions
        // errorCount = 0
        // warningCount = 0

// if options.storeMessages, messages are pused at messages[]
// instead of console.

        // messages: string Array = []
        logger.options=new LogOptions();
        logger.errorCount=0;
        logger.warningCount=0;
        logger.messages=[];

// Implementation
// ---------------

    // method debug
    logger.debug = function(){

       // if logger.options.debugOptions.enabled
       if (logger.options.debugOptions.enabled) {

           var args = Array.prototype.slice.call(arguments);

            //ifdef PROD_C
           console.error.apply(undefined, args);
       };
    };
            //else
            //if options.debug.file
                //fs.appendFileSync options.debug.file, '#{args.join(" ")}\r\n'
            //else
                //console.error.apply undefined,args
            //endif


    // method debugGroup
    logger.debugGroup = function(){

       // if logger.options.debugOptions.enabled
       if (logger.options.debugOptions.enabled) {
           console.error.apply(undefined, Array.prototype.slice.call(arguments));
           console.group.apply(undefined, Array.prototype.slice.call(arguments));
       };
    };

    // method debugGroupEnd
    logger.debugGroupEnd = function(){

       // if logger.options.debugOptions.enabled
       if (logger.options.debugOptions.enabled) {
           console.groupEnd();
       };
    };

    // method debugClear ### clear debug file
    logger.debugClear = function(){// ### clear debug file

        //ifdef PROD_C
       // do nothing
       null;
    };
        //else
        //mkPath.toFile options.debug.file
        //fs.writeFileSync options.debug.file,""
        //endif


    // method error
    logger.error = function(){

// increment error count

       logger.errorCount++;
       var args = Array.prototype.slice.call(arguments);

// add "ERROR:", send to debug logger

       args.unshift('ERROR:');
       logger.debug.apply(undefined, args);

// if messages should be stored...

       // if logger.options.storeMessages
       if (logger.options.storeMessages) {
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

           // if logger.options.storeMessages
           if (logger.options.storeMessages) {
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

           // if logger.options.storeMessages
           if (logger.options.storeMessages) {
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