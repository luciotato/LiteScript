#include "PMREX.h"
//-------------------------
//Module PMREX
//-------------------------
any PMREX_whileRanges(DEFAULT_ARGUMENTS); //forward declare
any PMREX_whileUnescaped(DEFAULT_ARGUMENTS); //forward declare
any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS); //forward declare
// #PMREX, poor's man RegEx

// whileRanges, advance from start, while the char is in the ranges specified.
// will return index of first char not in range.
// e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"

   // public function whileRanges(chunk:string, start, rangesStr:string)
   any PMREX_whileRanges(DEFAULT_ARGUMENTS){// define named params
       var chunk, start, rangesStr;
       chunk=start=rangesStr=undefined;
       switch(argc){
         case 3:rangesStr=arguments[2];
         case 2:start=arguments[1];
         case 1:chunk=arguments[0];
       }
       //---------
       // var ranges = []
       var ranges = _newArray(0,NULL);

        //parse ranges in array [[from,to],[from,to]...]
       // var ch:string, range:array
       var ch = undefined, range = undefined;
       // var inx=0
       var inx = any_number(0);
       // while inx<rangesStr.length
       while(_anyToNumber(inx) < _length(rangesStr)){
           // ch = rangesStr.charAt(inx)
           ch = CALL1(charAt_,rangesStr,inx);
           // range=[ch]
           range = _newArray(1,(any_arr){ch});
           // if rangesStr.charAt(inx+1) is '-'
           if (__is(CALL1(charAt_,rangesStr,any_number(_anyToNumber(inx) + 1)),any_str("-")))  {
               // inx++
               inx.value.number++;
               // range.push rangesStr.charAt(inx+1)
               CALL1(push_,range,CALL1(charAt_,rangesStr,any_number(_anyToNumber(inx) + 1)));
           }
           
           else {
               // range.push ch
               CALL1(push_,range,ch);
           };
           // ranges.push range
           CALL1(push_,ranges,range);
           // inx++
           inx.value.number++;
       };// end loop

        //advance while in any of the ranges
       // inx=start
       inx = start;
       // do while inx<chunk.length
       while(_anyToNumber(inx) < _length(chunk)){
           // ch = chunk.charAt(inx)
           ch = CALL1(charAt_,chunk,inx);
           // var isIn=false
           var isIn = false;
            //check all ranges
           // for r=0 to ranges.length-1
           int64_t _end5=_length(ranges) - 1;
           for(int64_t r=0; r<=_end5; r++) {
               // if ch>=ranges[r][0] and ch<=ranges[r][1]
               if (_anyToNumber(ch) >= _anyToNumber(ITEM(0,ITEM(r,ranges))) && _anyToNumber(ch) <= _anyToNumber(ITEM(1,ITEM(r,ranges))))  {
                   // isIn=true
                   isIn = true;
                   // break
                   break;
               };
           };// end for r
           // end for
           // if not isIn, return inx
           if (!(_anyToBool(isIn))) {return inx;};
           // inx++
           inx.value.number++;
       };// end loop

       // return inx
       return inx;
   return undefined;
   }

   // public function whileUnescaped(chunk:string,start,endChar)
   any PMREX_whileUnescaped(DEFAULT_ARGUMENTS){// define named params
       var chunk, start, endChar;
       chunk=start=endChar=undefined;
       switch(argc){
         case 3:endChar=arguments[2];
         case 2:start=arguments[1];
         case 1:chunk=arguments[0];
       }
       //---------

        //advance until unescaped endChar
       // var pos = start
       var pos = start;
       // do
       while(TRUE){
           // var inx = chunk.indexOf(endChar,pos)
           var inx = CALL2(indexOf_,chunk,endChar, pos);
           // if inx is -1, return -1
           if (__is(inx,any_number(-1))) {return any_number(-1);};
           // if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
           if (_anyToNumber(inx) > 0 && __is(CALL1(charAt_,chunk,any_number(_anyToNumber(inx) - 1)),any_str("\\")))  {// #escaped
               // var countEscape=1
               var countEscape = any_number(1);
               // while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
               while(_anyToNumber(inx) > _anyToNumber(countEscape) && __is(CALL1(charAt_,chunk,any_number(_anyToNumber(inx) - 1 - _anyToNumber(countEscape))),any_str("\\"))){
                   // countEscape++
                   countEscape.value.number++;
               };// end loop
               // if countEscape % 2 is 0 //even, means escaped-escape, i.e: not escaped
               if (__is(any_number((int64_t)_anyToNumber(countEscape) % (int64_t)2),any_number(0)))  { //even, means escaped-escape, i.e: not escaped
                   // return inx+1    // so found is final
                   return any_number(_anyToNumber(inx) + 1); // so found is final
               }
               
               else {
                   // pos=inx+1 //odd means escaped quote, so it's not final
                   pos = any_number(_anyToNumber(inx) + 1); //odd means escaped quote, so it's not final
               };
           }
           
           else {
               // return inx+1
               return any_number(_anyToNumber(inx) + 1);
           };
       };// end loop
       
   return undefined;
   }

   // public function findMatchingQuote(chunk:string, start)
   any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS){// define named params
       var chunk, start;
       chunk=start=undefined;
       switch(argc){
         case 2:start=arguments[1];
         case 1:chunk=arguments[0];
       }
       //---------

// Note: chunk[start] MUST be the openinig quote

       // return whileUnescaped(chunk,start+1,chunk.charAt(start))
       return PMREX_whileUnescaped(undefined,3,(any_arr){chunk, any_number(_anyToNumber(start) + 1), CALL1(charAt_,chunk,start)});
   return undefined;
   }

//-------------------------
void PMREX__moduleInit(void){
};