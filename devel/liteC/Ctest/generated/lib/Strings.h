#ifndef LIB_STRINGS_C__H
#define LIB_STRINGS_C__H
#include "../_dispatcher.h"
//-------------------------
//Module Strings
//-------------------------
extern void Strings__moduleInit(void);
   extern any String_startsWith(DEFAULT_ARGUMENTS);
   extern any String_endsWith(DEFAULT_ARGUMENTS);
   extern any String_trimRight(DEFAULT_ARGUMENTS);
   extern any String_trimLeft(DEFAULT_ARGUMENTS);
   extern any String_capitalized(DEFAULT_ARGUMENTS);
   extern any String_countSpaces(DEFAULT_ARGUMENTS);
   extern any String_quoted(DEFAULT_ARGUMENTS);
   extern any String_rpad(DEFAULT_ARGUMENTS);
   extern any Array_remove(DEFAULT_ARGUMENTS);
   //-------------------------
   // namespace Strings
   //-------------------------
       extern any Strings_spaces(DEFAULT_ARGUMENTS);
       extern any Strings_repeat(DEFAULT_ARGUMENTS);
       extern any Strings_isCapitalized(DEFAULT_ARGUMENTS);
       extern any Strings_findMatchingPair(DEFAULT_ARGUMENTS);
       extern any Strings_replaceQuoted(DEFAULT_ARGUMENTS);
#endif