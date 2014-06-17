/*
 * File:   any.h
 * Author: ltato
 *
 * Created on June 14, 2014, 5:46 AM
 */

#ifndef ANY_H
#define	ANY_H

    #include "util.h"

#ifdef	__cplusplus
extern "C" {
#endif

    typedef const char* str;

    typedef uint32_t TypeID;

    enum TypeID_enum {

        UNDEFINED = 0,
        TYPE_NULL,
        TYPE_0_STR, /* empty string, "", falsey */
        TYPE_BOOLEAN,
        TYPE_TypeID, /*use value.typeID, TypeID, uint32_t*/
        TYPE_INT32,
        TYPE_UINT32,
        TYPE_INT64,
        TYPE_UINT64,
        Number, /*js "number" */
        String, /* use value.str, const char*, C string */

        /* start of classes */

        Object, /* bag of properties, map string=>any */
        Function,
        Array,
        Error
    };
    #define LAST_CORE_CLASS Error

    //forward - shortcuts for core
    typedef struct Array_s * Array_ptr;
    typedef struct Error_s * Error_ptr;

    typedef union anyValue_union {
        int32_t int32;
        uint32_t uint32;
        int64_t int64;
        uint64_t uint64;
        int boolean;
        double number;
        char* ptr;
        str str;
        TypeID type; /*type ID*/
        Array_ptr array;
        Error_ptr error;
    } anyValue;

    typedef struct any_struct {
        TypeID constructor;
        anyValue value;
    } 
        any;

    #define thruty(a) a.value.int64
    #define falsey(a) !a.value.int64

    #define any_str(S) (any){String,{.str=S}}
    #define any_int(S) (any){TYPE_INT32,{.int32=S}}
    #define any_typeID(S) (any){TYPE_TypeID,{.type=S}}
    #define any_obj(S) (any){Object,{.ptr=S}}

    //defines to ease reading of generated code
    #define AS(Type,propAny) ((Type ## _ptr)propAny ## .value.ptr)
    #define TO_ANY(Type,paramPtr) (any){Type,.value.ptr=paramPtr}

    extern str EMPTY_STR;
    extern const any undefined;
    extern const any any_0_str;

    extern bool __is(any a,any b); //js ===

    extern str _int32ToStr(int32_t a);
    extern str _int64ToStr(int64_t a);
    extern str _uint32ToStr(uint32_t a);
    extern str _uint64ToStr(uint64_t a);
    extern str _numberToStr(double a);

    #define _intToStr _int32ToStr

    extern str __concatToNULL(str first,...);



#ifdef	__cplusplus
}
#endif

#endif	/* ANY_H */

