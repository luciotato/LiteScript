/*
 * Lite C core support
 *  * Author: Lucio Tato
 */

#ifndef LITEC_CORE_H
#define LITEC_CORE_H

#include "util.h"
#include "any.h"
#include "utf8strings.h"
#include "exceptions.h"
#include "PMREX-native.h"

    extern any LiteCore_version, LiteCore_buildDate;

    //type for symbols. Symbols are negative (methods) and positive(properties). Must be intX.
    typedef int16_t symbol_t; // max 32768 methods & 32768 props. Elevate to int32_t if needed
    typedef uint16_t propIndex_t;
    #define INVALID_PROP_POS (propIndex_t)0xFFFF // 0xFFFF means "this instance have no such property"
    // relative pos of property from instance base is uint16_t.
    // A instance can have 2^16-1 properties (65,535)
    // note: keep both the same byte size. assert(sizeof(symbol_t)==sizeof(_propIndex_t));

    // typedef for class's jmp table, and prop instance relative position table
    typedef function_ptr* jmpTable_t; // _jmpTable: array of function pointers (method code)
    typedef propIndex_t* posTable_t; // _posTable: array of uint16 (relative pos from instance base)
    #define TABLE_LENGTH(t) *((propIndex_t*)t) //first (propIndex_t) in jmpTable and posTable stores table length

//static common vars

    extern any
        any_EMPTY_STR
        ,any_COMMA, any_COLON
        ,any_QUOTE, any_SINGLE_QUOTE
        ,any_OPEN_BRACKET, any_CLOSE_BRACKET
        ,any_OPEN_CURLY, any_CLOSE_CURLY
    ;

