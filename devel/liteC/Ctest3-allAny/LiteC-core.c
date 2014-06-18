/*
 * File:   LiteC-core.c
 * Author: Lucio Tato
 *
 * Contains:
 *  core type Support
 *
 * helper functions:
 *  Object new (TypeID type)
 *
 */

    #include "LiteC-core.h"

    any String__init(any this, any args){
        switch(args.constructor){
            case TYPE_0_STR:
                this.constructor = TYPE_0_STR;
                return this;
            case String:
                this.value.str = args.value.str;
                return this;
            default:
                throw(new(Error,any_str("invalid init value for String")));
        }

    }

 // .toString methods

    str Object_toString(any this){
        return __concatToNULL("[",CLASSES[this.constructor].name,"]",NULL);
    }

    str Error_toString(Error_ptr this){
        return  __concatToNULL(this->name,": ",this->message,NULL);
    }

    str Array_toString(Array_ptr this){
        return  "[object Array]";
    }

    // can be called with any &prop if you know the type
    // example _toStr((anyValue*)&this->column,TYPE_INT);
    str _anyValuePtr_toStr(anyValue* this, TypeID type){
        switch(type){
            case UNDEFINED:
                return "undefined";
            case TYPE_NULL:
                return "null";
            case TYPE_0_STR:
                return EMPTY_STR;
            case String:
                return this->str;
            case TYPE_BOOLEAN:
                return this->boolean?"true":"false";
            case TYPE_INT32:
                return _int32ToStr(this->int32); //expected: C compiler to optimize tail-call into JMP
            case TYPE_UINT32:
                return _uint32ToStr(this->uint32);
            case TYPE_INT64:
                return _int64ToStr(this->int64);
            case TYPE_UINT64:
                return _uint64ToStr(this->uint64);
            case Number:
                return _numberToStr(this->number);
            case Function: case TYPE_TypeID: /* to be js-consistent */
                return "function";
            case Error:
                return Error_toString(this->error);
            default:
                return "[object]"; //to be js-consistent
        }
    }

    str _toStr(any o){ //converts core values only - rest is "[object]"
        return _anyValuePtr_toStr(&o.value, o.constructor);
    };

    struct ClassInfo* CLASSES;
    int CLASSES_size; //alloc'd
    int CLASSES_length; //used

//-------------------
// helper functions
//--------------------
// new - alloc mem space
// and init Object properties (first part of memory space)

    any new(TypeID type, any args){

        any a = {type,.value.uint64=0}; //set type

        if (type<=String) {
            // simpler cases, no alloc required upto String
            if (type==String) return String__init(a,args);
            return a;
        }
        else {
            // valid type?
            if (type>=CLASSES_length) fatal("new: invalid typeID");
        }

        //calls Class__init(a,args)
        a.value.ptr = alloc(CLASSES[type].instanceSize);
        return CLASSES[type].__init(a,args);
    }


    //init Fn for Error Objects
    any Error__init(any this, any args){
        this.value.error->name = "Error";
        this.value.error->message = _toStr(args);
        return this;
    };

    void _throw_noMethod(TypeID type, str method) {
        throw ( new(Error, any_str(__concatToNULL(
               "no method:'",method,"' in type: ",CLASSES[type].name, NULL
               ))));
    }

    // Object_toString


//----------------------
// Array

    //init Fn for Array Objects
    any Array__init(any this, any args){
        this.value.array->itemClass = UNDEFINED;
        uint32_t size=32;
        this.value.array->size=size; //alloc initial size 32 elements
        this.value.array->item = alloc(size * sizeof(any));
        this.value.array->length = 0;
    };

// Array_push
// core push dispatcher,
// should be added at generated .push dispatcher
    // , case Array: return Array_push(this, value);
    // default:
    //    _throw_noMethod(this.type,"push");

    int Array_push(Array_ptr this, any value){
        if (this->length == this->size){
            this->size+=32;
            this->item=realloc(this->item, this->size * sizeof(any));
        }
        this->item[this->length++] = value;
        return this->length;
    }


    /*String Number_toString(Number this){
        char buffer[256];
        snprintf(buffer,sizeof(buffer),"%d",this->value);
        return String__init__(new(String_CLASS),buffer);
    }
    */

    /*
    __concat_String(int arglen,...){
        ...
        return String__init__(new(String_CLASS),buffer);
    }
    */


//-------------------
// init
//--------------------
    void LiteC_registerCoreClasses(){

        CLASSES_length = Error+1; //last enum in LiteC-core.h
        CLASSES_size = 64;
        CLASSES = alloc(CLASSES_size * sizeof(struct ClassInfo));

        struct ClassInfo Array_CLASS_INFO = {
            "Array", // str type name
            Array__init, // function __init
            sizeof(struct Array_s), //size_t instanceSize
            UNDEFINED // super type
        };

        CLASSES[Array] = Array_CLASS_INFO;

        struct ClassInfo Error_CLASS_INFO = {
            "Error", // str type name
            Error__init, // function __init
            sizeof(struct Error_s), //size_t instanceSize
            UNDEFINED // super type
        };

        CLASSES[Error] = Error_CLASS_INFO;

    };

    //---------------------
    void __registerClass (
            TypeID requiredID,
            str name,
            TypeID super, //proto type ID. Which type this type extends
            initFn_t initFn,
            size_t instanceSize
             ) {
            //create type info

        if (requiredID>=CLASSES_size){
            CLASSES_size=requiredID+32;
            CLASSES = realloc(CLASSES, CLASSES_size*sizeof(struct ClassInfo));
        }

        if (CLASSES[requiredID].name!=NULL) fatal("__registerClass: id already taken");

        struct ClassInfo newClass = {
            name, // str type name
            initFn, // function __init
            instanceSize, //size_t instanceSize
            super // super type
        };

        CLASSES[requiredID] = newClass;

        // return new index in CLASSES => TypeID
    };

