//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/log.lite.md
#include "log.h"
// Log Utility
// ============

   // import color
   #include "color.h"

// options
// -------

   // class LogOptions
   
   
   //auto LogOptions__init
   void LogOptions__init(any this, len_t argc, any* arguments){
           ((LogOptions_ptr)this.value.ptr)->verbose = any_number(1);
           ((LogOptions_ptr)this.value.ptr)->warning = any_number(1);
           ((LogOptions_ptr)this.value.ptr)->storeMessages = any_FALSE;
           ((LogOptions_ptr)this.value.ptr)->debug = new(LogOptionsDebug_TYPEID,0,NULL);
   };

   // class LogOptionsDebug
   
   
   //auto LogOptionsDebug__init
   void LogOptionsDebug__init(any this, len_t argc, any* arguments){
           ((LogOptionsDebug_ptr)this.value.ptr)->enabled = any_FALSE;
           ((LogOptionsDebug_ptr)this.value.ptr)->file = any_str("out/debug.log");
   };


// Dependencies:
// -------------

    //ifndef PROD_C

    //if type of process isnt 'undefined' #only import if we're on node
        //global import fs
        //import mkPath

    // #endif


// ## Main namespace / singleton

   // export default namespace log
   any log_={.type=0}; //declare singleton
   void log__init_singleton(){
      if (!log_.type) log_=new(log_TYPEID,0,NULL);
   };
   
   
   //auto log__init
   void log__init(any this, len_t argc, any* arguments){
       ((log_ptr)this.value.ptr)->options = new(LogOptions_TYPEID,0,NULL);
       ((log_ptr)this.value.ptr)->errorCount = any_number(0);
       ((log_ptr)this.value.ptr)->warningCount = any_number(0);
       ((log_ptr)this.value.ptr)->messages = _newArrayWith(0,NULL);
   };

// Implementation
// ---------------

    // method debug
    any log_debug(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------

       // if .options.debug.enabled
       if (anyToBool(((LogOptionsDebug_ptr)((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->debug.value.ptr)->enabled))  {

           var args = _newArrayWith(argc,arguments);
           ;
       };
    }
    ;

            //ifndef PROD_C
            //if options.debug.file
                //fs.appendFileSync options.debug.file, args.join(" ")+"\r\n"
            //else
                //console.log.apply console,args
            // #endif

    // method debugClear ### clear debug file
    any log_debugClear(any this, len_t argc, any* arguments){// ### clear debug file
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------

        //ifdef PROD_C
       //do nothing
       ;
    }
    ;
        // #else
        //mkPath.toFile options.debug.file
        //fs.writeFileSync options.debug.file,""
        // #endif


    // method error
    any log_error_(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------

// increment error count

       ((log_ptr)this.value.ptr)->errorCount;
       var args = _newArrayWith(argc,arguments);
       ;

// add "ERROR:", send to debug log

       _unshift(args,1,(any_arr){
       any_str("ERROR:")
       });
       _apply_function(_debug,this,args);

// if messages should be stored...

       // if .options.storeMessages
       if (anyToBool(((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->storeMessages))  {
           _push(((log_ptr)this.value.ptr)->messages,1,(any_arr){
           _join(args,1,(any_arr){
           any_str(" ")
           })
           });
       }

// else, add red color, send to stderr
       
       else {
           _unshift(args,1,(any_arr){
           ((color_ptr)color.value.ptr)->red
           });
           _push(args,1,(any_arr){
           ((color_ptr)color.value.ptr)->normal
           });
           _apply_function(_error_,console,args);
       };
    }
    ;


    // method warning
    any log_warning(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------

       ((log_ptr)this.value.ptr)->warningCount;
       var args = _newArrayWith(argc,arguments);
       ;
       _unshift(args,1,(any_arr){
       any_str("WARNING:")
       });
       _apply_function(_debug,this,args);

       // if .options.warning > 0
       if (anyToNumber(((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->warning) > 0)  {

// if messages should be stored...

           // if .options.storeMessages
           if (anyToBool(((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->storeMessages))  {
               _push(((log_ptr)this.value.ptr)->messages,1,(any_arr){
               _join(args,1,(any_arr){
               any_str(" ")
               })
               });
           }

// else, add yellow color, send to stderr
           
           else {
               _unshift(args,1,(any_arr){
               ((color_ptr)color.value.ptr)->yellow
               });
               _push(args,1,(any_arr){
               ((color_ptr)color.value.ptr)->normal
               });
               _apply_function(_error_,console,args);
           };
       };
    }
    ;

    // method message
    any log_message(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------

       var args = _newArrayWith(argc,arguments);
       ;

       _apply_function(_debug,this,args);
       // if .options.verbose >= 1
       if (anyToNumber(((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->verbose) >= 1)  {

// if messages should be stored...

           // if .options.storeMessages
           if (anyToBool(((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->storeMessages))  {
               _push(((log_ptr)this.value.ptr)->messages,1,(any_arr){
               _join(args,1,(any_arr){
               any_str(" ")
               })
               });
           }

// else, send to console
           
           else {
               _apply_function(_log_,console,args);
           };
       };
    }
    ;


    // method info
    any log_info(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------

       var args = _newArrayWith(argc,arguments);
       ;
       // if .options.verbose >= 2
       if (anyToNumber(((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->verbose) >= 2)  {
           _apply_function(_message,this,args);
       };
    }
    ;

    // method extra
    any log_extra(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------

       var args = _newArrayWith(argc,arguments);
       ;
       // if .options.verbose >= 3
       if (anyToNumber(((LogOptions_ptr)((log_ptr)this.value.ptr)->options.value.ptr)->verbose) >= 3)  {
           _apply_function(_message,this,args);
       };
    }
    ;


    // method getMessages
    any log_getMessages(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------
// get & clear

       var result = ((log_ptr)this.value.ptr)->messages;
       ;
       ((log_ptr)this.value.ptr)->messages = _newArrayWith(0,NULL);
       return result;
    }
    ;


    // method throwControled(msg)
    any log_throwControled(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==log_TYPEID);
       //---------
       // define named params
       var msg= argc? arguments[0] : undefined;
       //---------
// Throws Error, but with a "controled" flag set,
// to differentiate from unexpected compiler errors

       var e = new(Error_TYPEID,1,(any_arr){
       msg
       });
       ;
       _set(((Error_ptr)e.value.ptr)->extra,2,(any_arr){
       any_str("controled"), 
       any_number(1)
       });
       _debug(this,2,(any_arr){
       any_str("Controled ERROR:"), 
       ((Error_ptr)e.value.ptr)->message
       });
       // throw e
       throw(e);
    }
    ;


//# sourceMappingURL=log.c.map