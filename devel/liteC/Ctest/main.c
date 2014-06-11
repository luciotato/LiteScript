/*
 * File:   main.c
 * Author: Lucio Tato
 *
 * Created on March 12, 2014, 8:48 AM
 */

#include "LiteC-core.h"
#include "exceptions.h"

//Module Specific

//import Lexer, log
//Object Lexer = require('./Lexer');
//Object log = require('./log');
//Object debug = log[_Object_getProp]('debug');


//ASTBase (prototype/this) properties

void print(String s){
    printf("%s\n",s->value);
}


int main(int argc, char** argv) {

    void* e;

    print(mkStr("START"));

    Object b = new( Object__CLASS );
    String s = mkStr(b->class->name);

    try{
        print(mkStr("TRY"));
        //print(b->value);
        print(toString(b));
        print(s);
        throw("throw GenericException");
        print(mkStr("AFTER THROW"));
    }
    catch(e) {
        //fprintf(stderr,"caught %s",e.message);
        print(mkStr("caught!"));
        //print(_s((str)e4c.err.object));
        //print(e.message);
    }
    finally {
        //fprintf(stdout,"e4c.frames %d, e4c.frame[e4c.frames].stage %d is_catch %d\n");
        //fprintf(stderr,"caught %s",e.message);
        print(mkStr("finally"));
    }

    return EXIT_SUCCESS;
}
