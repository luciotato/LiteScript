#ifndef _DISPATCHER_C__H
#define _DISPATCHER_C__H
#include "../core/LiteC-core.h"
// core support and defined classes init
extern void __declareClasses();
// methods
enum _VERBS { //a symbol for each distinct method name
    sliceJoin_ = -_CORE_METHODS_MAX-1,
_LAST_VERB};
// propery names
enum _THINGS { //a symbol for each distinct property name
    myArr_= _CORE_PROPS_LENGTH,
_LAST_THING};
#include "test.h"
#endif