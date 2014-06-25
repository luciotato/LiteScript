#ifndef FS_C_H
#define FS_C_H
#include "_dispatcher.h"
   
   #include "fs_native.h"
   
   
   //-------------------
   //.namespace fs
   extern any fs; //fs is a singleton
   void fs__init_singleton();
   //-------------------
   #define fs_TYPEID 34
   typedef struct fs_s * fs_ptr;
   typedef struct fs_s {
   } fs_s;
   
   extern void fs__init(any this, len_t argc, any* arguments);
       
       extern any fs_existsSync( DEFAULT_ARGUMENTS );
       
       
       extern any fs_readFileSync( DEFAULT_ARGUMENTS );
       
       
       extern any fs_writeFileSync( DEFAULT_ARGUMENTS );
       
       
       // classStat
       #define Stat_TYPEID 35
       typedef struct Stat_s * Stat_ptr;
       typedef struct Stat_s {
           any st_size, st_mtime;} Stat_s;
       
       extern void Stat__init(any this, len_t argc, any* arguments);
       
       extern any fs_throwTextErr( DEFAULT_ARGUMENTS );
       
#endif