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

    #include "LiteC-core.h"

//Class

    //init Fn for Class Objects
    void Class__init(Class this
            ,str name
            ,initFn_t initFn
            ,size_t instanceSize
            ,Class super
            ){
                this->name = name;
                this->__init = initFn;
                this->instanceSize = instanceSize;
                this->super = super;
    };

    //forward
    struct Class Object__CLASS_DATA;

    //Class__CLASS_DATA: Instantiated class info
    struct Class Class__CLASS_DATA = {
        &Class__CLASS_DATA , // always &Class__CLASS_DATA, class of this object
        "Class", // str class name
        (initFn_t)Class__init, // function __init
        sizeof(struct Class), //size_t instanceSize
        &Object__CLASS_DATA // super class
    };

    const Class const Class__CLASS = &Class__CLASS_DATA;

//---
//Object
//--------------------

    //Object__CLASS: Instantiated class info
    //instantiated Object class info and a const ptr to it
    struct Class Object__CLASS_DATA = {
        &Class__CLASS_DATA, // always &Class__CLASS_DATA, class of this object
        "Object", // str class name
        NULL, // function __init
        sizeof(struct Object), //size_t instanceSize
        NULL // super class
    };
     const Class const Object__CLASS = &Object__CLASS_DATA;


//---
//String
//--------------------

    //init Fn for String Objects
    String String__init(String this, str value){
                this->value = value;
                this->length = strlen(value);
                return this;
    };

    //String__CLASS: Instantiated class info
    //instantiated Object class info and a const ptr to it
    struct Class String__CLASS_DATA = {
        &Class__CLASS_DATA, // always &Class__CLASS_DATA, class of this object
        "String", // str class name
        (initFn_t)Class__init, // function __init
        sizeof(struct String), //size_t instanceSize
        &Object__CLASS_DATA    // super class
    };
     const Class const String__CLASS = &String__CLASS_DATA;

//-------------------
// helper functions
//--------------------
// new - alloc mem space
// and init Object properties (first part of memory space)

    Object new(Class classInfo){
        // use info at classInfo to allocate memory space. set type & constructor
        Object o = alloc(classInfo->instanceSize);
        o->class = classInfo; // class of this instance
        return o;
    }

    String mkStr(str value) {
       return String__init((String)new(String__CLASS),value);
    }

// .toString

    String Object_toString(Object this){
        return String__init((String)new(String__CLASS),this->class->name);
        //return __concat_String(3,"[",this->class->name,"]");
    }

    //dispatcher
    String toString(Object this){
        if (this->class == String__CLASS){
                return (String)this;
        }
        else { //default
            return Object_toString(this);
        }
    }


    /*String Number_toString(Number this){
        char buffer[256];
        snprintf(buffer,sizeof(buffer),"%d",this->value);
        return String__init__(new(String_CLASS),buffer);
    }
    */

    /*
    __concat_String(int arglen,...){
        ...
        return String__init__(new(String_CLASS),buffer);
    }
    */