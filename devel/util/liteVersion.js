//
// This command line interface to LiteScript Compiler
// allows you to choose lite-js compiler version to load
//
// Composed, pure-js lite-cli.md + Args.lite + fsUtil.lite
//

   //global import path,fs
   var path = require('path');
   var fs = require('fs');

//## usage, module vars

   var usage = 'LiteVersion.js\nUsage:\n> liteVersion -compile dir/mainModule [options]\n\nThis command will launch the LiteScript Compiler on dir/mainModule\n\noptions are:\n-c, -compile *dir/mainModule*: main module to compile\n-o *dir*: select output dir. Default is \'.\'\n-b, -browser: compile for a browser environment (window instead of global, no process, etc)\n-v, -verbose *level*: verbose level, default is 1 (0-2)\n-w, -warning *level*: warning level, default is 1 (0-1)\n\nAdvanced options:\n-s, -single: compile single file. do not follow import/require() calls\n-nm, -nomap: do not generate sourcemap\n-noval, -novalidation: skip name validation\n-u, -use *v0.6*: select LiteScript Compiler Version to use\n-d, -debug: enable full compiler debug log file at \'out/debug.log\'';

   var color = {
           normal: "\x1b[39;49m", 
           red: "\x1b[91m", 
           yellow: "\x1b[93m", 
           green: "\x1b[32m"
           };


   //public function main
   function main(){

//Get & process command line arguments

       console.log(process.argv.join(" "));

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

//get compiler version to --use

       var useVersion = args.value('u', 'use');

//Check for other options

       var options = {
           outDir: path.resolve(args.value('o') || '.'), 
           verboseLevel: Number(args.value('v', "verbose")||defaultVerbose), 
           warningLevel: Number(args.value('w', "warning")||1), 
           debugEnabled: args.option('d', "debug"), 
           skip: args.option('noval', "novalidation"), 
           nomap: args.option('nm', "nomap"), 
           single: args.option('s', "single"), 
           browser: args.option('b', "browser"),
           comments: Number(args.value('comment', "comments")||1),
           defines:[]
           };

       //get defines
       while(true){
          def=args.value('D');
          if(!def)break;
          options.defines.push(def);
        }

       if (!useVersion) {
           console.error("Missing -use v0.8/lite-to-js");
           process.exit(2);
       };

       var compilerPath = '../generated/js/'+useVersion;

        //no args should be left
       //if args.length
       if (args.length!==1) {
           console.log("Invalid arguments:", args.join(' '));
           console.log("lite -h for help");
           process.exit(2);
       };

       //mainModuleName 
       mainModuleName = args[0];

       //if no mainModuleName
       if (!mainModuleName) {
           console.error("Missing MainModule");
           process.exit(2);
       };

//show args

        //console.log(process.cwd());
       //if options.verbose
       if (options.verboseLevel) {
           console.log('compiler options: ' + (JSON.stringify(options,null,0)));
           console.log('cwd: ' + (process.cwd()));
           console.log('compile' + (compileAndRun ? " and run" : "") + ': ' + mainModuleName);
           console.log('out: ' + options.outDir);
       };

//load required version of LiteScript compiler

        //#declare global __dirname
        //#print "at: #{__dirname}, require '#{compilerPath}/Compiler.js'"

       console.log('compiler path: ' + compilerPath);
       var Compiler = require('' + compilerPath + '/Compiler.js');

//launch project compilation

        //declare valid Compiler.version
        //declare valid Compiler.compile
       //if options.verbose, print 'LiteScript compiler version #{Compiler.version}'
       if (options.verboseLevel) {
           console.log('LiteScript compiler version', Compiler.version,' - build date ',Compiler.buildDate)};

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
               if (options.debugEnabled) {
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
           if (e.controled||e.constructor.name==='ControlledError') {
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

       //if compileAndRun and not options.Enabled
       if (compileAndRun && !(options.Enabled)) {

//Run
//add 'lite filename...' to arguments

           compileAndRunParams.unshift('lite', mainModuleName);
           //if options.verboseLevel, print "RUN: #{compileAndRunParams.join(' ')}"
           if (options.verboseLevel) {
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

//-------------------------
//class Args

   //constructor
    function Args(argv){
     //     properties
        //lastIndex

       var arr = argv.slice(2); //remove 'node lite' from command line arguments
        //declare valid arr.__proto__
       arr.__proto__ = Args.prototype; //convert arr:Array into arr:Args:Array
       return arr; //return as created object
    };
   // Args (extends|super is) Array
   Args.prototype.__proto__ = Array.prototype;

    //method option(short,argName)
    Args.prototype.option = function(short, argName){

       //if .getPos(short,argName) into var pos >= 0
       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           this.splice(pos, 1);
           return true;
       };

       return false;
    };

    //method value(short,argName) returns string
    Args.prototype.value = function(short, argName){

       //if .getPos(short,argName) into var pos >= 0
       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           var value = this[pos + 1];
           this.splice(pos, 2);
           return value;
       };

       return undefined;
    };

    //helper method getPos(short,argName)
    Args.prototype.getPos = function(short, argName){

       this.lastIndex = this.search(['-' + short, '--' + short, '--' + argName, '-' + argName]);
       return this.lastIndex;
    };

    //helper method search(list:array)
    Args.prototype.search = function(list){
       //for each item in list
       for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
       
           var result = this.indexOf(item);
           //if result >=0, return result
           if (result >= 0) {
               return result};
       }; // end for each in list
       return -1;
    };
   //end class Args

//-------------------------

//--------------------------
    function dirExists(dirPath){
    try {
        if (fs.statSync(dirPath).isDirectory())
            return true; //ok! exists and is a directory
        else 
            throw new Error(dirPath + ' exists but IS NOT a directory');
        } 
        catch (err) {
            //if it not exists, return false
            if (err.code === 'ENOENT') return false;
            else throw err; //another error
        };
    };

//--------------------------
    function mkPath(dirPath, mode){
        if (dirExists(dirPath))
            return; //ok! dir exists
        else {
            //try a folder up, until a dir is found (or an error thrown)
            mkPath(path.dirname(dirPath), mode);
            //ok, found parent dir! - make the children dir
            fs.mkdirSync(dirPath, mode);
            // return recursion, making all the children subdirs
        }   
    };


//--------------------------
    function mkPathToFile(filename, mode){
      mkPath(path.dirname(filename), mode)
    }
    
//--------------------------

main();