// core instances -------------------
    extern any null, undefined, true, false, NaN, Infinity;

    #define any_LTR(S) (any){.class=String_inx, .res=0, .len=sizeof(S)-1, .value.str=S}
    #define any_slice(PTR,BYTELEN) (any){.class=String_inx, .res=0, .len=BYTELEN, .value.str=PTR}
    #define any_CStr(CSTR) any_slice(CSTR,strlen(CSTR))
    #define any_number(S) (any){.class=Number_inx, .res=0, .len=0, .value.number=S}
    #define any_int64(S) (any){.class=Number_inx, .res=1, .len=0, .value.int64=S}
    #define any_func(S) (any){.class=Function_inx, .res=0, .len=0, .value.ptr=(function_ptr)S}
    #define any_bool(S) (any){.class=Boolean_inx, .res=0, .len=0, .value.number= (S)!=0}
    #define any_class(CLASS_INX) any_CLASSES[CLASS_INX]

    //by ditching null-terminated strings, .slice becomes vert unexpensive, just a #define
    #define _slicedTo(ANY,TO) (any){.class=String_inx, .res=0, .len=TO, .value.str=ANY.value.str}
    #define _slicedFrom(ANY,FROM) (any){.class=String_inx, .res=0, .len=ANY.len-FROM, .value.str=ANY.value.str+FROM}

    // _symbol names
    extern symbol_t _allMethodsLength, _allPropsLength, _symbolTableLength;
    extern any * _symbolTable;
    extern any * _symbol; // table "center", symbol:0, String:"constructor"

    // LiteC_init
    extern void LiteC_init(int classesCount, int argc, char** CharPtrPtrargv);
    extern void LiteC_finish();
    extern void LiteC_addMethodSymbols(int addedMethods, str* _verb_table);
    extern void LiteC_addPropSymbols(int addedProps, str* _things_table);
    extern function_ptr LiteC_registerShim(any anyClass, symbol_t symbol, function_ptr fn);

    // symbol core functions
    extern symbol_t _tryGetSymbol(any name);
    extern int _hasProperty(any this, any name);
    extern any _getProperty(any this, symbol_t symbol );

    // get symbol (number) from Symbol name (string)
    // function LiteCore_getSymbol(symbolName:string) returns number
    extern any LiteCore_getSymbol(DEFAULT_ARGUMENTS);

    // get symbol name from Symbol (number)
    // function LiteCore_getSymbolName(symbol:number) returns string
    extern any LiteCore_getSymbolName(DEFAULT_ARGUMENTS);

    // helper struct to declare class methods
    typedef struct _methodInfoItem {
        symbol_t method;
        function_ptr function;
    } * _methodInfoItemPtr ;
    typedef struct _methodInfoItem _methodInfoArr[];

    // helper struct to declare class properties
    struct _propertyInfoItem {
        symbol_t symbol;
        propIndex_t pos;
    };
    typedef struct _propertyInfoItem _propertyInfoArr[];

    // core methods, negative ints - (only instance (virtual) methods. namespace methods do not need symbols)
    #define _CORE_METHODS_MAX 50 // means -1..-_CORE_METHODS_MAX are valid method symbols
    // means 1.._CORE_METHODS_MAX are used jmpTable indexes, so initial TABLE_LENGTH(jmpTable)=_CORE_METHODS_MAX+1
    // 0 is a reserved jmpTable index (TABLE_LENGTH is stored there), but symbol:0 is PROPERTY constructor:Class
    enum _CORE_METHODS_ENUM {
        push_ = -_CORE_METHODS_MAX
        ,pop_
        ,shift_
        ,unshift_
        ,join_
        ,splice_
        ,tryGet_
        ,sort_

        ,toISOString_
        ,toUTCString_
        ,toDateString_
        ,toTimeString_

        ,copy_  //Buffer
        ,write_
        ,append_

        ,slice_
        ,split_
        ,indexOf_
        ,lastIndexOf_
        ,concat_
        ,toLowerCase_
        ,toUpperCase_
        ,charAt_
        ,charCodeAt_
        ,replaceAll_
        ,trim_
        ,substr_
        ,countSpaces_
        ,repeat_

        ,byteSubstr_
        ,byteIndexOf_
        ,byteSlice_

        ,tryGetMethod_
        ,tryGetProperty_
        ,getProperty_
        ,getPropertyNameAtIndex_
        ,setProperty_
        ,hasProperty_
        ,hasOwnProperty_
        ,allPropertyNames_
        ,initFromObject_

        ,has_
        ,get_
        ,set_
        ,delete_
        ,clear_
        ,keys_

        ,iterableNext_  // Iterable Interface
        ,next_          //Iterable.Position.next()
        ,toString_

    ,_END_CORE_METHODS_ENUM //enum should reach 0 here.
    };

    // core property symbols
    enum _CORE_PROPERTIES_ENUM {
        constructor_, // always constructor is symbol:0 and prop[0]
        name_, //class name | NameValuePair
        initInstance_, //class __init:Function

        key_, // Iterable_Position
        value_, //NameValuePair | Iterable_Position
        index_, // Iterable_Position
        size_, // Map | Iterable_Position
        iterable_, // Iterable_Position
        extra_, // Iterable_Position

        message_, //error.message
        stack_, //error.stack
        code_, //error.code

    _CORE_PROPS_LENGTH
    };

    // a MACRO for each property name, to circumvent C-preprocessor problem with commas
    // and to be able to include foo__(this) as a parameter in a ITEM(arr,index) MACRO
    // e.g:
    // var value = ITEM( myArr__(this) , 12 )  <-- OK for C-preprocessor
    //
    // var value = ITEM( PROP(myArr_,this), 12 )  <-- NOT OK for C-preprocessor
    //

    #define name__(this) PROP(name_,this)
    #define key__(this) PROP(key_,this)
    #define value__(this) PROP(value_,this)
    #define index__(this) PROP(index_,this)
    #define iterable__(this) PROP(iterable_,this)
    #define size__(this) PROP(size_,this)
    #define extra__(this) PROP(extra_,this)
    #define message__(this) PROP(message_,this)
    #define stack__(this) PROP(stack_,this)
    #define code__(this) PROP(code_,this)

//-- access props, call methods

    extern function_ptr __classInxMethod(symbol_t symbol, class_t class);
    extern function_ptr __classMethod(symbol_t symbol, any anyClass);
    extern any __classMethodFunc(symbol_t symbol, any anyClass);

    #define NO_ARGS 0,NULL
    #define ARG1(A1) 1,(any_arr){A1}
    #define ARG2(A1,A2) 2,(any_arr){A1,A2}
    #define ARG3(A1,A2,A3) 3,(any_arr){A1,A2,A3}
    #define ARG4(A1,A2,A3,A4) 4,(any_arr){A1,A2,A3,A4}

    void _default(any* variable,any value);

