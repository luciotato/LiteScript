
    #include "LiteC-core.h"
    #include "fs_native.h"
    #include <sys/stat.h>

    any fsc_stat(any this, len_t argc, any* arguments){
        assert(argc>=2);
        assert(arguments[0].type == String_TYPEID);
        str filename = arguments[0].value.str;

        struct stat st;
        stat(filename, &st);

        any result = new(Array_TYPEID,0,NULL);
        Array_push(result,1,(any_arr){any_number(st.st_size)});
        return result;
    }

    any fsc_readFile(any this, len_t argc, any* arguments){
        assert(argc>=2);
        assert(arguments[0].type == String_TYPEID);
        str filename = arguments[0].value.str;
        return undefined;
    }

    any fsc_writeFile(any this, len_t argc, any* arguments){
        assert(argc>=2);
        assert(arguments[0].type == String_TYPEID);
        str filename = arguments[0].value.str;
        return undefined;
    }
