#include "util.h"
#include "stddef.h"
#include "stdarg.h"
#include "stdio.h"
#include "exceptions.h"

    void* mem_alloc(size_t size) {
        void* result = GC_malloc(size);
        if (!result) fatal("virtual memory exhausted");
        return result;
    }

    void* mem_realloc(void* ptr, size_t size) {
        void* result = GC_realloc(ptr, size);
        if (!result) fatal("virtual memory exhausted");
        return result;
    }

