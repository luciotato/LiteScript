#include "PMREX.h"
//-------------------------
//Module PMREX
//-------------------------


any PMREX_whileRanges(DEFAULT_ARGUMENTS); //forward declare
any PMREX_findRanges(DEFAULT_ARGUMENTS); //forward declare
any PMREX_parseRanges(DEFAULT_ARGUMENTS); //forward declare
any PMREX_whileUnescaped(DEFAULT_ARGUMENTS); //forward declare
any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS); //forward declare
// #PMREX, poor's man RegEx


//### public function whileRanges(chunk:string, start, rangesStr:string)
    any PMREX_whileRanges(DEFAULT_ARGUMENTS){
        // define named params
        var chunk, start, rangesStr;
        chunk=start=rangesStr=undefined;
        switch(argc){
          case 3:rangesStr=arguments[2];
          case 2:start=arguments[1];
          case 1:chunk=arguments[0];
        }
        //---------

// whileRanges, advance from start, while the char is in the ranges specified.
// will return index of first char not in range, or searched string length all chars in range
// e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"
// e.g.: whileRanges("123ABC",0,"0-9A-Z") will return 6, string length because all chars are in range

        //var len = chunk.length
        var len = any_number(_length(chunk));
        //if start>=len, return len
        if (_anyToNumber(start) >= _anyToNumber(len)) {return len;};

        //parse ranges into an array [[from,to],[from,to]...]
        //var ranges = parseRanges(rangesStr)
        var ranges = PMREX_parseRanges(undefined,1,(any_arr){rangesStr});

        //advance while in any of the ranges
        //var inx=start
        var inx = start;
        //do while inx<len
        while(_anyToNumber(inx) < _anyToNumber(len)){
            //var ch = chunk.charAt(inx)
            var ch = METHOD(charAt_,chunk)(chunk,1,(any_arr){inx});
            //var isIn=false
            var isIn = false;
            //check all ranges
            //for r=0 to ranges.length-1, r+=2
            int64_t _end6=_length(ranges) - 1;
            for(int64_t r=0; r<=_end6; r += 2) {
                //if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
                if (_anyToNumber(ch) >= _anyToNumber(METHOD(charAt_,ranges)(ranges,1,(any_arr){any_number(r)})) && _anyToNumber(ch) <= _anyToNumber(METHOD(charAt_,ranges)(ranges,1,(any_arr){any_number(r + 1)})))  {
                    //isIn=true
                    isIn = true;
                    //break
                    break;
                };
            };// end for r
            //end for
            //if not isIn, return inx
            if (!(_anyToBool(isIn))) {return inx;};
            //inx++
            inx.value.number++;
        };// end loop

        //return inx
        return inx;
    return undefined;
    }


//### public function findRanges(chunk:string, start, rangesStr:string)
    any PMREX_findRanges(DEFAULT_ARGUMENTS){
        // define named params
        var chunk, start, rangesStr;
        chunk=start=rangesStr=undefined;
        switch(argc){
          case 3:rangesStr=arguments[2];
          case 2:start=arguments[1];
          case 1:chunk=arguments[0];
        }
        //---------

// findRanges: advance from start, *until* a char in one of the specified ranges is found.
// will return index of first char *in range* or searched string length if no match
// e.g.: findRanges("123ABC",0,"A-Z") will return 3, string[3] is "A"
// e.g.: findRanges("123ABC",0,"D-Z") will return 6 => length of "123ABC" => not found

        //var len = chunk.length
        var len = any_number(_length(chunk));
        //if start>=len, return len
        if (_anyToNumber(start) >= _anyToNumber(len)) {return len;};

        //parse ranges into an array [[from,to],[from,to]...]
        //var ranges = parseRanges(rangesStr)
        var ranges = PMREX_parseRanges(undefined,1,(any_arr){rangesStr});

        //advance until match
        //var inx=start
        var inx = start;
        //do while inx<len
        while(_anyToNumber(inx) < _anyToNumber(len)){
            //var ch = chunk.charAt(inx)
            var ch = METHOD(charAt_,chunk)(chunk,1,(any_arr){inx});
            //check all ranges
            //for r=0 to ranges.length-1, r+=2
            int64_t _end7=_length(ranges) - 1;
            for(int64_t r=0; r<=_end7; r += 2) {
                //if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
                if (_anyToNumber(ch) >= _anyToNumber(METHOD(charAt_,ranges)(ranges,1,(any_arr){any_number(r)})) && _anyToNumber(ch) <= _anyToNumber(METHOD(charAt_,ranges)(ranges,1,(any_arr){any_number(r + 1)})))  {
                    //return inx
                    return inx;
                };
            };// end for r
            //end for
            //inx++
            inx.value.number++;
        };// end loop

        //return inx
        return inx;
    return undefined;
    }

