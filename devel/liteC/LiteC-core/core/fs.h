#ifndef LITEC_CORE_FS_H
#define LITEC_CORE_FS_H
   // Fs

    #include "LiteC-core.h"

   //-------------------
   //declared as namespace (singleton)
   extern any fs; //is a singleton
   //-------------------

   extern any Fs; //Class Object

       extern void Fs__init(DEFAULT_ARGUMENTS);

       extern any Fs_existsSync( DEFAULT_ARGUMENTS );
       extern any Fs_readFileSync( DEFAULT_ARGUMENTS );
       extern any Fs_writeFileSync( DEFAULT_ARGUMENTS );


       // Stat
       extern any Fs_Stat; //Class Object

       typedef struct Fs_Stat_s { //should match fs.interface.lite.md
            any errNum, errCode, exists, size, mtime_secs;
       } Fs_Stat_s;

       extern void Fs_Stat__init(DEFAULT_ARGUMENTS);

       extern any Fs_statSync(DEFAULT_ARGUMENTS);
       extern any Fs_readFileSync(DEFAULT_ARGUMENTS);
       extern any Fs_writeFileSync(DEFAULT_ARGUMENTS);

#endif