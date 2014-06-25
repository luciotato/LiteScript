#ifndef PATH_C_H
#define PATH_C_H
#include "_dispatcher.h"
   
   //-------------------
   //.namespace path
   extern any path; //path is a singleton
   void path__init_singleton();
   //-------------------
   #define path_TYPEID 33
   typedef struct path_s * path_ptr;
   typedef struct path_s {
       any sep;} path_s;
   
   extern void path__init(any this, len_t argc, any* arguments);
       
       extern any path_join( DEFAULT_ARGUMENTS );
       
       
       extern any path_resolve( DEFAULT_ARGUMENTS );
       
       
       extern any path_dirname( DEFAULT_ARGUMENTS );
       
       
       extern any path_extname( DEFAULT_ARGUMENTS );
       
       
       extern any path_basename( DEFAULT_ARGUMENTS );
       
#endif