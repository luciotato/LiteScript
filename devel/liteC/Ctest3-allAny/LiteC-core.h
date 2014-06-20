/*
 * Author: ltato
 *
 *
 */

#ifndef LITEC_CORE_H
#define LITEC_CORE_H

#include "util.h"
#include "any.h"
#include "exceptions.h"


    extern any String__init(any this, any args);

    extern str _toStr(any o); //converts core values only
    extern str _anyValuePtr_toStr(anyValue* this, TypeID type); //to call on any native prop


//------------------------
// export helper functions
// new - mem_alloc mem space
// and init Object properties (first part of memory space)

    extern any new(TypeID type, any args);

    extern any _newErr(str message);

    extern void throwErr(str message);
    extern void _throw_noMethod(TypeID type, str methodName);

    extern void LiteC_registerCoreClasses();

    extern void __registerClass(
                TypeID requiredID,
                str name,
                TypeID super, //proto type ID. Which type this type extends
                function_ptr initFn,
                size_t instanceSize
                );

//------------------------
// export core class methods

    extern any _uptoString_concat(any this, any arguments);

    extern any String_toString(any this, any arguments);
    extern any String_indexOf(any this, any arguments);
    extern any String_split(any this, any arguments);
    extern any String_slice(any this, any arguments);
    extern any String_concat(any this, any arguments);

    extern any Array_toString(any this, any arguments);
    extern any Array_push(any anyThis, any anyArgs);
    extern any Array_indexOf(any this, any arguments);
    extern any Array_slice(any this, any arguments);
    extern any Array_concat(any this, any arguments);

    extern any Map_toString(any anyThis, any anyArgs); //Map = js Object, array of props
    extern any Map_get(any anyThis, any anyArgs); //Map = js Object, array of props
    extern any Map_has(any anyThis, any anyArgs); //Map = js Object, array of props
    extern any Map_set(any anyThis, any anyArgs); //Map = js Object, array of props
    extern any Map_delete(any anyThis, any anyArgs); //Map = js Object, array of props
    extern any Map_clear(any anyThis, any anyArgs); //Map = js Object, array of props

    extern any Error_toString(any anyThis, any anyArgs);

    extern void print(any arguments);


//-------
// ClassInfo

    struct ClassInfo {
        str       name;         // type name
        function_ptr  __init;       // executable initialization code
        size_t    instanceSize; // size de la struct que crea
        TypeID   super;        // super type

    };

    extern struct ClassInfo* CLASSES;

# endif
