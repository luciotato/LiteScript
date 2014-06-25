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

    void ASTBase__init( DEFAULT_ARGUMENTS /*parent:ASTBase, optional name*/){
        // validate param types, define as typecast
        assert(this.type==ASTBase);
        //---------
        // define named params
        any parent,name;
        parent=name=undefined;
        switch(argc){
            case 2:name=arguments[1];
            case 1:parent=arguments[0];
        }
        //---------
        AS(ASTBase,this)->parent = parent;
        AS(ASTBase,this)->name = name;
    };

    any ASTBase_toString( DEFAULT_ARGUMENTS){
        // validate param types, define as typecast
        assert(this.type==ASTBase);
        //---------
        return ((ASTBase_ptr)this.value.ptr)->name;
    }



//ASTBase (prototype/this) properties

    // *GENERATED*
    any _toString( DEFAULT_ARGUMENTS){
        // Core types
        if (this.type<=Function_TYPEID) return any_str(anyToStr(this));
        switch(this.type){
            case ASTBase:
                return ASTBase_toString(this,argc,arguments);
            default:
                return _default_toString(this,argc,arguments); //Object_toString(this,arguments);
        }
    }

    struct args {
        int32_t length;
        any* item;
    };

    void printArgs(len_t argc, any * arguments){
        console_log_(NONE,argc,arguments);
    }

    void ASTBase_sayErr(ASTBase_ptr this, any msg){

    };

    void prn(any a){
        console_log_(NONE,1,(any_arr){a});
    }

int32_t main(int32_t argc, char** argv) {

    LiteC_registerCoreClasses();

    //register user classes
    __registerClass(ASTBase,"ASTBase",Object_TYPEID,ASTBase__init,sizeof(struct ASTBase_s));

    any err;

    prn(any_str("START"));

    len_t len = ((process_ptr)process.value.ptr)->argv.value.arr->length;
    prn(any_number(len));
    if (len) prn(((process_ptr)process.value.ptr)->argv.value.arr->item[0]);

    printArgs( 2, (any_arr){any_str("positionText"), _newErr("errmsg")});

    any a = _newArray();
    Array_unshift(a,3,(any_arr){any_str("item1"),any_str("item2"),any_str("item3")});
    printArgs(a.value.arr->length,a.value.arr->item);

    any b = any_str("test");
    any s = _newErr("test new Error");
    any c = any_int32(10012);
    any d = any_number(12345678901234567890.12);
    any e = any_number(12345678.9);

    try{

        prn(any_str("TRY"));

        prn(process_cwd(NONE,0,NULL));

        prn(b);
        prn(c);
        prn(d);
        prn(e);
        prn(s);

        printArgs(3,(any_arr){c,d,s});
        prn(_stringJoin(NULL,4,(any_arr){b,c,d,s}," "));

        any s = any_str("GénericException");
        prn(String_slice(s,2,(any_arr){any_int32(0),any_int32(6)}));
        prn(String_slice(s,2,(any_arr){any_int32(6),any_int32(-2)}));

        prn(String_indexOf(s,1,(any_arr){any_str("r")}));
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