//-------
// ClassInfo struct

    typedef struct Class_s * Class_ptr;
    typedef struct Class_s {
        any     name;         // class name
        any     initInstance; // :Function, __init function
        //private-native
        size_t      instanceSize; // sizeof struct holding instance props
        len_t       propertyCount; //set at declareProps
        class_t     classInx;     // index of this class in CLASSES[]
        class_t     super;        // index of super class in CLASSES[]
        jmpTable_t  method;       // jmp table for the class. method[-symbol] is function_ptr
        posTable_t  pos;          // relative property pos table for the class's instances
                                  //  .value.prop[pos[symbol]] is value for property named symbol
        posTable_t  symbolNames;  // table: prop index->symbol. Length is declaredPropsCount
    } Class_s;

/** known core classes (indexes into CLASSES[])
 *
 * ORDER IS IMPORTANT:
 * ------------------
 * Undefined_inx should be 0, so memset(0) means fill with "undefined" values.
 * AnyBoxedValue_inx = 1, first to be manually initialized - root for all other non-object values.
 * Object_inx = 2, second to be manually initialized - root for all object values (classes with instances)
 * Class_inx = 3, third to be manually initialized - type for vars holding a Class reference.
 *
 * In JS Classess & Functions are the same object.
 * All Classes are Functionn & all Functions are Classes.
 *
 * In LiteCore-C, Classes & Functions are different objects:
 *
 *      - var fn:Function. fn is a reference to executable code.
 *
 *      - var cl:Class. cl is a reference to a Class_s (an index into CLASSES[]).
 *
 */

    enum _KNOWN_CLASSES {
        Undefined_inx=0,
        NotANumber_inx=1, Null_inx=2,
        // .class<=Null_inx => "FALSEY"
        AnyBoxedValue_inx,
        Object_inx,
        Class_inx,
        Function_inx,
        String_inx, Number_inx, Integer_inx, Boolean_inx,
        Array_inx, Map_inx,
        NameValuePair_inx, Iterable_Position_inx,
        InfinityClass_inx,
        Date_inx, Error_inx, Buffer_inx,
        FileDescriptor_inx,

    _LAST_CORE_CLASS //end mark
    };


// core classes array: CLASSES-------------------

    #define ARRAY_OF(type,name) type* name

    extern len_t CLASSES_allocd;
    extern len_t CLASSES_len;
    extern ARRAY_OF(Class_s, CLASSES); //array of registered classes
    extern ARRAY_OF(any, any_CLASSES); //array of registered classes

// core classes.  Foo = (any){class=Class_inx, .res=0, .value.class = Foo_inx}
    extern any
        Undefined, Null, NotANumber, InfinityClass,
        Object, Class, Function,
        String, Number, Date,
        Array, Map, NameValuePair,
        Error, Buffer, Iterable_Position,
        FileDescriptor;

