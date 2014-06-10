/*
 * File:   main.c
 * Author: Lucio Tato
 *
 * Created on March 12, 2014, 8:48 AM
 */

#include "ScriptyC-core1.h"
#include "exceptions.h"

//Module Specific

//import Lexer, log
//Object Lexer = require('./Lexer');
//Object log = require('./log');
//Object debug = log[_Object_getProp]('debug');


//ASTBase (prototype/this) properties

void print(str s){
    printf("%s\n",s);
}

int main(int argc, char** argv) {

    void* e;

    print("START");

    TEST_METHODS a = &TEST_METHODS_I;

    Object b = new( Object__CLASS );

    try{
        print("TRY");
        print(b->call->toString(b));
        a->func0();
        a->func1();
        throw("throw GenericException");
        print("AFTER THROW");
    }
    catch(e) {
        //fprintf(stderr,"caught %s",e.message);
        print("caught!");
        //print(_s((str)e4c.err.object));
        //print(e.message);
    }
    finally {
        //fprintf(stdout,"e4c.frames %d, e4c.frame[e4c.frames].stage %d is_catch %d\n");
        //fprintf(stderr,"caught %s",e.message);
        print("finally");
    }

    return EXIT_SUCCESS;
}
