#include "fs.h"
//-------------------------
//Module fs - INTERFACE
//-------------------------
#include "fs.c.extra"
    //-------------------------
    //NAMESPACE fs
    //-------------------------
        //-----------------------
        // Class fs_Stat: static list of METHODS(verbs) and PROPS(things)
        //-----------------------
        
        static _methodInfoArr fs_Stat_METHODS = {
          { isDirectory_, fs_Stat_isDirectory },
          { isFile_, fs_Stat_isFile },
        
        {0,0}}; //method jmp table initializer end mark
        
        static propIndex_t fs_Stat_PROPS[] = {
        size_
    , mtime_
    , mode_
    };
        
        

//--------------
        // fs_Stat
        any fs_Stat; //Class fs_Stat

    //public namespace fs

        //method existsSync(filename:string)

        //method readFileSync(filename) returns string
        //method writeFileSync(filename) 

        //method statSync(filename:string)
        //method unlinkSync(filename:string)
        //method mkdirSync(path:string, mode)

        //method openSync(filename:string, mode:string)
        //method writeSync(fd, buf)
        //method closeSync(fd)

        //class Stat 
            //properties
                //size : number
                //mtime : Date
                //mode: number
            ;

            //method isDirectory returns boolean
            
            //method isFile returns boolean
            
        
        
        
        
        
        
        
        
        
    
    //------------------
    void fs__namespaceInit(void){
            fs_Stat =_newClass("fs_Stat", fs_Stat__init, sizeof(struct fs_Stat_s), Object);
            _declareMethods(fs_Stat, fs_Stat_METHODS);
            _declareProps(fs_Stat, fs_Stat_PROPS, sizeof fs_Stat_PROPS);
        
    };


//-------------------------
void fs__moduleInit(void){
            fs_Stat =_newClass("fs_Stat", fs_Stat__init, sizeof(struct fs_Stat_s), Object);
            _declareMethods(fs_Stat, fs_Stat_METHODS);
            _declareProps(fs_Stat, fs_Stat_PROPS, sizeof fs_Stat_PROPS);
        
        fs__namespaceInit();
    fs__nativeInit();
};
