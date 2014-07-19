#ifndef LIB_OPTIONSPARSER_C__H
#define LIB_OPTIONSPARSER_C__H
#include "../_dispatcher.h"
//-------------------------
//Module OptionsParser
//-------------------------
extern void OptionsParser__moduleInit(void);
    

//--------------
    // OptionsParser
    any OptionsParser; //Class OptionsParser
    typedef struct OptionsParser_s * OptionsParser_ptr;
    typedef struct OptionsParser_s {
        //OptionsParser
        any lastIndex;
        any items;
    
    } OptionsParser_s;
    
    extern void OptionsParser__init(DEFAULT_ARGUMENTS);
    extern any OptionsParser_option(DEFAULT_ARGUMENTS);
    extern any OptionsParser_valueFor(DEFAULT_ARGUMENTS);
    extern any OptionsParser_getPos(DEFAULT_ARGUMENTS);
    extern any OptionsParser_search(DEFAULT_ARGUMENTS);
#endif
