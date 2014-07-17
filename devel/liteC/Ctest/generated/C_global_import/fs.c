#include "fs.h"
//-------------------------
//Module fs - INTERFACE
//-------------------------
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
       
       static _posTableItem_t fs_Stat_PROPS[] = {
       size_
    , mtime_
    , mode_
    };
       
       

//--------------
       // fs_Stat
       any fs_Stat; //Class fs_Stat
           // properties
           ;

           // method isDirectory returns boolean
           // method isFile returns boolean
           

       // method readFileSync(filename) returns string
       // method writeFileSync(filename)
       // method statSync(filename:string)
       // method unlinkSync(filename:string)
       // method mkdirSync(path:string, mode)
       
   
   //------------------
   void fs__namespaceInit(void){
           fs_Stat =_newClass("fs_Stat", fs_Stat__init, sizeof(struct fs_Stat_s), Object.value.classINFOptr);
           _declareMethods(fs_Stat, fs_Stat_METHODS);
           _declareProps(fs_Stat, fs_Stat_PROPS, sizeof fs_Stat_PROPS);
       
   };


//-------------------------
void fs__moduleInit(void){
           fs_Stat =_newClass("fs_Stat", fs_Stat__init, sizeof(struct fs_Stat_s), Object.value.classINFOptr);
           _declareMethods(fs_Stat, fs_Stat_METHODS);
           _declareProps(fs_Stat, fs_Stat_PROPS, sizeof fs_Stat_PROPS);
       
       fs__namespaceInit();
    fs__nativeInit();
};