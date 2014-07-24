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

    any any_EMPTY_STR;

    any* watchedPropAddr;

    // _symbol names
    str* _symbolTable;
    symbol_t _symbolTableLength, _symbolTableCenter; //need to be int, beacuse symbols are positive and negative
    symbol_t _allPropsLength, _allMethodsLength, _allMethodsMax;
    str* _symbol; // table "center", symbol:0, prop "constructor".
    // To get a symbol name: printf("symbol %d is %s",x,_symbol[x]); //method symbols are negative

    // core method names
    static str _CORE_METHODS_NAMES[]={

        "push"
        ,"pop"
        ,"shift"
        ,"unshift"
        ,"join"
        ,"splice"
        ,"tryGet"

        ,"toISOString"
        ,"toUTCString"
        ,"toDateString"
        ,"toTimeString"

        ,"copy"  //Buffer
        ,"write"

        ,"slice"
        ,"split"
        ,"indexOf"
        ,"lastIndexOf"
        ,"concat"
        ,"toLowerCase"
        ,"toUpperCase"
        ,"charAt"
        ,"replaceAll"
        ,"trim"
        ,"substr"
        ,"countSpaces"

        ,"tryGetMethod"
        ,"tryGetProperty"
        ,"getProperty"
        ,"getPropertyNameAtIndex"
        ,"setProperty"
        ,"hasProperty"
        ,"hasOwnProperty"
        ,"getObjectKeys"
        ,"initFromObject"

        ,"has"
        ,"get"
        ,"set"
        ,"delete"
        ,"clear"
        ,"keys"

        ,"toString"

    };

    static str _CORE_PROPS_NAMES[]= {
        "constructor" //all instances, symbol:0

        ,"name" // Class.name -1
        ,"initInstance" // Class.initInstance

        ,"size" // Map size
        ,"value" // NameValuePair

        ,"message" // Error.message
        ,"stack" // Error.stack
        ,"code" // Error.code
    };

    //inline any any_number(double S){ return (any){&Number_CLASSINFO,.value.number=S};}

// --------------------------
// _typeof, _instanceof
// --------------------------
    any _typeof(any this){
        return METHOD(toLowerCase_,this.class->name)(this.class->name,0,NULL);
    }

    bool _instanceof(any this, any searchedClass){
        assert(searchedClass.class==&Class_CLASSINFO); //searchedClass should be a Class
        //follow the inheritance chain, until NULL or searched class found
        for(Class_ptr classIptr=this.class; classIptr!=NULL; classIptr=classIptr->super) {
            if(classIptr == searchedClass.value.classINFOptr) return TRUE;
        }
        return FALSE;
    }

