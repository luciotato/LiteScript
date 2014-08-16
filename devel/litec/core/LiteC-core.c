/** LiteC Core.
 * core support for Lite-to-c compiled code
 *
 * --------------------------------
 * LiteScript lang - gtihub.com/luciotato/LiteScript
 * Copyright (c) 2014 Lucio M. Tato
 * --------------------------------
 * This file is part of LiteScript.
 * LiteScript is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation version 3.
 * LiteScript is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details. You should have received a copy of the
 * GNU Affero General Public License along with LiteScript.  If not, see <http://www.gnu.org/licenses/>.
 */

#include "LiteC-core.h"

    any
        LiteCore_version, LiteCore_buildDate;

// _symbol names
    any * _symbolTable;
    symbol_t _symbolTableLength, _symbolTableCenter; //need to be int, beacuse symbols are positive and negative
    symbol_t _allPropsLength, _allMethodsLength, _allMethodsMax;
    any * _symbol; /**< table "center", symbol:0, prop "constructor". method symbols are negative
                   * To get a symbol name: printf("symbol %d is %s",x,_symbol[x]);
                   */

// core method names
    static str _CORE_METHODS_NAMES[]={

        "push"
        ,"pop"
        ,"shift"
        ,"unshift"
        ,"join"
        ,"splice"
        ,"tryGet"
        ,"sort"

        ,"toISOString"
        ,"toUTCString"
        ,"toDateString"
        ,"toTimeString"

        ,"copy"  //Buffer
        ,"write"
        ,"append"

        ,"slice"
        ,"split"
        ,"indexOf"
        ,"lastIndexOf"
        ,"concat"
        ,"toLowerCase"
        ,"toUpperCase"
        ,"charAt"
        ,"charCodeAt"
        ,"replaceAll"
        ,"trim"
        ,"substr"
        ,"countSpaces"
        ,"repeat"

        ,"byteSubstr"
        ,"byteIndexOf"
        ,"byteSlice"

        ,"tryGetMethod"
        ,"tryGetProperty"
        ,"getProperty"
        ,"getPropertyNameAtIndex"
        ,"setProperty"
        ,"hasProperty"
        ,"hasOwnProperty"
        ,"allPropertyNames"
        ,"initFromObject"

        ,"has"
        ,"get"
        ,"set"
        ,"delete"
        ,"clear"
        ,"keys"

        ,"iterableNext"
        ,"next"
        ,"toString"

    };

    static str _CORE_PROPS_NAMES[]= {
        "constructor" //all instances, symbol:0
        ,"name" // Class.name | NameValuePair
        ,"initInstance" // Class.initInstance

        ,"key" // Map | Iterable_Position
        ,"value" // NameValuePair | Iterable_Position
        ,"index" // Iterable_Position
        ,"size" // Map | Iterable_Position
        ,"iterable" // Iterable_Position
        ,"extra" // Iterable_Position

        ,"message" // Error.message
        ,"stack" // Error.stack
        ,"code" // Error.code
    };

// core classes array: CLASSES-------------------

    len_t CLASSES_allocd;
    len_t CLASSES_len;
    ARRAY_OF(Class_s, CLASSES); //array of registered classes
    ARRAY_OF(any, any_CLASSES); //array of any vars with registered classes. any_CLASSES[x] = (any){.class=Class_inx,.value.ptr=&CLASSES[x]}

// core Classes (any) -------------------

    any
        Undefined, Null, NotANumber, InfinityClass,
        Object, Class, Function, Iterable_Position,
        String, Boolean, Number, Date,
        Array, Map, NameValuePair,
        Error, Buffer, FileDescriptor;

// core-class instances -------------------

    /**
     * undefined is the only value initializable here
     * with constant values, all zeroes
     */
    any undefined = {0};

    any
        null, true, false,
        NaN, Infinity,
        process_argv,
        __dirname;

// --------------------------
// _typeof, _instanceof
// --------------------------
    //#define _typeof(S) CLASSES[S.class].typeName
    //any _typeof(any this){
    //    return CLASSES[this.class].typeName;
    //}

    bool _instanceof(any this, any searchedClass){
        assert(searchedClass.class==Class_inx); //searchedClass should be a Class
        class_t searchedClassInx = searchedClass.value.classPtr->classInx;
        //follow the inheritance chain, until 0 or searched class inx found
        for( ; this.class; this.class=CLASSES[this.class].super) {
            if(this.class == searchedClassInx) return TRUE;
        }
        return FALSE;
    }

//--- debug helpers

    int Buffer_buffers_length=0;
    int Buffer_mallocd_count=0;
    int Cloned_to_CString=0;
    int Flatten_calls=0;

    void debug_abort(str file,int line, str func, any message){
        str cmsg = _tempCString(message);
        //__assert_fail(cmsg,file,line,NULL);
        fprintf(stderr,"%s:%d:1 function %s: %s\n",file,line,func,cmsg);
        fflush(stderr);
        abort();
    }


    function_ptr __classInxMethod(symbol_t symbol, class_t class){
        assert(symbol < 0);
        assert( -symbol < _allMethodsLength);
        assert(class < CLASSES_len);
        jmpTable_t jmpTable = CLASSES[class].method;
        function_ptr fn;
        if ( -symbol < TABLE_LENGTH(jmpTable) && (fn=jmpTable[-symbol])){
            return fn;
        }

        throw(_newErr(_concatAny(5
            ,any_LTR("no method '")
            ,_symbol[symbol]
            ,any_LTR("' on class '")
            ,CLASSES[class].name
            ,any_SINGLE_QUOTE
            )));
    }

    /**
     * #ifdef NDEBUG, macro METHOD resolves to __method().
     * Note: for no-checks code, CALL resolves to direct jmp: CLASSES[this.class].method[-symbol](this,argc,arguments)
     */
    function_ptr __classMethod(symbol_t symbol, any anyClass){
        assert(anyClass.class=Class_inx);
        return __classInxMethod(symbol, anyClass.value.classPtr->classInx);
    }

    any __call(symbol_t symbol, DEFAULT_ARGUMENTS){
        function_ptr fn = __classInxMethod(symbol, this.class);
        return fn(this,argc,arguments);
    }


    any __classMethodFunc(symbol_t symbol, any anyClass){
        return any_func(__classMethod(symbol, anyClass));
    }

    function_ptr __method(symbol_t symbol, any this){
        return __classInxMethod(symbol, this.class);
    }

    any* watchedPropAddr; //debug help

    /** #ifdef NDEBUG, macro PROP resolves to __prop().
     * else PROP resolves to direct access: this.value.instance[this.class->pos[prop]].
     *
     * get a reference to a property value
     */
    any* __prop(symbol_t symbol, any this, str file, int line, str func, str varName){

        assert(symbol>0); // prop can't be 0. symbol:0 is "constructor" and gets short-circuited to props[0]
        assert(symbol<_allPropsLength);

        posTable_t posTable = CLASSES[this.class].pos;
        propIndex_t pos;

        if (symbol < TABLE_LENGTH(posTable) && (pos=posTable[symbol]) != INVALID_PROP_POS){

            //DEBUG: break when property is accessed
            if (&(this.value.prop[pos])==watchedPropAddr){
               //raise(SIGTRAP);
               symbol=symbol; //place a breakpoint here
            }

            return &(this.value.prop[pos]);
        }

        // on invalid property, we do not return "undefined" as js does
        throw(_newErr(_concatAny(11
                ,any_CStr(file)
                ,any_COLON
                ,any_number(line)
                ,any_LTR(":1 function ")
                ,any_CStr(func)
                ,any_LTR(":\n  no property '")
                ,_symbol[symbol]
                ,any_LTR("' on ")
                ,any_CStr(varName)
                ,any_LTR(" class:")
                ,CLASSES[this.class].name
                )));
    }

    any* __itemAny(int64_t index, any arrProp, str file, int line, str func){

        if (arrProp.class!=Array_inx) {
            debug_abort(file,line,func,any_LTR(" index access: [], object isnt instance of Array"));
        }
        if (index<0) {
            debug_abort(file,line,func,any_LTR("index access: [], negative index"));
        }

        // check index against arr->length
        if (index >= arrProp.value.arr->length){
            throw(_newErr(_concatAny(9
                    ,any_CStr(file)
                    ,any_COLON
                    ,any_number(line)
                    ,any_LTR(":1 function ")
                    ,any_CStr(func)
                    ,any_LTR(". OUT OF BOUNDS index[")
                    ,any_number(index)
                    ,any_LTR("]. Array.length is ")
                    ,any_number(arrProp.value.arr->length)
                    )));
        }
        return arrProp.value.arr->base.anyPtr+index;

    }

    void* __itemPtr(int64_t index, Array_ptr arr, str file, int line, str func){

        if (index<0) {
            debug_abort(file,line,func,any_LTR("index access: [], negative index"));
        }

        // check index against arr->length
        if (index >= arr->length){
            throw(_newErr(_concatAny(9
                    ,any_CStr(file)
                    ,any_COLON
                    ,any_number(line)
                    ,any_LTR(":1 function ")
                    ,any_CStr(func)
                    ,any_LTR(". OUT OF BOUNDS index[")
                    ,any_number(index)
                    ,any_LTR("]. Array.length is ")
                    ,any_number(arr->length)
                    )));
        }

        return arr->base.bytePtr + index*arr->itemSize;

    }

    /**
     * Note: to be js-compat, a _tryGet() array method is provided
     * Array.tryGet() will just return "undefined"
     * instead of raising an exception / SEGFAULT
     */
    any Array_tryGet(DEFAULT_ARGUMENTS){
        assert_arg(Number);
        if (!_instanceof(this,Array)) {
            fail_with("Array_tryGet(), object isnt instance of Array");
        }
        //get index from argument 0
        int64_t index=(int64_t)arguments[0].value.number;
        // check index against arr->length
        if (index<0 || index >= this.value.arr->length){
            //Note: to be js-compat, tryGet just returns "undefined"
            return undefined;
        }
        return this.value.arr->base.anyPtr[index];
    }

    /**
     * get a reference to a value at a index in an array.
     *
     * get & set from Array
     */
    any* __item2(int index, int arrPropName, any this, str file, int line, str func, str varName){
        // get array property
        var arrProp = *(__prop(arrPropName,this,file,line,func,varName));
        if (! _instanceof(arrProp,Array)){
            debug_abort(file,line,func,_concatAny(7
                    ,any_LTR("access index[")
                    ,any_number(index)
                    ,any_LTR(")]: property '")
                    ,_symbol[arrPropName]
                    ,any_LTR("' on class '")
                    ,CLASSES[this.class].name
                    ,any_LTR("' is not instance of Array")
                    ));
        }
        return __itemAny(index,arrProp,file,line,func);
    }

    /** js function.apply - call a function with specific values for: this, argc, arguments
    */
    any __apply(any anyFunc, len_t argc, any* arguments){
        assert(argc>=1);
        assert(anyFunc.class==Function_inx);
        assert(anyFunc.value.ptr);
        return ((function_ptr)anyFunc.value.ptr)(arguments[0],argc-1,&arguments[1]);
    }

    any __applyArr(any anyFunc, len_t argc, any* arguments){
        assert(anyFunc.class==Function_inx);
        assert(argc=2);
        assert(arguments[1].class==Array_inx); //must be array to convert to argc,any* arguments
        return ((function_ptr)anyFunc.value.ptr)(arguments[0],arguments[1].value.arr->length, arguments[1].value.arr->base.anyPtr);
    }

    void _default(any* variable,any value){
        if (variable->class==Undefined_inx) *variable=value;
    }


    IteratorCursor_s _newIterator(any s){
        return (IteratorCursor_s){
            .str = NULL, // pre-start
            .sliceCount = s.res? s.len: 0,
            .slicePtr = s.value.slices,
            .origin = s
        };
    }

    str _getNext(IteratorCursor_ptr i){
        if(!i->str) {// i->str==NULL means: pre-start
            if (!i->sliceCount){ //simple, no slices
                i->str = i->origin.value.str;
                i->charCount = i->origin.len;
                assert(i->str && i->charCount);
            };
        }

        //get next
        if (!i->charCount) {//if no more chars
            if (!i->sliceCount) return NULL; //return NULL if also no more slices
            i->str = i->slicePtr->str;
            i->charCount = i->slicePtr->byteLen;
            assert(i->charCount);
            i->slicePtr++;
            i->sliceCount--;
        }

        str actual = i->str;
        if (i->charCount--) i->str++; //only increment if there's more chars, do not point outside area
        return actual;
    }

    int __compareStrings(any strA, any strB){  //js triple-equal, "==="
        str ap,bp;
        int result;
        //handles String|ConcatdSlices vs String|ConcatdSlices
        IteratorCursor_s a = _newIterator(strA);
        IteratorCursor_s b = _newIterator(strB);
        while(TRUE){
            ap=_getNext(&a);
            bp=_getNext(&b);
            if(ap==bp && !ap) return 0; //both reached end
            if(!ap) return -1; // a reached end, b is GT
            if(!bp) return 1; // b reached end, a is GT
            if(result=(*ap - *bp)) return result; //a.char !== b.char
        }
    }

/* js's 'or' (||) operator returns first expression if it's true, second expression is first is false, 0 if both are false
   so 'or' can be used to set a default value if first value is "falsey" (undefined,0,null or "").
   C's '||' operator, returns 1 (not the first expression. Expressions are discarded in C's ||)

   We'll use a ternary operator to emulate js behavior

   code js "||" in C, using ternary if ?:

   js: `A || B`
   C: `any __or1;`
      `(_anyToBool(__or1=A)? __or1 : B)`

 */

    bool __inLiteralArray(any needle, len_t haystackLength, any* haystackItem){
        if (!haystackLength) return FALSE; //empty haystack
        for(;haystackLength--;){
            if (__is(needle,*haystackItem++)) return TRUE;
        }
        return FALSE;
    }

// --------------------
// core classes helper register functions

    jmpTable_t _newJmpTableFrom(jmpTable_t superJmptable){
        jmpTable_t table = mem_alloc( _allMethodsLength * sizeof(function_ptr));
        if (superJmptable) memcpy(table, superJmptable, TABLE_LENGTH(superJmptable) * sizeof(function_ptr)); //copy super jmp table
        //AFTER memcpy, set length. (memcpy copies super TABLE_LENGTH)
        TABLE_LENGTH(table)=_allMethodsLength; //table[0] holds table length. table lengths can increase if more symbols are registered
        return table;
    }

    posTable_t _newPosTableFrom(posTable_t superPosTable){
        posTable_t table = mem_alloc( _allPropsLength*sizeof(propIndex_t) );
        memset(table,0xFF,_allPropsLength*sizeof(propIndex_t)); //0xFFFF means invalid property
        if (superPosTable) memcpy(table, superPosTable, TABLE_LENGTH(superPosTable) * sizeof(propIndex_t)); //copy super prop rel pos table
        //AFTER memcpy, set length. (memcpy copies super TABLE_LENGTH)
        TABLE_LENGTH(table) = _allPropsLength; //table[0] holds table length. table lengths can increase if more symbols are registered
        return table;
    }

