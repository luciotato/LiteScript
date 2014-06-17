#ifndef CORE2_H
#define CORE2_H
#include "LiteC-core.h"

   // classTestClass
   #define TestClass__CLASS 6

   // declare:
   // struct-TestClass = struct with instance properties
   // TestClass : type = ptr to said struct
   typedef struct TestClass {
       ClassID class;
       Object value;
       Array myArr;

   } * TestClass;
#endif