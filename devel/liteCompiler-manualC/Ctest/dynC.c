/*
 * File:   main.c
 * Author: ltato
 *
 * Created on March 12, 2014, 8:48 AM
 */

#include "dynC.h"

void fatal(char * msg) {
    fprintf(stderr, msg);
    abort();
}

void* alloc(size_t size) {
    void* result = GC_malloc(size);
    if (!result) fatal("virtual memory exhausted");
    return result;
}

void* realloc(void* ptr, size_t size) {
    void* result = GC_realloc(ptr, size);
    if (!result) fatal("virtual memory exhausted");
    return result;
}

var undefined; // struct var
var true; // struct var
var false; // struct var
var vEND; // struct var - var array end

Object nullObj; // null object
Object ObjProto; //object __proto__
Object FunctionProto; //Function __proto__

//makeFunctionPointer

var _fp(function fn) {
    if (fn == NULL) return undefined;
    var a = {
        .type = VAR_TYPE_FUNCTION_PTR,
        .val.functionPtr = fn
    };
    return a;
};

//makeObjPointer

var _op(Object o) {
    if (o == NULL) return undefined;
    var a = {
        .type = VAR_TYPE_OBJECT_POINTER,
        .val.obj = o
    };
    return a;
};

var _s(char * s) {
    var a = {
        .type = VAR_TYPE_STR,
        .val.str = s
    };
    return a;
};

str newStr(char * s) {
    if (s == NULL) return NULL;
    str a = alloc(strlen(s) + 1);
    strcpy(a, s);
    return a;
};

var newStrVar(char * s) {
    var a;
    a.type = VAR_TYPE_STR;
    a.val.str = newStr(s);
    return a;
};

uint32 calcAvail(uint32 length) {
    return ((length >> 4 + 1) << 4);
} //16 increments


Object Object_create(Object proto) {

    Object newObj = alloc(sizeof (struct Object_struct));

    uint32 length = proto ? proto->length : 0;
    newObj->length = length;

    //make space for values
    newObj->avail = calcAvail(length);
    size_t newsize = sizeof (var) * newObj->avail;
    newObj->v = alloc(newsize);

    //copy values from proto
    if (length) {
        memcpy(newObj->v, proto->v, newsize);
        // set length from proto
        newObj->length = proto->length;
        //for names, initially point to proto names (until a dyn property is added)
        newObj->names = proto->names;
        proto->avail = 0xFFFF; //mark as sharing names
    } else {
        //proto is nullObj - length is 0
        //make space for names - empty
        newObj->names = alloc(sizeof (str) * newObj->avail);
    }

    return newObj;
};

var _new(var class, Object arguments) {
    //create "this" based con class prototype
    Object this = Object_create(class.val.obj->v[_Function_prototype].val.obj);
    //call class constructor on "this"
    return class.val.obj->v[_Function__ptr__].val.functionPtr(_op(this),arguments);
}

Object Function_create(str name, function fn, Object proto) {
    //create object-namespace
    Object o_as__namespace = Object_create(FunctionProto);
    //assign code to object-function-class
    o_as__namespace->v[_Function__ptr__] = _fp(fn);
    o_as__namespace->v[_Function_prototype] = _op(Object_create(proto));
    return o_as__namespace;
}

Object jmpo(Object o, int inx) {
    if (o->v[inx].type != VAR_TYPE_OBJECT_POINTER) fatal("jmpo: not VAR_TYPE_OBJECT_POINTER");
    return o->v[inx].val.obj;
}

//_o treat var as object
Object _o(var a) {
    if (a.type != VAR_TYPE_OBJECT_POINTER) fatal("geto: not VAR_TYPE_OBJECT_POINTER");
    return a.val.obj;
}

void Object_makeOwnPropNames(Object o) {
    //create own array for names
    uint32 avail = calcAvail(o->length); //16 increments
    size_t newsize = sizeof (str) * avail;
    str* newspace = GC_malloc(newsize);
    // copy old names array
    memcpy(newspace, o->names, newsize);
    o->names = newspace;
    o->avail = avail; //store new avail
};

void Object_checkOwnPropNames(Object o) {
    if (o->avail == 0xFFFF) Object_makeOwnPropNames(o); // if names pointing to __proto__ property names arr
}

