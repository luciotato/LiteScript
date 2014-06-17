//Compiled by LiteScript compiler vundefined, source: /home/ltato/LiteScript/devel/liteC/Core2.lite.md
// Core2

    // global declare CoreC

   // public function inRange(min:int, value:int, max:int) returns int
   function inRange(min, value, max){
       return // when value<min then min
               (value < min) ? (min) :
                // when value>max then max
               (value > max) ? (max) :
       /* else */ value;
   };
   // export
   module.exports.inRange=inRange;

   // public class String2 extends Object
   // constructor
       function String2(initStr){
        // properties
            // value: str
            // length: int
           this.value = initStr;
           this.length = strlen(initStr);
       };
   // String2 (extends|proto is) Object
   String2.prototype.__proto__ = Object.prototype;

       // method indexOf(searched:String2, fromIndex:int=0) returns int
       String2.prototype.indexOf = function(searched, fromIndex){if(fromIndex===undefined) fromIndex=0;
           var sl = searched.length;
           // for start=fromIndex while start<.length-sl
           for( var start=fromIndex; start < this.length - sl; start++) {
               // if memcmp(this.value[start],searched.value,sl) is 0
               if (memcmp(this.value[start], searched.value, sl) === 0) {
                   return start;
               };
           };// end for start
           return -1;
       };

       // method slice(start:int, endPos:int=-1) returns String2
       String2.prototype.slice = function(start, endPos){if(endPos===undefined) endPos=-1;

           var len = this.length;

           start = inRange(0, start < 0 ? len + start : start, len);

           endPos = inRange(0, endPos < 0 ? len + endPos : endPos, len);

           // if start>=endPos, return ''
           if (start >= endPos) {return ''};

           var size = endPos - start;
           var newstr = alloc(size + 1);
           memcpy(newstr, this.value[start], size);
           newstr[size] = '\0';

           return new String2(newstr);
       };
   // export
   module.exports.String2 = String2;
   // end class String2



