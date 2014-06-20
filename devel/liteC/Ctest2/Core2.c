//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/liteC/Core2.lite.md
#include "Core2.h"
// Core2

   // public function inRange(min:int, value:int, max:int) returns int
   any  inRange(any this, any arguments){// validate param types
   assert(arguments.constructor==Array);
   //---------
   // define named params
   any min, value, max;
   min=value=max=undefined;
   switch(arguments.length){
     case 3:max=arguments.value.item[2];
     case 2:value=arguments.value.item[1];
     case 1:min=arguments.value.item[0];
   }
   //---------
       return // when value<min then min
               (value.value.number < min.value.number) ? (min) :
                // when value>max then max
               (value.value.number > max.value.number) ? (max) :
       /* else */ value;
   }
   ;

   // public class TestClass
   
   
       //class _init fn
       any TestClass__init(any this, any arguments){// validate param types
       assert(this.constructor==TestClass);
       assert(arguments.constructor==Array);
       //---------
       // define named params
       any initValue;
       initValue=undefined;
       switch(arguments.length){
         case 1:initValue=arguments.value.item[0];
       }
       //---------
           AS(TestClass,this)->value = initValue;
       };

       // method indexOf(searched:string, fromIndex:int=0) returns int
       any TestClass_indexOf(any this, any arguments){// validate param types
       assert(this.constructor==TestClass);
       assert(arguments.constructor==Array);
       //---------
       // define named params
       any searched, fromIndex;
       searched=fromIndex=undefined;
       switch(arguments.length){
         case 2:fromIndex=arguments.value.item[1];
         case 1:searched=arguments.value.item[0];
       }
       //---------

           // for n=fromIndex while n<.myArr.length
           for(int64_t n=fromIndex.value.number; n < AS(TestClass,this)->myArr.length; n++) {
               // if .myArr[n] is searched, return n;
               if (AS(TestClass,this)->myArr.value.item[n].value.number == searched.value.number) {return any_number(n);};
           };// end for n
           return any_number(-1);
       }
       ;

       // method sliceJoin(start:int, endPos:int=-1) returns string
       any TestClass_sliceJoin(any this, any arguments){// validate param types
       assert(this.constructor==TestClass);
       assert(arguments.constructor==Array);
       //---------
       // define named params
       any start, endPos;
       start=endPos=undefined;
       switch(arguments.length){
         case 2:endPos=arguments.value.item[1];
         case 1:start=arguments.value.item[0];
       }
       //---------

           any len;

           start = inRange(undefined,(any){Array,3,.value.item=(any_arr){any_number(0), start.value.number < 0 ? any_number(len.value.number + start.value.number) : start, len}});

           endPos = inRange(undefined,(any){Array,3,.value.item=(any_arr){any_number(0), endPos.value.number < 0 ? any_number(len.value.number + endPos.value.number) : endPos, len}});

           // if start>=endPos, return ''
           if (start.value.number >= endPos.value.number) {return any_EMPTY_STR;};

           any result;
           // for n=start to endPos
           for(int64_t n=start.value.number; n<=endPos.value.number; n++) {
               concat(result,(any){Array,2,.value.item=(any_arr){AS(TestClass,this)->myArr.value.item[n], any_str(" ")}});
           };// end for n

           return result;
       }
       ;
   // end class TestClass



//# sourceMappingURL=Core2.c.map