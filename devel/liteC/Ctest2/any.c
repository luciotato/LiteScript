
#include "any.h"
#include <string.h>

    str EMPTY_STR = "";

    const any undefined = {UNDEFINED,.value.uint64=0};
    const any any_0_str = {TYPE_0_STR,.value.uint64=0};

    bool __is(any a,any b){  //js ===
        if (a.constructor!=b.constructor) return false;
        switch(a.constructor){
            case UNDEFINED: case TYPE_NULL: case TYPE_0_STR:
                return true;
            case String:
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


    static char __numberSymbols[] = "0123456789ABCDEF";

    str _int32ToStr(int32_t a){
        const int BUFSZ = 12;
        int radix=10;
        char* buf = alloc(BUFSZ);
        buf[BUFSZ-1]='\0';
        int isNeg;
        if(isNeg=(a<0)){a=-a;};
        int pos = BUFSZ-2;
        while (a!=0 && pos>=1){
            buf[pos--]=__numberSymbols[a%radix];
            a=a/radix;
        };
        if(isNeg)buf[pos--]='-'; //add minus
        while(pos>=0){buf[pos--]=' ';}; //lpad spaces
        return (str)buf;
    }

    str _int64ToStr(int64_t a){
        const int BUFSZ = (20);
        int radix = (10);
        char* buf = alloc(BUFSZ);
        buf[BUFSZ-1]='\0';
        int isNeg;
        if(isNeg=(a<0)){a=-a;};
        int pos = BUFSZ-2;
        while (a!=0 && pos>=1){
            buf[pos--]=__numberSymbols[a%radix];
            a=a/radix;
        };
        if(isNeg)buf[pos--]='-'; //add minus
        while(pos>=0){buf[pos--]=' ';}; //lpad spaces
        return (str)buf;
    }

    str _uint32ToStr(uint32_t a){
        const int BUFSZ = (12);
        int radix = (10);
        char* buf = alloc(BUFSZ);
        buf[BUFSZ-1]='\0';
        int pos = BUFSZ-2;
        while (a!=0 && pos>=1){
            buf[pos--]=__numberSymbols[a%radix];
            a=a/radix;
        };
        while(pos>=0){buf[pos--]=' ';}; //lpad spaces
        return (str)buf;
    }

    str _uint64ToStr(uint64_t a){
        const int BUFSZ = (20);
        int radix = (10);
        char* buf = alloc(BUFSZ);
        buf[BUFSZ-1]='\0';
        int pos = BUFSZ-2;
        while (a!=0 && pos>=1){
            buf[pos--]=__numberSymbols[a%radix];
            a=a/radix;
        };
        while(pos>=0){buf[pos--]=' ';}; //lpad spaces
        return (str)buf;
    }

    str _numberToStr(double number){
        const int BUFSZ=(64);
        char* buf = alloc(BUFSZ);
        sprintf(buf,"%f",number);
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
        char *result = (char*)alloc(bufSize=size+1024);
        memcpy(result,first,size);
        int pos=size-1; //points to '\0'

        str arg;
        while ((arg=va_arg(arguments,str))!= NULL) {
            int arglen = strlen(arg);
            size += arglen;
            if (size>=bufSize){
                result = (char*)realloc(result, bufSize=size+1024);
            }
            memcpy(&result[pos],arg,arglen+1);
            pos+=arglen;
        };
        return (str)realloc(result,size); //cut down to size
    }

