//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/log.lite.md
// Log Utility
// ============

   // import color
   var color = require('./color');

// options
// -------

   // class LogOptions
   // constructor
   function LogOptions(){
        // properties
            // verbose: int = 1
            // warning: int = 1
            // storeMessages:boolean = false
            // debug = new LogOptionsDebug
           this.verbose=1;
           this.warning=1;
           this.storeMessages=false;
           this.debug=new LogOptionsDebug();
   };
   
   // end class LogOptions

   // class LogOptionsDebug
   // constructor
   function LogOptionsDebug(){
        // properties
            // enabled: boolean =  false
            // file   : string = 'out/debug.log'
           this.enabled=false;
           this.file='out/debug.log';
   };
   
   // end class LogOptionsDebug


// Dependencies:
// -------------

    //ifndef PROD_C

    //if type of process isnt 'undefined' #only import if we're on node
        //global import fs
        //import mkPath

    // #endif


// ## Main namespace / singleton

   // export default namespace log
   var log={};

     //      properties

        // options:LogOptions = new LogOptions
        // errorCount = 0
        // warningCount = 0

// if options.storeMessages, messages are pused at messages[]
// instead of console.

        // messages: string Array = []
        log.options=new LogOptions();
        log.errorCount=0;
        log.warningCount=0;
        log.messages=[];

// Implementation
// ---------------

    // method debug
    log.debug = function(){

       // if .options.debug.enabled
       if (this.options.debug.enabled) {

           var args = Array.prototype.slice.call(arguments);
       };
    };

            //ifndef PROD_C
            //if options.debug.file
                //fs.appendFileSync options.debug.file, args.join(" ")+"\r\n"
            //else
                //console.log.apply console,args
            // #endif

    // method debugClear ### clear debug file
    log.debugClear = function(){// ### clear debug file

        //ifdef PROD_C
       // do nothing
       null;
    };
        // #else
        //mkPath.toFile options.debug.file
        //fs.writeFileSync options.debug.file,""
        // #endif


    // method error
    log.error = function(){

// increment error count

       this.errorCount++;
       var args = Array.prototype.slice.call(arguments);

// add "ERROR:", send to debug log

       args.unshift('ERROR:');
       this.debug.apply(this, args);

// if messages should be stored...

       // if .options.storeMessages
       if (this.options.storeMessages) {
           this.messages.push(args.join(" "));
       }

// else, add red color, send to stderr
       
       else {
           args.unshift(color.red);
           args.push(color.normal);
           console.error.apply(console, args);
       };
    };


    // method warning
    log.warning = function(){

       this.warningCount++;
       var args = Array.prototype.slice.call(arguments);
       args.unshift('WARNING:');
       this.debug.apply(this, args);

       // if .options.warning > 0
       if (this.options.warning > 0) {

// if messages should be stored...

           // if .options.storeMessages
           if (this.options.storeMessages) {
               this.messages.push(args.join(" "));
           }

// else, add yellow color, send to stderr
           
           else {
               args.unshift(color.yellow);
               args.push(color.normal);
               console.error.apply(console, args);
           };
       };
    };

    // method message
    log.message = function(){

       var args = Array.prototype.slice.call(arguments);

       this.debug.apply(this, args);
       // if .options.verbose >= 1
       if (this.options.verbose >= 1) {

// if messages should be stored...

           // if .options.storeMessages
           if (this.options.storeMessages) {
               this.messages.push(args.join(" "));
           }

// else, send to console
           
           else {
               console.log.apply(console, args);
           };
       };
    };


    // method info
    log.info = function(){

       var args = Array.prototype.slice.call(arguments);
       // if .options.verbose >= 2
       if (this.options.verbose >= 2) {
           this.message.apply(this, args);
       };
    };

    // method extra
    log.extra = function(){

       var args = Array.prototype.slice.call(arguments);
       // if .options.verbose >= 3
       if (this.options.verbose >= 3) {
           this.message.apply(this, args);
       };
    };


    // method getMessages
    log.getMessages = function(){
// get & clear

       var result = this.messages;
       this.messages = [];
       return result;
    };


    // method throwControled(msg)
    log.throwControled = function(msg){
// Throws Error, but with a "controled" flag set,
// to differentiate from unexpected compiler errors

       var e = new Error(msg);
       e.controled = true;
       this.debug("Controled ERROR:", e.message);
       // throw e
       throw e;
    };


module.exports=log;