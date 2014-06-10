/*
 * File:   ScriptyC-core1.c
 * Author: Lucio Tato
 *
 * Contains:
 *  class Object
 *  class Class
 *  class String
 *
 * helper functions:
 *  Object new (Class class)
 *
 */

#include "ScriptyC-core1.h"

//---
//Object
//--------------------

    // Object methods bodies
    str Object__toString(Object this){
        return "[Object]";
    };

    //Object__Methods: Instantiated jmp table
    struct Object__METHODS_t
        Object__METHODS_I = {
            Object__toString
    };

    //Object__CLASS_I: Instantiated class info
    //instantiated Object class info and a const ptr to it
    struct Class_t
    Object__CLASS_I = {
        &Class__CLASS_I, // Class class = type of this object
        &Object__METHODS_I, // METHODS call = methods of this object
        "Object", // str name
        NULL, // function __init
        sizeof(struct Object_t), //size_t instanceSize
        &Object__METHODS_I, //methods
        NULL // super =
    };
    const Class
    Object__CLASS = &Object__CLASS_I;

//----------------------
    // test functions body
    void func1 (void) { printf( "1\n" ); }
    void func0 (void) { printf( "0\n" ); }

    //instantiated jmp table
    struct TEST_METHODS TEST_METHODS_I = { func0, func1 };
//----------------------

//Class

    //init Fn
    void Class__init(Class this
            ,str name
            ,initFn_t initFn
            ,size_t instanceSize
            ,void* methods
            ,Class super
            ){
                this->name = name;
                this->__init = initFn;
                this->instanceSize = instanceSize;
                this->methods = methods;
                this->super = super;
    };


    //Class__CLASS_I: Instantiated class info
    //instantiated class info and a const ptr to it
    struct Class_t
    Class__CLASS_I = {
        &Class__CLASS_I, // Class class = type of this object
        &Object__METHODS_I, // METHODS call = methods of this object
        "Class", // str name
        (initFn_t)Class__init, // function __init
        sizeof(struct Class_t), //size_t instanceSize
        &Object__METHODS_I, //methods (none of his own)
        &Object__CLASS_I// super =
    };
    const Class
        Class__CLASS = &Class__CLASS_I;


//-------------------
// helper functions
//--------------------
// new - alloc mem space
// and init Object properties (first part of memory space)

    Object new(Class classInfo){
        // use info at classInfo to allocate memory space. set type & constructor
        Object o = alloc(classInfo->instanceSize);
        o->class = classInfo; // class of this instance
        o->call = classInfo->methods; // address of CALL struct with all methods
        return o;
    }

