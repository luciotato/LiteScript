
//Log Utility
//============
//(c) 2014 Lucio M. Tato


//options
//-------

   var options = {
           verbose: 1, 
           warning: 1, 
           storeMessages: false, 
           debug: {
               enabled: false, 
               file: 'out/debug.log'
               }
           };
   exports.options = options
   ;

//if options.storeMessages, messages are pused at messages[]
//instead of console.

   var messages = [];


//Colors
//------

   var color = {
     normal: "\x1b[39;49m", 
     red: "\x1b[91m", 
     yellow: "\x1b[93m", 
     green: "\x1b[32m"
     };
   exports.color = color
   ;


//Dependencies:
//-------------

   //if type of process isnt 'undefined' #only import if we're on node
   if (typeof process !== 'undefined') {// #only import if we're on node
       //global import fs
       var fs = require('fs');
       //import mkPath
       var mkPath = require('./mkPath');
       
   };

//###global declares, valid properties

//    declare on Error
//        soft, controled, code, stack

//Implementation
//---------------

//    declare valid Array.prototype.slice.apply
//    declare valid Array.prototype.join.apply
//    declare valid console.log.apply
//    declare valid console.error.apply

   //export function debug
   function debug(){

       //if options.debug.enabled
       if (options.debug.enabled) {
           var args = Array.prototype.slice.apply(arguments);
           //if options.debug.file
           if (options.debug.file) {
               //fs.appendFileSync options.debug.file, args.join(" ")+"\r\n"
               fs.appendFileSync(options.debug.file, args.join(" ") + "\r\n");
           }
           else {
               //console.log.apply console,args
               console.log.apply(console, args);
           };
       };
   };
   exports.debug=debug;

   //append to namespace debug
   
    //method clear ### clear debug file
    debug.clear = function(){// ### clear debug file

       //mkPath.toFile options.debug.file
       mkPath.toFile(options.debug.file);
       //fs.writeFileSync options.debug.file,""
       fs.writeFileSync(options.debug.file, "");
    };


   //export function error
   function error(){

//increment error count

       //error.count++
       error.count++;
       var args = Array.prototype.slice.apply(arguments);

//add "ERROR:", send to debug log

       //args.unshift('ERROR:');
       args.unshift('ERROR:');
       //debug.apply(this,args);
       debug.apply(this, args);

//if messages should be stored...

       //if options.storeMessages
       if (options.storeMessages) {
           //messages.push args.join(" ")
           messages.push(args.join(" "));
       }
       else {
           //args.unshift(color.red);
           args.unshift(color.red);
           //args.push(color.normal);
           args.push(color.normal);
           //console.error.apply(console,args);
           console.error.apply(console, args);
       };
   };
   exports.error=error;


   //append to namespace error #to the function as namespace
   
//        properties
//            count = 0  # now we have: log.error.count
       error.count=0;
       


   //export function warning
   function warning(){

       //warning.count++
       warning.count++;
       var args = Array.prototype.slice.apply(arguments);
       //args.unshift('WARNING:');
       args.unshift('WARNING:');
       //debug.apply(this,args);
       debug.apply(this, args);
       //if options.warning > 0
       if (options.warning > 0) {

//if messages should be stored...

           //if options.storeMessages
           if (options.storeMessages) {
               //messages.push args.join(" ")
               messages.push(args.join(" "));
           }
           else {
               //args.unshift(color.yellow);
               args.unshift(color.yellow);
               //args.push(color.normal);
               args.push(color.normal);
               //console.error.apply(console,args);
               console.error.apply(console, args);
           };
       };
   };
   exports.warning=warning;

   //append to namespace warning #to the function as namespace
   
//        properties
//            count = 0  # now we have: log.warning.count
       warning.count=0;
       

   //export function message
   function message(){

       //debug.apply(this,arguments)
       debug.apply(this, arguments);
       //if options.verbose >= 1
       if (options.verbose >= 1) {

//if messages should be stored...

           //if options.storeMessages
           if (options.storeMessages) {
               //messages.push Array.prototype.join.call(arguments," ")
               messages.push(Array.prototype.join.call(arguments, " "));
           }
           else {
               //console.log.apply(console,arguments)
               console.log.apply(console, arguments);
           };
       };
   };
   exports.message=message;


   //export function extra
   function extra(){

       //if options.verbose >= 2
       if (options.verbose >= 2) {
           //message.apply(this,arguments)
           message.apply(this, arguments);
       };
   };
   exports.extra=extra;


   //export function getMessages
   function getMessages(){
//get & clear

       var result = messages;
       messages = [];
       //return result
       return result;
   };
   exports.getMessages=getMessages;


   //export function throwControled
   function throwControled(){
//Throws Error, but with a "controled" flag set,
//to differentiate from unexpected compiler errors

       var e = new Error(Array.prototype.slice.apply(arguments).join(" "));
       e.controled = true;
       //debug "Controled ERROR:", e.message
       debug("Controled ERROR:", e.message);
       //throw e
       throw e;
   };
   exports.throwControled=throwControled;
