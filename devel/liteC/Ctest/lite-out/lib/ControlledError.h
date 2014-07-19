#ifndef LIB_CONTROLLEDERROR_C__H
#define LIB_CONTROLLEDERROR_C__H
#include "../_dispatcher.h"
//-------------------------
//Module ControlledError
//-------------------------
extern void ControlledError__moduleInit(void);
    

//--------------
    // ControlledError
    any ControlledError; //Class ControlledError extends Error
    
    typedef struct ControlledError_s * ControlledError_ptr;
    typedef struct ControlledError_s {
        //Error
        any name;
        any message;
        any stack;
        any code;
        //ControlledError
        any soft;
    
    } ControlledError_s;
    
    extern void ControlledError__init(DEFAULT_ARGUMENTS);
#endif
