//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/fs.lite.md
#include "fs.h"
//-------------------------------------------------------
// Environment support to run LiteScritp as C-compiled bin
//-------------------------------------------------------

// ##Helper "fs" namespace
// Provides a replacement for node's require('fs')

   
   
    // global declare fsc from 'fs_native'

   // export default namespace fs
   any fs={.type=0}; //declare singleton
   void fs__init_singleton(){
      if (!fs.type) fs=new(fs_TYPEID,0,NULL);
   };
   
   
   //auto fs__init
   void fs__init(any this, len_t argc, any* arguments){
   };

       // method existsSync(filename:string)
       any fs_existsSync(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           var filename= argc? arguments[0] : undefined;
           //---------
           var result = fsc_stat(NONE,1,(any_arr){
           filename
           });
           ;
           // if result isnt 0, fs.throwTextErr result
           if (!__is(result,any_number(0))) {_throwTextErr(fs,1,(any_arr){
           result
           });};
       }
       ;

       // method readFileSync(filename) returns string
       any fs_readFileSync(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           var filename= argc? arguments[0] : undefined;
           //---------
           return fsc_readFile(NONE,1,(any_arr){
           filename
           });
       }
       ;

       // method writeFileSync(filename)
       any fs_writeFileSync(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           var filename= argc? arguments[0] : undefined;
           //---------
           var result = fsc_writeFile(NONE,1,(any_arr){
           filename
           });
           ;
           // if result isnt 0, fs.throwTextErr result
           if (!__is(result,any_number(0))) {_throwTextErr(fs,1,(any_arr){
           result
           });};
       }
       ;

       // class Stat
       
       
       //auto Stat__init
       void Stat__init(any this, len_t argc, any* arguments){
               ((Stat_ptr)this.value.ptr)->st_size = undefined;
               ((Stat_ptr)this.value.ptr)->st_mtime = undefined;
       };

       // helper method throwTextErr(result)
       any fs_throwTextErr(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           var result= argc? arguments[0] : undefined;
           //---------
           var message = undefined;
           ;
           // switch result
           switch(anyToInt64(result)){
           case 2:{message = any_str("ENOENT");}break;
           case 13:{message = any_str("EACCESS");}break;
           case 20:{message = any_str("ENOTDIR");}break;
           case 21:{message = any_str("EISDIR");}break;
           default:{message = any_concat(NONE,2,(any_arr){
               any_str("ERR"), 
               result
               });}
           };
           // fail with message
           throw(new(Error_TYPEID,1,(any_arr){message}));;
       }
       ;

//# sourceMappingURL=fs.c.map