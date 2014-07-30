#ifndef COMPILER_C__H
#define COMPILER_C__H
#include "_dispatcher.h"
//-------------------------
//Module Compiler
//-------------------------
extern void Compiler__moduleInit(void);
extern var Compiler_version;
extern var Compiler_buildDate;
extern any Compiler_compile(DEFAULT_ARGUMENTS);
extern any Compiler_compileProject(DEFAULT_ARGUMENTS);
extern any Compiler_compileModule(DEFAULT_ARGUMENTS);
extern any Compiler_getMessages(DEFAULT_ARGUMENTS);
#endif