//--- debug helpers
    void debug_fail(str file,int line,str message){
        fprintf(stderr,"%s:%d:1 %s",file,line,message);
        fail_with(message);
    }

    function_ptr __classMethodNat(symbol_t symbol, Class_ptr class){
        assert(symbol < 0);
        assert( -symbol < _allMethodsLength);
        assert(class);
        function_ptr fn;
        if ( -symbol < TABLE_LENGTH(class->method) && (fn=class->method[-symbol])){
            return fn;
        }
        fail_with(_concatToNULL("no method '",_symbol[symbol],"' on class '",class->name.value.str,"'\n",NULL));

    }

    // #ifdef NDEBUG, macro METHOD resolves to __method().
    // Note: for no-checks code, CALL resolves to direct jmp: this.class->call[method](this,argc,arguments)
    function_ptr __classMethod(symbol_t symbol, any anyClass){
        assert(_instanceof(anyClass,Class));
        return __classMethodNat(symbol, anyClass.value.classINFOptr );
    }


    any __call(symbol_t symbol, DEFAULT_ARGUMENTS){
        function_ptr fn = __classMethodNat(symbol, this.class);
        return fn(this,argc,arguments);
    }


    any __classMethodFunc(symbol_t symbol, any anyClass){
        assert(anyClass.class==&Class_CLASSINFO);
        return any_func(__classMethod(symbol, anyClass));
    }

    function_ptr __method(symbol_t symbol, any this){
        assert(this.class);
        return __classMethodNat(symbol, this.class);
    }

    // #ifdef NDEBUG, macro PROP resolves to __prop().
    // else PROP resolves to direct access: this.value.instance[this.class->pos[prop]]
    // get a reference to a property value
    any* __prop(symbol_t symbol, any this, str file, int line){
        assert(symbol>0); // prop can't be 0. symbol:0 is "constructor" and gets short-circuited to props[0]
        assert(this.class);
        assert(symbol<_allPropsLength);
        _posTableItem_t pos;
        if (symbol < TABLE_LENGTH(this.class->pos) && (pos=this.class->pos[symbol])!=INVALID_PROP_POS){
            if (&(this.value.prop[pos])==watchedPropAddr){
               //raise(SIGTRAP);
               symbol=symbol;
            }
            return &(this.value.prop[pos]);
        }
        debug_fail(file,line,_concatToNULL("no property '",_symbol[symbol],"' on class '",this.class->name.value.str,"'",NULL));
        // on invalid property, we do not return "undefined" as js does
    }

    any* __item(int64_t index, any arrProp, str file, int line){

        if (arrProp.class!=&Array_CLASSINFO) {
            debug_fail(file,line," index access: [], object isnt instance of Array");
        }
        if (index<0) {
            debug_fail(file,line,"index access: [], negative index");
        }

        // check index against arr->length
        if (index >= arrProp.value.arr->length){
            debug_fail(file,line,_concatToNULL(" OUT OF BOUNDS index[",_int64ToStr(index)
                     ,"]. Array.length is ",_int64ToStr(arrProp.value.arr->length),NULL));
        }
        return &(arrProp.value.arr->item[index]);

    }


    //Note: to be js-compat, a _tryGet() array method is provided
    // Array.tryGet() will just return "undefined"
    // instead of raising an exception / SEGFAULT
    any Array_tryGet(DEFAULT_ARGUMENTS){
        assert(argc==1);
        assert(arguments[0].class==&Number_CLASSINFO);
        if (!_instanceof(this,Array)) {
            fail_with("Array_tryGet(), object isnt instance of Array");
        }
        //get index from argument 0
        int64_t index=(int64_t)arguments[0].value.number;
        // check index against arr->length
        if (index<0 || index >= this.value.arr->length){
            //Note: to be js-compat, will just return "undefined"
            return undefined;
        }
        return this.value.arr->item[index];
    }

    // get a reference to a value at a index in an array
    // get & set from Array
    any* __item2(int index, int arrPropName, any this, str file, int line){
        // get array property
        var arrProp = *(__prop(arrPropName,this,file,line));
        if (! _instanceof(arrProp,Array)){
            fprintf(stderr,"access index[%d]: property '%s' on class '%s' is not instance of Array\n"
                    ,index,_symbol[arrPropName],this.class->name.value.str);
            abort();
        }
        return __item(index,arrProp,file,line);
    }

    any __apply(any anyFunc, DEFAULT_ARGUMENTS){
        assert(anyFunc.class==&Function_CLASSINFO);
        assert(anyFunc.value.ptr);
        return ((function_ptr)anyFunc.value.ptr)(this,argc,arguments);
    }

    any __applyArr(any anyFunc, any this, any argsArray){
        assert(anyFunc.class==&Function_CLASSINFO);
        assert(argsArray.class==&Array_CLASSINFO); //must be array to convert to argc,any* arguments
        return __apply(anyFunc, this, argsArray.value.arr->length, argsArray.value.arr->item);
    }

    void _default(any* variable,any value){
        if (variable->class==&Undefined_CLASSINFO) *variable=value;
    }

    // --------------------------
    //-- any comparision helpers
    // --------------------------
    bool __is(any a,any b){  //js triple-equal, "==="
        return
            (a.class!=b.class)? FALSE
            :(a.class == &String_CLASSINFO)? strcmp(a.value.str,b.value.str)==0
            :a.value.uint64 == b.value.uint64; //same number or points to same object
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
    /*any __or(any a,any b){  //js or, returns first argument if not falsey, else second argument
        if (!a.value.uint64) return b;
        if (a.class==&String_CLASSINFO && a.value.str[0]==0) return b;
        return a;
    }*/

    bool __in(any needle, len_t haystackLength, any* haystackItem){
        if (!haystackLength) return FALSE; //empty haystack
        for(;haystackLength--;){
            if (__is(needle,*haystackItem++)) return TRUE;
        }
        return FALSE;
    }

//
//-- core classes with _CLASSINFO
//
    struct Class_s BoxedValue_CLASSINFO;
    struct Class_s Object_CLASSINFO;
    struct Class_s Class_CLASSINFO;
    struct Class_s Null_CLASSINFO;
    struct Class_s Undefined_CLASSINFO;
    struct Class_s Boolean_CLASSINFO;
    struct Class_s String_CLASSINFO;
    struct Class_s Number_CLASSINFO;
    struct Class_s NaN_CLASSINFO;
    struct Class_s Infinity_CLASSINFO;
    struct Class_s Date_CLASSINFO;
    struct Class_s Function_CLASSINFO;

    struct Class_s Error_CLASSINFO;
    struct Class_s Array_CLASSINFO;
    struct Class_s Map_CLASSINFO;
    struct Class_s NameValuePair_CLASSINFO;
    struct Class_s Buffer_CLASSINFO;
    struct Class_s FileDescriptor_CLASSINFO;

// core Class objects -------------------
    //any Global;
    any Null, Undefined, String, Number, Date, Boolean;
    any NaN, Infinity;
    any Object, Class, Function, Error, Array, Map, NameValuePair;
    any Buffer, FileDescriptor;

// core instances -------------------
    //any global;
    any null, undefined, true, false;
    any process_argv;

// --------------------
// core classes helper register functions

    _jmpTable _newJmpTableFrom(_jmpTable superJmptable){
        _jmpTable table = mem_alloc( _allMethodsLength * sizeof(function_ptr));
        if (superJmptable) memcpy(table, superJmptable, TABLE_LENGTH(superJmptable) * sizeof(function_ptr)); //copy super jmp table
        //AFTER memcpy, set length. (memcpy copies super TABLE_LENGTH)
        TABLE_LENGTH(table)=_allMethodsLength; //table[0] holds table length. table lengths can increase if more symbols are registered
        return table;
    }

    _posTable _newPosTableFrom(_posTable superPosTable){
        _posTable table = mem_alloc( _allPropsLength*sizeof(_posTableItem_t) );
        memset(table,0xFF,_allPropsLength*sizeof(_posTableItem_t)); //0xFFFF means invalid property
        if (superPosTable) memcpy(table, superPosTable, TABLE_LENGTH(superPosTable) * sizeof(_posTableItem_t)); //copy super prop rel pos table
        //AFTER memcpy, set length. (memcpy copies super TABLE_LENGTH)
        TABLE_LENGTH(table) = _allPropsLength; //table[0] holds table length. table lengths can increase if more symbols are registered
        return table;
    }

// --------------------
// core classes __init functions

    void Class__init(DEFAULT_ARGUMENTS){
        assert(argc>=4);
        assert(arguments[0].class==&String_CLASSINFO);
        assert(arguments[1].class==&Function_CLASSINFO);
        assert(arguments[2].class==&Number_CLASSINFO);
        assert(arguments[3].class==&Class_CLASSINFO);
        //---------
        len_t instanceSize = (len_t)arguments[2].value.number;
        Class_ptr super = arguments[3].value.classINFOptr;
        assert(super); //for classes declared by "_newClass", there's always a super, at least Object
        //---------
        // sanity checks
        // super class should be initialized before creating this classs
        // instance size should at least super's instance size
        if (!_anyToBool(super->name)) fatal(_concatToNULL("init class [",arguments[0].value.str,"]. super is not initialized",NULL));
        if (instanceSize < super->instanceSize) fatal(_concatToNULL("init class [",arguments[0].value.str,"]. instanceSize cannot be smaller than super",NULL));
        //---------
        Class_ptr prop = (Class_ptr)this.value.prop; // with this.properties
        //---------
        // any-visible
        prop->name = arguments[0];
        prop->initInstance = arguments[1];
        // native-invisible
        prop->super = super;
        prop->instanceSize = instanceSize; // created instances memory size

        #ifndef NDEBUG
        /*fprintf(stderr, "init class [%s]\n"
                "instanceSize:%" PRIu32 " sizeof(any):%d  propsLength:%d\n"
                "super: %s  super instanceSize:%" PRIu32 " super propsLength:%d\n-------\n"
                ,arguments[0].value.str
                ,instanceSize,sizeof(any),(int)instanceSize/sizeof(any)
                ,super->name.value.str, super->instanceSize, (int)super->instanceSize/sizeof(any));
        */
        #endif

        prop->method = _newJmpTableFrom(super->method); //starts with super's jmp table
        prop->pos = _newPosTableFrom(super->pos); //starts with super's props table
    }

    void Error__init(DEFAULT_ARGUMENTS){
        ((Error_ptr)this.value.ptr)->message = argc? arguments[0]:any_EMPTY_STR;
        ((Error_ptr)this.value.ptr)->name = any_str("Error");
    }

    Array_ptr _initArrayAt(Array_ptr a, len_t initialLen, any* optionalValues){
        if (!a) a = mem_alloc(sizeof(struct Array_s));
        size_t size = (initialLen? initialLen : 4) * sizeof(any);
        a->item = mem_alloc(size);
        a->length=initialLen;
        if (initialLen && optionalValues) {
            memcpy(a->item, optionalValues, initialLen*sizeof(any));
        }
        return a;
    };

    void _clearArrayItems(Array_ptr a, len_t start, len_t count){
        for(len_t n=start; n<a->length && count>0; count--,n++){
            a->item[n]=undefined;
        }
    }

    any _newArray(len_t initialLen, any* optionalValues){
        return (any){&Array_CLASSINFO, _initArrayAt(NULL,initialLen,optionalValues)};
    }
    any Array_clone(any this, len_t argc, any* arguments){
        return _newArray(this.value.arr->length, this.value.arr->item);
    };

    any _newArrayFromCharPtrPtr(len_t argc, char** argv){
        // convert main function args into Array
        any a = _newArray(argc,NULL);
        any* item = a.value.arr->item;
        for(;argc--;){ *item++=(any){&String_CLASSINFO,*argv++}; }
        return a;
    };

    //init Fn for Array Objects, called from new() after instance space allocd
    void Array__init(DEFAULT_ARGUMENTS){
        // this.value.arr->item == NULL here. (after new())
        // we must initialize it
        //----
        // to be js compat. If only arg is a Number, is the initial size of an empty arr
        if(argc==1 && arguments[0].class==&Number_CLASSINFO) {
            int64_t i64 = arguments[0].value.number;
            if (i64>=UINT32_MAX) fatal("new Array, limit is UINT32_MAX ");
            _initArrayAt(this.value.arr, (len_t)i64, NULL);
            _clearArrayItems(this.value.arr,0,(len_t)i64); //initialize with undefined
        }
        else {
            _initArrayAt(this.value.arr, argc, arguments);
        }
    };

    //init Fn for Map Objects. arguments can be a argc NameValuePairs initializing the map
    //new Map(this,argc,(any_arr){NameValuePair,*})
    void Map__init(DEFAULT_ARGUMENTS){
        _initArrayAt(&(((Map_ptr)this.value.ptr)->array),argc,arguments);
        PROP(size_,this)=any_number(argc);
    };

    //initFromObject for Map Objects. arguments are argc NameValuePairs initializing the map
    //Map_newFromObject(this,argc,(any_arr){NameValuePair,*})
    any Map_newFromObject(DEFAULT_ARGUMENTS){
        assert_args(1,1,Map);
        return arguments[0];
    };

    void NameValuePair__init(DEFAULT_ARGUMENTS){
        assert(argc==2);
        ((NameValuePair_ptr)this.value.ptr)->name=arguments[0];
        ((NameValuePair_ptr)this.value.ptr)->value=arguments[1];
    };

    any _newPair(str name, any value){
        return new(NameValuePair,2,(any_arr){any_str(name),value});
    }

    void memset_undefined(any this){
        size_t size;
        if (size=this.class->instanceSize) {
            // init all props with undefined
            any* prop = this.value.prop;
            for (size_t propCount=size / sizeof(any); propCount--;){
                *prop++=undefined;
            }
        }
    }
//-------------------
// helper functions
//--------------------
// function new
// - alloc instance mem space, and init Object properties (first part of memory space)
//--------------------
    any new(any this, len_t argc, any* arguments){

        // valid class?
        Class_ptr class;
        if (!(class=this.value.classINFOptr)) fatal("new: 'this' (Class ptr) is NULL");
        if (!_instanceof(this,Class)) {
                fatal("new: 'this' argument is not a Class");
        }

        any a = {class,NULL}; //constructor & value

        //alloc instance space
        size_t size;
        if (size=class->instanceSize) {
            //alloc required memory
            any* prop = a.value.prop = mem_alloc(size);
            // init all props with undefined
            memset_undefined(a);
        }

        //call class init
        if (class->initInstance.value.ptr) {
            //call Class__init
            ((function_ptr)(class->initInstance.value.ptr))(a,argc,arguments);
        }
        else if (class==&Date_CLASSINFO){ //Date is the only BoxedValue returning a different value on each call to New
            a.value.time=time(NULL);
        }

        return a;
    }

    //---------------------
    //---------------------
    any _newClass ( str className, __initFn_ptr initFn, uint64_t instanceSize, Class_ptr superClass) {
        //create type info
        assert(className);
        assert(superClass);

        return new(Class, 4, (any_arr){
                {&String_CLASSINFO,className}
                ,{&Function_CLASSINFO,initFn}
                ,{&Number_CLASSINFO,.value.number = instanceSize}
                ,{&Class_CLASSINFO,superClass}
        });
    };

//--- Helper _new functions

    //initFromObject for any class. arguments are argc NameValuePairs initializing the properties
    //class should provide _newFromObject
    any _newFromObject ( any this, len_t argc, any* arguments) {
        assert_args(1,1,Map);
        // convert *arguments to a Map
        // var mapArgument = new(Map,argc,arguments);

        //if the required class is a Map, no more to do
        if (this.value.classINFOptr==&Map_CLASSINFO) return arguments[0];

        //else, create instance and assign properties from map
        var newInstance = new(this,0,NULL);
        len_t len = arguments[0].value.arr->length;
        //assign properties from map
        for( any* item = arguments[0].value.arr->item; len--; item++){
            assert(item->class == &NameValuePair_CLASSINFO);
            NameValuePair_ptr nvp = item->value.ptr;
            Object_setProperty(newInstance,2,(any_arr){nvp->name,nvp->value});
        }
        return newInstance;
    };

    any _newErr(str message){ //,.item=
        return new(Error, 1,(any_arr){&String_CLASSINFO,(char*)message});
    }

    str _anyToStr(any this){
        var s = __method(toString_,this)(this,0,NULL);
        return s.value.str;
    }

    //-----------------
    // helper functions
    //-----------------

    any _newStringSize(size_t memSize){
        //create a new String, make space for size-1 ASCII chars + '\0'
        // max length is size-1
        return (any){&String_CLASSINFO,mem_alloc(memSize)};
    }

    any _newStringPartial(str source, len_t len){
        assert(source);
        assert(len>=0); if (!len) return any_EMPTY_STR;
        any a = _newStringSize(len+1);
        memcpy(a.value.str, source, len);
        a.value.str[len]=0;
        return a;
    }

    any _newString(str source){
        return _newStringPartial(source,strlen(source));
    }

//----------------------
// Core Classes Methods
//----------------------

    //----------------------
    // global LiteC functions
    //----------------------
    symbol_t _tryGetSymbol(str name) {
        str* symbolStr = _symbol - _allMethodsMax;
        for(int n=-_allMethodsMax; n<_allPropsLength; n++){
            if (strcmp(*symbolStr++,name)==0){
                return n;
            }
        }
        return 0;
    }

    symbol_t _getSymbol(str name) {
        symbol_t symbol;
        if (strcmp(name,"constructor")==0) return 0;
        if (!(symbol=_tryGetSymbol(name))){
            fail_with(_concatToNULL("invalid symbol: '",name,"'",NULL));
        }
        return symbol;
    }

    //callable from LiteScript
    //function LiteCore_getSymbol(symbolName:string) returns number
    // get symbol (number) from Symbol name (string)
    any LiteCore_getSymbol(DEFAULT_ARGUMENTS){
        assert(argc==1);
        assert(arguments[0].class==&String_CLASSINFO);
        return any_number(_getSymbol(arguments[0].value.str));
    }

    //callable from LiteScript
    //function LiteCore_getSymbolName(symbol:number) returns string
    // get symbol name from Symbol (number)
    any LiteCore_getSymbolName(DEFAULT_ARGUMENTS){
        assert(argc==1);
        assert(arguments[0].class==&Number_CLASSINFO);
        symbol_t symbol = arguments[0].value.number;
        if (symbol < -_allMethodsMax || symbol >= _allPropsLength) fail_with("invalid symbol");
        return any_str(_symbol[symbol]);
    }

    function_ptr LiteC_registerShim(any anyClass, symbol_t symbol, function_ptr fn) {
        assert(_instanceof(anyClass,Class));
        Class_ptr class = anyClass.value.classINFOptr;

        if (symbol < 0 && -symbol < _allMethodsLength){
            int withinLength = -symbol<TABLE_LENGTH(class->method);
            function_ptr actualMethod;
            if ( withinLength && (actualMethod=class->method[-symbol])){
                return actualMethod; //it it already has an implementation
            }
            if (!withinLength) class->method=_newJmpTableFrom(class->method); //extend jmp table
            class->method[-symbol]=fn;
            return fn;
        }
        fail_with(_concatToNULL("invalid method symbol: ",_int64ToStr(symbol),NULL));
    }

    function_ptr LiteC_registerShim2(any anyClass, symbol_t symbol, function_ptr fn,...) {
        assert(_instanceof(anyClass,Class));
        Class_ptr class = anyClass.value.classINFOptr;
        va_list args;
        va_start(args,fn);
        while(symbol){

            if (symbol > 0 || -symbol > _allMethodsLength) fail_with(_concatToNULL("invalid method symbol: ",_int64ToStr(symbol),NULL));

            int withinLength = -symbol<TABLE_LENGTH(class->method);
            if ( withinLength && class->method[-symbol]){
                null; //already has an implementation
            }
            else {
                if (!withinLength) class->method=_newJmpTableFrom(class->method); //extend jmp table
                class->method[-symbol]=fn;
            }
            symbol=va_arg(args,int);
            fn=va_arg(args,function_ptr);
        }
        va_end(args);
    }

    // tryGetMethod(symbol:Number) returns Function or undefined
    any Object_tryGetMethod(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        assert(arguments[0].class==&Number_CLASSINFO);
        double arg0 = arguments[0].value.number;
        if (arg0>=0 || arg0< -_allMethodsMax) fail_with("invalid method symbol");
        function_ptr fn;
        if ((fn=this.class->method[-(int)arg0])==NULL) return undefined;
        return any_func(fn);
    }

    // PROPERTIES

    // returns a pointer to real instance prop value or NULL
    any* _getPropPtr(any this, symbol_t symbol ) {
        if (symbol<=0 || symbol>=_allPropsLength) fail_with("invalid prop symbol for _getPropPtr");
        //symbol:0 is "constructor":Class, not a prop in the instance memory
        uint16_t pos;
        if (symbol>=TABLE_LENGTH(this.class->pos) || (pos=this.class->pos[symbol])==INVALID_PROP_POS) {
            return NULL;
        }
        return this.value.prop+pos;
    }

    //returns value for property symbol or throws
    any _getProperty(any this, symbol_t symbol ) {
        if (symbol==0) return any_class(this.class);  //symbol:0 is "constructor":Class
        any* propPtr = _getPropPtr(this,symbol);
        if (propPtr==NULL){
            fail_with(_concatToNULL(
                    "no property '", _symbol[symbol], "' (symbol:",  _int32ToStr(symbol),
                    ") for class ", this.class->name.value.str,
                    NULL));
        }
        return *propPtr;
    }

    any Object_getProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        assert(arguments[0].class==&Number_CLASSINFO);
        if (arguments[0].value.number<0 || arguments[0].value.number>=_allPropsLength) {
            fail_with("invalid prop symbol");
        }

        return _getProperty(this,arguments[0].value.number);
    }

    // get prop value from symbol or returns undefined
    any Object_tryGetProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        assert(arguments[0].class==&Number_CLASSINFO);
        if (arguments[0].value.number<0 || arguments[0].value.number>=_allPropsLength) {
            fail_with("invalid prop symbol");
        }

        symbol_t symbol=arguments[0].value.number;
        if (symbol==0) return any_class(this.class); //symbol:0 is "constructor":Class

        any* propPtr = _getPropPtr(this,symbol);
        if (!propPtr) return undefined;
        return *propPtr;
    }

    //check property by name
    int _hasProperty(any this, any name) {
        assert(name.class==&String_CLASSINFO);
        symbol_t symbol=_getSymbol(name.value.str); //search symbol from symbol name
        //symbol:0 is "constructor":Class
        if (symbol==0 || _getPropPtr(this,symbol)!=NULL) return 1;
        return 0;
    }

    any Object_hasProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        return _hasProperty(this,arguments[0])? true:false;
    }

    any Object_setProperty(DEFAULT_ARGUMENTS){ //from name, set property for object & Maps
        assert_args(2,2,String,Undefined);
        symbol_t symbol=_getSymbol(arguments[0].value.str); //search symbol from symbol name
        if (symbol==0){ //symbol:0 is "constructor":Class
            fail_with(_concatToNULL(
                    "cannot set property 'constructor' (symbol:0). class: ", this.class->name.value.str
                    ,NULL));
        }
        any* propPtr = _getPropPtr(this,symbol);
        if (propPtr==NULL){
            fail_with(_concatToNULL(
                    "no property '", _symbol[symbol], "' (symbol:",  _int32ToStr(symbol),
                    ") for class ", this.class->name.value.str
                    ,NULL
                    ));
        }
        *propPtr = arguments[1];
        return arguments[1];
    };

    //get property name from index
    any _getPropertyNameAtIndex(any this, int index) {
        if (!index) return any_str("constructor");
        len_t propLength=this.class->instanceSize/sizeof(any);
        if(index>=propLength) {
            fail_with(_concatToNULL("getPropertyName at index "
                ,_int64ToStr(index)
                ,". Invalid index. Class ["
                ,this.class->name.value.str
                ,"] have only "
                ,_int64ToStr(propLength)," properties",NULL));
        }
        for(symbol_t symbol=1; symbol<TABLE_LENGTH(this.class->pos);symbol++){
            if (this.class->pos[symbol]==index){ return any_str(_symbol[symbol]);}
        }
        return undefined;
    }

    any Object_getPropertyNameAtIndex(DEFAULT_ARGUMENTS) { // from prop index
        assert(argc==1);
        assert(arguments[0].class==&Number_CLASSINFO);
        return _getPropertyNameAtIndex(this,arguments[0].value.number);
    }

    extern any Object_getObjectKeys(DEFAULT_ARGUMENTS){
        len_t propLength=this.class->instanceSize/sizeof(any);
        var result = _newArray(propLength,NULL);
        ITEM(0,result)=any_str(_symbol[0]);//constructor
        _posTable table = this.class->pos;
        _posTableItem_t propPos;
        for(symbol_t symbol=1; symbol<TABLE_LENGTH(table);symbol++){
            if ((propPos=table[symbol])!=INVALID_PROP_POS){
                ITEM(propPos,result)=any_str(_symbol[symbol]);
            }
        }
        return result;
    }

    //----------------------
    // x_toString
    //----------------------
    any Object_toString(DEFAULT_ARGUMENTS) {
       return (any){&String_CLASSINFO,"[Object]"}; //js compatible
    }

    any Undefined_toString(DEFAULT_ARGUMENTS) {
       return (any){&String_CLASSINFO,"undefined"}; //js compatible
    }

    any Null_toString(DEFAULT_ARGUMENTS) {
       return (any){&String_CLASSINFO,"null"}; //js compatible
    }

    any NaN_toString(DEFAULT_ARGUMENTS) {
       return (any){&String_CLASSINFO,"NaN"}; //js compatible
    }

    any Infinity_toString(DEFAULT_ARGUMENTS) {
       return (any){&String_CLASSINFO,"Infinity"}; //js compatible
    }

    any Boolean_toString(DEFAULT_ARGUMENTS) {
       return any_str(_anyToBool(this)? "true":"false"); //js compatible
    }


    any Class_toString(DEFAULT_ARGUMENTS) {
       return this.value.classINFOptr->name;
    }

    any Array_toString(DEFAULT_ARGUMENTS) {
       return JSON_stringify(undefined,1,(any_arr){this});
    }

    any String_toString(DEFAULT_ARGUMENTS) {
       assert(argc==0);
       return this;
    };

    any Number_toString(DEFAULT_ARGUMENTS) {
        const int32_t BUFSZ=64;
        char* buf = mem_alloc(BUFSZ);
        sprintf(buf,"%f",this.value.number);
        //clear extra zeroes
        size_t n;
        for(n=strlen(buf)-1; n>0 && buf[n]=='0'; n--) buf[n]='\0';
        if(buf[n]=='.') buf[n]='\0';
        return any_str(buf);
    }

    any Error_toString( any this, len_t argc, any* arguments ) {
        assert(argc==0);
        return _concatAny(3, this.class->name, any_str(": "), this.value.err->message);
    };

   //----------------------
   // String methods
   //----------------------
   any String_indexOf(any this, len_t argc, any* arguments) {
        assert(argc>=1 && arguments!=NULL);
        assert(argc<1 || (arguments[0].class == &String_CLASSINFO));
        assert(argc<2 || (arguments[1].class == &Number_CLASSINFO));
        // define named params
        str searched = arguments[0].value.str;
        size_t fromIndex = argc>=2? (size_t)arguments[1].value.number:0;
        //---------
        return any_number(utf8indexOf(this.value.str,searched,fromIndex));
   }

   any String_lastIndexOf(any this, len_t argc, any* arguments) {
        assert(argc >= 1 && arguments != NULL);
        assert(argc < 1 || (arguments[0].class == &String_CLASSINFO));
        assert(argc < 2 || (arguments[1].class == &Number_CLASSINFO));
        //---------
        // define named params
        str searched = arguments[0].value.str;
        size_t fromIndex = argc >= 2 ? (size_t) arguments[1].value.number : 0;
        //---------
        return any_number(utf8lastIndexOf(this.value.str, searched, fromIndex));
   }

   any String_slice(any this, len_t argc, any* arguments) {
        if (argc==0) return (any){&String_CLASSINFO,this.value.str};
        assert(argc<1 || (arguments[0].class == &Number_CLASSINFO));
        assert(argc<2 || (arguments[1].class == &Number_CLASSINFO));
        //---------
        // define named params
        int64_t startPos = (int64_t)arguments[0].value.number;
        int64_t endPos = argc>=2? (int64_t)arguments[1].value.number: LLONG_MAX;
        //---------
        return any_str(utf8slice(this.value.str,startPos,endPos));
    }

   any String_substr(any this, len_t argc, any* arguments) {
        assert(argc>=1);
        assert(argc<1 || (arguments[0].class == &Number_CLASSINFO));
        assert(argc<2 || (arguments[1].class == &Number_CLASSINFO));
        //end index is start index + qty
        arguments[1].value.number+=arguments[0].value.number;
        // if start index is <0, end index should be also<0, else undefined
        if (arguments[0].value.number<0 && arguments[1].value.number>=0) arguments[1]=undefined;
        return String_slice(this,argc,arguments);
   }

   any String_charAt(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(arguments[0].class == &Number_CLASSINFO);
        int64_t startPos = (int64_t)arguments[0].value.number;
        int64_t endPos = startPos==-1? LLONG_MAX: startPos+1;
        return any_str(utf8slice(this.value.str,startPos,endPos));
   }

   any String_replaceAll(any this, len_t argc, any* arguments) {
        assert(argc==2);
        assert(arguments[0].class == &String_CLASSINFO); //searched
        assert(arguments[1].class == &String_CLASSINFO); //newStr
        str searched=arguments[0].value.str;
        str newStr=arguments[1].value.str;

        len_t thisLen=strlen(this.value.str);
        len_t searchedLen=strlen(searched);
        len_t newStrLen=strlen(newStr);
        Buffer_s b=_newBuffer();
        str foundPtr;
        str searchPtr=this.value.str;
        while(TRUE){
            if (foundPtr=strstr(searchPtr,searched)){
                _Buffer_addBytes(&b,searchPtr,foundPtr-searchPtr); //add previous to searched
                _Buffer_addStr(&b,newStr);
                searchPtr=foundPtr+searchedLen;
            }
            else {
                if (searchPtr==this.value.str) {
                    _freeBuffer(&b);
                    return this; //never found => not changed  // not found
                }
                _Buffer_addBytes(&b, searchPtr, thisLen-(searchPtr-this.value.str)); //add rest of string (excluding \0)
                break;
            }
        }
        return _Buffer_toString(&b);
   }

   str _str_clone(str s){
       len_t len=strlen(s)+1;
       str result = mem_alloc(len);
       memcpy(result,s,len);
       return result;
   }

    any String_toLowerCase(any this, len_t argc, any* arguments) {
        /* NOTE: Only ASCII upper/lower conversion
        */
        str newStr=_str_clone(this.value.str);
        for(char* p=newStr;*p;*p++=tolower(*p));
        return (any){&String_CLASSINFO,newStr};
    }

    any String_toUpperCase(any this, len_t argc, any* arguments) {
        /* NOTE: Only ASCII upper/lower conversion
        */
        str newStr=_str_clone(this.value.str);
        for(char* p=newStr;*p;*p++=toupper(*p));
        return (any){&String_CLASSINFO,newStr};
    }

    // concat
    any _concatAny(len_t argc, any arg,...) {
        assert(argc>0);
        int32_t count=0;
        va_list argPointer; //create prt to arguments
        va_start(argPointer, arg); //make argPointer point to first argument *after* arg

        Buffer_s dbuf = _newBuffer();

        while(argc--){
           if (arg.class!=&String_CLASSINFO) arg = METHOD(toString_,arg)(arg,0,NULL);
           _Buffer_addStr(&dbuf,arg.value.str);
           arg=va_arg(argPointer,any); //next
        }
        return _Buffer_toString(&dbuf); //close & convert to any
    }

    //concat all items, with a optional separ
    any _arrayJoin(str initial, len_t argc, any* items, str separ){

        int32_t count=0;

        Buffer_s buf = _newBuffer();
        if (initial) {
            _Buffer_addStr(&buf,initial);
            count++;
        }

        any item;
        for(int32_t n=0; n<argc; n++){
            if (separ && count++) _Buffer_addStr(&buf,separ);
            item=items[n];
            if (item.class!=&String_CLASSINFO) item = METHOD(toString_,item)(item,0,NULL);
            _Buffer_addStr(&buf,item.value.str);
        };
        return _Buffer_toString(&buf); //close & convert to any
    }

    any String_concat(any this, len_t argc, any* arguments){
        if (argc==0) return (any){&String_CLASSINFO,this.value.str};
        return _arrayJoin(this.value.str,argc,arguments,NULL);
    }

   any String_trim(any this, len_t argc, any* arguments) {
       len_t len,newLen;
       if (!(len=strlen(this.value.str))) return this; //empty str
       len_t startSlice=0;
       while(isspace(this.value.str[startSlice])) startSlice++;
       if (startSlice>=len) return any_EMPTY_STR; //all spaces
       int64_t endSlice=len-1;
       while(endSlice>=0 && isspace(this.value.str[endSlice])) endSlice--;
       endSlice++; //include non-space char
       if ((newLen=endSlice-startSlice) ==len) return this; //not changed
       str trimmed=mem_alloc(newLen+1);
       memcpy(trimmed,this.value.str+startSlice,newLen);
       trimmed[newLen]='\0';
       return (any){&String_CLASSINFO,trimmed};
   }

   // args: separator, limit
   any String_split(any this, len_t argc, any* arguments) {
        assert(argc<=2);
        assert(argc<1||arguments[0].class == &String_CLASSINFO||arguments[0].class==&Undefined_CLASSINFO); //separator
        assert(argc<2||arguments[1].class == &Number_CLASSINFO); //limit

        var result = _newArray(0,NULL);
        len_t pushed=0;

        if (arguments[0].class==&Undefined_CLASSINFO) {
            //MDN:  If separator is omitted, the array returned contains one element consisting of the entire string
            CALL1(push_,result,this);
            return result;
        }

        int64_t limit= argc==2? arguments[1].value.number : UINT32_MAX;
        len_t thisLen=strlen(this.value.str);
        if(!thisLen){
            //MDN: Note: When the string is empty, split returns an array containing one empty string, rather than an empty array.
            CALL1(push_,any_EMPTY_STR,this);
            return result;
        };

        char* s=this.value.str;
        str endPos = s+thisLen;

        str searched=arguments[0].value.str;
        len_t searchedLen=strlen(searched);
        if (!searchedLen){
            //MDN: If separator is an empty string, str is converted to an array of characters.
            #define isUTF8Continuation(s) ((s & 0xC0) == 0x80)
            len_t pushed=0;
            while(TRUE){
                int count=0;
                if (!s[count] || s+count>= endPos || pushed>=limit) return result;
                count++;
                while(isUTF8Continuation(s[count++]));
                Array_push(result,1,(any_arr){_newStringPartial(s,count)});
                pushed++;
                s+=count;
            }
        }

        str foundPtr;
        str searchPtr=this.value.str;
        while(TRUE){
            if (foundPtr=strstr(searchPtr,searched)){
                Array_push(result,1,(any_arr){_newStringPartial(searchPtr,foundPtr-searchPtr)});
                if (++pushed>=limit) break;
                searchPtr=foundPtr+searchedLen;
            }
            else { // not found
                Array_push(result,1,(any_arr){_newStringPartial(searchPtr,thisLen-(searchPtr-this.value.str))}); //add rest of string (excluding \0)
                break;
            }
        }
        return result;
   }

   any String_countSpaces(DEFAULT_ARGUMENTS){
       int count=0;
       for(str s=this.value.str; *s; s++){
           if(*s!=' ') break;
           count++;
       }
       return any_number(count);
    }

   any String_spaces(DEFAULT_ARGUMENTS){ //as namespace method
       assert_args(1,1,Number);
       int count=arguments[0].value.number;
       var result=_newStringSize(count+1);
       memset(result.value.str,' ',count);
       result.value.str[count]=0;
       return result;
    }

   //----------------------
   // Array methods
   //----------------------

    void _array_realloc(Array_s *arr, len_t newLen){
        size_t actualSize = arr->allocd;
        size_t newSize = ((newLen+32)>>5<<5)*sizeof(any);
        if (actualSize < newSize || actualSize-newSize > 100*1024){
            arr->item = mem_realloc(arr->item, newSize);
            arr->allocd = newSize;
        }
    }

    void _concatToArray(Array_ptr arrPtr, len_t itemCount, any* items){
        if(!itemCount || !items) return;
        len_t len = arrPtr->length;
        _array_realloc(arrPtr, len + itemCount);
        memcpy(arrPtr->item + len, items, itemCount*sizeof(any));
        arrPtr->length += itemCount;
    }

    any Array_push(any this, len_t argc, any* arguments){
        _concatToArray(this.value.arr,argc,arguments);
        return any_number(this.value.arr->length);
    }

    any _concatToArrayFlat(any this, len_t itemCount, any* item){
        // flatten arrays, pushes elements
        assert(this.class==&Array_CLASSINFO);
        for(int32_t n=0;n<itemCount; n++,item++){
            if(item->class==&Array_CLASSINFO){
                //recurse
                _concatToArrayFlat(this, item->value.arr->length, item->value.arr->item );
            }
            else { //single item
                Array_push(this,1,item);
            }
        }
        return any_number(this.value.arr->length);
    }

    any Array_concat(any this, len_t argc, any* arguments) {
        //this array do not mutate
        any clone=Array_clone(this,0,NULL);
        _concatToArrayFlat(clone, argc, arguments) ;
        return clone;
    }

    any Array_indexOf(any this, len_t argc, any* arguments) {
        // indexOf(0:item, 1:fromIndex)
        assert(argc>=1 && arguments!=NULL);
        assert(argc<=2);
        assert(argc<2 || (arguments[1].class == &Number_CLASSINFO));
        //---------
        //---------
        len_t len = this.value.arr->length;
        // define named params
        any searched = arguments[0];
        len_t inx = argc>=2? (len_t)arguments[1].value.number:0;
        //---------
        any* item = this.value.arr->item + inx;
        for( ;inx<len; inx++,item++){
            if (__is(searched,*item)) return any_number(inx);
        }
        return any_number(-1);
   }

    any Array_lastIndexOf(any this, len_t argc, any* arguments) {
        // lastIndexOf(0:item, 1:fromIndex)
        assert(argc>=1 && arguments!=NULL);
        assert(argc<=2);
        assert(argc<2 || (arguments[1].class == &Number_CLASSINFO));
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
        any* item = this.value.arr->item + inx;
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
        assert(argc<2 || (arguments[1].class == &Number_CLASSINFO));
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
        return _newArray(endPos-startPos, this.value.arr->item + startPos);
    }

    any _array_splice(Array_ptr arrPtr, int64_t startPos, int64_t deleteHowMany, len_t toInsert, any* toInsertItems, int returnDeleted) {
        int64_t len = (int64_t) arrPtr->length;
        //---------
        if (startPos<0) if ((startPos+=len)<0) startPos=0;
        if (startPos+deleteHowMany>len) deleteHowMany = len-startPos;
        any result= returnDeleted? _newArray(deleteHowMany, arrPtr->item+startPos): undefined; // newArray handles argc==0
        int64_t moveFromPos = startPos+deleteHowMany;
        int64_t amount=len-moveFromPos;
        int64_t moveToPos = startPos + toInsert;
        if (amount && moveFromPos>moveToPos) {
            //delete some
            memmove(arrPtr->item + moveToPos, arrPtr->item + moveFromPos, amount*sizeof(any));
            //clear space
            memset(arrPtr->item + len - (moveFromPos-moveToPos), 0, (moveFromPos-moveToPos)*sizeof(any));
        }
        else if(moveFromPos<moveToPos){ //insert some
            _array_realloc(arrPtr, len + moveToPos-moveFromPos);
            //make space
            memmove(arrPtr->item + moveToPos, arrPtr->item + moveFromPos, amount*sizeof(any));
        }

        //insert new items
        if (toInsert) memcpy(arrPtr->item + startPos, toInsertItems, toInsert*sizeof(any));
        // recalc length
        arrPtr->length += toInsert-deleteHowMany;
        return result;

    }

   any Array_splice(any this, len_t argc, any* arguments) {
        assert(argc>=2 && arguments!=NULL);
        assert((arguments[0].class == &Number_CLASSINFO));
        assert((arguments[1].class == &Number_CLASSINFO));
        //---------
        // define named params
        int64_t startPos = arguments[0].value.number;
        int64_t deleteHowMany = arguments[1].value.number;
        len_t toInsertCount = argc>=3? argc-2: 0;
        any* toInsertItems = argc>=3? arguments+2: NULL;
        return _array_splice(this.value.arr, startPos, deleteHowMany, toInsertCount, toInsertItems, 1);
    };

    any Array_unshift(any this, len_t argc, any* arguments) {
       assert(argc>=1 && arguments!=NULL);
       // insert arguments at array position 0
       return _array_splice(this.value.arr,0,0,argc,arguments, 1);
    }

    any Array_shift(any this, len_t argc, any* arguments) {
       assert(argc==0);
       // remove arguments at array position 0
       return _array_splice(this.value.arr,0,1,argc,arguments,1);
    }

    any Array_pop(any this, len_t argc, any* arguments) {
        assert(argc==0);
        len_t len;
        if ((len=this.value.arr->length) <= 0) return undefined;
        return this.value.arr->item[this.value.arr->length=(len-1)];
    }

    any Array_join(any this, len_t argc, any* arguments) {
        assert(argc<1 || (arguments[0].class == &String_CLASSINFO));
        //---------
        // define named params
        str separ= argc? arguments[0].value.str: ",";
        return _arrayJoin(NULL, this.value.arr->length, this.value.arr->item, separ);
    }

    any Array_clear(any this, len_t argc, any* arguments) {
        assert(argc==0);
        len_t len;
        if (len=this.value.arr->length <= 0) return undefined;
        return this.value.arr->item[this.value.arr->length=(len-1)];
    }

   //----------------------
   // Map methods
   //----------------------
   // Map = javascript Object, array of dynamic name:value pairs

    /*str NameValuePair_toStr(NameValuePair_ptr nv) {
        _Buffer_concatToNULL("\"", CALL0(toString_,nv->name).value.str,"\":",CALL0(toString_,nv->value).value.str, NULL);
    }*/

    any NameValuePair_toString(DEFAULT_ARGUMENTS) {
        assert(this.class==&NameValuePair_CLASSINFO);
        Buffer_s b= _newBuffer();
        NameValuePair_s nv = *((NameValuePair_ptr)this.value.ptr);
        _Buffer_concatToNULL(&b, "\"", CALL0(toString_,nv.name).value.str,"\":",CALL0(toString_,nv.value).value.str, NULL);
        return _Buffer_toString(&b);
    }

    NameValuePair_ptr _map_findKey(Map_ptr map, any key) {
        NameValuePair_ptr nv;
        len_t len;
        len_t inx=0;
        if (len=map->array.length){
            for(any* item=map->array.item; len--; item++, inx++){
                assert(item->class == &NameValuePair_CLASSINFO);
                nv=((NameValuePair_ptr)item->value.ptr);
                if (__is(nv->name, key)) {
                    map->current = inx;
                    return nv;
                }
            }
        }
        map->current=-1;
        return NULL;
    }

    //-----------
    //Map Methods
    #define THIS ((Map_ptr)this.value.ptr)

    NameValuePair_ptr _map_getNVP(int64_t index, any this, str file, int line) {
        if (index<0) {
            debug_fail(file,line,"index access: [], negative index");
        }
        Array_s arr= THIS->array;
        // check index against arr->length
        if (index >= arr.length){
            debug_fail(file,line,_concatToNULL(" OUT OF BOUNDS _map_getNVP[",_int64ToStr(index)
                     ,"]. Map.array.length is ",_int64ToStr(arr.length),NULL));
        }
        assert(arr.item[index].class==&NameValuePair_CLASSINFO);
        return (NameValuePair_ptr) arr.item[index].value.ptr;
    }

    any Map_get(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(_instanceof(this,Map));
        NameValuePair_ptr nv=_map_findKey(THIS, arguments[0]);
        if(!nv) return undefined;
        return nv->value;
    }

    any Map_has(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(_instanceof(this,Map));
        NameValuePair_ptr nv=_map_findKey(THIS, arguments[0]);
        if(!nv) return false;
        return true;
    }

    // Map.set(key,value)
    any Map_set(any this, len_t argc, any* arguments) {
        assert(argc==2);
        assert(_instanceof(this,Map));
        NameValuePair_ptr nv=_map_findKey(THIS, arguments[0]);
        if(!nv) {
            _concatToArray(&(THIS->array),1,(any_arr){new(NameValuePair,2,arguments)});
            THIS->size.value.number++;
            assert(THIS->size.value.number==THIS->array.length);
        }
        else{
            nv->value = arguments[1];
        }
    }

    any Map_delete(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(_instanceof(this,Map));
        NameValuePair_ptr removedNVP;
        if (!(removedNVP=_map_findKey( THIS, arguments[0]))) return undefined;
        //remove found index from map array
        _array_splice(&(THIS->array), THIS->current,1,0 ,NULL,0);
        THIS->size.value.number--;
        return removedNVP->value;
    }

    any Map_keys(DEFAULT_ARGUMENTS) {
        len_t len = THIS->array.length;
        var result = _newArray(len,NULL);
        any* resItem = result.value.arr->item;
        for( any* item = THIS->array.item; len--; item++){
            assert(item->class == &NameValuePair_CLASSINFO);
            NameValuePair_ptr nvp = item->value.ptr;
            *resItem++ = nvp->name;
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
        return (any){&Date_CLASSINFO, .value.time = value};
    }

    any _DateTo(time_t t, str format, int local){
        struct tm * tm_s_ptr = local?localtime(&t):gmtime(&t); // Convert to Local/GMT
        const int SIZE = 64;
        any result = _newStringSize(SIZE);
        strftime(result.value.str,SIZE,format,tm_s_ptr );
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

    // ------------
    // JSON
    //-------------
    any JSON_stringify(any this, len_t argc, any* arguments) {
        assert(argc>=1);
        var what=arguments[0];
        if (what.class==&Array_CLASSINFO){
            // Array
            Buffer_s b = _newBuffer();
            _Buffer_addStr(&b,"[");
            for(int n=0;n<what.value.arr->length;n++){
                any item = what.value.arr->item[n];
                if(n>0) _Buffer_addStr(&b,", ");
                if(item.class=&String_CLASSINFO) _Buffer_addStr(&b,"\"");
                _Buffer_addStr(&b, CALL0(toString_,item).value.str);
                if(item.class=&String_CLASSINFO) _Buffer_addStr(&b,"\"");
            }
            _Buffer_addStr(&b,"]");
            return _Buffer_toString(&b);
        }
        else if (_instanceof(what,Map)){
            // Map, (js Object)
            Buffer_s b = _newBuffer();
            _Buffer_addStr(&b,"{");
            for(int n=0;n<what.value.arr->length;n++){
                NameValuePair_ptr nv = what.value.arr->item[n].value.ptr;
                if(n>0) _Buffer_addStr(&b,",");
                _Buffer_concatToNULL(&b, "\"", CALL0(toString_,nv->name).value.str,"\":",CALL0(toString_,nv->value).value.str, NULL);
            }
            _Buffer_addStr(&b,"}");
            return _Buffer_toString(&b);
        }
        else return undefined;
    }


    // ------------
    // console
    //-------------

    any console_debugEnabled;
    int console_indentLevel;

    any console_log(DEFAULT_ARGUMENTS) {
        if (console_debugEnabled.value.uint64) console_error(this,argc,arguments);
        //indent (console.group)
        for(int indent = console_indentLevel;indent>0;indent--) printf("  ");
        // out arguments
        while(argc--){
            any s = CALL(toString_,*arguments);
            printf("%s ",s.value.str);
            arguments++;
        }
        printf("\n");
    }

    any console_info(DEFAULT_ARGUMENTS) {
        return console_log(this,argc,arguments);
    }
    any console_warn(DEFAULT_ARGUMENTS) {
        return console_log(this,argc,arguments);
    }

    any console_error(DEFAULT_ARGUMENTS) {
        //indent (console.group)
        for(int indent = console_indentLevel;indent>0;indent--) fprintf(stderr,"  ");
        // out arguments
        while(argc--){
            any s = CALL(toString_,*arguments++);
            fprintf(stderr,"%s ",s.value.str);
        }
        fprintf(stderr,"\n");
    }

    //print is shortcut for console_log(undefined, n,a,b,c...
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
        assert_args(1,1,String);
        Map_set(console_timers,2,(any_arr){arguments[0],any_number(clock()}));
    }

    any console_timeEnd(DEFAULT_ARGUMENTS) {
        assert_args(1,1,String);
        clock_t now=clock();
        var start=Map_get(console_timers,1,&(arguments[0]));
        if (start.class==&Undefined_CLASSINFO){
            console_log(undefined,3,(any_arr){any_str("'"),arguments[0],any_str("' is not a valid console_timer")});
        }
        str milliseconds = utf8slice(_uint64ToStr(now-(int64_t)start.value.number), 0, -3);
        console_log(undefined,3,(any_arr){arguments[0],any_str(milliseconds),any_str(" ms")});
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
       if (!getcwd(b.value.ptr, 1024)) fatal("getcwd() error");
       return b;
    }

    // ------------
    // Buffer
    //-------------

    //parse times change radically if you change initial buffer size
    #define BUFFER_POWER2 6 // 2^5=32, 2^6=64, 2^7=128
    #define TRUNCkb(X) ( (X+(1<<BUFFER_POWER2))>>BUFFER_POWER2<<BUFFER_POWER2 )

    // non-allocd buffers
    #define Buffer_NUMBUFFERS 30
    #define Buffer_BUFSIZE 256
    char Buffer_buffers_SPACE[Buffer_NUMBUFFERS][256];
    char* Buffer_buffersStart=(char*)&Buffer_buffers_SPACE;
    int Buffer_buffers_length=0;
    int Buffer_mallocd_count=0;
    int Buffer_REallocd_count=0;
    int Buffer_to_mallocd_string_count=0;

    any Buffer_byteLength(DEFAULT_ARGUMENTS){
        assert_args(1,1,String);
        return any_number(strlen(arguments[0].value.str));
    }

    any Buffer_copy(DEFAULT_ARGUMENTS){
        assert_args(1,1,Buffer);
        Buffer_s* me=(Buffer_ptr)this.value.ptr;
        Buffer_s* dest = arguments[0].value.ptr;
        if (dest->allocd<me->used) {
            fail_with("dest buffer too small");
        }
        memmove(dest->ptr,me->ptr,me->used);
        dest->used = me->used;
    }

    any Buffer_write(DEFAULT_ARGUMENTS){
        assert_args(2,2,String,Number);
        Buffer_s* me=(Buffer_ptr)this.value.ptr;
        len_t len = strlen(arguments[0].value.str);
        len_t start = arguments[1].value.number;
        if (start+len>=me->allocd) fail_with("buffer overflow");
        memmove(me->ptr+start, arguments[0].value.str, len);
        me->used += len;
        return any_number(len);
    }

    void _Buffer_report(){
        fprintf(stderr,
                "----------\n"
                "Buffer_buffers_length %d\n"
                "Buffer_mallocd_count  %d\n"
                "Buffer_REallocd_count %d\n"
                "Buffer_to_mallocd_string_count %d\n"
                ,Buffer_buffers_length
                ,Buffer_mallocd_count
                ,Buffer_REallocd_count
                ,Buffer_to_mallocd_string_count
       );
    };

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

    void Buffer__init(DEFAULT_ARGUMENTS){
        assert_args(1,1,Number);

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
        str newSpace = mem_alloc(newSize);
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
                Buffer_REallocd_count++;
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
        _Buffer_addStr(dbuf, CALL0(toString_,a).value.str);
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
            Buffer_to_mallocd_string_count++;
            _Buffer_toMallocd(dbuf,dbuf->used);
        }
        _freeBuffer(dbuf); // toString means "free" because buffer is converted to malloc'd
        return any_str(dbuf->ptr); //convert to any
    }

    int64_t _length(any this){
        return this.class==&String_CLASSINFO ? utf8len(this.value.ptr)
                :(this.class==&Array_CLASSINFO)? this.value.arr->length
                :(this.class==&Map_CLASSINFO)? this.value.arr->length // NO js-compat. js:Map.length==1 litescript:number of keys
                :this.class->instanceSize / sizeof(any) // NO js-compat. js:Object.length==1 litescript:number of props
                ;
    }

    double _anyToNumber(any this){
        //NOTE: _anyToNumber(String) RETURNS ASCII CODE OF FIRST CHAR
        // on producer_C a single char StringLiteral is produced as C unsigned char/byte
        //so :  `x > "A"` is converted to C's `_anyToNumber(x) > 'A'`
        // and 'A' in C is unsigned char/byte/65 >= a number
        // ---
        // use parseFloat to convert strings with number representations.
        //
        if (this.class==&String_CLASSINFO) return (double)this.value.str[0];
        else return this.value.number;
    }

    any parseFloat(DEFAULT_ARGUMENTS){
        assert(argc==1);
        char* endConverted;
        if (arguments[0].class==&String_CLASSINFO) return any_number(strtod(arguments[0].value.str,&endConverted));
        else if (arguments[0].class==&Number_CLASSINFO) return arguments[0];
        else return (any){&NaN_CLASSINFO,0};
    }

    any parseInt(DEFAULT_ARGUMENTS){
        assert(argc==1);
        if (arguments[0].class==&String_CLASSINFO) return any_number(atol(arguments[0].value.str));
        else if (arguments[0].class==&Number_CLASSINFO) return any_number((int64_t)(arguments[0].value.number));
        else return (any){&NaN_CLASSINFO,0};
    }

    int _anyToBool(any this){
        if (!this.class || this.class==&Undefined_CLASSINFO
            || this.class==&Null_CLASSINFO
            || this.class==&NaN_CLASSINFO ){
            return FALSE;
        }
        else if (this.class==&Number_CLASSINFO || this.class==&Boolean_CLASSINFO){
                 return this.value.number;
        }
        else if (this.class==&String_CLASSINFO){
                return this.value.str[0]; //false if "" - js compatibility
        }
        else {
            return TRUE; //a valid object pointer / non-empty var, returns "thruthy"
            //fail_with(_concatToNULL("cannot convert [",this.class->name.value.str,"] to boolean\n",NULL));
        }
    }

    int64_t _anyToInt64(any this){
        char* endConverted;
        if (this.class==&String_CLASSINFO) return strtol(this.value.str,&endConverted,10);
        else if (this.class==&Number_CLASSINFO) return this.value.number;
        else {
            fail_with(_concatToNULL("cannot convert [",this.class->name.value.str,"] to int64\n",NULL));
        }
    }

    #ifndef NDEBUG
    void _assert_args(DEFAULT_ARGUMENTS, str file, int line, int required, int total, any anyClass, ...){
        assert(required>0 && total>0);
        if(argc<required) {
            fail_with(_concatToNULL(
                file,":",_int64ToStr(line)," required at least ",
                _int64ToStr(required)," arguments"
                ,NULL));
        }

        va_list classes;
        va_start (classes, anyClass);

        for(int order=1; order<=argc && order<=total; order++) {

            if(anyClass.value.classINFOptr == &Undefined_CLASSINFO) {
                // #order parameter can be any
                null; //do nothing
            }
            else if(order>required && arguments->class==&Undefined_CLASSINFO){
                null; //undefined, if not required, is OK
            }
            else if(anyClass.value.classINFOptr != arguments->class) {
                fail_with(_concatToNULL(
                    file,":",_int64ToStr(line)," expected argument #",
                    _int64ToStr(order)," to be a ",anyClass.value.classINFOptr->name.value.str
                    ,NULL));
            }

            arguments++;
            anyClass=va_arg(classes,any);
        }
    };
    #endif

    /* --------------------
     * str _concatToNULL(
     *  to compose critical failure messages. Cannot fail.
     */
    char _concatToNULLBuffer[512];
    static const char _concatToNULLBuffer_DEFAULT[] = "too large";

    str _concatToNULL(str first,...) {

        if (first==NULL){
           return EMPTY_STR; //if no args
        };

        va_list arguments;
        va_start (arguments, first);

        memcpy(_concatToNULLBuffer,_concatToNULLBuffer_DEFAULT,sizeof _concatToNULLBuffer_DEFAULT);
        int used=0;

        str arg=first;
        do {
            size_t len=strlen(arg);
            if (len+used >= sizeof _concatToNULLBuffer) return _concatToNULLBuffer;
            memcpy(_concatToNULLBuffer+used,arg,len+1);
            used+=len;
        } while ( arg=va_arg(arguments,str) ) ;

        return _concatToNULLBuffer;
    }

    void fail_with(str message) {
        throw(_newErr(_str_clone(message)));
    }

    //-- _register Methods & props

    void _declareMethods(any anyClass, _methodInfoArr infoArr){
        assert(_instanceof(anyClass,Class));
        Class_ptr class = anyClass.value.classINFOptr;
        // set jmpTable with implemented methods
        if (infoArr) {
            _jmpTable jmpTable=class->method;
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
        Class_ptr class = anyClass.value.classINFOptr;

        // check posTable with implemented prop
        _posTable posTable = class->pos;
        _posTableItem_t tableLength = TABLE_LENGTH(posTable);

        size_t size=class->instanceSize;
        if (!size){ //no props
            assert(!tableLength);
            return;
        }

        int propsLength = size / sizeof(any);

        for(int n=1; n<tableLength; n++){ //pos 0 is TABLE_LENGTH
            _posTableItem_t pos = posTable[n];
            if (pos==INVALID_PROP_POS) continue;
            if (pos<0 || pos>=propsLength) {
                fprintf(stderr,"checkProps: class [%s] symbol %d:%s relative pos %d OUT OF BOUNDS. Props length is %d\n"
                        ,anyClass.value.classINFOptr->name.value.str,n,_symbol[n],pos,propsLength);
                fatal("sanity check");
            }
            for(int j=1; j<tableLength; j++) if (j!=n) {
                _posTableItem_t otherPos = posTable[j];
                if (pos==INVALID_PROP_POS) continue;
                if (otherPos==pos) {
                    fprintf(stderr,"checkProps: class [%s] relative pos %d duplicated for symbol %d:%s & %d:%s\n"
                            ,anyClass.value.classINFOptr->name.value.str,pos,n,_symbol[n],j,_symbol[j]);
                    fatal("sanity check");
                }
            }
        }
    }
    #endif

    void _declareProps(any anyClass, _posTableItem_t propsSymbolList[], size_t posTable_byteSize){
        assert(_instanceof(anyClass,Class));
        Class_ptr class = anyClass.value.classINFOptr;
        // get offset. defined by how manu properties are inherited from super class
        _posTableItem_t posOffset = class->super->instanceSize/sizeof(any);
        // set posTable with implemented methods
        _posTable posTable = class->pos;
        _posTableItem_t tableLength = TABLE_LENGTH(posTable);
        if (posTable_byteSize){
            int propsLength = posTable_byteSize / sizeof(_posTableItem_t);
            // set posTable with relative property positions at instance memory space
            for(int n=0; n<propsLength; n++){
                symbol_t symbol = propsSymbolList[n];
                if (symbol<1 || symbol>=tableLength) fatal("_declareProps: invalid symbol");
                posTable[symbol] = posOffset+n;
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
         M( tryGetMethod )
         M( tryGetProperty )
         M( getProperty )
         M( hasProperty )
         { hasOwnProperty_, Object_hasProperty },
         M( getPropertyNameAtIndex )
         M( getObjectKeys )
    M_END
    #undef M

    //Class
    static _posTableItem_t Class_CORE_PROPS[] = {
             name_, initInstance_
        };

    //String
    #define M(symbol) { symbol##_, String_##symbol },
    static _methodInfoArr String_CORE_METHODS = {
        M( toString )
        M( slice )
        M( split )
        M( indexOf )
        M( lastIndexOf )
        M( concat )
        M( toLowerCase )
        M( toUpperCase )
        M( charAt )
        M( replaceAll )
        M( trim )
        M( substr )
        M( countSpaces )
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
    static _posTableItem_t Error_PROPS[] = {
            name_,
            message_,
            stack_,
            code_
        };

    //Array
    #define M(symbol) { symbol##_, Array_##symbol },
    static _methodInfoArr Array_CORE_METHODS = {
        M( toString )
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
        M( tryGet )
    M_END
    #undef M

    //Map
    #define M(symbol) { symbol##_, Map_##symbol },
    static _methodInfoArr Map_CORE_METHODS = {
        M( has )
        M( get )
        M( set )
        M( delete )
        M( clear )
        M( keys )

         { hasProperty_, Map_has },
         { hasOwnProperty_, Map_has },
         { tryGetProperty_, Map_get },

    M_END
    #undef M
    static _posTableItem_t Map_PROPS[] = {
            size_
        };

    //NameValuePair
    static _posTableItem_t NameValuePair_PROPS[] = {
            name_,
            value_
        };

    // Buffer
    #define M(symbol) { symbol##_, Buffer_##symbol },
    static _methodInfoArr Buffer_CORE_METHODS = {
        M( write )
        M( copy )
    M_END
    #undef M


//-------------------
// init lib util
//--------------------
    void LiteC_addMethodSymbols(int addedMethods, str* _verb_table){
        int toExpand=0;
        while(_symbolTableCenter+toExpand - (_allMethodsMax+addedMethods) < 0) toExpand+=128;
        if (toExpand) {
            // realloc
             _symbolTable = mem_realloc(_symbolTable, (_symbolTableLength+toExpand)*sizeof(str));
            // re-center data
            memmove(_symbolTable+toExpand, _symbolTable, _symbolTableLength*sizeof(str));
            // set new length
            _symbolTableLength+=toExpand;
            // re-center pointers
            _symbolTableCenter+=toExpand;
            _symbol= &_symbolTable[_symbolTableCenter];
        }
        // set new method max & length
        _allMethodsMax += addedMethods;
        _allMethodsLength += addedMethods;
        // set added method names at _symbol-_allMethodsMax (new _symbolTable occupied space start)
        assert(_symbol-_allMethodsMax >= _symbolTable);
        memcpy(_symbol-_allMethodsMax, _verb_table, (addedMethods)*sizeof(str));
    }

    void LiteC_addPropSymbols(int addedProps, str* _things_table){
        int toExpand=0;
        while( _symbolTableLength-_symbolTableCenter+toExpand < _allPropsLength+addedProps ) toExpand+=128;
        if (toExpand) {
            // realloc, set new length
            _symbolTable = mem_realloc(_symbolTable, (_symbolTableLength+=toExpand)*sizeof(str));
            // refresh _symbol pointer
            _symbol= &_symbolTable[_symbolTableCenter];
        }
        // set added prop names at _symbol+_allPropsLength
        assert(_symbolTableCenter+_allPropsLength+addedProps <= _symbolTableLength);
        memcpy(_symbol+_allPropsLength, _things_table, (addedProps)*sizeof(str));
        // set new _allPropsLength
        _allPropsLength  += addedProps;
    }

//-------------------
// init lib
//--------------------

    void LiteC_init(int argc, char** CharPtrPtrargv){

        assert(_END_CORE_METHODS_ENUM==0); // from -21 to 0

        any_EMPTY_STR=any_str(EMPTY_STR);
        console_debugEnabled = false;

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

        assert(constructor_== 0);
        assert(_symbol[constructor_]== "constructor");

        //-------
        // hierarchy root
        //-------
        // chicken & egg problem:
        // BoxedValue_CLASSINFO, Object_CLASSINFO & Class_CLASSINFO must be initialized manually
        // (can't use _newClass() without Class_CLASSINFO having valid values)
        // Object has a pointer to Class(CLASSINFO) & Class has a ptr to Object (class & super)
        //-------

        // hierarchy root - jmpTable & posTable
        //-------
        _jmpTable Object_JMPTABLE = _newJmpTableFrom(NULL);
        _posTable Object_POSTABLE = _newPosTableFrom(NULL);

        // hierarchy root - CLASSINFOs
        //-------
        BoxedValue_CLASSINFO = (struct Class_s){
                .name = any_str("AnyValue"), // str type name
                .initInstance = any_func(NULL), // function __init
                .instanceSize = 0, //size_t instanceSize
                .super =  NULL, //super class
                .method = Object_JMPTABLE, //jmp table
                .pos = Object_POSTABLE //prop rel pos table
                };

        Object_CLASSINFO = (struct Class_s){
                .name = any_str("Object"), // str type name
                .initInstance = any_func(NULL), // function __init
                .instanceSize = 0, //size_t instanceSize
                .super =  NULL, //super class
                .method = Object_JMPTABLE, //jmp table
                .pos = Object_POSTABLE //prop rel pos table
                };

        Class_CLASSINFO = (struct Class_s){
                .name = any_str("Class"), // str type name
                .initInstance = any_func(Class__init), // function __init
                .instanceSize = sizeof(struct Class_s), //size_t instanceSize
                .super = &Object_CLASSINFO, //super class
                .method = _newJmpTableFrom(Object_JMPTABLE), //basic jmp table
                .pos = _newPosTableFrom(Object_POSTABLE) //basic prop rel pos table
                };

        Object = (any){&Class_CLASSINFO, &Object_CLASSINFO};
        Class = (any){&Class_CLASSINFO, &Class_CLASSINFO};

        // hierarchy root - Object's methods & class props
        _declareMethods(Object, Object_CORE_METHODS); //no props
        _declareProps(Class, Class_CORE_PROPS, sizeof Class_CORE_PROPS); // no methods

        //-------
        // pseudo-classes (native types & classes w/o instance memory space)
        //-------

        #define BOXED_VALUE(X,name) \
            X##_CLASSINFO = (struct Class_s){ \
                any_str(name), any_func(NULL), 0, &BoxedValue_CLASSINFO \
                ,_newJmpTableFrom(Object_JMPTABLE), _newPosTableFrom(Object_POSTABLE) }; \
            X = (any){&Class_CLASSINFO, & X##_CLASSINFO}

        BOXED_VALUE(String,"String");
        BOXED_VALUE(Number,"Number");
        BOXED_VALUE(Date,"Date");
        BOXED_VALUE(Function,"Function");

        BOXED_VALUE(Boolean,"Boolean");
        Boolean_CLASSINFO.method[-toString_]=&Boolean_toString;
        true = (any){&Boolean_CLASSINFO,.value.number=1};
        false = (any){&Boolean_CLASSINFO,.value.number=0};

        BOXED_VALUE(Undefined,"Undefined");
        Undefined_CLASSINFO.method[-toString_]=&Undefined_toString;
        undefined = (any){&Undefined_CLASSINFO,0};

        BOXED_VALUE(Null,"Null");
        Null_CLASSINFO.method[-toString_]=&Null_toString;
        null = (any){&Undefined_CLASSINFO,0};

        BOXED_VALUE(NaN,"NaN");
        NaN_CLASSINFO.method[-toString_]=&NaN_toString;

        BOXED_VALUE(Infinity,"Infinity");
        Infinity_CLASSINFO.method[-toString_]=&Infinity_toString;

        //String methods
        _declareMethods(String, String_CORE_METHODS); //no props

        //Number methods
        _declareMethods(Number, Number_CORE_METHODS); //no props

        //Date methods
        _declareMethods(Date, Date_CORE_METHODS); //no props

        #define FROM_OBJECT(X) \
            X##_CLASSINFO = (struct Class_s){ \
                any_str(#X), any_func(X##__init), sizeof(struct X##_s), &Object_CLASSINFO \
                ,_newJmpTableFrom(Object_JMPTABLE), _newPosTableFrom(Object_POSTABLE) }; \
            X = (any){&Class_CLASSINFO, & X##_CLASSINFO}

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

        BOXED_VALUE(FileDescriptor,"FileDescriptor");

        //console module vars
        console_timers = new(Map,0,NULL);

        //init process_argv with program arguments
        process_argv = _newArrayFromCharPtrPtr(argc,CharPtrPtrargv);
    };

    void LiteC_finish(){
        _Buffer_report();
    }