//-------
    // -- ConcatdSlices --
    // ConcatdSlices is an internal possible state of a String,
    // which is composed by an array of slices. By using Concatd
    // no memory is moved to concat strings.
    // A continuous string with NULL terminator can be requested by _toCString()
    // ConcatdSlices are also "commited" to a continuous string before string operations
    // like indexOf()
    typedef struct ConcatdItem_s * ConcatdItem_ptr;
    typedef struct ConcatdItem_s {
        str str;
        len_t byteLen ;
    } ConcatdItem_s;

    //NameValuePair
    typedef struct NameValuePair_s * NameValuePair_ptr;
    typedef struct NameValuePair_s {
        any name,value;
    } NameValuePair_s;

    extern any NameValuePair; //class object

    //Array
    typedef struct Array_s * Array_ptr;
    typedef struct Array_s {
        //private-native - array Object "properties" are (as in js arrays) the same array "items"
        union base{ // by default any*, but not always any*. see: itemSize
            any* anyPtr;
            NameValuePair_ptr nvp;
            char* bytePtr;
        } base;
        len_t length;
        len_t allocd; //# of items. bytes allocd = allocd*itemSize
        uint16_t itemSize; //by default sizeof(any) - but also sizeOf(NameValuePair) sizeOf(char*) for keytrees
                            // having a generic size allows to reuse _array_split _array_extend for any array
    } Array_s;
    extern any Array; //class object

    /** Unified get name-value pair at index
     *
     * to make js LiteralObjects and Maps interchangeable,
     * _unifiedGetNVPAtIndex(), if the object is a Map,
     * returns *MAP_NVP_PTR(index)
     * else returns a NameValuePair with decoded PropName and PropValue
    */
    extern NameValuePair_s
        _unifiedGetNVPAtIndex(any this, len_t index);

    //Key Tree
    //typedef struct KeyTreeSizesBranch * KeyTreeSizesBranch_ptr;
    typedef struct KeyTreeSortedBranch * KeyTreeSortedBranch_ptr;

    /*typedef struct KeyTreeSizesBranch{
        len_t maxLen;
        KeyTreeSortedBranch_ptr * ofSizeX;
    } KeyTreeSizesBranch_s;
     */

    typedef struct KeyTreeSortedBranch{
        int16_t keyLenHere; //measured in bytes
        Array_s keys; // size of key is: max(keyLenHere,8)
        Array_s values; // if keyLenHere<=8, values are indexes:len_t, else values are KeyTreeSortedBranch_ptr (next branch)
    } KeyTreeSortedBranch_s;

    enum KeyTreeAction{
        SET_KEY=0, //set value or insert if not found, return found, or value set
        FIND_OR_INSERT=1, //insert if not found - return found, or value inserted
        FIND_KEY=2, // return found or -1
        REMOVE_KEY=3 // return found or -1
    };

    extern Array_s _newKeyTreeRoot(len_t maxLen);
    extern int64_t _KeyTree_do(Array_ptr keyTreeRoot, byte what, any key, len_t index);
    extern void _initKeyTreeRootStruct(Array_s * arr, len_t maxLen);


    //Map
    typedef struct Map_s * Map_ptr;
    typedef struct Map_s {
        any size;
        Array_s nvpArr; // Array of NameValuePairs
        Array_s keyTreeRoot; // fast key search
    } Map_s;
    extern any Map; //class object

    // Error
    typedef struct Error_s * Error_ptr;
    typedef struct Error_s {
        any name;
        any message;
        any stack;
        any code;
    } Error_s;
    extern any Error;

    //Buffer
    typedef struct Buffer_s * Buffer_ptr;
    typedef struct Buffer_s {
        //private-native
        uint32_t allocd, used;
        char* ptr;
        char bufferInx,isMallocd;
    } Buffer_s;
    extern any Buffer; //class object

    //IterablePos
    typedef struct Iterable_Position_s * Iterable_Position_ptr;
    typedef struct Iterable_Position_s {
        any key,value,
            index,size,
            iterable,
            extra;
        }
    Iterable_Position_s;

