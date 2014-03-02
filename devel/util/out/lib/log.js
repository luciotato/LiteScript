//Compiled by LiteScript compiler v0.6.0, source: /home/ltato/LiteScript/devel/source-v0.6.0/log.lite.md
   var options = {
           verbose: 1, 
           warning: 1, 
           storeMessages: false, 
           debug: {
               enabled: false, 
               file: 'out/debug.log'
               }
           };
   
   module.exports.options = options;
   var messages = [];
   
   module.exports.messages = messages;
   var color = {
     normal: "\x1b[39;49m", 
     red: "\x1b[91m", 
     yellow: "\x1b[93m", 
     green: "\x1b[32m"
     };
   
   module.exports.color = color;
   if (typeof process !== 'undefined') {
       var fs = require('fs');
       var mkPath = require('./mkPath');
       
   };
   
   
   
   
   
   function debug(){
       if (options.debug.enabled) {
           var args = Array.prototype.slice.apply(arguments);
           if (options.debug.file) {
               fs.appendFileSync(options.debug.file, args.join(" ") + "\r\n");
           }
           else {
               console.log.apply(console, args);
           };
       };
   };
   
   module.exports.debug=debug;
   
    debug.clear = function(){
       mkPath.toFile(options.debug.file);
       fs.writeFileSync(options.debug.file, "");
    };
   function error(){
       error.count++;
       var args = Array.prototype.slice.apply(arguments);
       args.unshift('ERROR:');
       debug.apply(this, args);
       if (options.storeMessages) {
           messages.push(args.join(" "));
       }
       else {
           args.unshift(color.red);
           args.push(color.normal);
           console.error.apply(console, args);
       };
   };
   
   module.exports.error=error;
   
           error.count=0;
       
   function warning(){
       warning.count++;
       var args = Array.prototype.slice.apply(arguments);
       args.unshift('WARNING:');
       debug.apply(this, args);
       if (options.warning > 0) {
           if (options.storeMessages) {
               messages.push(args.join(" "));
           }
           else {
               args.unshift(color.yellow);
               args.push(color.normal);
               console.error.apply(console, args);
           };
       };
   };
   
   module.exports.warning=warning;
   
           warning.count=0;
       
   function message(){
       debug.apply(this, arguments);
       if (options.verbose >= 1) {
           if (options.storeMessages) {
               messages.push(Array.prototype.join.call(arguments, " "));
           }
           else {
               console.log.apply(console, arguments);
           };
       };
   };
   
   module.exports.message=message;
   function extra(){
       if (options.verbose >= 2) {
           message.apply(this, arguments);
       };
   };
   
   module.exports.extra=extra;
   function getMessages(){
       var result = messages;
       messages = [];
       return result;
   };
   
   module.exports.getMessages=getMessages;
   function throwControled(){
       var e = new Error(Array.prototype.slice.apply(arguments).join(" "));
       e.controled = true;
       debug("Controled ERROR:", e.message);
       throw e;
   };
   
   module.exports.throwControled=throwControled;