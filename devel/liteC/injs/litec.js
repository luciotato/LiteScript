//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/C/litec.lite.md
// ## This is the command line interface to LiteScript-C Compiler

   // import path, fs
   var path = require('./path');
   var fs = require('./fs');
   // import OptionsParser
   var OptionsParser = require('./OptionsParser');

   var VERSION = '0.8.1';

// ## module vars

   var usage = '\nLiteScript-C v' + VERSION + '\n\nUsage:\n        litec -compile mainModule.lite.md [options]\n\nThis command will compile mainModule.lite.md\n\noptions are:\n-c, -compile     compile project, mainModule & all dependent files\n-o dir           output dir. Default is \'.\'\n-v, -verbose     verbose level, default is 0 (0-3)\n-w, -warning     warning level, default is 1 (0-1)\n-comments        comment level on generated files, default is 1 (0-2)\n-version         print LiteScript version & exit\n\nAdvanced options:\n-s,  -single     compile single file. do not follow import/require() calls\n-ifn, -ifnew     compile only if source is newer\n-noval           skip property name validation\n-D FOO -D BAR    Defines preprocessor names (#ifdef FOO/#ifndef BAR)\n-u, -use vX.Y.Z  select LiteScript Compiler Version to use (devel)\n-d, -debug       enable full compiler debug log file at \'out/debug.log\'\n';

   // namespace color
   var color={};
        // properties
            // normal:string =   "\x1b[39;49m"
            // red:string =     "\x1b[91m"
            // yellow:string =   "\x1b[93m"
            // green:string =    "\x1b[32m"
           color.normal="\x1b[39;49m";
           color.red="\x1b[91m";
           color.yellow="\x1b[93m";
           color.green="\x1b[32m";
       

   // class LiteC_Options
   // constructor
       function LiteC_Options(args){
        // properties
            // outDir
            // verbose
            // warning
            // comments
            // target
            // debug
            // skip
            // single
            // compileIfNewer
            // defines : array of string
           this.outDir = path.resolve(args.value('o') || '.'); //output dir
           this.verbose = Number(args.value('v', "verbose") || 0);
           this.warning = Number(args.value('w', "warning") || 1);
           this.comments = Number(args.value('comment', "comments") || 1);
           this.target = args.value('target') || 'js'; //target
           this.debug = args.option('d', "debug");
           this.skip = args.option('noval', "novalidation"); // skip name validation
           this.single = args.option('s', "single"); // single file- do not follow require() calls
           this.compileIfNewer = args.option('ifn', "ifnew"); // single file, compile if source is newer
           this.defines = [];
       };

       // method toString
       LiteC_Options.prototype.toString = function(){
           return 'outDir:' + this.outDir + '\nverbose:' + this.verbose + '\ndefines:' + (this.defines.join());
       };
   // end class LiteC_Options

   // end class

// start the program

   initFunction();

   // function initFunction()
   function initFunction(){

// Get & process command line arguments

       var args = new OptionsParser(process.argv);

       var 
       mainModuleName = undefined, 
       compileAndRunOption = undefined, 
       compileAndRunParams = undefined
       ;

// Check for -help

       // if args.option('h','help')
       if (args.option('h', 'help')) {
           console.log(usage);
           process.exit(0);
       };

// Check for -version

       // if args.option('vers','version')
       if (args.option('vers', 'version')) {
           console.log(VERSION);
           process.exit(0);
       };

// Check for -run

       // if args.value('r','run') into mainModuleName
       if ((mainModuleName=args.value('r', 'run'))) {
           compileAndRunOption = true;
           compileAndRunParams = args.items.splice(args.lastIndex);// #remove params after --run
       };

// get compiler version to --use

       var use = args.value('u', 'use');

// Check for other options

       var options = new LiteC_Options(args);

       var compilerPath = // when use like /^v.*/ then '../../liteCompiler-#{use}'
           (/^v.*/.test(use)) ? ('../../liteCompiler-' + use) :
            // when no use then '.'
           (!use) ? ('.') :
       /* else */ use;

       // while args.value('D') into var newDef
       var newDef=undefined;
       while((newDef=args.value('D'))){
           options.defines.push(newDef);
       };// end loop

// load required version of LiteScript compiler

        // #declare global __dirname
        // #print "at: #{__dirname}, require '#{compilerPath}/Compiler.js'"

       var Compiler = undefined;
        //var Compiler = require('#{compilerPath}/Compiler.js');

        // declare valid Compiler.compileProject
        // declare valid Compiler.compile

        // declare valid Compiler.version
        // declare valid Compiler.buildDate

//         if options.verbose, print 'LiteScript compiler version #{Compiler.version}  #{Compiler.buildDate}'
//         

// get mainModuleName

       // if no mainModuleName, mainModuleName = args.value('c',"compile")
       if (!mainModuleName) {mainModuleName = args.value('c', "compile");};

        //no args should be left
       // if args.items.length
       if (args.items.length) {
           console.log("Invalid arguments:", args.items.join(' '));
           console.log("lite -h for help");
           process.exit(2);
       };

       // if no mainModuleName
       if (!mainModuleName) {
           console.error("Missing -compile MainModule or -run filename.\nlite -h for help");
           process.exit(2);
       };

// show args

        //console.log(process.cwd());
       // if options.verbose>1
       if (options.verbose > 1) {
           console.log('\n\ncompiler path: ' + compilerPath);
           console.log('compiler options: \n' + options);
           console.log('cwd: ' + (process.cwd()));
           console.log('compile' + (compileAndRunOption ? " and run" : "") + ': ' + mainModuleName);
           // if options.debug, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.log",color.normal
           if (options.debug) {console.log(color.yellow, "GENERATING COMPILER DEBUG AT out/debug.log", color.normal);};
       };


// launch project compilation

       // try
       try{

// if "compile and run", load & compile single file and run it

           // if compileAndRunOption
           if (compileAndRunOption) {
               compileAndRun(compileAndRunParams, Compiler, mainModuleName, options);
           }

// else, launch compile Project
           
           else {
               launchCompilation(Compiler, mainModuleName, options);
           };
       
       }catch(e){

            // declare valid e.extra.get
            // declare valid e.extra.has
           // if e.extra and e.extra.has("controled")
           if (e.extra && e.extra.has("controled")) {
               console.error(color.red, e.message, color.normal);
               process.exit(1);
           }
           
           else if (e.extra && e.extra.get("code") === 'EISDIR') {
               console.error('' + color.red + 'ERROR: "' + mainModuleName + '" is a directory' + color.normal);
               console.error('Please specify a *file* as the main module to compile');
               process.exit(2);
           }
           
           else {
               console.log('UNCONTROLED ERROR:');
               console.log(e);
               // throw e;
               throw e;
           };
       };

       // end exception
       
   };

   // end main function

   // function launchCompilation(Compiler, mainModuleName, options)
   function launchCompilation(Compiler, mainModuleName, options){

        // declare valid Compiler.compileProject
       
   };
        //Compiler.compileProject(mainModuleName, options);

   // function compileAndRun(compileAndRunParams,Compiler,mainModuleName,options)
   function compileAndRun(compileAndRunParams, Compiler, mainModuleName, options){

       // fail with 'NOT IMPLEMENTED for C code generation'
       throw new Error('NOT IMPLEMENTED for C code generation');
   };

//# sourceMappingURL=litec.js.map