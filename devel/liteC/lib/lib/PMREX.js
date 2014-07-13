//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/lib/PMREX.lite.md
// #PMREX, poor's man RegEx

// whileRanges, advance from start, while the char is in the ranges specified.
// will return index of first char not in range.
// e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"

   // public function whileRanges(chunk:string, start, rangesStr:string)
   function whileRanges(chunk, start, rangesStr){
       var ranges = [];

        //parse ranges in array [[from,to],[from,to]...]
       var ch = undefined, range = undefined;
       var inx = 0;
       // while inx<rangesStr.length
       while(inx < rangesStr.length){
           ch = rangesStr.charAt(inx);
           range = [ch];
           // if rangesStr.charAt(inx+1) is '-'
           if (rangesStr.charAt(inx + 1) === '-') {
               inx++;
               range.push(rangesStr.charAt(inx + 1));
           }
           
           else {
               range.push(ch);
           };
           ranges.push(range);
           inx++;
       };// end loop

        //advance while in any of the ranges
       inx = start;
       // do while inx<chunk.length
       while(inx < chunk.length){
           ch = chunk.charAt(inx);
           var isIn = false;
            //check all ranges
           // for r=0 to ranges.length-1
           var _end3=ranges.length - 1;
           for( var r=0; r<=_end3; r++) {
               // if ch>=ranges[r][0] and ch<=ranges[r][1]
               if (ch >= ranges[r][0] && ch <= ranges[r][1]) {
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
