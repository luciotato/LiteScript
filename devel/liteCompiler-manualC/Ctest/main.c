/*
 * File:   main.c
 * Author: ltato
 *
 * Created on March 12, 2014, 8:48 AM
 */

#include "dynC.h"
#include "exceptions.h"

//Module Specific

//import Lexer, log
//Object Lexer = require('./Lexer');
//Object log = require('./log');
//Object debug = log[_Object_getProp]('debug');


//ASTBase (prototype/this) properties

typedef enum {
    _ASTBase_parent = _Object__props_length__,
    _ASTBase_name,
    _ASTBase_lexer,
    _ASTBase_sourceLineNum,
    _ASTBase_column,
    _ASTBase_indent,
    _ASTBase_lineInx,
    _ASTBase_locked,
    //methods
    _ASTBase_lock,
    _ASTBase_parse,
    _ASTBase_getParent,

    _ASTBase__props_length__
} _ASTBase__props_enum__;

typedef enum {
    _Lexer_filename = _Object__props_length__,
    _Lexer_sourceLineNum,
    _Lexer_column,
    _Lexer_indent,
    _Lexer_token,
    _Lexer_lineInx,

    _Lexer__props_length__
} _Lexer__props_enum__;

//public default class ASTBase
// as object/namespace
Object ASTBase;

//constructor

var ASTBase__constructor(var this, Object arguments) {

    #define parent arguments->v[0]
    #define name arguments->v[1]

    //
    this.val.obj->v[_ASTBase_parent] = parent;
    this.val.obj->v[_ASTBase_name] = name;

    //Get lexer from parent
    this.val.obj->v[_ASTBase_lexer] = parent.val.obj->v[_ASTBase_lexer];

    //Remember this node source position.
    //Also remember line index in tokenized lines, and indent

    //if .lexer
    if (this.val.obj->v[_ASTBase_lexer].val.int64) {
        //.sourceLineNum = .lexer.sourceLineNum
        this.val.obj->v[_ASTBase_sourceLineNum] = this.val.obj->v[_ASTBase_lexer].val.obj->v[_Lexer_sourceLineNum];
        //.column = .lexer.token.column
        this.val.obj->v[_ASTBase_indent] = _o(_o(_o(this.val.obj->v[_ASTBase_lexer])->v[_Lexer_token])->v[_Lexer_column])->v[_Lexer_indent];
        //.column = .lexer.token.column
        this.val.obj->v[_ASTBase_indent] = this.val.obj->v[_ASTBase_lexer].val.obj->v[_Lexer_token].val.obj->v[_Lexer_column].val.obj->v[_Lexer_indent];

        this.val.obj->v[_ASTBase_lineInx] = this.val.obj->v[_ASTBase_lexer].val.obj->v[_Lexer_lineInx];
    };

    return this;

    #undef parent
    #undef name
};


//------------------------------------------------------------------------
//method lock()

var ASTBase_prototype_lock(var this, Object arguments) {
    //**lock** marks this node as "locked", meaning we are certain this is the right class
    //for the given syntax. For example, if the `FunctionDeclaration` class see the token `function`,
    //we are certain this is the right class to use, so we 'lock()'.
    //Once locked, any **req**uired token not present causes compilation to fail.

    this.val.obj->v[_ASTBase_locked] = true;
};

//helper method getParent(searchedClass)

var ASTBase_prototype_getParent(var this, Object arguments) {

    #define searchedClass arguments->v[0]

    //**getParent** method searchs up the AST tree until a specfied node class is found

    var node = this;
    //while node and not(node instanceof searchedClass)
    while (node.val.uint64 && !(_instanceof(node, searchedClass))) {
        //node = node.parent
        node = _o(node)->v[_ASTBase_parent]; // # move to parent
    }; //end loop
    return node;

    #undef searchedClass 
};


int main(int argc, char** argv) {

    dynC_init();

    //create object-namespace-function-class
    ASTBase = Function_create("ASTBase", ASTBase__constructor, ObjProto);

    //properties
    Object prototype;
    prototype = ASTBase->v[_Function_prototype].val.obj;
    _setProp(prototype, _ASTBase_parent, "parent", undefined);
    _setProp(prototype, _ASTBase_name, "name", undefined);
    _setProp(prototype, _ASTBase_lexer, "lexer", undefined);
    _setProp(prototype, _ASTBase_sourceLineNum, "sourceLineNum", undefined);
    _setProp(prototype, _ASTBase_column, "column", undefined);

    //methods
    _setProp(prototype, _ASTBase_lock, "lock", _fp(ASTBase_prototype_lock));
    _setProp(prototype, _ASTBase_getParent, "getParent", _fp(ASTBase_prototype_getParent));

    print(_s("OK"));

    try{
        print(_s("TRY"));
        throw(_s("throw GenericException"));
        print(_s("AFTER THROW"));
    }
    catch(e) {
        //fprintf(stderr,"caught %s",e.message);
        print(_s("caught!"));
        //print(_s((str)e4c.err.object));
        print(e);
    }
    finally {
        //fprintf(stdout,"e4c.frames %d, e4c.frame[e4c.frames].stage %d is_catch %d\n");
        //fprintf(stderr,"caught %s",e.message);
        print(_s("finally"));
    }

    return (EXIT_SUCCESS);
}
