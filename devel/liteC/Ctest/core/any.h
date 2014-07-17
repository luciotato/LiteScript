/*
 * File:   any.h
 * Author: Lucio M. Tato
 *
 */

#ifndef ANY_H
#define	ANY_H

    #include "util.h"

#ifdef	__cplusplus
extern "C" {
#endif

    typedef char* str;

    typedef uint32_t len_t; //array index & length

    // relative pos of property from instance base is uint16_t.
    // A instance can have 2^16-1 properties.
    typedef uint16_t _posTableItem_t;
    #define INVALID_PROP_POS 0xFFFF // 0xFFFF means "this intance have no such property"

    typedef struct Any_struct * any_ptr;

    //forward - shortcuts for core
    typedef struct Class_s * Class_ptr;
    typedef struct Error_s * Error_ptr;
    typedef struct Array_s * Array_ptr;
    typedef struct Function_s * Function_ptr;
    typedef struct Buffer_s * Buffer_ptr;
    typedef struct __instance_s * __instance_ptr;

    typedef union anyValue_union {
        void* ptr; //generic ptr, default union property
        any_ptr prop; // "prop" (pointer to instance)

        // native property values
        str str; // char*, string
        double number;
        uint64_t uint64;
        time_t time;

        // shortcuts for core methods/to help debugging
        Class_ptr classINFOptr; //classINFO ptr
        Array_ptr arr; //if class Array ptr
        Error_ptr err; //if class Err
        __instance_ptr instance; //generic instance pointer, to ease debug

    } anyValue;

    typedef struct Any_struct {
        Class_ptr class; //*class defines the model for the memory space pointed by .value.property
        anyValue value; //union. default is any_arr, can be also .str or .number
    } any;

    #define var any // "var" is alias for "any"

    typedef unsigned char byte;

    #define DEFAULT_ARGUMENTS any this, len_t argc, any *arguments

    // function_ptr is a ptr to: any function(any this,any args)
    typedef any (*function_ptr)(DEFAULT_ARGUMENTS);
    // __initFn_ptr is a ptr to: void function(any this,any args) for constructors
    typedef void (*__initFn_ptr)(DEFAULT_ARGUMENTS);

    typedef any any_arr[]; // to define literal arrays

    extern str EMPTY_STR;

    extern int _falsey(any a);

    #define any_TRUE ((any){TYPE_BOOL,.value.int32=1})
    #define any_FALSE ((any){TYPE_BOOL,.value.int32=0})

    #define any_isInt(a) (a.type>=TYPE_INT32 && a.type<=TYPE_UINT64)
    #define any_isNumeric(a) (a.type>=TYPE_INT32 && a.type<=Number_TYPEID)

    //defines to ease reading of generated code
    #define AS(Type,propAny) ((Type##_ptr)propAny.value.ptr)
    #define TO_ANY(Type,paramPtr) ((any){Type,{.ptr=paramPtr}})

    extern len_t utf8len(str s);
    extern int64_t utf8indexFromPtr(str s, str ptr);
    extern str utf8index(str s, int64_t index);
    extern int64_t utf8indexOf(str source, str searched, int64_t fromIndex);
    extern int64_t utf8lastIndexOf(str source, str searched, int64_t fromIndex);
    extern str utf8slice(str s, int64_t startPos, int64_t endPos);

    extern bool __is(any a,any b); //js ===, compare values, retuen true|false
    extern any __or(any a,any b); //js || => return a.value.uint64? a : b ;

    extern str _int32ToStr(int32_t a);
    extern str _int64ToStr(int64_t a);
    extern str _uint32ToStr(uint32_t a);
    extern str _uint64ToStr(uint64_t a);
    extern str _numberToStr(double a);

    // convert to Number
    //extern any Number(DEFAULT_ARGUMENTS);

    #define TRUNCkb(X) ( (X+(1<<10))>>10<<10 )

    extern any _newStrSize(size_t size);

    extern str strclone(str src);
    extern str _byteslice(str src, int64_t start, int64_t end);

#ifdef	__cplusplus
}
#endif

#endif	/* ANY_H */