//------------------------
// Access methods and properties
// direct, fast access if NDEBUG
// bound-checked access for debug mode

    #ifdef NDEBUG
        #define METHOD(symbol,this) (CLASSES[this.class].method[-symbol])
        #define PROP(symbol,this) this.value.prop[CLASSES[this.class].pos[symbol]]
        #define stack_PROP(this) PROP(stack_,this)
        #define PROP_PTR(symbol,this) &(this.value.prop[CLASSES[this.class].pos[symbol]])
        #define ARR_ITEM_PTR(TYPE,index,arrPtr) ((TYPE*)((arrPtr)->base.bytePtr+(index*(arrPtr)->itemSize)))
        #define ARR_ITEM(TYPE,index,arrPtr) *ARR_ITEM_PTR(TYPE,index,arrPtr)
        #define ITEM(anyArr,...) anyArr.value.arr->base.anyPtr[(len_t)(__VA_ARGS__)]
        //#define ITEM_PROP(index,symbol,this) this.value.prop[this.class.pos[symbol]].value.arr[index]
        #define MAP_NVP_PTR(index,this) (this.value.map->nvpArr.base.nvp+index)

        #define _anyToNumber(x) _convertAnyToNumber(x)
        #define int64_from_Number(ANY) (ANY.res? ANY.value.int64 : (int64_t)ANY.value.number)
        #define double_from_Number(ANY) (ANY.res? (double)ANY.value.int64:ANY.value.number)

    #else

        #define _anyToNumber(x) _anyToNumber_DEBUG(x,__FILE__, __LINE__, __func__, #x)
        #define int64_from_Number(ANY) (assert(ANY.class==Number_inx),(ANY.res? ANY.value.int64:(int64_t)ANY.value.number))
        #define double_from_Number(ANY) (assert(ANY.class==Number_inx),(ANY.res? (double)ANY.value.int64:ANY.value.number))

        // access a method on the instance
        #define METHOD(symbol,this) __method(symbol,this)
        extern function_ptr __method(symbol_t symbol, any this);
        // access a property of the instance
        #define PROP(prop,this) (*(__prop(prop,this,__FILE__, __LINE__, __func__, #this)))
        #define PROP_PTR(prop,this) __prop(prop,this,__FILE__, __LINE__, __func__, #this)
        extern any* __prop(symbol_t prop, any this, str file, int line, str func, str varName);
        // access arr[index]. Access item[index]
        #define ITEM(this,index) (*(__itemAny(index,this,__FILE__, __LINE__, __func__)))
        extern any* __itemAny(int64_t index, any this, str file, int line, str func);
        #define ARR_ITEM_PTR(TYPE,index,arrPtr) (TYPE*)__itemPtr(index,arrPtr,__FILE__, __LINE__, __func__)
        extern void* __itemPtr(int64_t index, Array_ptr arr, str file, int line, str func);
        #define ARR_ITEM(TYPE,index,arrPtr) *ARR_ITEM_PTR(TYPE,index,arrPtr)
        // access this.arr[index]. Access item[index] of a given property (type Array)
        //#define ITEM_PROP(index,prop,this) (*(__item(index,prop,this)))
        //extern any* __item2(int index, int prop, any this, str file, int line);
        // access map.array[index]. get a NVP by index, used to implement for each in map, w/o iterators
        #define MAP_NVP_PTR(index,this) _map_getNVP(index,this,__FILE__, __LINE__, __func__)
        extern NameValuePair_ptr _map_getNVP(int64_t index, any this, str file, int line, str func);
        #include <signal.h>
        extern void debug_abort(str file, int line, str func, any message);
    #endif

    #define MAPSIZE(ANYMAP) PROP(size_,ANYMAP).value.number

    extern any __call(symbol_t symbol, DEFAULT_ARGUMENTS);

    //__apply(func,n,{this,arg1,arg2,...})
    extern any __apply(any anyFunc, len_t argc, any* arguments);

    //__applyArr(func,2,{this,arrArguments})
    extern any __applyArr(any anyFunc, len_t argc, any* arguments);

    #define CALL(symbol,this) __call(symbol,this,0,NULL)
    #define CALL0(symbol,this) __call(symbol,this,0,NULL)
    #define CALL1(symbol,this,A1) __call(symbol,this,1,(any_arr){A1})

