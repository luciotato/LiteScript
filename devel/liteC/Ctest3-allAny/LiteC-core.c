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
    int32_t CLASSES_size; //alloc'd


//--- Helper throw error functions

    any _newErr(str message){ //,.item=
        return new(Error_TYPEID,1, & any_str(message) );
    }

    any _noMethod(TypeID type, str method) {
        return any_str(__concatToNULL(
               "no method '",method,"' in type '",CLASSES[type].name,"'"
               , NULL
               ));
    }

    any _apply_function(function_ptr fn, any this, any args) {
        assert(args.type=Array_TYPEID);
        return fn(this,args.value.arr->length, args.value.arr->item);
    }

// --------------------
// Class__init core functions

    void Error__init(any this, len_t argc, any* arguments){
        // validate param types, define as typecast
        assert(this.type==Error_TYPEID);
        //---------
        ((Error_ptr)this.value.ptr)->message = argc? arguments[0]:any_EMPTY_STR;
        ((Error_ptr)this.value.ptr)->name = any_str("Error");
        ((Error_ptr)this.value.ptr)->extra = undefined;
    }

    any _newArrayWith(len_t initialLen, any* optionalValues){
        any a = {Array_TYPEID, .value.arr = mem_alloc(sizeof(Array_s))};
        size_t size = ((initialLen+32)>>5<<5)  * sizeof(any);
        a.value.arr->item = mem_alloc(size);
        a.value.arr->length = initialLen;
        if (initialLen && optionalValues) memcpy(a.value.arr->item, optionalValues, initialLen*sizeof(any));
        return a;
    };

    any _newArray(){
        return _newArrayWith(0,NULL);
    }
    any Array_clone(any this, len_t argc, any* arguments){
        assert(this.type==Array_TYPEID);
        return _newArrayWith(this.value.arr->length, this.value.arr->item);
    };

    any _newArrayFromCharPtrPtr(len_t argc, char** argv){
        // convert main function args into Array
        any a = _newArrayWith(argc,NULL);
        for(int32_t n=0;n<argc;n++){ a.value.arr->item[n]=any_str(argv[n]); }
        return a;
    };

    //init Fn for Array Objects
    void Array__init(any this, len_t argc, any* arguments){
        int64_t i64;
        any narr;
        switch(argc){
            case 0: break;
            case 1:
                i64 = anyToInt64(arguments[0]);
                if (i64>=UINT32_MAX) fatal("new Array, limit is UINT32_MAX ");
                narr = _newArrayWith((len_t)i64, NULL);
                this.value.arr->length = narr.value.arr->length;
                this.value.arr->item  = narr.value.arr->item;
                break;
            default: // >=1... push items
                narr = _newArrayWith(argc, arguments);
                this.value.arr->length = narr.value.arr->length;
                this.value.arr->item  = narr.value.arr->item;
        }
    };

//-------------------
// helper functions
//--------------------
// new - alloc mem space
// and init Object properties (first part of memory space)

    any new(TypeID type, len_t argc, any* arguments){

        any a = {type,.value.uint64=0}; //set type

        // valid type?
        if (type<0||type>CLASSES_size) fatal("new: invalid typeID");

        size_t size;
        if (size=CLASSES[type].instanceSize) {
            //alloc required memory
            a.value.ptr = mem_alloc(size);
        }

        if (CLASSES[type].__init) {
            //calls Class__init
            CLASSES[type].__init(a,argc,arguments);
        }

        return a;
    }

    //-- array index access [ ] with bound checks
    any __getItem(any this, double index){
        if(this.type!=Array_TYPEID){
            fprintf(stderr,"Array bounds check: accessing [%f]. not Array. this type is '%s'",index,CLASSES[this.type].name);
            fail_with("this._typeID != Array_TYPEID");
        }
        else if(this.value.arr==NULL){
            fprintf(stderr,"Array bounds check: accessing [%f]. this.value.arr==NULL",index);
            fail_with("this.value.arr==NULL");
        }
        else if(this.value.arr->item==NULL){
            fprintf(stderr,"Array bounds check: accessing [%f]. this.value.arr->item==NULL",index);
            fail_with("this.value.arr->item==NULL");
        }
        else if(index<0||index>=this.value.arr->length){
            fprintf(stderr,"Array bounds check: accessing [%f] on array[0..%d]",index,this.value.arr->length);
            fail_with("Array bounds exceeded");
        }
        else return this.value.arr->item[(len_t)index];
    }

