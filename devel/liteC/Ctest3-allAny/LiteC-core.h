/*
 * Author: ltato
 *
 * Name of Class = TypeID
 * instance = Class_s (struct)
 * ptr = Class_ptr (pointer)
 *
 * When mentioned in code/passed as params, means TypeID (uint32)
 * When used as type => Class_t
 *
 */

#ifndef LITEC_CORE_H
#define LITEC_CORE_H

#include "util.h"
#include "any.h"
#include "exceptions.h"


// initFn_t is a ptr to: void function(Object)
    typedef any (*initFn_t)(any this,any args);

    extern any String__init(any this, any args);

    extern str _toStr(any o); //converts core values only
    extern str _anyValuePtr_toStr(anyValue* this, TypeID type); //to call on any native prop


//-------
// Array

    //declare:
    // struct-Array = struct with instance properties
    // String = ptr to struct-Array
    typedef struct Array_s {
        int32_t   length;     // # of elements
        any *     item;       // Object items base pointer
        size_t    size;       // elements alloc'd
        TypeID    itemClass;  // Class_ID of each item / UNDEFINED

    } * Array_ptr;

//-------
// Error

    //declare:
    // struct-Error = struct with instance properties
    // Error = ptr to struct-Error
    typedef struct Error_s {
        str         message;
        str         name;

    } * Error_ptr;


//------------------------
// export helper functions
// new - alloc mem space
// and init Object properties (first part of memory space)

    extern any new(TypeID type, any args);

    extern void _throw_noMethod(TypeID type, str methodName);

    extern void LiteC_registerCoreClasses();

    extern void __registerClass(
                TypeID requiredID,
                str name,
                TypeID super, //proto type ID. Which type this type extends
                initFn_t initFn,
                size_t instanceSize
                );

//------------------------
// export core dispatchers

    extern int _push(any o, any value);

    extern str Object_toString(any this);

    extern str Error_toString(Error_ptr this);

    extern str Array_toString(Array_ptr this);

    extern int Array_push(Array_ptr this, any value);


//-------
// ClassInfo

    struct ClassInfo {
        str       name;         // type name
        initFn_t  __init;       // executable initialization code
        size_t    instanceSize; // size de la struct que crea
        TypeID   super;        // super type

    };

    extern struct ClassInfo* CLASSES;

# endif
