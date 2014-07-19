#include "logger.h"
//-------------------------
//Module logger
//-------------------------
#include "logger.c.extra"
    //-----------------------
    // Class logger_LogOptions: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr logger_LogOptions_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t logger_LogOptions_PROPS[] = {
    verboseLevel_
    , warningLevel_
    , storeMessages_
    , debugOptions_
    };
    
    //-----------------------
    // Class logger_LogOptionsDebug: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr logger_LogOptionsDebug_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t logger_LogOptionsDebug_PROPS[] = {
    enabled_
    , file_
    };
    
    

//--------------
    // logger_LogOptions
    any logger_LogOptions; //Class logger_LogOptions
    //auto logger_LogOptions__init
    void logger_LogOptions__init(any this, len_t argc, any* arguments){
        PROP(verboseLevel_,this)=any_number(1);
        PROP(warningLevel_,this)=any_number(1);
        PROP(storeMessages_,this)=false;
        PROP(debugOptions_,this)=new(logger_LogOptionsDebug,0,NULL);
    };
//Logger Utility
//==============
    //import color, ControlledError
//options
//-------
    //class LogOptions
        //properties
            //verboseLevel = 1
            //warningLevel = 1
            //storeMessages = false
            //debugOptions = new LogOptionsDebug
        ;
    

//--------------
    // logger_LogOptionsDebug
    any logger_LogOptionsDebug; //Class logger_LogOptionsDebug
    //auto logger_LogOptionsDebug__init
    void logger_LogOptionsDebug__init(any this, len_t argc, any* arguments){
        PROP(enabled_,this)=false;
        PROP(file_,this)=any_str("out/debug.logger");
    };
    //class LogOptionsDebug
        //properties
            //enabled: boolean =  false
            //file   : string = 'out/debug.logger'
        ;
    //-------------------------
    //NAMESPACE logger
    //-------------------------
     var logger_options, logger_errorCount, logger_warningCount, logger_messages;
//Dependencies:
//-------------
    ////ifndef PROD_C
////
    ////if type of process isnt 'undefined' #only import if we're on node
        ////global import fs
        ////import mkPath
////
    ////endif
//## Main namespace
//### Namespace logger
//#### properties 
        //options:LogOptions = new LogOptions
        //errorCount = 0
        //warningCount = 0
//if options.storeMessages, messages are pused at messages[]
//instead of console.
        //messages: string Array = []
//Implementation
//---------------
//#### method debug
     any logger_debug(DEFAULT_ARGUMENTS){
        //if logger.options.debugOptions.enabled
        if (_anyToBool(PROP(enabled_,PROP(debugOptions_,logger_options))))  {
            //var args = arguments.toArray()
            var args = _newArray(argc,arguments);
            ////ifdef PROD_C
            //console.error.apply undefined,args
            __applyArr(any_func(console_error),undefined,args);
        };
     return undefined;
     }
            ////else
            ////if options.debug.file
                ////fs.appendFileSync options.debug.file, '#{args.join(" ")}\r\n'
            ////else
                ////console.error.apply undefined,args
            ////endif
//#### method debugGroup
     any logger_debugGroup(DEFAULT_ARGUMENTS){
        //if logger.options.debugOptions.enabled
        if (_anyToBool(PROP(enabled_,PROP(debugOptions_,logger_options))))  {
            //console.error.apply undefined,arguments
            __applyArr(any_func(console_error),undefined,_newArray(argc,arguments));
            //console.group.apply undefined,arguments
            __applyArr(any_func(console_group),undefined,_newArray(argc,arguments));
        };
     return undefined;
     }
//#### method debugGroupEnd
     any logger_debugGroupEnd(DEFAULT_ARGUMENTS){
        //if logger.options.debugOptions.enabled
        if (_anyToBool(PROP(enabled_,PROP(debugOptions_,logger_options))))  {
            //console.groupEnd
            console_groupEnd(undefined,0,NULL);
        };
     return undefined;
     }
//#### method debugClear ### clear debug file
     any logger_debugClear(DEFAULT_ARGUMENTS){
        ////ifdef PROD_C
        //do nothing
        //do nothing
        ;
     return undefined;
     }
        ////else
        ////mkPath.toFile options.debug.file
        ////fs.writeFileSync options.debug.file,""
        ////endif
//#### method error
     any logger_error(DEFAULT_ARGUMENTS){
   // 
//increment error count 
        //logger.errorCount++
        logger_errorCount.value.number++;
        //var args = arguments.toArray()
        var args = _newArray(argc,arguments);
//add "ERROR:", send to debug logger
        //args.unshift('ERROR:')
        METHOD(unshift_,args)(args,1,(any_arr){any_str("ERROR:")});
        //logger.debug.apply undefined,args
        __applyArr(any_func(logger_debug),undefined,args);
//if messages should be stored...
        //if logger.options.storeMessages
        if (_anyToBool(PROP(storeMessages_,logger_options)))  {
            //logger.messages.push args.join(" ")
            __call(push_,logger_messages,1,(any_arr){METHOD(join_,args)(args,1,(any_arr){any_str(" ")})});
        }
//else, add red color, send to stderr
        //else
        
        else {
            //args.unshift(color.red)
            METHOD(unshift_,args)(args,1,(any_arr){color_red});
            //args.push(color.normal)
            METHOD(push_,args)(args,1,(any_arr){color_normal});
            //console.error.apply undefined,args
            __applyArr(any_func(console_error),undefined,args);
        };
     return undefined;
     }
