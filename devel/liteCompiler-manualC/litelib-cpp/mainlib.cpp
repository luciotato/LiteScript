#include <iostream>
#include <string>
#include <cstdlib>
#include <stdlib.h>

using namespace std;

typedef __uint64_t handle;

typedef enum {
    DATA_TYPE_UNDEFINED = 0,
    DATA_TYPE_BOOLEAN,
    DATA_TYPE_INT32,
    DATA_TYPE_UINT32,
    DATA_TYPE_INT64,
    DATA_TYPE_UINT64,
    DATA_TYPE_DOUBLE,
    DATA_TYPE_STRING_PTR,
    DATA_TYPE_OBJECT_HANDLE,
    DATA_TYPE_ARRAY_PTR,
    DATA_TYPE_FUNCTION_PTR
} dataTypeEnum;

//def type "function"
typedef void function (void*, void*);

typedef union overValues_union {
    __int32_t int32;
    __uint32_t uint32;
    __int64_t int64;
    __uint64_t uint64;
    double doubleVal;
    handle objHandle;
    function* functionPtr;
    char* charPtr;
} overValues;

struct var_struct;
typedef struct var_struct var;


//----------------------------
// lib vars
//----------------------------
handle ObjProtoHandle;
var varNULL;
var varUNDEFINED;

//----------------------------

void fatal(string msg){
    cerr << msg;
    abort();
}

typedef struct nameValuePair_struct{
    char*name;
    var value;
}nameValuePair;

//----------------------------
// DynArray
template<T>
struct DynArray{
    T items;

    int length,avail,used,block;

    DynArray(int block){
        this->length = 0;
        this->avail = 0;
        this->used = 0;
        this->block=block;
    }

    T& operator[](int n){
        if (n<0 || n>=this->length) fatal("array out of bounds");
        return this->items[n];
    }

    T push(T value){

        if (this->length>=this->avail){
            this->avail+=this->block;
            this->items = realloc(this->items, sizeof(void *)*avail);
            if (this->items ==NULL) fatal ("virtual memory exhausted");
        }

        this->items[length] = value;

        this->used++;
        return this->length++; //returns index
    }
};


//--------------
// class Object
//--------------
class Object{
    handle proto;
    var   value;
    DynArray<string> propNames;
    DynArray<var> propValues;
    uint length;

    Obj(handle proto, var value){
        this->proto = proto;
        this->value = value;
        this->propNames = new DynArray<string>(16);
        this->propValues = new DynArray<var>(16);
    };

    //access prop by index
    var operator[](int n){
        if (n<0 || n>=this->length) fatal("array out of bounds");
        return this->propValues[n];
    }

    //access prop by name
    var operator[](string s){
        for(var n=0;n<this->length;n++){
            if (propNames[n]==s){return propValues[n];}
        }
        return varUNDEFINED;
    }

    int addProp(string name, var value){
        this->propNames.push(name);
        return this->propValues.push(value); //return index
    }
};


//--------------
// All Objs
class AllObjs {
        static DynArray<Object> pointers;
        static DynArray<int> refCounts;

        handle static create(handle proto){
            pointers.push(new Object(proto));
            return refCounts.push[0];
        }

        void static ref(handle inx){
            refCounts[inx]++;
        }

        void static deref(handle inx){
            switch(refCounts[inx]){
                case 1:
                    delete pointers[inx];
                    break;
                case 0:
                    fatal("deref object refcount==0");
            }
            refCounts[inx]--;
        }

//----------------------------
// lib vars
//----------------------------

handle nullObjHandle;
handle objProtoHandle;
handle stringProtoHandle;
var varNULL;
var varUNDEFINED;
// All Objs
AllObjs objects;

//-----------------
//--- INIT --------
//-----------------
void init(){

    objects.pointers=new DynArray<Object*>(1024);
    objects.refCounts=new DynArray<Object*>(1024);

    nullObjHandle = objects.create(0);
    objProtoHandle = objects.create(nullObjHandle);
    stringProtoHandle = objects.create(objProtoHandle);

    varUNDEFINED.type = DATA_TYPE_UNDEFINED;
    varUNDEFINED.values.uint64 = 0;
};

struct var_struct {
    dataTypeEnum type;
    overValues values;

    var_struct& operator=(const var_struct * other){

        if (this->type==DATA_TYPE_OBJECT_HANDLE){
            objects.deref(this->values.objHandle);
        }

        if (other->type==DATA_TYPE_OBJECT_HANDLE){
            objects.ref(other->values.objHandle);
        }

        this->values=other->values;

    }

};


var newString(char * s){
    var a;
    a.type = DATA_TYPE_OBJECT_HANDLE;
    a.values.objHandle=object.create(stringProtoHandle);

    int buflen = strlen(s)+1;
    a.values.objHandle = gcAlloc(buflen);
    strcpy(s,a.values.stringPtr);
    return a;
};



void destroy(var & a){

    switch (a.type){

        case DATA_TYPE_STRING_PTR:
            gcDerefPointer(a.values.stringPtr);
            break;

        case DATA_TYPE_OBJECT_HANDLE:
        {
            obj * o = a.values.objPtr;
            gcItem * objGcItem = gcGetItem(o);
            if (objGcItem->refCount==1) { //this is last reference
                //shallow deref obj properties (recursive)
                for(int n=0; n < o->length; n++){
                    destroy(o->prop[n]);
                }
            }
            gcDeref(objGcItem);
            break;
        }
    };
}

void* gcRegisterNew(void* pointer){


    gcItem newNode;
    newNode.refCount=1;
    newNode.pointer = pointer;

    if (objects_length>0 && gcHead[objects_length-1].refCount==0){ //reuse
        objects_length--;
    }

    if (objects_length>=gcAvail){
        gcAvail+=1024;
        gcHead = realloc(gcHead, sizeof(gcItem)*gcAvail);
        if (gcHead==NULL) fatal ("virtual memory exhausted");
    }

    gcHead[objects_length] = newNode;

    objects_length++;
    gcUsed++;

    return pointer;
}

//search a pointer in the array, return array item *
gcItem & gcGetItem(void * pointer){
    for(int n=objects_length-1;n>=0;n--){
        if (gcHead[n].pointer==pointer){
            return gcHead[n];
        }
    }
    fatal("gcRef: unknown pointer value");
}

void gcDeref(gcItem_struct & item){

    switch(item.refCount--){

        case 0:
            fatal("gcDeref: refCount was already 0");
            break;

        case 1:
            delete(item.pointer);
            item.pointer=NULL;
            gcUsed--;
            break;
    };

}

void gcRefPointer(void * pointer){
    gcItem & item = gcGetItem(pointer);
    item.refCount++;
}

void gcDerefPointer(void * pointer){
    gcDeref(gcGetItem(pointer));
}


//-------------------
