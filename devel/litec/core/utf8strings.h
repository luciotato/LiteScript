/*
 ----------------------------
 uft8strings.h
 ----------------------------
 UTF8 String helper functions
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

#ifndef UTF8STRINGS_H
#define	UTF8STRINGS_H

#ifdef	__cplusplus
extern "C" {
#endif

    #define isUFT8SequenceStart(s) ((s & 0xC0) != 0x80)
    #define isUFT8SequenceExtra(s) ((s & 0xC0) == 0x80)
    // bytes 0xxxxxxx (<0x80) are sequence "start" and "end" - ASCII chars 0-127
    // bytes 11xxxxxx (0xC0) are multibyte sequence start
    // bytes 10xxxxxx (0x80) are sequence continuations

    //utf-8 strings
    extern len_t utf8len(any s);
    extern int64_t utf8indexFromPtr(any s, str ptr);
    extern str utf8ptrFromIndex(any s, int64_t index);
    extern int64_t utf8indexOf(any source, any searched, int64_t fromIndex);
    extern int64_t utf8lastIndexOf(any source, any searched, int64_t fromIndex);
    extern any utf8slice(any s, int64_t startPos, int64_t endPos);

    extern str utf8Find(any source, any searched, str ptr);

    // interate over concatedSlices and simpleStrings
    typedef struct IteratorCursor_s {
        any origin;
        str str;
        len_t charCount;
        len_t sliceCount;
        ConcatdItem_ptr slicePtr;
    } IteratorCursor_s;

    typedef IteratorCursor_s * IteratorCursor_ptr;


#ifdef	__cplusplus
}
#endif

#endif	//#ifndef _H

