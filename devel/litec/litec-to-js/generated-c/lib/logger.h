#ifndef LIB_LOGGER_C__H
#define LIB_LOGGER_C__H
#include "../_dispatcher.h"
//-------------------------
//Module logger
//-------------------------
extern void logger__moduleInit(void);
    //-------------------------
    // namespace logger
    //-------------------------
        extern var logger_options;
        extern var logger_errorCount;
        extern var logger_warningCount;
        extern var logger_storeMessages;
        extern var logger_messages;
        extern any logger_init(DEFAULT_ARGUMENTS);
        extern any logger_debug(DEFAULT_ARGUMENTS);
        extern any logger_debugGroup(DEFAULT_ARGUMENTS);
        extern any logger_debugGroupEnd(DEFAULT_ARGUMENTS);
        extern any logger_error(DEFAULT_ARGUMENTS);
        extern any logger_warning(DEFAULT_ARGUMENTS);
        extern any logger_msg(DEFAULT_ARGUMENTS);
        extern any logger_info(DEFAULT_ARGUMENTS);
        extern any logger_extra(DEFAULT_ARGUMENTS);
        extern any logger_getMessages(DEFAULT_ARGUMENTS);
        extern any logger_throwControlled(DEFAULT_ARGUMENTS);
     extern any logger_init(DEFAULT_ARGUMENTS);
     extern any logger_debug(DEFAULT_ARGUMENTS);
     extern any logger_debugGroup(DEFAULT_ARGUMENTS);
     extern any logger_debugGroupEnd(DEFAULT_ARGUMENTS);
     extern any logger_error(DEFAULT_ARGUMENTS);
     extern any logger_warning(DEFAULT_ARGUMENTS);
     extern any logger_msg(DEFAULT_ARGUMENTS);
     extern any logger_info(DEFAULT_ARGUMENTS);
     extern any logger_extra(DEFAULT_ARGUMENTS);
     extern any logger_getMessages(DEFAULT_ARGUMENTS);
     extern any logger_throwControlled(DEFAULT_ARGUMENTS);
#endif
