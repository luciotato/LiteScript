//Compiled by LiteScript compiler v0.4.0, source: /home/ltato/LiteScript/source-v0.4.0/browser/fs.md
//-------------------------------------------------------
// Environment support to run LiteScritp compiler on the browser
//-------------------------------------------------------

//##Helper Dummy fs

   module.exports = {
       existsSync: function (){
           return false;
       }, 
       readFileSync: function (){
           return false;
       }, 
       writeFileSync: function (){
           return false;
       }
       };
