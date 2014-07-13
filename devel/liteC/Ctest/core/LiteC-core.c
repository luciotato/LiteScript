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

    // _symbol names
    str* _symbolTable;
    int _symbolTableLength, _symbolTableCenter; //need to be int, beacuse symbols are int. Can't be size_t
    int _allPropsLength, _allMethodsLength, _allMethodsMax;
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

        ,"toISOString"
        ,"toUTCString"
        ,"toDateString"
        ,"toTimeString"

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

        ,"tryGetMethod"
        ,"tryGetProperty"
        ,"getProperty"
        ,"getPropertyName"

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
        return CALL0(toLowerCase_,this.class->name);
    }

    bool _instanceof(any this, any class){
        assert(class.class==&Class_CLASSINFO); //class should be a Class
        //follow the inheritance chain, until NULL or class found
        for(Class_ptr classPtr=this.class; classPtr; classPtr = classPtr->super) {
            if(class.value.class == classPtr) return TRUE;
        }
        return FALSE;
    }

//--- debug helpers

    function_ptr __classMethodNat(int symbol, Class_ptr class){
        assert(symbol < 0);
        assert( -symbol < _allMethodsLength);
        assert(class);
        function_ptr fn;
        if ( -symbol < TABLE_LENGTH(class->method) && (fn=class->method[-symbol])){
            return fn;
        }
        fail_with(_concatToNULL("no method '",_symbol[symbol],"' on class '",class->name.value.str,"'\n",NULL));

    }

    // #ifdef NDEBUG, macro CALLL resolves to __call().
    // Note: for no-checks code, CALL resolves to direct jmp: this.class->call[method](this,argc,arguments)
    function_ptr __classMethod(int symbol, any anyClass){
        assert(anyClass.class==&Class_CLASSINFO);
        return __classMethodNat(symbol,anyClass.value.class);
    }

    any __call(int symbol, DEFAULT_ARGUMENTS){
        return __classMethodNat(symbol, this.class)(this,argc,arguments);
    }

    any __classMethodFunc(int symbol, any anyClass){
        assert(anyClass.class==&Class_CLASSINFO);
        return any_func(__classMethod(symbol, anyClass));
    }

    function_ptr __method(int symbol, any this){
        assert(this.class==&Class_CLASSINFO);
        return __classMethodNat(symbol, this.class);
    }

    // #ifdef NDEBUG, macro PROP resolves to __prop().
    // else PROP resolves to direct access: this.value.instance[this.class->pos[prop]]
    // get a reference to a property value
    any* __prop(int symbol, any this){
        assert(symbol>0); // prop can't be 0. symbol:0 is "constructor" and gets short-circuited to props[0]
        assert(this.class);
        assert(symbol<_allPropsLength);
        _posTableItem_t pos;
        if (symbol < TABLE_LENGTH(this.class->pos) && (pos=this.class->pos[symbol])!=INVALID_PROP_POS){
            return &(this.value.prop[pos]);
        }
        fail_with(_concatToNULL("no property '",_symbol[symbol],"' on class '",this.class->name.value.str,"'\n",NULL));

    }

    any* __item(int64_t index, any arrProp){

        if (!_instanceof(arrProp,Array)) {
            fail_with("index access: [], object isnt instance of Array");
        }
        if (index<0) {
            fail_with("index access: [], negative index");
        }

        // check index against arr->length
        if (index >= arrProp.value.arr->length){
            fprintf(stderr,"access index[%d]: OUT OF BOUNDS on Array[0..%d]\n"
                    ,arrProp.value.arr->length-1);
            //fprintf(stderr,"access index[%d]: OUT OF BOUNDS. property '%s' on class '%s' is Array[0..%d]\n"
                    //,index,_symbol[arrPropName],this.class->name.value.str
                    //,arrProp.value.arr->length-1);
            abort();
        }
        return &(arrProp.value.arr->item[index]);

    }

    // get a reference to a value at a index in an array
    // get & set from Array
    any* __item2(int index, int arrPropName, any this){
        // get array property
        var arrProp = *(__prop(arrPropName,this));
        if (! _instanceof(arrProp,Array)){
            fprintf(stderr,"access index[%d]: property '%s' on class '%s' is not instance of Array\n"
                    ,index,_symbol[arrPropName],this.class->name.value.str);
            abort();
        }
        return __item(index,arrProp);
    }

    any __apply(any anyFunc, DEFAULT_ARGUMENTS){
        assert(anyFunc.class==&Function_CLASSINFO);
        assert(anyFunc.value.ptr);
        return ((function_ptr)anyFunc.value.ptr)(this,argc,arguments);
    }

    any __applyArr(any anyFunc, any this, any argsArray){
        assert(anyFunc.class==Function.value.class);
        assert(argsArray.class==Array.value.class);
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

    any __or(any a,any b){  //js or, returns first argument if not falsey, else second argument
        if (!a.value.uint64) return b;
        if (a.class==&String_CLASSINFO && a.value.str[0]==0) return b;
        return a;
    }

/* js's 'or' (||) operator returns first expression if it's true, second expression is first is false, 0 if both are false
   so 'or' can be used to set a default value if first value is "falsey" (undefined,0,null or "").
   C's '||' operator, returns 1 (not the first expression. Expressions are discarded in C's ||)
*/

//
//-- core classes with _CLASSINFO
//
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
    struct Class_s NameValuePair_CLASSINFO;

// core Class objects -------------------
    //any Global;
    any Null, Undefined, String, Number, Date, Boolean;
    any Object, Class, Function, Error, Array, Map, NameValuePair;
    any NaN, Infinity;

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
        assert(arguments[0].class==String.value.class);
        assert(arguments[1].class==Function.value.class);
        assert(arguments[2].class==Number.value.class);
        assert(arguments[3].class==Class.value.class);
        //---------
        size_t instanceSize = (size_t)arguments[2].value.number;
        Class_ptr super = arguments[3].value.class;
        //---------
        Class_ptr prop = (Class_ptr)this.value.prop; // with this.properties
        // any-visible
        prop->name = arguments[0];
        prop->initInstance = arguments[1];
        // native-invisible
        prop->super = super;
        prop->instanceSize = super->instanceSize + instanceSize; //super's instance size + this instance size
        prop->method = _newJmpTableFrom(super->method); //starts with super's jmp table
        prop->pos = _newPosTableFrom(super->pos); //starts with super's props
    }

    void Error__init(DEFAULT_ARGUMENTS){
        ((Error_ptr)this.value.ptr)->message = argc? arguments[0]:any_EMPTY_STR;
        ((Error_ptr)this.value.ptr)->name = any_str("Error");
    }

    Array_ptr _initArrayAt(Array_ptr a, len_t initialLen, any* optionalValues){
        if (!a) a = mem_alloc(sizeof(struct Array_s));
        size_t size = ((initialLen+32)>>5<<5)  * sizeof(any);
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
        return (any){Array.value.class,_initArrayAt(NULL,initialLen,optionalValues)};
    }
    any Array_clone(any this, len_t argc, any* arguments){
        return _newArray(this.value.arr->length, this.value.arr->item);
    };

    any _newArrayFromCharPtrPtr(len_t argc, char** argv){
        // convert main function args into Array
        any a = _newArray(argc,NULL);
        any* item = a.value.arr->item;
        for(;argc--;){ *item++=(any){String.value.class,*argv++}; }
        return a;
    };

    //init Fn for Array Objects, called from new() after instance space allocd
    void Array__init(DEFAULT_ARGUMENTS){
        // this.value.arr->item == NULL here. (after new())
        // we must initialize it
        //----
        // to be js compat. If only arg is a Number, is the initial size of an empty arr
        if(argc==1 && arguments[0].class==Number.value.class) {
            int64_t i64 = arguments[0].value.number;
            if (i64>=UINT32_MAX) fatal("new Array, limit is UINT32_MAX ");
            _initArrayAt(this.value.arr, (len_t)i64, NULL);
            _clearArrayItems(this.value.arr,0,(len_t)i64); //initialize with undefined
        }
        else {
            _initArrayAt(this.value.arr, argc, arguments);
        }
    };

    //init Fn for Map Objects
    void Map__init(DEFAULT_ARGUMENTS){
        Array__init(this,argc,arguments); //Map extends Array
    };

    void NameValuePair__init(DEFAULT_ARGUMENTS){
        assert(argc==2);
        ((NameValuePair_ptr)this.value.ptr)->name=arguments[0];
        ((NameValuePair_ptr)this.value.ptr)->value=arguments[1];
    };

