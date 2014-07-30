#ifndef LIB_UNIQUEID_C__H
#define LIB_UNIQUEID_C__H
#include "../_dispatcher.h"
//-------------------------
//Module UniqueID
//-------------------------
extern void UniqueID__moduleInit(void);
extern any UniqueID_set(DEFAULT_ARGUMENTS);
extern any UniqueID_get(DEFAULT_ARGUMENTS);
extern any UniqueID_getVarName(DEFAULT_ARGUMENTS);
#endif
