//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/color.lite.md
#include "color.h"

   // public namespace color
   any color={.type=0}; //declare singleton
   void color__init_singleton(){
      if (!color.type) color=new(color_TYPEID,0,NULL);
   };
   
   
   //auto color__init
   void color__init(any this, len_t argc, any* arguments){
           ((color_ptr)this.value.ptr)->normal = any_str("\x1b[39;49m");
           ((color_ptr)this.value.ptr)->red = any_str("\x1b[91m");
           ((color_ptr)this.value.ptr)->yellow = any_str("\x1b[93m");
           ((color_ptr)this.value.ptr)->green = any_str("\x1b[32m");
   };


//# sourceMappingURL=color.c.map