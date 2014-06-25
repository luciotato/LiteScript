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
    typedef uint32_t len_t;

    enum TypeID_enum {

        MISSING = 0, //not initialized, parameter not set, "this" in global function calls
        UNDEFINED,
        TYPE_NULL,
        TYPE_BOOL,
        TYPE_TypeID, /*use value.typeID, TypeID, uint32_t*/
        TYPE_INT32,
        TYPE_UINT32,
        TYPE_INT64,
        TYPE_UINT64,

        // core pseudo-classes
        Number_TYPEID, // js "number"
        String_TYPEID, // utf-8, inmutable, lenght=count(codepoints), const char* value.str -> C string
        console_TYPEID,
        process_TYPEID,

        // core classes
        Array_TYPEID, // ->{len_t length,any*} mutable
        Buffer_TYPEID, // ->{size_t size,char*}, mutable, size=used size, char* value.ptr -> C string
        Error_TYPEID,
        Function_TYPEID,
        Map_TYPEID,
        Object_TYPEID  // bag of properties, map string=>any
    };
    #define LAST_CORE_CLASS Error_TYPEID

    //forward - shortcuts for core
    typedef struct any_s * any_ptr;
    typedef struct Error_s * Error_ptr;
    typedef struct Array_s * Array_ptr;
    typedef struct Buffer_s * Buffer_ptr;

    typedef union anyValue_union {

        int32_t int32;
        uint32_t uint32;
        int64_t int64;
        uint64_t uint64;
        int32_t boolean;
        double number;

        TypeID typeID; /*type ID*/

        str str; //String's C str
        Array_ptr arr; //array items
        char* ptr;

    } anyValue;

    typedef struct any_s {
        TypeID type;
        anyValue value;
    }any;

    typedef struct Array_s {
        len_t length;
        any* item;
    } Array_s;

    typedef struct Buffer_s {
        size_t used;
        char* ptr;
    } Buffer_s;

    typedef any var; //alias

    typedef any any_arr[]; // to define literal arrays

    #define DEFAULT_ARGUMENTS  any this, len_t argc, any *arguments 

    // function_ptr is a ptr to: any function(any this,any args)
    typedef void (*__init_ptr)(DEFAULT_ARGUMENTS);
    typedef any (*function_ptr)(DEFAULT_ARGUMENTS);

    //declare:
    // struct-Error = struct with instance properties
    // Error = ptr to struct-Error
    typedef struct Error_s {
        any message;
        any name;
        any extra; //Map, extra data
    } * Error_ptr;

   typedef struct process_s {
       any argv;
   } * process_ptr;

    extern str EMPTY_STR;

    #define NONE ((any){MISSING,.value.uint64=0})
    #define undefined ((any){UNDEFINED,.value.uint64=0})
    #define any_EMPTY_STR ((any){String_TYPEID,.value.str=EMPTY_STR})

    extern int anyToBool(any a);
    extern int falsey(any a);

    extern int RegExp_test(any a, str pattern);

    #define any_TRUE ((any){TYPE_BOOL,.value.int32=1})
    #define any_FALSE ((any){TYPE_BOOL,.value.int32=0})

    #define any_isInt(a) (a.type>=TYPE_INT32 && a.type<=TYPE_UINT64)
    #define any_isNumeric(a) (a.type>=TYPE_INT32 && a.type<=Number_TYPEID)

    #define any_str(S) ((any){String_TYPEID,.value.str=S}) // Note: "" is NOT FALSEY. (add: .value.str=(S[0]=='\0'?NULL:S))
    #define any_int32(S) ((any){TYPE_INT32,.value.int32=S})
    #define any_uint32(S) ((any){TYPE_UINT32,.value.uint32=S})
    #define any_number(S) ((any){Number_TYPEID,.value.number=S})
    #define any_typeID(S) (any){TYPE_TypeID,.value.type=S})
    #define any_function(S) ((any){Function_TYPEID,.value.func=S})

    //defines to ease reading of generated code
    #define AS(Type,propAny) ((Type##_ptr)propAny.value.ptr)
    #define TO_ANY(Type,paramPtr) ((any){Type,{.ptr=paramPtr}})

    extern size_t length(any this);

    extern size_t utf8len(str s);
    extern size_t utf8indexFromPtr(str s, str ptr);
    extern size_t utf8indexOf(str source, str searched, size_t fromIndex);
    extern size_t utf8lastIndexOf(str source, str searched, size_t fromIndex);
    extern str utf8slice(str s, int64_t startPos, int64_t endPos);

    extern bool __is(any a,any b); //js ===, compare values, retuen true|false
    extern any __or(any a,any b); //js || => return a.value.uint64? a : b ;

    extern str _int32ToStr(int32_t a);
    extern str _int64ToStr(int64_t a);
    extern str _uint32ToStr(uint32_t a);
    extern str _uint64ToStr(uint64_t a);
    extern str _numberToStr(double a);

    extern int64_t anyToInt64(any a);
    extern double anyToNumber(any a);

    // convert to Number
    extern any Number(DEFAULT_ARGUMENTS);

    #define TRUNCkb(X) ( (X+(1<<10))>>10<<10 )

    extern Buffer_s _newBuffer();
    extern void _Buffer_add     (Buffer_s *dbuf, str ptr, size_t size);
    extern void _Buffer_addStr  (Buffer_s *dbuf, str s);
    extern void _Buffer_add0    (Buffer_s dbuf);

    extern any _newStrSize(size_t size);
    extern any _newStr(str src);

    extern str anyToStr(any this);

    extern str __concatToNULL(str first,...);

#ifdef	__cplusplus
}
#endif

#endif	/* ANY_H */

