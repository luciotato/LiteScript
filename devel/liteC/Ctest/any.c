
#include "any.h"
#include "exceptions.h"
#include <stdio.h>

    const any undefined = {UNDEFINED,0,.value.uint64=0};
    const any any_EMPTY_STR = {String,0,.value.uint64=0};
    const any EMPTY_ARGS = {Array,0,.value.item=NULL};

    str EMPTY_STR = "";

    #define isChar(s) ((s & 0xC0) != 0x80)

    // returns the number of utf8 code points in the buffer at s
    size_t utf8len(str s)
    {
        size_t len = 0;
        for (; *s; ++s) if isChar(*s) ++len;
        return len;
    }

    // returns the number of utf8 code points in the buffer at s
    size_t utf8indexFromPtr(str s, str ptr)
    {
        size_t inx = -1;
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
                str last=s+len-1; //point to last byte
                for (; last>=s; --last) {
                    if isChar(*last) {
                        if (++index==0) break;
                    }
                }
                return last;
            }
            else { // >0, from start
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

    size_t utf8indexOf(str source, str searched, size_t fromIndex) {
        str s = fromIndex>0? utf8index(source,fromIndex): source;
        str found;
        if ((found=strstr(s,searched)) == NULL) return -1;
        return fromIndex + utf8indexFromPtr(s, found);
    }

    // as js slice.
    // slice extracts from start up to but *not including* endSlice
    str utf8slice(str s, int64_t start, int64_t end)
    {
        str start_ptr = utf8index(s, start);
        str end_ptr = utf8index(s, end);
        size_t byteLen;
        if ((byteLen = end_ptr-start_ptr) <=0) return EMPTY_STR;
        char * result = (char*)mem_alloc(byteLen+1);
        memcpy(result,start_ptr,byteLen);
        result[byteLen]='\0';
        return result;
    }

    any any_str(str s){
        any result={String,0,.value.ptr=NULL};
        size_t lenght;
        if (s!=NULL){
            if (lenght=utf8len(s)) {
                if (lenght>UINT32_MAX) fatal("strlen>UINT32_MAX");
                result.length=(uint32_t)lenght; //len in UTF-8 codepoints
                result.value.str = s;
            }
        }
        return result;
    }

    bool __is(any a,any b){  //js ===
        if (a.constructor!=b.constructor) return false;
        switch(a.constructor){
            case UNDEFINED: case TYPE_NULL:
                return true;
            case String:
                if (a.length!=b.length) return false;
                if (a.value.str==b.value.str) return true;
                return strcmp(a.value.str,b.value.str)==0;
            case TYPE_BOOLEAN:
                return a.value.boolean==b.value.boolean;
            case TYPE_INT32: case TYPE_UINT32: case TYPE_TypeID:
                return a.value.int32==b.value.int32;
            case TYPE_INT64: case TYPE_UINT64:
                return a.value.int64==b.value.int64;
            case Number:
                return a.value.number==b.value.number;
            default:
                return a.value.ptr==b.value.ptr;
        }
    }


    // can be called with any &prop if you know the type
    // example _toStr((anyValue*)&this->column,TYPE_INT);
    /*
    str _anyValuePtr_toStr(anyValue* this, TypeID type){
        switch(type){
            case UNDEFINED:
                return "undefined";
            case TYPE_NULL:
                return "null";
            case TYPE_0_STR:
                return EMPTY_STR;
            case String:
                return this->str;
            case TYPE_BOOLEAN:
                return this->boolean?"true":"false";
            case TYPE_INT32:
                return _int32ToStr(this->int32); //expected: C compiler to optimize tail-call into JMP
            case TYPE_UINT32:
                return _uint32ToStr(this->uint32);
            case TYPE_INT64:
                return _int64ToStr(this->int64);
            case TYPE_UINT64:
                return _uint64ToStr(this->uint64);
            case Number:
                return _numberToStr(this->number);
            case Function: case TYPE_TypeID: // to be js-consistent
                return "function";
            case Error:
                return Error_toString(this->error);
            default:
                return "[object]"; //to be js-consistent
        }
    }
    */

    str anyToStr(any this){
        switch(this.constructor){
            case UNDEFINED:
                return "undefined";
            case TYPE_NULL:
                return "null";
            case String:
                return this.length==0?EMPTY_STR:this.value.str;
            case TYPE_BOOLEAN:
                return this.value.boolean?"true":"false";
            case TYPE_INT32:
                return _int32ToStr(this.value.int32); //expected: C compiler to optimize tail-call into JMP
            case TYPE_UINT32:
                return _uint32ToStr(this.value.uint32);
            case TYPE_INT64:
                return _int64ToStr(this.value.int64);
            case TYPE_UINT64:
                return _uint64ToStr(this.value.uint64);
            case Number:
                return _numberToStr(this.value.number);
            case Function: case TYPE_TypeID: // to be js-consistent
                return "function";
            case Error:
                return __concatToNULL(anyToStr(AS(Error,this)->name),": ",anyToStr(AS(Error,this)->message),NULL);
            default:
                return "[object]"; //to be js-consistent
        }
    }

    int64_t anyToInt64(any this){
        char* endConverted;
        switch(this.constructor){
            case String:
                return this.length==0?0:strtol(this.value.str,&endConverted,10);
            case TYPE_BOOLEAN:
                return this.value.boolean;
            case TYPE_INT32:
                return this.value.int32;
            case TYPE_UINT32:
                return this.value.uint32;
            case TYPE_INT64:
                return this.value.int64;
            case TYPE_UINT64:
                return this.value.uint64;
            case Number:
                return (int64_t)this.value.number;
            /*case Function: case TYPE_TypeID: // to be js-consistent
                throw?
            case Error:
                return Error_toString(this,EMPTY_ARGS);
             */
            default:
                return 0;
            //case UNDEFINED: case TYPE_NULL:
            //    return 0;
        }
    }

    double anyToNumber(any this){
        char* endConverted;
        switch(this.constructor){
            case String:
                return this.length==0?0:strtol(this.value.str,&endConverted,10);
            case TYPE_BOOLEAN:
                return this.value.boolean;
            case TYPE_INT32:
                return this.value.int32;
            case TYPE_UINT32:
                return this.value.uint32;
            case TYPE_INT64:
                return this.value.int64;
            case TYPE_UINT64:
                return this.value.uint64;
            case Number:
                return this.value.number;
            /*case Function: case TYPE_TypeID: // to be js-consistent
                throw?
            case Error:
                return Error_toString(this,EMPTY_ARGS);
             */
            default:
                return 0;
            //case UNDEFINED: case TYPE_NULL:
            //    return 0;
        }
    }

    static char __numberSymbols[] = "0123456789ABCDEF";

    str _int32ToStr(int32_t a){
        const int BUFSZ = 12;
        int radix=10;
        char* buf = mem_alloc(BUFSZ);
        int pos;
        buf[pos=BUFSZ-1]='\0';
        int isNeg;
        if(isNeg=(a<0)){a=-a;};
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(isNeg)buf[--pos]='-'; //add minus

        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //right aling, lpad spaces

        return (str)buf;
    }

    str _int64ToStr(int64_t a){
        const int BUFSZ = 20;
        int radix = 10;
        char* buf = mem_alloc(BUFSZ);
        int pos;
        buf[pos=BUFSZ-1]='\0';
        int isNeg;
        if(isNeg=(a<0)){a=-a;};
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(isNeg)buf[--pos]='-'; //add minus

        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

    str _uint32ToStr(uint32_t a){
        const int BUFSZ = 12;
        int radix = 10;
        char* buf = mem_alloc(BUFSZ);
        int pos;
        buf[pos=BUFSZ-1]='\0';
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

    str _uint64ToStr(uint64_t a){
        const int BUFSZ = 20;
        int radix = 10;
        char* buf = mem_alloc(BUFSZ);
        int pos;
        buf[pos=BUFSZ-1]='\0';
        do buf[--pos]=__numberSymbols[a%radix]; while(a=a/radix);
        if(pos)memcpy(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

    str _numberToStr(double number){
        const int BUFSZ=64;
        char* buf = mem_alloc(BUFSZ);
        sprintf(buf,"%g",number);
        return (str)buf;
    }



    str __concatToNULL(str first,...) {

        if (first==NULL){
           return EMPTY_STR; //if no args
        };

        va_list arguments;
        va_start (arguments, first);

        size_t size=strlen(first)+1;
        size_t bufSize;
        char *result = (char*)mem_alloc(bufSize=size+1024);
        memcpy(result,first,size);
        int pos=size-1; //points to '\0'

        str arg;
        while ((arg=va_arg(arguments,str))!= NULL) {
            int arglen = strlen(arg);
            size += arglen;
            if (size>=bufSize){
                result = (char*)mem_realloc(result, bufSize=size+1024);
            }
            memcpy(&result[pos],arg,arglen+1);
            pos+=arglen;
        };
        return (str)mem_realloc(result,size); //cut down to size
    }

