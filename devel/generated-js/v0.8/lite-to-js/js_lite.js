//This is the command line interface to LiteScript-to-js Compiler
//when the LiteScript compiler is generated as js-code
//to run on node.js or the browser

    //import path,fs
    var path = require('path');
    var fs = require('fs');

    //import GeneralOptions, OptionsParser, ControlledError, color
    var GeneralOptions = require('./lib/GeneralOptions.js');
    var OptionsParser = require('./lib/OptionsParser.js');
    var ControlledError = require('./lib/ControlledError.js');
    var color = require('./lib/color.js');

    //import Compiler
    var Compiler = require('./Compiler.js');

//execute commands

    //execute process.argv
    execute(process.argv);


    //    function execute(params:array)
    function execute(params){
     try{

        //var title = "LiteScript-to-js v#{Compiler.version} Build Date #{Compiler.buildDate}"
        var title = "LiteScript-to-js v" + Compiler.version + " Build Date " + Compiler.buildDate;

//#### usage

        //var options = new GeneralOptions()
        var options = new GeneralOptions();

        //var usage = "\n        " + title + "\n\n        Usage:\n                lite mainModule.lite.md [options]\n                lite -run mainModule.lite.md [options]\n\n        This command will launch the LiteScript Compiler for mainModule.lite.md\n\n        options are:\n        -r, -run         compile & run .lite.md file\n        -o dir           output dir. Default is '" + options.outDir + "'\n        -v, -verbose     verbose level, default is " + options.verboseLevel + " (0-3)\n        -w, -warning     warning level, default is " + options.warningLevel + " (0-1)\n        -c, -comment     comment level on generated files, default is " + options.comments + " (0-2)\n        -b, -browser     compile for a browser environment (window instead of global, no process, etc)\n        -i dir           additional \"import\" dir. e.g: -i ../../intefaces\n\n        -h, -help        print this help\n        -version         print LiteScript version & exit\n\n        Advanced options:\n        -s,  -single     compile single file. do not follow \"import\" statements\n        -wa, -watch      watch current dir for source changes and compile\n        -es6, --harmony  used with -run, uses node --harmony\n        -nm, -nomap      do not generate sourcemap\n        -noval           skip property name validation\n        -D NAME -D NAME  preprocessor defines (#define)\n        -d, -debug       enable full compiler debug logger file at 'out/debug.logger'\n        -run -debug      when -run used with -debug, launch compiled file with: node --debug-brk\n"
        var usage = "\n        " + title + "\n\n        Usage:\n                lite mainModule.lite.md [options]\n                lite -run mainModule.lite.md [options]\n\n        This command will launch the LiteScript Compiler for mainModule.lite.md\n\n        options are:\n        -r, -run         compile & run .lite.md file\n        -o dir           output dir. Default is '" + options.outDir + "'\n        -v, -verbose     verbose level, default is " + options.verboseLevel + " (0-3)\n        -w, -warning     warning level, default is " + options.warningLevel + " (0-1)\n        -c, -comment     comment level on generated files, default is " + options.comments + " (0-2)\n        -b, -browser     compile for a browser environment (window instead of global, no process, etc)\n        -i dir           additional \"import\" dir. e.g: -i ../../intefaces\n\n        -h, -help        print this help\n        -version         print LiteScript version & exit\n\n        Advanced options:\n        -s,  -single     compile single file. do not follow \"import\" statements\n        -wa, -watch      watch current dir for source changes and compile\n        -es6, --harmony  used with -run, uses node --harmony\n        -nm, -nomap      do not generate sourcemap\n        -noval           skip property name validation\n        -D NAME -D NAME  preprocessor defines (#define)\n        -d, -debug       enable full compiler debug logger file at 'out/debug.logger'\n        -run -debug      when -run used with -debug, launch compiled file with: node --debug-brk\n";

//Get & process command line arguments

        //var args = new OptionsParser(params)
        var args = new OptionsParser(params);

        //var
            //isCompileAndRun:boolean
            //compileAndRunParams:array

//Check for -help

        //if args.option('h','help')
        var isCompileAndRun = undefined, compileAndRunParams = undefined;

//Check for -help

        //if args.option('h','help')
        if (args.option('h', 'help')) {
        
            //print usage
            console.log(usage);
            //process.exit 0
            process.exit(0);
        };

//Check for -version

        //if args.option('vers','version')
        if (args.option('vers', 'version')) {
        
            //print Compiler.version
            console.log(Compiler.version);
            //process.exit 0
            process.exit(0);
        };

//Check for -run

        //if args.valueFor('r','run') into options.mainModuleName
        if ((options.mainModuleName=args.valueFor('r', 'run'))) {
        
            //isCompileAndRun = true
            isCompileAndRun = true;
            //compileAndRunParams = args.items.splice(args.lastIndex) #remove params after --run
            compileAndRunParams = args.items.splice(args.lastIndex);
        };

//get compiler version to --use

        //var use = args.valueFor('u','use')
        var use = args.valueFor('u', 'use');

//set other options

        //var optValue
        var optValue = undefined;

        //with options
        var _with1=options;
            //if args.valueFor('o') into optValue,            .outDir = path.resolve(optValue) //output dir
            if ((optValue=args.valueFor('o'))) {_with1.outDir = path.resolve(optValue)};
            //if args.valueFor('v',"verbose") into optValue,  .verboseLevel = parseInt(optValue)
            if ((optValue=args.valueFor('v', "verbose"))) {_with1.verboseLevel = parseInt(optValue)};
            //if args.valueFor('w',"warning") into optValue,  .warningLevel = parseInt(optValue)
            if ((optValue=args.valueFor('w', "warning"))) {_with1.warningLevel = parseInt(optValue)};
            //if args.valueFor('c',"comment") into optValue,  .comments = parseInt(optValue)
            if ((optValue=args.valueFor('c', "comment"))) {_with1.comments = parseInt(optValue)};
            //if args.valueFor('perf') into optValue,         .perf = parseInt(optValue)
            if ((optValue=args.valueFor('perf'))) {_with1.perf = parseInt(optValue)};

            //if args.option('d',"debug"),     .debugEnabled = true
            if (args.option('d', "debug")) {_with1.debugEnabled = true};
            //if args.option('noval'),         .skip = true
            if (args.option('noval')) {_with1.skip = true};
            //if args.option('nm',"nomap"),    .generateSourceMap = false // do not generate sourcemap
            if (args.option('nm', "nomap")) {_with1.generateSourceMap = false};
            //if args.option('s',"single"),    .single = true // single file- do not follow imports
            if (args.option('s', "single")) {_with1.single = true};
            //if args.option('b',"browser"),   .browser = true // single file- do not follow imports
            if (args.option('b', "browser")) {_with1.browser = true};
            //if args.option('es6',"harmony"), .es6 = true // use node --harmony
            if (args.option('es6', "harmony")) {_with1.es6 = true};
        // end with _with1

            //.compileIfNewer = args.option('ifn',"ifnew") // single file, compile if source is newer

        //while args.valueFor('D') into var newDef
        var newDef=undefined;
        while((newDef=args.valueFor('D'))){
            //options.defines.push newDef
            options.defines.push(newDef);
        };// end loop

        //while args.valueFor('i') into var includeDir
        var includeDir=undefined;
        while((includeDir=args.valueFor('i'))){
            //options.includeDirs.push includeDir
            options.includeDirs.push(includeDir);
        };// end loop

//Check for -watch dir

        //if args.option('wa','watch')
        if (args.option('wa', 'watch')) {
        
            //watchDir Compiler,options
            watchDir(Compiler, options);
            //return //EXIT
            return;
        };

//get mainModuleName

        //only mainModuleName should be left
        //case args.items.length
        
            //when 0:
        if (
           (args.items.length==0)
        ){
                //if no options.mainModuleName
                if (!options.mainModuleName) {
                
                    //console.error '' + title + "\nMissing MainModule or -run filename.\nlite -h for help"
                    console.error('' + title + "\nMissing MainModule or -run filename.\nlite -h for help");
                    //process.exit 2
                    process.exit(2);
                };
        
        }
            //when 1:
        else if (
           (args.items.length==1)
        ){
                //options.mainModuleName = args.items[0]
                options.mainModuleName = args.items[0];
        
        }
        else {
                //console.error "Invalid (" + args.items.length + ") arguments:\", args.items.join(' ')\nlite -h for help"
                console.error("Invalid (" + args.items.length + ") arguments:\", args.items.join(' ')\nlite -h for help");
                //process.exit 2
                process.exit(2);
        };

//show options

        //if options.verboseLevel
        if (options.verboseLevel) {
        
            //print '' + title + "\ncompiler options: " + (JSON.stringify(options)) + "\ncwd: " + (process.cwd()) + "\ncompile " + (isCompileAndRun?"and run":"") + ": " + options.mainModuleName
            console.log('' + title + "\ncompiler options: " + (JSON.stringify(options)) + "\ncwd: " + (process.cwd()) + "\ncompile " + (isCompileAndRun ? "and run" : "") + ": " + options.mainModuleName);
        };

        //if options.debugEnabled, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.logger",color.normal
        if (options.debugEnabled) {console.log(color.yellow, "GENERATING COMPILER DEBUG AT out/debug.logger", color.normal)};

//Launch project compilation

//if "compile and run", load & compile then run it (eval)

        //if isCompileAndRun
        if (isCompileAndRun) {
        
            //compileAndRun compileAndRunParams, options
            compileAndRun(compileAndRunParams, options);
        }
        //if isCompileAndRun
        
        else {
            //Compiler.compileProject options
            Compiler.compileProject(options);
        };


//Exception handler

        //Exception err
        
        }catch(err){

            //if err instance of ControlledError
            if (err instanceof ControlledError) {
            
                //console.error color.red, err.message, color.normal
                console.error(color.red, err.message, color.normal);
                //process.exit 1
                process.exit(1);
            }
            //if err instance of ControlledError
            
            else if (err.code === 'EISDIR') {
            
                //console.error color.red, err.message, color.normal
                console.error(color.red, err.message, color.normal);
                //console.error 'Please specify a *file* as the main module to compile'
                console.error('Please specify a *file* as the main module to compile');
                //process.exit 2
                process.exit(2);
            }
            //else if err.code is 'EISDIR'
            
            else {
                //console.log 'UNCONTROLLED #{err.constructor.name}',err
                console.log('UNCONTROLLED ' + err.constructor.name, err);
                //throw err
                throw err;
            };
        };
    };

    //end function execute


    //    function compileAndRun(compileAndRunParams:array, options:GeneralOptions)
    


    //    function compileAndRun(compileAndRunParams:array, options:GeneralOptions)
    function compileAndRun(compileAndRunParams, options){

        //var nodeArgs = options.es6?" --harmony":""
        var nodeArgs = options.es6 ? " --harmony" : "";

        //var filename = options.mainModuleName
        var filename = options.mainModuleName;
        //if not fs.existsSync(filename), filename=options.mainModuleName+'.md'
        if (!(fs.existsSync(filename))) {filename = options.mainModuleName + '.md'};
        //if not fs.existsSync(filename), filename=options.mainModuleName+'.lite.md'
        if (!(fs.existsSync(filename))) {filename = options.mainModuleName + '.lite.md'};
        //if not fs.existsSync(filename), fail with 'Compile and Run,  File not found: "#{options.mainModuleName}"'
        if (!(fs.existsSync(filename))) {throw new Error('Compile and Run,  File not found: "' + options.mainModuleName + '"')};
        //var sourceLines = fs.readFileSync(filename)
        var sourceLines = fs.readFileSync(filename);
        //var compiledLines = Compiler.compile(filename,sourceLines,options);
        var compiledLines = Compiler.compile(filename, sourceLines, options);

//if options.es6, save compiled file, run with node --harmony

        //if options.es6
        if (options.es6) {
        
            //var outFile = path.join(options.outDir,options.mainModuleName+'.js')
            var outFile = path.join(options.outDir, options.mainModuleName + '.js');
            //fs.writeFileSync outFile,compiledLines.join("\n")
            fs.writeFileSync(outFile, compiledLines.join("\n"));
            //var exec = require('child_process').exec;
            var exec = require('child_process').exec;
            //var cmd = 'node #{nodeArgs} #{outFile} #{compileAndRunParams.join(" ")}'
            var cmd = 'node ' + nodeArgs + ' ' + outFile + ' ' + (compileAndRunParams.join(" "));
            //print cmd
            console.log(cmd);
            //exec cmd, function(error:Error, stdout, stderr)
                        //print stdout
                        //print stderr
                        //try # to delete generated temp file
                            //fs.unlink outFile
                        //catch err
                            //print err.message," at rm",outFile
                        //if error
                            //declare valid error.errno
                            //print "ERROR",error.code
                            //print error.message
                            //process.exit error.errno or 1

//else, run here (eval)

        //else
            exec(cmd, function (error, stdout, stderr){
                        //print stdout
                        console.log(stdout);
                        //print stderr
                        console.log(stderr);
                        //try # to delete generated temp file
                        try{
                            //fs.unlink outFile
                            fs.unlink(outFile);
                        
                        }catch(err){
                            //print err.message," at rm",outFile
                            console.log(err.message, " at rm", outFile);
                        };
                        //if error
                        if (error) {
                        
                            //declare valid error.errno
                            
                            //declare valid error.errno
                            //print "ERROR",error.code
                            console.log("ERROR", error.code);
                            //print error.message
                            console.log(error.message);
                            //process.exit error.errno or 1
                            process.exit(error.errno || 1);
                        };
            });
        }
        //if options.es6
        
        else {

            //compileAndRunParams.unshift 'lite',options.mainModuleName  #add 'lite filename...' to arguments
            compileAndRunParams.unshift('lite', options.mainModuleName);
            //if options.verboseLevel, print "RUN: #{compileAndRunParams.join(' ')}"
            if (options.verboseLevel) {console.log("RUN: " + (compileAndRunParams.join(' ')))};

//register require() extensions, so if .lite and .md LiteScript
//files can be required() from node

            //declare valid Compiler.registerRequireExtensions
            
            //declare valid Compiler.registerRequireExtensions
            //Compiler.registerRequireExtensions
            Compiler.registerRequireExtensions();

//hack for require(). Simulate we're at the run module dir,
//for require() to look at the same dirs as at runtime

            //declare on module paths:string array
            
            //declare on module paths:string array
            //declare valid module.constructor._nodeModulePaths
            
            //declare valid module.constructor._nodeModulePaths
            //module.filename = path.resolve(filename)
            module.filename = path.resolve(filename);
            //module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename))
            module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename));
            //__dirname = path.dirname(module.filename)
            __dirname = path.dirname(module.filename);

