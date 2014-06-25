//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/path.lite.md
#include "path.h"
// Environment support to emulate some node globals
// to run LiteScritp as C-compiled bin

// ##Helper "path" namespace
// Provides a replacement for node's require('path')

   // public namespace path
   any path={.type=0}; //declare singleton
   void path__init_singleton(){
      if (!path.type) path=new(path_TYPEID,0,NULL);
   };
   
   
   //auto path__init
   void path__init(any this, len_t argc, any* arguments){
           ((path_ptr)this.value.ptr)->sep = any_str("/");
   };

       // method join
       any path_join(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==path_TYPEID);
           //---------
           var args = _newArrayWith(argc,arguments);
           ;
           return _join(args,1,(any_arr){
           any_str("/")
           });
       }
       ;

       // method resolve
       any path_resolve(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==path_TYPEID);
           //---------
           var args = _newArrayWith(argc,arguments);
           ;
           return _join(args,1,(any_arr){
           any_EMPTY_STR
           });
       }
       ;

       // method dirname(text:string)
       any path_dirname(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==path_TYPEID);
           //---------
           // define named params
           var text= argc? arguments[0] : undefined;
           //---------
           // if text.lastIndexOf("/") into var n is -1, return text
           var n=undefined;
           if (__is((n=_lastIndexOf(text,1,(any_arr){
           any_str("/")
           })),any_number(-1))) {return text;};
           return _slice(text,2,(any_arr){
           any_number(0), 
           n
           });
       }
       ;

       // method extname(text:string)
       any path_extname(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==path_TYPEID);
           //---------
           // define named params
           var text= argc? arguments[0] : undefined;
           //---------
           return _slice(text,1,(any_arr){
           any_number(anyToNumber(_lastIndexOf(text,1,(any_arr){
           any_str(".")
           })) + 1)
           });
       }
       ;

       // method basename(text:string)
       any path_basename(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==path_TYPEID);
           //---------
           // define named params
           var text= argc? arguments[0] : undefined;
           //---------
           return _slice(text,1,(any_arr){
           any_number(anyToNumber(_lastIndexOf(text,1,(any_arr){
           any_str("/")
           })) + 1)
           });
       }
       ;


//# sourceMappingURL=path.c.map