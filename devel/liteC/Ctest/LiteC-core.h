/*
 * File:   main.c
 * Author: ltato
 *
 */

#ifndef LITEC_CORE
#define LITEC_CORE

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdarg.h>

#include "util.h"

//-------
// forward declare
// Class is a ptr to 'struct-Class'
    typedef struct Class * Class;

//-------
// Object

    //declare:
    // struct-Object = struct with instance properties
    // Object = ptr to struct-Object
    typedef struct Object {
        Class class;

    } * Object;

// initFn_t is a ptr to: void function(Object)
    typedef const Object (*initFn_t)(Object);

//-------
// Class

    //declare:
    // struct-Class = struct with instance properties
    // Class = ptr to struct-Class
    typedef struct Class {
        Class     class;            // asObject: always Class_CLASS_I
        str       name;         // class name
        initFn_t  __init;       // executable initialization code
        size_t    instanceSize; // size de la struct que crea
        Class     super;        // super class

    } * Class;

//-------
// String

    //declare:
    // struct-String = struct with instance properties
    // String = ptr to struct-String
    typedef struct String {
        Class     class;        // asObject: always Class_CLASS_I
        str       value;        // str contents
        size_t    length;       // size

    } * String;


//-------
//export ptrs to instantiated class info

    extern const Class Object__CLASS;
    extern const Class Class__CLASS;

    extern struct Class String__CLASS_DATA;
    extern const Class String__CLASS;

//------------------------
// export helper functions
// new - alloc mem space
// and init Object properties (first part of memory space)

    extern Object new(const Class classInfo);

    //create a String from a const char *
    extern String mkStr(str value);

//------------------------
// export core dispatchers

    extern String toString(Object this);

# endif