//-------------------
// helper functions
//--------------------
// function new
// - alloc instance mem space, and init Object properties (first part of memory space)
//--------------------
    any new(any this, len_t argc, any* arguments){

        Class_ptr class;
        // valid class?
        if (this.class!=Class.value.class) {
                fatal("new: 'this' argument is not a Class");
        }
        if (!(class=this.value.class)) fatal("new: 'this' (Class ptr) is NULL");

        any a = {class,NULL}; //constructor & value

        //alloc instance space
        size_t size;
        if (size=class->instanceSize) {
            //alloc required memory
            any* prop = a.value.prop = mem_alloc(size);
            // init all props with undefined
            for (size_t propCount=class->instanceSize / sizeof(any); propCount--;){
                *prop++=undefined;
            }
        }

        //call class init
        if (class->initInstance.value.ptr) {
            //call Class__init
            ((function_ptr)(class->initInstance.value.ptr))(a,argc,arguments);
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


//--- Helper throw error functions

    any _newErr(str message){ //,.item=
        return new(Error, 1,(any_arr){String.value.class,(char*)message});
    }

    str _anyToStr(any this){
        var s = __call(toString_,this,0,NULL);
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
    int _getSymbol(str name) {
        str* symbolStr = _symbol - _allMethodsMax;
        for(int n=-_allMethodsMax; n<_allPropsLength; n++){
            if (strcmp(*symbolStr++,name)==0){
                return n;
            }
        }
        throw(_concatAny(3, (any_arr){
              any_str("invalid symbol: '"), any_str(name), any_str("'")}));
    }

    //callabel from Ls
    any LiteCore_getSymbol(DEFAULT_ARGUMENTS){
        assert(argc==1);
        assert(arguments[0].class==String.value.class);
        return any_str(_symbol[_getSymbol(arguments[0].value.str)]);
    }


    function_ptr LiteC_registerShim(Class_ptr class, int symbol, function_ptr fn) {
        assert(class);
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


    // tryGetMethod(symbol:Number) returns Function or undefined
    any Object_tryGetMethod(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        assert(arguments[0].class==Number.value.class);
        double arg0 = arguments[0].value.number;
        if (arg0>=0 || arg0< -_allMethodsMax) throw(any_str("invalid method symbol"));
        function_ptr fn;
        if ((fn=this.class->method[-(int)arg0])==NULL) return undefined;
        return any_func(fn);
    }

    any _getProperty(any this, int symbol ) {
        if (symbol<0 || symbol>=_allPropsLength) throw(any_str("invalid prop symbol"));
        if (symbol==0) return any_class(this.class);

        uint16_t pos;
        if ((pos=this.class->pos[symbol])==INVALID_PROP_POS) {
            throw(_concatAny(6,(any_arr){
                    any_str("no property '"), any_str(_symbol[symbol]), any_str("' (symbol:"),  any_number(symbol),
                    any_str(") for class "),this.class->name
            }));
        }
        return *(this.value.prop+pos);
    }


    any Object_getProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        assert(arguments[0].class==Number.value.class);
        if (arguments[0].value.number<0 || arguments[0].value.number>=_allPropsLength) throw(any_str("invalid prop symbol"));

        return _getProperty(this,arguments[0].value.number);
    }

    any Object_tryGetProperty(DEFAULT_ARGUMENTS) {
        assert(argc==1);
        assert(arguments[0].class==Number.value.class);
        if (arguments[0].value.number<0 || arguments[0].value.number>=_allPropsLength) throw(any_str("invalid prop symbol"));

        int symbol=arguments[0].value.number;
        if (symbol==0) return any_class(this.class);

        uint16_t pos;
        if ((pos=this.class->pos[symbol])==INVALID_PROP_POS) return undefined;
        return *(this.value.prop+pos);
    }

    any _getPropertyName(any this, int index) {
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
        for(int symbol=1; symbol<TABLE_LENGTH(this.class->pos);symbol++){
            if (this.class->pos[symbol]==index){ return any_str(_symbol[symbol]);}
        }
        return undefined;
    }

    any Object_getPropertyName(DEFAULT_ARGUMENTS) { // from prop index
        assert(argc==1);
        assert(arguments[0].class==Number.value.class);
        return _getPropertyName(this,arguments[0].value.number);
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
       return this.value.class->name;
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
        return _concatAny(3,(any_arr){this.class->name,any_str(": "),this.value.err->message});
    };

   //----------------------
   // String methods
   //----------------------
   any String_indexOf(any this, len_t argc, any* arguments) {
        assert(argc>=1 && arguments!=NULL);
        assert(argc<1 || (arguments[0].class == String.value.class));
        assert(argc<2 || (arguments[1].class == Number.value.class));
        // define named params
        str searched = arguments[0].value.str;
        size_t fromIndex = argc>=2? (size_t)arguments[1].value.number:0;
        //---------
        return any_number(utf8indexOf(this.value.str,searched,fromIndex));
   }

   any String_lastIndexOf(any this, len_t argc, any* arguments) {
        assert(argc >= 1 && arguments != NULL);
        assert(argc < 1 || (arguments[0].class == String.value.class));
        assert(argc < 2 || (arguments[1].class == Number.value.class));
        //---------
        // define named params
        str searched = arguments[0].value.str;
        size_t fromIndex = argc >= 2 ? (size_t) arguments[1].value.number : 0;
        //---------
        return any_number(utf8lastIndexOf(this.value.str, searched, fromIndex));
   }

   any String_slice(any this, len_t argc, any* arguments) {
        if (argc==0) return (any){String.value.class,this.value.str};
        assert(argc<1 || (arguments[0].class == Number.value.class));
        assert(argc<2 || (arguments[1].class == Number.value.class));
        //---------
        // define named params
        int64_t startPos = (int64_t)arguments[0].value.number;
        int64_t endPos = argc>=2? (int64_t)arguments[1].value.number: LLONG_MAX;
        //---------
        return any_str(utf8slice(this.value.str,startPos,endPos));
    }

   any String_substr(any this, len_t argc, any* arguments) {
        assert(argc>=1);
        assert(argc<1 || (arguments[0].class == Number.value.class));
        assert(argc<2 || (arguments[1].class == Number.value.class));
        //end index is start index + qty
        arguments[1].value.number+=arguments[0].value.number;
        // if start index is <0, end index should be also<0, else undefined
        if (arguments[0].value.number<0 && arguments[1].value.number>=0) arguments[1]=undefined;
        return String_slice(this,argc,arguments);
   }

   any String_charAt(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(arguments[0].class == Number.value.class);
        int64_t startPos = (int64_t)arguments[0].value.number;
        int64_t endPos = startPos==-1? LLONG_MAX: startPos+1;
        return any_str(utf8slice(this.value.str,startPos,endPos));
   }

   any String_replaceAll(any this, len_t argc, any* arguments) {
        assert(argc==2);
        assert(arguments[0].class == String.value.class); //searched
        assert(arguments[1].class == String.value.class); //newStr
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
            else { if (searchPtr==this.value.str) return this;//never found => not changed  // not found
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
    any _concatAny(len_t argc, any* arguments) {
        return _stringJoin(NULL, argc, arguments, NULL);
    }

    any _stringJoin(str initial, len_t argc, any* items, str separ){

        int32_t count=0;

        Buffer_s buf = _newBuffer();
        if (initial) {
            _Buffer_addStr(&buf,initial);
            count++;
        }

        for(int32_t n=0;n<argc;n++){
            if (separ && count++) _Buffer_addStr(&buf,separ);
            any s = CALL(toString_,items[n]);
            _Buffer_addStr(&buf,s.value.str);
        };
        return _Buffer_toString(&buf); //close & convert to any
    }

    any String_concat(any this, len_t argc, any* arguments){
        if (argc==0) return (any){String.value.class,this.value.str};
        return _stringJoin(this.value.str,argc,arguments,NULL);
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
        assert(argc<1||arguments[0].class == String.value.class||arguments[0].class==Undefined.value.class); //separator
        assert(argc<2||arguments[1].class == Number.value.class); //limit

        var result = _newArray(0,NULL);
        len_t pushed=0;

        if (arguments[0].class==Undefined.value.class) {
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

   //----------------------
   // Array methods
   //----------------------

    void _array_realloc(Array_s *arr, len_t newLen){
        size_t actualSize = GC_size(arr->item);
        size_t newSize = ((newLen+32)>>5<<5)*sizeof(any);
        if (actualSize < newSize || actualSize-newSize > 100*1024){
            arr->item = mem_realloc(arr->item, newSize);
        }
    }

    void _concatToArray(Array_ptr this, len_t itemCount, any* items){
        if(!itemCount || !items) return;
        len_t len = this->length;
        _array_realloc(this, len + itemCount);
        memcpy(this->item + len, items, itemCount*sizeof(any));
    }

    any Array_push(any this, len_t argc, any* arguments){
        _concatToArray(this.value.arr,argc,arguments);
        return any_number(this.value.arr->length += argc);
    }

    any _concatToArrayFlat(any this, len_t itemCount, any* item){
        // flatten arrays, pushes elements
        assert(this.class==Array.value.class);
        for(int32_t n=0;n<itemCount; n++,item++){
            if(item->class==Array.value.class){
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
        assert(argc<2 || (arguments[1].class == Number.value.class));
        //---------
        //---------
        len_t len = this.value.arr->length;
        // define named params
        any searched = arguments[0];
        len_t inx = argc>=2? (len_t)arguments[1].value.number:0;
        //---------
        any* item = this.value.arr->item + inx;
        for( ;inx<len; inx++){
            if (__is(searched,*item++)) return any_number(inx);
        }
        return any_number(-1);
   }

    any Array_lastIndexOf(any this, len_t argc, any* arguments) {
        // lastIndexOf(0:item, 1:fromIndex)
        assert(argc>=1 && arguments!=NULL);
        assert(argc<=2);
        assert(argc<2 || (arguments[1].class == Number.value.class));
        //---------
        //---------
        // define named params
        any searched = arguments[0];
        len_t len = this.value.arr->length;
        len_t inx = argc>=2? (len_t)arguments[1].value.number : len-1;
        //---------
        any* item = this.value.arr->item + inx;
        for( ;inx>=0; inx--){
            if (__is(searched,*item--)) break;
        }
        return any_number(inx);
    }


   any Array_slice(any this, len_t argc, any* arguments) {
        // slice(0:start, 1:end)
        assert(argc>=1 && arguments!=NULL);
        assert(argc<=2);
        assert(argc<2 || (arguments[1].class == Number.value.class));
        //---------
        // define named params
        len_t len = this.value.arr->length;
        int64_t startPos = arguments[0].value.number;
        int64_t endPos = argc>=2? arguments[1].value.number: len;
        //---------
        if (startPos<0) if ((startPos+=len)<0) startPos=0;
        if (endPos<0) if ((endPos+=len)<0) endPos=0;

        if (endPos<startPos) endPos=startPos; //empty arr
        return _newArray(endPos-startPos, this.value.arr->item + startPos);
    }

    any _array_splice(any this, int64_t startPos, len_t deleteHowMany, len_t toInsert, any* toInsertItems, int returnDeleted) {
        len_t len = this.value.arr->length;
        //---------
        if (startPos<0) if ((startPos+=len)<0) startPos=0;
        if (startPos+deleteHowMany>len) deleteHowMany = len-startPos;
        any result= returnDeleted? _newArray(deleteHowMany, this.value.arr->item+startPos): undefined; // newArray handles argc==0
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
        assert(argc>=2 && arguments!=NULL);
        assert((arguments[0].class == Number.value.class));
        assert((arguments[1].class == Number.value.class));
        //---------
        // define named params
        int64_t startPos = arguments[0].value.number;
        len_t deleteHowMany = arguments[1].value.number;
        len_t toInsertCount = argc>=3? argc-2: 0;
        any* toInsertItems = argc>=3? arguments+2: NULL;
        return _array_splice(this, startPos, deleteHowMany, toInsertCount, toInsertItems, 1);
    };

    any Array_unshift(any this, len_t argc, any* arguments) {
       assert(argc>=1 && arguments!=NULL);
       // insert arguments at array position 0
       return _array_splice(this,0,0,argc,arguments, 1);
    }

    any Array_shift(any this, len_t argc, any* arguments) {
       assert(argc==0);
       // remove arguments at array position 0
       return _array_splice(this,0,1,argc,arguments,1);
    }

    any Array_pop(any this, len_t argc, any* arguments) {
        assert(argc==0);
        len_t len;
        if (len=this.value.arr->length <= 0) return undefined;
        return this.value.arr->item[this.value.arr->length=(len-1)];
    }

    any Array_join(any this, len_t argc, any* arguments) {
        assert(argc<1 || (arguments[0].class == String.value.class));
        //---------
        // define named params
        str separ= argc? arguments[0].value.str: ",";
        return _stringJoin(NULL, this.value.arr->length, this.value.arr->item, separ);
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
        assert(this.class=NameValuePair.value.class);
        Buffer_s b= _newBuffer();
        NameValuePair_s nv = *((NameValuePair_ptr)this.value.ptr);
        _Buffer_concatToNULL(&b, "\"", CALL0(toString_,nv.name).value.str,"\":",CALL0(toString_,nv.value).value.str, NULL);
        return _Buffer_toString(&b);
    }

    NameValuePair_ptr _map_item(Map_ptr map, any key) {
        NameValuePair_ptr nv;
        len_t len=map->length;
        for(any* item=map->item; len--; item++){
            assert(item->class == NameValuePair.value.class);
            nv=((NameValuePair_ptr)item->value.ptr);
            if (__is(nv->name, key)) return nv;
        }
        return NULL;
    }

    int64_t _map_inx(Map_ptr map, any key) {
        len_t inx=0;
        len_t len=map->length;
        for(any* item=map->item; len--; item++,inx++){
            assert(item->class == NameValuePair.value.class);
            NameValuePair_ptr nv=((NameValuePair_ptr)item->value.ptr);
            if (__is(nv->name, key)) return inx;
        }
        return -1;
    }

    any Map_get(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(this.class==Map.value.class);
        NameValuePair_ptr nv=_map_item((Map_ptr)this.value.ptr, arguments[0]);
        if(!nv) return undefined;
        return nv->value;
    }

    any Map_has(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(this.class==Map.value.class);
        NameValuePair_ptr nv=_map_item((Map_ptr)this.value.ptr, arguments[0]);
        if(!nv) return false;
        return true;
    }

    any Map_set(any this, len_t argc, any* arguments) {
        assert(argc==2);
        assert(this.class==Map.value.class);
        NameValuePair_ptr nv=_map_item((Map_ptr)this.value.ptr, arguments[0]);
        if(!nv) {
            Array_push(this,1,(any_arr){new(NameValuePair,2,arguments)});
        }
        else{
            nv->value = arguments[1];
        }
    }

    any Map_delete(any this, len_t argc, any* arguments) {
        assert(argc==1);
        assert(this.class==Map.value.class);
        int64_t index=_map_inx((Map_ptr)this.value.ptr, arguments[0]);
        if(index<0) return undefined;
        any value=((NameValuePair_ptr)this.value.arr->item[index].value.ptr)->value;
        _array_splice(this,index,1,0,NULL,0);
        return value;
    }

    any Map_clear(any this, len_t argc, any* arguments) {
        assert(argc==0);
        _initArrayAt(this.value.arr,0,NULL);
    }

    any Map_keys(DEFAULT_ARGUMENTS) {
        len_t len=this.value.arr->length;
        var result = _newArray(len,NULL);
        any* resItem = result.value.arr->item;
        for(any* item=this.value.arr->item; len--; item++){
            assert(item->class == NameValuePair.value.class);
            *resItem++ = ((NameValuePair_ptr)item->value.ptr)->name;
        }
        return result;
    }



    // Date
    any _newDate(time_t value){
        return (any){&Date_CLASSINFO, .value.time = value};
    }

    void Date__init(DEFAULT_ARGUMENTS){
        time(&this.value.time); // Get the actual time in seconds
    }

    any _DateTo(time_t t, str format, int local){
        struct tm * tm_s_ptr = local?localtime(&t):gmtime(&t); // Convert to Local/GMT
        char buf[128];
        strftime(buf,sizeof(buf),format,tm_s_ptr );
        return any_str(buf);
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
        if (what.class==Array.value.class){
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
        else if (what.class==Map.value.class){
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

    any console_log(DEFAULT_ARGUMENTS) {
        any s, w1;
        while(argc--){
            s = CALL(toString_,*arguments++);
            printf("%s ",s.value.str);
        }
        printf("\n");
    }

    //print is shortcut for console_log(undefined, n,a,b,c...
    void print(len_t argc, any* arguments){
        console_log(undefined,argc,arguments);
    }

    any console_error(DEFAULT_ARGUMENTS) {
        any s;
        while(argc--){
            s = CALL(toString_,*arguments++);
            fprintf(stderr,"%s ",s.value.str);
        }
        fprintf(stderr,"\n");
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

    Buffer_s _newBuffer(){
        return (Buffer_s){.used=0, .ptr=mem_alloc(1024)};
    }

    void _Buffer_addBytes(Buffer_s *dbuf, str ptr, size_t addSize){
        size_t allocd = GC_size(dbuf->ptr);
        if (dbuf->used + addSize > allocd){
            allocd=TRUNCkb(allocd + addSize);
            if (allocd>UINT32_MAX) fail_with("_Buffer_add: allocd>UINT32_MAX");
            dbuf->ptr = mem_realloc(dbuf->ptr, allocd);
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
        return any_str(dbuf->ptr); //convert to any
    }


    len_t _length(any this){
        return this.class==&String_CLASSINFO ? utf8len(this.value.ptr)
                :(this.class==Array.value.class||this.class==Map.value.class)? this.value.arr->length
                :0;
    }

    double _anyToNumber(any this){
        char* endConverted;
        if (this.class==&String_CLASSINFO) return strtod(this.value.str,&endConverted);
        else if (this.class==&Number_CLASSINFO) return this.value.number;
        else {
            fail_with(_concatToNULL("cannot convert [",this.class->name.value.str,"] to number\n",NULL));
        }
    }

    any parseFloat(DEFAULT_ARGUMENTS){
        assert(argc>=1);
        return any_number(_anyToNumber(arguments[0]));
    }
    any parseInt(DEFAULT_ARGUMENTS){
        assert(argc==1);
        return any_number((int64_t)_anyToNumber(arguments[0]));
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

    #ifndef NCHECKARGS
    void assert_args(DEFAULT_ARGUMENTS, int required, int total, Class_ptr class, ...){
        assert(required>0 && total>0);
        if(argc<required) fail_with(_concatToNULL("required at least ",_int64ToStr(required)," arguments",NULL));

        va_list classes;
        va_start (classes, class);

        for(int order=1; order<=argc && order<=total; order++) {
           if(class!=arguments++->class) {
               fail_with(_concatToNULL("expected argument ",_int64ToStr(order)," to be a ",class->name.value.str,NULL));
           }
           class=va_arg(classes,Class_ptr);
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


    //-- _register Methods & props

    void _declareMethods(Class_ptr class, _methodInfoArr infoArr){
        // set jmpTable with implemented methods
        if (infoArr) {
            _jmpTable jmpTable=class->method;
            for( _methodInfoItemPtr info = &infoArr[0]; info->method!=0; info++) {
                jmpTable[-info->method] = info->function;
            }
        }
    }
    void _declareProps(Class_ptr class, _posTableItem_t propsSymbolList[], size_t posTable_byteSize){
        _posTable posTable = class->pos;
        if (posTable_byteSize){
            int propsLength = posTable_byteSize / sizeof(_posTableItem_t);
            assert(propsLength < _allPropsLength);
            // set posTable with relative property positions at instance memory space
            for(int n=0; n<propsLength; n++){
                int symbol = propsSymbolList[n];
                posTable[symbol] = n;
            }
        }
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
    M_END
    #undef M

    static _posTableItem_t NameValuePair_PROPS[] = {
            name_,
            value_
        };

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
            memcpy(_symbolTable+toExpand, _symbolTable, _symbolTableLength*sizeof(str));
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
        // chicken & egg problem:
        // Object_CLASSINFO & Class_CLASSINFO must be initialized manually
        // (can't use _newClass() without Class_CLASSINFO having valid values)
        //-------

        //-------
        // Object
        //-------

        _jmpTable Object_JMPTABLE = _newJmpTableFrom(NULL);
        _posTable Object_POSTABLE = _newPosTableFrom(NULL);

        Object_CLASSINFO = (struct Class_s){
                any_str("Object"), // str type name
                any_func(NULL), // function __init
                0, //size_t instanceSize
                NULL, //super class
                Object_JMPTABLE, //jmp table
                Object_POSTABLE //prop rel pos table
                };

        Object = (any){&Class_CLASSINFO, &Object_CLASSINFO};

        // Object's methods
        _declareMethods( &Object_CLASSINFO, Object_CORE_METHODS); //no props

        //-------
        // Class
        //-------

        Class_CLASSINFO = (struct Class_s){
                any_str("Class"), // str type name
                any_func(Class__init), // function __init
                sizeof(struct Class_s), //size_t instanceSize
                &Object_CLASSINFO, //super class
                _newJmpTableFrom(Object_JMPTABLE), //basic jmp table
                _newPosTableFrom(Object_POSTABLE) //basic prop rel pos table
                };

        Class = (any){&Class_CLASSINFO, &Class_CLASSINFO};
        _declareProps( &Class_CLASSINFO, Class_CORE_PROPS, sizeof Class_CORE_PROPS); // no methods

        //-------
        // pseudo-classes (native types & classes w/o instance memory space)
        //-------

        #define FROMOBJECT(X,name) \
            X##_CLASSINFO = (struct Class_s){ \
                any_str(name), any_func(NULL), 0, &Object_CLASSINFO \
                ,_newJmpTableFrom(Object_JMPTABLE), _newPosTableFrom(Object_POSTABLE) }; \
            X = (any){&Class_CLASSINFO, & X##_CLASSINFO}

        FROMOBJECT(String,"String");
        FROMOBJECT(Number,"Number");
        FROMOBJECT(Date,"Date");
        FROMOBJECT(Function,"Function");

        FROMOBJECT(Boolean,"Boolean");
        Boolean.value.class->method[-toString_]=&Boolean_toString;
        true = (any){&Boolean_CLASSINFO,.value.number=1};
        false = (any){&Boolean_CLASSINFO,.value.number=0};

        FROMOBJECT(Undefined,"Undefined");
        Undefined.value.class->method[-toString_]=&Undefined_toString;
        undefined = (any){&Undefined_CLASSINFO,0};

        FROMOBJECT(Null,"Null");
        Null.value.class->method[-toString_]=&Null_toString;
        null = (any){&Undefined_CLASSINFO,0};

        FROMOBJECT(NaN,"NaN");
        NaN.value.class->method[-toString_]=&NaN_toString;

        FROMOBJECT(Infinity,"Infinity");
        Infinity.value.class->method[-toString_]=&Infinity_toString;

        //String methods
        _declareMethods( &String_CLASSINFO, String_CORE_METHODS); //no props

        //Number methods
        _declareMethods( Number.value.class, Number_CORE_METHODS); //no props

        //Date methods
        _declareMethods( Date.value.class, Date_CORE_METHODS); //no props

        #define WITHCLASSINFO(X) \
            X##_CLASSINFO = (struct Class_s){ \
                any_str(#X), any_func(X##__init), sizeof(struct X##_s), &Object_CLASSINFO \
                ,_newJmpTableFrom(Object_JMPTABLE), _newPosTableFrom(Object_POSTABLE) }; \
            X = (any){&Class_CLASSINFO, & X##_CLASSINFO}

        WITHCLASSINFO(Error);
        _declareMethods( Error.value.class, Error_CORE_METHODS);
        _declareProps( Error.value.class, Error_PROPS, sizeof Error_PROPS);

        WITHCLASSINFO(Array);
        _declareMethods( Array.value.class, Array_CORE_METHODS); //no props

        Map = _newClass("Map", Map__init, sizeof(struct Map_s), Array.value.class);
        _declareMethods( Map.value.class, Map_CORE_METHODS); //no props

        WITHCLASSINFO(NameValuePair);
        _declareProps( NameValuePair.value.class, NameValuePair_PROPS, sizeof NameValuePair_PROPS);

        //init process_argv with program arguments
        process_argv = _newArrayFromCharPtrPtr(argc,CharPtrPtrargv);
    };

