#ifndef LIB_PMREX_C__H
#define LIB_PMREX_C__H
#include "../_dispatcher.h"
//-------------------------
//Module PMREX
//-------------------------
extern void PMREX__moduleInit(void);
extern any PMREX_whileRanges(DEFAULT_ARGUMENTS);
extern any PMREX_findRanges(DEFAULT_ARGUMENTS);
extern any PMREX_whileUnescaped(DEFAULT_ARGUMENTS);
extern any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS);
#endif
