/*
 * Author: ltato
 */

#ifndef LITEC_CORE_H
#define LITEC_CORE_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdarg.h>

#include "util.h"

#include "exceptions.h"

typedef enum ClassID {

    NO__CLASS = 0,
    Object__CLASS,
    Class__CLASS,
    String__CLASS,
    Array__CLASS,
    Error__CLASS

} ClassID;


//-------
// Object

    //declare:
    // struct-Object = struct with instance properties
    // Object = ptr to struct-Object
    typedef struct Object {
        ClassID class;
    } * Object;

// initFn_t is a ptr to: void function(Object)
    typedef const Object (*initFn_t)(Object);

//-------
// Class

    //declare:
    // struct-Class = struct with instance properties
    // Class = ptr to struct-Class
    typedef struct Class {
        ClassID   class;            // asObject: always ClassInfo_CLASS
        str       name;         // class name
        initFn_t  __init;       // executable initialization code
        size_t    instanceSize; // size de la struct que crea
        ClassID   super;        // super class

    } * Class;

//-------
// String

    //declare:
    // struct-String = struct with instance properties
    // String = ptr to struct-String
    typedef struct String {
        ClassID   class;        // asObject: always String_CLASS
        str       value;        // str contents
        size_t    length;       // size

    } * String;


//-------
// Array

    //declare:
    // struct-Array = struct with instance properties
    // String = ptr to struct-Array
    typedef struct Array {
        ClassID   class;       // asObject: always Array_CLASS
        Object*   item;        // Object items base pointer
        size_t    size;        // array memory size
        size_t    length;      // # of elements
        ClassID   itemClass;   // Class_ID of each item

    } * Array;

//-------
// Error

    //declare:
    // struct-Error = struct with instance properties
    // Error = ptr to struct-Error
    typedef struct Error_s {
        ClassID   class;       // asObject: always Array_CLASS
        str         message;
        str         name;

    } * Error;


//------------------------
// export helper functions
// new - alloc mem space
// and init Object properties (first part of memory space)

    extern Object new(ClassID classID);

    //create a String from a const char *
    extern String mkString(str value);

    extern int __is(void* a,void* b); //js ===

    extern void LiteC_registerCoreClasses();
    extern uint32_t __registerClass(
                str name,
                ClassID super, //proto class ID. Which class this class extends
                void* initFn,
                size_t instanceSize
                );

//------------------------
// export core dispatchers

    extern String toString(Object this);

    extern struct Array CLASSES_ARRAY;
    extern Class* CLASSES;

# endif
