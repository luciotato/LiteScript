#ifndef _DISPATCHER_C_H
#define _DISPATCHER_C_H
#include "LiteC-core.h"
#include "Core2.h"
// LIBRARY INIT
extern void LiteC__init();
// method dispatchers
extern any indexOf(any this, any arguments);
extern any sliceJoin(any this, any arguments);
extern any toString(any this, any arguments);
extern any concat(any this, any arguments);
extern any slice(any this, any arguments);
extern any split(any this, any arguments);
extern any push(any this, any arguments);
#endif