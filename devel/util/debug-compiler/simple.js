//Compiled by LiteScript compiler v0.6.7, source: /home/ltato/LiteScript/devel/util/debug-compiler/simple.lite.md
// simple.lite.md

   b(1, 2, 3);

   // function b
   function b(){
       console.log(Array.prototype.join.call(arguments, " "));

        //var DEFAULT_TARGET="c"
        // #else
       var DEFAULT_TARGET = "js";
        // #end if

       // default options =
       if(!options) options={};
       if(options.verbose===undefined) options.verbose=1;
       if(options.warning===undefined) options.warning=1;
       if(options.comments===undefined) options.comments=1;
       if(options.target===undefined) options.target=DEFAULT_TARGET;
       if(options.outDir===undefined) options.outDir='.';
       // options.debug: undefined
       // options.skip: undefined
       // options.nomap: undefined
       // options.single: undefined
       // options.compileIfNewer: undefined
       // options.browser: undefined
       if(options.extraComments===undefined) options.extraComments=1;
       if(options.defines===undefined) options.defines=[];
       
   };

   var a = [1, 2, 3];
   var params = [1, 1];
   Array.prototype.splice.apply(a, params);// #remove 1 start at 1
   console.log(a);

// The main module is the root of the module dependency tree, and can reference
// another modules via import|require.

   var options = {};

    //default options =
        //outDir: 'out'
        //target: 'c'
    // #else
   // default options =
   if(!options) options={};
   if(options.outDir===undefined) options.outDir='.';
   if(options.target===undefined) options.target='js';
    // #endif

   console.log("Out Dir: " + options.outDir);


//# sourceMappingURL=simple.js.map