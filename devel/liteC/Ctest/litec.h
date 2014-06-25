#ifndef LITEC_C_H
#define LITEC_C_H
#include "_dispatcher.h"
   
   // classLiteC_Options
   #define LiteC_Options_TYPEID 32
   typedef struct LiteC_Options_s * LiteC_Options_ptr;
   typedef struct LiteC_Options_s {
       any outDir, verbose, warning, comments, target, debug, skip, single, compileIfNewer, defines;} LiteC_Options_s;
   
   extern void LiteC_Options__init(any this, len_t argc, any* arguments);
       
       extern any LiteC_Options_toString( DEFAULT_ARGUMENTS );
       
   
   extern any  initFunction( DEFAULT_ARGUMENTS );
   
   
   extern any  launchCompilation( DEFAULT_ARGUMENTS );
   
   
   extern any  compileAndRun( DEFAULT_ARGUMENTS );
   
#endif