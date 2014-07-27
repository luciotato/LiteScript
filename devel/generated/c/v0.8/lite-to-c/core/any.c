
#include "any.h"

    // convert ints to str

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

        if(pos)memmove(buf,buf+pos,BUFSZ-pos); //left aling
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

        if(pos)memmove(buf,buf+pos,BUFSZ-pos); //left aling
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
        if(pos)memmove(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

    str _uint64ToStr(uint64_t a){ //, int decPlaces){
        const int32_t BUFSZ = 32;
        int32_t radix = 10;
        char* buf = mem_alloc(BUFSZ);
        int32_t pos;
        buf[pos=BUFSZ-1]='\0';
        do {
            buf[--pos]=__numberSymbols[a%radix];
            //if (--decPlaces==0) buf[--pos]='.';
        } while(a=a/radix);

        if(pos)memmove(buf,buf+pos,BUFSZ-pos); //left aling
        //while(pos>=0){buf[pos--]=' ';}; //lpad spaces

        return (str)buf;
    }

