/*
 * File:   util.h
 * Author: ltato
 *
 * Created on June 9, 2014, 3:47 AM
 */

#ifndef UTIL_H
#define	UTIL_H
#ifdef	__cplusplus
extern "C" {
#endif

    #include <stdio.h>
    #include <stdlib.h>
    #include <string.h>
    #include <stdint.h>
    #include <stdarg.h>
    #include <assert.h>
    #include <limits.h>
    #include <inttypes.h>
    #include <ctype.h>
    #include <time.h>
    #include <math.h>

    typedef int bool;
    #define TRUE 1
    #define FALSE 0

    #include "gc.h"

    extern void* mem_alloc(size_t size);
    extern void* mem_realloc(void* ptr, size_t size);


#ifdef	__cplusplus
}
#endif
#endif	/* UTIL_H */
