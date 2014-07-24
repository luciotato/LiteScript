#include "./PMREX-native.h"

// #PMREX, poor's man RegEx
//-------------------------
//Module PMREX
//-------------------------

any PMREX_whileRanges(DEFAULT_ARGUMENTS); //forward declare
any PMREX_findRanges(DEFAULT_ARGUMENTS); //forward declare
any PMREX_whileUnescaped(DEFAULT_ARGUMENTS); //forward declare
any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS); //forward declare

void PMREX_parseRanges(str ranegParam); //forward declare
char PMREX_ranges[40];
int PMREX_ranges_length=0;

//### public function whileRanges(chunk:string, start, rangesStr:string)
    any PMREX_whileRanges(DEFAULT_ARGUMENTS){
        assert_args(3, 3, String, Number, String);
        // define named params
        str chunk = arguments[0].value.str;
        int start = arguments[1].value.number;
        str rangesStr = arguments[2].value.str;

// whileRanges, advance from start, while the char is in the ranges specified.
// will return index of first char not in range, or searched string length all chars in range
// e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"
// e.g.: whileRanges("123ABC",0,"0-9A-Z") will return 6, string length because all chars are in range

        //var len = chunk.length
        int len = strlen(chunk);
        //if start>=len, return len
        if (start >= len) {return any_number(len);};

        //parse ranges into an array [[from,to],[from,to]...]
        //var ranges = parseRanges(rangesStr)
        PMREX_parseRanges(rangesStr);

        //advance while in any of the ranges
        //var inx=start
        int inx = start;
        //do while inx<len
        while(inx < len){
            //var ch = chunk.charAt(inx)
            char ch = chunk[inx];
            //var isIn=false
            int isIn = FALSE;
            //check all ranges
            //for r=0 to ranges.length-1, r+=2
            for(int r=0; r<PMREX_ranges_length; r+=2) {
                //if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
                if (ch >= PMREX_ranges[r] && ch<=PMREX_ranges[r + 1])  {
                    isIn = TRUE;
                    break;
                };
            };// end for r
            //end for
            //if not isIn, return inx
            if (!isIn) {return any_number(inx);};
            inx++;
        };// end loop

        //return inx
        return any_number(inx);
    }


//### public function findRanges(chunk:string, start, rangesStr:string)
    any PMREX_findRanges(DEFAULT_ARGUMENTS){
        assert_args(3, 3, String, Number, String);
        // define named params
        str chunk = arguments[0].value.str;
        int start = arguments[1].value.number;
        str rangesStr = arguments[2].value.str;

// findRanges: advance from start, *until* a char in one of the specified ranges is found.
// will return index of first char *in range* or searched string length if no match
// e.g.: findRanges("123ABC",0,"A-Z") will return 3, string[3] is "A"
// e.g.: findRanges("123ABC",0,"D-Z") will return 6 => length of "123ABC" => not found

        //var len = chunk.length
        int len = strlen(chunk);
        //if start>=len, return len
        if (start >= len) {return any_number(len);};

        //parse ranges into an array [[from,to],[from,to]...]
        //var ranges = parseRanges(rangesStr)
        PMREX_parseRanges(rangesStr);

        //advance while in any of the ranges
        //var inx=start
        int inx = start;
        //do while inx<len
        while(inx < len){
            //var ch = chunk.charAt(inx)
            char ch = chunk[inx];
            //var isIn=false
            int isIn = FALSE;
            //check all ranges
            //for r=0 to ranges.length-1, r+=2
            for(int r=0; r<PMREX_ranges_length; r+=2) {
                //if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
                if (ch >= PMREX_ranges[r] && ch<=PMREX_ranges[r + 1])  {
                    return any_number(inx);
                };
            };// end for r
            //end for
            inx++;
        };// end loop

        //return inx
        return any_number(inx);
    }

//### helper function parseRanges(rangesStr:string) returns string
    void PMREX_parseRanges(str rangesStr){

        PMREX_ranges_length=0;

        char ch;
        int inx = 0;
        int len = strlen(rangesStr);
        while(ch = rangesStr[inx]){
            if (PMREX_ranges_length>=sizeof(PMREX_ranges)) return;
            PMREX_ranges[PMREX_ranges_length++]=ch;
            if (rangesStr[++inx]=='-') ch=rangesStr[++inx], inx++;
            PMREX_ranges[PMREX_ranges_length++]=ch;
        };// end loop
    }


//### public function whileUnescaped(chunk:string,start,endChar)
    any PMREX_nat_whileUnescaped(str chunk, int start, char endChar){
        //advance until unescaped endChar
        //var pos = start
        str pos = chunk+start;
        //do
        while(TRUE){
            //var inx = chunk.indexOf(endChar,pos)
            str quotPtr = strchr(pos, endChar);
            //int inx = strstr METHOD(indexOf_,chunk)(chunk,2,(any_arr){endChar, pos});
            //if inx is -1, return -1
            if (!quotPtr) {return any_number(-1);};
            //if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
            if (quotPtr>chunk && *(quotPtr-1)=='\\')  {// #escaped
                //var countEscape=1
                int countEscape = 1;
                //while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
                while(quotPtr-1-countEscape >= chunk && *(quotPtr-1-countEscape)=='\\') countEscape++;
                //if countEscape % 2 is 0 //even, means escaped-escape, i.e: not escaped
                if (countEscape % 2 == 0)  { //even, means escaped-escape, i.e: not escaped
                    return any_number(quotPtr-chunk+1); // so found is final
                }
                else {
                    pos = quotPtr+1; //odd means escaped quote, so it's not final
                };
            }
            else {
                //return inx+1
                return any_number(quotPtr-chunk+ 1);
            };
        };// end loop
    }

    any PMREX_whileUnescaped(DEFAULT_ARGUMENTS){
        assert_args(3, 3, String, Number, String);
        // define named params
        str chunk = arguments[0].value.str;
        int start = arguments[1].value.number;
        char endChar= arguments[2].value.str[0];
        //---------
        return PMREX_nat_whileUnescaped(chunk,start,endChar);
    }

//### public function findMatchingQuote(chunk:string, start)
    any PMREX_findMatchingQuote(DEFAULT_ARGUMENTS){
        assert_args(2, 2, String, Number);
        str chunk = arguments[0].value.str;
        int start = arguments[1].value.number;

// Note: chunk[start] MUST be the openinig quote

        //return whileUnescaped(chunk,start+1,chunk.charAt(start))
        return PMREX_nat_whileUnescaped(chunk,start+1,chunk[start]);
    }

//-------------------------
void PMREX__moduleInit(void){
};