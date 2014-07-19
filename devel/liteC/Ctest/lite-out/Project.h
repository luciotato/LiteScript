#ifndef PROJECT_C__H
#define PROJECT_C__H
#include "_dispatcher.h"
//-------------------------
//Module Project
//-------------------------
extern void Project__moduleInit(void);
    

//--------------
    // Project
    any Project; //Class Project
    typedef struct Project_s * Project_ptr;
    typedef struct Project_s {
        //Project
        any options;
        any name;
        any moduleCache;
        any rootModule;
        any compilerVars;
        any main;
        any Producer;
        any recurseLevel;
    
    } Project_s;
    
    extern void Project__init(DEFAULT_ARGUMENTS);
    extern any Project_compile(DEFAULT_ARGUMENTS);
    extern any Project_compileFile(DEFAULT_ARGUMENTS);
    extern any Project_compileFileOnModule(DEFAULT_ARGUMENTS);
    extern any Project_parseOnModule(DEFAULT_ARGUMENTS);
    extern any Project_createNewModule(DEFAULT_ARGUMENTS);
    extern any Project_produceModule(DEFAULT_ARGUMENTS);
    extern any Project_importDependencies(DEFAULT_ARGUMENTS);
    extern any Project_importModule(DEFAULT_ARGUMENTS);
    extern any Project_getInterface(DEFAULT_ARGUMENTS);
    extern any Project_compilerVar(DEFAULT_ARGUMENTS);
    extern any Project_setCompilerVar(DEFAULT_ARGUMENTS);
    extern any Project_redirectOutput(DEFAULT_ARGUMENTS);
#endif
