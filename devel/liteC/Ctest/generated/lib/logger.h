#ifndef LIB_LOGGER_C__H
#define LIB_LOGGER_C__H
#include "../_dispatcher.h"
//-------------------------
//Module logger
//-------------------------
extern void logger__moduleInit(void);
   

//--------------
   // logger_LogOptions
   
   extern any logger_LogOptions; //Class Object
   
   typedef struct logger_LogOptions_s * logger_LogOptions_ptr;
   typedef struct logger_LogOptions_s {
       any
           verboseLevel,
           warningLevel,
           storeMessages,
           debugOptions
   ;
   } logger_LogOptions_s;
   
   extern void logger_LogOptions__init(DEFAULT_ARGUMENTS);
   

//--------------
   // logger_LogOptionsDebug
   
   extern any logger_LogOptionsDebug; //Class Object
   
   typedef struct logger_LogOptionsDebug_s * logger_LogOptionsDebug_ptr;
   typedef struct logger_LogOptionsDebug_s {
       any
           enabled,
           file
   ;
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
       extern any logger_debugClear(DEFAULT_ARGUMENTS);
       extern any logger_error(DEFAULT_ARGUMENTS);
       extern any logger_warning(DEFAULT_ARGUMENTS);
       extern any logger_msg(DEFAULT_ARGUMENTS);
       extern any logger_info(DEFAULT_ARGUMENTS);
       extern any logger_extra(DEFAULT_ARGUMENTS);
       extern any logger_getMessages(DEFAULT_ARGUMENTS);
       extern any logger_throwControlled(DEFAULT_ARGUMENTS);
#endif