//Object _setProp

int _setProp(Object o, int inx, str name, var value) {

    Object_checkOwnPropNames(o);

    //set specific property
    uint32 length = o->length;
    uint32 avail = o->avail;

    //need value space?
    if (inx >= avail) {

        while (inx >= avail)avail += 16;

        //extend prop values
        o->v = realloc(o->v, sizeof (var) * avail);

        //extend prop names
        o->names = realloc(o->names, sizeof (str) * avail);

        o->avail = avail; //store new avail
    }

    if (inx >= o->length) {
        o->length = inx + 1; // set length
    } else {
        fatal("_setProp: index already occupied");
    }

    //Store value & name
    o->v[inx] = value;
    o->names[inx] = name;

    return inx; //returns index

};

int Object_pushProp(Object o, str name, var value) {
    return _setProp(o, o->length, name, value); //returns index
};

//find property by name

int Object_propIndex(Object o, str name) {

    for (int n = o->length - 1; n >= 0; n--) {
        if (strcmp(o->names[n], name) == 0) return n;
    }
    return -1;
}

//Object _getProp
// check proto, use index
// try indicated index, check names
// else search by name
// return undefined if prop not found

/*var _getProp(Object o, int inx, Object class) {
    if (jmpo(o, _Object__proto__) == class) return o->v[inx];
    if (inx < o->length && strcmp(class->names[inx], o->names[inx]) == 0) return o->v[inx];
    inx = Object_propIndex(o, class->names[inx]);
    if (inx < 0) return undefined;
    return o->v[inx];
}
*/

var _getProp(var a, str name) {
    int inx = Object_propIndex(a.val.obj, name);
    if (inx < 0) return undefined;
    return a.val.obj->v[inx];
}

int Object_addProp(Object o, str name, var value) {

    //if prop name already exists, replace value
    int inx = Object_propIndex(o, name);
    if (inx >= 0) {
        o->v[inx] = value;
        return inx;
    }
    //else add
    return Object_pushProp(o, name, value);
}

var Object_prototype_toString(Object o, Object arguments) {
    var a = {
        .type = VAR_TYPE_STR,
        .val.str = "[Object]"
    };
    return a;
}

void dynC_init() {

    undefined.type = VAR_TYPE_UNDEFINED;
    undefined.val.uint64 = 0;

    true.type = VAR_TYPE_BOOLEAN;
    true.val.uint64 = 1;

    false.type = VAR_TYPE_BOOLEAN;
    false.val.uint64 = 0;

    vEND.type = VAR_TYPE_VAR_ARRAY_END;

    nullObj = Object_create(NULL);

    ObjProto = Object_create(NULL);
    _setProp(ObjProto, _Object_toString, "toString", _fp(Object_prototype_toString));

    FunctionProto = Object_create(ObjProto);
    _setProp(FunctionProto, _Function_name, "name", _s("Function"));
    _setProp(FunctionProto, _Function__ptr__, "__ptr__", undefined);

};

Object getPrototype(var varClass) {
    Object o = _o(varClass);
    if (o->v[_Object__proto__].val.obj != FunctionProto) fatal("getPrototype: not a Function");
    return o->v[_Function_prototype].val.obj;
}

int _instanceof(var a, var class) {
    Object prototype = getPrototype(class);
    Object proto = _o(a);
    while (1) {
        if ((proto = proto->v[_Object__proto__].val.obj) == NULL) return 0;
        if (proto == prototype) return 1;
    }
}

int _outVarTo(FILE* outFile, var arg){
    switch (arg.type) {
        case VAR_TYPE_VAR_ARRAY_END:
            return 0;
        case VAR_TYPE_STR:
            fprintf(outFile, arg.val.str);
            break;
        case VAR_TYPE_DOUBLE:
            fprintf(outFile, "%d", arg.val.number);
            break;
        default:
            fprintf(outFile, "VAR_TYPE:%n", arg.type);
    };
    return 1;
};

void _outTo(FILE* outFile, ...) {
    va_list ap;
    va_start(ap,outFile);
    while (_outVarTo(outFile,va_arg(ap,var))){};
    va_end(ap);
    fprintf(outFile,"\n");
}

