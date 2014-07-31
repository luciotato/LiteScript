#ifndef LIB_GENERALOPTIONS_C__H
#define LIB_GENERALOPTIONS_C__H
#include "../_dispatcher.h"
//-------------------------
//Module GeneralOptions
//-------------------------
extern void GeneralOptions__moduleInit(void);
    

//--------------
    // GeneralOptions
    any GeneralOptions; //Class GeneralOptions
    typedef struct GeneralOptions_s * GeneralOptions_ptr;
    typedef struct GeneralOptions_s {
        //GeneralOptions
        any verboseLevel;
        any warningLevel;
        any comments;
        any target;
        any debugEnabled;
        any perf;
        any skip;
        any generateSourceMap;
        any single;
        any compileIfNewer;
        any browser;
        any defines;
        any es6;
        any projectDir;
        any mainModuleName;
        any outDir;
        any storeMessages;
        any literalMap;
        any version;
        any now;
    
    } GeneralOptions_s;
    
    extern void GeneralOptions__init(DEFAULT_ARGUMENTS);
    extern any GeneralOptions_newFromObject(DEFAULT_ARGUMENTS);
    extern any GeneralOptions_toString(DEFAULT_ARGUMENTS);
#endif
