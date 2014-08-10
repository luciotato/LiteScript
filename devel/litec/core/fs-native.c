/*
 *  fs.c
 * partial emulation of node.js 'fs' core lib
 * fs.h gets generated based on fs.interface.lite.md
 *
 */

    // fs.h gets generated based on fs.interface.lite.md
    #include "fs-native.h"
    #include "LiteC-core.h"
    #include <sys/stat.h>
    #include <errno.h>
    #include <unistd.h>
    #include <sys/types.h>

    //class fs.Stat
    any fs_Stat; //class Fs_Stat

    #define THIS ((fs_Stat_s*)this.value.ptr)

    static char fnameTempBuffer[1024];

    /** fs.Stat(filename)
     */
    void fs_Stat__init(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,fs_Stat));
        assert(CLASSES[this.class].instanceSize==sizeof(fs_Stat_s));
        assert_arg(String);

        struct stat st;
        int result;
        if (result=stat(_tempCString(arguments[0]), &st) == -1){
            var errMsg=_concatAny(3,any_CStr(strerror(errno)),any_COLON,arguments[0]);
            var err=new(Error,1,(any_arr){errMsg});
            str errCode;
            switch(errno){
                case EPERM: errCode="EPERM";break;
                case ENOENT: errCode="ENOENT";break;
                case EACCES: errCode="EACCES";break;
                case EEXIST: errCode="EEXIST";break;
                case ENOTDIR: errCode="ENOTDIR";break;
                case EISDIR: errCode="EISDIR";break;
                deafult:errCode="UNK";
            }
            PROP(code_,err)=any_CStr(errCode);
            throw(err);
        }
        THIS->size = any_number(st.st_size);
        THIS->mtime= _newDate(st.st_mtime);
        THIS->mode= any_number(st.st_mode);
    };

    any fs_Stat_isDirectory(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,fs_Stat));
        return S_ISDIR((int)THIS->mode.value.number)?true:false;
    }
    any fs_Stat_isFile(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,fs_Stat));
        return S_ISDIR((int)THIS->mode.value.number)?false:true;
    }

    //namespace fs

    any fs_statSync(DEFAULT_ARGUMENTS){
        assert_arg(String);
        return new(fs_Stat,1,(any_arr){arguments[0]});
    }

    any fs_unlinkSync( DEFAULT_ARGUMENTS ) {
        assert_arg(String);
        if (unlink(_tempCString(arguments[0])) == -1){
            fail_with(strerror(errno));
        }
    };

    /**
     * fs_mkdirSync ( dirname:string, optional mode:number )
     */
    any fs_mkdirSync( DEFAULT_ARGUMENTS ) {
        assert_args({.req=1,.max=2,.control=2},String,Number);
        mode_t mode = 0;
        if (argc>1) mode=arguments[1].value.number;
        if (!mode) mode=0777;
        if (mkdir(_tempCString(arguments[0]),mode) == -1){
            fail_with(strerror(errno));
        }
    }

    #define STAT ((fs_Stat_s*)stat.value.ptr)

    any fs_existsSync( DEFAULT_ARGUMENTS ) {
        try {
            var stat=fs_statSync(this,argc,arguments);
            {e4c_exitTry(1);return true;}
        } catch(err){
            {e4c_exitTry(1);return false;}
        }
    };

    any fs_readFileSync( any this, len_t argc, any *arguments ) {
        any stat=fs_statSync(this,1,arguments);
        if (STAT->size.value.number > UINT32_MAX) {
            throw(_newErr(_concatAny(3
                    ,any_LTR("at fs_readFileSync('")
                    ,arguments[0]
                    ,any_LTR("'). File too large, max size is UINT32_MAX"))));
        }

        len_t bytes = STAT->size.value.number;
        //alloc mem
        char* buffer=mem_alloc(bytes+1);
        //open file
        FILE* file;
        if (!(file=fopen(_tempCString(arguments[0]),"rb"))){
                throw(_newErr(_concatAny(3
                    ,any_LTR("at fs_readFileSync('")
                    ,arguments[0]
                    ,any_CStr(strerror(errno)))));
        }
        //read contents
        fread(buffer, 1, bytes, file);
        //close
        fclose(file);

        //return buffer as string
        buffer[bytes]=0; //ending 0
        return any_slice(buffer,bytes);
    }

    any fs_writeFileSync(DEFAULT_ARGUMENTS) {
        assert_args( {.req=2,.max=2,.control=2},String,String);

        //open file
        FILE *file;
        if (!(file=fopen(_tempCString(arguments[0]),"w"))) {
            throw(_newErr(_concatAny(4
                    ,any_LTR("at fs_writeFileSync('")
                    ,arguments[0]
                    ,any_LTR("'). ")
                    ,any_CStr(strerror(errno)))));
        }
        //write contents
        _outFile(arguments[1],file);
        //close
        fclose(file);

    }

    //method openSync(filename:string, mode:string)
    any fs_openSync(DEFAULT_ARGUMENTS) {
        assert_args({.req=2,.max=2,.control=2},String,String);
        any filename = arguments[0];

        char mode[20];
        _toCStringCompatBuf(arguments[1],mode,sizeof(mode));


        //open file
        FILE* file;
        if (!(file=fopen(_tempCString(filename),mode))) {
            throw(_newErr(_concatAny(6
                    ,any_LTR("at fs_openSync('")
                    ,arguments[0]
                    ,any_LTR("','")
                    ,arguments[1]
                    ,any_LTR("' ")
                    ,any_CStr(strerror(errno)))));
        }

        return (any){FileDescriptor_inx,.res=0,.value.ptr=file};
    }

    any fs_closeSync(DEFAULT_ARGUMENTS) {
        assert_arg(FileDescriptor);
        FILE* fd = (FILE*) arguments[0].value.ptr;
        if (fclose(fd)!=0) {
            throw(_newErr(_concatAny(2
                    ,any_LTR("at fs_close ")
                    ,any_CStr(strerror(errno)))));
        }
    }

    //method writeSync(fd, buf, start, count)
    any fs_writeSync(DEFAULT_ARGUMENTS) {
        assert_args({.req=2,.max=4,.control=4},FileDescriptor,Undefined,Number,Number);
        FILE* fd = (FILE*) arguments[0].value.ptr;

        if (arguments[1].class==Buffer_inx){
            Buffer_s* buf = arguments[1].value.ptr;
            len_t start = argc>2? arguments[2].value.number:0;
            len_t size = argc>3? arguments[3].value.number: buf->used-start;
            //write contents
            fwrite(buf->ptr+start, 1,size, fd);
        }
        else {
            _outFile(arguments[1], fd);
        }

    }

    //native required initialization
    void fs__nativeInit(){
    }