// --------------------
// core classes __init functions

    void Error__init(DEFAULT_ARGUMENTS){
        ((Error_ptr)this.value.ptr)->message = argc? arguments[0]:any_EMPTY_STR;
        ((Error_ptr)this.value.ptr)->name = any_LTR("Error");
    }

    any _newErr(any msg){
        return new(Error,1,(any_arr){msg});
    }

    Array_ptr _initArrayStruct(Array_ptr arrPtr, uint16_t itemSize, len_t initialAlloc){
        assert(arrPtr);
        arrPtr->itemSize = itemSize;
        arrPtr->allocd = initialAlloc>=4? initialAlloc : 4;
        arrPtr->base.anyPtr = mem_alloc(arrPtr->allocd * itemSize);
        arrPtr->length=0;
        return arrPtr;
    };

    Array_ptr _setArrayItems(Array_ptr arrPtr, uint16_t itemLen, len_t argc, void* contents){
        assert(argc && contents);
        assert(arrPtr->allocd>=argc);
        assert(arrPtr->itemSize==itemLen);
        arrPtr->length=argc;
        memcpy(arrPtr->base.bytePtr, contents, argc*arrPtr->itemSize);
    }

    void _zeroArrayItems(Array_ptr arrPtr, len_t count){
        memset(arrPtr->base.anyPtr, 0, count*arrPtr->itemSize);
    }

    /**
     * returns any{class=Array_inx} Array of any
     * @param initialLen
     * @param optionalValues
     * @return
     */
    any _newArray(len_t initialLen, any* optionalValues){
        any arr={Array_inx,
                .res=0,
                .len=0,
                .value.ptr=mem_alloc(sizeof(struct Array_s))
        };
        _initArrayStruct(arr.value.ptr, sizeof(any), initialLen+4);
        if (initialLen && optionalValues) _setArrayItems(arr.value.ptr, sizeof(any), initialLen, optionalValues);

        return arr;
    }

    any Array_clone(any this, len_t argc, any* arguments){
        return _newArray(this.value.arr->length, this.value.arr->base.anyPtr);
    };

    any _newArrayFromCharPtrPtr(len_t argc, char** argv){
        // convert main function args into Array
        any a = _newArray(argc,NULL);
        a.value.arr->length = argc;
        any* item = a.value.arr->base.anyPtr;
        for(;argc--;argv++){
              *item++=any_CStr(*argv);
        }
        return a;
    };

    //init Fn for Array Objects, called from new() after instance space allocd
    void Array__init(DEFAULT_ARGUMENTS){
        // this.value.arr->item == NULL here. (after new())
        // we must initialize it
        //----
        // to be js compat. If only arg is a Number, is the initial size of an empty arr
        if(argc==1 && arguments[0].class==Number_inx) {
            if (arguments[0].value.number >= UINT32_MAX) fatal("new Array, length limit is 4,294,967,296");
            len_t len = arguments[0].value.number;
            _initArrayStruct(this.value.arr, sizeof(any),len);
            this.value.arr->length = len; //force length - all values => undefined
        }
        else { //init with values argc,arguments
            _initArrayStruct(this.value.arr, sizeof(any), argc+4);
            if (argc) _setArrayItems(this.value.arr, sizeof(any), argc, arguments);
        }
    };

    //init Fn for Map Objects. arguments can be a argc NameValuePairs initializing the map
    //new Map(this,argc,(any_arr){NameValuePair,*})
    void Map__init(DEFAULT_ARGUMENTS){

        //Map is implemented with an internal array of NameValuePair
        // and also a KeyTree string->index for fast access
        //
        this.value.map->size=any_number(argc);
        Array_ptr nvpArr=&(this.value.map->nvpArr);
        _initArrayStruct(nvpArr, sizeof(NameValuePair_s), argc+4);

        //init keyTree
        _initKeyTreeRootStruct(&this.value.map->keyTreeRoot,8);

        //init map's nvp array with passed args
        if (argc){
            for(len_t inxValue=0; argc--; arguments++,inxValue++) {
                assert(arguments->class==NameValuePair_inx);
                NameValuePair_ptr argNvp = (NameValuePair_ptr)arguments->value.ptr;

                int64_t found = _map_KeyTree_do(this.value.map,FIND_OR_INSERT,argNvp->name,inxValue);
                if (found!=inxValue){ //key already-exists
                    throw(_newErr(_concatAny(3,any_LTR("Map: Duplicate key:'"),argNvp->name,any_SINGLE_QUOTE)));
                }
                //store nvp
                _array_push(nvpArr,argNvp);
            }

            this.value.map->size = any_number(nvpArr->length); //keep "size" property in sync
            }
    };

    //initFromObject for Map Objects. arguments are argc NameValuePairs initializing the map
    //Map_newFromObject(this,argc,(any_arr){NameValuePair,*})
    any Map_newFromObject(DEFAULT_ARGUMENTS){
        assert_arg(Map);
        return arguments[0];
    };

    void NameValuePair__init(DEFAULT_ARGUMENTS){
        assert(argc==2);
        ((NameValuePair_ptr)this.value.ptr)->name=arguments[0];
        ((NameValuePair_ptr)this.value.ptr)->value=arguments[1];
    };

    any _newPair(str name, any value){
        return new(NameValuePair,2,(any_arr){any_CStr(name),value});
    }

//-------------------
// helper functions
//--------------------

    /** function new
     *
     * alloc instance mem space, and init Object properties (first part of memory space)
     */
    any new(any anyClass, len_t argc, any* arguments){
        assert(anyClass.class==Class_inx);

        //initialize result instance var
        any a = {.class=anyClass.value.classPtr->classInx //set .class index
                ,.res=0
                ,.len=0
                ,.value.ptr=NULL
        };

        // valid class?
        assert(a.class<CLASSES_len);

        //alloc instance space
        size_t size;
        if (size=CLASSES[a.class].instanceSize) {
            //alloc required memory
            a.value.prop = mem_alloc(size);
            // init all props with undefined
            memset(a.value.prop, 0, size);
        }

        //call class init
        function_ptr fn;
        if (fn=CLASSES[a.class].initInstance.value.ptr) {
            //call Class__init
            fn(a,argc,arguments);
        }
        else if (a.class==Date_inx) { //Date is the only AnyBoxedValue returning a different value on each call to New
            a.value.time=time(NULL);
        }

        return a;
    }

//---------------------
//---------------------
//--- Helper _newXX functions

    any _newClass ( str className, __initFn_ptr initFn, len_t instanceSize, any super) {
        //create type info
        assert(className);
        assert(instanceSize<UINT32_MAX);
        assert(super.class=Class_inx);
        //---------
        // sanity checks
        // super class should be initialized before creating this classs
        if (!super.value.classPtr) fatal("super.value.classPtr is NULL");
        if (!_anyToBool(super.value.classPtr->name)) fatal("super not initalized");
        // instance size should at least super's instance size
        if (instanceSize < super.value.classPtr->instanceSize) fatal("instanceSize cannot be smaller than super");
        //---------
        if (CLASSES_len>=CLASSES_allocd){
            //cannot realloc CLASSES[] because a memory move will invalidate
            //all pointers (.value.classPtr) already at classes vars
            fatal("not enough space to register a new class");
        }
        class_t newClassIndex = CLASSES_len;
        Class_ptr Cl = &CLASSES[CLASSES_len];
        //---------
        // any, visible props
        Cl->name = any_CStr(className);
        Cl->initInstance = any_func(initFn);
        // native, invisible
        Cl->classInx = newClassIndex;
        Cl->super = super.value.classPtr->classInx;
        Cl->instanceSize = instanceSize; // created instances memory size

        #ifndef NDEBUG
        /*fprintf(stderr, "init class [%s]\n"
                "instanceSize:%" PRIu32 " sizeof(any):%d  propsLength:%d\n"
                "super: %s  super instanceSize:%" PRIu32 " super propsLength:%d\n-------\n"
                ,arguments[0].value.str
                ,instanceSize,sizeof(any),(int)instanceSize/sizeof(any)
                ,super->name.value.str, super->instanceSize, (int)super->instanceSize/sizeof(any));
        */
        #endif
        Cl->method = _newJmpTableFrom(super.value.classPtr->method); //starts with super's jmp table
        Cl->pos = _newPosTableFrom(super.value.classPtr->pos); //starts with super's props table

        // classes as vars of type Class
        any_CLASSES[CLASSES_len]=(any){.class=Class_inx,.res=0,.len=0,.value.ptr=Cl};

        CLASSES_len++;

        return any_class(newClassIndex);
    };

    /**
     * newFromObject for any class
     * @param this Class to create
     * @param argc 1
     * @param arguments arguments[0] should be a Map with name:value
     * @return instance of this:Class, initialized with Map values
     */
    any _newFromObject ( any anyClass, len_t argc, any* arguments) {
        assert_arg(Map);

        //if the required class is Map, no conversion required
        if (anyClass.value.classPtr==Map.value.classPtr) return arguments[0];

        //else, create instance and assign properties from map
        Map_ptr theMap=arguments[0].value.map;
        var newInstance = new(anyClass,0,NULL);
        len_t len = theMap->size.value.number;
        assert(len==theMap->nvpArr.length);
        //assign properties from map
        NameValuePair_ptr nvp = theMap->nvpArr.base.nvp;
        for(; len--; nvp++){
            Object_setProperty(newInstance,2,(any_arr){nvp->name,nvp->value});
        }
        return newInstance;
    };

    /**
     * _fastNew(class,argc, symbol_,anyValue, symbol_,anyValue,...)
     * @param anyClass instance to create
     * @param argc how many pairs of symbol_:anyValue
     * @return
     */
    any _fastNew(any anyClass, len_t argc, ...) {
        assert(argc>0);

        va_list argPointer; //create ptr to arguments
        va_start(argPointer, argc); //make argPointer point to first argument *after* arg

        var instance = new(anyClass,0,NULL);

        any value;
        int symbol;
        while(argc--) {
            symbol = va_arg(argPointer,int);
            value = va_arg(argPointer,any);
            *PROP_PTR(symbol,instance) = value;
        }
        return instance; //return created instance
    }


    any _newStringSize(len_t memSize){
        //create a new String, make space for size-1 ASCII chars + '\0'
        // max length is size-1
        return (any){String_inx, .res=0, .len=0, .value.ptr=mem_alloc(memSize)};
    }

    any _newString(str source, len_t len){
        assert(source);
        assert(len>=0);
        if (!len) return any_EMPTY_STR;
        any a = _newStringSize(len+1); //+1 fo null-terminator
        memcpy(a.value.ptr, source, len);
        a.value.charPtr[len]=0; //null terminated
        a.len=len;
        return a;
    }

    #define CONCATD_ITEMS_PER_RES 8
    any _newConcatdSlices(){
        return (any){String_inx, .res=1, .len=0, .value.ptr=mem_alloc(CONCATD_ITEMS_PER_RES*sizeof(ConcatdItem_s))};
    }


