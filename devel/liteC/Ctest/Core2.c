//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/liteC/Core2.lite.md
// Core2

    // global declare Core

   // function inRange(min:int, value:int, max:int)
   void inRange(int min, int value, int max){
       return // when value<min then min
               (value < min) ? (min) :
                // when value>max then max
               (value > max) ? (max) :
       /* else */ value;
   };

   // class String2 extends Object
   // constructor
   //default __init
   void String2__init(String2 this){// //auto call super__init, to initialize first part of space at *this
       Object_init(this);
        // properties
            // value: str
            // length: int
   };
   // String2 extends Object

       // method indexOf(searched:string, fromIndex:int=0) returns int
       //function indexOf
       int String2->prototype->indexOf(String searched, int fromIndex){if(fromIndex===undefined) fromIndex=0;
           size_t sl = searched->length;
           // for start=fromIndex while start<.length-sl
           for( var start=fromIndex; start < this->length - sl; start++) {
               // if memcmp(this.value[start],searched,sl) is 0
               if (memcmp(this->value[start], searched, sl) === 0) {
                   return start;
               };
           };// end for start
           return -1;
       };

       // method slice(start:int, end:int=-1) returns str
       //function slice
       str String2->prototype->slice(int start, int end){if(end===undefined) end=-1;

           void len = this->length;

           start = inRange(0, start < 0 ? len + start : start, len);

           // end = inRange( 0, end<0?len+end:end , len)

           // if start>=end, return ''
           if (start >= end) {return ''};

           void size = end - start;
           void newstr = alloc(size + 1);
           memcpy(newstr, this->value[start], size);
           newstr[size] = '\0';

           return newstr;
       };
   // end class String2



