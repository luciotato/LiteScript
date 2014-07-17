/*
 * Lite C core support
 *  * Author: Lucio Tato
 */

#ifndef LITEC_CORE_H
#define LITEC_CORE_H

#include "util.h"
#include "any.h"
#include "exceptions.h"

#include <unistd.h> // process.cwd

    extern any* watchedPropAddr;

    extern any any_EMPTY_STR;

    // LiteC_init
    extern void LiteC_init(int argc, char** CharPtrPtrargv);
    extern void LiteC_addMethodSymbols(int addedMethods, str* _verb_table);
    extern void LiteC_addPropSymbols(int addedProps, str* _things_table);

    extern function_ptr LiteC_registerShim(any anyClass, int symbol, function_ptr fn);

    // _symbol names
    extern int _allMethodsLength, _allPropsLength, _symbolTableLength;
    extern str* _symbolTable;
    extern str* _symbol; // table "center", symbol:0, prop "constructor"

    // symbol core functions (also specific on Object_)
    extern int _getSymbol(str name);
    extern any _getProperty(any this, int symbol );
    extern any _getPropertyName(any this, int index);

    //function LiteCore_getSymbol(symbolName:string) returns number
    // get symbol (number) from Symbol name (string)
    extern any LiteCore_getSymbol(DEFAULT_ARGUMENTS);

    //function LiteCore_getSymbolName(symbol:number) returns string
    // get symbol name from Symbol (number)
    extern any LiteCore_getSymbolName(DEFAULT_ARGUMENTS);

    // typedef for class's Jjmp table, and prop instance relative position table
    typedef function_ptr* _jmpTable; // _jmpTable: array of function pointers (method code)
    typedef _posTableItem_t* _posTable; // _posTable: array of uint16 (relative pos from instance base)
    #define TABLE_LENGTH(t) *((uint16_t*)&(t[0])) //first item in jmpTable and posTable is table length

    // helper struct to declare class methods
    typedef struct _methodInfoItem {
        int method;
        function_ptr function;
    } * _methodInfoItemPtr ;
    typedef struct _methodInfoItem _methodInfoArr[];

    // helper struct to declare class properties
    struct _propertyInfoItem {
        int symbol;
        _posTableItem_t pos;
    };
    typedef struct _propertyInfoItem _propertyInfoArr[];

    // core methods, negative ints
    #define _CORE_METHODS_MAX 33 // means -1..-_CORE_METHODS_MAX are valid method symbols
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

        ,toISOString_
        ,toUTCString_
        ,toDateString_
        ,toTimeString_

        ,slice_
        ,split_
        ,indexOf_
        ,lastIndexOf_
        ,concat_
        ,toLowerCase_
        ,toUpperCase_
        ,charAt_
        ,replaceAll_
        ,trim_
        ,substr_

        ,tryGetMethod_
        ,tryGetProperty_
        ,getProperty_
        ,getPropertyName_

        ,has_
        ,get_
        ,set_
        ,delete_
        ,clear_
        ,keys_

        ,toString_

    ,_END_CORE_METHODS_ENUM //enum should reach 0 here.
    };

    // core symbols
    enum _CORE_PROPERTIES_ENUM {
        constructor_, // always constructor is symbol:0 and prop[0]

        name_, //class name
        initInstance_, //class __init:Function

        value_, //NameValuePair

        message_, //error.message
        stack_, //error.stack
        code_, //error.code

    _CORE_PROPS_LENGTH
    };