//set process.argv to parameters after "--run filename"

            //process.argv = compileAndRunParams
            process.argv = compileAndRunParams;

//run code

            //eval compiledLines.join("\n")
            eval(compiledLines.join("\n"));
        };
    };


    //    function watchDir(options:GeneralOptions)
    function watchDir(options){

//Watch a directory and compile when files change

        //options.compileIfNewer = true //compile only if source is newer
        options.compileIfNewer = true;

        //var mainDir = path.resolve('.')
        var mainDir = path.resolve('.');
        //console.log "watching dir #{mainDir}"
        console.log("watching dir " + mainDir);
        //var watcher = fs.watch(mainDir)
        var watcher = fs.watch(mainDir);
        //var readdirTimeout
        var readdirTimeout = undefined;

        //declare valid watcher.on
        
        //declare valid watcher.on
        //declare valid watcher.close
        
        //declare valid watcher.close

        //watcher.on 'error' -> err
          //watcher.close
          //throw err

        //watcher.on 'change' -> event,file
        watcher.on('error', function (err){
          //watcher.close
          watcher.close();
          //throw err
          throw err;
        });

        //watcher.on 'change' -> event,file
          //clearTimeout readdirTimeout
          //readdirTimeout = setTimeout( ->
                    //console.log "DIR CHANGE"
                    //compileOnChange(file, mainDir, options)
                //,250)

    //    function compileOnChange(file, dir, options)
        watcher.on('change', function (event, file){
          //clearTimeout readdirTimeout
          clearTimeout(readdirTimeout);
          //readdirTimeout = setTimeout( ->
                    //console.log "DIR CHANGE"
                    //compileOnChange(file, mainDir, options)
                //,250)
          readdirTimeout = setTimeout(function (){
                    //console.log "DIR CHANGE"
                    //compileOnChange(file, mainDir, options)
                    compileOnChange(file, mainDir, options);
          }, 250);
        });
    };

    //    function compileOnChange(file, dir, options)
    function compileOnChange(file, dir, options){
     try{

        //if file # we have specific file information
        if (file) {
        
            //if file like /\.(lite|lite\.md)$/
            if (/\.(lite|lite\.md)$/.test(file)) {
            
                //Compiler.compileProject file, options
                Compiler.compileProject(file, options);
            };
        }
        //if file # we have specific file information
        
        else {
            //# check entire dir
            //var files:array = fs.readdirSync(dir)
            var files = fs.readdirSync(dir);
            //for each dirFile in files where dirFile like /\.(lite|lite\.md)$/
            for( var dirFile__inx=0,dirFile ; dirFile__inx<files.length ; dirFile__inx++){dirFile=files[dirFile__inx];
              if(/\.(lite|lite\.md)$/.test(dirFile)){
                //Compiler.compileProject dirFile, options
                Compiler.compileProject(dirFile, options);
            }};// end for each in files
            
        };

        //Exception err
        
        }catch(err){
            //console.log err.message
            console.log(err.message);
        };
    };
