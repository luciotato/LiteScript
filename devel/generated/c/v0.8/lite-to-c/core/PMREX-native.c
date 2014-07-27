/** PMREX, poor's man RegEx
 *
 * --------------------------------
 * LiteScript lang - gtihub.com/luciotato/LiteScript
 * Copyright (c) 2014 Lucio M. Tato
 * --------------------------------
 * This file is part of LiteScript.
 * LiteScript is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation version 3.
 * LiteScript is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details. You should have received a copy of the
 * GNU Affero General Public License along with LiteScript.  If not, see <http://www.gnu.org/licenses/>.
 */

#include "./PMREX-native.h"
#include "./utf8strings.h"

//-------------------------
//Module PMREX
//-------------------------

    static char PMREX_ranges[40];
    static int PMREX_ranges_length=0;

    //forward
    void PMREX_parseRanges(any ranges);

    /** public function whileRanges(chunk:string, ranges:string).
     * whileRanges, advance from start, while the char is in the ranges specified.
     *
     * will return slice with all chars in range
     *
     * e.g.: whileRanges("123ABC",0,"0-9J-Z") will return "123", string[3] is "A"
     *
     * e.g.: whileRanges("123ABC",0,"0-9A-Z") will return "123ABC" because all chars are in range
     *
     */
    any PMREX_whileRanges(DEFAULT_ARGUMENTS){
        assert_args({.req=2,.max=2,.control=2},String, String);
        // define named params
        var chunk=arguments[0];
        _FLATTEN(chunk);

        //var len = chunk.length
        int len = chunk.len;

        //parse ranges into an array [[from,to],[from,to]...]
        //var ranges = parseRanges(rangesStr)
        PMREX_parseRanges(arguments[1]);

        //advance while in any of the ranges
        int inx = 0;
        //do while inx<len
        while(inx < len){
            char ch = chunk.value.str[inx];
            int isIn = FALSE;
            //check all ranges
            for(int r=0; r<PMREX_ranges_length; r+=2) {
                if (ch >= PMREX_ranges[r] && ch<=PMREX_ranges[r + 1])  {
                    isIn = TRUE;
                    break;
                };
            };
            //if not isIn, return upto here
            if (!isIn) break;
            inx++;
        };// end loop

        //return inx
        return _slicedTo(chunk,inx);
    }


    /** public function untilRanges(chunk:string, ranges:string).
     * untilRanges: advance from start, *until* a char in one of the specified ranges is found.
     *
     * will return slice with chars upto first char *in range* or full chunk if no match
     *
     * e.g.: findRanges("123ABC",0,"A-Z") will return "123", string[3] is "A"
     *
     * e.g.: findRanges("123ABC",0,"D-Z") will return "123ABC" => not found
     */
    any PMREX_untilRanges(DEFAULT_ARGUMENTS){
        assert_args({.req=2,.max=2,.control=2}, String, String);

        // define named params
        any chunk = arguments[0];
        _FLATTEN(chunk);
        len_t len = chunk.len;

        //parse ranges into an array [[from,to],[from,to]...]
        PMREX_parseRanges(arguments[1]);

        //advance while in any of the ranges
        len_t inx = 0;
        while(inx < len){
            char ch = chunk.value.str[inx];
            int isIn = FALSE;
            //check all ranges
            for(int r=0; r<PMREX_ranges_length; r+=2) {
                if (ch >= PMREX_ranges[r] && ch<=PMREX_ranges[r + 1])  {
                    return any_slice(chunk.value.str,inx);
                };
            };// end for r
            //end for
            inx++;
        };// end loop

        //return inx
        return any_slice(chunk.value.str,inx);
    }

    /** helper function parseRanges(rangesStr:string) returns string.
     * ranges should be only ASCII
     *
     */
    void PMREX_parseRanges(any ranges){

        _FLATTEN(ranges);
        PMREX_ranges_length=0;

        char ch;
        int inx = 0;
        while(inx<ranges.len){
            ch = ranges.value.str[inx];
            if (PMREX_ranges_length>=sizeof(PMREX_ranges)-3) fatal("too many ranges");
            PMREX_ranges[PMREX_ranges_length++]=ch;
            if (inx<ranges.len-2){
                if (ranges.value.str[inx+1]=='-') {
                    ch=ranges.value.str[inx=inx+2];
                }
            }
            PMREX_ranges[PMREX_ranges_length++]=ch;
            inx++;
        };// end loop
    }


    /** public function whileUnescaped(chunk:string,endChar:string).
     * used to search a closing quote. will return a slice with all chars
     * until unsecaped endChar.
     */
    any PMREX_nat_whileUnescaped(any chunk, any endChar){
        //advance until unescaped endChar
        _FLATTEN(chunk);
        str pos = chunk.value.str, quotPtr;
        while(TRUE){
            quotPtr = utf8Find(chunk, endChar, pos);
            if (!quotPtr) { throw(_newErr(any_LTR("missing closing quote or /")));}

            //if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
            if (quotPtr>chunk.value.str && *(quotPtr-1)=='\\')  {// #escaped
                int countEscape = 1;
                //while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
                while(quotPtr-1-countEscape >= chunk.value.str && *(quotPtr-1-countEscape)=='\\') countEscape++;
                if (countEscape % 2 == 0)  { //even, means escaped-escape, means: not escaped
                    break; // not-escaped, so found is final
                }
                else {
                    pos = quotPtr+1; //odd means escaped quote, so it's not closing quote
                };
            }
            else {
                //found unescaped
                break;
            };
        };//loop

        // return up-to not including closing quote
        return any_slice(chunk.value.str, quotPtr-chunk.value.str);
    }

    /** public function whileUnescaped(chunk:string,endChar:string).
     * used to search a closing quote. will return a slice with all chars
     * until unsecaped endChar.
     */
    any PMREX_whileUnescaped(DEFAULT_ARGUMENTS){
        assert_args({.req=2,.max=2,.control=2},String, String);
        return PMREX_nat_whileUnescaped(arguments[0],arguments[1]);
    }

/** public function findMatchingQuote(chunk:string, start)
 * Note: chunk MUST start with the openinig quote
 *
 * return *contents* of quoted string, including escaped internal quotes.
 * throws if malformed/unclosed.
 */
    any PMREX_quotedContent(DEFAULT_ARGUMENTS){
        assert_arg(String);
        any chunk = arguments[0];
        _FLATTEN(chunk);
        assert(*chunk.value.str=='"' || *chunk.value.str=='\'' || *chunk.value.str=='/');
        //return *contents* of quoted string, considering escaped quotes
        return PMREX_nat_whileUnescaped(_slicedFrom(chunk,1), _slicedTo(chunk,1));
    }

//-------------------------
void PMREX__moduleInit(void){
};