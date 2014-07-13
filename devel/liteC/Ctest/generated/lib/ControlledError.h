#ifndef LIB_CONTROLLEDERROR_C__H
#define LIB_CONTROLLEDERROR_C__H
#include "../_dispatcher.h"
//-------------------------
//Module ControlledError
//-------------------------
extern void ControlledError__moduleInit(void);
   

//--------------
   // ControlledError extends Error
   
   
   extern any ControlledError; //Class Object
   
   typedef struct ControlledError_s * ControlledError_ptr;
   typedef struct ControlledError_s {
       any
           soft,
           code
   ;
   } ControlledError_s;
   
   extern void ControlledError__init(DEFAULT_ARGUMENTS);
#endif