//----------------------
// Core Classes Methods
//----------------------

    //----------------------
    // global LiteC functions
    //----------------------
    symbol_t _tryGetSymbol(any name) {
        _FLATTEN(name);
        for(int n=-_allMethodsMax; n<_allPropsLength; n++){
            if (_symbol[n].len==name.len){
                if(__is(_symbol[n],name)) return n;
            }
        }
        return 0;
    }

    symbol_t _getSymbol(any nameOrNumber) {
        symbol_t symbol;
        if (nameOrNumber.class==String_inx){
            _FLATTEN(nameOrNumber);
            if (__is(nameOrNumber,any_LTR("constructor"))) return 0;
            if (!(symbol=_tryGetSymbol(nameOrNumber))){
                throw(_newErr(_concatAny(3
                        ,any_LTR("invalid symbol: '")
                        ,nameOrNumber
                        ,any_LTR("'"))));
            }
        }
        else if (nameOrNumber.class==Number_inx){
            symbol = (symbol_t)int64_from_Number(nameOrNumber);
            if (symbol < -_allMethodsMax || symbol >= _allPropsLength) {
                throw(_newErr(_concatAny(2
                        ,any_LTR("invalid symbol number: "),nameOrNumber
                        )));
            }
        }
        else fatal("_getSymbol: expected string or number");

        return symbol;
    }

    //callable from LiteScript
    //function LiteCore_getSymbol(symbolName:string) returns number
    // get symbol (number) from Symbol name (string)
    any LiteCore_getSymbol(DEFAULT_ARGUMENTS){
        return any_number(_getSymbol(arguments[0]));
    }

    //callable from LiteScript
    //function LiteCore_getSymbolName(symbol) returns string
    // get symbol name from Symbol (number or string)
    any LiteCore_getSymbolName(DEFAULT_ARGUMENTS){
        assert(argc==1);
        symbol_t symbol;
        if (arguments[0].class==Number_inx){
                symbol = (symbol_t) arguments[0].value.number;
                if (symbol < -_allMethodsMax || symbol >= _allPropsLength) fail_with("invalid symbol");
                return _symbol[symbol];
        }
        else if (arguments[0].class==String_inx){
            return arguments[0];
        }
        else fatal("_getSymbol: expected string or number");
    }

    function_ptr LiteC_registerShim(any anyClass, symbol_t symbol, function_ptr fn) {
        assert(_instanceof(anyClass,Class));
        if (symbol < 0 && -symbol < _allMethodsLength){
            int withinLength = -symbol < TABLE_LENGTH(anyClass.value.classPtr->method);
            function_ptr actualMethod;
            if ( withinLength && (actualMethod=anyClass.value.classPtr->method[-symbol])){
                return actualMethod; //it it already has an implementation
            }
            if (!withinLength) anyClass.value.classPtr->method=_newJmpTableFrom(anyClass.value.classPtr->method); //extend jmp table
            anyClass.value.classPtr->method[-symbol]=fn;
            return fn;
        }
        throw(_newErr(_concatAny(2
                ,any_LTR("invalid method symbol: ")
                ,any_number(symbol))));
    }

    /*
    function_ptr LiteC_registerShim2(any anyClass, symbol_t symbol, function_ptr fn,...) {
        assert(_instanceof(anyClass,Class));
        Class_ptr classPtr = &CLASSES[anyClass.value.class];
        va_list args;
        va_start(args,fn);
        while(symbol){

            if (symbol > 0 || -symbol > _allMethodsLength)
                throw(_newErr(_concatAny(2
                        ,any_str("invalid method symbol: ")
                        ,any_number(symbol))));

            int withinLength = -symbol<TABLE_LENGTH(classPtr->method);
            if ( withinLength && classPtr->method[-symbol]){
                null; //already has an implementation
            }
            else {
                if (!withinLength) classPtr->method=_newJmpTableFrom(classPtr->method); //extend jmp table
                classPtr->method[-symbol]=fn;
            }
            symbol=va_arg(args,int);
            fn=va_arg(args,function_ptr);
        }
        va_end(args);
    }
    */

    // tryGetMethod(symbol:Number) returns Function or undefined
    any Object_tryGetMethod(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        symbol_t symbol = _getSymbol(arguments[0]);
        function_ptr fn;
        assert(symbol<0);
        if ((fn=CLASSES[this.class].method[-symbol])==NULL) return undefined;
        return any_func(fn);
    }

    // PROPERTIES

    // returns a pointer to real instance prop value or NULL
    any* _getPropPtr(any this, symbol_t symbol ) {
        if (symbol<=0 || symbol>=_allPropsLength) fail_with("invalid prop symbol for _getPropPtr");
        //symbol:0 is "constructor":Class, not a prop in the instance memory
        posTable_t posTable=CLASSES[this.class].pos;
        propIndex_t pos;
        if (symbol>=TABLE_LENGTH(posTable) || (pos=posTable[symbol])==INVALID_PROP_POS) {
            return NULL;
        }
        return this.value.prop+pos;
    }

    //returns value for property symbol or throws
    any _getProperty(any this, symbol_t symbol ) {
        if (symbol==0) return any_class(this.class);  //symbol:0 is "constructor":Class
        any* propPtr = _getPropPtr(this,symbol);
        if (propPtr==NULL){
            throw(_newErr(_concatAny(6
                    ,any_LTR("no property '")
                    , _symbol[symbol]
                    ,any_LTR("' (symbol:")
                    ,any_number(symbol)
                    ,any_LTR(") for class ")
                    ,CLASSES[this.class].name)));

        }
        return *propPtr;
    }

    any Object_getProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        symbol_t symbol=_getSymbol(arguments[0]); //search symbol from symbol number or name
        return _getProperty(this,symbol);
    }

    // returns prop value from symbol or undefined (if symbol is not valid for this class)
    any Object_tryGetProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        symbol_t symbol=_getSymbol(arguments[0]); //search symbol from symbol number or name
        if (symbol==0) return any_class(this.class);  //symbol:0 is "constructor", returns class

        any* propPtr = _getPropPtr(this,symbol);
        if (!propPtr) return undefined; //this class do not has required property
        return *propPtr;
    }

    //check property by name
    int _hasProperty(any this, any name) {
        symbol_t symbol=_getSymbol(name); //search symbol from symbol number or name
        //symbol:0 is "constructor":Class
        if (symbol==0 || _getPropPtr(this,symbol)!=NULL) return TRUE;
        return FALSE;
    }

    any Object_hasProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        return _hasProperty(this,arguments[0])? true:false;
    }

    any Object_hasOwnProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        symbol_t symbol=_getSymbol(arguments[0]); //search symbol from symbol number or name

        //symbol:0 is "constructor":Class, inherited from "any"
        if (symbol==0 || _getPropPtr(this,symbol)!=NULL) return false;

        posTable_t posTable=CLASSES[this.class].pos;
        propIndex_t pos;
        if (symbol>=TABLE_LENGTH(posTable) || (pos=posTable[symbol])==INVALID_PROP_POS) {
            return false;
        }
        if (pos < CLASSES[CLASSES[this.class].super].propertyCount){
            //the property is in one of the super classes
            return false; //not own prop
        }
        return true; //has own property
    }

    /** .setProperty(name:String, value:any)
     * from name, set property for object & Maps
     */
    any Object_setProperty(DEFAULT_ARGUMENTS){
        assert_args({.req=2,.max=2,.control=0},Undefined);
        symbol_t symbol=_getSymbol(arguments[0]); //search symbol from symbol name/number
        if (symbol==0){ //symbol:0 is "constructor":Class
            throw(_newErr(_concatAny(3
                    ,any_LTR("cannot set property 'constructor' (symbol:0). class: ")
                    ,CLASSES[this.class].name)));
        }
        any* propPtr = _getPropPtr(this,symbol);
        if (propPtr==NULL){
            throw(_newErr(_concatAny(6
                    ,any_LTR("no property '")
                    , _symbol[symbol]
                    ,any_LTR("' (symbol:")
                    ,any_number(symbol)
                    ,any_LTR(") for class ")
                    ,CLASSES[this.class].name)));
        }
        *propPtr = arguments[1];
        return arguments[1];
    };

    //get property name from index
    any _object_getPropertyNameAtIndex(any this, propIndex_t index) {// from prop index
        len_t propLength=CLASSES[this.class].propertyCount;
        if(index<0 || index>=propLength) {
            throw(_newErr(_concatAny(6
                    ,any_LTR("getPropertyName at invalid index: ")
                    ,any_number(index)
                    ,any_LTR(". Class [")
                    ,CLASSES[this.class].name
                    ,any_LTR("] property count is ")
                    ,any_number(propLength)
                    )));
        }
        return _symbol[CLASSES[this.class].symbolNames[index]];
    }

    any Object_getPropertyNameAtIndex(DEFAULT_ARGUMENTS) { // from prop index
        assert_arg(Number);
        return _object_getPropertyNameAtIndex(this,arguments[0].value.number);
    }

    /**
     * unified _unifiedGetNVPAtIndex, for Objects & Maps.
     *
     * Unified get name-value pair at index
     *
     * to make js LiteralObjects and Maps interchangeable,
     * _unifiedGetNVPAtIndex(), if the object is a Map,
     * returns *MAP_NVP_PTR(index)
     * else returns a NameValuePair with decoded PropName and PropValue
    */
    NameValuePair_s
    _unifiedGetNVPAtIndex(any this, len_t index) {
        if (this.class==Map_inx)
            return *(MAP_NVP_PTR(index,this));
        else
            //note: _object_getPropertyNameAtIndex will validate "index"
            return (NameValuePair_s){
                .name=_object_getPropertyNameAtIndex(this,index)
                ,.value=this.value.prop[index]
            };
    }

    extern any Object_allPropertyNames(DEFAULT_ARGUMENTS){
        len_t propsLength = CLASSES[this.class].propertyCount;
        var result = _newArray(propsLength,NULL);
        posTable_t table = CLASSES[this.class].symbolNames;
        any* item=result.value.arr->base.anyPtr;
        for(int n=0; n<propsLength; n++,item++){
            *item=_symbol[table[n]];
        }
        return result;
    }

    //----------------------
    // x_iterableNext
    //----------------------
    void Iterable_Position__init(DEFAULT_ARGUMENTS){
        assert(argc==1);
        this.value.iterPos->iterable=arguments[0];
        this.value.iterPos->index=any_int64(-1); //mark as pre-start
    }

    any Iterable_Position_next(DEFAULT_ARGUMENTS){
        any iterable = this.value.iterPos->iterable;
        if (iterable.class==String_inx) return String_iterableNext(iterable,1,&this);
        // call .iterableNext() in the iterable Object
        return METHOD(iterableNext_,iterable)(iterable,1,(any_arr){this});
    }

    int _iterNext(any this, any* valueVar, any* keyVar, any* indexVar){
        any iterable = this.value.iterPos->iterable;
        // call .iterableNext() in the iterable Object
        var result = METHOD(iterableNext_,iterable)(iterable,1,(any_arr){this});
        if (!result.value.uint64) return FALSE; //no more items
        //assign values to loop vars
        if (valueVar) *valueVar=this.value.iterPos->value;
        if (keyVar) *keyVar = this.value.iterPos->key;
        if (indexVar) *indexVar = this.value.iterPos->index;
        return TRUE;
    }

    any Object_iterableNext(DEFAULT_ARGUMENTS){
        assert_arg(Iterable_Position);
        Iterable_Position_ptr iter = arguments[0].value.iterPos;

        int64_t inx = iter->index.value.int64;

        if (inx==-1) {//initialization
            iter->size = any_int64(CLASSES[this.class].propertyCount);
        }

        if (++inx >= iter->size.value.int64) return false;

        iter->key = _symbol[CLASSES[this.class].symbolNames[inx]];
        iter->value = this.value.prop[inx];

        iter->index.value.int64 = inx;
        return true;
    }

    any Array_iterableNext(DEFAULT_ARGUMENTS){
        assert_arg(Iterable_Position);
        Iterable_Position_ptr iter = arguments[0].value.iterPos;

        int64_t inx = iter->index.value.int64;

        if (inx==-1) {//initialization
            iter->size = any_int64(this.value.arr->length);
        }

        if (++inx >= iter->size.value.int64) return false;

        iter->key = any_number(inx);
        iter->value = ITEM(this,inx);

        iter->index.value.int64 = inx;
        return true;
    }

    any Map_iterableNext(DEFAULT_ARGUMENTS){
        assert_arg(Iterable_Position);
        Iterable_Position_ptr iter = arguments[0].value.iterPos;

        int64_t inx = iter->index.value.int64;

        if (inx==-1) {//initialization
            iter->size = any_int64(this.value.map->size.value.number);
        }

        if (++inx >= iter->size.value.int64) return false;

        NameValuePair_ptr nvp = MAP_NVP_PTR(inx,this);
        iter->key = nvp->name;
        iter->value = nvp->value;

        iter->index.value.int64 = inx;
        return true;
    }

    /** _string_ByteLen
     *  returns the number of bytes (bytes, not unicode points)
     */
    len_t _string_ByteLen(any s){
        if (s.res){// multiple slices
            ConcatdItem_ptr slicePtr=s.value.slices;
            len_t result=0;
            for(;s.len--; slicePtr++) result+=slicePtr->byteLen;
            return result;
        }
        else return s.len;
    }

    any String_iterableNext(DEFAULT_ARGUMENTS){
        assert_arg(Iterable_Position);
        Iterable_Position_ptr iter = arguments[0].value.iterPos;

        int64_t inx = iter->index.value.int64;

        if (inx==-1) {//initialization
            iter->size = any_int64(_string_ByteLen(this)); //byteLength
            iter->key = any_number(0);  //iter.name is the *codepoint* index in the string (usually < inx because of multibyte unicode points)
            iter->extra = (any){.class=0, .res=0, .len=0}; //res=actual slice index, len=slice offset in total string
        }

        if (++inx >= iter->size.value.int64 ) return false;

        len_t byteIndex = inx;

        len_t maxCount;
        str sliceStart;

        if (this.res) {//in concatd slices
            ConcatdItem_s actualSlice = this.value.slices[iter->extra.res];
            byteIndex -= iter->extra.len; //slice offset
            if (byteIndex >= actualSlice.byteLen){ //end of slice
                iter->extra.len += actualSlice.byteLen; //add to offset
                actualSlice = this.value.slices[++(iter->extra.res)]; //get next slice
                byteIndex=0;
            }
            sliceStart = actualSlice.str + byteIndex;
            maxCount = actualSlice.byteLen - byteIndex;
        }
        else { //simple string
            sliceStart = this.value.str + byteIndex;
            maxCount = this.len - byteIndex;
        }

        len_t count=1; //assume 1st is sequence start
        //take all the bytes of one utf-8 sequence
        for (str p=sliceStart+1; count < maxCount && isUFT8SequenceExtra(*p); count++, p++, inx++);

        //value is a slice with the codepoint (1..4 bytes)
        iter->value = any_slice(sliceStart,count);

        //iter.name (key) counts the *codepoint* index in the string
        iter->key.value.number++;

        iter->index.value.int64 = inx;
        return true;
    }

    /**
     * String_byteSubstr(start, count)
     * similar to String_substr, but start position
     * is the start index *in bytes* -not codepoints-
     * from the beginning of the string.
     *
     * Since internal representation is UTF-8, this method is faster than Substr
     * for large strings and large values of "start"
     *
     * Note: "count" is still in measuerd in *codepoints*, only *start* is measured in bytes
     */
    any String_byteSubstr(DEFAULT_ARGUMENTS){
        assert_args({.req=1,.max=2,.control=2},Number,Number);

        int64_t byteIndex = int64_from_Number(arguments[0]);
        if (byteIndex<0 || byteIndex>this.len) return any_EMPTY_STR;

        _FLATTEN(this);
        str sliceStart = this.value.str + byteIndex;
        len_t maxByteCount = this.len - byteIndex;

        //2nd arg - count
        if (argc==1) {//from start up to end
            return any_slice(sliceStart, maxByteCount);
        }
        int64_t codePointCount = int64_from_Number(arguments[1]);
        if (codePointCount<=0) return any_EMPTY_STR;

        //take all the bytes up to codePointCount codepoints
        str p=sliceStart;
        for (;codePointCount && maxByteCount; p++,maxByteCount--) {
            if (isUFT8SequenceStart(*p)) codePointCount--;
        }

        return any_slice(sliceStart, p-sliceStart);
    }


    /**
     * String_byteSlice(byteStart, byteEnd)
     * similar to String_slice, but start & end position
     * are measured *in bytes* -not codepoints-
     * from the beginning of the string.
     *
     * Since internal representation is UTF-8, this method is faster than *slice*
     * for large strings and large values of start & end
     *
     */
    any String_byteSlice(DEFAULT_ARGUMENTS){
        assert_args({.req=1,.max=2,.control=2},Number,Number);

        int64_t startByteIndex = int64_from_Number(arguments[0]);
        if (startByteIndex<0 || startByteIndex>this.len) return any_EMPTY_STR;

        _FLATTEN(this);
        str sliceStart = this.value.str + startByteIndex;
        len_t maxByteCount = this.len - startByteIndex;
        if (argc==1) {//from start up to end
            return any_slice(sliceStart, maxByteCount);
        }

        //2nd arg - endByteIndex
        int64_t endByteIndex = int64_from_Number(arguments[1]);
        int64_t byteCount = endByteIndex-startByteIndex;
        if (byteCount<=0) return any_EMPTY_STR;
        if (byteCount>maxByteCount) byteCount=maxByteCount;
        return any_slice(sliceStart, byteCount);
    }

    int64_t _byteIndexOf(any haystack, any needle, int64_t startByteIndex) {
        if (needle.len==0 ||startByteIndex<0) return -1;

        _FLATTEN(needle); //we require contiguos strings
        _FLATTEN(haystack);
        if (startByteIndex>haystack.len) return -1;

        str found=utf8Find(haystack, needle, haystack.value.str+startByteIndex);
        if (!found) return -1;
        return found - haystack.value.str; //byte index of found string
    }

    /**
     * return -1 if not found, byteIndex for strings (fast)
     * @param needle
     * @param haystack
     * @return int64_t
     */
    int64_t __byteIndex(any needle, any haystack){
        if (haystack.class==String_inx){
            if (needle.class!=String_inx) needle=CALL0(toString_,needle);
            return _byteIndexOf(haystack,needle,0);
        }
        else {
            any result = CALL1(indexOf_,haystack,needle);
            return (int64_t)result.value.number;
        }
    }


    /** String_byteIndexOf(searched:string, fromByteIndex:number) {
     * similar to String_indexOf, but start position
     * is the start index *in bytes* -not codepoints-
     * from the beggining of the string.
     *
     * @returns: *BYTE* index of the found string, or -1
     */
    any String_byteIndexOf(DEFAULT_ARGUMENTS) {
        assert_args({.req=1,.max=2,.control=2},String,Number);
        any needle=arguments[0];
        int64_t startByteIndex=0;
        if (argc>1) startByteIndex = int64_from_Number(arguments[1]);
        return any_int64(_byteIndexOf(this, needle,startByteIndex)); //byte index of found string
    }

    /** _string_charAtBytePos
     * return a unicode char from a specific byte-index position in the String
     * @param s String
     * @param startByte byte-index start position
     * @return String, .length=1, byteLength=1..4 depending on utf-8 sequence
     *
    any _string_charAtBytePos(any s, len_t startByte)
    {
        assert(s.class==String_inx);

        str sliceStart;
        len_t sliceLen;

        if (s.res){// set ptrs for multiple slices
            int found=FALSE;
            ConcatdItem_ptr slicePtr=s.value.slices;
            //search which slice has the char
            for(;s.len--; slicePtr++){
                sliceLen = slicePtr->byteLen;
                if (sliceLen > startByte){//its here
                    sliceStart = slicePtr->str;
                    found=TRUE;
                    break;
                }
                startByte-=sliceLen;
            };
            if (!found) sliceLen=0;
        }
        else {// set ptrs for simple str
            sliceLen = s.len;
            sliceStart = s.value.ptr;
        }

        if (startByte>=sliceLen) return any_EMPTY_STR;

        len_t count=1;
        len_t maxCount = sliceLen - startByte;
        //take all the bytes of the utf-8 sequence
        for (str p=sliceStart+startByte+1; count < maxCount && isUFT8SequenceExtra(*p); count++,p++);
        //return a slice with the char
        return any_slice(sliceStart+startByte,count);
    }
    */

    //----------------------
    // x_toString
    //----------------------
    any Object_toString(DEFAULT_ARGUMENTS) {
       return any_LTR("[Object]"); //js compatible
    }

    any Undefined_toString(DEFAULT_ARGUMENTS) {
       return any_LTR("undefined"); //js compatible
    }

    any Null_toString(DEFAULT_ARGUMENTS) {
       return any_LTR("null"); //js compatible
    }

    any NaN_toString(DEFAULT_ARGUMENTS) {
       return any_LTR("NaN"); //js compatible
    }

    any Infinity_toString(DEFAULT_ARGUMENTS) {
       return any_LTR("Infinity"); //js compatible
    }

    any Boolean_toString(DEFAULT_ARGUMENTS) {
       return _anyToBool(this)? any_LTR("true"): any_LTR("false"); //js compatible
    }

    any Class_toString(DEFAULT_ARGUMENTS) {
       return this.value.classPtr->name;
    }

    any Array_toString(DEFAULT_ARGUMENTS) {
       return Array_join(this,1,(any_arr){any_COMMA});
    }

    any String_toString(DEFAULT_ARGUMENTS) {
       assert(argc==0);
       return this;
    };

    // return string len (<64)
    uint8_t _numberToBuffer(char* buf, double number) {
        sprintf(buf,"%f",number);
        //clear extra zeroes
        uint8_t n;
        for(n=strlen(buf)-1; n>0 && buf[n]=='0'; n--) buf[n]='\0';
        if(buf[n]=='.') buf[n]='\0';
        return n;
    }

    char _numberToStringBUFFER[64];
    /*uint8_t _mumberToString(number) {
        return _numberToBuffer(_numberToStringBUFFER,number);
    }
     */

    any Number_toString(DEFAULT_ARGUMENTS) {
        char* buf = mem_alloc(64);
        return any_slice(buf,_numberToBuffer(buf,this.value.number));
    }

    any Error_toString( any this, len_t argc, any* arguments ) {
        assert(argc==0);
        return _concatAny(3, CLASSES[this.class].name, any_LTR(": "), this.value.err->message);
    };

    //----------------------
    // C-null-term-string to String methods
    //----------------------

    static char tempBuffer[4096];
    /**
     * use-and-reuse a temp buffer
     * making a c-compatible null-terminated string, w/o malloc
     */
    str _tempCString(any s){
        _toCStringCompatBuf(s, tempBuffer, sizeof(tempBuffer));
        return tempBuffer;
    }
    /**
     * copy chars from simple|conctd string to a fixed buffer
     * making a c-compatible null-terminated string, w/o malloc
     *
     */
    void _toCStringCompatBuf(any s, char* buf, len_t bufSize){
        assert(s.class==String_inx);
        if (!s.res){ //simple
            if (s.len>bufSize-1) s.len=bufSize-1;
            memcpy(buf, s.value.str, s.len);
            buf[s.len]=0;
        }
        else {
            //copy Concatd slices
            len_t copied=_copyConcatd(s, buf, bufSize-1);
            buf[copied]=0;
        }
    }

    //----------------------
    // String methods
    //----------------------
    /**
     * _indexOf(searched:string, fromIndex:number)
     */
    any String_indexOf(any this, len_t argc, any* arguments) {
        assert_args({.req=1,.max=2,.control=2},String,Number);
        uint64_t fromIndex = argc>=2? (uint64_t)arguments[1].value.number:0;
        //---------
        return any_number(utf8indexOf(this,arguments[0],fromIndex));
    }

    any String_lastIndexOf(any this, len_t argc, any* arguments) {
        assert_args({.req=1,.max=2,.control=2},String,Number);
        //---------
        len_t fromIndex = argc >= 2 ? (len_t)arguments[1].value.number : MAX_LEN_T;
        //---------
        _FLATTEN(this); //we require a contiguos string for utf8indexOf
        _FLATTEN(arguments[0]); //we require a contiguos string for utf8indexOf
        return any_number(utf8lastIndexOf(this, arguments[0], fromIndex));
   }

    any String_slice(any this, len_t argc, any* arguments) {
        if (argc==0) return this;
        assert_args({.req=0,.max=2,.control=2},Number,Number);
        //---------
        // define named params
        int64_t startUTF8Inx = (int64_t)arguments[0].value.number;
        int64_t endUTF8Inx = argc>=2? (int64_t)arguments[1].value.number: LLONG_MAX;
        //---------
        return utf8slice(this,startUTF8Inx,endUTF8Inx);
    }

    // .substr(startIndex,qty)
    any String_substr(any this, len_t argc, any* arguments) {
        assert_args({.req=1,.max=2,.control=2},Number,Number);
        //end index is start index + qty
        arguments[1].value.number += arguments[0].value.number;
        // if start index is <0, end index should be also<0, else undefined
        if (arguments[0].value.number<0 && arguments[1].value.number>=0) arguments[1]=undefined;
        return String_slice(this,argc,arguments);
    }

    any String_charAt(any this, len_t argc, any* arguments) {
        assert_arg(Number);
        int64_t startUTF8Inx = (int64_t)arguments[0].value.number;
        return utf8slice(this, startUTF8Inx, startUTF8Inx+1);
    }

    any String_charCodeAt(DEFAULT_ARGUMENTS) {
        assert_arg(Number);
        int64_t startUTF8Inx = (int64_t)arguments[0].value.number;
        var codepoint = utf8slice(this, startUTF8Inx, startUTF8Inx+1);
        if (!codepoint.len) return NaN;

        str p=codepoint.value.str;
        uint32_t result;
        switch(codepoint.len){
            case 1:
                result = *p & 0b01111111;
                break;
            case 2:
                result = (*p & 0b00011111)<<6;
                result += (*(p+1) & 0b00111111);
                break;
            case 3:
                result = (*p & 0b00001111)<<12;
                result += (*(p+1) & 0b00111111)<<6;
                result += (*(p+2) & 0b00111111);
                break;
            case 4:
                result = (*p & 0b00000111)<<18;
                result += (*(p+1) & 0b00111111)<<12;
                result += (*(p+2) & 0b00111111)<<6;
                result += (*(p+3) & 0b00111111);
                break;
        }
        return any_number(result);

        /*
         * commented: switch is faster.
        // convert UTF-8 to a number - see table at: http://en.wikipedia.org/wiki/UTF-8
        char* p=codepoint.value.str+codepoint.len-1; //last component
        byte mask = 0b00111111;
        byte finalMask = 0b00111111;
        int shift=0;
        for(int n=codepoint.len;n;n--){
            result.value.number += (*p & mask)<<shift;
            shift+=8;
            finalMask>>=1
        }
        */
    }

    any String_fromCharCode(DEFAULT_ARGUMENTS) {
        assert_args({.req=1,.max=-1,.control=1},Number);
        if (argc>=sizeof(tempBuffer)/4) fail_with("String_fromCharCode:too many chars");

        char* p = tempBuffer;
        for(any* arg=arguments;argc--;arg++){
            if (arg->value.number<0||arg->value.number>=(1<<22)) fail_with("String_fromCharCode:invalid code");
            uint32_t v = (uint32_t)arg->value.number;
            if (v< (1<<7)){
                *p++=v;
            }
            else if (v< (1<<11)){
                *p++=((v>>6) | 0b11000000);
                *p++= v & 0b00111111 | 0b10000000;
            }
            else if (v< (1<<16)){
                *p++=((v>>12) | 0b11100000);
                *p++=((v>>6) & 0b00111111 | 0b10000000);
                *p++= v & 0b00111111 | 0b10000000;
            }
            else if (v< (1<<21)){
                *p++=((v>>18) | 0b11110000);
                *p++=((v>>12) & 0b00111111 | 0b10000000);
                *p++=((v>>6) & 0b00111111 |0b10000000);
                *p++= v & 0b00111111 | 0b10000000;
            }
        }
        return _newString(tempBuffer, p - (char*)&tempBuffer);
    }

    /**
     * .replaceAll(searched,newStr)
     */
    any String_replaceAll(DEFAULT_ARGUMENTS) {
        assert_args({.req=2,.max=2,.control=2},String,String);
        any searched = arguments[0];
        any newStr = arguments[1];

        // require contiguous strings
        _FLATTEN(this);
        _FLATTEN(searched);
        //note: no need to newstr to be flat

        var c=undefined;

        str foundPtr;
        str fromPtr = this.value.ptr;
        str endPtr = this.value.ptr+this.len;

        while(fromPtr < endPtr){
            if (foundPtr=utf8Find(this,searched,fromPtr)){
                //found
                if (c.class==Undefined_inx) c=_newConcatdSlices();
                //add slice with previous to found
                _concatdSlicePush(&c, fromPtr, foundPtr-fromPtr);
                //add replacement
                _pushToConcatd(&c,newStr);
                // new search position
                fromPtr = foundPtr + searched.len;
            }
            else {//not found
                if (c.class==Undefined_inx) { //never found
                    return this; //return original
                }
                //add slice with remainder
                _concatdSlicePush(&c, fromPtr, endPtr-fromPtr);
                break;
            }
        }

        if (c.class==Undefined_inx) { //never found
            return this; //return original
        }

        #ifdef FLATTEN_ALL
        c=_newCCompatString(c);
        #endif

        return c; //composed with all replacements
    }

    any String_repeat(DEFAULT_ARGUMENTS) {
        assert_args({.req=1,.max=1,.control=1},Number);
        if (arguments[0].value.number<=0) return any_EMPTY_STR;

        /*if ( (arguments[0].value.number * this.len) >= MAX_LEN_T )
                fail_with("String_repeat: string too large");
         */
        len_t howMany = (len_t)arguments[0].value.number;

        var c=_newConcatdSlices();
        while(howMany--) _pushToConcatd(&c,this);
        return c; //composed with all repetitions
    }

    any String_toLowerCase(any this, len_t argc, any* arguments) {
        //NOTE: Only ASCII upper/lower conversion
        if (!this.len) return this;
        //performance, for small strings, check if it's already lowercase
        if (!this.res && this.len<128){
            len_t count=this.len;
            str p=this.value.str;
            do{
                if(*p>='A'&&*p<='Z') break; //there's something to lowercase
                p++;
            }while(--count);
            if(!count) return this; //nothing to lowercase
        }
        any result=_newCCompatString(this);
        len_t len = result.len;
        for(char* p=result.value.charPtr; len--; *p=tolower(*p), p++);
        return result;
    }

    any String_toUpperCase(any this, len_t argc, any* arguments) {
        //NOTE: Only ASCII upper/lower conversion
        if (!this.len) return this;
        //performance, for small strings, check if it's already uppercase
        if (!this.res && this.len<128){
            len_t count=this.len;
            str p=this.value.str;
            do{
                if(*p>='a'&&*p<='z') break; //there's something to uppercase
                p++;
            }while(--count);
            if(!count) return this; //all uppercase already
        }
        any result=_newCCompatString(this);
        len_t len = result.len;
        for(char* p=result.value.charPtr; len--; *p=toupper(*p), p++);
        return result;
    }

    //-- concatdSlices helpers

    void _concatdSlicePush(any* c, str str, len_t len) {
        assert(c->class==String_inx && c->res);
        assert(str!=NULL && len != UINT32_MAX);
        if (!len) return; //do noting if slice len is 0

        ConcatdItem_ptr sl = &(c->value.slices[c->len]); //next free slice
        sl->str = str;
        sl->byteLen = len;
        c->len++; //one more item in ConcatdSlices
        if (c->len >= c->res*CONCATD_ITEMS_PER_RES) { // no more space, next-free is outside alloc'd area
            if (c->res==UINT16_MAX) { // a very large concatd, we realloc per addition at this point
                c->value.ptr = mem_realloc(c->value.ptr, ((c->len+127)/128)*128*sizeof(ConcatdItem_s));
            }
            else { //normal, allocate another unit
                c->res++;
                c->value.ptr = mem_realloc(c->value.ptr, c->res*CONCATD_ITEMS_PER_RES*sizeof(ConcatdItem_s));
            }
        }
    }

    // concat to String, mode:ConcatdSlices, returns 1 if something concatd, else 0
    len_t _pushToConcatd(any* c, any toPush) {
        //convert _toString if not string
        if (toPush.class!=String_inx) toPush = METHOD(toString_,toPush)(toPush,0,NULL);
        if (!toPush.len) return 0; //empty slice

        if (toPush.res!=0){
            //toPush is a String mode:ConcatdSlices, flatten
            for(ConcatdItem_ptr argSl=toPush.value.slices; toPush.len--; argSl++) {
                _concatdSlicePush(c, argSl->str, argSl->byteLen);
            }
        }
        else { //single String
            _concatdSlicePush(c, toPush.value.str, toPush.len);
        }
        return 1;
    }

    // concat - return new String, mode:ConcatdSlices
    any _concatAny(len_t argc, any arg,...) {
        assert(argc>0);

        va_list argPointer; //create ptr to arguments
        va_start(argPointer, arg); //make argPointer point to first argument *after* arg

        var c = _newConcatdSlices();

        while(argc--) {
            _pushToConcatd(&c, arg);
            arg = va_arg(argPointer,any);
        }

        #ifdef FLATTEN_ALL
        c=_newCCompatString(c);
        #endif

        return c; //return ConcatdSlices
    }

    // calc size of continuous string
    len_t _getConcatdCombinedSize(any s) {
        assert(s.class==String_inx);
        if(!s.res) return s.len; //already a continuous string
        //calc combined size
        uint64_t combinedSize=0;
        len_t count=s.len;
        ConcatdItem_ptr sl=s.value.slices;
        for(;count--;sl++) combinedSize+=sl->byteLen;
        if (combinedSize>UINT32_MAX) fatal("_getConcatdCombinedSize: string too large");
        return combinedSize;
    }

    // copy ConcatdSlices to a continuous string buffer
    len_t _copyConcatd(any s, char* buf, len_t howMany) {
        char* dest=buf;
        ConcatdItem_ptr sl=s.value.slices;
        for(; s.len--; sl++) {
            len_t toCopy = sl->byteLen;
            if (toCopy>howMany) toCopy=howMany;
            //copy bytes
            memcpy(dest,sl->str,toCopy);
            dest+=toCopy; //advance ptr
            if((howMany-=toCopy)==0) break; //discount howMany, break if full
        }
        return dest-buf; //how many copied
    }

    any _cloneSimpleString(any s){
        any result;
        result.class=String_inx;
        result.res=0;
        result.value.ptr = mem_alloc(s.len+1); //add space for null term
        memcpy(result.value.ptr, s.value.str, s.len);
        result.value.charPtr[result.len=s.len]=0;
        // debug: fprintf(stderr,"clone: %s\n",result.value.str);
        return result;
    }

    /**
     * make a COPY of this string contents
     *
     * -if it was mode:ConcatdSlices, create a continuous string. also NULL terminated
     *
     * -if it was simple, crate a COPY un a new allocd space, NULL terminated
     */
    any _newCCompatString(any s) {
        assert(s.class==String_inx);
        if (!s.res){ //simple
            Cloned_to_CString++;
            return _cloneSimpleString(s);
        };
        Flatten_calls++;

        //calc combined size
        len_t combinedSize=_getConcatdCombinedSize(s);
        //alloc space
        char* buf=mem_alloc(combinedSize+1); //add space for null term
        //copy bytes
        _copyConcatd(s, buf, combinedSize+1);
        //return the continuos string
        //debug: fprintf(stderr,"flatten: %s\n",buf);
        return (any){
            .class=String_inx
            ,.res=0
            ,.value.ptr=buf
            ,.len=combinedSize};
    }

    //concat all items, with a optional separ
    any _arrayJoin(any initial, len_t argc, any* item, any separ){

        int32_t count=0;

        var c = _newConcatdSlices();
        if (initial.len) {
            _pushToConcatd(&c,initial);
            count++;
        }

        for(; argc--; count++,item++){
            if (separ.len && count) _pushToConcatd(&c,separ);
            _pushToConcatd(&c,*item);
        }

        #ifdef FLATTEN_ALL
        c=_newCCompatString(c);
        #endif

        return c;
    }

    any String_concat(any this, len_t argc, any* arguments){
        if (argc==0) return this;
        var c=_newConcatdSlices();
        _pushToConcatd(&c,this);
        while(argc--) _pushToConcatd(&c,*arguments++);
        return c;
    }

    any String_trim(any this, len_t argc, any* arguments) {
        assert(this.class==String_inx);
        if(!this.len) return this;

        _FLATTEN(this);

        len_t len,newLen;
        any leftSpaces = PMREX_whileRanges(undefined,2,(any_arr){this,any_LTR(" \t")});
        if (leftSpaces.len==this.len) {//all spaces
            return any_EMPTY_STR; //returns empty str
        }
        //trim left
        this = _slicedFrom(this,leftSpaces.len);

        //search not-spaces, from last char
        str lastChar=this.value.str+this.len-1;
        while(*lastChar==' '||*lastChar=='\t') lastChar--;

        //trim right
        this.len = lastChar - this.value.str +1;

        return this;
    }

    /**
     * split a string into an array
     *  args: separator, optional limit
     */
    any String_split(any this, len_t argc, any* arguments) {
        assert_args({.req=0,.max=2,.control=2},String,Number);

        //if string empty||
        //MDN-JS:If separator is omitted, the array returned contains one element consisting of the entire string.
        if (!this.len||!argc) return this;

        len_t limit= argc==2? arguments[1].value.number : UINT32_MAX;

        var result = _newArray(0,NULL);

        var sep=arguments[0];
        if (!sep.len){
            //MDN-JS: If separator is an empty string, str is converted to an array of characters.
            var iter=_newIterPos();
            for(;limit-- && String_iterableNext(this,1,&iter).value.uint64;){
                _array_pushString(result,iter.value.iterPos->value);
            }
            return result;
        }

        _FLATTEN(sep); //make simple strings (if it is not)
        _FLATTEN(this); //make simple strings (if it is not)

        len_t pushed=0;

        str foundPtr;
        any slice=this;
        while(TRUE){
            if (!(foundPtr=utf8Find(slice,sep,NULL))){
                //separator not found,
                // push remainder slice & exit
                _array_pushString(result,slice);
                break;
            };
            //separator found, make slice with prev to sep & push
            slice.len=foundPtr-slice.value.str;
            _array_pushString(result,slice);
            if (pushed++>=limit) break;

            //make slice with after-sep
            slice.value.str=foundPtr+sep.len;
            slice.len= this.len-(slice.value.ptr-this.value.ptr);

            //continue loop
        };

        return result;
    }

    any String_countSpaces(DEFAULT_ARGUMENTS){
        assert(this.class==String_inx);
        _FLATTEN(this); //req simple string
        len_t count=0;
        while(this.len && *this.value.str==' ') {
            this.len--;
            this.value.str++;
            count++;
        }
        return any_number(count);
    }

    static char SPACES[] =
        "                                                                "
        "                                                                ";
    static any largeAllocdSpaces={0}; //undefined;
    /**
     * namespace method.
     * @return slice pointing to required amount of spaces
     */
    any _string_spaces(len_t count){ //as namespace method
        any result=(any){String_inx,.res=0,.len=count};
        if (count<=sizeof(SPACES)) { //a reasonable amount of spaces (<128)
            result.value.str=SPACES;
            return result;
        }

        //else a large amount of spaces....
        if (largeAllocdSpaces.len==0){
            //alloc required
            largeAllocdSpaces.value.str = mem_alloc(count);
            memset(largeAllocdSpaces.value.ptr,' ',count);
        }
        else { // already alloc'd, but not enough
            largeAllocdSpaces.value.ptr = mem_realloc(largeAllocdSpaces.value.ptr,count);
            memset(largeAllocdSpaces.value.ptr+largeAllocdSpaces.len,' ',count-largeAllocdSpaces.len);
        }
        //after alloc or realloc
        largeAllocdSpaces.len=count;
        //return slice from large spaces pool
        result.value.str=largeAllocdSpaces.value.str;
        return result;
    }

    any String_spaces(DEFAULT_ARGUMENTS){ //as namespace method
        assert_arg(Number);
        return _string_spaces(arguments[0].value.number);
    };

   //----------------------
   // Array methods
   //----------------------
   /** in JS Arrays are mutable. We cannot use .len and .res
    * to hold .len and .res mem units for mutable Arrays,
    * because those values are stored in "this:any" and we do
    * not mutate contents of "this" in methods.
    * To be able to use this.len and this.res, we need to use "Immutbale Arrays"
    * and then any push/pop/shift/unshift will return a new ImmArray (a new "this").
    * see: ImmArrray.c
    */

    /** internal. Resize array to newLen
     */
    void _array_realloc(Array_s *arr, uint64_t newLen64){
        if (newLen64>=UINT32_MAX) fatal("Array too large");
        size_t newLen=newLen64;
        size_t actualSize = arr->allocd * arr->itemSize;
        size_t newSize = newLen * arr->itemSize;
        //realloc if required or of we're freeing at least 64kb
        if (actualSize < newSize || actualSize-newSize > 64*1024){
            len_t newAllocd = newLen+8;
            arr->base.bytePtr = mem_realloc(arr->base.bytePtr, newAllocd * arr->itemSize);
            arr->allocd = newAllocd;
        }
    }

    void _concatToArrayOfAny(Array_ptr arrPtr, len_t itemCount, any* items){
        if(!itemCount || !items) return;
        if(!arrPtr->itemSize==sizeof(any)) fatal("not array of any");
        len_t len = arrPtr->length;
        _array_realloc(arrPtr, len + itemCount);
        memcpy(arrPtr->base.anyPtr + len, items, itemCount*sizeof(any));
        arrPtr->length+=itemCount;
    }

    any Array_push(any this, len_t argc, any* arguments){
        _concatToArrayOfAny(this.value.arr,argc,arguments);
        return any_number(this.value.arr->length);
    }

    /**
     * push a string slice. Fix empty slices (len==0), replace with any_EMPTY_STR.
     * @param this array
     * @param slice String slice
     */
    void _array_pushString(any this, any slice){
        assert(slice.class==String_inx);
        if (!slice.len) slice = any_EMPTY_STR;
        _concatToArrayOfAny(this.value.arr,1,(any_arr){slice});
    }

    any _concatToArrayFlat(any this, len_t itemCount, any* item){
        // flatten arrays, pushes elements
        assert(this.class==Array_inx);
        for(len_t n=0;n<itemCount; n++,item++){
            if(item->class==Array_inx){
                //recurse
                _concatToArrayFlat(this, item->value.arr->length, item->value.arr->base.anyPtr );
            }
            else { //single item
                Array_push(this,1,item);
            }
        }
        return any_number(this.value.arr->length);
    }

    /**
     * return new Array, concatenated
     */
    any Array_concat(any this, len_t argc, any* arguments) {
        any clone=Array_clone(this,0,NULL);
        _concatToArrayFlat(clone, argc, arguments) ;
        return clone;
    }

    any Array_indexOf(any this, len_t argc, any* arguments) {
        // indexOf(0:item, 1:fromIndex)
        assert(argc>=1 && arguments!=NULL);
        assert(argc<=2);
        assert(argc<2 || (arguments[1].class == Number_inx));
        //---------
        //---------
        len_t len = this.value.arr->length;
        // define named params
        any searched = arguments[0];
        len_t inx = argc>=2? (len_t)arguments[1].value.number:0;
        //---------
        any* item = this.value.arr->base.anyPtr + inx;
        for( ;inx<len; inx++,item++){
            if (__is(searched,*item)) return any_number(inx);
        }
        return any_number(-1);
   }

    any Array_lastIndexOf(any this, len_t argc, any* arguments) {
        // lastIndexOf(0:item, 1:fromIndex)
        assert(argc>=1 && arguments!=NULL);
        assert(argc<=2);
        assert(argc<2 || (arguments[1].class == Number_inx));
        //---------
        //---------
        // define named params
        any searched = arguments[0];
        len_t len = this.value.arr->length;
        if (!len) return any_number(-1);
        int64_t inx = argc>=2? arguments[1].value.number : len-1;
        if (inx<0) return any_number(-1);
        if (inx>len) inx=len-1;
        //---------
        any* item = this.value.arr->base.anyPtr + inx;
        while(TRUE){
            if (inx<0 || __is(*item,searched)) break;
            item--;
            inx--;
        }
        return any_number(inx);
    }

   any Array_slice(any this, len_t argc, any* arguments) {
        // slice(0:start, 1:end)
        assert(argc>=1 && arguments!=NULL);
        assert(argc<=2);
        assert(argc<2 || (arguments[1].class == Number_inx));
        //---------
        // define named params
        len_t len = this.value.arr->length;
        int64_t startPos = arguments[0].value.number;
        int64_t endPos = argc>=2? arguments[1].value.number: len;
        //---------
        if (startPos<0) if ((startPos+=len)<0) startPos=0;
        if (endPos<0) if ((endPos+=len)<0) endPos=0;
        if (endPos>len) endPos=len;
        if (endPos<startPos) endPos=startPos; //empty arr
        return _newArray(endPos-startPos, this.value.arr->base.anyPtr + startPos);
    }

    void _array_splice(Array_ptr arrPtr, int64_t startPos, int64_t deleteHowMany, len_t toInsert, void* toInsertItemsPtr) {
        int64_t len = (int64_t) arrPtr->length;
        //---------
        if (startPos<0) if ((startPos+=len)<0) startPos=0;
        uint16_t itemSize=arrPtr->itemSize;
        if (startPos+deleteHowMany>len) deleteHowMany = len-startPos;
        int64_t moveFromPos = startPos+deleteHowMany;
        int64_t amount=len-moveFromPos;
        int64_t moveToPos = startPos + toInsert;
        if (amount && moveFromPos>moveToPos) {
            //delete some
            memmove(arrPtr->base.bytePtr+(moveToPos*itemSize), arrPtr->base.bytePtr+ (moveFromPos*itemSize), amount*itemSize);
            //clear space
            memset(arrPtr->base.bytePtr+((len-(moveFromPos-moveToPos))*itemSize), 0, (moveFromPos-moveToPos)*itemSize);
        }
        else if(moveFromPos<moveToPos){ //insert some
            _array_realloc(arrPtr, len + moveToPos-moveFromPos);
            //make space
            if (amount) memmove(arrPtr->base.bytePtr + moveToPos*itemSize, arrPtr->base.bytePtr + moveFromPos*itemSize, amount*itemSize);
        }

        //insert new items
        if (toInsert) memcpy(arrPtr->base.bytePtr + startPos*itemSize, toInsertItemsPtr, toInsert*itemSize);
        // recalc length
        arrPtr->length += toInsert-deleteHowMany;
    }

    void _array_push(Array_ptr arrPtr, void* newItem){
        _array_splice(arrPtr,arrPtr->length, 0,1,newItem);
    }

    /**
     * .splice(startPos, howManyToDelete, ItemToInsert,ItemToInsert,...)
     * @return deleted items
     */
   any Array_splice(any this, len_t argc, any* arguments) {
        assert_args({.req=2,.max=-1,.control=2},Number,Number);

        //---------
        // define named params
        int64_t startPos = arguments[0].value.number;
        int64_t deleteHowMany = arguments[1].value.number;
        len_t toInsertCount = argc>=3? argc-2: 0;
        any* toInsertItems = argc>=3? arguments+2: NULL;

        any arrDeleted= Array_slice(this,2,(any_arr){arguments[0],any_number(startPos+deleteHowMany)});
        _array_splice(this.value.arr, startPos, deleteHowMany, toInsertCount, toInsertItems);
        return arrDeleted;
    };

    any Array_unshift(any this, len_t argc, any* arguments) {
       assert(argc>=1 && arguments!=NULL);
       // insert arguments at array position 0
       _array_splice(this.value.arr,0,0,argc,arguments);
       return undefined;
    }

    any Array_shift(any this, len_t argc, any* arguments) {
       assert(argc==0);
       if (!this.value.arr->length) return undefined;
       // remove arguments at array position 0
       var firstItem = ITEM(this,0);
       _array_splice(this.value.arr,0,1,0,NULL);
       return firstItem;
    }

    any Array_pop(any this, len_t argc, any* arguments) {
        assert(argc==0);
        len_t len;
        if ((len=this.value.arr->length) <= 0) return undefined;
        return this.value.arr->base.anyPtr[this.value.arr->length=(len-1)];
    }

    any Array_join(any this, len_t argc, any* arguments) {
        assert_args({.req=0,.max=1,.control=1},String);
        return _arrayJoin(undefined
                , this.value.arr->length, this.value.arr->base.anyPtr
                , argc? arguments[0]: any_COMMA);
    }

    any Array_clear(any this, len_t argc, any* arguments) {
        assert(argc==0);
        this.value.arr->length=0;
        return undefined;
    }

    any Array_set(any this, len_t argc, any* arguments) {
        //require two args
        assert_args({.req=2,.max=2,.control=1},Number);
        //first is index, should be >0
        int64_t index=arguments[0].value.number;
        assert(index>=0);
        // if required, extend array
        if (index>=this.value.arr->length) {
            _array_realloc(this.value.arr,index+1); //extend
            this.value.arr->length = index+1; //set new length
        }
        // set value at index
        return  this.value.arr->base.anyPtr[index] = arguments[1];
    }

    any Array_isArray(any this, len_t argc, any* arguments) {
        assert(argc==1);
        return (arguments[0].class==Array_inx||_instanceof(arguments[0],Array))?true:false;
    }

    function_ptr _array_sort_user_fn; //no thread-safe
    int _array_compare(const void *v1, const void *v2){
        if (_array_sort_user_fn){
            any result = _array_sort_user_fn(undefined,2,(any_arr){*(any*)v1,*(any*)v2});
            return (int)result.value.number;
        }
        else{
            var a=CALL0(toString_,*(any*)v1), b=CALL0(toString_,*(any*)v2);
            return __compareStrings(a,b);
        }
    }

    any Array_sort(any this, len_t argc, any* arguments) {
        assert_args({.req=0,.max=1,.control=1},Function);
        _array_sort_user_fn= argc? arguments[0].value.ptr : NULL;
        qsort(this.value.arr->base.anyPtr, this.value.arr->length, sizeof(any), _array_compare);
    }

   /** Map methods.
    *
    * Maps are used also as Dictionarys, to replace javascript Object,
    * when used as a Dictionary.
    * Maps are arrays of name:value pairs
    */

    /*str NameValuePair_toStr(NameValuePair_ptr nv) {
        _Buffer_concatToNULL("\"", CALL0(toString_,nv->name).value.str,"\":",CALL0(toString_,nv->value).value.str, NULL);
    }*/

    any NameValuePair_toString(DEFAULT_ARGUMENTS) {
        assert(this.class==NameValuePair_inx);
        return _concatAny(4
                ,any_QUOTE, ((NameValuePair_ptr)this.value.ptr)->name, any_QUOTE, any_COLON
                ,((NameValuePair_ptr)this.value.ptr)->value );
    }

    //-----------
    //Map helpers

    int64_t _map_KeyTree_do(Map_ptr map, byte what, any key, len_t valueIndex) {
        assert(key.class==String_inx && map->keyTreeRoot.allocd); //has KeyTree
        return _KeyTree_do(&map->keyTreeRoot,what,key,valueIndex);
    }

    NameValuePair_ptr _map_find(Map_ptr map, any key, byte doDelete) {

        len_t len;
        if ((len=map->nvpArr.length)==0) return NULL; //if no length

        //DEBUG(key);
        _FLATTEN(key);
        assert(key.class==String_inx); //has KeyTree

        int64_t foundInx=-1;
        NameValuePair_ptr foundNVP=NULL;
        NameValuePair_ptr nvpArrBase = map->nvpArr.base.nvp;

        //_KeyTree_do 1:FIND 2:REMOVE, found?
        if ((foundInx=_KeyTree_do(&map->keyTreeRoot,doDelete?REMOVE_KEY:FIND_KEY,key,0))>=0) {
            foundNVP=nvpArrBase+foundInx;
        }

        /* OLD - linear search
                len_t inx=0;
                for(NameValuePair_ptr nvp=nvpArrBase; len--; nvp++, inx++){
                    //DEBUG(nv->name);
                    if (__is(nvp->name, key)) {
                        foundInx=inx;
                        foundNVP=nvp;
                        break; //found
                    }
                }
            }
        }
         */

        if (foundNVP && doDelete) {//remove found index from map array
            _array_splice(&map->nvpArr, foundInx,1, 0,NULL);
        }
        return foundNVP;
    }

    NameValuePair_ptr
    _map_getNVP(int64_t index, any this, str file, int line, str func) {
        if (index<0) {
            debug_abort(file,line,func,any_LTR("index access: [], negative index"));
        }
        Array_s arr = this.value.map->nvpArr;
        // check index against arr->length
        if (index >= arr.length){
            debug_abort(file,line,func,_concatAny(4,
                    any_LTR(" OUT OF BOUNDS _map_getNVP[")
                    ,any_number(index)
                    ,any_LTR("]. Map.array.length is ")
                    ,any_number(arr.length)));
        }
        return arr.base.nvp+index;
    }

    //-----------
    //Map Methods

    any Map_get(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(_instanceof(this,Map));
        NameValuePair_ptr nv=_map_find(this.value.map, arguments[0],0);
        if (!nv) return undefined;
        return nv->value;
    }

    /**
     * Map_getProperty: get existent key or throws
     */
    any Map_getProperty(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(_instanceof(this,Map));
        NameValuePair_ptr nv=_map_find(this.value.map, arguments[0],0);
        if(!nv) return undefined;
        return nv->value;
    }

    any Map_has(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(_instanceof(this,Map));
        NameValuePair_ptr nv=_map_find(this.value.map, arguments[0],0);
        if(!nv) return false;
        return true;
    }


    // Map.set(key,value)
    any Map_set(any this, len_t argc, any* arguments) {
        assert(argc==2);
        assert(_instanceof(this,Map));
        any key=arguments[0];

        _FLATTEN(key);
        assert(key.class=String_inx);

        len_t nextInx = this.value.map->nvpArr.length;
        int64_t found = _map_KeyTree_do(this.value.map,FIND_OR_INSERT,key,nextInx);
        if (found==nextInx){ //key inserted
            NameValuePair_s newItem={.name=key,.value=arguments[1]};
            _array_push(&(this.value.map->nvpArr),&newItem);
            this.value.map->size.value.number = this.value.map->nvpArr.length; //keep size prop
            assert(this.value.map->nvpArr.length==found+1);
        }
        else { //key exists, replace value
            this.value.map->nvpArr.base.nvp[found].value = arguments[1];
        }
    }

    any Map_delete(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(_instanceof(this,Map));
        NameValuePair_ptr removedNVP;
        removedNVP=_map_find( this.value.map, arguments[0], 1); //1=doDelete
        //remove found index from map array
        this.value.map->size.value.number--; //keep "size" prop
        if (!removedNVP) return undefined;
        return removedNVP->value;
    }

    any Map_keys(DEFAULT_ARGUMENTS) {
        len_t len = this.value.map->nvpArr.length;
        var result = _newArray(len,NULL);
        any* resItem = result.value.arr->base.anyPtr;
        for( NameValuePair_ptr nvp = this.value.map->nvpArr.base.nvp; len--; nvp++){
            _array_pushString(result, nvp->name);
        }
        return result;
    }

    any Map_clear(any this, len_t argc, any* arguments) {
        assert(argc==0);
        Map__init(this,argc,arguments);
    }

    #undef THIS
    // end Map methods
    //------


    // Date
    any _newDate(time_t value){
        return (any){Date_inx, .value.time = value};
    }

    any _DateTo(time_t t, str format, int local){
        struct tm * tm_s_ptr = local?localtime(&t):gmtime(&t); // Convert to Local/GMT
        const int SIZE = 64;
        any result = _newStringSize(SIZE);
        result.len = strftime(result.value.charPtr,SIZE,format,tm_s_ptr );
        return result;
    }
    any Date_toString(DEFAULT_ARGUMENTS){
        return _DateTo(this.value.time,"%a %B %d %Y %T GMT%z (%Z)",0);
    }
    any Date_toISOString(DEFAULT_ARGUMENTS){
        return _DateTo(this.value.time,"%FT%T.000Z",0);
    }
    any Date_toUTCString(DEFAULT_ARGUMENTS){
        return _DateTo(this.value.time,"%a, %d %B %Y %T %Z",0);
    }
    any Date_toDateString(DEFAULT_ARGUMENTS){
        return _DateTo(this.value.time,"%a %B %d %Y",1);
    }
    any Date_toTimeString(DEFAULT_ARGUMENTS){
        return _DateTo(this.value.time,"%T GMT%z (%Z)",1);
    }

    // Number
    any Number_isNaN(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        return (arguments[0].class==NotANumber_inx)?true:false;
    }

    // ------------
    // JSON
    //-------------

    int _json_indent_count=0;

    void _json_newLine(any* c){
        _pushToConcatd(c, any_LTR("\n"));
        _pushToConcatd(c, _string_spaces(_json_indent_count*2));
    }

    void _json_open(any* c, any opener){
        _pushToConcatd(c,opener);
        _json_indent_count++;
    }

    void _json_close(any* c, any closer){
        if (_json_indent_count) _json_indent_count--;
        _pushToConcatd(c,closer);
    }

    void _json_comma(any* c){
        _pushToConcatd(c, any_COMMA);
    }

    void _json_stringify(any what, any* c) {

        if (_json_indent_count>5){
            _pushToConcatd(c,any_LTR("[circular|too deep]"));
        }
        else if (what.class==Array_inx){
            // Array
            _json_open(c,any_OPEN_BRACKET);
            any* item = what.value.arr->base.anyPtr;
            len_t count=what.value.arr->length;
            for(int n=0; count--; n++,item++){
                if (n) _json_comma(c);
                _json_stringify(*item, c); //recurse
            }
            //if(what.value.arr->length)_json_newLine(c);
            _json_close(c,any_CLOSE_BRACKET);
        }
        else if (_instanceof(what,Map)){
            // Map
            _json_open(c,any_OPEN_CURLY);
            NameValuePair_ptr nvp = what.value.map->nvpArr.base.nvp;
            len_t count = what.value.map->nvpArr.length;
            if (count) {
                for(;;nvp++){
                    _json_newLine(c);
                    _pushToConcatd(c, any_QUOTE);
                    _pushToConcatd(c, nvp->name);
                    _pushToConcatd(c, any_QUOTE);
                    _pushToConcatd(c, any_COLON);
                    _json_stringify(nvp->value, c); //recurse
                    if (!--count) break;
                     _json_comma(c);
                }
                _json_newLine(c);
            }
            _json_close(c,any_CLOSE_CURLY);
        }
        else if (CLASSES[what.class].instanceSize){
            // Object
            _json_open(c,any_OPEN_CURLY);
            any* prop = what.value.prop;
            len_t count = CLASSES[what.class].propertyCount;
            for(int n=0; count--; n++, prop++){
                if (n) _json_comma(c);
                _json_newLine(c);
                _pushToConcatd(c, any_QUOTE);
                _pushToConcatd(c, _object_getPropertyNameAtIndex(what,n));
                _pushToConcatd(c, any_QUOTE);
                _pushToConcatd(c, any_COLON);
                _json_stringify(*prop, c); //recurse
            }
            _json_newLine(c);
            _json_close(c,any_CLOSE_CURLY);
        }
        else {
            if (what.class==String_inx) {
                Buffer_s b = _newBuffer();
                _Buffer_add(&b,any_QUOTE);
                _FLATTEN(what);
                for(int n=0;n<what.len;n++){
                    char ch=what.value.str[n];
                    // escape d-quotes & backslash
                    int escape=TRUE;
                    switch(ch){
                        case '"': case'\\': break;
                        case '\n': ch='n'; break;
                        case '\t': ch='t'; break;
                        case '\r': ch='r'; break;
                        default: escape=FALSE;
                    }
                    if (escape) _Buffer_addStr(&b,"\\");
                    _Buffer_addBytes(&b,&ch,1);
                }
                _Buffer_add(&b,any_QUOTE);
                _pushToConcatd(c,_Buffer_toString(&b));
            }
            else {
                _pushToConcatd(c, what);
            }
        }

    }

    any JSON_stringify(any this, len_t argc, any* arguments) {
        assert(argc>=1);
        _json_indent_count=0;
        var c=_newConcatdSlices();
        _json_stringify(arguments[0], &c);
        return c;
    }

    // ------------
    // console
    //-------------

    any console_debugEnabled;
    int console_indentLevel;

    void _outFile(any s, FILE* file){
        if (s.class!=String_inx) s= METHOD(toString_,s)(s,0,NULL);
        if (s.res){ //concatdSlices
            ConcatdItem_ptr sl = s.value.slices;
            for(;s.len--;sl++) fwrite(sl->str,1,sl->byteLen,file);
        }
        else { //simple str
            fwrite(s.value.str,1,s.len,file);
        }
    }

    void _outNewLineFile(FILE* file){
        fwrite(&"\n",1,1,file);
        fflush(file);
    }

    void _out(any s) { _outFile(s,stdout); };
    void _outNewLine() { _outNewLineFile(stdout); };

    void _outErr(any s) { _outFile(s,stderr); };
    void _outErrNewLine() { _outNewLineFile(stderr); };

    #ifndef NDEBUG
    void _outDebug(str msg, any s) {
        fprintf(stderr,"%s: ",msg);
        len_t len;
        if (s.class==Array_inx) {
            len=s.value.arr->length;
            fprintf(stderr,"Array[0..%d]=[",len);
            for(int n=0;n<s.value.arr->length;n++){
                if(n) _outErr(any_COMMA);
                fprintf(stderr,"%d:",n);
                if (n==10){
                    _outErr(any_LTR(",..."));
                    break;
                }
                _outErr(ITEM(s,n));
            }
            fprintf(stderr,"]\n");
        }
        else if (s.class==Map_inx) {
            len=s.value.arr->length;
            fprintf(stderr,"[Map]={",len);
            for(int n=0;n<len;n++){
                if(n) {
                    _outErr(any_COMMA);
                    if (n==10){
                        _outErr(any_LTR("..."));
                        break;
                    }
                }
                NameValuePair_s nvp = _unifiedGetNVPAtIndex(s,n);
                _outErr(nvp.name);
                _outErr(any_COLON);
                _outErr(nvp.value);
            }
            fprintf(stderr,"}\n");
        }
        else if (len=CLASSES[s.class].propertyCount) {
            _outErr(_concatAny(3,any_LTR("["),CLASSES[s.class].name,any_LTR("]={")));
            for(int n=0;n<len;n++){
                if(n) _outErr(any_COMMA);
                _outErr(_object_getPropertyNameAtIndex(s,n));
                _outErr(any_COLON);
                _outErr(s.value.prop[n]);
                if (n==30){
                    _outErr(any_LTR(",..."));
                    break;
                }
            }
            fprintf(stderr,"}\n");
        }
        else _outErr(s);

        _outErrNewLine();
    };
    #endif

    any console_log(DEFAULT_ARGUMENTS) {

        if (console_debugEnabled.value.uint64) console_error(this,argc,arguments);

        //indent spaces (console.group)
        _out(_string_spaces(console_indentLevel*2));
        // out arguments
        for(;argc--;arguments++) {
            _out(*arguments);
            _out(_string_spaces(1));
        }
        _outNewLine();
    }

    any console_info(DEFAULT_ARGUMENTS) {
        return console_log(this,argc,arguments);
    }
    any console_warn(DEFAULT_ARGUMENTS) {
        return console_log(this,argc,arguments);
    }

    any console_error(DEFAULT_ARGUMENTS) {
        if (console_debugEnabled.value.uint64) console_error(this,argc,arguments);

        //indent spaces (console.group)
        _outErr(_string_spaces(console_indentLevel*2));
        // out arguments
        for(;argc--;arguments++) {
            _outErr(*arguments);
            _outErr(_string_spaces(1));
        }
        _outErrNewLine();
    }

    //print(n,(any_arr){args}) is shortcut for console_log(undefined, n, (any_arr){a,b,c...
    void print(len_t argc, any* arguments){
        console_log(undefined,argc,arguments);
    }

    any console_group(DEFAULT_ARGUMENTS) {
        console_log(undefined,argc,arguments);
        console_indentLevel++;
        #ifndef NDEBUG
        if (console_indentLevel>40) raise(SIGTRAP);
        #endif
    }

    any console_groupEnd(DEFAULT_ARGUMENTS) {
        if (console_indentLevel) console_indentLevel--;
    }

    any console_timers;

    any console_time(DEFAULT_ARGUMENTS) {
        assert_arg(String);
        Map_set(console_timers,2,(any_arr){arguments[0],any_number(clock()}));
    }

    any console_timeEnd(DEFAULT_ARGUMENTS) {
        assert_arg(String);
        clock_t now=clock();
        var start=Map_get(console_timers,1,&(arguments[0]));
        if (start.class==Undefined_inx){
            print(4,(any_arr){any_QUOTE,arguments[0],any_QUOTE,any_LTR(" is not a valid console_timer")});
        }
        any milliseconds = any_CStr(_uint64ToStr( now - (int64_t)start.value.number));
        print(3,(any_arr){arguments[0], utf8slice(milliseconds,0,-3), any_LTR(" ms")});
        Map_delete(console_timers,1, (any_arr){arguments[0]});
    }

    // ------------
    // process
    //-------------
    any process_exit(any this, len_t argc, any* arguments) {
        exit(argc? arguments[0].value.number: 0);
    }

    any process_cwd(any this, len_t argc, any* arguments) {
       any b = _newStringSize(1024);
       if (!getcwd(b.value.ptr, 1024)) fatal("getcwd() returned NULL");
       b.len=strlen(b.value.ptr);
       return b;
    }

    // ------------
    // Buffer
    //-------------

    //parse times change radically if you change initial buffer size
    #define BUFFER_POWER2 6 // 2^5=32, 2^6=64, 2^7=128
    #define TRUNCkb(X) ( (X+(1<<BUFFER_POWER2))>>BUFFER_POWER2<<BUFFER_POWER2 )

    // non-allocd buffers - TO DEPRECATE
    #define Buffer_NUMBUFFERS 30
    #define Buffer_BUFSIZE 256
    char Buffer_buffers_SPACE[Buffer_NUMBUFFERS][256];
    char* Buffer_buffersStart=(char*)&Buffer_buffers_SPACE;

    any Buffer_byteLength(DEFAULT_ARGUMENTS){
        assert_arg(String);
        return any_number(arguments[0].len);
    }

    any Buffer_copy(DEFAULT_ARGUMENTS){
        assert_arg(Buffer);
        Buffer_s* me=(Buffer_ptr)this.value.ptr;
        Buffer_s* dest = arguments[0].value.ptr;
        if (dest->allocd < me->used) {
            //fail_with("dest buffer too small");
        }
        memmove(dest->ptr,me->ptr,me->used);
        dest->used = me->used;
    }

    /**
     * Make an immutable string (new malloc) from buffer contents (mutable)
     * new String is also C-compatible (has a extra byte=0, is NULL-TERMINATED)
     */
    any Buffer_newString(DEFAULT_ARGUMENTS){
        return _newString(this.value.buf->ptr, this.value.buf->used);
    }

    void _Buffer_clear(any buf){
        assert(buf.class==Buffer_inx);
        ((Buffer_ptr)buf.value.ptr)->used=0;
    }

    len_t _Buffer_appendSlice(Buffer_ptr me, len_t len, str str){
        if (me->used+len >= me->allocd) {
            //fail_with("buffer overflow");
            len_t newSize= me->used+len;
            newSize = ((newSize/Buffer_BUFSIZE)+1)*Buffer_BUFSIZE;
            me->ptr = mem_realloc(me->ptr,newSize);
            me->allocd = newSize;
        }
        memcpy(me->ptr+me->used, str, len);
        me->used += len;
        return len;
    }

    /**
     * append any number fo values to Buffer. Extends buffer if needed
     * @return actual buffer used bytes
     */
    any Buffer_append(DEFAULT_ARGUMENTS){
        assert(this.class==Buffer_inx);
        while(argc--){
            any item=*arguments++;
            if (item.class!=String_inx){
                item=__call(toString_,item,0,NULL);
            }

            assert(item.class=String_inx);
            if (item.res){ //concatdSlices
                ConcatdItem_ptr sl = item.value.slices;
                while(item.len--) _Buffer_appendSlice((Buffer_ptr)this.value.ptr, sl->byteLen, sl->str);
            }
            else {// simple string
                _Buffer_appendSlice((Buffer_ptr)this.value.ptr, item.len, item.value.str);
            }
        }
        return any_number(((Buffer_ptr)this.value.ptr)->used);
    }

    any Buffer_write(DEFAULT_ARGUMENTS){
        //fail_with("Buffer_write deprecated. use Buffer_append");
        assert_args({.req=2,.max=2,.control=2},String,Number);
        Buffer_s* me=(Buffer_ptr)this.value.ptr;
        len_t used=me->used;
        if (used!=arguments[1].value.number)
                fail_with("Buffer_write deprecated. use Buffer_append");

        any newUsed=Buffer_append(this,1,arguments);
        return any_number(newUsed.value.number - used);
    }

    void Buffer__init(DEFAULT_ARGUMENTS){
        assert_args({.req=0,.max=1,.control=1},Number);

        len_t size=Buffer_BUFSIZE;
        if (argc>=1) size=arguments[0].value.number;
        if (size<=0) size=Buffer_BUFSIZE;

        Buffer_s result = {
                .used=0,
                .allocd=size,
                .bufferInx=Buffer_buffers_length,
                .isMallocd = 1,
                .ptr= mem_alloc(size)
        };

        *((Buffer_ptr)this.value.ptr) = result;
    }

    // buffers using static space, extending to malloc if needed.
    // -Old- will be deprecated

    Buffer_s _newBuffer(){
        if (Buffer_buffers_length>=Buffer_NUMBUFFERS) fatal ("out of buffers");
        Buffer_s result= {
                .used=0,
                .allocd=Buffer_BUFSIZE,
                .bufferInx=Buffer_buffers_length,
                .isMallocd = 0,
                .ptr= Buffer_buffersStart+(Buffer_buffers_length*Buffer_BUFSIZE)
        };
        *result.ptr=0;
        Buffer_buffers_length++;
        return result;
    }

    void _Buffer_report(){
        fprintf(stderr,
                "----------\n"
                "Buffer_buffers_length %d\n"
                "Buffer_mallocd_count  %d\n"
                "Cloned_to_CString %d\n"
                "Flatten_calls %d\n"
                ,Buffer_buffers_length
                ,Buffer_mallocd_count
                ,Cloned_to_CString
                ,Flatten_calls
       );
    };

    void _freeBuffer(Buffer_s *dbuf){
        if (dbuf->bufferInx==Buffer_buffers_length-1) Buffer_buffers_length--;
    }
    /*
    Buffer_s _newBuffer(){
        return (Buffer_s){.used=0, .allocd=1<<BUFFER_POWER2, .ptr=mem_alloc(1<<BUFFER_POWER2)};
    }
    */
    void _Buffer_toMallocd(Buffer_s *dbuf, size_t newSize){
        assert(!dbuf->isMallocd);
        dbuf->isMallocd=1; //mark as mallocd
        char* newSpace = mem_alloc(newSize);
        memcpy(newSpace, dbuf->ptr, dbuf->used);
        dbuf->ptr = newSpace;
    }

    void _Buffer_addBytes(Buffer_s *dbuf, str ptr, size_t addSize){
        if (dbuf->used + addSize > dbuf->allocd){
            uint64_t newSize=TRUNCkb((uint64_t)dbuf->allocd + addSize);
            if (newSize>UINT32_MAX) fail_with("_Buffer_add: newSize>UINT32_MAX");
            if (!dbuf->isMallocd) {
                Buffer_mallocd_count++;
                _Buffer_toMallocd(dbuf,newSize);
            }
            else {
                Cloned_to_CString++;
                dbuf->ptr = mem_realloc(dbuf->ptr, newSize);
            }
            dbuf->allocd = newSize;
        }
        memcpy(dbuf->ptr + dbuf->used, ptr, addSize);
        dbuf->used += addSize;
    }

    void _Buffer_addStr(Buffer_s* dbuf, str s){
        if(s) _Buffer_addBytes(dbuf,s,strlen(s));
    }

    void _Buffer_add(Buffer_s* dbuf, any a){
        any string = CALL0(toString_,a);
        _Buffer_addBytes(dbuf, string.value.str, string.len );
    }

    void _Buffer_concatToNULL(Buffer_s* dbuf, str arg,...) {
        va_list argPointer;
        va_start(argPointer, arg);
        while(arg){
           _Buffer_addStr(dbuf,arg);
           arg=va_arg(argPointer,str);
        }
    }

    void _Buffer_add0(Buffer_s* dbuf){
        dbuf->ptr[dbuf->used]='\0';
    }

    any _Buffer_toString(Buffer_s* dbuf){
        _Buffer_add0(dbuf);
        if (!dbuf->isMallocd) {
            _Buffer_toMallocd(dbuf,dbuf->used);
        }
        _freeBuffer(dbuf); // toString means "free" because buffer is converted to malloc'd
        return any_slice(dbuf->ptr,dbuf->used); //convert to any
    }

    any Buffer_toString(DEFAULT_ARGUMENTS){
        return _Buffer_toString((Buffer_ptr)this.value.ptr);
    }

    /** pseudo-property ".length" is converted to a call
     * to _length(this).
     *
     * return type is int64_t so it plays nice with unary minus
     */
    int64_t _length(any this){
        return
                (this.class==String_inx)? utf8len(this)
                :(this.class==Array_inx)? this.value.arr->length
                :(this.class==Map_inx)? this.value.map->size.value.number // NO js-compat. js:Map.length==1 / litescript:number of keys
                :CLASSES[this.class].instanceSize / sizeof(any) // NO js-compat. js:Object.length==1 / litescript:number of props
                ;
    }

    double _convertAnyToNumber(any this){
        //NOTE: _anyToNumber(String) RETURNS ASCII CODE OF FIRST CHAR
        // on producer_C a single char StringLiteral is produced as a C unsigned char/byte
        //so expressions like:  `x > "A"` are converted to C's `_anyToNumber(x) > 'A'`
        // and 'A' in C is unsigned char/byte/65 >= a number
        // ---
        // use parseFloat to convert strings with number representations.
        //
        if (this.class==String_inx) return (double)this.value.str[0];
        if (this.class==Number_inx){
            if (this.res) return (double)this.value.uint64;
            return this.value.number;
        }
        if (this.class==Date_inx){
            return this.value.time;
        }
        return 0; //anything else: 0
    }

    double _anyToNumber_DEBUG(any this, str file, int line, str func,str argument){
        if (this.class!=String_inx
            && this.class!=Number_inx
            && this.class!=Date_inx
            ) {
            debug_abort(file,line,func,_concatAny(5
                ,any_LTR("converting: ")
                ,any_CStr(argument)
                ,any_LTR(". Cannot convert a instance of '")
                ,CLASSES[this.class].name
                ,any_LTR("' to Number")));
        }
        else
        return _convertAnyToNumber(this);
    }


    static char parseNumberTempBuffer[256];

    any parseFloat(DEFAULT_ARGUMENTS){
        assert(argc==1);
        char* endConverted;
        if (arguments[0].class==String_inx) {
            _toCStringCompatBuf(arguments[0], parseNumberTempBuffer, sizeof(parseNumberTempBuffer));
            return any_number(strtod(parseNumberTempBuffer,&endConverted));
        }
        else if (arguments[0].class==Number_inx) return arguments[0];
        else return NotANumber;
    }

    any parseInt(DEFAULT_ARGUMENTS){
        assert_args({.req=1,.max=2,.control=2},Undefined,Number);
        int base=0;
        if (argc>1) base=(int)arguments[1].value.number;
        char* endConverted;
        if (arguments[0].class==String_inx) {
            _toCStringCompatBuf(arguments[0], parseNumberTempBuffer, sizeof(parseNumberTempBuffer));
            any result = any_number(strtol(parseNumberTempBuffer,&endConverted,base));
            //if (errno=ERANGE) return NaN;
            if (endConverted==parseNumberTempBuffer) return NaN;
            return result;
        }
        if (arguments[0].class==Number_inx) return any_number((int64_t)(arguments[0].value.number));
        else return NotANumber;

    }

    int64_t _anyToInt64(any this){
        if (this.class==String_inx) {
            _toCStringCompatBuf(this, parseNumberTempBuffer, sizeof(parseNumberTempBuffer));
            return atol(parseNumberTempBuffer);
        }
        else if (this.class==Number_inx) return this.value.number;
        else {
            throw(_newErr(_concatAny(3
                    ,any_LTR("cannot convert [")
                    ,CLASSES[this.class].name
                    ,any_LTR("] to int64"))));
        }
    }

     /*int _anyToBoolI(any this){
        if (!this.value.int64 || this.class<=Null_inx) {
            return FALSE;
        }
        else if (this.class==Number_inx || this.class==Boolean_inx){
            return TRUE; //because the prev if, we know this.value.int64!=0
        }
        else if (this.class==String_inx){
            if (!this.len) return FALSE;
            if (!this.res) return this.value.str[0]; //false if "" - js compatibility
            // else concatdSlices. if a slice has something => TRUE
            for(int n=0;n<this.len;n++) if (this.value.slices[n].byteLen) return TRUE;
            return FALSE;
        }
        else {
            return TRUE; //a valid object pointer / non-empty var, returns "thruthy"
            //fail_with(_concatToNULL("cannot convert [",this.class->name.value.str,"] to boolean\n",NULL));
        }
    }
    */

     any __atb;
     int _anyToBool2(){
        if (!__atb.len) return FALSE;
        if (!__atb.res) return __atb.value.str[0]!=0; //false if "" - js compatibility
        //else //concatdSlices. if a slice has something => TRUE
        for(int n=0;n<__atb.len;n++) if (__atb.value.slices[n].byteLen) return TRUE;
        return FALSE;
    }
