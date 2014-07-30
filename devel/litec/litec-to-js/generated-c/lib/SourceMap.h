#ifndef LIB_SOURCEMAP_C__H
#define LIB_SOURCEMAP_C__H
#include "../_dispatcher.h"
//-------------------------
//Module SourceMap
//-------------------------
extern void SourceMap__moduleInit(void);
    

//--------------
    // SourceMap
    any SourceMap; //Class SourceMap
    typedef struct SourceMap_s * SourceMap_ptr;
    typedef struct SourceMap_s {
        //SourceMap
        any lines;
    
    } SourceMap_s;
    
    extern void SourceMap__init(DEFAULT_ARGUMENTS);
    extern any SourceMap_newFromObject(DEFAULT_ARGUMENTS);
    extern any SourceMap_add(DEFAULT_ARGUMENTS);
    extern any SourceMap_sourceLocation(DEFAULT_ARGUMENTS);
    extern any SourceMap_generate(DEFAULT_ARGUMENTS);
    

//--------------
    // SourceMap_Location
    any SourceMap_Location; //Class SourceMap_Location
    typedef struct SourceMap_Location_s * SourceMap_Location_ptr;
    typedef struct SourceMap_Location_s {
        //Location
        any lin;
        any col;
    
    } SourceMap_Location_s;
    
    extern void SourceMap_Location__init(DEFAULT_ARGUMENTS);
    extern any SourceMap_Location_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // SourceMap_LineMap
    any SourceMap_LineMap; //Class SourceMap_LineMap
    typedef struct SourceMap_LineMap_s * SourceMap_LineMap_ptr;
    typedef struct SourceMap_LineMap_s {
        //LineMap
        any line;
        any columns;
    
    } SourceMap_LineMap_s;
    
    extern void SourceMap_LineMap__init(DEFAULT_ARGUMENTS);
    extern any SourceMap_LineMap_newFromObject(DEFAULT_ARGUMENTS);
    extern any SourceMap_LineMap_add(DEFAULT_ARGUMENTS);
    extern any SourceMap_LineMap_sourceLocation(DEFAULT_ARGUMENTS);
#endif
