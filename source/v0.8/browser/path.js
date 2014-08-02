//Compiled by LiteScript compiler v0.4.0, source: /home/ltato/LiteScript/source-v0.4.0/browser/path.md
//-------------------------------------------------------
// Environment support to run LiteScritp compiler on the browser
//-------------------------------------------------------

//##Helper Dummy path

   module.exports = {
       sep: "/", 
       join: function (){
           return Array.prototype.join.call(arguments, "/");
       }, 
       resolve: function (){
           return Array.prototype.join.call(arguments, "/");
       }, 
       dirname: function (text){
           //if text.lastIndexOf("/") into var n is -1, return text
           var n=undefined;
           if ((n=text.lastIndexOf("/")) === -1) {
               return text};
           return text.slice(0, n);
       }, 
       extname: function (text){
           return text.slice(text.lastIndexOf(".") + 1);
       }, 
       basename: function (text){
           return text.slice(text.lastIndexOf("/") + 1);
       }
       };
