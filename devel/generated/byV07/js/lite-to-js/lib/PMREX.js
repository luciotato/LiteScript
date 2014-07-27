//Compiled by LiteScript compiler v0.7.9, source: /home/ltato/LiteScript/devel/source/v0.8/lib/PMREX.lite.md
// #PMREX, poor's man RegEx


   // public function whileRanges(chunk:string, rangesStr:string) returns string
   function whileRanges(chunk, rangesStr){

// whileRanges, advance from start, while the char is in the ranges specified.
// will return index of first char not in range, or searched string length all chars in range
// e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"
// e.g.: whileRanges("123ABC",0,"0-9A-Z") will return 6, string length because all chars are in range

       var len = chunk.length;

        //parse ranges into an array [[from,to],[from,to]...]
       var ranges = parseRanges(rangesStr);

        //advance while in any of the ranges
       var inx = 0;
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
           // if not isIn, break
           if (!(isIn)) {break};
           inx++;
       };// end loop

       return chunk.slice(0, inx);
   };
   // export
   module.exports.whileRanges=whileRanges;


   // public function untilRanges(chunk:string, rangesStr:string) returns string
   function untilRanges(chunk, rangesStr){

// findRanges: advance from start, *until* a char in one of the specified ranges is found.
// will return index of first char *in range* or searched string length if no match
// e.g.: findRanges("123ABC",0,"A-Z") will return 3, string[3] is "A"
// e.g.: findRanges("123ABC",0,"D-Z") will return 6 => length of "123ABC" => not found

       var len = chunk.length;

        //parse ranges into an array [[from,to],[from,to]...]
       var ranges = parseRanges(rangesStr);

        //advance until match
       var inx = 0;
       // do while inx<len
       while(inx < len){
           var ch = chunk.charAt(inx);
            //check all ranges
           // for r=0 to ranges.length-1, r+=2
           var _end5=ranges.length - 1;
           for( var r=0; r<=_end5; r += 2) {
               // if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
               if (ch >= ranges.charAt(r) && ch <= ranges.charAt(r + 1)) {
                   return chunk.slice(0, inx);
               };
           };// end for r
           // end for
           inx++;
       };// end loop

       return chunk.slice(0, inx);
   };
   // export
   module.exports.untilRanges=untilRanges;

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


   // public function whileUnescaped(chunk:string,endChar:string) returns string
   function whileUnescaped(chunk, endChar){

        //advance until unescaped endChar
       var pos = 0;
       // do
       while(true){
           var inx = chunk.indexOf(endChar, pos);

           // if inx is -1, fail with 'missing closing quote-char: #{endChar} ' // closer not found
           if (inx === -1) {throw new Error('missing closing quote-char: ' + endChar + ' ')};

           // if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
           if (inx > 0 && chunk.charAt(inx - 1) === '\\') {// #escaped

               var countEscape = 1;
               // while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
               while(inx > countEscape && chunk.charAt(inx - 1 - countEscape) === '\\'){
                       countEscape++;
               };// end loop

               // if countEscape % 2 is 0 //even, means escaped-escape, means: not escaped
               if (countEscape % 2 === 0) { //even, means escaped-escape, means: not escaped
                   // break    //we found an unescaped quote
                   break; //we found an unescaped quote
               }
               
               else {
                   pos = inx + 1; //odd means escaped quote, so it's not closing quote
               };
           }
           
           else {
                //found unescaped
               // break
               break;
           };
       };// end loop
       return chunk.slice(0, inx);
   };
   // export
   module.exports.whileUnescaped=whileUnescaped;

   // public function quotedContent(chunk:string) returns string
   function quotedContent(chunk){

// Note: chunk[0] MUST be the openinig quote

       // if no chunk.charAt(0) in '/"\'', throw "chunk.charAt(0) MUST be the openinig quote-char"
       if (!('/"\''.indexOf(chunk.charAt(0))>=0)) {throw "chunk.charAt(0) MUST be the openinig quote-char"};
       return whileUnescaped(chunk.slice(1), chunk.charAt(0));
   };
   // export
   module.exports.quotedContent=quotedContent;

//# sourceMappingURL=PMREX.js.map