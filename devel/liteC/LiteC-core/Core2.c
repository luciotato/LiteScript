//Compiled by LiteScript compiler v0.8.0, source: /home/ltato/LiteScript/devel/liteC/Core2.lite.md
#include "Core2.h"
// Core2

   // public function inRange(min:int, value:int, max:int) returns int
   int inRange(int min, int value, int max){
       return // when value<min then min
               (value < min) ? (min) :
                // when value>max then max
               (value > max) ? (max) :
       /* else */ value;
   }
   
   ;

   // public class TestClass
   
       //class _init fn
       TestClass TestClass__init(TestClass this,Object_ptr initValue){
           this->value = initValue;
       };

       // method indexOf(searched:string, fromIndex:int=0) returns int
       int TestClass__indexOf(TestClass this,String_ptr searched, int fromIndex){

           // for n=fromIndex while n<.myArr.length
           for(int n=fromIndex; n < this->myArr->length; n++) {
               // if .myArr[n] is searched, return n;
               if (this->myArr->item[n] == searched) {{return n;}};
           };// end for n
           return -1;
       }
       
       ;

       // method sliceJoin(start:int, endPos:int=-1) returns string
       String TestClass__sliceJoin(TestClass this,int start, int endPos){

           int len;

           start = inRange(0, start < 0 ? len + start : start, len);

           endPos = inRange(0, endPos < 0 ? len + endPos : endPos, len);

           // if start>=endPos, return ''
           if (start >= endPos) {{return mkStr("");}};

           String_ptr result;
           // for n=start to endPos
           for(int n=start; n<=endPos; n++) {
               result += this->myArr->item[n] + mkStr(" ");
           };// end for n

           return result;
       }
       
       ;
   // end class TestClass



//# sourceMappingURL=Core2.c.map