/*
 * File:   main.c
 * Author: ltato
 *
 * Created on March 12, 2014, 8:48 AM
 */

#ifndef DYNC_HEADERS
#define DYNC_HEADERS

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

#include "gc.h"

typedef char* str;
typedef char** strArray;

extern void fatal(char * msg);

extern void* alloc(size_t size);
extern void* realloc(void* ptr, size_t size);

typedef __uint64_t handle;

typedef enum {
    VAR_TYPE_UNDEFINED = 0,
    VAR_TYPE_BOOLEAN,
    VAR_TYPE_INT32,
    VAR_TYPE_UINT32,
    VAR_TYPE_INT64,
    VAR_TYPE_UINT64,
    VAR_TYPE_DOUBLE,
    VAR_TYPE_STR,
    VAR_TYPE_OBJECT_POINTER,
    VAR_TYPE_ARRAY_PTR,
    VAR_TYPE_FUNCTION_PTR,
    VAR_TYPE_VAR_ARRAY_END
} dataTypeEnum;

typedef __uint32_t uint32;

typedef struct Object_struct * Object;

//def type "function": *(var function(Object, Object))

typedef struct var_struct(functionAddress)(struct var_struct, struct Object_struct *);

typedef functionAddress * function;

typedef union overValues_union {
    __int32_t int32;
    __uint32_t uint32;
    __int64_t int64;
    __uint64_t uint64;
    double number;
    Object obj;
    function functionPtr;
    str str;
} overValues;
// notes: when false, int64=0, when "", int64=0

typedef struct var_struct {
    dataTypeEnum type;
    overValues val;
} var;


#define CALL(THIS, INX, ARGS){THIS.val.obj->v[INX].val.functionPtr(THIS,ARGS);}

//Object is .v var array, .names str array

struct Object_struct {
    var* v;
    uint32 length;
    uint32 avail;
    str* names;
};
typedef struct Object_struct * Object;

/*struct NameValuePair {
    string name;
    var value;
};
typedef struct NameValuePair NameValuePair;
 */

//Object prop index & names

typedef enum {
    _Object__proto__,
    _Object_toString,
    _Object__props_length__
} _Objects__props_enum__;

//Function prop index & names, extends Object

typedef enum {
    _Function_name = _Object__props_length__,
    _Function_prototype,
    _Function__ptr__
} _Function_props_enum__;

extern var undefined; // struct var
extern var true; // struct var
extern var false; // struct var
extern var vEND; // struct var - var array end

extern Object nullObj; // null object
extern Object ObjProto; //object __proto__
extern Object FunctionProto; //Function __proto__

//makeFunctionPointer

extern var _fp(function fn);

//makeObjPointer

extern var _op(Object o);

extern var _s(char * s);

extern str newStr(char * s);
extern var newStrVar(char * s);

extern uint32 calcAvail(uint32 length);

extern Object Object_create(Object proto);

extern Object Function_create(str name, function fn, Object proto);

extern Object jmpo(Object o, int inx);
extern Object _o(var a);

extern void Object_makeOwnPropNames(Object o);
extern void Object_checkOwnPropNames(Object o);

//Object _setProp

extern int _setProp(Object o, int inx, str name, var value);

extern int Object_pushProp(Object o, str name, var value);

//find property by name

extern int Object_propIndex(Object o, str name);

//Object _getProp
// check proto, use index
// try indicated index, check names
// else search by name
// return undefined if prop not found

extern var _getProp(var a, str name);

extern int Object_addProp(Object o, str name, var value);

extern var Object_prototype_toString(Object o, Object arguments);

extern void dynC_init();

extern Object getPrototype(var varClass);
extern int _instanceof(var a, var class);


extern int _outVarTo(FILE* outFile, var arg);
extern void _outTo(FILE* outFile, ...);
#define print(X) { _outTo(stdout, X ,vEND); }

# endif
