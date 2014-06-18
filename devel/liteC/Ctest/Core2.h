#ifndef CORE2_H
#define CORE2_H
#include "LiteC-core.h"
   
   extern int inRange(int min, int value, int max);
   
   // classTestClass
   #define TestClass__CLASS 6
   
   // declare:
   // TestClass_ptr : type = ptr to instance
   typedef struct TestClass_s * TestClass_ptr;
   // struct TestClass_s = struct with instance properties
   struct TestClass_s {
       TypeID constructor;
       any value;
       Array_ptr myArr;
   };
   
   extern any TestClass__init(any this,any initValue);
   
       
       extern int TestClass__indexOf(TestClass_ptr this,str searched, int fromIndex);
       
       extern String TestClass__sliceJoin(TestClass_ptr this,int start, int endPos);
#endif