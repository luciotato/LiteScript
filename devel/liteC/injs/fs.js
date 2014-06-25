//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/C/fs.lite.md
//-------------------------------------------------------
// Environment support to run LiteScritp as C-compiled bin
//-------------------------------------------------------

// ##Helper "fs" namespace
// Provides a replacement for node's require('fs')

    // global declare fsc from 'fs_native'

   // export default namespace fs
   var fs={};

       // method existsSync(filename:string)
       fs.existsSync = function(filename){
           var result = fsc_stat(filename);
           // if result isnt 0, fs.throwTextErr result
           if (result !== 0) {fs.throwTextErr(result);};
       };

       // method readFileSync(filename) returns string
       fs.readFileSync = function(filename){
           return fsc_readFile(filename);
       };

       // method writeFileSync(filename)
       fs.writeFileSync = function(filename){
           var result = fsc_writeFile(filename);
           // if result isnt 0, fs.throwTextErr result
           if (result !== 0) {fs.throwTextErr(result);};
       };

       // class Stat
       // constructor
       function Stat(){
            // properties
                // st_size : number
                // st_mtime : Date
       };
       
       // end class Stat

       // helper method throwTextErr(result)
       fs.throwTextErr = function(result){
           var message = undefined;
           // switch result
           switch(result){
           
           case 2:message = 'ENOENT';break;
               
           case 13:message = 'EACCESS';break;
               
           case 20:message = 'ENOTDIR';break;
               
           case 21:message = 'EISDIR';break;
               
           default:message = 'ERR' + result;
           };
           // fail with message
           throw new Error(message);
       };

module.exports=fs;
//# sourceMappingURL=fs.js.map