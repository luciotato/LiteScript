
    #include "LiteC-core.h"

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

    any fsc_readfile(any this, len_t argc, any* arguments){
        assert(argc>=2);
        assert(arguments[0].type == String_TYPEID);
        str filename = arguments[0].value.str;
    }

    any fsc_writefile(any this, len_t argc, any* arguments){
        assert(argc>=2);
        assert(arguments[0].type == String_TYPEID);
        str filename = arguments[0].value.str;
    }
