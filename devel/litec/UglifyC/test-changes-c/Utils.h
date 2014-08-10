#ifndef UTILS_C__H
#define UTILS_C__H
#include "_dispatcher.h"
//-------------------------
//Module Utils
//-------------------------
extern void Utils__moduleInit(void);
extern any Utils_characters(DEFAULT_ARGUMENTS);
extern any Utils_member(DEFAULT_ARGUMENTS);
extern any Utils_find_if(DEFAULT_ARGUMENTS);
extern any Utils_repeat_string(DEFAULT_ARGUMENTS);
extern any Utils_push_uniq(DEFAULT_ARGUMENTS);
extern any Utils_remove(DEFAULT_ARGUMENTS);
extern any Utils_makePredicate(DEFAULT_ARGUMENTS);
extern any Utils_isPredicate(DEFAULT_ARGUMENTS);
extern any Utils_all(DEFAULT_ARGUMENTS);
#endif
