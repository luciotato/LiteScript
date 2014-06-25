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

#include <unistd.h> //cwd

    extern any String__init(DEFAULT_ARGUMENTS);

    extern any any_concat(DEFAULT_ARGUMENTS);
    extern any _stringJoin(str initial, int32_t argc, any* arguments, str separ);

    extern any _apply_function(function_ptr fn, any this, any args);

//------------------------
// export helper functions
// new - mem_alloc mem space
// and init Object properties (first part of memory space)

    extern any new(TypeID type, len_t argc, any* arguments);

    extern any _newErr(str message);
    extern any _noMethod(TypeID type, str method);

    extern any _newArray(void);
    extern any _newArrayWith(len_t initialLen, any* optionalValues);
    extern any _newArrayFromCharPtrPtr(len_t argc, char** argv);

    //-- array index access [] with bound checks
    extern any __getItem(any this, double index);

    extern void LiteC_registerCoreClasses();

    extern void __registerClass(
                TypeID requiredID,
                str name,
                TypeID super, //proto type ID. Which type this type extends
                __init_ptr initFn,
                size_t instanceSize
                );

//------------------------
// export core class methods

    extern any _default_toString(DEFAULT_ARGUMENTS);

    extern any String_indexOf(DEFAULT_ARGUMENTS);
    extern any String_lastIndexOf(DEFAULT_ARGUMENTS);
    extern any String_split(DEFAULT_ARGUMENTS);
    extern any String_slice(DEFAULT_ARGUMENTS);
    extern any String_concat(DEFAULT_ARGUMENTS);

    extern any Array_splice(DEFAULT_ARGUMENTS);
    extern any Array_pushConcat(DEFAULT_ARGUMENTS);
    extern any Array_push(DEFAULT_ARGUMENTS);
    extern any Array_unshift(DEFAULT_ARGUMENTS);
    extern any Array_pop(DEFAULT_ARGUMENTS);
    extern any Array_indexOf(DEFAULT_ARGUMENTS);
    extern any Array_lastIndexOf(DEFAULT_ARGUMENTS);
    extern any Array_slice(DEFAULT_ARGUMENTS);
    extern any Array_concat(DEFAULT_ARGUMENTS);
    extern any Array_join(DEFAULT_ARGUMENTS);

    extern any Map_toString(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_get(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_has(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_set(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_delete(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_clear(DEFAULT_ARGUMENTS); //Map = js Object, array of props

    extern any _toString(DEFAULT_ARGUMENTS); //defined in user code

    extern any console;
    extern any console_log_(DEFAULT_ARGUMENTS);
    extern any console_error_(DEFAULT_ARGUMENTS);

    extern any process;
    extern any process_cwd(DEFAULT_ARGUMENTS);
    extern any process_exit_(DEFAULT_ARGUMENTS);

//-------
// ClassInfo

    struct ClassInfo {
        str       name;         // type name
        __init_ptr  __init;       // executable initialization code
        size_t    instanceSize; // size de la struct que crea
        TypeID   super;        // super type

    };

    extern struct ClassInfo* CLASSES;

# endif
