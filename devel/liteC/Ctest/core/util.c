#include "util.h"
#include "stddef.h"
#include "stdarg.h"
#include "stdio.h"
#include "exceptions.h"

    void* mem_alloc(size_t size) {  
        void* result = MALLOC(size);
        if (!result) fatal("virtual memory exhausted");
        memset(result,0,size);
        return result;
    }

    void* mem_realloc(void* ptr, size_t size) {
        void* result = REALLOC(ptr, size);
        if (!result) fatal("virtual memory exhausted");
        return result;
    }

