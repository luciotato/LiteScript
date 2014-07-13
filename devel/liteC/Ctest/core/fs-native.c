/*
 *  fs.c
 * partial emulation of node.js 'fs' core lib
 * fs.h gets generated based on fs.interface.lite.md
 *
 */

    // fs.h gets generated based on fs.interface.lite.md
    #include "../generated/C_global_import/fs.h"
    #include "LiteC-core.h"
    #include <sys/stat.h>
    #include <errno.h>
    #include <unistd.h>
    #include <sys/types.h>

    //class fs.Stat
    any fs_Stat; //class Fs_Stat

    #define THIS ((fs_Stat_s*)this.value.ptr)

    void fs_Stat__init(DEFAULT_ARGUMENTS){
        assert(this.class==fs_Stat.value.class);
        assert(this.class->instanceSize==sizeof(fs_Stat_s));
        assert_args( this,argc,arguments, 1,1,&String_CLASSINFO);

        struct stat st;
        int result;
        if (result=stat(arguments[0].value.str, &st) == -1){
            fail_with(strerror(errno));
        }
        THIS->size = any_number(st.st_size);
        THIS->mtime= _newDate(st.st_mtime);
        THIS->mode= any_number(st.st_mode);
    };

    any fs_Stat_isDirectory(DEFAULT_ARGUMENTS){
        assert(this.class==fs_Stat.value.class);
        return S_ISDIR((int)THIS->mode.value.number)?true:false;
    }
    any fs_Stat_isFile(DEFAULT_ARGUMENTS){
        assert(this.class==fs_Stat.value.class);
        return S_ISDIR((int)THIS->mode.value.number)?false:true;
    }

    //namespace fs

    any fs_statSync(DEFAULT_ARGUMENTS){
        assert_args( this,argc,arguments, 1,1,&String_CLASSINFO);
        return new(fs_Stat,1,(any_arr){arguments[0]});
    }

    any fs_unlinkSync( DEFAULT_ARGUMENTS ) {
        assert_args( this,argc,arguments, 1,1,&String_CLASSINFO);
        if (unlink(arguments[0].value.str) == -1){
            fail_with(strerror(errno));
        }
    };

    any fs_mkdirSync( DEFAULT_ARGUMENTS ) {
        assert_args( this,argc,arguments,1,2,&String_CLASSINFO,&Number_CLASSINFO);
        mode_t mode = 0;
        if (argc>1) mode=arguments[1].value.number;
        if (!mode) mode=0x777;
        if (mkdir(arguments[0].value.str,mode) == -1){
            fail_with(strerror(errno));
        }
    }

    #define STAT ((fs_Stat_s*)stat.value.ptr)

    any fs_existsSync( DEFAULT_ARGUMENTS ) {
        try {
            var stat=fs_statSync(this,argc,arguments);
            return true;
        } catch(err){
            return false;
        }
    };

    any fs_readFileSync( any this, len_t argc, any *arguments ) {
        any stat=fs_statSync(this,argc,arguments);
        str filename = arguments[0].value.str;
        if (STAT->size.value.number > UINT32_MAX) fail_with(_concatToNULL("at fs_readFileSync('",filename,"'). File too large, max size is MAX_UINT32",NULL));

        len_t bytes = STAT->size.value.number;
        //alloc mem
        str buffer=mem_alloc(bytes+1);
        //open file
        FILE* file;
        if (!(file=fopen(filename,"rb"))) fail_with(_concatToNULL("at fs_readFileSync('",filename,"'). ", strerror(errno),NULL));
        //read contents
        fread(buffer, 1, STAT->size.value.number, file);
        //close
        fclose(file);

        //return buffer as string
        buffer[bytes]=0; //ending 0
        return any_str(buffer);
    }

    any fs_writeFileSync(DEFAULT_ARGUMENTS) {
        assert_args( this,argc,arguments, 2,2,&String_CLASSINFO,&String_CLASSINFO);
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

    //native required initialization
    void fs__nativeInit(){
    }
