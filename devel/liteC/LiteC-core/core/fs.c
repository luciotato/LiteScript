
/*
 *  fs.c
 * partial emulation of node.js 'fs' core lib
 *
 */

    #include "fs.h"
    #include <sys/stat.h>

    any fs; //singleton fs
    any Fs_Stat; //class Fs_Stat

    any fs; //singleton fs
    any Fs_Stat; //class Fs_Stat

    // here the host send the singleton or the registered class from the .interface.lite.md
    void fs_lib_init(any singleton){
        fs = singleton;
        Fs_Stat = LiteC_getProperty(fs,LiteC_getSymbol("Fs_Stat"));
    }

    #define THIS ((Fs_Stat_s*)this.value.ptr)

    void Fs_Stat__init(DEFAULT_ARGUMENTS){
        assert(this.class==Fs_Stat.value.class);
        //assert(this.class->instanceSize==sizeof(struct Fs_Stats_s));
        assert(argc==1);
        assert(arguments[0].class == &String_CLASSINFO);

        struct stat st;
        int result;
        switch(result=stat(arguments[0].value.str, &st)) {
            case 2:  THIS->errCode =any_str("ENOENT"); break;
            case 13: THIS->errCode =any_str("EACCESS"); break;
            case 20: THIS->errCode =any_str("ENOTDIR"); break;
            case 21: THIS->errCode =any_str("EISDIR"); break;
            default: THIS->errCode =_concatAny(2,(any_arr){any_str("ERR:"),any_number(result)});
        };
        THIS->errNum = any_number(result);
        if (result==0){
            THIS->exists = true;
            THIS->size = any_number(st.st_size);
            THIS->mtime_secs = any_number(st.st_atime);
        }
    };

    any Fs_statSync(DEFAULT_ARGUMENTS){
        assert(argc==1);
        assert(arguments[0].class == &String_CLASSINFO);
        return new(Fs_Stat,1,(any_arr){arguments[0]});
    }

    #define STAT ((Fs_Stat_s*)stat.value.ptr)

    any Fs_existsSync( DEFAULT_ARGUMENTS ) {
        var stat=Fs_statSync(this,argc,arguments);
        return STAT->exists;
    };

    any Fs_readFileSync( any this, len_t argc, any *arguments ) {
        any stat=Fs_statSync(this,argc,arguments);
        if (STAT->exists.value.number==0){
            throw(_concatAny(4,(any_arr){
                any_str("file: '"), arguments[0],
                any_str("' Err Code:"), STAT->errCode}));
        }
        str filename = arguments[0].value.str;
        if (STAT->size.value.number > UINT32_MAX) {
            throw(_concatAny(3, (any_arr){
                any_str("file: '"), arguments[0], any_str("' file too large, max size is MAX_UINT32")
            }));
        }

        len_t bytes = STAT->size.value.number;
        //alloc mem
        str buffer=mem_alloc(bytes+1);
        //open file
        FILE *file = fopen(filename,"r");
        //read contents
        fread(buffer, 1, STAT->size.value.number, file);
        //close
        fclose(file);

        //return buffer as string
        buffer[bytes]=0; //ending 0
        return any_str(buffer);
    }

    any Fs_writeFileSync(DEFAULT_ARGUMENTS) {
        assert(argc==2);
        assert(arguments[0].class == &String_CLASSINFO);
        assert(arguments[1].class == &String_CLASSINFO);
        str filename = arguments[0].value.str;
        str contents = arguments[1].value.str;

        size_t bytes = strlen(contents);
        //open file
        FILE *file = fopen(filename,"w");
        //write contents
        fwrite(contents, 1, bytes, file);
        //close
        fclose(file);

    }

