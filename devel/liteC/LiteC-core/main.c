/*
 * File:   main.c
 * Author: Lucio Tato
 *
 * Created on March 12, 2014, 8:48 AM


 Done: Call via array literal
 *
 * TO DO:
 * - Know type of every var, prop & param
 *
 * x "Map" core structure:
 *      example: property members: map string to Namedeclaration
 *      methods hasKey, tryGet, get, set , add
 *      props: keys, values
 *
 *              implemented in js, via object
 *
 * x "array of string" alias for "string array"
 *
 * - ignore modulename in varRefs. e.g:
 * - do not use "->" on "constructor", only allow on type "any"
 *          if a.constructor is Grammar.Statement
 *          if (a.type==Statement)...
 *
 * - ... to denote a function with variable number of arguments (arguments:array of any)
 * - function.apply. Only for fns with arguments
 *
 * - "in Array" -> implement indexOf
 * - "typeof any -> 'string'  example:  "if typeof searched is 'string'
 *
 * - JSON, RegExp
 *



 */

    #include "core/LiteC-core.h"

    #define DEFINED_METHODS_LENGTH _CORE_METHODS_MAX
    #define NEXT_PROP _CORE_PROPS_LENGTH

// method names (symbols) declared in this module
    #define _ADD_METHODS_LENGTH 2
    enum DECLARED_METHODS {
        sayErr_ = -DEFINED_METHODS_LENGTH-_ADD_METHODS_LENGTH,
        printName_
    };
    static str _ADD_VERBS[]={
            "sayErr",
            "printName"
    };
    #define NEW_DEFINED_METHODS_LENGTH DEFINED_METHODS_LENGTH+_ADD_METHODS_LENGTH
    #undef DEFINED_METHODS_LENGTH
    #define DEFINED_METHODS_LENGTH NEW_DEFINED_METHODS_LENGTH
    #undef NEW_DEFINED_METHODS_LENGTH

    // property names (symbols) declared in this module
    enum DECLARED_PROPS {
            parent_ = NEXT_PROP,
            /*name*/
            keyword_, type_, itemType_,
            lexer_,
            lineInx_,
            sourceLineNum_, column_,
            indent_, locked_,
            index_,
    DECLARED_LAST_PROP
    };
    static str _ADD_THINGS[]={
            "parent",
            /*name*/
            "keyword", "type", "itemType",
            "lexer",
            "lineInx",
            "sourceLineNum", "column",
            "indent", "locked",
            "index"
    };
    #undef NEXT_PROP
    #define NEXT_PROP DECLARED_LAST_PROP

    typedef struct ASTBase_s * ASTBase_ptr;
    struct ASTBase_s {
        any constructor; //extends objet
        any
            parent,
            name, keyword, type, itemType,
            lexer,
            lineInx,
            sourceLineNum, column,
            indent, locked,
            index;
    };
    any ASTBase;
    //-- ASTBase prop order (symbol->relative position)
    static uint16_t ASTBase_PROPS[] = {
            parent_,
            name_, keyword_, type_, itemType_,
            lexer_,
            lineInx_,
            sourceLineNum_, column_,
            indent_, locked_,
            index_
        };

    void ASTBase__init( DEFAULT_ARGUMENTS /*parent:ASTBase, optional name*/){
        //---------
        // define named params
        any parent, name;
        parent=name=undefined;
        switch(argc){
            case 2:name=arguments[1];
            case 1:parent=arguments[0];
        }
        //---------
        ((ASTBase_ptr)this.value.ptr)->parent = parent;
        ((ASTBase_ptr)this.value.ptr)->name = name;
    };

    any ASTBase_toString( DEFAULT_ARGUMENTS){
        return _concatAny(3,(any_arr){any_str("[ASTBase, name="),((ASTBase_ptr)this.value.ptr)->name,any_str("]")});
    }

    any ASTBase_printName(DEFAULT_ARGUMENTS){
        //return LC_concatAny(4,(any_arr){any_str("ASTBase asys Err!, my name is "),((ASTBase_ptr)this.value.ptr)->name,any_str(".")});
        print(3, (any_arr){
                any_str("ASTBase asys my name is ")
                ,((ASTBase_ptr)this.value.ptr)->name
                ,any_str(".")
            });
    };

    static any_arr Template = {
        {&String_CLASSINFO, "ASTBase says Err!, my name is "}
        ,{&String_CLASSINFO, ""}
        ,{&String_CLASSINFO, "."}
    };

    any ASTBase_sayErr(DEFAULT_ARGUMENTS){
        //return LC_concatAny(4,(any_arr){any_str("ASTBase asys Err!, my name is "),((ASTBase_ptr)this.value.ptr)->name,any_str(".")});

        CALL(printName_,this);
        this.class->method[printName_](this,argc,arguments);

        print(3,(any_arr){
                any_str("ASTBase asys Err!, my name is ")
                ,((ASTBase_ptr)this.value.ptr)->name
                ,any_str(".")
                });

        Template[1]=((ASTBase_ptr)this.value.ptr)->name;
        print(3,Template);
    };

    //-- ASTBase Jmp table
    static _methodInfoArr ASTBase_METHODS = {
            { toString_, ASTBase_toString },
            { sayErr_, ASTBase_sayErr },
            { printName_, ASTBase_printName },
            { 0, 0 }
    };

    void prn(any a){
        print(1,(any_arr){a});
    }

