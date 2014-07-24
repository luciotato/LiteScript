/*
 * File:   PMREX-native.h
 * Author: ltato
 *
 */

#ifndef PMREX_NATIVE_H
#define	PMREX_NATIVE_H

#ifdef	__cplusplus
extern "C" {
#endif

#include "LiteC-core.h"

//-------------------------
//Module PMREX
// PMREX, poor's man RegEx
//-------------------------
extern any PMREX_whileRanges(DEFAULT_ARGUMENTS);
extern any PMREX_findRanges(DEFAULT_ARGUMENTS);
extern any PMREX_whileUnescaped(DEFAULT_ARGUMENTS);
extern any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS);

#ifdef	__cplusplus
}
#endif

#endif	/* PMREX_NATIVE_H */

