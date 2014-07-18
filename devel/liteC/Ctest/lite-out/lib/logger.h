#ifndef LIB_LOGGER_C__H
#define LIB_LOGGER_C__H
#include "../_dispatcher.h"
//-------------------------
//Module logger
//-------------------------
extern void logger__moduleInit(void);
    

//--------------
    // logger_LogOptions
    any logger_LogOptions; //Class logger_LogOptions
    typedef struct logger_LogOptions_s * logger_LogOptions_ptr;
    typedef struct logger_LogOptions_s {
        //LogOptions
        any verboseLevel;
        any warningLevel;
        any storeMessages;
        any debugOptions;
    
    } logger_LogOptions_s;
    
    extern void logger_LogOptions__init(DEFAULT_ARGUMENTS);
    

//--------------
    // logger_LogOptionsDebug
    any logger_LogOptionsDebug; //Class logger_LogOptionsDebug
    typedef struct logger_LogOptionsDebug_s * logger_LogOptionsDebug_ptr;
    typedef struct logger_LogOptionsDebug_s {
        //LogOptionsDebug
        any enabled;
        any file;
    
    } logger_LogOptionsDebug_s;
    
    extern void logger_LogOptionsDebug__init(DEFAULT_ARGUMENTS);
    //-------------------------
    // namespace logger
    //-------------------------
        extern var logger_options;
        extern var logger_errorCount;
        extern var logger_warningCount;
        extern var logger_messages;
        extern any logger_debug(DEFAULT_ARGUMENTS);
        extern any logger_debugGroup(DEFAULT_ARGUMENTS);
        extern any logger_debugGroupEnd(DEFAULT_ARGUMENTS);
        extern any logger_debugClear(DEFAULT_ARGUMENTS);
        extern any logger_error(DEFAULT_ARGUMENTS);
        extern any logger_warning(DEFAULT_ARGUMENTS);
        extern any logger_msg(DEFAULT_ARGUMENTS);
        extern any logger_info(DEFAULT_ARGUMENTS);
        extern any logger_extra(DEFAULT_ARGUMENTS);
        extern any logger_getMessages(DEFAULT_ARGUMENTS);
        extern any logger_throwControlled(DEFAULT_ARGUMENTS);
#endif