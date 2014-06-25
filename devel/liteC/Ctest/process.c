//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/process.lite.md
#include "process.h"
// Environment support to emulate some node globals
// to run LiteScritp as C-compiled bin

// ##Helper "process" namespace
// Provides a replacement for node's require('path')

   // export default namespace process
   any process={.type=0}; //declare singleton
   void process__init_singleton(){
      if (!process.type) process=new(process_TYPEID,0,NULL);
   };
   
   
   //auto process__init
   void process__init(any this, len_t argc, any* arguments){
           ((process_ptr)this.value.ptr)->argv = undefined;
   };

       // method cwd returns string //Returns the current working directory of the process.
       any process_cwd(any this, len_t argc, any* arguments){ //Returns the current working directory of the process.
           
           
           // validate this type
           assert(this.type==process_TYPEID);
           //---------
           return any_str(".");
       }
       ;

       // method exit
       any process__exit(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==process_TYPEID);
           //---------
           //do nothing
           ;
       }
       ;

//# sourceMappingURL=process.c.map