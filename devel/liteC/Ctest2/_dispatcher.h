#ifndef _DISPATCHER_H
#define _DISPATCHER_H
#include "Core2.h"
// LIBRARY INIT
extern void LiteC__init();
// method dispatchers
       extern any indexOf(any this, any arguments);
       extern any sliceJoin(any this, any arguments);
#endif