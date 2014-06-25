//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/fs.lite.md
#include "fs.h"
//-------------------------------------------------------
// Environment support to run LiteScritp as C-compiled bin
//-------------------------------------------------------

// ##Helper "fs" namespace
// Provides a replacement for node's require('fs')



    // global declare fsc

   // export default namespace fs
   any fs={.type=0}; //declare singleton
   void fs__init_singleton(){
      if (!fs.type) fs=new(fs_TYPEID,0,NULL);
   };


   //default __init
   any fs__init(any this, len_t argc, any* arguments){
   };

       // method existsSync(filename:string)
       any fs_existsSync(any this, len_t argc, any* arguments){

           // validate param types
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           any filename;
           filename=undefined;
           switch(argc){
             case 1:filename=arguments[0];
           }
           //---------
           any result = fsc_stat(NONE,1,(any_arr){filename});
           // if result isnt 0, fs.throwTextErr result
           if (result.value.number != 0) {throwTextErr(fs,1,(any_arr){result});};
       }
       ;

       // method readFileSync(filename) returns string
       any fs_readFileSync(any this, len_t argc, any* arguments){

           // validate param types
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           any filename;
           filename=undefined;
           switch(argc){
             case 1:filename=arguments[0];
           }
           //---------
           return fsc_readFile(NONE,1,(any_arr){filename});
       }
       ;

       // method writeFileSync(filename)
       any fs_writeFileSync(any this, len_t argc, any* arguments){

           // validate param types
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           any filename;
           filename=undefined;
           switch(argc){
             case 1:filename=arguments[0];
           }
           //---------
           any result = fsc_writeFile(NONE,1,(any_arr){filename});
           // if result isnt 0, fs.throwTextErr result
           if (result.value.number != 0) {throwTextErr(fs,1,(any_arr){result});};
       }
       ;

       // class Stat


       //default __init
       any Stat__init(any this, len_t argc, any* arguments){
       };

       // helper method throwTextErr(result)
       any fs_throwTextErr(any this, len_t argc, any* arguments){

           // validate param types
           assert(this.type==fs_TYPEID);
           //---------
           // define named params
           any result;
           result=undefined;
           switch(argc){
             case 1:result=arguments[0];
           }
           //---------
           any message = undefined;
           // switch result
           switch(anyToInt64(result)){
           case 2:{message = any_str("ENOENT");}break;
           case 13:{message = any_str("EACCESS");}break;
           case 20:{message = any_str("ENOTDIR");}break;
           case 21:{message = any_str("EISDIR");}break;
           default:{message = any_concat(NONE,2,(any_arr){any_str("ERR"), result});}
           };
           // fail with message
           throw(new(Error,1,(any_arr){message}));;
       }
       ;

//# sourceMappingURL=fs.c.map