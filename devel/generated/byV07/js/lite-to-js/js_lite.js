//Compiled by LiteScript compiler v0.7.9, source: /home/ltato/LiteScript/devel/source/v0.8/js_lite.lite.md
// ##Lite-js
// This is the command line interface to LiteScript-to-js Compiler
// when the LiteScript compiler is generated as js-code
// to run on node.js or the browser

   // global import path,fs
   var path = require('path');
   var fs = require('fs');
   // import GeneralOptions, OptionsParser, ControlledError, color
   var GeneralOptions = require('./lib/GeneralOptions.js');
   var OptionsParser = require('./lib/OptionsParser.js');
   var ControlledError = require('./lib/ControlledError.js');
   var color = require('./lib/color.js');

   // import Compiler
   var Compiler = require('./Compiler.js');

// ## usage, module vars

   var usage = "\nLiteScript-to-js v" + Compiler.version + "\n\nUsage:\n        lite mainModule.lite.md [options]\n        lite -run mainModule.lite.md [options]\n\nThis command will launch the LiteScript Compiler on mainModule.lite.md\n\noptions are:\n-r, -run         compile & run .lite.md file\n-o dir           output dir. Default is './generated/js/'\n-b, -browser     compile for a browser environment (window instead of global, no process, etc)\n-v, -verbose     verbose level, default is 0 (0-3)\n-w, -warning     warning level, default is 1 (0-1)\n-comments        comment level on generated files, default is 1 (0-2)\n-version         print LiteScript version & exit\n\nAdvanced options:\n-s,  -single     compile single file. do not follow \"import\" statements\n-ifn, -ifnew     compile only if source is newer\n-wa, -watch      watch current dir for source changes and compile\n-es6, --harmony  used with -run, uses node --harmony\n-nm, -nomap      do not generate sourcemap\n-noval           skip property name validation\n-D NAME -D NAME  preprocessor defines (#define)\n-d, -debug       enable full compiler debug logger file at 'out/debug.logger'\n-run -debug      when -run used with -debug, launch compiled file with: node --debug-brk\n";


   // public function main
   function main(){ try{

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
           console.log(Compiler.version);
           process.exit(0);
       };

// Check for -run

       // if args.valueFor('r','run') into mainModuleName
       if ((mainModuleName=args.valueFor('r', 'run'))) {
           compileAndRunOption = true;
           compileAndRunParams = args.items.splice(args.lastIndex);// #remove params after --run
       };

// get compiler version to --use

       var use = args.valueFor('u', 'use');

// Check for other options

       var options = new GeneralOptions();
       // with options
       var _with1=options;
           _with1.outDir = path.resolve(args.valueFor('o') || './generated/js'); //output dir
           _with1.verboseLevel = Number(args.valueFor('v', "verbose") || 0);
           _with1.warningLevel = Number(args.valueFor('w', "warning") || 1);
           _with1.comments = Number(args.valueFor('comment', "comments") || 1);
           _with1.debugEnabled = args.option('d', "debug");
           _with1.skip = args.option('noval', "novalidation"); // skip name validation
           _with1.nomap = args.option('nm', "nomap"); // do not generate sourcemap
           _with1.single = args.option('s', "single"); // single file- do not follow require() calls
           _with1.compileIfNewer = args.option('ifn', "ifnew"); // single file, compile if source is newer
           _with1.browser = args.option('b', "browser");
           _with1.es6 = args.option('es6', "harmony");
           _with1.defines = [];
       ;

       // while args.valueFor('D') into var newDef
       var newDef=undefined;
       while((newDef=args.valueFor('D'))){
           options.defines.push(newDef);
       };// end loop

       // if options.verboseLevel
       if (options.verboseLevel) {
           console.log('LiteScript compiler version ' + Compiler.version + '  ' + Compiler.buildDate);
       };

// Check for -watch dir

       // if args.option('wa','watch')
       if (args.option('wa', 'watch')) {
           watchDir(Compiler, options);
           return; //EXIT
       };

// get mainModuleName

        //only mainModuleName should be left
       // case args.items.length
       // when 0
       if ((args.items.length==0)){
               console.error("Missing MainModule or -run filename.\nlite -h for help");
               process.exit(2);
       
       }// when 1
       else if ((args.items.length==1)){
               mainModuleName = args.items[0];
       
       }
       else {
               console.log("Invalid (" + args.items.length + ") arguments:", args.items.join(' '));
               console.log("lite -h for help");
               process.exit(2);
       };

// show args

        //console.log(process.cwd());
       // if options.verboseLevel>1
       if (options.verboseLevel > 1) {
           console.log('compiler options: ' + (JSON.stringify(options)));
           console.log('cwd: ' + (process.cwd()));
           console.log('compile' + (compileAndRunOption ? " and run" : "") + ': ' + mainModuleName);
           // if options.debugEnabled, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.logger",color.normal
           if (options.debugEnabled) {console.log(color.yellow, "GENERATING COMPILER DEBUG AT out/debug.logger", color.normal)};
       };


// launch project compilation

// if "compile and run", load & compile single file and run it

       // if compileAndRunOption
       if (compileAndRunOption) {
           compileAndRun(compileAndRunParams, mainModuleName, options);
       }

// else, launch compile Project
       
       else {
           Compiler.compileProject(mainModuleName, options);
       };


// Exception handler

       // Exception err
       
       }catch(err){

           // if err instance of ControlledError
           if (err instanceof ControlledError) {
               console.error(color.red, err.message, color.normal);
               process.exit(1);
           }
           
           else if (err.code === 'EISDIR') {
               console.error(color.red, err.message, color.normal);
               console.error('Please specify a *file* as the main module to compile');
               process.exit(2);
           }
           
           else {
               console.log('UNCONTROLLED ' + err.constructor.name, err);
               // throw err
               throw err;
           };
       };
   };
   // export
   module.exports.main=main;

   // end main function


   // function launchCompilation(mainModuleName, options:GeneralOptions)
   function launchCompilation(mainModuleName, options){

       Compiler.compileProject(mainModuleName, options);
   };

   // function compileAndRun(compileAndRunParams:array,mainModuleName,options:GeneralOptions)
   function compileAndRun(compileAndRunParams, mainModuleName, options){

       var nodeArgs = options.es6 ? " --harmony" : "" + options.debugEnabled ? " --debug-brk" : "";

       var filename = mainModuleName;
       // if not fs.existsSync(filename), filename=mainModuleName+'.md'
       if (!(fs.existsSync(filename))) {filename = mainModuleName + '.md'};
       // if not fs.existsSync(filename), filename=mainModuleName+'.lite.md'
       if (!(fs.existsSync(filename))) {filename = mainModuleName + '.lite.md'};
       // if not fs.existsSync(filename), fail with 'Compile and Run,  File not found: "#{mainModuleName}"'
       if (!(fs.existsSync(filename))) {throw new Error('Compile and Run,  File not found: "' + mainModuleName + '"')};
       var sourceLines = fs.readFileSync(filename);
       var compiledCode = Compiler.compile(filename, sourceLines, options);

        // if options.debug, save compiled file, run node --debug.brk
       // if options.debugEnabled or options.es6
       if (options.debugEnabled || options.es6) {
           var outFile = path.join(options.outDir, mainModuleName + '.js');
           fs.writeFileSync(outFile, compiledCode);
           var exec = require('child_process').exec;
           // if options.debugEnabled, print "***LAUNCHING NODE in DEBUG MODE***"
           if (options.debugEnabled) {console.log("***LAUNCHING NODE in DEBUG MODE***")};
           var cmd = 'node ' + nodeArgs + ' ' + outFile + ' ' + (compileAndRunParams.join(" "));
           console.log(cmd);
           exec(cmd, function (error, stdout, stderr){
                       console.log(stdout);
                       console.log(stderr);
                       // if no options.debugEnabled
                       if (!options.debugEnabled) {
                           // try # to delete generated temp file
                           try{
                               fs.unlink(outFile);
                           
                           }catch(err){
                               console.log(err.message, " at rm", outFile);
                           };
                       };
                       // end if
                       // if error
                       if (error) {
                            // declare valid error.errno
                           console.log("ERROR", error.code);
                           console.log(error.message);
                           process.exit(error.errno || 1);
                       };
           });
       }
       
       else {

           compileAndRunParams.unshift('lite', mainModuleName);// #add 'lite filename...' to arguments
           // if options.verboseLevel, print "RUN: #{compileAndRunParams.join(' ')}"
           if (options.verboseLevel) {console.log("RUN: " + (compileAndRunParams.join(' ')))};

// register require() extensions, so if .lite and .md LiteScript
// files can be required() from node

            // declare valid Compiler.registerRequireExtensions
           Compiler.registerRequireExtensions();

// hack for require(). Simulate we're at the run module dir,
// for require() to look at the same dirs as at runtime

            // declare on module paths:string array
            // declare valid module.constructor._nodeModulePaths
           module.filename = path.resolve(filename);
           module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename));
            // declare global var __dirname
           __dirname = path.dirname(module.filename);

