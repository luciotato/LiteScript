/*
 * Lite C core support
 *  * Author: Lucio Tato
 */

#ifndef LITEC_CORE_H
#define LITEC_CORE_H

#include "util.h"
#include "any.h"
#include "exceptions.h"
#include "PMREX-native.h"
#include <unistd.h> // process.cwd

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
        ,any_COMMA, any_QUOTE, any_SINGLE_QUOTE, any_QUOTE_COLON
        ,any_OPEN_BRACKET, any_CLOSE_BRACKET
        ,any_OPEN_CURLY, any_CLOSE_CURLY
    ;

// core instances -------------------
    extern any null, undefined, true, false;

    #define any_LTR(S) (any){.class=String_inx, .res=0, .len=sizeof(S)-1, .value.str=S}
    #define any_slice(PTR,BYTELEN) (any){.class=String_inx, .res=0, .len=BYTELEN, .value.str=PTR}
    #define any_CStr(CSTR) any_slice(CSTR,strlen(CSTR))
    #define any_number(S) (any){.class=Number_inx, .res=0, .len=0, .value.number=S}
    #define any_func(S) (any){.class=Function_inx, .res=0, .len=0, .value.ptr=(function_ptr)S}
    #define any_class(CLASS_INX) (any){.class=Class_inx, .res=0, .len=0, .value.ptr=&CLASSES[CLASS_INX]}

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
    extern any _getPropertyNameAtIndex(any this, propIndex_t index);

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

    // core methods, negative ints
    #define _CORE_METHODS_MAX 41 // means -1..-_CORE_METHODS_MAX are valid method symbols
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

        ,copy_  //Buffer
        ,write_

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
        ,countSpaces_

        ,tryGetMethod_
        ,tryGetProperty_
        ,getProperty_
        ,getPropertyNameAtIndex_
        ,setProperty_
        ,hasProperty_
        ,hasOwnProperty_
        ,getObjectKeys_
        ,initFromObject_

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

        size_, //Map.size
        value_, //NameValuePair

        message_, //error.message
        stack_, //error.stack
        code_, //error.code

    _CORE_PROPS_LENGTH
    };

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
        len_t       declaredPropsCount; //set at declareProps
        class_t     classInx;     // index of this class in CLASSES[]
        class_t     super;        // index of super class in CLASSES[]
        jmpTable_t  method;       // jmp table for the class. method[-symbol] is function_ptr
        posTable_t  pos;          // relative property pos table for the class's instances
                                  //  .value.prop[pos[symbol]] is value for property named symbol
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
        AnyBoxedValue_inx=1,
        Object_inx=2,
        Class_inx=3,
        Null_inx, NaN_inx, Infinity_inx,
        Number_inx, Boolean_inx, Date_inx,
        String_inx, Function_inx,
        Array_inx, Map_inx, NameValuePair_inx,
        Error_inx, Buffer_inx, FileDescriptor_inx,

    _LAST_CORE_CLASS //end mark
    };

// core classes array: CLASSES-------------------

    extern len_t CLASSES_allocd;
    extern Class_s* CLASSES; //array of registered classes
    extern len_t CLASSES_len;

