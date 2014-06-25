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

#include "LiteC-core.h"

//Module Specific

//import Lexer, log
//Object Lexer = require('./Lexer');
//Object log = require('./log');
//Object debug = log[_Object_getProp]('debug');

    struct ObjType_1 {
          any verbose;
          any warning;
          any StoreMessages;
          struct ObjType_2 {
            any enabled;
            any file;
          } debug;
    } options = { .verbose={Number,.value.number=1}
                ,{Number,0,1}
                ,{Number,0,1}
                ,{  {Number,0,1}
                   ,{String,8,.value.ptr="out/debug.log"}
                }
    };

    typedef struct ASTBase_s * ASTBase_ptr;

    struct ASTBase_s {
        any
            parent,
            name, keyword, type, itemType,
            lexer,
            lineInx,
            sourceLineNum, column,
            indent, locked,
            index;

    };

    #define ASTBase 32

    any ASTBase__init(any this, any arguments /*parent:ASTBase, optional name*/){
        // validate param types, define as typecast
        assert(this.constructor==ASTBase);
        assert(arguments.constructor==Array);
        //---------
        // define named params
        any parent,name;
        parent=name=undefined;
        switch(arguments.length){
            case 2:name=arguments.value.item[1];
            case 1:parent=arguments.value.item[0];
        }
        //---------
        AS(ASTBase,this)->parent = parent;
        AS(ASTBase,this)->name = name;
        return this;
    };

    any ASTBase_toString(any anyThis, any arguments){
        // validate param types, define as typecast
        assert(anyThis.constructor==ASTBase);
        assert(arguments.constructor==Array);
        #define this ((ASTBase_ptr)anyThis.value.ptr)
        //---------
        return this->name;
        #undef this
    }



//ASTBase (prototype/this) properties

    // *GENERATED*
    /*
    any toString(any anyThis, any arguments){
        // Core types
        if (anyThis.constructor<=Function) return any_str(anyToStr(anyThis));
        switch(anyThis.constructor){
            case ASTBase:
                return ASTBase_toString(anyThis,arguments);
            default:
                return any_str("[object]"); //Object_toString(anyThis,arguments);
        }
    }
     */

    struct args {
        int length;
        any* item;
    };

    void test(any arguments){
        for(int n=0;n<arguments.length;n++){
            print(arguments.value.item[n]);
        }
    }

    void ASTBase_sayErr(ASTBase_ptr this, any msg){

    };

int mainTest() {

    LiteC_registerCoreClasses();

    //register user classes
    __registerClass(ASTBase,"ASTBase",Object,ASTBase__init,sizeof(struct ASTBase_s));

    var err;

    print(any_str("START"));

    test( (any){Array,2,.value.item=(any_arr){any_str("positionText"), _newErr("errmsg")}});

    var b = any_str("test");
    var s = _newErr("test new Error");
    var c = any_int(10012);
    var d = any_number(1012341234234342430.12);

    try{
        print(any_str("TRY"));
        print(b);
        print(c);
        print(d);
        print(s);
        print((any){Array,3,.value.item=(any_arr){c,d,s}});
        print(String_concat(b,(any){Array,3,.value.item=(any_arr){c,d,s}}));

        any s= any_str("GénericException");
        print(String_slice(s,(any){Array,2,.value.item=(any_arr){any_int(0),any_int(6)}}));
        print(String_slice(s,(any){Array,2,.value.item=(any_arr){any_int(6),any_int(-2)}}));

        print(String_indexOf(s,(any){Array,1,.value.item=(any_arr){any_str("r")}}));
        print(any_number(strstr(s.value.str,"r")-s.value.str));

        throw(any_str("GenericException"));
        print(any_str("AFTER THROW"));
    }
    catch(err) {
        //fprintf(stderr,"caught %s",e.message);
        print(any_str("caught!"));
        print(err);
        //print(_s((str)e4c.err.object));
        //print(e.message);
    }
    finally {
        //fprintf(stdout,"e4c.frames %d, e4c.frame[e4c.frames].stage %d is_catch %d\n");
        //fprintf(stderr,"caught %s",e.message);
        print(any_str("finally"));
    }

    return EXIT_SUCCESS;
}
