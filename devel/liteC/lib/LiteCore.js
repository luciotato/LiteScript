//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/LiteCore.lite.md

// Shim for Lite-C core support, when target is JS

   // namespace LiteCore
   var LiteCore={};

       // shim method getSymbol(name)
       if (!LiteCore.getSymbol)
       LiteCore.getSymbol = function(name){
           return name;
       };

   // append to class Object

       // shim method tryGetMethod(methodSymbol) returns function
       if (!Object.prototype.tryGetMethod)
       Object.prototype.tryGetMethod = function(methodSymbol){
           return this[methodSymbol];
       };

       // shim method tryGetProperty(propSymbol)
       if (!Object.prototype.tryGetProperty)
       Object.prototype.tryGetProperty = function(propSymbol){
           return this[propSymbol];
       };

       // shim method getProperty(propSymbol)
       if (!Object.prototype.getProperty)
       Object.prototype.getProperty = function(propSymbol){
           // if propSymbol not in Object.keys(this), throw new Error('object has not property "'+propSymbol+'"')
           if (Object.keys(this).indexOf(propSymbol)===-1) {throw new Error('object has not property "' + propSymbol + '"')};
           return this[propSymbol];
       };

       // shim method getPropertyName(propIndex)
       if (!Object.prototype.getPropertyName)
       Object.prototype.getPropertyName = function(propIndex){
           return Object.keys(this)[propIndex];
       };


module.exports=LiteCore;