//-- access props, call methods

    extern function_ptr __classMethodNat(int symbol, Class_ptr class);
    extern function_ptr __classMethod(int symbol, any anyClass);
    extern any __classMethodFunc(int symbol, any anyClass);

    extern any Array_tryGet(DEFAULT_ARGUMENTS);

    #ifndef NDEBUG
        #include <signal.h>
        extern void debug_fail(str file, int line, str message);
        // access a method on the instance
        #define METHOD(symbol,this) __method(symbol,this)
        extern function_ptr __method(int symbol, any this);
        // access a property of the instance
        #define PROP(prop,this) (*(__prop(prop,this,__FILE__, __LINE__)))
        extern any* __prop(int prop, any this, str file, int line);
        // access arr[index]. Access item[index]
        #define ITEM(index,this) (*(__item(index,this,__FILE__, __LINE__)))
        extern any* __item(int64_t index, any this, str file, int line);
        // access this.arr[index]. Access item[index] of a given property (type Array)
        #define ITEM_PROP(index,prop,this) (*(__item(index,prop,this)))
        extern any* __item2(int index, int prop, any this, str file, int line);
    #else
        #define METHOD(symbol,this) this.class->method[-symbol]
        #define PROP(symbol,this) this.value.prop[this.class->pos[symbol]]
        #define ITEM(index,anyArr) anyArr.value.arr[index]
        #define ITEM_PROP(index,symbol,this) this.value.prop[this.class.pos[symbol]].value.arr[index]
    #endif

    #define NO_ARGS 0,NULL
    #define ARG1(A1) 1,(any_arr){A1}
    #define ARG2(A1,A2) 2,(any_arr){A1,A2}
    #define ARG3(A1,A2,A3) 3,(any_arr){A1,A2,A3}
    #define ARG4(A1,A2,A3,A4) 4,(any_arr){A1,A2,A3,A4}

    extern any __call(int symbol, DEFAULT_ARGUMENTS);
    extern any __apply(any anyFunc, DEFAULT_ARGUMENTS);
    extern any __applyArr(any anyFunc, any this, any anyArr);

    #define CALL(symbol,this) __call(symbol,this,0,NULL)
    #define CALL0(symbol,this) __call(symbol,this,0,NULL)
    #define CALL1(symbol,this,A1) __call(symbol,this,1,(any_arr){A1})
    #define CALL2(symbol,this,A1,A2) __call(symbol,this,2,(any_arr){A1,A2})
    #define CALL3(symbol,this,A1,A2,A3) __call(symbol,this,3,(any_arr){A1,A2,A3})
    #define CALL4(symbol,this,A1,A2,A3,A4) __call(symbol,this,4,(any_arr){A1,A2,A3,A4})

    void _default(any* variable,any value);

//-------
// Object

    // serves as root for the class hierarchy
    extern any Object;

//-------
// ClassInfo

    typedef struct Class_s * Class_ptr;
    typedef struct Class_s {
        any     name;         // class name
        any     initInstance; // :Function, __init function
        //private-native
        size_t       instanceSize; // sizeof struct holding instance props
        Class_ptr    super;        // super class
        _jmpTable    method;       // jmp table for the class
        _posTable    pos;        // relative property pos table for the class's instances
    } Class_s;
    extern any Class;

// core Classes with _CLASSINFO -------------------
    extern struct Class_s Object_CLASSINFO;
    extern struct Class_s Class_CLASSINFO;
    extern struct Class_s Null_CLASSINFO;
    extern struct Class_s Undefined_CLASSINFO;
    extern struct Class_s String_CLASSINFO;
    extern struct Class_s Number_CLASSINFO;
    extern struct Class_s Function_CLASSINFO;

    extern struct Class_s Error_CLASSINFO;
    extern struct Class_s Array_CLASSINFO;
    extern struct Class_s NameValuePair_CLASSINFO;

// core Class objects -------------------
    //extern any Global;
    extern any Null, Undefined, String, Number, Date, NaN, Infinity;
    extern any Object, Class, Function, Error, Array, Map, NameValuePair;

// core instances -------------------
    //extern any global;
    extern any null, undefined, true, false;

    #define any_str(S) (any){&String_CLASSINFO,.value.str=S} // Note: "" is NOT FALSEY. (add: .value.str=(S[0]=='\0'?NULL:S))
    //extern any any_number(double S);
    #define any_number(S) (any){&Number_CLASSINFO,.value.number=S}
    #define any_func(S) (any){&Function_CLASSINFO,.value.ptr=(function_ptr)S}
    #define any_class(S) (any){&Class_CLASSINFO,.value.classINFOptr=S}