// set process.argv to parameters after "--run filename"

           process.argv = compileAndRunParams;

// run code

           eval(compiledCode);
       };
   };

   // function watchDir(options:GeneralOptions)
   function watchDir(options){

// Watch a directory and compile when files change

       options.compileIfNewer = true; //compile only if source is newer

       var mainDir = path.resolve('.');
       console.log("watching dir " + mainDir);
       var watcher = fs.watch(mainDir);
       var readdirTimeout = undefined;

        // declare valid watcher.on
        // declare valid watcher.close

       watcher.on('error', function (err){
         watcher.close();
         // throw err
         throw err;
       });

       watcher.on('change', function (event, file){
         clearTimeout(readdirTimeout);
         readdirTimeout = setTimeout(function (){
                    //console.log "DIR CHANGE"
                   compileOnChange(file, mainDir, options);
         }, 250);
       });
   };

   // function compileOnChange(file, dir, options)
   function compileOnChange(file, dir, options){ try{

       // if file # we have specific file information
       if (file) {// # we have specific file information
           // if file like /\.(lite|lite\.md)$/
           if (/\.(lite|lite\.md)$/.test(file)) {
               Compiler.compileProject(file, options);
           };
       }
       
       else {
            // # check entire dir
           var files = fs.readdirSync(dir);
           // for each dirFile in files where dirFile like /\.(lite|lite\.md)$/
           for( var dirFile__inx=0,dirFile ; dirFile__inx<files.length ; dirFile__inx++){dirFile=files[dirFile__inx];
             if(/\.(lite|lite\.md)$/.test(dirFile)){
               Compiler.compileProject(dirFile, options);
           }};// end for each in files
           
       };

       // Exception err
       
       }catch(err){
           console.log(err.message);
       };
   };


//# sourceMappingURL=js_lite.js.map