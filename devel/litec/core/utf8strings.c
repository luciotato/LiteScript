#include "LiteC-core.h"
#include "utf8strings.h"
/*
 ----------------------------
 utf-8 strings
 ----------------------------
 UTF8 Strings helper functions
 ----------------------------

    LiteScript lang
    Copyright (c) 2014 Lucio M. Tato

    This file is part of LiteScript.

    LiteScript is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation version 3.

    LiteScript is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with LiteScript.  If not, see <http://www.gnu.org/licenses/>.
 */

//------------
// utf-8 strings

    /**
     *  returns the number of utf8 code points in the buffer at s
     */
    len_t utf8len(any s)
    {
        assert(s.class==String_inx);
        uint64_t len = 0;
        if (!s.res){// simple str
            for (; s.len--; ++s.value.str) if isUFT8SequenceStart(*s.value.str) ++len;
            return len;
        }

        //multiple slices
        // calc codepoints on each slice
        //calc combined len
        ConcatdItem_ptr slicePtr=s.value.slices;
        for( ;s.len--; slicePtr++){
            ConcatdItem_s sl = *slicePtr;
            str ptr=sl.str;
            for (; sl.byteLen--; ptr++) if (isUFT8SequenceStart(*ptr)) len++;
        }
        if (len>UINT32_MAX) fatal("utf8len:concatdSlices: string too large");
        return len;
    }

    /** returns
     *
     * - the utf-8 codepoint index of a given ptr in the slice
     *
     * - or utf8len(s) if ptr is outside the slice
     *
     * - 1 if empty slice (or invalid utf-8)
    */
    int64_t utf8indexFromPtr(any s, str ptr)
    {
        if (!ptr) return -1;

        assert(ptr >= s.value.str);
        int64_t inx = -1;
        for (; s.len-- && s.value.str <= ptr; ++s.value.str) {
            if isUFT8SequenceStart(*s.value.str) ++inx;
        }
        return inx;
    }

    /**
     *  returns a pointer to the zero-based index'th utf8 codepoint in the slice at s
     *
     *  Always return a valid pointer within the slice+1
     *
     * - if index>=len, returns a pointer to last+1
     *
     * - if index<0, counts from the end of the string.
     * e.g.: when index=-1 returns last char
     */
    str utf8ptrFromIndex(any s, int64_t index)
    {
        assert(!s.res && s.value.str);

        if (index==0||!s.len|| (index<0 && -index>=s.len)) return s.value.ptr; //first char or before first

        str actual, pastEnd = s.value.ptr + s.len ; //point to last+1 byte
        if (index >= s.len) return pastEnd; //request past last char, same as -1 (return last char)

        if (index<0){  // negative, from end
            actual = pastEnd;
            while(index++){
                actual--;
                while(isUFT8SequenceExtra(*actual)) { //while multi-code sequence
                    actual--;
                    if (actual<=s.value.str) return actual; //if neg index too large
                };
            }
            return actual;
        }

        // >0, from start
        actual = s.value.ptr + 1; //skip first (trivial case index==0 managed above)
        while(TRUE){
            if isUFT8SequenceStart(*actual) {
                if (--index==0) return actual; //reached nt'h codepoint
            }
            if (actual>=pastEnd) return pastEnd; //if index too large
            actual++;
        }
    }

    /**
     * returns a ptr to found string or NULL
     */
    str utf8Find(any source, any searched, str ptr) {
        assert(source.class==String_inx && source.res==0);
        assert(searched.class==String_inx && searched.res==0); //we require a contiguos string here

        if (source.len==0 || searched.len==0) return NULL;
        if (searched.len > source.len) return NULL; //cant find a haystack in a needle

        if (!ptr) ptr=source.value.str; //default start is 0

        str findableEnd = source.value.str + source.len - searched.len;
        //findableEnd points to last valid mempos where searched can be on source

        str sptr = searched.value.str;
        char firstChar=*sptr;

        while(ptr<=findableEnd){
            if(*ptr==firstChar) { //same first char
                while(TRUE) {
                    str nextStart=NULL;
                    str start = ptr;
                    len_t searchedCount = searched.len;
                    sptr=searched.value.ptr;
                    while(--searchedCount) {
                        ptr++;
                        sptr++;
                        if (!nextStart && *ptr==*searched.value.str) nextStart=ptr;
                        if (*ptr!=*sptr) break; //differ
                    };
                    if (!searchedCount) { // match!
                        return start; //found
                    }
                    if (!nextStart) break;
                    //repeat if a new start was found while checking the slice
                    ptr=nextStart;
                };
            }
            else {
                ptr++; //next char
            }
        } //loop search first-char

        return NULL; //not found
    }

    int64_t utf8indexOf(any source, any searched, int64_t fromIndex) {
        _FLATTEN(source); //we require a contiguos string on source
        _FLATTEN(searched); //and searched
        str found=utf8Find(source, searched, utf8ptrFromIndex(source,fromIndex));
        if (!found) return -1;
        return utf8indexFromPtr(source,found);
    }

    int64_t utf8lastIndexOf(any source, any searched, int64_t fromIndex) {

        if (!source.len || !searched.len) return -1;

        len_t count = source.len;

        str ptr = utf8ptrFromIndex(source,fromIndex); //search from here down

        str findableEnd = source.value.str + source.len - searched.len;
        //findableEnd points to last valid mempos where searched can be on source

        if (ptr>findableEnd) return -1;

        char firstChar = *searched.value.str;

        while(ptr>source.value.str){
            if(*ptr==firstChar) { //same first char
                str start = ptr;
                str sptr = searched.value.str;
                len_t searchedCount = searched.len;
                while(--searchedCount) {
                    ptr++;
                    sptr++;
                    if (*ptr!=*sptr) break; //differ
                };
                if (!searchedCount) { // match!
                    return utf8indexFromPtr(source,start); //found
                }
            }
            else {
                    ptr--;
            }
        }
        return -1; //not found
    }

    // as js slice.
    // slice extracts from start up to but *not including* endSlice
    any utf8slice(any s, int64_t start, int64_t end)
    {
        _FLATTEN(s);
        str start_ptr = utf8ptrFromIndex(s, start);
        str end_ptr = utf8ptrFromIndex(s, end);
        if (end_ptr<=start_ptr) return any_EMPTY_STR;
        return any_slice(start_ptr, end_ptr-start_ptr);
    }