//-------
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

    // Error
    typedef struct Error_s * Error_ptr;
    typedef struct Error_s {
        any name;
        any message;
        any stack;
        any code;
    } Error_s;
    extern any Error;

    //Array
    typedef struct Array_s * Array_ptr;
    typedef struct Array_s {
        //private-native
        len_t length;
        any* item;
    } Array_s;
    extern any Array; //class object

    //Map
    typedef struct Map_s * Map_ptr;
    typedef struct Map_s { // extends Array
        //private-native // Array
        len_t length;
        any* item;
    } Map_s;
    extern any Map; //class object

    //NameValuePair
    typedef struct NameValuePair_s * NameValuePair_ptr;
    typedef struct NameValuePair_s {
        any name,value;
    } NameValuePair_s;
    extern any NameValuePair; //class object

    //Buffer
    typedef struct Buffer_s * Buffer_ptr;
    typedef struct Buffer_s {
        //private-native
        size_t used;
        char* ptr;
    } Buffer_s;
    extern any Buffer; //class object

//------------------------
// Register Methods & Props for a class

    extern void _declareMethods(any anyClass, _methodInfoArr infoArr);
    extern void _declareProps(any anyClass, _posTable posTable, size_t posTable_byteSize);

//------------------------
// export helper functions
// new - mem_alloc mem space
// and init Object properties (first part of memory space)

    extern any new(any class, len_t argc, any* arguments);

    extern any _newClass ( str className, __initFn_ptr initFn, uint64_t instanceSize, Class_ptr superClass);

    extern any _newStringSize(size_t memSize);
    extern any _newErr(str message);

    extern any _newArray(len_t initialLen, any* optionalValues);
    extern any _newArrayFromCharPtrPtr(len_t argc, char** argv);
    extern any Array_clone(any this, len_t argc, any* arguments);

    extern int64_t _length(any this);
    extern any _typeof(any this);
    extern bool _instanceof(any this, any class);
    extern bool __is(any a,any b);  //js triple-equal, "==="
    extern bool __in(any needle, len_t haystackLength, any* haystackItem);

    extern any _newDate(time_t value);

    extern str _anyToStr(any this);
    extern int _anyToBool(any a);
    extern int64_t _anyToInt64(any a);
    extern double _anyToNumber(any a);

    extern any parseFloat(DEFAULT_ARGUMENTS);
    extern any parseInt(DEFAULT_ARGUMENTS);

    extern any _concatAny(len_t argc, any* arguments);
    extern any _stringJoin(str initial, len_t argc, any* arguments, str separ);

    #ifdef NCHECKARGS
    #define assert_args(this, argc, arguments, required, total, classes) (__ASSERT_VOID_CAST (0))
    #else
    extern void assert_args(DEFAULT_ARGUMENTS, int required, int total, Class_ptr class, ...);
    #endif

    extern str __concatToNULL(str first,...);

    extern Buffer_s _newBuffer();
    extern void _Buffer_addBytes(Buffer_s *dbuf, str ptr, size_t size);
    extern void _Buffer_addStr  (Buffer_s *dbuf, str s);
    extern void _Buffer_concatToNULL(Buffer_s *dbuf, str arg,...);
    extern void _Buffer_add0    (Buffer_s *dbuf);
    void _Buffer_add(Buffer_s * dbuf, any a);
    extern any _Buffer_toString (Buffer_s *dbuf);

    extern str _concatToNULL(str first,...); // to compose critical failure messages. Cannot fail.

//------------------------
// export core class methods

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
    extern any Object_getPropertyName(DEFAULT_ARGUMENTS); // from prop index, throws

    extern void Error__init(DEFAULT_ARGUMENTS);

    extern void String__init(DEFAULT_ARGUMENTS);

    extern any String_indexOf(DEFAULT_ARGUMENTS);
    extern any String_lastIndexOf(DEFAULT_ARGUMENTS);
    extern any String_split(DEFAULT_ARGUMENTS);
    extern any String_slice(DEFAULT_ARGUMENTS);
    extern any String_concat(DEFAULT_ARGUMENTS);
    extern any String_substr(DEFAULT_ARGUMENTS);

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

    extern void Map__init(DEFAULT_ARGUMENTS);

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
    extern any console_error(DEFAULT_ARGUMENTS);
    extern void print(len_t argc, any* arguments); //shortcut for console_log
    extern any console_group(DEFAULT_ARGUMENTS);
    extern any console_groupEnd(DEFAULT_ARGUMENTS);
    extern any console_debugEnabled;

    //namespace process
    extern any process_argv; // namespace process - node.js compat with core object process
    extern any process_cwd(DEFAULT_ARGUMENTS);
    extern any process_exit(DEFAULT_ARGUMENTS);

# endif
