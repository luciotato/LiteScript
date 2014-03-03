//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/lite-cli.lite.md
   var path = require('path');
   var fs = require('fs');
   var Args = require('./Args');
   var usage = '\nUsage: lite -c|-r mainModule.lite.md [options]\n\nThis command will launch the LiteScript Compiler on mainModule.lite.md\n\noptions are:\n-r, -run         compile & run .lite.md file\n-c, -compile     compile project, mainModule & all dependent files\n-o dir           output dir. Default is \'.\'\n-b, -browser     compile for a browser environment (window instead of global, no process, etc)\n-v, -verbose     verbose level, default is 1 (0-2)\n-w, -warning     warning level, default is 1 (0-1)\n-comments        comment level on generated files, default is 1 (0-2)\n\nAdvanced options:\n-s,  -single     compile single file. do not follow import/require() calls\n-nm, -nomap      do not generate sourcemap\n-noval           skip name validation\n-u, -use vX.Y.Z  select LiteScript Compiler Version to use (devel)\n-d, -debug       enable full compiler debug log file at \'out/debug.log\'\n-run -debug      when -run used with -debug, launch compiled file with: node --debug-brk\n';
   var color = {
           normal: "\x1b[39;49m", 
           red: "\x1b[91m", 
           yellow: "\x1b[93m", 
           green: "\x1b[32m"
           };
   function main(){
       var args = new Args(process.argv);
       var 
       compileAndRun = undefined, 
       mainModuleName = undefined, 
       compileAndRunParams = undefined
       ;
       var defaultVerbose = 1;
       if (args.option('h', 'help')) {
           console.log(usage);
           process.exit(0);
       };
       if ((mainModuleName=args.value('r', 'run'))) {
           compileAndRun = true;
           compileAndRunParams = args.splice(args.lastIndex);
           defaultVerbose = 0;
       };
       var use = args.value('u', 'use');
       var options = {
           outDir: path.resolve(args.value('o') || '.'), 
           verbose: Number(args.value('v', "verbose") || defaultVerbose), 
           warning: Number(args.value('w', "warning") || 1), 
           comments: Number(args.value('comment', "comments") || 1), 
           debug: args.option('d', "debug"), 
           skip: args.option('noval', "novalidation"), 
           nomap: args.option('nm', "nomap"), 
           single: args.option('s', "single"), 
           browser: args.option('b', "browser")
           };
       var compilerPath = use ? '../../liteCompiler-' + use : '.';
       if (!mainModuleName) {
           mainModuleName = args.value('c', "compile")};
       if (args.length) {
           console.log("Invalid arguments:", args.join(' '));
           console.log("lite -h for help");
           process.exit(2);
       };
       if (!mainModuleName) {
           console.error("Missing -compile MainModule or -run filename.\nlite -h for help");
           process.exit(2);
       };
       if (options.verbose) {
           console.log('\n\ncompiler path: ' + compilerPath);
           console.log('compiler options: ' + (JSON.stringify(options)));
           console.log('cwd: ' + (process.cwd()));
           console.log('compile' + (compileAndRun ? " and run" : "") + ': ' + mainModuleName);
       };
       var Compiler = require('' + compilerPath + '/Compiler.js');
       
       
       if (options.verbose) {
           console.log('LiteScript compiler version ' + Compiler.version)};
       try{
           if (compileAndRun) {
               var filename = mainModuleName;
               if (!(fs.existsSync(filename))) {
                   filename = mainModuleName + '.md'};
               if (!(fs.existsSync(filename))) {
                   filename = mainModuleName + '.lite.md'};
               if (!(fs.existsSync(filename))) {
                   throw new Error('Compile and Run,  File not found: "' + mainModuleName + '"')};
               var sourceLines = fs.readFileSync(filename);
               var compiledCode = Compiler.compile(filename, sourceLines, options);
               if (options.debug) {
                   var outFile = path.join(options.outDir, mainModuleName + '.js');
                   fs.writeFileSync(outFile, compiledCode);
                   var exec = require('child_process').exec;
                   console.log("***LAUNCHING NODE in DEBUG MODE***");
                   var cmd = 'node --debug-brk ' + outFile + ' ' + (compileAndRunParams.join(" "));
                   console.log(cmd);
                   exec(cmd, function (error, stdout, stderr){
                                       
                                       if (error) {
                                           console.error(error.message)};
                                       console.log(stdout);
                                       console.error(stderr);
                   });
               };
           }
           else {
               if ('compileProject' in Compiler) {
                   
                   Compiler.compileProject(mainModuleName, options);
               }
               else {
                   Compiler.compile(mainModuleName, options);
               };
               
           };
       
       }catch(e){
           
           
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
               throw e;
           };
       };
       if (compileAndRun && !(options.debug)) {
           compileAndRunParams.unshift('lite', mainModuleName);
           if (options.verbose) {
               console.log("RUN: " + (compileAndRunParams.join(' ')))};
           
           Compiler.registerRequireExtensions();
           
           
           
           module.filename = path.resolve(filename);
           module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename));
           process.argv = compileAndRunParams;
           eval(compiledCode);
       };
   };
   
   module.exports.main=main;