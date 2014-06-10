#include "util.h"
#include "stddef.h"
#include "stdarg.h"
#include "stdio.h"
#include "exceptions.h"

str EMPTY = "";

void fatal(char * msg) {
    fprintf(stderr, msg);
    abort();
}

void* alloc(size_t size) {
    void* result = GC_malloc(size);
    if (!result) fatal("virtual memory exhausted");
    return result;
}

void* realloc(void* ptr, size_t size) {
    void* result = GC_realloc(ptr, size);
    if (!result) fatal("virtual memory exhausted");
    return result;
}

str __concatToNULL(str first,...) {


    va_list arguments;
    va_start (arguments, first);

    str arg;
    if ((arg=va_arg(arguments,str))== NULL){
        return EMPTY; //if no args
    };

    size_t size=strlen(arg)+1;
    size_t bufSize;
    char *result = (char*)alloc(bufSize=size+1024);
    memcpy(result,arg,size);
    int pos=size-1; //points to '\0'

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

