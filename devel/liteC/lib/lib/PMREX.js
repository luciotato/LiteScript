//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/lib/PMREX.lite.md
// #PMREX, poor's man RegEx


   // public function whileRanges(chunk:string, start, rangesStr:string)
   function whileRanges(chunk, start, rangesStr){

// whileRanges, advance from start, while the char is in the ranges specified.
// will return index of first char not in range, or searched string length all chars in range
// e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"
// e.g.: whileRanges("123ABC",0,"0-9A-Z") will return 6, string length because all chars are in range

       var len = chunk.length;
       // if start>=len, return len
       if (start >= len) {return len};

        //parse ranges into an array [[from,to],[from,to]...]
       var ranges = parseRanges(rangesStr);

        //advance while in any of the ranges
       var inx = start;
       // do while inx<len
       while(inx < len){
           var ch = chunk.charAt(inx);
           var isIn = false;
            //check all ranges
           // for r=0 to ranges.length-1, r+=2
           var _end4=ranges.length - 1;
           for( var r=0; r<=_end4; r += 2) {
               // if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
               if (ch >= ranges.charAt(r) && ch <= ranges.charAt(r + 1)) {
                   isIn = true;
                   // break
                   break;
               };
           };// end for r
           // end for
           // if not isIn, return inx
           if (!(isIn)) {return inx};
           inx++;
       };// end loop

       return inx;
   };
   // export
   module.exports.whileRanges=whileRanges;


   // public function findRanges(chunk:string, start, rangesStr:string)
   function findRanges(chunk, start, rangesStr){

// findRanges: advance from start, *until* a char in one of the specified ranges is found.
// will return index of first char *in range* or searched string length if no match
// e.g.: findRanges("123ABC",0,"A-Z") will return 3, string[3] is "A"
// e.g.: findRanges("123ABC",0,"D-Z") will return 6 => length of "123ABC" => not found

       var len = chunk.length;
       // if start>=len, return len
       if (start >= len) {return len};

        //parse ranges into an array [[from,to],[from,to]...]
       var ranges = parseRanges(rangesStr);

        //advance until match
       var inx = start;
       // do while inx<len
       while(inx < len){
           var ch = chunk.charAt(inx);
            //check all ranges
           // for r=0 to ranges.length-1, r+=2
           var _end5=ranges.length - 1;
           for( var r=0; r<=_end5; r += 2) {
               // if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
               if (ch >= ranges.charAt(r) && ch <= ranges.charAt(r + 1)) {
                   return inx;
               };
           };// end for r
           // end for
           inx++;
       };// end loop

       return inx;
   };
   // export
   module.exports.findRanges=findRanges;

   // helper function parseRanges(rangesStr:string) returns string
   function parseRanges(rangesStr){

       var result = "";

        //parse ranges in array [[from,to],[from,to]...]
       var ch = undefined;
       var inx = 0;
       // while inx<rangesStr.length
       while(inx < rangesStr.length){
           ch = rangesStr.charAt(inx);
           result += ch;
           // if rangesStr.charAt(inx+1) is '-'
           if (rangesStr.charAt(inx + 1) === '-') {
               inx++;
               result += rangesStr.charAt(inx + 1);
           }
           
           else {
               result += ch;
           };
           inx++;
       };// end loop

       return result;
   };


   // public function whileUnescaped(chunk:string,start,endChar)
   function whileUnescaped(chunk, start, endChar){

        //advance until unescaped endChar
       var pos = start;
       // do
       while(true){
           var inx = chunk.indexOf(endChar, pos);
           // if inx is -1, return -1
           if (inx === -1) {return -1};
           // if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
           if (inx > 0 && chunk.charAt(inx - 1) === '\\') {// #escaped
               var countEscape = 1;
               // while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
               while(inx > countEscape && chunk.charAt(inx - 1 - countEscape) === '\\'){
                   countEscape++;
               };// end loop
               // if countEscape % 2 is 0 //even, means escaped-escape, i.e: not escaped
               if (countEscape % 2 === 0) { //even, means escaped-escape, i.e: not escaped
                   return inx + 1; // so found is final
               }
               
               else {
                   pos = inx + 1; //odd means escaped quote, so it's not final
               };
           }
           
           else {
               return inx + 1;
           };
       };// end loop
       
   };
   // export
   module.exports.whileUnescaped=whileUnescaped;

   // public function findMatchingQuote(chunk:string, start)
   function findMatchingQuote(chunk, start){

// Note: chunk[start] MUST be the openinig quote

       return whileUnescaped(chunk, start + 1, chunk.charAt(start));
   };
   // export
   module.exports.findMatchingQuote=findMatchingQuote;
