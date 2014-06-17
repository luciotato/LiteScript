
#include "LiteC-core.h"
   
   #include "CoreC.h"
   
   // classString2//  extends Object
   // String2 is the type for: ptr to instance of struct String2_t
   
   typedef struct String2_t * String2;
   
   // methods jmp table type
   struct String2__METHODS_t {
       int (*indexOf)(String2 this,String2 searched, int fromIndex);
       String2 (*slice)(String2 this,int start, int endPos);
   };
   
   // String2 instance properties
   struct String2_t {
       Class class;
       struct String2__METHODS_t * call;
       //String2 specific properties
       str value;
       int length;
   };
   
   // instantiated class info (_I) and a const ptr to it (_CLASS)
   extern struct Class_t String2__CLASS_I;
   extern const Class String2__CLASS;