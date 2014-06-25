#ifndef TEST_LOG_C_H
#define TEST_LOG_C_H
#include "_dispatcher.h"
   
   extern any  debug(any this, any arguments);
   
    
    extern any debug_clear(any this, any arguments);
    
   
   extern any  error(any this, any arguments);
   
   
   extern any  warning(any this, any arguments);
   
   
   extern any  message(any this, any arguments);
   
   
   extern any  info(any this, any arguments);
   
   
   extern any  extra(any this, any arguments);
   
   
   extern any  getMessages(any this, any arguments);
   
   
   extern any  throwControled(any this, any arguments);
   
#endif