//### helper function parseRanges(rangesStr:string) returns string
    any PMREX_parseRanges(DEFAULT_ARGUMENTS){
        // define named params
        var rangesStr= argc? arguments[0] : undefined;
        //---------

        //var result = ""
        var result = any_EMPTY_STR;

        //parse ranges in array [[from,to],[from,to]...]
        //var ch:string
        var ch = undefined;
        //var inx=0
        var inx = any_number(0);
        //while inx<rangesStr.length
        while(_anyToNumber(inx) < _length(rangesStr)){
            //ch = rangesStr.charAt(inx)
            ch = METHOD(charAt_,rangesStr)(rangesStr,1,(any_arr){inx});
            //result &= ch
            result=_concatAny(2,(any_arr){result,ch});
            //if rangesStr.charAt(inx+1) is '-' 
            if (__is(METHOD(charAt_,rangesStr)(rangesStr,1,(any_arr){any_number(_anyToNumber(inx) + 1)}),any_str("-")))  {
                //inx++
                inx.value.number++;
                //result &= rangesStr.charAt(inx+1)
                result=_concatAny(2,(any_arr){result,METHOD(charAt_,rangesStr)(rangesStr,1,(any_arr){any_number(_anyToNumber(inx) + 1)})});
            }
            //else
            
            else {
                //result &= ch
                result=_concatAny(2,(any_arr){result,ch});
            };
            //inx++
            inx.value.number++;
        };// end loop

        //return result
        return result;
    return undefined;
    }


//### public function whileUnescaped(chunk:string,start,endChar)
    any PMREX_whileUnescaped(DEFAULT_ARGUMENTS){
        // define named params
        var chunk, start, endChar;
        chunk=start=endChar=undefined;
        switch(argc){
          case 3:endChar=arguments[2];
          case 2:start=arguments[1];
          case 1:chunk=arguments[0];
        }
        //---------

        //advance until unescaped endChar
        //var pos = start
        var pos = start;
        //do
        while(TRUE){
            //var inx = chunk.indexOf(endChar,pos)
            var inx = METHOD(indexOf_,chunk)(chunk,2,(any_arr){endChar, pos});
            //if inx is -1, return -1
            if (__is(inx,any_number(-1))) {return any_number(-1);};
            //if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
            if (_anyToNumber(inx) > 0 && __is(METHOD(charAt_,chunk)(chunk,1,(any_arr){any_number(_anyToNumber(inx) - 1)}),any_str("\\")))  {// #escaped
                //var countEscape=1
                var countEscape = any_number(1);
                //while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
                while(_anyToNumber(inx) > _anyToNumber(countEscape) && __is(METHOD(charAt_,chunk)(chunk,1,(any_arr){any_number(_anyToNumber(inx) - 1 - _anyToNumber(countEscape))}),any_str("\\"))){
                    //countEscape++
                    countEscape.value.number++;
                };// end loop
                //if countEscape % 2 is 0 //even, means escaped-escape, i.e: not escaped
                if (__is(any_number((int64_t)_anyToNumber(countEscape) % (int64_t)2),any_number(0)))  { //even, means escaped-escape, i.e: not escaped
                    //return inx+1    // so found is final
                    return any_number(_anyToNumber(inx) + 1); // so found is final
                }
                //else
                
                else {
                    //pos=inx+1 //odd means escaped quote, so it's not final
                    pos = any_number(_anyToNumber(inx) + 1); //odd means escaped quote, so it's not final
                };
            }
            //else
            
            else {
                //return inx+1
                return any_number(_anyToNumber(inx) + 1);
            };
        };// end loop
        
    return undefined;
    }

//### public function findMatchingQuote(chunk:string, start)
    any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS){
        // define named params
        var chunk, start;
        chunk=start=undefined;
        switch(argc){
          case 2:start=arguments[1];
          case 1:chunk=arguments[0];
        }
        //---------

// Note: chunk[start] MUST be the openinig quote

        //return whileUnescaped(chunk,start+1,chunk.charAt(start))
        return PMREX_whileUnescaped(undefined,3,(any_arr){chunk, any_number(_anyToNumber(start) + 1), METHOD(charAt_,chunk)(chunk,1,(any_arr){start})});
    return undefined;
    }

//-------------------------
void PMREX__moduleInit(void){
};