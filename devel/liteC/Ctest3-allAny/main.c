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

        ASTBase_ptr parent;

        any name, keyword, type, itemType;

        //Lexer_ptr lexer;

        any lineInx,
            sourceLineNum, column,
            indent, locked,
            index;

    };

    #define ASTBase 32

    any ASTBase__init(any anyThis, any args /*parent:ASTBase, optional name*/){
        // validate param types, define as typecast
        assert(anyThis.constructor==ASTBase);
        #define this ((ASTBase_ptr)anyThis.value.ptr)
        assert(args.constructor==Array);
        assert(args.value.array->length>=1); //required params
        assert(args.value.array->item[0].constructor==ASTBase);
        //---------
        // define named params
        #define PARAM_parent (ASTBase_ptr)(args.value.array->item[0].value.ptr)
        #define PARAM_name args.value.array->item[1] //any, optional, maybe undefined
        //---------

        this->parent = PARAM_parent;
        this->name = PARAM_name;

        #undef this
        #undef PARAM_parent
        #undef PARAM_name
    };

    str ASTBase_toString(ASTBase_ptr a){
        return _toStr(a->name);
    }



//ASTBase (prototype/this) properties

    // *GENERATED*
    str toString(any o){
        // Core types
        if (o.constructor<=String) return _toStr(o);
        switch(o.constructor){
            case Array:
                return Array_toString(o.value.array);
            case Error:
                return Error_toString(o.value.error);
            case ASTBase:
                return ASTBase_toString((ASTBase_ptr)o.value.ptr);
            default:
                return Object_toString(o);
        }
    }

    void print(any o){
        printf(toString(o));
        printf("\n");
    }

    struct args {
        int length;
        any* item;
    };

    void test(Array_ptr arguments){
        for(int n=0;n<arguments->length;n++){
            print(arguments->item[n]);
        }
    }

    void ASTBase_sayErr(ASTBase_ptr this, any msg){

    };

int main(int argc, char** argv) {

    LiteC_registerCoreClasses();

    //register user classes
    __registerClass(ASTBase,"ASTBase",Object,ASTBase__init,sizeof(struct ASTBase_s));

    any err;

    print(any_str("START"));

    test( &(struct Array_s){2,(any[]){any_str("positionText"), new(Error,any_str("errmsg"))}});

    any b = any_str("test");
    any s = new(Error,any_str("test new Error"));

    try{
        print(any_str("TRY"));
        print(b);
        print(s);
        throw(new(Error,any_str("GenericException")));
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