int32_t main(int32_t argc, char** charPtrPtrArguments) {

    LiteC_init(argc,charPtrPtrArguments);
    LiteC_addMethodSymbols( sizeof(_ADD_VERBS)/sizeof(str), _ADD_VERBS);
    LiteC_addPropSymbols( sizeof(_ADD_THINGS)/sizeof(str), _ADD_THINGS);


    printf("symbol sayErr, %d -> %s\n",sayErr_, _symbol[sayErr_]);
    printf("symbol sourceLineNum, %d -> %s\n",sourceLineNum_, _symbol[sourceLineNum_]);

    //register user classes
    ASTBase = _newClass("ASTBase", ASTBase__init,sizeof(struct ASTBase_s), Object.value.class);
    _declareMethods(ASTBase.value.class, ASTBase_METHODS);
    _declareProps(ASTBase.value.class, ASTBase_PROPS, sizeof ASTBase_PROPS);

    printf("START\n");
    prn(any_str("START"));

    var node = new(ASTBase,0,NULL);
    printf("_instanceOf(node,ASTBase): %d\n",_instanceOf(node,ASTBase));
    printf("_instanceOf(node,Object): %d\n",_instanceOf(node,Object));
    printf("_instanceOf(node,Class): %d\n",_instanceOf(node,Class));

    var fn = CALL1(tryGetMethod_,node,any_number(-1));
    if (fn.value.ptr) {
           prn(__apply(fn,node,0,NULL)); // call method-1 => call toString
    }

    len_t len = _length(process_argv);
    //var args = ;
    if (len) prn(ITEM(0,process_argv));
    prn(any_number(len));

    any err;
    try {
        var x = PROP(message_,ASTBase);
    } catch(err) {
        printf("catch\n");
        var s=CALL(toString_,err);
        printf(s.value.str);
    }
    any a = new(Array,0,0);
    //ASTBase_sayErr(a,0,0);

    print( 2, (any_arr){any_str("positionText"), _newErr("errmsg")});

    CALL3(unshift_,a, any_str("item1"),any_str("item2"),any_str("item3"));
    print(a.value.arr->length,a.value.arr->item);

    any b = any_str("test");
    any s = _newErr("test new Error");
    any c = any_number(10012);
    any d = any_number(12345678901234567890.12);
    any e = any_number(12345678.9);

    try{

        prn(any_str("TRY"));

        prn(process_cwd(undefined,0,NULL));

        prn(b);
        prn(c);
        prn(d);
        prn(e);
        prn(s);

        print(3,(any_arr){c,d,s});
        prn(_stringJoin(NULL,4,(any_arr){b,c,d,s}," "));

        any s = any_str("GénericException");
        prn( CALL2(slice_,s,any_number(0),any_number(6)) );
        prn( CALL2(slice_,s,any_number(6),any_number(-2)) );

        prn( CALL1(indexOf_,s,any_str("r")) );
        prn(any_number(strstr(s.value.str,"r")-s.value.str));

        fail_with("GenericException");
        prn(any_str("AFTER THROW"));
    }
    catch(err) {
        //fprintf(stderr,"caught %s",e.message);
        prn(any_str("caught!"));
        prn(err);
        //print(_s((str)e4c.err.object));
        //print(e.message);
    }
    finally {
        //fprintf(stdout,"e4c.frames %d, e4c.frame[e4c.frames].stage %d is_catch %d\n");
        //fprintf(stderr,"caught %s",e.message);
        prn(any_str("finally"));
    }

    return EXIT_SUCCESS;
}
