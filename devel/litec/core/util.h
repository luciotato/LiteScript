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

    #define _XOPEN_SOURCE 500

    #include <unistd.h>
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

    typedef int bool;
    #define TRUE 1
    #define FALSE 0

    #ifdef NO_GC
        #define MALLOC malloc
        #define REALLOC realloc
        //#define GET_BLOCK_SIZE malloc_usable_size
    #elif G2
        #define MALLOC smalloc
        #define REALLOC srealloc
    #else
        #define MALLOC GC_malloc
        #define REALLOC GC_realloc
        #define GET_BLOCK_SIZE GC_size

        #include "gc.h"
    #endif

    extern void* mem_alloc(size_t size);
    extern void* mem_realloc(void* ptr, size_t size);


#ifdef	__cplusplus
}
#endif
#endif	/* UTIL_H */

