## This is the command line interface to LiteScript Compiler

    global import path,fs
    import Args

    var VERSION = '0.6.3'

## usage, module vars

    var usage = """
    
    LiteScript v#{VERSION}
    
    Usage: 
            lite -compile mainModule.lite.md [options]
            lite -run mainModule.lite.md [options]

    This command will launch the LiteScript Compiler on mainModule.lite.md
    
    options are:
    -r, -run         compile & run .lite.md file
    -c, -compile     compile project, mainModule & all dependent files
    -o dir           output dir. Default is '.'
    -b, -browser     compile for a browser environment (window instead of global, no process, etc)
    -v, -verbose     verbose level, default is 1 (0-2)
    -w, -warning     warning level, default is 1 (0-1)
    -comments        comment level on generated files, default is 1 (0-2)
    -version         print LiteScript version & exit

    Advanced options:
    -es6, --harmony  used with -run, uses node --harmony
    -s,  -single     compile single file. do not follow import/require() calls
    -nm, -nomap      do not generate sourcemap
    -noval           skip name validation
    -u, -use vX.Y.Z  select LiteScript Compiler Version to use (devel)
    -d, -debug       enable full compiler debug log file at 'out/debug.log'
    -run -debug      when -run used with -debug, launch compiled file with: node --debug-brk 
    
    """

    var color=
            normal:   "\x1b[39;49m"
            red:      "\x1b[91m"
            yellow:   "\x1b[93m"
            green:    "\x1b[32m" 


### public Function main

Get & process command line arguments

        var args = new Args(process.argv)

        var compileAndRun, mainModuleName, compileAndRunParams:array

        var defaultVerbose = 1

Check for -help

        if args.option('h','help') 
            print usage
            process.exit 0

Check for -version

        if args.option('vers','version') 
            print VERSION
            process.exit 0

Check for --run

        if args.value('r','run') into mainModuleName
            compileAndRun = true
            compileAndRunParams = args.splice(args.lastIndex) #remove params after --run
            defaultVerbose = 0

get compiler version to --use

        var use = args.value('u','use')

Check for other options

        var options = 
            outDir  : path.resolve(args.value('o') or '.') //output dir
            verbose : Number(args.value('v',"verbose")or defaultVerbose) 
            warning : Number(args.value('w',"warning")or 1)
            comments: Number(args.value('comment',"comments") or 1) 
            debug   : args.option('d',"debug") 
            skip    : args.option('noval',"novalidation") // skip name validation
            nomap   : args.option('nm',"nomap") // do not generate sourcemap
            single  : args.option('s',"single") // single file- do not follow require() calls
            browser : args.option('b',"browser") 
            es6     : args.option('es6',"harmony") 

        var compilerPath = use ? '../../liteCompiler-#{use}' else '.'

        if no mainModuleName, mainModuleName = args.value('c',"compile") 

        //no args should be left
        if args.length
            print "Invalid arguments:", args.join(' ')
            print "lite -h for help"
            process.exit 2
            
        if no mainModuleName
            console.error "Missing -compile MainModule or -run filename.\nlite -h for help"
            process.exit 2

show args

        //console.log(process.cwd());
        if options.verbose
            print '\n\ncompiler path: #{compilerPath}'
            print 'compiler options: #{JSON.stringify(options)}'
            print 'cwd: #{process.cwd()}'
            print 'compile#{compileAndRun?" and run":""}: #{mainModuleName}'
            if options.debug, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.log",color.normal

load required version of LiteScript compiler

        #declare global __dirname
        #print "at: #{__dirname}, require '#{compilerPath}/Compiler.js'"

        var Compiler = require('#{compilerPath}/Compiler.js');

launch project compilation

        declare valid Compiler.version
        declare valid Compiler.compile
        if options.verbose, print 'LiteScript compiler version #{Compiler.version}'

        try

if "compile and run", load & compile single file and run it

            if compileAndRun

                var nodeArgs = options.es6? " --harmony" else "" +
                               options.debug? " --debug-brk" else ""

                var filename = mainModuleName
                if not fs.existsSync(filename), filename=mainModuleName+'.md'
                if not fs.existsSync(filename), filename=mainModuleName+'.lite.md'
                if not fs.existsSync(filename), fail with 'Compile and Run,  File not found: "#{mainModuleName}"'
                var sourceLines = fs.readFileSync(filename)
                var compiledCode = Compiler.compile(filename,sourceLines,options);

                // if options.debug, save compiled file, run node --debug.brk
                if options.debug or options.es6
                    var outFile = path.join(options.outDir,mainModuleName+'.js')
                    fs.writeFileSync outFile,compiledCode
                    var exec = require('child_process').exec;
                    if options.debug, print "***LAUNCHING NODE in DEBUG MODE***"
                    var cmd = 'node #{nodeArgs} #{outFile} #{compileAndRunParams.join(" ")}'
                    print cmd
                    exec cmd, function(error, stdout, stderr) 
                                declare error:Error
                                print stdout
                                print stderr
                                if no options.debug
                                    try # to delete generated temp file
                                        fs.unlink outFile
                                    catch err 
                                        print err.message," at rm",outFile
                                end if
                                if error 
                                    print "ERROR",error.code
                                    print error.message
                                    process.exit error.code or 1

                    

else, launch compile Project

            else
                if Compiler has property 'compileProject' #v0.4
                    declare valid Compiler.compileProject
                    Compiler.compileProject(mainModuleName, options);

                else # v0.3 and lower
                    Compiler.compile(mainModuleName, options);
                
                end if

Compile Exception handler

        exception e

            declare valid e.controled
            declare valid e.code
            if e.controled
                console.error(color.red, e.message, color.normal);
                process.exit(1);
            
            else if e.code is 'EISDIR'
                console.error(color.red + 'ERROR: "'+mainModuleName+'" is a directory',color.normal);
                console.error('Please specify a *file* as the main module to compile');
                process.exit(2);
            
            else 
                console.log('UNCONTROLED ERROR:');
                console.log(e);
                throw e;
        
After compilation

if --run, Run

        if compileAndRun and not (options.debug or options.es6) #es6 and -debug: save .js & run in a new process
            compileAndRunParams.unshift 'lite',mainModuleName  #add 'lite filename...' to arguments
            if options.verbose, print "RUN: #{compileAndRunParams.join(' ')}"
            
register require() extensions, so .lite and .md LiteScript files are recognized,
loaded and compiled

            declare valid Compiler.registerRequireExtensions
            Compiler.registerRequireExtensions

hack for require(). Simulate we're at the run module dir,
for require() to look at the same dirs as at runtime

            declare global module
            declare on module paths:string array
            declare valid module.constructor._nodeModulePaths
            module.filename = path.resolve(filename)
            module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename))
            __dirname = path.dirname(module.filename)

set process.argv to parameters after --run filename

            process.argv = compileAndRunParams

run code

            eval compiledCode

