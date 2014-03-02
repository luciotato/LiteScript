//Module mkPath
//=============

   //global import fs, path
   var fs = require('fs');
   var path = require('path');


   //export function toFile(filename, mode)
   function toFile(filename, mode){
//Create a path to a file

       create(path.dirname(filename), mode);
   };
   //export
   module.exports.toFile=toFile;


   //export function create (dirPath, mode)
   function create(dirPath, mode){
//Make sure a path exists - Recursive

       //if dirExists(dirPath), return; //ok! dir exists
       if (dirExists(dirPath)) {
           return};

//else... recursive:
//try a folder up, until a dir is found (or an error thrown)

       create(path.dirname(dirPath), mode);

//ok, found parent dir! - make the children dir

       fs.mkdirSync(dirPath, mode);

//return into recursion, creating children subdirs in reverse order (of recursion)

       return;
   };
   //export
   module.exports.create=create;


   //helper function dirExists(dirPath)
   function dirExists(dirPath){ try{


       //if fs.statSync(dirPath).isDirectory
       if (fs.statSync(dirPath).isDirectory) {
           return true; //ok! exists and is a directory
       }
       
       else {
           //throw new Error(dirPath + ' exists but IT IS NOT a directory')
           throw new Error(dirPath + ' exists but IT IS NOT a directory');
       };

       //exception err
       
       }catch(err){

            //if dir does not exists, return false
           //if err.code is 'ENOENT', return false
           if (err.code === 'ENOENT') {
               return false};
           //throw err //another error
           throw err; //another error
       };
   };


//Compiled by LiteScript compiler v0.5.0, source: /home/ltato/LiteScript/devel/source-v0.6.0/mkPath.lite.md
//# sourceMappingURL=mkPath.js.map
