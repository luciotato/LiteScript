/*
 * File:   main.c
 * Author: ltato
 *
 */

#ifndef SCRIPTYC_CORE1
#define SCRIPTYC_CORE1

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

#include "util.h"


//forward declarations
//-------------

    typedef struct Object_t * Object;
    typedef struct Class_t * Class;

    // "method" is ptr to "Object function(Object)"
    typedef Object (*method)(Object);
    // "initFn_t" is ptr to "void function(Object)"
    typedef void (*initFn_t)(Object);

//-------
// Object

//Object

    //methods jmp table type
    struct Object__METHODS_t {
        str (*toString)(Object); // toString: ptr to: str function(Object)
    };


    // common object header fields macro
    #define OBJ_COMMON_HEADER(METHODS_STRUCT) \
        Class class; \
        const struct METHODS_STRUCT * call;

    //Object instance properties
    struct Object_t {
        OBJ_COMMON_HEADER(Object__METHODS_t)
    };

// Class

    //instance properties
    struct Class_t {
        OBJ_COMMON_HEADER(Object__METHODS_t);
        //
        str       name;         // class name
        initFn_t  __init;       // executable initialization code
        size_t    instanceSize; // size de la struct que crea
        struct Object__METHODS_t * methods;// ptr to jmp table
        Class     super;        // super class
    };

//export instantiated class info and a const ptr to it.

    //Object: instantiated class info and a const ptr to it
    extern struct Class_t Object__CLASS_I;
    extern const Class Object__CLASS;

    //Class: instantiated class info and a const ptr to it
    extern struct Class_t Class__CLASS_I;
    extern const Class Class__CLASS;


//--------------

    struct TEST_METHODS
    {
      void (*func0)(void); //func0: *(void function(void))
      void (*func1)(void);
    };
    typedef struct TEST_METHODS * TEST_METHODS;

    //export instantiated jmp table
    extern struct TEST_METHODS TEST_METHODS_I;

//--------------
// export helper functions
// new - alloc mem space
// and init Object properties (first part of memory space)

    extern Object new(Class classInfo);

# endif
