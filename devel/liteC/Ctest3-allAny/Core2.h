#ifndef CORE2_H
#define CORE2_H
#include "LiteC-core.h"
   
   extern int inRange(int min, int value, int max);
   
   // classTestClass
   #define TestClass__CLASS 6
   
   // declare:
   // struct-TestClass = struct with instance properties
   // TestClass : type = ptr to said struct
   typedef struct TestClass {
       ClassID class;
       Object_ptr value;
       Array_ptr myArr;
   
   } * TestClass;
   
   extern TestClass TestClass__init(TestClass this,Object_ptr initValue);
   
       
       extern int TestClass__indexOf(TestClass this,String_ptr searched, int fromIndex);
       
       extern String TestClass__sliceJoin(TestClass this,int start, int endPos);
#endif