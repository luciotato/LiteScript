//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/C/path.lite.md
// Environment support to emulate some node globals
// to run LiteScritp as C-compiled bin

// ##Helper "path" namespace
// Provides a replacement for node's require('path')

   // export default namespace path
   var path={};

        // properties
            // sep = "/"
           path.sep="/";

       // method join
       path.join = function(){
           var args = Array.prototype.slice.call(arguments);
           return args.join("/");
       };

       // method resolve
       path.resolve = function(){
           var args = Array.prototype.slice.call(arguments);
           return args.join("");
       };

       // method dirname(text:string)
       path.dirname = function(text){
           // if text.lastIndexOf("/") into var n is -1, return text
           var n=undefined;
           if ((n=text.lastIndexOf("/")) === -1) {return text;};
           return text.slice(0, n);
       };

       // method extname(text:string)
       path.extname = function(text){
           return text.slice(text.lastIndexOf(".") + 1);
       };

       // method basename(text:string)
       path.basename = function(text){
           return text.slice(text.lastIndexOf("/") + 1);
       };


module.exports=path;
//# sourceMappingURL=path.js.map