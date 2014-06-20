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

    typedef uint16_t TypeID;
    typedef uint32_t length_t;

    enum TypeID_enum {

        UNDEFINED = 0,
        TYPE_NULL,
        TYPE_BOOLEAN,
        TYPE_TypeID, /*use value.typeID, TypeID, uint32_t*/
        TYPE_INT32,
        TYPE_UINT32,
        TYPE_INT64,
        TYPE_UINT64,
        Number, /*js "number" */

        String, /* use lenght, const char* value.str -> C string */
        Array, /* use lenght, any* value.item */

        /* start of classes */

        Error,
        Function,
        Map,
        Object      /* bag of properties, map string=>any */
    };
    #define LAST_CORE_CLASS Error

    //forward - shortcuts for core
    typedef struct any_s * any_ptr;
    typedef struct Error_s * Error_ptr;

    typedef union anyValue_union {

        int32_t int32;
        uint32_t uint32;
        int64_t int64;
        uint64_t uint64;
        int boolean;
        double number;

        TypeID type; /*type ID*/

        str str; //String's C str
        any_ptr item; //array items
        char* ptr;

    } anyValue;

    typedef struct any_s {
        TypeID constructor;
        length_t length;
        anyValue value;
    }
        any;

    typedef any var;

    typedef any any_arr[];

    // function_ptr is a ptr to: any function(any this,any args)
    typedef any (*function_ptr)(any this,any args);

    //declare:
    // struct-Error = struct with instance properties
    // Error = ptr to struct-Error
    typedef struct Error_s {
        any message;
        any name;

    } * Error_ptr;


    #define thruty(a) (a.value.int64)
    #define falsey(a) (a.value.int64)

    #define any_isInt(a) (a.constructor>=TYPE_INT32 && a.constructor<=TYPE_UINT64)
    #define any_isNumeric(a) (a.constructor>=TYPE_INT32 && a.constructor<=Number)

    extern str EMPTY_STR;

    extern const any undefined;
    extern const any any_EMPTY_STR;
    extern const any EMPTY_ARGS;

    extern any any_str(str s);

    #define any_int(S) (any){TYPE_INT32,0,{.int32=S}}
    #define any_uint(S) (any){TYPE_UINT32,0,{.uint32=S}}
    #define any_number(S) (any){Number,0,{.number=S}}
    #define any_typeID(S) (any){TYPE_TypeID,0,{.type=S}}
    #define any_function(S) (any){Function,0,{.func=S}}

    //defines to ease reading of generated code
    #define AS(Type,propAny) ((Type##_ptr)propAny.value.ptr)
    #define TO_ANY(Type,paramPtr) (any){Type,0,.value.ptr=paramPtr}

    extern size_t utf8len(str s);
    extern size_t utf8indexFromPtr(str s, str ptr);
    extern size_t utf8indexOf(str source, str searched, size_t fromIndex);
    extern str utf8slice(str s, int64_t startPos, int64_t endPos);

    extern bool __is(any a,any b); //js ===

    extern str _int32ToStr(int32_t a);
    extern str _int64ToStr(int64_t a);
    extern str _uint32ToStr(uint32_t a);
    extern str _uint64ToStr(uint64_t a);
    extern str _numberToStr(double a);

    #define _intToStr _int32ToStr

    extern int64_t anyToInt64(any a);
    extern double anyToNumber(any a);

    extern str anyToStr(any this);

    extern str __concatToNULL(str first,...);



#ifdef	__cplusplus
}
#endif

#endif	/* ANY_H */

