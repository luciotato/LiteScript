#ifndef C_GLOBAL_IMPORT_PATH_C__H
#define C_GLOBAL_IMPORT_PATH_C__H
#include "../_dispatcher.h"
//-------------------------
//Module path
//-------------------------
extern void path__moduleInit(void);
extern any path_resolve(DEFAULT_ARGUMENTS);
extern any path_normalize(DEFAULT_ARGUMENTS);
extern any path_isAbsolute(DEFAULT_ARGUMENTS);
extern any path_join(DEFAULT_ARGUMENTS);
extern any path_relative(DEFAULT_ARGUMENTS);
extern var path_sep;
extern var path_delimiter;
extern any path_dirname(DEFAULT_ARGUMENTS);
extern any path_basename(DEFAULT_ARGUMENTS);
extern any path_extname(DEFAULT_ARGUMENTS);
#endif