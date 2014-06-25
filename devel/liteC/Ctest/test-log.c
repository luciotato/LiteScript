//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/liteC/test-log.lite.md
#include "test-log.h"
// Log Utility
// ============
// (c) 2014 Lucio M. Tato


// options
// -------

   any options = {
           verbose: 1, 
           warning: 1, 
           storeMessages: false, 
           debug: {
               enabled: false, 
               file: "out/debug.log"
               }
           };
   // export
   _Module_/home/ltato/LiteScript/devel/liteC/test-log.lite.md_exports.options = options;

// if options.storeMessages, messages are pused at messages[]
// instead of console.

   any messages = (any){Array,0,.value.item=(any_arr){}};
   // export
   _Module_/home/ltato/LiteScript/devel/liteC/test-log.lite.md_exports.messages = messages;


// Colors
// ------

   any color = {
     normal: "\x1b[39;49m", 
     red: "\x1b[91m", 
     yellow: "\x1b[93m", 
     green: "\x1b[32m"
     };
   // export
   _Module_/home/ltato/LiteScript/devel/liteC/test-log.lite.md_exports.color = color;


// Dependencies:
// -------------

    //ifndef PROD_C

    //dsfasdf

    //if type of process isnt 'undefined' #only import if we're on node
        //global import fs
        //import mkPath

    // #endif

// ###global declares, valid properties

    // declare on Error
        // soft, controled, code

// Implementation
// ---------------

    // declare valid Array.prototype.slice.apply
    // declare valid Array.prototype.join.apply
    // declare valid console.log.apply
    // declare valid console.error.apply

   // export function debug
   any  debug(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------

       // if options.debug.enabled
       if () {
           any args = ;
       };
   }
   ;
            //ifndef PROD_C
            //if options.debug.file
                //fs.appendFileSync options.debug.file, args.join(" ")+"\r\n"
            //else
                //console.log.apply console,args
            // #endif

   // append to namespace debug
    // method clear ### clear debug file
    any debug_clear(any this, any arguments){// ### clear debug file
    // validate param types
    assert(this.constructor==debug);
    assert(arguments.constructor==Array);
    //---------

        //ifdef PROD_C
       //do nothing
       ;
    }
    ;
        // #else
        //mkPath.toFile options.debug.file
        //fs.writeFileSync options.debug.file,""
        // #endif


   // export function error
   any  error(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------

// increment error count

       ((Function_ptr)error.value.ptr)->count;
       any args = ;

// add "ERROR:", send to debug log

       unshift(args,(any){Array,1,.value.item=(any_arr){any_str("ERROR:")}});
       apply(debug,(any){Array,2,.value.item=(any_arr){this, args}});

// if messages should be stored...

       // if options.storeMessages
       if () {
           push(messages,(any){Array,1,.value.item=(any_arr){join(args,(any){Array,1,.value.item=(any_arr){any_str(" ")}})}});
       }

// else, add red color, send to stderr
       
       else {
           unshift(args,(any){Array,1,.value.item=(any_arr){}});
           push(args,(any){Array,1,.value.item=(any_arr){}});
           ;
       };
   }
   ;


   // append to namespace error #to the function as namespace
       any count;
       ;


   // export function warning
   any  warning(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------

       ((Function_ptr)warning.value.ptr)->count;
       any args = ;
       unshift(args,(any){Array,1,.value.item=(any_arr){any_str("WARNING:")}});
       apply(debug,(any){Array,2,.value.item=(any_arr){this, args}});
       // if options.warning > 0
       if (.value.number > 0) {

// if messages should be stored...

           // if options.storeMessages
           if () {
               push(messages,(any){Array,1,.value.item=(any_arr){join(args,(any){Array,1,.value.item=(any_arr){any_str(" ")}})}});
           }

// else, add yellow color, send to stderr
           
           else {
               unshift(args,(any){Array,1,.value.item=(any_arr){}});
               push(args,(any){Array,1,.value.item=(any_arr){}});
               ;
           };
       };
   }
   ;

   // append to namespace warning #to the function as namespace
       any count;
       ;

   // export function message
   any  message(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------

       apply(debug,(any){Array,2,.value.item=(any_arr){this, arguments}});
       // if options.verbose >= 1
       if (.value.number >= 1) {

// if messages should be stored...

           // if options.storeMessages
           if () {
               push(messages,(any){Array,1,.value.item=(any_arr){}});
           }

// else, send to console
           
           else {
               ;
           };
       };
   }
   ;


   // export function info
   any  info(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------

       // if options.verbose >= 2
       if (.value.number >= 2) {
           apply(message,(any){Array,2,.value.item=(any_arr){this, arguments}});
       };
   }
   ;

   // export function extra
   any  extra(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------

       // if options.verbose >= 3
       if (.value.number >= 3) {
           apply(message,(any){Array,2,.value.item=(any_arr){this, arguments}});
       };
   }
   ;


   // export function getMessages
   any  getMessages(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------
// get & clear

       any result = messages;
       messages = (any){Array,0,.value.item=(any_arr){}};
       return result;
   }
   ;


   // export function throwControled
   any  throwControled(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------
// Throws Error, but with a "controled" flag set,
// to differentiate from unexpected compiler errors

       any e = new(Error,(any){Array,1,.value.item=(any_arr){}});
       ((Error_ptr)e.value.ptr)->controled = true;
       debug((any){MISSING},(any){Array,2,.value.item=(any_arr){any_str("Controled ERROR:"), ((Error_ptr)e.value.ptr)->message}});
       // throw e
       throw(e);
   }
   ;


//# sourceMappingURL=test-log.c.map