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

//--- module vars

    struct ClassInfo* CLASSES;
    int CLASSES_size; //alloc'd


//--- Helper throw error functions

    any _newErr(str message){
        return new(Error,(any){Array,1,.value.item=(any_arr){any_str(message)}});
    }

    void throwErr(str msg){
        throw(_newErr(msg));
    }

    void _throw_RangeError(str message) {
        var err=_newErr(message);
        AS(Error,err)->name = any_str("RangeError");
        throw(err);
    }

    void _throw_noMethod(TypeID type, str method) {
        throwErr(__concatToNULL(
               "no method:'",method,"' in type: ",CLASSES[type].name, NULL
               ));
    }


// --------------------
// Class__init core functions

    any String__init(any anyThis, any arguments){
        // validate param types, define as typecast
        assert(anyThis.constructor==String);
        assert(arguments.constructor==Array);
        //assert(arguments.value.array->length>=1); //required params
        //assert(arguments.value.array->item[0].constructor==ASTBase);
        //---------
        //define this
        // string is a pseudo-class (no mutable *ptr)
        #define this anyThis
        //define named params
        any initValue;
        switch(arguments.length){
            case 1: initValue=arguments.value.item[0];
        };
        //---------
        if (arguments.length){
            switch(initValue.constructor){
                case String:
                    this.value = initValue.value;
                    this.length = initValue.length;
                    return this;
                default:
                    throwErr("invalid init value for String");
            }
        }

    #undef this
    }

    any Error__init(any anyThis, any arguments){
        // validate param types, define as typecast
        assert(anyThis.constructor==Error);
        assert(arguments.constructor==Array);
        //
        //---------
        //define this
        #define this ((Error_ptr)anyThis.value.ptr)
        //define named params
        any message;
        switch(arguments.length){
            case 1: message=arguments.value.item[0];
        };
        //---------
        this->message = message;
        this->name = any_str("Error");
        return  anyThis;
        #undef this
    }

    any Array__newFrom(any arguments){
        assert(arguments.constructor==Array);
        any result={Array,arguments.length};
        size_t size;
        result.value.item = mem_alloc((size = arguments.length*sizeof(any)));
        memcpy(result.value.item, arguments.value.item, size);
        return result;
    };


    //init Fn for Array Objects
    any Array__init(any this, any arguments){
        size_t size;
        switch(arguments.length){
            case 0: break;
            case 1:
                if (any_isNumeric(arguments.value.item[0])){
                    //init with length
                    int64_t length = anyToInt64(arguments.value.item[0]);
                    if (length>UINT32_MAX) _throw_RangeError("Array__init length>UINT32_MAX");
                    this.length=(length_t)length;
                    this.value.item = mem_alloc(length*sizeof(any));
                    break;
                };
            default: // >0, items
                this = Array__newFrom(arguments);
        }
        return this;
    };

//-------------------
// helper functions
//--------------------
// new - alloc mem space
// and init Object properties (first part of memory space)

    any new(TypeID type, any arguments){

        any a = {type,0,.value.uint64=0}; //set type

        // valid type?
        if (type<0||type>CLASSES_size) fatal("new: invalid typeID");

        size_t size;
        if (size=CLASSES[type].instanceSize) {
            //alloc required memory
            a.value.ptr = mem_alloc(size);
        }

        if (CLASSES[type].__init) {
            //calls Class__init(a,arguments)
            return CLASSES[type].__init(a,arguments);
        }
        else {
            return a;
        }

    }


