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
    Class Class__init(Class this
            ,str name
            ,initFn_t initFn
            ,size_t instanceSize
            ,ClassID super
            ){
                this->name = name;
                this->__init = initFn;
                this->instanceSize = instanceSize;
                this->super = super;
                return this;
    };

    //init Fn for Array Objects
    void Array__init(Array this
                ,ClassID itemClass
            ){
                this->itemClass = itemClass;
                this->size=32; //alloc initial size 32 elements
                this->item = alloc(this->size * sizeof(Object));
                this->length = 0;
    };

    //init Fn for String Objects
    String String__init(String this, str value){
                this->value = value;
                this->length = strlen(value);
                return this;
    };

    //init Fn for String Objects
    Error Error__init(Error this, str message){
                this->message = message;
                this->name = "Error";
                return this;
    };


// core classes info

    #define __CORE_CLASSES_INFO_LENGTH  3

    struct {
        str       name;         // class name
        void*     initFn;       // executable initialization code
        size_t    instanceSize; // size de la struct que crea
        ClassID   super;        // super class
    }
    __CORE_CLASSES_INFO[ __CORE_CLASSES_INFO_LENGTH ]={
        {
            "String", // str class name
            (initFn_t)String__init, // function __init
            sizeof(struct String), //size_t instanceSize
            Object__CLASS    // super class
        },
        {
            "Array", // str class name
            (initFn_t)Array__init, // function __init
            sizeof(struct Array), //size_t instanceSize
            Object__CLASS // super class
        },
        {
            "Error", // str class name
            (initFn_t)Error__init, // function __init
            sizeof(struct Error_s), //size_t instanceSize
            Object__CLASS // super class
        }
    };

    struct Array CLASSES_ARRAY;
    Class* CLASSES;

//-------------------
// helper functions
//--------------------
// new - alloc mem space
// and init Object properties (first part of memory space)


    Object new(ClassID class){
        // use info at classInfo to allocate memory space. set type & constructor
        Object o = alloc(CLASSES[class]->instanceSize);
        o->class = class; // class of this instance
        return o;
    }



    String mkString(str value) {
       return String__init((String)new(String__CLASS),value);
    }

    int __is(void* a,void* b){  //js ===
        if (a==b) return 1;
        if (((Object)a)->class==String__CLASS && ((Object)b)->class==String__CLASS
             && ((String)a)->value == ((String)b)->value ) return 1;
        return 0;
    }

    Error __newError(str message) {
        return Error__init((Error)new(Error__CLASS), message);
    }

    Error __noMethod(ClassID class, str method) {
        return __newError(__concatToNULL("no method:'",method,"' in class: ",CLASSES[class]->name));
    }

    // Object_toString

    String Object_toString(Object this){
        return String__init((String)new(String__CLASS),CLASSES[this->class]->name);
        //return __concat_String(3,"[",this->class->name,"]");
    }

 // .toString dispatcher
    String toString(Object this){
        switch(this->class){

            case String__CLASS:
                return (String)this;

            default:
                return Object_toString(this);
        }
    }

//----------------------
// Push

    size_t Array_push(struct Array * this, struct Object * value){
        if (this->length == this->size){
            this->size+=32;
            this->item=realloc(this->item, this->size * sizeof(Object));
        }
        this->item[this->length++] = value;
        return this->length;
    }


 // .push dispatcher
    size_t push(Object this, Object value){
        switch(this->class){

            case Array__CLASS:
                return Array_push((Array)this,value);

            default:
                throw(__noMethod(this->class,"push"));
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

    uint32_t
        __registerClass (
            str name,
            ClassID super, //proto class ID. Which class this class extends
            void* initFn,
            size_t instanceSize
             ) {
            //create class info

        return (uint32_t)(Array_push(&CLASSES_ARRAY, (Object)Class__init((Class)new(Class__CLASS),name, initFn, instanceSize, super) ) -1);
        // return new index in CLASSES => ClassID
    }

// Object & Class are required for "new" to function properly
// CLASSESS 0 to 2

    struct Class NO__CLASS_INFO={
        Class__CLASS, //typee of object
        "NO__CLASS", // str class name
        NULL, // function __init
        0, //size_t instanceSize
        NO__CLASS // super class
    };

    struct Class Object__CLASS_INFO={
        Class__CLASS, //type of object
        "Object", // str class name
        NULL, // function __init
        sizeof(struct Object), //size_t instanceSize
        NO__CLASS // super class
    };

    struct Class Class__CLASS_INFO={
        Class__CLASS, //type of object
        "Class", // str class name
        (initFn_t)Class__init, // function __init
        sizeof(struct Class), //size_t instanceSize
        Object__CLASS // super class
    };

    typedef struct {ClassID class; void* value;} mko;

    #define MKO(S) (mko){String_CLASS,S}

    mko test(mko a){
        printf("%s",(char*)a.value);
    }

//-------------------
// init
//--------------------
    void LiteC_registerCoreClasses(){

        CLASSES_ARRAY.class = Array__CLASS;
        Array__init(&CLASSES_ARRAY, Class__CLASS);

        CLASSES_ARRAY.item[NO__CLASS]=(Object)&NO__CLASS_INFO;
        CLASSES_ARRAY.item[Object__CLASS]=(Object)&Object__CLASS_INFO;
        CLASSES_ARRAY.item[Class__CLASS]=(Object)&Class__CLASS_INFO;
        CLASSES_ARRAY.length=3;

        //shortcut
        CLASSES = (Class*)CLASSES_ARRAY.item;

        //rest of classes
        for(int n=0;n<__CORE_CLASSES_INFO_LENGTH;n++){
            __registerClass(
                    __CORE_CLASSES_INFO[n].name,
                    __CORE_CLASSES_INFO[n].super, //proto class ID. Which class this class extends
                    __CORE_CLASSES_INFO[n].initFn,
                    __CORE_CLASSES_INFO[n].instanceSize );
        }

    }
