#ifndef PROCESS_C_H
#define PROCESS_C_H
#include "_dispatcher.h"
   
   //-------------------
   //.namespace process
   extern any process; //process is a singleton
   void process__init_singleton();
   //-------------------
   #define process_TYPEID 34
   typedef struct process_s * process_ptr;
   typedef struct process_s {
       TypeID type;
       any argv;} process_s;
   
   extern void process__init(any this, len_t argc, any* arguments);
       
       extern any process_cwd( DEFAULT_ARGUMENTS );
       
       
       extern any process__exit( DEFAULT_ARGUMENTS );
       
#endif