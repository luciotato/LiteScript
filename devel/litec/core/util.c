#include "util.h"
#include "stddef.h"
#include "stdarg.h"
#include "stdio.h"
#include "exceptions.h"

typedef uint64_t* u64ptr;

    static unsigned char our_memory[600 * 1024 * 1024]; //reserve 1 MB for malloc
    static size_t next_index = 0;

    void *smalloc(size_t sz)
    {
        void *mem;

        sz = sz  + 16;
        /*if (sz<32) sz=32;
        else if (sz<64) sz=64;
        else if (sz<128) sz=128;
        else sz=(sz+255)>>8<<8;
         */

        if(sizeof our_memory - next_index < sz)
            return NULL;

        mem = &our_memory[next_index];
        next_index += sz;

        *(u64ptr)mem=0xFE0FAABC;
        *((u64ptr)(mem+8))=sz;

        return mem+16;
    }

    void* srealloc(void *mem, size_t newsize)
    {
        assert(*(u64ptr)(mem-16) == 0xFE0FAABC);
        uint64_t oldSize= *(u64ptr)(mem-8);

        //if (newsize<oldSize) {
        //    return mem;
        //}

        void* newmem = smalloc(newsize);
        memcpy(newmem,mem,oldSize);
        return newmem;
    }

    void sfree(void *mem)
    {
       //we cheat, and don't free anything.
    }

    void* mem_alloc(size_t size) {
        void* result = MALLOC(size);
        if (!result) fatal("virtual memory exhausted");
        //memset(result,0,size);
        return result;
    }

    void* mem_realloc(void* ptr, size_t size) {
        void* result = REALLOC(ptr, size);
        if (!result) fatal("virtual memory exhausted");
        return result;
    }

