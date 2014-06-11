//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/liteC/Core2.lite.md

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
           this->length = strlen(initStr);
       };

       // method indexOf(searched:String2, fromIndex:int=0) returns int
       int String2__indexOf(String2 this,String2 searched, int fromIndex){
           size_t sl = searched->length;
           // for start=fromIndex while start<.length-sl
           for(int start=fromIndex; start < this->length - sl; start++) {
               // if memcmp(this.value[start],searched.value,sl) is 0
               if (memcmp(this->value[start], searched->value, sl) === 0) {
                   return start;
               };
           };// end for start
           return -1;
       };

       // method slice(start:int, endPos:int=-1) returns String2
       String2 String2__slice(String2 this,int start, int endPos){

           void len = this->length;

           start = inRange(0, start < 0 ? len + start : start, len);

           endPos = inRange(0, endPos < 0 ? len + endPos : endPos, len);

           // if start>=endPos, return ''
           if (start >= endPos) {return '';};

           void size = endPos - start;
           void newstr = alloc(size + 1);
           memcpy(newstr, this->value[start], size);
           newstr[size] = '\0';

           return new String2(newstr);
       };
   
   // String2__Methods: Instantiated jmp table
   struct String2__METHODS_t String2__METHODS_I = {
      String2__indexOf,
      String2__slice
   };
   
   // String2__CLASS_I: Instantiated class info
   // instantiated class info and a const ptr to it
   struct String2t String2__CLASS_I = {
      &Class__CLASS_I, //type of this object (a class info)
      &String2__METHODS_I, //call = methods of this class
      "String2", //class name
      String2__init, //fn __init
      sizeof(struct String2_t), //each instance memory size
      String2__METHODS_I, //methods jmp table
       &Object // super class
   };
   
   const Class
    String2__CLASS = &String2__CLASS_I;
   
   // end class String2



