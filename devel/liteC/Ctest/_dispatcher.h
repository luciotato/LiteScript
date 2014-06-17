#ifndef _DISPATCHER_H
#define _DISPATCHER_H
#include "Core2.h"
// LIBRARY INIT
extern void LiteC__init();
// method dispatchers
       extern void* indexOf(void* this,String searched, int fromIndex);
       extern void* sliceJoin(void* this,int start, int endPos);
#endif