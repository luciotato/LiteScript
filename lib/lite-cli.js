//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.7/lite-cli.lite.md
   var path = require('path');
   var fs = require('fs');
   var Args = require('./Args');
   var VERSION = '0.7.0';
   var usage = '\nLiteScript v' + VERSION + '\n\nUsage:\n        lite -compile mainModule.lite.md [options]\n        lite -run mainModule.lite.md [options]\n\nThis command will launch the LiteScript Compiler on mainModule.lite.md\n\noptions are:\n-r, -run         compile & run .lite.md file\n-c, -compile     compile project, mainModule & all dependent files\n-o dir           output dir. Default is \'./out\'\n-b, -browser     compile for a browser environment (window instead of global, no process, etc)\n-v, -verbose     verbose level, default is 0 (0-3)\n-w, -warning     warning level, default is 1 (0-1)\n-comments        comment level on generated files, default is 1 (0-2)\n-version         print LiteScript version & exit\n\nAdvanced options:\n-s,  -single     compile single file. do not follow import/require() calls\n-ifn, -ifnew     compile only if source is newer\n-wa, -watch      watch current dir for source changes and compile\n-es6, --harmony  used with -run, uses node --harmony\n-nm, -nomap      do not generate sourcemap\n-noval           skip property name validation\n-D NAME -D NAME  Defines names for preprocessing with #ifdef\n-u, -use vX.Y.Z  select LiteScript Compiler Version to use (devel)\n-d, -debug       enable full compiler debug log file at \'out/debug.log\'\n-run -debug      when -run used with -debug, launch compiled file with: node --debug-brk\n';
   var color = {
       normal: "\x1b[39;49m", 
       red: "\x1b[91m", 
       yellow: "\x1b[93m", 
       green: "\x1b[32m"
       };
   function main(){
       var args = new Args(process.argv);
       var 
       mainModuleName = undefined, 
       compileAndRunOption = undefined, 
       compileAndRunParams = undefined
       ;
       if (args.option('h', 'help')) {
           console.log(usage);
           process.exit(0);
       };
       if (args.option('vers', 'version')) {
           console.log(VERSION);
           process.exit(0);
       };
       if ((mainModuleName=args.value('r', 'run'))) {
           compileAndRunOption = true;
           compileAndRunParams = args.splice(args.lastIndex);
       };
       var use = args.value('u', 'use');
       var options = {
           outDir: path.resolve(args.value('o') || './out'), 
           verbose: Number(args.value('v', "verbose") || 0), 
           warning: Number(args.value('w', "warning") || 1), 
           comments: Number(args.value('comment', "comments") || 1), 
           target: args.value('target') || 'js', 
           debug: args.option('d', "debug"), 
           skip: args.option('noval', "novalidation"), 
           nomap: args.option('nm', "nomap"), 
           single: args.option('s', "single"), 
           compileIfNewer: args.option('ifn', "ifnew"), 
           browser: args.option('b', "browser"), 
           es6: args.option('es6', "harmony"), 
           defines: []
           };
       var compilerPath = (/^v.*/.test(use)) ? ('../../liteCompiler-' + use) :
           (!use) ? ('.') :
       /* else */ use;
       var newDef=undefined;
       while((newDef=args.value('D'))){
           options.defines.push(newDef);
       };
       var Compiler = require('' + compilerPath + '/Compiler.js');
       
       
       if (options.verbose) {console.log('LiteScript compiler version ' + Compiler.version + '  ' + Compiler.buildDate);};
       if (args.option('wa', 'watch')) {
           watchDir(Compiler, options);
           return;
       };
       if (!mainModuleName) {mainModuleName = args.value('c', "compile");};
       if (args.length) {
           console.log("Invalid arguments:", args.join(' '));
           console.log("lite -h for help");
           process.exit(2);
       };
       if (!mainModuleName) {
           console.error("Missing -compile MainModule or -run filename.\nlite -h for help");
           process.exit(2);
       };
       if (options.verbose > 1) {
           console.log('\n\ncompiler path: ' + compilerPath);
           console.log('compiler options: ' + (JSON.stringify(options)));
           console.log('cwd: ' + (process.cwd()));
           console.log('compile' + (compileAndRunOption ? " and run" : "") + ': ' + mainModuleName);
           if (options.debug) {console.log(color.yellow, "GENERATING COMPILER DEBUG AT out/debug.log", color.normal);};
       };
       try{
           if (compileAndRunOption) {
               compileAndRun(compileAndRunParams, Compiler, mainModuleName, options);
           }
           else {
               launchCompilation(Compiler, mainModuleName, options);
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
       
   };
   
   module.exports.main=main;
   
   function launchCompilation(Compiler, mainModuleName, options){
       
       if ('compileProject' in Compiler) {
           
           Compiler.compileProject(mainModuleName, options);
       }
       else {
           Compiler.compile(mainModuleName, options);
       };
       
   };
   function compileAndRun(compileAndRunParams, Compiler, mainModuleName, options){
       var nodeArgs = options.es6 ? " --harmony" : "" + options.debug ? " --debug-brk" : "";
       var filename = mainModuleName;
       if (!(fs.existsSync(filename))) {filename = mainModuleName + '.md';};
       if (!(fs.existsSync(filename))) {filename = mainModuleName + '.lite.md';};
       if (!(fs.existsSync(filename))) {throw new Error('Compile and Run,  File not found: "' + mainModuleName + '"');};
       var sourceLines = fs.readFileSync(filename);
       var compiledCode = Compiler.compile(filename, sourceLines, options);
       if (options.debug || options.es6) {
           var outFile = path.join(options.outDir, mainModuleName + '.js');
           fs.writeFileSync(outFile, compiledCode);
           var exec = require('child_process').exec;
           if (options.debug) {console.log("***LAUNCHING NODE in DEBUG MODE***");};
           var cmd = 'node ' + nodeArgs + ' ' + outFile + ' ' + (compileAndRunParams.join(" "));
           console.log(cmd);
           exec(cmd, function (error, stdout, stderr){
                       
                       console.log(stdout);
                       console.log(stderr);
                       if (!options.debug) {
                           try{
                               fs.unlink(outFile);
                           
                           }catch(err){
                               console.log(err.message, " at rm", outFile);
                           };
                       };
                       
                       if (error) {
                           console.log("ERROR", error.code);
                           console.log(error.message);
                           process.exit(error.code || 1);
                       };
           });
       }
       else {
           compileAndRunParams.unshift('lite', mainModuleName);
           if (options.verbose) {console.log("RUN: " + (compileAndRunParams.join(' ')));};
           
           Compiler.registerRequireExtensions();
           
           
           module.filename = path.resolve(filename);
           module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename));
           __dirname = path.dirname(module.filename);
           process.argv = compileAndRunParams;
           eval(compiledCode);
       };
   };
   function watchDir(Compiler, options){
       options.compileIfNewer = true;
       var mainDir = path.resolve('.');
       console.log("watching dir " + mainDir);
       var watcher = fs.watch(mainDir);
       var readdirTimeout = undefined;
       watcher.on('error', function (err){
         watcher.close();
         throw err;
       });
       watcher.on('change', function (event, file){
         clearTimeout(readdirTimeout);
         readdirTimeout = setTimeout(function (){
                   compileOnChange(file, Compiler, mainDir, options);
               }, 250);
       });
   };
   function compileOnChange(file, Compiler, dir, options){
       if (file) {
           if (/\.(lite|lite\.md)$/.test(file)) {
               launchCompilation(Compiler, file, options);
           };
       }
       else {
           var files = fs.readdirSync(dir);
           for( var dirFile__inx=0,dirFile ; dirFile__inx<files.length ; dirFile__inx++){dirFile=files[dirFile__inx];
             if(/\.(lite|lite\.md)$/.test(dirFile)){
               try{
                   launchCompilation(Compiler, dirFile, options);
               
       }catch(err){
           console.log(err.message);
       };
           }};
           
       };
   };