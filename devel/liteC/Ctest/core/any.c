
#include "any.h"
#include "exceptions.h"
#include <stdio.h>

    str EMPTY_STR = "";

//------------
// utf-8 string

    #define isChar(s) ((s & 0xC0) != 0x80)

    // returns the number of utf8 code points in the buffer at s
    len_t utf8len(str s)
    {
        size_t len = 0;
        for (; *s; ++s) if isChar(*s) ++len;
        return len;
    }

    // returns the index of a given position in the string
    int64_t utf8indexFromPtr(str s, str ptr)
    {
        assert(ptr>=s);
        int64_t inx = -1;
        for (; *s && s<=ptr; ++s) if isChar(*s) ++inx;
        return inx;
    }

    // returns a pointer to the zero-based index'th utf8 codepoint in the buffer at s
    // if index>=len, returns a pointer to the '\0'
    // if pos<0, counts from the end of the string
    str utf8index(str s, int64_t index)
    {
        if (index && s){
            if (index<0){  // negative, from end
                size_t len=strlen(s);
                if (!len) return s;
                str last = s+len-1; //point to last byte
                for (; last>=s; --last) {
                    if isChar(*last) {
                        if (++index==0) break;
                    }
                }
                return last;
            }
            else { // >0, from start
                if (index==LLONG_MAX) return s+strlen(s);
                s++; // index is at least 1, so it's not the first char, s[0]
                for (; *s; ++s) {
                    if isChar(*s) {
                        if (--index==0) break;
                    }

                }
            }
        }
        return s;
    }

    int64_t utf8indexOf(str source, str searched, int64_t fromIndex) {
        str s = utf8index(source,fromIndex);
        str found;
        if ((found=strstr(s,searched)) == NULL) return -1;
        return fromIndex + utf8indexFromPtr(s, found);
    }

    int64_t utf8lastIndexOf(str source, str searched, int64_t fromIndex) {
        int64_t index, lastIndex=-1;
        while (index=utf8indexOf(source,searched,index) !=-1) lastIndex=index, index++;
        return lastIndex;
    }

    // as js slice.
    // slice extracts from start up to but *not including* endSlice
    str utf8slice(str s, int64_t start, int64_t end)
    {
        str start_ptr = utf8index(s, start);
        str end_ptr = utf8index(s, end);
        if (end_ptr<=start_ptr) return EMPTY_STR;
        size_t byteLen;
        char * result = (char*)mem_alloc((byteLen=end_ptr-start_ptr)+1);
        memcpy(result,start_ptr,byteLen);
        result[byteLen]='\0';
        return result;
    }

    str _byteslice(str src, int64_t start, int64_t end){
        int64_t len=strlen(src);
        if (start<0) {
            if(start+=len < 0) return EMPTY_STR;
        }
        else if (start>len) {
            start=len;
        }

        if (end<0){
           if(end+=len <= 0) return EMPTY_STR;
        } if (end>len) {
            end=len;
        }

        int64_t newLen;
        if (newLen=end-start <=0) return EMPTY_STR;

        str result=mem_alloc(newLen+1);
        memcpy(result, src+start, newLen);
        result[newLen]='\0';
        return result;
    }

    static char __numberSymbols[] = "0123456789ABCDEF";

    str _int32ToStr(int32_t a){
        const int32_t BUFSZ = 16;
        int32_t radix=10;
        char* buf = mem_alloc(BUFSZ);
        int32_t pos;
        buf[pos=BUFSZ-1]='\0';
        int32_t isNeg;
        if(isNeg=(a<0)){a=-a;};
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(isNeg)buf[--pos]='-'; //add minus

        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //right aling, lpad spaces

        return (str)buf;
    }

    str _int64ToStr(int64_t a){
        const int32_t BUFSZ = 32;
        int32_t radix = 10;
        char* buf = mem_alloc(BUFSZ);
        int32_t pos;
        buf[pos=BUFSZ-1]='\0';
        int32_t isNeg;
        if(isNeg=(a<0)){a=-a;};
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(isNeg)buf[--pos]='-'; //add minus

        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

    str _uint32ToStr(uint32_t a){
        const int32_t BUFSZ = 16;
        int32_t radix = 10;
        char* buf = mem_alloc(BUFSZ);
        int32_t pos;
        buf[pos=BUFSZ-1]='\0';
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

    str _uint64ToStr(uint64_t a){
        const int32_t BUFSZ = 32;
        int32_t radix = 10;
        char* buf = mem_alloc(BUFSZ);
        int32_t pos;
        buf[pos=BUFSZ-1]='\0';
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

