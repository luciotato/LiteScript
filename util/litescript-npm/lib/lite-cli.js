//## This is the command line interface to LiteScript Compiler

   //global import path,fs
   var path = require('path');
   var fs = require('fs');
   //import Args, fsUtil
   var Args = require('./Args');
   var fsUtil = require('./fsUtil');

//## usage, module vars

   var usage = 'Usage:\n> lite -compile dir/mainModule [options]\n\nThis command will launch the LiteScript Compiler on dir/mainModule\n\noptions are:\n-c, -compile *dir/mainModule*: main module to compile\n-o *dir*: select output dir. Default is \'.\'\n-b, -browser: compile for a browser environment (window instead of global, no process, etc)\n-v, -verbose *level*: verbose level, default is 1 (0-2)\n-w, -warning *level*: warning level, default is 1 (0-1)\n\nAdvanced options:\n-s, -single: compile single file. do not follow import/require() calls\n-nm, -nomap: do not generate sourcemap\n-noval, -novalidation: skip name validation\n-u, -use *v0.6*: select LiteScript Compiler Version to use\n-d, -debug: enable full compiler debug log file at \'out/debug.log\'';

   var color = {
           normal: "\x1b[39;49m", 
           red: "\x1b[91m", 
           yellow: "\x1b[93m", 
           green: "\x1b[32m"
           };


   //public function main
   function main(){

//Get & process command line arguments

       var args = new Args(process.argv);

       var 
       compileAndRun = undefined, 
       mainModuleName = undefined, 
       compileAndRunParams = undefined
       ;

       var defaultVerbose = 1;

//Check for --help

       //if args.option('h','help')
       if (args.option('h', 'help')) {
           console.log(usage);
           process.exit(0);
       };

//Check for --run

       //if args.value('r','run') into mainModuleName
       if ((mainModuleName=args.value('r', 'run'))) {
           compileAndRun = true;
           compileAndRunParams = args.splice(args.lastIndex);// #remove params after --run
           defaultVerbose = 0;
       };

//get compiler version to --use

       var use = args.value('u', 'use');

//Check for other options

       var options = {
           outDir: path.resolve(args.value('o') || '.'), 
           verbose: args.value('v', "verbose") || defaultVerbose, 
           warning: args.value('w', "warning"), 
           debug: args.option('d', "debug"), 
           skip: args.option('noval', "novalidation"), 
           nomap: args.option('nm', "nomap"), 
           single: args.option('s', "single"), 
           browser: args.option('b', "browser")
           };

       var compilerPath = use ? '../../liteCompiler-' + use : '.';

       //if no mainModuleName, mainModuleName = args.value('c',"compile")
       if (!mainModuleName) {
           mainModuleName = args.value('c', "compile")};

        //no args should be left
       //if args.length
       if (args.length) {
           console.log("Invalid arguments:", args.join(' '));
           console.log("lite -h for help");
           process.exit(2);
       };

       //if no mainModuleName
       if (!mainModuleName) {
           console.error("Missing -compile MainModule or -run filename");
           process.exit(2);
       };

//show args

        //console.log(process.cwd());
       //if options.verbose
       if (options.verbose) {
           console.log('\n\ncompiler path: ' + compilerPath);
           console.log('compiler options: ' + (JSON.stringify(options)));
           console.log('cwd: ' + (process.cwd()));
           console.log('compile' + (compileAndRun ? " and run" : "") + ': ' + mainModuleName);
       };

//load required version of LiteScript compiler

        //#declare global __dirname
        //#print "at: #{__dirname}, require '#{compilerPath}/Compiler.js'"

       var Compiler = require('' + compilerPath + '/Compiler.js');

//launch project compilation

        //declare valid Compiler.version
        //declare valid Compiler.compile
       //if options.verbose, print 'LiteScript compiler version #{Compiler.version}'
       if (options.verbose) {
           console.log('LiteScript compiler version ' + Compiler.version)};

       //try
       try{

//if "compile and run", load & compile single file and run it

           //if compileAndRun
           if (compileAndRun) {

               var filename = mainModuleName;
               //if not fs.existsSync(filename), filename=mainModuleName+'.md'
               if (!(fs.existsSync(filename))) {
                   filename = mainModuleName + '.md'};
               //if not fs.existsSync(filename), filename=mainModuleName+'.lite.md'
               if (!(fs.existsSync(filename))) {
                   filename = mainModuleName + '.lite.md'};
               //if not fs.existsSync(filename), fail with 'Compile and Run,  File not found: "#{mainModuleName}"'
               if (!(fs.existsSync(filename))) {
                   throw new Error('Compile and Run,  File not found: "' + mainModuleName + '"')};
               var sourceLines = fs.readFileSync(filename);
               var compiledCode = Compiler.compile(filename, sourceLines, options);

                // if options.debug, save compiled file, run node --debug.brk
               //if options.debug
               if (options.debug) {
                   var outFile = path.join(options.outDir, mainModuleName + '.js');
                   fsUtil.mkPathToFile(outFile);
                   fs.writeFileSync(outFile, compiledCode);
                   var exec = require('child_process').exec;
                   console.log("***LAUNCHING NODE in DEBUG MODE***");
                   var cmd = 'node --debug-brk ' + outFile + ' ' + (compileAndRunParams.join(" "));
                   console.log(cmd);
                   exec(cmd, function (error, stdout, stderr){
                                        //declare error:Error
                                       //if error, console.error error.message
                                       if (error) {
                                           console.error(error.message)};
                                       console.log(stdout);
                                       console.error(stderr);
                   });
               };
           }

//else, launch compile Project
           
           else {
               //if Compiler has property 'compileProject' #v0.4
               if ('compileProject' in Compiler) {// #v0.4
                    //declare valid Compiler.compileProject
                   Compiler.compileProject(mainModuleName, options);
               }
               
               else {
                   Compiler.compile(mainModuleName, options);
               };

               //end if
               
           };
       
       }catch(e){

            //declare valid e.controled
            //declare valid e.code
           //if e.controled
           if (e.controled) {
               console.error(color.red, e.message, color.normal);
               process.exit(1);
           }
           
           else if (e.code === 'EISDIR') {
               console.error(color.red + 'ERROR: "' + mainModuleName + '" is a directory', color.normal);
               console.error('Please specify a *file* as the main module to compile');
               process.exit(2);
           }
           
           else {
               console.log('UNCONTROLED ERROR:');
               console.log(e);
               //throw e;
               throw e;
           };
       };

//After compilation

       //if compileAndRun and not options.debug
       if (compileAndRun && !(options.debug)) {

//Run

//add 'lite filename...' to arguments

           compileAndRunParams.unshift('lite', mainModuleName);
           //if options.verbose, print "RUN: #{compileAndRunParams.join(' ')}"
           if (options.verbose) {
               console.log("RUN: " + (compileAndRunParams.join(' ')))};

//register require() extensions, so .lite and .md LiteScript files are recognized,
//loaded and compiled

            //declare valid Compiler.registerRequireExtensions
           Compiler.registerRequireExtensions();

//hack for require(). Simulate we're at the run module dir,
//for require() to look at the same dirs as at runtime

            //declare global module
            //declare on module paths:string array
            //declare valid module.constructor._nodeModulePaths
           module.filename = path.resolve(filename);
           module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename));

//set process.argv to parameters after --run filename

           process.argv = compileAndRunParams;

//run code

           eval(compiledCode);
       };
   };
   //export
   module.exports.main=main;



//Compiled by LiteScript compiler v0.6.0, source: /home/ltato/LiteScript/util/src/lite-cli.lite.md
//# sourceMappingURL=lite-cli.js.map
