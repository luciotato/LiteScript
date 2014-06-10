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

    #include "gc.h"

    extern void fatal(char * msg);
    extern void* alloc(size_t size);
    extern void* realloc(void* ptr, size_t size);

//    typedef __uint64_t handle;
//    typedef __uint32_t uint32;


    #define false 0
    #define true 1
    #define bool int

//type str is a pointer to immutable strings

    typedef const char* str;

    extern str EMPTY;

    extern str __concatToNULL(str first,...);


#ifdef	__cplusplus
}
#endif
#endif	/* UTIL_H */

