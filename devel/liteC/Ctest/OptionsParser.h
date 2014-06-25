#ifndef OPTIONSPARSER_C_H
#define OPTIONSPARSER_C_H
#include "_dispatcher.h"
   
   // classOptionsParser
   #define OptionsParser_TYPEID 40
   typedef struct OptionsParser_s * OptionsParser_ptr;
   typedef struct OptionsParser_s {
    any lastIndex, items;} OptionsParser_s;
   
   extern void OptionsParser__init(any this, len_t argc, any* arguments);
    
    extern any OptionsParser_option( DEFAULT_ARGUMENTS );
    
    
    extern any OptionsParser_value( DEFAULT_ARGUMENTS );
    
    
    extern any OptionsParser_getPos( DEFAULT_ARGUMENTS );
    
    
    extern any OptionsParser_search( DEFAULT_ARGUMENTS );
    
#endif