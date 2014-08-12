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

    typedef const char* str;

    typedef uint16_t class_t; //2-bytes, max 64k different classes
    typedef uint16_t reserved_t; //2-bytes, reserved space - res+class:4 -bytes

    typedef uint32_t len_t; //array index & length. UINT32_MAX = 4,294,967,296
    #define MAX_LEN_T UINT32_MAX;
    // max 4 billion elements in an array
    // max string bytelen is 4GB  (use Buffer for >4GB)

    typedef struct Any_struct * any_ptr;

    //forward - shortcuts for core
    typedef struct Class_s * Class_ptr;
    typedef struct Error_s * Error_ptr;
    typedef struct Array_s * Array_ptr;
    typedef struct Map_s * Map_ptr;
    typedef struct Function_s * Function_ptr;
    typedef struct Buffer_s * Buffer_ptr;
    typedef struct ConcatdItem_s * ConcatdItem_ptr;
    typedef struct Iterable_Position_s * IterablePos_ptr;
    typedef struct __instance_s * __instance_ptr;

    /**
     * all vars values are stored in anyValue_union
     */
    typedef union anyValue_union {
        void* ptr; ///<generic ptr, default union property
        any_ptr prop; ///<"prop" (pointer to instance)

        // native property values
        double number;
        uint64_t uint64;
        int64_t int64;
        time_t time;

        // shortcuts for core methods
        str str; ///<ptr to const char. WARNING slices are NOT null terminated - do not use C-string functions
        char* charPtr; ///<ptr to non-const char. WARNING slices are NOT null terminated - do not use C-string functions
        ConcatdItem_ptr slices; ///<String mode:ConcatdSlices - array of ConcatdItem_s
        Class_ptr classPtr; ///corresponding Class_s in CLASSES[]
        Array_ptr arr; ///<if class Array
        Error_ptr err; ///<if class Err
        Map_ptr map; ///<if class Map
        Buffer_ptr buf; ///<if class Buffer
        IterablePos_ptr iterPos; //iteratorPos (cursor)

        // to help debugging
        __instance_ptr instance; ///<generic instance pointer, to ease debug

    } anyValue;

    /**
     * all vars are Any_struct
     */
    typedef struct Any_struct {
        class_t class;  /**< 2-byte - CLASSES[class] defines the model for the memory space pointed by .value.property */
        reserved_t res; /**< 2-byte - reserved units of memory - byteLen=MEMUNITSIZE*.res - MEMUNITSIZE=64 (bytes)
                         * for Strings: .res=0 for simple string, res>0 for ConcatdSlices
                         * for Number: .res=0 =>value.number .res=1 => .value.int64
                         * for ImmArray: .res= reserved units of memory
                         * for large ConcatdStrings & large ImmArrays
                         *   .len*sizeOf(x) can be > MEMUNITSIZE*.res
                         *   in those cases, mem is realocd on each push/pop
                         */
        len_t len;      /**< 4-byte - count of items at memory pointed by .value.ptr
                         * for Strings: .len = byteSize - allow Strings to be char-slices (better performance)
                         * for Array: .len = item count, and byteSize = len*sizeof(any)
                        */
        anyValue value; /**< 8-byte - union. default is .ptr, can be also .str or .number*/
    } any;

    #define var any // "var" is alias for "any"

    typedef unsigned char byte;

    #define DEFAULT_ARGUMENTS any this, len_t argc, any *arguments

    // function_ptr is a ptr to: any function(any this,any args)
    typedef any (*function_ptr)(DEFAULT_ARGUMENTS);
    // __initFn_ptr is a ptr to: void function(any this,any args) for constructors
    typedef void (*__initFn_ptr)(DEFAULT_ARGUMENTS);

    typedef any any_arr[]; // to define literal arrays

    // convert to str
    extern str _int32ToStr(int32_t a);
    extern str _int64ToStr(int64_t a);
    extern str _uint32ToStr(uint32_t a);
    extern str _uint64ToStr(uint64_t a);
    extern str _numberToStr(double a);

    extern str strclone(str src);
    extern str _byteslice(str src, int64_t start, int64_t end);

#ifdef	__cplusplus
}
#endif

#endif	/* ANY_H */

