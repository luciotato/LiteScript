
#include "any.h"
#include "exceptions.h"
#include <stdio.h>

    str EMPTY_STR = "";

    // convert to Number
    any Number(DEFAULT_ARGUMENTS){
        assert(argc>=1);
        return any_number(anyToNumber(arguments[0]));
    }

    any _newStrSize(size_t len){
        return (any){String_TYPEID,.value.ptr = mem_alloc(len)};
    }

    any _newStr(str src){
        str source= src;
        size_t len = strlen(source);
        any a= _newStrSize(len+1);
        memcpy(a.value.ptr, source, len+1);
        return a;
    }

    any _strSlice(str src, len_t start, len_t end){
        return (any){String_TYPEID, .value.str = utf8slice(src,start,end)};
    }

    int anyToBool(any a) {return a.value.int64!=0;}
    int falsey(any a) {return a.value.int64==0;}

    int RegExp_test(any a, str pattern) {
        if (a.type!=String_TYPEID || !a.value.str) return false;

        any s;
        if (pattern[0]=='/') {
            s=_strSlice(pattern,1,-1);
        }
        else {
            s=_newStr(pattern);
        }
        return strstr(a.value.str, s.value.ptr)!=NULL;
    }

//------------
// utf-8 string

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

    size_t utf8indexOf(str source, str searched, size_t fromIndex) {
        str s = utf8index(source,fromIndex);
        str found;
        if ((found=strstr(s,searched)) == NULL) return -1;
        return fromIndex + utf8indexFromPtr(s, found);
    }

    size_t utf8lastIndexOf(str source, str searched, size_t fromIndex) {
        size_t index,lastIndex=-1;
        while (index=utf8indexOf(source,searched,index) !=-1) lastIndex=index, index++;
        return lastIndex;
    }

    // as js slice.
    // slice extracts from start up to but *not including* endSlice
    str utf8slice(str s, int64_t start, int64_t end)
    {
        str start_ptr = utf8index(s, start);
        str end_ptr = utf8index(s, end);
        if (end_ptr<start_ptr) return EMPTY_STR;
        size_t byteLen;
        char * result = (char*)mem_alloc((byteLen=end_ptr-start_ptr)+1);
        memcpy(result,start_ptr,byteLen);
        result[byteLen]='\0';
        return result;
    }

    size_t length(any this){
        switch(this.type){
            case Array_TYPEID:
                return this.value.arr->length;
            case String_TYPEID:
                return utf8len(this.value.ptr);
            case Buffer_TYPEID:
                return ((Buffer_ptr)this.value.ptr)->used;
            default:
                return 0;
        }

    }

    bool __is(any a,any b){  //js ===
        if (a.type!=b.type) return false;
        switch(a.type){
            case UNDEFINED: case TYPE_NULL: case MISSING:
                return true;
            case String_TYPEID:
                if (a.value.str==b.value.str) return true;
                return strcmp(a.value.str,b.value.str)==0;
            case TYPE_BOOL: case TYPE_INT32: case TYPE_UINT32: case TYPE_TypeID:
                return a.value.int32==b.value.int32;
            case TYPE_INT64: case TYPE_UINT64:
                return a.value.int64==b.value.int64;
            case Number_TYPEID:
                return a.value.number==b.value.number;
            default:
                return a.value.ptr==b.value.ptr;
        }
    }

    any __or (any a,any b) {
        return a.value.uint64?a:b;
    };

    str anyToStr(any this){
        switch(this.type){
            case MISSING:
                return "undefined*MISSING*";
            case UNDEFINED:
                return "undefined";
            case TYPE_NULL:
                return "null";
            case String_TYPEID:
                return this.value.str;
            case TYPE_BOOL:
                return this.value.int32?"true":"false";
            case TYPE_INT32:
                return _int32ToStr(this.value.int32); //expected: C compiler to optimize tail-call into JMP
            case TYPE_UINT32:
                return _uint32ToStr(this.value.uint32);
            case TYPE_INT64:
                return _int64ToStr(this.value.int64);
            case TYPE_UINT64:
                return _uint64ToStr(this.value.uint64);
            case Number_TYPEID:
                return _numberToStr(this.value.number);
            case Error_TYPEID:
                return __concatToNULL(anyToStr(((Error_ptr)this.value.ptr)->name),": ",anyToStr(((Error_ptr)this.value.ptr)->message),NULL);
            case Function_TYPEID: case TYPE_TypeID: // to be js-consistent
                return "function";
            case Array_TYPEID:
                return "[object Array]"; // to be js-consistent
            default:
                return "[object]"; //to be js-consistent
        }
    }

    int64_t anyToInt64(any this){
        char* endConverted;
        switch(this.type){
            case String_TYPEID:
                return strtol(this.value.str,&endConverted,10);
            case TYPE_BOOL: case TYPE_INT32:
                return this.value.int32;
            case TYPE_UINT32:
                return this.value.uint32;
            case TYPE_INT64:
                return this.value.int64;
            case TYPE_UINT64:
                return this.value.uint64;
            case Number_TYPEID:
                return (int64_t)this.value.number;
            default:
                return 0;
        }
    }

    double anyToNumber(any this){
        char* endConverted;
        switch(this.type){
            case String_TYPEID:
                return strtol(this.value.str,&endConverted,10);
            case TYPE_BOOL: case TYPE_INT32:
                return this.value.int32;
            case TYPE_UINT32:
                return this.value.uint32;
            case TYPE_INT64:
                return this.value.int64;
            case TYPE_UINT64:
                return this.value.uint64;
            case Number_TYPEID:
                return this.value.number;
            default:
                return 0;
        }
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

    str _numberToStr(double number){
        const int32_t BUFSZ=64;
        char* buf = mem_alloc(BUFSZ);
        sprintf(buf,"%f",number);
        //clear extra zeroes
        size_t n;
        for(n=strlen(buf)-1; n>0 && buf[n]=='0'; n--) buf[n]='\0';
        if(buf[n]=='.') buf[n]='\0';
        return (str)buf;
    }

    Buffer_s _newBuffer(){
        return (Buffer_s){.used=0, .ptr=mem_alloc(1024)};
    }

    void _Buffer_add(Buffer_s *dbuf, str ptr, size_t addSize){
        size_t allocd = GC_size(dbuf->ptr);
        if (dbuf->used + addSize > allocd){
            allocd=TRUNCkb(allocd + addSize);
            if (allocd>UINT32_MAX) fail_with("Buffer allocd>UINT32_MAX");
            dbuf->ptr = mem_realloc(dbuf->ptr, allocd);
        }
        memcpy(dbuf->ptr + dbuf->used, ptr, addSize);
        dbuf->used += addSize;
    }

    void _Buffer_addStr(Buffer_s *dbuf, str s){
        if(s) _Buffer_add(dbuf,s,strlen(s));
    }

    void _Buffer_add0(Buffer_s dbuf){
        dbuf.ptr[dbuf.used]='\0';
    }

    str __concatToNULL(str first,...) {

        if (first==NULL){
           return EMPTY_STR; //if no args
        };

        va_list arguments;
        va_start (arguments, first);

        Buffer_s buf = _newBuffer();
        _Buffer_addStr(&buf,first);

        str arg;
        while ((arg=va_arg(arguments,str))!= NULL) {
            _Buffer_addStr(&buf,arg);
        };
        _Buffer_add0(buf);
        return (str)buf.ptr;
    }

