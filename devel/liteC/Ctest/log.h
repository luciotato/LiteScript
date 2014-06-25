#ifndef LOG_C_H
#define LOG_C_H
#include "_dispatcher.h"
   
   // classLogOptions
   #define LogOptions_TYPEID 36
   typedef struct LogOptions_s * LogOptions_ptr;
   typedef struct LogOptions_s {
       any verbose, warning, storeMessages, debug;} LogOptions_s;
   
   extern void LogOptions__init(any this, len_t argc, any* arguments);
   
   // classLogOptionsDebug
   #define LogOptionsDebug_TYPEID 37
   typedef struct LogOptionsDebug_s * LogOptionsDebug_ptr;
   typedef struct LogOptionsDebug_s {
       any enabled, file;} LogOptionsDebug_s;
   
   extern void LogOptionsDebug__init(any this, len_t argc, any* arguments);
   
   //-------------------
   //.namespace log
   extern any log_; //log is a singleton
   void log__init_singleton();
   //-------------------
   #define log_TYPEID 38
   typedef struct log_s * log_ptr;
   typedef struct log_s {
    any options, errorCount, warningCount, messages;} log_s;
   
   extern void log__init(any this, len_t argc, any* arguments);
    
    extern any log_debug( DEFAULT_ARGUMENTS );
    
    
    extern any log_debugClear( DEFAULT_ARGUMENTS );
    
    
    extern any log_error_( DEFAULT_ARGUMENTS );
    
    
    extern any log_warning( DEFAULT_ARGUMENTS );
    
    
    extern any log_message( DEFAULT_ARGUMENTS );
    
    
    extern any log_info( DEFAULT_ARGUMENTS );
    
    
    extern any log_extra( DEFAULT_ARGUMENTS );
    
    
    extern any log_getMessages( DEFAULT_ARGUMENTS );
    
    
    extern any log_throwControled( DEFAULT_ARGUMENTS );
    
#endif