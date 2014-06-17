
#include "LiteC-core.h"
   
   #include "CoreC.h"
   
   // classString2//  extends Object
   #define String2_CLASS 6
   // declare:
   // struct-String2 = struct with instance properties
   // String2 : type = ptr to said struct
   
   typedef struct String2 {
       ClassID class;
       str value;
       int length;
   
   } * String2;