// core classes.  Foo = (any){class=Class_inx, .res=0, .value.class = Foo_inx}
    extern any
        Undefined, Null, NaN, Infinity,
        Object, Class, Function,
        String, Number, Date,
        Array, Map, NameValuePair,
        Error, Buffer, FileDescriptor;

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


    //Array
    typedef struct Array_s * Array_ptr;
    typedef struct Array_s {
        //private-native
        size_t allocd;
        len_t length;
        any* item;
    } Array_s;
    extern any Array; //class object

    //NameValuePair
    typedef struct NameValuePair_s * NameValuePair_ptr;
    typedef struct NameValuePair_s {
        any name,value;
    } NameValuePair_s;
    extern any NameValuePair; //class object

    //Map
    typedef struct Map_s * Map_ptr;
    typedef struct Map_s {
        any size;
        //private-native
        Array_s array; // Array of NameValuePairs
        int64_t current; //last-found | current nvp index | -1
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

//------------------------
// Access methods and properties
// direct, fast access if NDEBUG
// bound-checked access for debug mode

    #ifdef NDEBUG
        #define METHOD(symbol,this) (CLASSES[this.class].method[-symbol])
        #define PROP(symbol,this) this.value.prop[CLASSES[this.class].pos[symbol]]
        #define ITEM(index,anyArr) anyArr.value.arr->item[(len_t)index]
        //#define ITEM_PROP(index,symbol,this) this.value.prop[this.class.pos[symbol]].value.arr[index]
        #define MAPITEM(index,this) ((NameValuePair_ptr)((Map_ptr)this.value.ptr)->array.item[index].value.ptr)
    #else
        // access a method on the instance
        #define METHOD(symbol,this) __method(symbol,this)
        extern function_ptr __method(symbol_t symbol, any this);
        // access a property of the instance
        #define PROP(prop,this) (*(__prop(prop,this,__FILE__, __LINE__)))
        extern any* __prop(symbol_t prop, any this, str file, int line);
        // access arr[index]. Access item[index]
        #define ITEM(index,this) (*(__item(index,this,__FILE__, __LINE__)))
        extern any* __item(int64_t index, any this, str file, int line);
        // access this.arr[index]. Access item[index] of a given property (type Array)
        //#define ITEM_PROP(index,prop,this) (*(__item(index,prop,this)))
        //extern any* __item2(int index, int prop, any this, str file, int line);
        // access map.array[index]. get a NVP by index, used to implement for each in map, w/o iterators
        #define MAPITEM(index,this) _map_getNVP(index,this,__FILE__, __LINE__)
        extern NameValuePair_ptr _map_getNVP(int64_t index, any this, str file, int line);
        #include <signal.h>
        extern void debug_abort(str file, int line, any message);
    #endif

    #define MAPSIZE(ANYMAP) PROP(size_,ANYMAP).value.number

    extern any __call(symbol_t symbol, DEFAULT_ARGUMENTS);
    extern any __apply(any anyFunc, DEFAULT_ARGUMENTS);
    extern any __applyArr(any anyFunc, any this, any anyArr);

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

    extern any _newStringSize(len_t memSize);
    extern any _newErr(any msg);

    extern any _newArray(len_t initialLen, any* optionalValues);
    extern any _newArrayFromCharPtrPtr(len_t argc, char** argv);
    extern any Array_clone(any this, len_t argc, any* arguments);

    extern int64_t _length(any this);
    extern any _typeof(any this);
    extern bool _instanceof(any this, any class);
    extern bool __is(any a,any b);  //js triple-equal, "==="
    extern bool __in(any needle, len_t haystackLength, any* haystackItem);
    extern int __compareStrings(any strA, any strB);  //js triple-equal, "==="

    extern int _anyToBool(any a);
    extern int64_t _anyToInt64(any a);
    extern double _anyToNumber(any a);

    extern any parseFloat(DEFAULT_ARGUMENTS);
    extern any parseInt(DEFAULT_ARGUMENTS);

    extern any _concatAny(len_t argc,any arg,...);

    extern any _arrayJoin(any initial, len_t argc, any* item, any separ);

    extern any _newDate(time_t value);

    #ifndef NDEBUG
        //single fixed arg
        #define assert_arg(CLASS) assert(argc==1 && arguments[0].class==CLASS.value.classPtr->classInx)
        //multiple args
        typedef struct _assert_args_options { int req; int max; int control;} _assert_args_options;
        #define assert_args(...) _assert_args(this,argc,arguments,__FILE__,__LINE__, (_assert_args_options) __VA_ARGS__)
        void _assert_args(DEFAULT_ARGUMENTS, str file,int line, _assert_args_options options, any anyClass, ...);
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
    void _toCStringCompatBuf(any s, str buf, len_t bufSize);
    str _tempCString(any s);

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
    extern any Object_getPropertyNameAtIndex(DEFAULT_ARGUMENTS); // from prop index, throws if not found
    extern any Object_hasProperty(DEFAULT_ARGUMENTS); //from name, returns true or false
    extern any Object_hasOwnProperty(DEFAULT_ARGUMENTS); //from name, returns true or false
    extern any Object_setProperty(DEFAULT_ARGUMENTS); //from name, set property for object & Maps
    extern any Object_getObjectKeys(DEFAULT_ARGUMENTS);

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

    //String as namespace methods
    extern any String_spaces(DEFAULT_ARGUMENTS);

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

    extern void _clearArrayItems(any* start, len_t count);
    extern void _array_pushSlice(any this, any slice);

    extern void Map__init(DEFAULT_ARGUMENTS);
    extern any Map_newFromObject(DEFAULT_ARGUMENTS); //when called x = new Map.{a:1,b:2}

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
    #else
    void _outDebug(any s);
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
