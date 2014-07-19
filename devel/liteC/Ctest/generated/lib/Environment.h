#ifndef LIB_ENVIRONMENT_C__H
#define LIB_ENVIRONMENT_C__H
#include "../_dispatcher.h"
//-------------------------
//Module Environment
//-------------------------
extern void Environment__moduleInit(void);
    

//--------------
    // Environment_FileInfo
    any Environment_FileInfo; //Class Environment_FileInfo
    typedef struct Environment_FileInfo_s * Environment_FileInfo_ptr;
    typedef struct Environment_FileInfo_s {
        //FileInfo
        any importInfo;
        any dir;
        any extension;
        any base;
        any sourcename;
        any hasPath;
        any isCore;
        any isLite;
        any isInterface;
        any filename;
        any relPath;
        any relFilename;
        any outDir;
        any outFilename;
        any outRelFilename;
        any outExtension;
        any outFileIsNewer;
        any interfaceFile;
        any interfaceFileExists;
        any externalCacheExists;
    
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
    any Environment_ImportParameterInfo; //Class Environment_ImportParameterInfo
    typedef struct Environment_ImportParameterInfo_s * Environment_ImportParameterInfo_ptr;
    typedef struct Environment_ImportParameterInfo_s {
        //ImportParameterInfo
        any name;
        any isGlobalDeclare;
        any globalImport;
        any createFile;
    
    } Environment_ImportParameterInfo_s;
    
    extern void Environment_ImportParameterInfo__init(DEFAULT_ARGUMENTS);
#endif
