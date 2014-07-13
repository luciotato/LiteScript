#ifndef LIB_ENVIRONMENT_C__H
#define LIB_ENVIRONMENT_C__H
#include "../_dispatcher.h"
//-------------------------
//Module Environment
//-------------------------
extern void Environment__moduleInit(void);
   

//--------------
   // Environment_FileInfo
   extern any Environment_FileInfo; //Class Object
   
   typedef struct Environment_FileInfo_s * Environment_FileInfo_ptr;
   typedef struct Environment_FileInfo_s {
       any
           importInfo,
           dir,
           extension,
           base,
           sourcename,
           hasPath,
           isCore,
           isLite,
           isInterface,
           filename,
           relPath,
           relFilename,
           outDir,
           outFilename,
           outRelFilename,
           outExtension,
           outFileIsNewer,
           interfaceFile,
           interfaceFileExists,
           externalCacheExists
   ;
   } Environment_FileInfo_s;
   
   extern void Environment_FileInfo__init(DEFAULT_ARGUMENTS);
   extern any Environment_FileInfo_outWithExtension(DEFAULT_ARGUMENTS);
   extern any Environment_FileInfo_searchModule(DEFAULT_ARGUMENTS);
extern any Environment_setBaseInfo(DEFAULT_ARGUMENTS);
extern any Environment_relativeFrom(DEFAULT_ARGUMENTS);
extern any Environment_resolvePath(DEFAULT_ARGUMENTS);
extern any Environment_dirName(DEFAULT_ARGUMENTS);
extern any Environment_loadFile(DEFAULT_ARGUMENTS);
extern any Environment_externalCacheSave(DEFAULT_ARGUMENTS);
extern any Environment_isBuiltInModule(DEFAULT_ARGUMENTS);
extern any Environment_isBuiltInObject(DEFAULT_ARGUMENTS);
extern any Environment_getGlobalObject(DEFAULT_ARGUMENTS);
extern any Environment_fileInfoNewFile(DEFAULT_ARGUMENTS);
   

//--------------
   // Environment_ImportParameterInfo
   extern any Environment_ImportParameterInfo; //Class Object
   
   typedef struct Environment_ImportParameterInfo_s * Environment_ImportParameterInfo_ptr;
   typedef struct Environment_ImportParameterInfo_s {
       any
           name,
           isGlobalDeclare,
           globalImport,
           createFile
   ;
   } Environment_ImportParameterInfo_s;
   
   extern void Environment_ImportParameterInfo__init(DEFAULT_ARGUMENTS);
#endif