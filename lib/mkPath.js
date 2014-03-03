//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/mkPath.lite.md
   var fs = require('fs');
   var path = require('path');
   function toFile(filename, mode){
       create(path.dirname(filename), mode);
   };
   
   module.exports.toFile=toFile;
   function create(dirPath, mode){
       if (dirExists(dirPath)) {
           return};
       create(path.dirname(dirPath), mode);
       fs.mkdirSync(dirPath, mode);
       return;
   };
   
   module.exports.create=create;
   function dirExists(dirPath){ try{
       if (fs.statSync(dirPath).isDirectory) {
           return true;
       }
       else {
           throw new Error(dirPath + ' exists but IT IS NOT a directory');
       };
       
       }catch(err){
           if (err.code === 'ENOENT') {
               return false};
           throw err;
       };
   };