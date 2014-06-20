#ifndef CORE2_H
#define CORE2_H
#include "LiteC-core.h"
   
   extern any  inRange(any this, any arguments);
   
   
   // classTestClass
   #define TestClass 16
   
   // declare:
   // TestClass_ptr : type = ptr to instance
   typedef struct TestClass_s * TestClass_ptr;
   // struct TestClass_s = struct with instance properties
   struct TestClass_s {
       TypeID constructor;
       any value;
       any myArr;
   };
   
   extern any TestClass__init(any this,any initValue);
   
   
       
       extern any TestClass_indexOf(any this, any arguments);
       
       
       extern any TestClass_sliceJoin(any this, any arguments);
       
#endif