/*     int _anyToBool2(any this){
        if(this.class==String_inx) {
            if (!this.len) return FALSE;
            if (!this.res) return this.value.str[0]!=0; //false if "" - js compatibility
            //else //concatdSlices. if a slice has something => TRUE
            for(int n=0;n<this.len;n++) if (this.value.slices[n].byteLen) return TRUE;
            return FALSE;
        }
        else{
            return this.value.uint64!=0;
        }
    }
*/

    // -------------------------
    //-- __is2 OPTIMIZED string comparision helper
    // -------------------------
    any __isA,__isB; //temp storage non-thread safe
    // OPTIMIZED js triple-equal  "===" for strings
    bool __is2(){
        //check first for strings
        assert(__isA.class==String_inx && __isB.class==String_inx);

        //if (a.class == String_inx && b.class == String_inx){
            if(!__isA.res && !__isB.res) { //both simple
                if (__isA.len!=__isB.len) return FALSE; //diff length
                if (!__isA.len) return TRUE; //both empty
                if (__isA.value.str[0]!=__isB.value.str[0]) return FALSE; //1st byte differ
                if (__isA.value.str[__isA.len-1]!=__isB.value.str[__isA.len-1]) return FALSE; //last byte differ
                if (__isA.len<=2) return TRUE; //both bytes match
                switch(__isA.len){
                    case 3:
                        return __isA.value.str[1]==__isB.value.str[1]; //center defines
                    case 4:
                        return (uint16_t)*(uint16_t*)(__isA.value.str+1)==(uint16_t)*(uint16_t*)(__isB.value.str+1); //center 2 define
                    case 5: case 6:
                        return (uint32_t)*(uint32_t*)(__isA.value.str+1)==(uint32_t)*(uint32_t*)(__isB.value.str+1); //center 4 define
                    case 7:
                        if (__isA.value.str[1]!=__isB.value.str[1]) return FALSE; //1st byte differ
                        return (uint32_t)*(uint32_t*)(__isA.value.str+2)==(uint32_t)*(uint32_t*)(__isB.value.str+2); //center 4 define
                    case 8:
                        return (uint64_t)*(uint64_t*)(__isA.value.str)==(uint64_t)*(uint64_t*)(__isB.value.str); //center 8 define
                    case 9: case 10:
                        return (uint64_t)*(uint64_t*)(__isA.value.str+1)==(uint64_t)*(uint64_t*)(__isB.value.str+1); //center 8 define
                    default:
                        return memcmp(__isA.value.str+1,__isB.value.str+1,__isA.len-2)==0;
                }
                //return memcmp(a.value.str,b.value.str,a.len)==0;
            }
            //else concatdSlices
            return __compareStrings(__isA,__isB)==0;
        //}
        //else: not String
        // === if same class & value
        //return (a.class==b.class && a.value.uint64 == b.value.uint64); //same number or points to same object
    }


    #ifndef NDEBUG
    void _assert_args(DEFAULT_ARGUMENTS, str file, int line, str func, _assert_args_options options, any anyClass, ...){
        if(argc<options.req) {
            debug_abort(file,line,func,_concatAny(3
                ,any_LTR("required at least "),any_number(options.req),any_LTR(" arguments")));
        }
        if(options.max>=0){
            if (argc>options.max) {
                debug_abort(file,line,func,_concatAny(3
                    ,any_LTR("accept at most "),any_number(options.max),any_LTR(" arguments")));
            }
        }

        va_list classes;
        va_start (classes, anyClass);

        for(int order=1; order<=argc && order<=options.control; order++) {

            if(anyClass.value.classPtr == Undefined.value.classPtr) {
                // #order parameter can be any
                null; //do nothing
            }
            else if(order>options.req && arguments->class==Undefined_inx){
                null; //undefined, if not required, is OK
            }
            else if(arguments->class != anyClass.value.classPtr->classInx ) {
                debug_abort(file,line,func,_concatAny(4
                    ,any_LTR("expected argument #"),any_number(order),any_LTR("  to be a "),anyClass.value.classPtr->name));
            }

            arguments++;
            anyClass=va_arg(classes,any);
        }
    };
    #endif


    //-- _register Methods & props

    void _declareMethods(any anyClass, _methodInfoArr infoArr){
        assert(anyClass.class==Class_inx && anyClass.value.classPtr>CLASSES && anyClass.value.classPtr<=&CLASSES[CLASSES_len]);
        // set jmpTable with implemented methods
        if (infoArr) {
            jmpTable_t jmpTable=anyClass.value.classPtr->method;
            for( _methodInfoItemPtr info = &infoArr[0]; info->method!=0; info++) {
                jmpTable[-info->method] = info->function;
            }
        }
    }

    #ifndef NDEBUG
    //if for some reason, two property names get the same positional index
    //very hard-to-debug problems will arise. Here we make a sanity check on the rel pos prop table.
    void checkProps(any anyClass){

        assert(_instanceof(anyClass,Class));

        // check posTable with implemented prop
        posTable_t posTable = anyClass.value.classPtr->pos;
        propIndex_t tableLength = TABLE_LENGTH(posTable);

        size_t size=anyClass.value.classPtr->instanceSize;
        if (!size){ //no props
            assert(!tableLength);
            return;
        }

        int propsLength = size / sizeof(any);

        for(int n=1; n<tableLength; n++){ //pos 0 is TABLE_LENGTH
            propIndex_t pos = posTable[n];
            if (pos==INVALID_PROP_POS) continue;
            if (pos<0 || pos>=propsLength) {
                fprintf(stderr,"checkProps: class [%s] symbol %d:%s relative pos %d OUT OF BOUNDS. Props length is %d\n"
                        ,anyClass.value.classPtr->name.value.str,n
                        ,_symbol[n].value.str,pos,propsLength);
                fatal("sanity check");
            }
            for(int j=1; j<tableLength; j++) if (j!=n) {
                propIndex_t otherPos = posTable[j];
                if (pos==INVALID_PROP_POS) continue;
                if (otherPos==pos) {
                    fprintf(stderr,"checkProps: class [%s] relative pos %d duplicated for symbol %d:%s & %d:%s\n"
                            ,anyClass.value.classPtr->name.value.str,pos,n,_symbol[n].value.str,j,_symbol[j]);
                    fatal("sanity check");
                }
            }
        }
    }
    #endif

    void _declareProps(any anyClass, propIndex_t propsSymbolList[], size_t addedProps_byteSize){
        assert(anyClass.class==Class_inx && anyClass.value.classPtr>CLASSES && anyClass.value.classPtr<=&CLASSES[CLASSES_len]);
        // get offset. defined by how many properties are inherited from super class
        Class_ptr super = &CLASSES[anyClass.value.classPtr->super];
        propIndex_t posOffset = super->instanceSize/sizeof(any);
        // set posTable with implemented properties
        posTable_t posTable = anyClass.value.classPtr->pos;
        propIndex_t tableLength = TABLE_LENGTH(posTable);
        len_t addedPropsLength = addedProps_byteSize / sizeof(propIndex_t);
        len_t propsCount = anyClass.value.classPtr->propertyCount = posOffset + addedPropsLength;
        //table of property symbols: index->symbol
        posTable_t classSymbolTable = anyClass.value.classPtr->symbolNames = mem_alloc(propsCount*sizeof(propIndex_t));
        //start with super's
        if (posOffset) memcpy(classSymbolTable,super->symbolNames,posOffset*sizeof(propIndex_t));
        //if this class declare new properties, theese fo after super's props
        if (addedPropsLength){
            // set posTable with relative property positions at instance memory space
            for(int n=0; n<addedPropsLength; n++){
                symbol_t symbol = propsSymbolList[n];
                if (symbol<1 || symbol>=tableLength) fatal("_declareProps: invalid symbol");
                classSymbolTable[posOffset+n] = symbol; //index->symbol
                posTable[symbol] = posOffset+n; // table indirection: symbol -> position
            }
        }
        #ifndef NDEBUG
        checkProps(anyClass);
        #endif
    }



    //-----------------------
    //Core classes Methods
    //-----------------------

    #define M_END {0,NULL}};

    //Object
    #define M(symbol) { symbol##_, Object_##symbol },
    static _methodInfoArr Object_CORE_METHODS = {
         M( toString )
         M( hasOwnProperty )

         M( hasProperty )
         M( tryGetProperty )
         M( getProperty )
         M( setProperty )
         M( allPropertyNames )

         M( getPropertyNameAtIndex )
         M( tryGetMethod )
         M( iterableNext )
    M_END
    #undef M

    //Class
    static propIndex_t Class_CORE_PROPS[] = {
             name_, initInstance_
        };

    //String
    #define M(symbol) { symbol##_, String_##symbol },
    static _methodInfoArr String_CORE_METHODS = {
        M( toString )
        M( iterableNext )
        M( slice )
        M( split )
        M( indexOf )
        M( lastIndexOf )
        M( concat )
        M( toLowerCase )
        M( toUpperCase )
        M( charAt )
        M( charCodeAt )
        M( replaceAll )
        M( repeat )
        M( trim )
        M( substr )
        M( countSpaces )

        M( byteSubstr )
        M( byteIndexOf )
        M( byteSlice )

    M_END
    #undef M

    //Number
    #define M(symbol) { symbol##_, Number_##symbol },
    static _methodInfoArr Number_CORE_METHODS = {
        M( toString )
    M_END
    #undef M

    //Date
    #define M(symbol) { symbol##_, Date_##symbol },
    static _methodInfoArr Date_CORE_METHODS = {
        M( toString )
        M( toISOString )
        M( toUTCString )
        M( toTimeString )
        M( toDateString )
    M_END
    #undef M

    //Error
    #define M(symbol) { symbol##_, Error_##symbol },
    static _methodInfoArr Error_CORE_METHODS = {
        M( toString )
    M_END
    #undef M
    static propIndex_t Error_PROPS[] = {
            name_,
            message_,
            stack_,
            code_
        };

    //Iterable_Position
    #define M(symbol) { symbol##_, Iterable_Position_##symbol },
    static _methodInfoArr Iterable_Position_CORE_METHODS = {
        M( next )
    M_END
    #undef M

    //Array
    #define M(symbol) { symbol##_, Array_##symbol },
    static _methodInfoArr Array_CORE_METHODS = {
        M( toString )
        M( iterableNext )
        M( push )
        M( pop )
        M( unshift )
        M( shift )
        M( slice )
        M( splice )
        M( indexOf )
        M( lastIndexOf )
        M( join )
        M( concat )
        M( tryGet )  //equivalent to js array access, returns undefined on OUT OF BOUNDS
        M( set )    //equivalent to js array access-set, extends array on OUT OF BOUNDS
        M( clear )
        M( sort )
    M_END
    #undef M

    //Map
    #define M(symbol) { symbol##_, Map_##symbol },
    static _methodInfoArr Map_CORE_METHODS = {
        M( iterableNext )

        M( has )
        M( get )
        M( set )
        M( delete )
        M( clear )
        M( keys )

        // Map is interchangeable with Object, so it can act as a dynamic js object
         { hasProperty_, Map_has },
         { hasOwnProperty_, Map_has },
         { tryGetProperty_, Map_get },
         { setProperty_, Map_set },
         { allPropertyNames_, Map_keys },

        M( getProperty ) //get or throw

    M_END
    #undef M
    static propIndex_t Map_PROPS[] = {
            size_
        };

    //NameValuePair
    static propIndex_t NameValuePair_PROPS[] = {
            name_,
            value_
        };

    // Buffer
    #define M(symbol) { symbol##_, Buffer_##symbol },
    static _methodInfoArr Buffer_CORE_METHODS = {
        M( toString )
        M( append )
        M( write )
        M( copy )
    M_END
    #undef M

    // Iterable_Position
    static propIndex_t IterablePos_PROPS[] = {
            key_,value_,
            index_,size_,
            iterable_,
            extra_
        };

//-------------------
// init lib util
//--------------------
    void LiteC_addMethodSymbols(int methodsCount, str* _verb_table){
        int toExpand=0;
        while(_symbolTableCenter+toExpand - (_allMethodsMax+methodsCount) < 0) toExpand+=128;
        if (toExpand) {
            // realloc
             _symbolTable = mem_realloc(_symbolTable, (_symbolTableLength+toExpand)*sizeof(any));
            // re-center data
            memmove(_symbolTable+toExpand, _symbolTable, _symbolTableLength*sizeof(any));
            // set new length
            _symbolTableLength+=toExpand;
            // re-center pointers
            _symbolTableCenter+=toExpand;
            _symbol= &_symbolTable[_symbolTableCenter];
        }
        // set new method max & length
        _allMethodsMax += methodsCount;
        _allMethodsLength += methodsCount;
        // set added method names at _symbol-_allMethodsMax (new _symbolTable occupied space start)
        assert(_symbol-_allMethodsLength >= _symbolTable);

        // fill table, compute strlen of each symbol
        for(any* ptr=_symbol-_allMethodsMax; methodsCount--; ptr++,_verb_table++){
            *ptr=any_CStr(*_verb_table);
        }

    }

    void LiteC_addPropSymbols(int propsCount, str* _things_table){
        int toExpand=0;
        while( _symbolTableLength-_symbolTableCenter+toExpand < _allPropsLength+propsCount ) toExpand+=128;
        if (toExpand) {
            // realloc, set new length
            _symbolTable = mem_realloc(_symbolTable, (_symbolTableLength+=toExpand)*sizeof(str));
            // refresh _symbol pointer
            _symbol= &_symbolTable[_symbolTableCenter];
        }
        // set added prop names at _symbol+_allPropsLength
        assert(_symbolTableCenter+_allPropsLength+propsCount <= _symbolTableLength);

        // fill start
        any* ptr=_symbol+_allPropsLength;
        // set new _allPropsLength
        _allPropsLength  += propsCount;
        // fill table, compute strlen of each symbol
        for(; propsCount--; ptr++,_things_table++){
            *ptr=any_CStr(*_things_table);
        }
    }

    any _typeof(any this){ //js compatible (with all the quirks)
        switch(this.class){
            case Undefined_inx: return any_LTR("undefined");
            case Boolean_inx: return any_LTR("boolean");
            case Number_inx: return any_LTR("number");
            case String_inx: return any_LTR("string");
            case Function_inx: case Class_inx: return any_LTR("function");
            default: return any_LTR("object");
        }
    }
    #define _typeof(S) CLASSES[S.class].typeName

//-------------------
// init lib
//--------------------

    any
        any_EMPTY_STR, any_COMMA, any_COLON,
        any_SINGLE_QUOTE, any_QUOTE,
        any_OPEN_BRACKET, any_CLOSE_BRACKET,
        any_OPEN_CURLY, any_CLOSE_CURLY;

    void LiteC_init(int classesCount, int argc, char** CharPtrPtrargv){

        LiteCore_version = any_LTR("8.0.5");
        LiteCore_buildDate = any_LTR(__DATE__ " " __TIME__);

        //sanity checks
        assert(sizeof(symbol_t)==sizeof(propIndex_t));
        assert(sizeof(INVALID_PROP_POS)==sizeof(propIndex_t));
        assert(sizeof(function_ptr)>=sizeof(propIndex_t));

        assert(_END_CORE_METHODS_ENUM==0); // from -21 to 0

        //common Strings
        any_EMPTY_STR=any_LTR("");
        any_COMMA=any_LTR(", ");
        any_SINGLE_QUOTE=any_LTR("'");
        any_QUOTE=any_LTR("\"");
        any_COLON=any_LTR(": ");
        any_OPEN_BRACKET=any_LTR("[");
        any_CLOSE_BRACKET=any_LTR("]");
        any_OPEN_CURLY=any_LTR("{");
        any_CLOSE_CURLY=any_LTR("}");

        console_debugEnabled = false;

        //init symbol table
        /*

        _allMethodsMax = _CORE_METHODS_MAX;
        _allMethodsLength = _allMethodsMax+1;
        _allPropsLength = _CORE_PROPS_LENGTH;

        _symbolTableLength = ((_allMethodsMax+_allPropsLength+256)>>8<<8); //round up mod 256 - at least 256 free
        _symbolTable = mem_alloc(_symbolTableLength*sizeof(str));

        _symbolTableCenter = (_symbolTableLength-_allMethodsLength-_allPropsLength)/2+_allMethodsMax;
        _symbol = &_symbolTable[_symbolTableCenter]; // ptr to "center" -> symbol:0 -> prop:"constructor"

        // set core method names at _symbol-_CORE_METHODS_MAX
        assert(_symbol-_CORE_METHODS_MAX >= _symbolTable);
        memcpy(_symbol-_CORE_METHODS_MAX, _CORE_METHODS_NAMES, _CORE_METHODS_MAX*sizeof(str));
        // set core props names at _symbol
        memcpy(_symbol, _CORE_PROPS_NAMES, _CORE_PROPS_LENGTH*sizeof(str));
         */

        _allMethodsMax = 0;
        _allMethodsLength = _allMethodsMax +1;
        _allPropsLength = 0;

        _symbolTableLength = 512;
        _symbolTable = mem_alloc(_symbolTableLength*sizeof(any));

        _symbolTableCenter = (_symbolTableLength-_allMethodsLength-_allPropsLength)/2+_allMethodsMax;
        _symbol = &_symbolTable[_symbolTableCenter]; // ptr to "center" -> symbol:0 -> prop:"constructor"

        // add core method names at _symbol-_CORE_METHODS_MAX
        assert(_symbol - _CORE_METHODS_MAX >= _symbolTable);
        LiteC_addMethodSymbols(_CORE_METHODS_MAX, _CORE_METHODS_NAMES);
        // add core props names
        assert(_CORE_PROPS_LENGTH==sizeof(_CORE_PROPS_NAMES)/sizeof(str));
        LiteC_addPropSymbols(_CORE_PROPS_LENGTH, _CORE_PROPS_NAMES);

        assert(constructor_== 0);
        assert(__is(_symbol[constructor_],any_LTR("constructor")));

        assert(_allMethodsMax>1 && _allMethodsLength==_allMethodsMax+1 && _allPropsLength>1);

        //-------
        // init CLASSES
        //-------
        CLASSES_allocd=_LAST_CORE_CLASS+classesCount+16;
        CLASSES=mem_alloc(sizeof(Class_s)*CLASSES_allocd);
        any_CLASSES=mem_alloc(sizeof(any)*CLASSES_allocd);

        //-------
        // class hierarchy root
        //-------
        // chicken & egg problem:
        // AnyBoxedValue_CLASSINFO, Object_CLASSINFO & Class_CLASSINFO must be initialized manually
        // (can't use _newClass() without valid values in Class_CLASSINFO )
        // Object has a pointer to Class(CLASSINFO) & Class has a ptr to Object (class & super)
        //-------

        //-------
        // hierarchy root
        // empty jmpTable & posTable
        jmpTable_t EMPTY_JMP_table = mem_alloc( 1 * sizeof(function_ptr));
        posTable_t EMPTY_POS_table = mem_alloc( 1 * sizeof(propIndex_t));
        //set length
        TABLE_LENGTH(EMPTY_JMP_table)=0; //table[0] holds table length. table lengths can increase if more symbols are registered
        TABLE_LENGTH(EMPTY_POS_table)=0; //table[0] holds table length. table lengths can increase if more symbols are registered


        // hierarchy root - base CLASSES
        //-------
        CLASSES[AnyBoxedValue_inx] = (struct Class_s){
                .name = any_LTR("AnyBoxedValue"), // str class name
                .initInstance = any_func(NULL), // function __init
                .instanceSize = 0, //size_t instanceSize
                .classInx = 0, // index into CLASSES
                .super =  0, //super class index into CLASSES
                .method = EMPTY_JMP_table, //jmp table
                .pos = EMPTY_POS_table //prop rel pos table
                };

        // basic jmpTable & posTable
        jmpTable_t Object_JMPTABLE = _newJmpTableFrom(NULL);
        posTable_t Object_POSTABLE = _newPosTableFrom(NULL);

        CLASSES[Object_inx] = (struct Class_s){
                .name = any_LTR("Object"), // str type name
                .initInstance = any_func(NULL), // function __init
                .instanceSize = 0, //size_t instanceSize
                .classInx = Object_inx, // index into CLASSES
                .super =  0, //super class
                .method = Object_JMPTABLE, //jmp table
                .pos = Object_POSTABLE //prop rel pos table
                };

        // class as var of type Class
        any_CLASSES[Object_inx]=(any){.class=Class_inx,.res=0,.len=0,.value.ptr=&CLASSES[Object_inx]};

        CLASSES[Class_inx] = (struct Class_s){
                .name = any_LTR("Class"), // str type name
                .initInstance = any_func(NULL), // function __init
                .instanceSize = sizeof(struct Class_s), //size_t instanceSize
                .classInx = Class_inx, // index into CLASSES
                .super = Object_inx, //super class
                .method = _newJmpTableFrom(Object_JMPTABLE), //basic jmp table
                .pos = _newPosTableFrom(Object_POSTABLE) //basic prop rel pos table
                };

        // class as var of type Class
        any_CLASSES[Class_inx]=(any){.class=Class_inx,.res=0,.len=0,.value.ptr=&CLASSES[Class_inx]};

        CLASSES_len = _LAST_CORE_CLASS;

        //root Classes as vars
        Object = (any){.class=Class_inx, .res=0, .value.classPtr=&CLASSES[Object_inx]};
        Class = (any){.class=Class_inx, .res=0, .value.classPtr=&CLASSES[Class_inx]};

        // hierarchy root - Object's methods & class props
        _declareMethods(Object, Object_CORE_METHODS);
        //no props on "Object"

        // no methods on "Class"
        _declareProps(Class, Class_CORE_PROPS, sizeof Class_CORE_PROPS);

        //-------
        // no-allocd-instance-classes (native types & classes w/o instance memory space)
        //-------
        #define BOXED_VALUE(X); \
            CLASSES[X##_inx] = (struct Class_s){ \
                .name=any_LTR(#X), .initInstance=any_func(NULL),\
                .instanceSize=0, .propertyCount = 0, .symbolNames=NULL, \
                .classInx=X##_inx, .super=AnyBoxedValue_inx, \
                .method=_newJmpTableFrom(Object_JMPTABLE), \
                .pos=_newPosTableFrom(Object_POSTABLE) }; \
            any_CLASSES[X##_inx]=(any){.class=Class_inx,.res=0,.len=0,.value.ptr=&CLASSES[X##_inx]}; \
            X = (any){.class=Class_inx, .res=0, .value.classPtr=&CLASSES[X##_inx]}

        BOXED_VALUE(String);
        BOXED_VALUE(Number);
        BOXED_VALUE(Date);
        BOXED_VALUE(Function);

        BOXED_VALUE(Boolean);
        CLASSES[Boolean_inx].method[-toString_]=&Boolean_toString;
        true = (any){Boolean_inx,.value.number=1};
        false = (any){Boolean_inx,.value.number=0};

        BOXED_VALUE(Undefined);
        CLASSES[Undefined_inx].method[-toString_]=&Undefined_toString;

        BOXED_VALUE(Null);
        CLASSES[Null_inx].method[-toString_]=&Null_toString;
        null = (any){Null_inx,0};

        BOXED_VALUE(NotANumber);
        CLASSES[NotANumber_inx].method[-toString_]=&NaN_toString;
        NaN= (any){NotANumber_inx,.value.uint64=0};

        BOXED_VALUE(InfinityClass);
        CLASSES[InfinityClass_inx].method[-toString_]=&Infinity_toString;
        Infinity= (any){InfinityClass_inx,.value.uint64=0};

        //String methods
        _declareMethods(String, String_CORE_METHODS); //no props

        //Number methods
        _declareMethods(Number, Number_CORE_METHODS); //no props

        //Date methods
        _declareMethods(Date, Date_CORE_METHODS); //no props

        #define FROM_OBJECT(X); \
            CLASSES[X##_inx] = (struct Class_s){ \
                .name=any_LTR(#X), .initInstance=any_func(X##__init), \
                .instanceSize=sizeof(struct X##_s),\
                .propertyCount = 0, .symbolNames=NULL, \
                .classInx=X##_inx, .super=Object_inx, \
                .method=_newJmpTableFrom(Object_JMPTABLE), \
                .pos=_newPosTableFrom(Object_POSTABLE) }; \
            any_CLASSES[X##_inx]=(any){.class=Class_inx,.res=0,.len=0,.value.ptr=&CLASSES[X##_inx]}; \
            X = (any){Class_inx, .res=0, .value.classPtr=&CLASSES[X##_inx]}

        FROM_OBJECT(Error);
        _declareMethods(Error, Error_CORE_METHODS);
        _declareProps(Error, Error_PROPS, sizeof Error_PROPS);

        FROM_OBJECT(Array); // only internal props (length & item)
        _declareMethods(Array, Array_CORE_METHODS);

        FROM_OBJECT(Map);
        _declareMethods(Map, Map_CORE_METHODS);
        _declareProps(Map, Map_PROPS, sizeof Map_PROPS); //only prop is .size

        FROM_OBJECT(NameValuePair); // only internal
        _declareProps(NameValuePair, NameValuePair_PROPS, sizeof NameValuePair_PROPS);

        FROM_OBJECT(Buffer); // only internal props (allocd, used, ptr)
        _declareMethods(Buffer, Buffer_CORE_METHODS);

        FROM_OBJECT(Iterable_Position);
        _declareMethods(Iterable_Position, Iterable_Position_CORE_METHODS);
        _declareProps(Iterable_Position, IterablePos_PROPS, sizeof IterablePos_PROPS);

        BOXED_VALUE(FileDescriptor);

        //console module vars
        console_timers = new(Map,0,NULL);

        //init process_argv with program arguments
        process_argv = _newArrayFromCharPtrPtr(argc,CharPtrPtrargv);

        //init __dirname
        #define PROC_EXE "/proc/self/exe"
        int nameLen;
        if ((nameLen=readlink(PROC_EXE, tempBuffer , sizeof(tempBuffer)-1))<=0) {
            perror("readlink " PROC_EXE);
            fatal("cannot determine __dirname");
        }
        //remove file name, leave dir only
        while(nameLen>1 && tempBuffer[nameLen]!='/') nameLen--;
        __dirname = _newString(tempBuffer,nameLen);
        DEBUG(__dirname);
    };

    void LiteC_finish(){
        //_Buffer_report();
    }

