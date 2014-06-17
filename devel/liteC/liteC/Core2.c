//Compiled by LiteScript compiler vundefined, source: /home/ltato/LiteScript/devel/liteC/Core2.lite.md

#include "Core2.h"

// Core2

   
    // global declare CoreC

   // public function inRange(min:int, value:int, max:int) returns int
   int inRange(int min, int value, int max){
       return // when value<min then min
               (value < min) ? (min) :
                // when value>max then max
               (value > max) ? (max) :
       /* else */ value;
   };

   // public class String2 extends Object
   
       //class _init fn
       void String2__init(String2 this,str initStr){
           this->value = initStr;
           this->length = strlen;
       };

       // method indexOf(searched:String2, fromIndex:int=0) returns int
       int String2__indexOf(String2 this,String2 searched, int fromIndex){
           size_t sl = searched->length;
           // for start=fromIndex while start<.length-sl
           for(int start=fromIndex; start < this->length - sl; start++) {
               // if memcmp(this.value[start],searched.value,sl) is 0
               if (memcmp === 0) {
                   return start;
               };
           };// end for start
           return -1;
       };

       // method slice(start:int, endPos:int=-1) returns String2
       String2 String2__slice(String2 this,int start, int endPos){

           void len = this->length;

           start = inRange;

           endPos = inRange;

           // if start>=endPos, return ''
           if (start >= endPos) {return '';};

           void size = endPos - start;
           void newstr = alloc;
           memcpy;
           newstr[size] = '\0';

           return new String2;
       };
   // end class String2




//# sourceMappingURL=Core2.c.map