//-------------------
// init lib
//--------------------
    void LiteC_registerCoreClasses(int argc, char** argv){

        //init process singleton
        process.value.ptr = mem_alloc(sizeof(struct process_s));
        ((process_ptr)process.value.ptr)->argv = _newArrayFromCharPtrPtr(argc,argv);

        CLASSES_size = 64;
        CLASSES = mem_alloc(CLASSES_size * sizeof(struct ClassInfo));

        CLASSES[MISSING] = (struct ClassInfo){
            "*MISSING*", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

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

        CLASSES[TYPE_BOOL] = (struct ClassInfo){
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

        CLASSES[Number_TYPEID] = (struct ClassInfo){
            "Number", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[String_TYPEID] = (struct ClassInfo){
            "String", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type


        CLASSES[Array_TYPEID] = (struct ClassInfo){
            "Array", // str type name
            Array__init, // function __init
            sizeof(Array_s), //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[Error_TYPEID] = (struct ClassInfo) {
            "Error", // str type name
            Error__init, // function __init
            sizeof(struct Error_s), //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[Function_TYPEID] = (struct ClassInfo) {
            "Function", // str type name
            NULL, // function __init
            0, //size_t instanceSize
            UNDEFINED}; // super type

        CLASSES[Map_TYPEID] = (struct ClassInfo) {
            "Map", // str type name
            Array__init, // function __init
            sizeof(Array_s), //size_t instanceSize
            Array_TYPEID}; // super type

        /* bag of properties, map string=>any */
        CLASSES[Object_TYPEID] = (struct ClassInfo) {
            "Object", // str type name
            NULL, // function __init
            sizeof(Array_s), //size_t instanceSize
            Map_TYPEID}; // super type

    };

    //---------------------
    void __registerClass (
            TypeID requiredID,
            str name,
            TypeID super, //proto type ID. Which type this type extends
            __init_ptr initFn,
            size_t instanceSize
             ) {
            //create type info

        if (requiredID<=Object_TYPEID) {
                fprintf(stderr,"__registerClass %d,'%s'",requiredID, name);
               fatal("__registerClass: id can't be <= Object class ID");
        }

        if (requiredID>=CLASSES_size){
            CLASSES_size=requiredID+32;
            CLASSES = mem_realloc(CLASSES, CLASSES_size*sizeof(struct ClassInfo));
        }

        if (CLASSES[requiredID].name!=NULL) fatal("__registerClass: id already taken");

        CLASSES[requiredID] = (struct ClassInfo){
            name, // str type name
            initFn, // function __init
            instanceSize, //size_t instanceSize
            super // super type
        };

        // return new index in CLASSES => TypeID
    };


//----------------------
// Core Classes Methods
//----------------------
//----------------------
//----------------------
// String

   any _default_toString(any this, len_t argc, any* arguments) {
       //generic toString, for all classes, ignore arguments
       return any_str(anyToStr(this));
   }

   any String_indexOf(any this, len_t argc, any* arguments) {
       // validate param types
       assert(this.type==String_TYPEID);
       if (argc==0) return any_number(-1);
       //---------
       // define named params
       str searched = anyToStr(arguments[0]);
       size_t fromIndex = argc>=2? anyToInt64(arguments[1]):0;
       //---------
       return any_number(utf8indexOf(this.value.str,searched,fromIndex));
   }

   any String_lastIndexOf(any this, len_t argc, any* arguments) {
       // validate param types
       assert(this.type==String_TYPEID);
       if (argc==0) return any_number(-1);
       //---------
       // define named params
       str searched = anyToStr(arguments[0]);
       size_t fromIndex = argc>=2? anyToInt64(arguments[1]):0;
       //---------
       return any_number(utf8lastIndexOf(this.value.str,searched,fromIndex));
   }

   any String_slice(any this, len_t argc, any* arguments) {
       // validate param types
       assert(this.type==String_TYPEID);
       if (argc==0) return this;
       //---------
       // define named params
       int64_t startPos = anyToInt64(arguments[0]);
       int64_t endPos = argc>=2? anyToInt64(arguments[1]): LLONG_MAX;
       //---------
       return any_str(utf8slice(this.value.str,startPos,endPos));
    }

    any String_split(any this, len_t argc, any* arguments) {
        fatal("split not implemented");
    }


    // concat
    any any_concat(any this, len_t argc, any* arguments){
        return _stringJoin(NULL, argc, arguments,NULL);
    }

    any _stringJoin(str initial, int32_t argc, any* arguments, str separ){

        int32_t count=0;

        Buffer_s buf = _newBuffer();
        if (initial) {
            _Buffer_addStr(&buf,initial);
            count++;
        }

        for(int32_t n=0;n<argc;n++){
            if (separ && count++) _Buffer_addStr(&buf,separ);
            any s = _toString(arguments[n],0,NULL);
            _Buffer_addStr(&buf,s.value.str);
        };

        _Buffer_add0(buf);
        return any_str(buf.ptr); //convert to any
    }

    any String_concat(any this, len_t argc, any* arguments){
        assert(this.type==String_TYPEID);
        //trivial cases
        if (argc==0) return this;
        return _stringJoin(this.value.str,argc,arguments,NULL);
    }


//----------------------
// Array

// Array_push

    void _array_realloc(Array_s *arr, len_t newLen){
        size_t actualSize = GC_size(arr->item);
        size_t newSize = ((newLen+32)>>5<<5)*sizeof(any);
        if (actualSize < newSize || actualSize-newSize > 100*1024){
            arr->item = mem_realloc(arr->item, newSize);
        }
    }

    any Array_push(any this, len_t argc, any* arguments){
        if(argc){
            len_t len = this.value.arr->length;
            _array_realloc(this.value.arr, len+argc);
            memcpy(this.value.arr->item + len, arguments, argc*sizeof(any));
        }
        return any_number(this.value.arr->length+=argc);
    }

    any Array_pushConcat(any this, len_t argc, any* arguments) {
        // flatten arrays, pushes elements
        assert(this.type==Array_TYPEID);
        for(int32_t n=0;n<argc;n++){
            if(arguments[n].type==Array_TYPEID){
                //recurse
                Array_pushConcat(this, arguments[n].value.arr->length, arguments[n].value.arr->item );
            }
            else { //single item
                Array_push(this,1,arguments+n);
            }
        }
        return any_number(this.value.arr->length);
    }

    any Array_concat(any this, len_t argc, any* arguments) {
        //array do not mutate
        assert(this.type==Array_TYPEID);
        return Array_pushConcat( Array_clone(this,0,NULL), argc, arguments) ;
    }

    any Array_indexOf(any this, len_t argc, any* arguments) {
        // validate param types
        assert(this.type==Array_TYPEID);
        if (argc==0) return any_number(-1);
        //---------
        // define named params
        any searched = arguments[0];
        size_t fromIndex = argc>=2? anyToInt64(arguments[1]):0;
        //---------
        for(int64_t inx=fromIndex;inx<this.value.arr->length;inx++){
            if (__is(searched,this.value.arr->item[inx])) return any_number(inx);
        }
        return any_number(-1);
   }

    any Array_lastIndexOf(any this, len_t argc, any* arguments) {
        // validate param types
        assert(this.type==Array_TYPEID);
        if (argc==0) return any_number(-1);
        //---------
        // define named params
        any searched = arguments[0];
        size_t fromIndex = argc>=2? anyToInt64(arguments[1]):this.value.arr->length-1;
        //---------
        if (fromIndex>=0) {
            for(int64_t inx=fromIndex;inx>=0;inx--){
                if (__is(searched,this.value.arr->item[inx])) return any_number(inx);
            }
        }
        return any_number(-1);
   }

   any Array_slice(any this, len_t argc, any* arguments) {
       // validate param types
       assert(this.type==Array_TYPEID);
       if (argc==0) return this;
       //---------
       // define named params
       len_t len = this.value.arr->length;
       int64_t startPos = anyToInt64(arguments[0]);
       int64_t endPos = argc>=2? anyToInt64(arguments[1]): len;
       //---------
       if (startPos<0) if ((startPos+=len)<0) startPos=0;
       if (endPos<0) if ((endPos+=len)<0) endPos=0;
       return _newArrayWith(endPos-startPos, this.value.arr->item + startPos);
    }

    any _array_splice(any this, int64_t startPos, len_t deleteHowMany, len_t toInsert, any* toInsertItems) {
        len_t len = this.value.arr->length;
        //---------
        if (startPos<0) if ((startPos+=len)<0) startPos=0;
        if (startPos+deleteHowMany>len) deleteHowMany = len-startPos;
        any result= _newArrayWith(deleteHowMany, this.value.arr->item+startPos); // newArray handles argc==0
        len_t moveFromPos = startPos+deleteHowMany;
        len_t amount=len-moveFromPos;
        len_t moveToPos = startPos + toInsert;
        if (amount && moveFromPos>moveToPos) {
            //delete some
            memcpy(this.value.arr->item + moveToPos, this.value.arr->item + moveFromPos, amount*sizeof(any));
            //clear space
            memset(this.value.arr->item + len - (moveFromPos-moveToPos), 0, (moveFromPos-moveToPos)*sizeof(any));
        }
        else if(moveFromPos<moveToPos){ //insert some
            _array_realloc(this.value.arr, len + moveToPos-moveFromPos);
            //make space
            memcpy(this.value.arr->item + moveToPos, this.value.arr->item + moveFromPos, amount*sizeof(any));
        }

        //insert new items
        if (toInsert) memcpy(this.value.arr->item + moveFromPos, toInsertItems, toInsert*sizeof(any));
        // recalc length
        this.value.arr->length += toInsert-deleteHowMany;
        return result;

    }

   any Array_splice(any this, len_t argc, any* arguments) {
        // validate param types
        assert(this.type==Array_TYPEID);
        if (argc==0) return this;
        //---------
        // define named params
        int64_t startPos = anyToInt64(arguments[0]);
        len_t deleteHowMany = argc>=2? anyToNumber(arguments[1]): 0;
        len_t toInsert = argc>=3? argc-2: 0;
        any* toInsertItems = argc>=3? arguments+2: NULL;
        return _array_splice(this,startPos,deleteHowMany,toInsert, toInsertItems);
    };

    any Array_unshift(any this, len_t argc, any* arguments){
       // insert arguments at array position 0
       return _array_splice(this,0,0,argc,arguments);
    }

    any Array_pop(any this, len_t argc, any* arguments){
       // validate param types
       assert(this.type==Array_TYPEID);
       if (this.value.arr->length==0) return undefined;
       return this.value.arr->item[--this.value.arr->length];
    }

    any Array_join(any this, len_t argc, any* arguments){
       // validate param types
       assert(this.type==Array_TYPEID);
       //---------
       // define named params
       str separ= argc? anyToStr(arguments[0]): ",";
       return _stringJoin(NULL,this.value.arr->length, this.value.arr->item,separ);
    }


//----------------------
// Map = js Object, array of props

    any Map_toString(any this, len_t argc, any* arguments){
        //return __concatToNULL("[",CLASSES[this.constructor].name,"]",NULL);
        return any_str("[object]");
    }

    any Map_get(any this, len_t argc, any* arguments){
    }

    any Map_has(any this, len_t argc, any* arguments) {
    }

    any Map_set(any this, len_t argc, any* arguments){

    }
    any Map_delete(any this, len_t argc, any* arguments){

    }
    any Map_clear( any this, len_t argc, any* arguments ){

    }

// ------------
// console

    any console = {console_TYPEID,.value.typeID=console_TYPEID};

    any console_log_(any this, len_t argc, any* arguments){
        any s;
        for(len_t n=0;n<argc;n++){
            s = _toString(arguments[n],0,NULL);
            printf("%s ",s.value.str);
        }
        printf("\n");
    }

    any console_error_(any this, len_t argc, any* arguments){
        any s;
        for(len_t n=0;n<argc;n++){
            s = _toString(arguments[n],0,NULL);
            fprintf(stderr,"%s ",s.value.str);
        }
        fprintf(stderr,"\n");
    }

// ------------
// process

    any process = {process_TYPEID,.value.ptr=NULL};

    any process_exit_(any this, len_t argc, any* arguments){
        int64_t code = argc? anyToInt64(arguments[0]): 0;
        exit(code);
    }

    any process_cwd(any this, len_t argc, any* arguments){
       any b = _newStrSize(1024);
       if (!getcwd(b.value.ptr, 1024)) fatal("getcwd() error");
       return b;
    }