//-------------------
// init lib
//--------------------
    void LiteC_registerCoreClasses(){

        CLASSES_size = 64;
        CLASSES = mem_alloc(CLASSES_size * sizeof(struct ClassInfo));

        CLASSES[UNDEFINED] = (struct ClassInfo){
            "undefined", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[TYPE_NULL] = (struct ClassInfo){
            "null", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[TYPE_BOOLEAN] = (struct ClassInfo){
            "boolean", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[TYPE_TypeID] = (struct ClassInfo){
            "TypeID", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[TYPE_INT32] = (struct ClassInfo){
            "int32", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[TYPE_INT64] = (struct ClassInfo){
            "int64", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        //TYPE_UINT32,
        //TYPE_UINT64,

        CLASSES[Number] = (struct ClassInfo){
            "Number", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[String] = (struct ClassInfo){
            "String", // str type name
            String__init, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type


        CLASSES[Array] = (struct ClassInfo){
            "Array", // str type name
            Array__init, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[Error] = (struct ClassInfo) {
            "Error", // str type name
            Error__init, // function __init
            sizeof(struct Error_s), //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[Function] = (struct ClassInfo) {
            "Function", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[Map] = (struct ClassInfo) {
            "Map", // str type name
            Array__init, // function __init
            0, //size_t instanceSize
            Array}; // super type

        /* bag of properties, map string=>any */
        CLASSES[Object] = (struct ClassInfo) {
            "Object", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            Map}; // super type

    };

    //---------------------
    void __registerClass (
            TypeID requiredID,
            str name,
            TypeID super, //proto type ID. Which type this type extends
            function_ptr initFn,
            size_t instanceSize
             ) {
            //create type info

        if (requiredID<=Object) fatal("__registerClass: id can't be <= Object class ID");

        if (requiredID>=CLASSES_size){
            CLASSES_size=requiredID+32;
            CLASSES = mem_realloc(CLASSES, CLASSES_size*sizeof(struct ClassInfo));
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


//----------------------
// Core Classes Methods
//----------------------
//----------------------
//----------------------
// String

   any String_indexOf(any this, any arguments) {
       // validate param types
       assert(this.constructor==String);
       assert(arguments.constructor==Array);
       if (arguments.length==0||this.value.str==NULL) return any_number(-1);
       //---------
       // define named params
       str searched = anyToStr(arguments.value.item[0]);
       size_t fromIndex = arguments.length>=2? anyToInt64(arguments.value.item[1]):0;
       //---------
       return any_number(utf8indexOf(this.value.str,searched,fromIndex));
   }

   any String_slice(any this, any arguments) {
       // validate param types
       assert(this.constructor==String);
       assert(arguments.constructor==Array);
       if (arguments.length==0) return this;
       //---------
       // define named params
       int64_t startPos = anyToInt64(arguments.value.item[0]);
       int64_t endPos = arguments.length>=2? anyToInt64(arguments.value.item[1]): this.length;
       //---------
       return any_str(utf8slice(this.value.str,startPos,endPos));
    }

    any String_toString(any this, any arguments) {
        return this;
    }

    any String_concat(any this, any arguments) {
        return _uptoString_concat(this,arguments);
    }

    any String_split(any this, any arguments) {
        _throw_noMethod(String,"split not implemented");
    }

//----------
// Error class


    any Error_toString(any this, any arguments) {
        return AS(Error,this)->message;
    }

//----------------------
// Array

    any Array_toString(any this, any arguments) {
        return any_str("[object Array]");
    }

    any Array_concat(any this, any arguments) {
        assert(this.constructor==Array);
        any result = Array__newFrom(this);
        for(int n=0;n<arguments.length;n++){
            if(arguments.value.item[n].constructor==Array){
                //recurse
                Array_concat(result,arguments.value.item[n]);
            }
            else { //single item
                Array_push(result,(any){Array,1,.value.item = &(arguments.value.item[n])});
            }
        }
        return result;
    }

    any Array_indexOf(any this, any arguments) {
        // validate param types
        assert(this.constructor==Array);
        assert(arguments.constructor==Array);
        if (arguments.length==0) return any_number(-1);
        //---------
        // define named params
        any searched = arguments.value.item[0];
        size_t fromIndex = arguments.length>=2? anyToInt64(arguments.value.item[1]):0;
        //---------
        for(int64_t inx=fromIndex;inx<this.length;inx++){
            if (__is(searched,this.value.item[inx])) return any_number(inx);
        }
        return any_number(-1);
   }

   any Array_slice(any this, any arguments) {
       // validate param types
       assert(this.constructor==Array);
       assert(arguments.constructor==Array);
       if (arguments.length==0) return this;
       //---------
       // define named params
       int64_t startPos = anyToInt64(arguments.value.item[0]);
       int64_t endPos = arguments.length>=2? anyToInt64(arguments.value.item[1]): this.length;
       //---------
       return Array__newFrom((any){Array,endPos-startPos,.value.item=this.value.item+startPos});
    }

    any Array_splice(any this, any arguments) {
       // validate param types
       assert(this.constructor==Array);
       assert(arguments.constructor==Array);
       if (arguments.length==0) return this;
       //---------
       // define named params
       int64_t startPos = anyToInt64(arguments.value.item[0]);
       int64_t howMany = arguments.length>=2? anyToInt64(arguments.value.item[1]): 0;
       any result={Array,0,.value.item=NULL};
       if (howMany>0){
            result=Array__newFrom((any){Array,howMany,.value.item=&this.value.item[startPos]});
            int64_t moveFromPos = startPos+howMany;
            if (moveFromPos>this.length) moveFromPos=this.length;
            if (moveFromPos<this.length){
                memcpy(this.value.item+startPos,this.value.item+moveFromPos, (this.length-moveFromPos)*sizeof(any));
                memset(this.value.item+this.length-howMany,0,howMany*sizeof(any));
            }
            this.length-=howMany;
       };
       //---------
       if (arguments.length>=3){ // push rest of params
            Array_push(this,(any){Array,arguments.length-2,.value.item=&arguments.value.item[2]});
       }
       return result;
   }


// Array_push
// core push dispatcher,
// should be added at generated .push dispatcher
    // , case Array: return Array_push(this, value);
    // default:
    //    _throw_noMethod(this.type,"push");

    any Array_push(any this, any arguments){

        size_t args_size;
        any* newSpaceStart;

        switch(arguments.length){
            case 0: break;
            default: // >0, items
                if (!this.length){
                    this.value.item = newSpaceStart = mem_alloc((args_size = (this.length=arguments.length)*sizeof(any)));
                }
                else {
                    newSpaceStart = &this.value.item[this.length];
                    this.value.item = mem_realloc(this.value.item, this.length*sizeof(any) + (args_size =(arguments.length*sizeof(any))));
                }
                memcpy(newSpaceStart,arguments.value.item,args_size );
        }
        return any_uint(this.length+=arguments.length);

    }


    any _uptoString_concat(any this, any arguments){
        if ((this.constructor==UNDEFINED||this.constructor==TYPE_NULL) && arguments.length==0){return any_EMPTY_STR;}
        str startStr;
        if (this.constructor==String) {
            if (arguments.length==0){return this;}
            startStr = this.value.str? this.value.str : EMPTY_STR;
        }
        else {
            startStr = anyToStr(this);
            if (arguments.length==0){return any_str(startStr);}
        }

        size_t size=strlen(startStr); // startStr[size]->'/0' char
        size_t bufSize = size + arguments.length*128;
        char * result = (char*)mem_alloc(bufSize);
        memcpy(result,startStr,size+1);

        int pos=size; // result[pos] is '/0' char
        assert(result[pos]=='\0');

        for(int n=0;n<arguments.length;n++){
            any item = arguments.value.item[n];
            str arg = anyToStr(item);
            size_t arglen = strlen(arg);
            size += arglen;
            if (size>=bufSize){
                result = (char*)mem_realloc(result, bufSize=size+1024);
            }
            memcpy(&result[pos],arg,arglen+1);
            pos+=arglen; // points to '/0' char
        };
        return any_str((str)mem_realloc(result,size)); //cut down to size, convert to any
    }


//----------------------
// Map

    any Map_toString(any this, any arguments){
        //return __concatToNULL("[",CLASSES[this.constructor].name,"]",NULL);
        return any_str("[object]");
    }

// ------------
// Print

    void print(any arguments){
        if (arguments.constructor==Array){
            for(int n=0;n<arguments.length;n++){
                printf("%s ",anyToStr(arguments.value.item[n]));
            }
        }
        else {
            printf(anyToStr(arguments));
        }
        printf("\n");
    }
