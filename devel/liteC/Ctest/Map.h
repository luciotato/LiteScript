#ifndef MAP_C_H
#define MAP_C_H
#include "_dispatcher.h"
   
   // classMap
   #define Map_TYPEID 5
   typedef struct Map_s * Map_ptr;
   typedef struct Map_s {
       TypeID type;
       any map_members;} Map_s;
   
   extern any Map__init(any this, len_t argc, any* arguments);
       
       extern any Map_set( DEFAULT_ARGUMENTS );
       
       
       extern any Map_get( DEFAULT_ARGUMENTS );
       
       
       extern any Map_has( DEFAULT_ARGUMENTS );
       
       
       extern any Map_clear( DEFAULT_ARGUMENTS );
       
#endif