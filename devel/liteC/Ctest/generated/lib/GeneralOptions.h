#ifndef LIB_GENERALOPTIONS_C__H
#define LIB_GENERALOPTIONS_C__H
#include "../_dispatcher.h"
//-------------------------
//Module GeneralOptions
//-------------------------
extern void GeneralOptions__moduleInit(void);
   

//--------------
   // GeneralOptions
   
   extern any GeneralOptions; //Class Object
   
   typedef struct GeneralOptions_s * GeneralOptions_ptr;
   typedef struct GeneralOptions_s {
       any
           verboseLevel,
           warningLevel,
           comments,
           target,
           debugEnabled,
           skip,
           nomap,
           single,
           compileIfNewer,
           browser,
           extraComments,
           defines,
           projectDir,
           mainModuleName,
           outDir,
           storeMessages,
           literalMap,
           version,
           now
   ;
   } GeneralOptions_s;
   
   extern void GeneralOptions__init(DEFAULT_ARGUMENTS);
   extern any GeneralOptions_toString(DEFAULT_ARGUMENTS);
#endif