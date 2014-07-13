//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/lib/ControlledError.md
#include "ControlledError.h"

   // class ControlledError extends Error
   // ControlledError
   
   any ControlledError; //Class Object
   
   
   //auto ControlledError__init
   void ControlledError__init(any this, len_t argc, any* arguments){
       // //auto call super__init
       Error__init(this,argc,arguments);
           ((ControlledError_ptr)this.value.ptr)->soft = undefined;
           ((ControlledError_ptr)this.value.ptr)->code = undefined;
   };


//# sourceMappingURL=ControlledError.c.map