//#### method warning
     any logger_warning(DEFAULT_ARGUMENTS){
        //logger.warningCount++
        logger_warningCount.value.number++;
        //var args = arguments.toArray()
        var args = _newArray(argc,arguments);
        //args.unshift('WARNING:')
        METHOD(unshift_,args)(args,1,(any_arr){any_str("WARNING:")});
        //logger.debug.apply(undefined,args)
        __applyArr(any_func(logger_debug),undefined,args);
       // 
        //if logger.options.warningLevel > 0
        if (_anyToNumber(PROP(warningLevel_,logger_options)) > 0)  {
//if messages should be stored...
            //if logger.options.storeMessages
            if (_anyToBool(PROP(storeMessages_,logger_options)))  {
                //logger.messages.push args.join(" ")
                __call(push_,logger_messages,1,(any_arr){METHOD(join_,args)(args,1,(any_arr){any_str(" ")})});
            }
//else, add yellow color, send to stderr
            //else
            
            else {
                //args.unshift(color.yellow);
                METHOD(unshift_,args)(args,1,(any_arr){color_yellow});
                //args.push(color.normal);
                METHOD(push_,args)(args,1,(any_arr){color_normal});
                //console.error.apply(undefined,args);
                __applyArr(any_func(console_error),undefined,args);
            };
        };
     return undefined;
     }
       // 
//#### method msg
     any logger_msg(DEFAULT_ARGUMENTS){
        //var args = arguments.toArray()
        var args = _newArray(argc,arguments);
        //logger.debug.apply(undefined,args)
        __applyArr(any_func(logger_debug),undefined,args);
        //if logger.options.verboseLevel >= 1
        if (_anyToNumber(PROP(verboseLevel_,logger_options)) >= 1)  {
//if messages should be stored...
            //if logger.options.storeMessages
            if (_anyToBool(PROP(storeMessages_,logger_options)))  {
                //logger.messages.push args.join(" ")
                __call(push_,logger_messages,1,(any_arr){METHOD(join_,args)(args,1,(any_arr){any_str(" ")})});
            }
//else, send to console
            //else 
            
            else {
                //console.log.apply(undefined,args)
                __applyArr(any_func(console_log),undefined,args);
            };
        };
     return undefined;
     }
//#### method info
     any logger_info(DEFAULT_ARGUMENTS){
        //var args = arguments.toArray()
        var args = _newArray(argc,arguments);
        //if logger.options.verboseLevel >= 2
        if (_anyToNumber(PROP(verboseLevel_,logger_options)) >= 2)  {
            //logger.msg.apply(undefined,args)
            __applyArr(any_func(logger_msg),undefined,args);
        };
     return undefined;
     }
//#### method extra
     any logger_extra(DEFAULT_ARGUMENTS){
        //var args = arguments.toArray()
        var args = _newArray(argc,arguments);
        //if logger.options.verboseLevel >= 3
        if (_anyToNumber(PROP(verboseLevel_,logger_options)) >= 3)  {
            //logger.msg.apply(undefined,args)
            __applyArr(any_func(logger_msg),undefined,args);
        };
     return undefined;
     }
//#### method getMessages
     any logger_getMessages(DEFAULT_ARGUMENTS){
//get & clear
        //var result = logger.messages
        var result = logger_messages;
        //logger.messages =[]
        logger_messages = new(Array,0,NULL);
        //return result
        return result;
     return undefined;
     }
//#### method throwControlled(msg)
     any logger_throwControlled(DEFAULT_ARGUMENTS){
        
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
//Throws Error, but with a "controlled" flag set, 
//to differentiate from unexpected compiler errors
        //logger.debug "Controlled ERROR:", msg
        logger_debug(undefined,2,(any_arr){any_str("Controlled ERROR:"), msg});
        //throw new ControlledError(msg)
        throw(new(ControlledError,1,(any_arr){msg}));
     return undefined;
     }
    
    //------------------
    void logger__namespaceInit(void){
         logger_options = new(logger_LogOptions,0,NULL);
         logger_errorCount = any_number(0);
         logger_warningCount = any_number(0);
         logger_messages = new(Array,0,NULL);
     ;};
    

//-------------------------
void logger__moduleInit(void){
        logger_LogOptions =_newClass("logger_LogOptions", logger_LogOptions__init, sizeof(struct logger_LogOptions_s), Object.value.classINFOptr);
        _declareMethods(logger_LogOptions, logger_LogOptions_METHODS);
        _declareProps(logger_LogOptions, logger_LogOptions_PROPS, sizeof logger_LogOptions_PROPS);
    
        logger_LogOptionsDebug =_newClass("logger_LogOptionsDebug", logger_LogOptionsDebug__init, sizeof(struct logger_LogOptionsDebug_s), Object.value.classINFOptr);
        _declareMethods(logger_LogOptionsDebug, logger_LogOptionsDebug_METHODS);
        _declareProps(logger_LogOptionsDebug, logger_LogOptionsDebug_PROPS, sizeof logger_LogOptionsDebug_PROPS);
    
        logger__namespaceInit();
};