//------------------------
// export helper functions
// new() - mem_alloc mem space
//         and init Object properties (first part of memory space)

    extern any new(any class, len_t argc, any* arguments);

    extern any _newClass ( str className, __initFn_ptr initFn, len_t instanceSize, any super);

    extern any _newFromObject ( any anyClass, len_t argc, any* arguments);
    extern any _fastNew(any anyClass, len_t argc, ...);

    extern any _newStringSize(len_t memSize);
    extern any _newErr(any msg);

    extern any _newArray(len_t initialLen, any* optionalValues);
    extern any _newArrayFromCharPtrPtr(len_t argc, char** argv);
    extern any Array_clone(any this, len_t argc, any* arguments);

    //OPTIMIZED __is(a,b) //js triple-equal, "==="
    extern any __isA,__isB;
    extern bool __is2();

    #define __is(a,b) (((__isA=a).class!=(__isB=b).class)? FALSE \
                        : __isA.class==String_inx ? __is2() \
                        : __isA.value.uint64 == __isB.value.uint64 )

    /* explained
    # ((__isA=a).class!=(__isB=b).class)? FALSE \   //class differ? -> false
      : __isA.class==String_inx ? __is2() \         //both strings? -> compare strings (slow)
      : __isA.value.uint64 == __isA.value.uint64 )   //else, true if same number or points to same object
    */


    //OPTIMIZED _anyToBool(a)
    extern any __atb;
    extern int _anyToBool2(void);
    #define _anyToBool(expr) ((__atb=expr).class==String_inx?_anyToBool2():__atb.value.uint64)


    extern int64_t _length(any this);
    extern any _typeof(any this);
    //extern any _typeof(any this);
    extern bool _instanceof(any this, any class);
    extern bool __inLiteralArray(any needle, len_t haystackLength, any* haystackItem);
    extern int64_t __byteIndex(any needle, any haystack);
    extern int __compareStrings(any strA, any strB);  //js triple-equal, "==="

    extern int64_t _anyToInt64(any a);
    extern double _convertAnyToNumber(any a);
    extern double _anyToNumber_DEBUG(any this, str file, int line, str func,str argument);

    extern any parseFloat(DEFAULT_ARGUMENTS);
    extern any parseInt(DEFAULT_ARGUMENTS);

    extern any _concatAny(len_t argc,any arg,...);

    extern any _arrayJoin(any initial, len_t argc, any* item, any separ);

    extern any _newDate(time_t value);

    #ifndef NDEBUG
        //single fixed arg
        #define assert_arg(CLASS) {\
                if (argc!=1) debug_abort(__FILE__,__LINE__,__func__,any_LTR("expected one and only one argument"));\
                if (arguments[0].class!=CLASS.value.classPtr->classInx) debug_abort(__FILE__,__LINE__,__func__,any_LTR("argument should be class: " #CLASS));\
                }

        //multiple args
        typedef struct _assert_args_options { int req; int max; int control;} _assert_args_options;
        #define assert_args(...) _assert_args(this,argc,arguments,__FILE__,__LINE__,__func__, (_assert_args_options) __VA_ARGS__)
        void _assert_args(DEFAULT_ARGUMENTS, str file,int line,str func,  _assert_args_options options, any anyClass, ...);
    #else
        #define assert_arg(CLASS) (__ASSERT_VOID_CAST (0))
        #define assert_args(...) (__ASSERT_VOID_CAST (0))
    #endif

    extern Buffer_s _newBuffer();
    extern any Buffer_write(DEFAULT_ARGUMENTS);
    extern any Buffer_copy(DEFAULT_ARGUMENTS);
    extern any Buffer_byteLength(DEFAULT_ARGUMENTS); //as namespace method

    extern void _freeBuffer(Buffer_s *dbuf);
    extern void _Buffer_addBytes(Buffer_s *dbuf, str ptr, size_t size);
    extern void _Buffer_addStr  (Buffer_s *dbuf, str s);
    extern void _Buffer_concatToNULL(Buffer_s *dbuf, str arg,...);
    extern void _Buffer_add0    (Buffer_s *dbuf);
    void _Buffer_add(Buffer_s * dbuf, any a);
    extern any _Buffer_toString (Buffer_s *dbuf);

    #define ERRAT(TEXT) _errMsg( #TEXT ": ", sizeof(#TEXT ": "),__FILE__, __LINE__)
    extern void _errMsg(str message, len_t len, str file, int line);
    #define ERRCSTR(PRE,STR,POST) _errMsgAddQuoted(STR,strlen(STR))
    extern void _errMsgAdd(len_t len, str message);
    #define ERRANY(ANY) _errMsgAddAny(ANY)
    extern void _errMsgAddAny(any message);
    #define THROW _errThrow();
    extern void _errThrow();

    //-- concatdSlices helpers
    extern void _concatdSlicePush(any* c, str str, len_t len);
    extern len_t _pushToConcatd(any* c, any toPush);
    extern len_t _getConcatdCombinedSize(any s);
    extern len_t _copyConcatd(any s, char* buf, len_t bufLen);
    #define _FLATTEN(s) if(s.class==String_inx && s.res) s=_newCCompatString(s)
    extern any _newCCompatString(any source);
    void _toCStringCompatBuf(any s, char* buf, len_t bufSize);
    str _tempCString(any s);

//------------------------
// export core class methods

    // x_iterableNext
    void IterablePos__init(DEFAULT_ARGUMENTS);
    any Object_iterableNext(DEFAULT_ARGUMENTS);
    any Array_iterableNext(DEFAULT_ARGUMENTS);
    any Map_iterableNext(DEFAULT_ARGUMENTS);
    any String_iterableNext(DEFAULT_ARGUMENTS);

    // macro to call new(Iterable_Position...
    #define _newIterPos(ITERABLE) new(Iterable_Position,1,(any_arr){ITERABLE})
    extern int _iterNext(any iter, any* valueVar, any* keyVar, any* indexVar);

    // x_ToString
    extern any Object_toString(DEFAULT_ARGUMENTS);
    extern any Class_toString(DEFAULT_ARGUMENTS);
    extern any String_toString(DEFAULT_ARGUMENTS);
    extern any Number_toString(DEFAULT_ARGUMENTS);
    extern any Date_toString(DEFAULT_ARGUMENTS);
    extern any Error_toString(DEFAULT_ARGUMENTS);
    extern any Array_toString(DEFAULT_ARGUMENTS);
    extern any Map_toString(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any NameValuePair_toString(DEFAULT_ARGUMENTS);

    extern any Object_tryGetMethod(DEFAULT_ARGUMENTS); // from method symbol
    extern any Object_getProperty(DEFAULT_ARGUMENTS); // from prop symbol, throws
    extern any Object_tryGetProperty(DEFAULT_ARGUMENTS); // from prop symbol, returns undefined
    extern any Object_getPropertyNameAtIndex(DEFAULT_ARGUMENTS); // from prop index, throws if not found
    extern any Object_hasProperty(DEFAULT_ARGUMENTS); //from name, returns true or false
    extern any Object_hasOwnProperty(DEFAULT_ARGUMENTS); //from name, returns true or false
    extern any Object_setProperty(DEFAULT_ARGUMENTS); //from name, set property for object & Maps
    extern any Object_allPropertyNames(DEFAULT_ARGUMENTS);

    extern void Error__init(DEFAULT_ARGUMENTS);

    extern void String__init(DEFAULT_ARGUMENTS);

    extern any String_indexOf(DEFAULT_ARGUMENTS);
    extern any String_lastIndexOf(DEFAULT_ARGUMENTS);
    extern any String_split(DEFAULT_ARGUMENTS);
    extern any String_slice(DEFAULT_ARGUMENTS);
    extern any String_concat(DEFAULT_ARGUMENTS);
    extern any String_substr(DEFAULT_ARGUMENTS);
    extern any String_countSpaces(DEFAULT_ARGUMENTS);
    extern any String_toLowerCase(DEFAULT_ARGUMENTS);
    extern any String_toUpperCase(DEFAULT_ARGUMENTS);
    extern any String_charAt(DEFAULT_ARGUMENTS);
    extern any String_charCodeAt(DEFAULT_ARGUMENTS);
    extern any String_replaceAll(DEFAULT_ARGUMENTS);
    extern any String_repeat(DEFAULT_ARGUMENTS);

    /** faster methods using byteIndex for positioning
     */
    extern any String_byteSubstr(DEFAULT_ARGUMENTS);
    extern any String_byteIndexOf(DEFAULT_ARGUMENTS);

    //String as namespace methods
    extern any String_spaces(DEFAULT_ARGUMENTS);
    extern any String_fromCharCode(DEFAULT_ARGUMENTS);

    //Number
    extern any Number_isNaN(DEFAULT_ARGUMENTS);

    //Date
    extern void Date_init(DEFAULT_ARGUMENTS);
    extern any Date_toISOString(DEFAULT_ARGUMENTS);
    extern any Date_toUTCString(DEFAULT_ARGUMENTS);
    extern any Date_toDateString(DEFAULT_ARGUMENTS);
    extern any Date_toTimeString(DEFAULT_ARGUMENTS);

    extern void Array__init(DEFAULT_ARGUMENTS);

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
    extern any Array_tryGet(DEFAULT_ARGUMENTS);
    extern any Array_isArray(DEFAULT_ARGUMENTS);

    extern void _clearArrayItems(any* start, len_t count);
    extern void _array_pushString(any this, any slice);

    //handling routines for: dynamic array with variable item-size
    extern Array_ptr _initArrayStruct(Array_ptr arrPtr, uint16_t itemSize, len_t initialAlloc);
    extern Array_ptr _setArrayItems(Array_ptr arrPtr, uint16_t itemLen, len_t argc, void* contents);
    extern void _array_splice(Array_ptr arrPtr, int64_t startPos, int64_t deleteHowMany, len_t toInsert, void* toInsertItemsPtr);
    extern void _array_realloc(Array_s *arr, uint64_t newLen64);
    extern void _array_push(Array_ptr arrPtr, void* newItem);

    extern void Map__init(DEFAULT_ARGUMENTS);
    extern any Map_newFromObject(DEFAULT_ARGUMENTS); //when called x = new Map.{a:1,b:2}
    extern int64_t _map_KeyTree_do(Map_ptr map, byte what, any key, len_t valueIndex);

    extern any Map_get(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_has(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_set(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_delete(DEFAULT_ARGUMENTS); //Map = js Object, array of props
    extern any Map_clear(DEFAULT_ARGUMENTS); //Map = js Object, array of props

    extern void NameValuePair__init(DEFAULT_ARGUMENTS);
    extern any _newPair(str name, any value);

    //namespace JSON
    any JSON_stringify(any this, len_t argc, any* arguments);

    //namespace console
    extern any console_log(DEFAULT_ARGUMENTS);
    extern any console_info(DEFAULT_ARGUMENTS);
    extern any console_warn(DEFAULT_ARGUMENTS);
    extern any console_error(DEFAULT_ARGUMENTS);
    extern void print(len_t argc, any* arguments); //shortcut for console_log
    extern any console_group(DEFAULT_ARGUMENTS);
    extern any console_groupEnd(DEFAULT_ARGUMENTS);
    extern any console_debugEnabled;
    extern any console_time(DEFAULT_ARGUMENTS);
    extern any console_timeEnd(DEFAULT_ARGUMENTS);

    //namespace process
    extern any process_argv; // namespace process - node.js compat with core object process
    extern any process_cwd(DEFAULT_ARGUMENTS);
    extern any process_exit(DEFAULT_ARGUMENTS);

    extern any __dirname; //fill with current process dir name (similar to node.js)

    //out to stdout
    extern void _out(any s);
    extern void _outNewLine();
    //out to stderr
    extern void _outErr(any s);
    extern void _outErrNewLine();
    //out to a file
    extern void _outFile(any s, FILE* file);
    extern void _outNewLineFile(FILE* file);

    //debug: out JSON_stringify(s) to stderr
    #ifdef NDEBUG
    #define _outDebug(s) (__ASSERT_VOID_CAST (0))
    #define DEBUG(s) (__ASSERT_VOID_CAST (0))
    #else
    void _outDebug(str msg, any s);
    #define DEBUG(s) _outDebug(#s,s);
    #endif

    // fail with message
    #define fail_with(LITERAL) throw(_newErr( any_LTR(LITERAL) ))

    // concat in internal buffer - compose crtitical msgs
    //extern str _concatToNULL(str first,...);

    //debug helper
    extern any* watchedPropAddr;
    // generic instance (defined to help debugging)
    typedef struct __instance_s {
        any     prop0;
        any     prop1;
        any     prop2;
        any     prop3;
        any     prop4;
        any     prop5;
        any     prop6;
        any     prop7;
        any     prop8;
        any     prop9;
        any     propA;
        any     propB;
        any     propC;
        any     propD;
        any     propE;
        any     propF;
    } __instance_s;

//------------------------
// Register Methods & Props for a class

    extern void _declareMethods(any anyClass, _methodInfoArr infoArr);
    extern void _declareProps(any anyClass, posTable_t posTable, size_t posTable_byteSize);

# endif
