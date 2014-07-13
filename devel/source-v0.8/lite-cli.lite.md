## This is the command line interface to LiteScript Compiler

    global import path,fs
    import Args

    var VERSION = '0.8.0'

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
    -o dir           output dir. Default is './out'
    -b, -browser     compile for a browser environment (window instead of global, no process, etc)
    -v, -verbose     verbose level, default is 0 (0-3)
    -w, -warning     warning level, default is 1 (0-1)
    -comments        comment level on generated files, default is 1 (0-2)
    -version         print LiteScript version & exit

    Advanced options:
    -s,  -single     compile single file. do not follow import/require() calls
    -ifn, -ifnew     compile only if source is newer
    -wa, -watch      watch current dir for source changes and compile
    -es6, --harmony  used with -run, uses node --harmony
    -nm, -nomap      do not generate sourcemap
    -noval           skip property name validation
    -D NAME -D NAME  Defines names for preprocessing with #ifdef
    -u, -use vX.Y.Z  select LiteScript Compiler Version to use (devel)
    -d, -debug       enable full compiler debug logger file at 'out/debug.logger'
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

        var 
            mainModuleName
            compileAndRunOption:boolean
            compileAndRunParams:array

Check for -help

        if args.option('h','help') 
            print usage
            process.exit 0

Check for -version

        if args.option('vers','version') 
            print VERSION
            process.exit 0

Check for -run

        if args.value('r','run') into mainModuleName
            compileAndRunOption = true
            compileAndRunParams = args.splice(args.lastIndex) #remove params after --run

get compiler version to --use

        var use = args.value('u','use')

Check for other options

        var options = 
            outDir  : path.resolve(args.value('o') or './out') //output dir
            verboseLevel : Number(args.value('v',"verbose") or 0) 
            warningLevel : Number(args.value('w',"warning") or 1)
            comments: Number(args.value('comment',"comments") or 1) 
            target  : args.value('target') or 'js' //target
            debugEnabled   : args.option('d',"debug") 
            skip    : args.option('noval',"novalidation") // skip name validation
            nomap   : args.option('nm',"nomap") // do not generate sourcemap
            single  : args.option('s',"single") // single file- do not follow require() calls
            compileIfNewer: args.option('ifn',"ifnew") // single file, compile if source is newer
            browser : args.option('b',"browser") 
            es6     : args.option('es6',"harmony") 
            defines : []

        var compilerPath = case 
            when use like /^v.*/ then '../../liteCompiler-#{use}' 
            when no use then '.'
            else use
        end 

        while args.value('D') into var newDef
            options.defines.push newDef

load required version of LiteScript compiler

        #declare global __dirname
        #print "at: #{__dirname}, require '#{compilerPath}/Compiler.js'"

        var Compiler = require('#{compilerPath}/Compiler.js');

        declare valid Compiler.version
        declare valid Compiler.buildDate
        if options.verboseLevel, print 'LiteScript compiler version #{Compiler.version}  #{Compiler.buildDate}'

Check for -watch dir

        if args.option('wa','watch')
            watchDir Compiler,options
            return //EXIT

get mainModuleName

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
        if options.verboseLevel>1
            print '\n\ncompiler path: #{compilerPath}'
            print 'compiler options: #{JSON.stringify(options)}'
            print 'cwd: #{process.cwd()}'
            print 'compile#{compileAndRunOption?" and run":""}: #{mainModuleName}'
            if options.debug, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.logger",color.normal


launch project compilation

        try

if "compile and run", load & compile single file and run it

            if compileAndRunOption
                compileAndRun compileAndRunParams, Compiler, mainModuleName, options

else, launch compile Project

            else
                launchCompilation Compiler, mainModuleName, options

Compile Exception handler

        exception e

            if e instance of ConstrolledError 
                console.error color.red, e.message, color.normal
                process.exit 1
            
            else if e.code is 'EISDIR'
                console.error color.red, 'ERROR: "#{mainModuleName}" is a directory',color.normal
                console.error 'Please specify a *file* as the main module to compile'
                process.exit 2
            
            else 
                console.log 'UNCONTROLLED ERROR:',e
                throw e
        
        end exception

    end main function


### function launchCompilation(Compiler, mainModuleName, options)

        declare valid Compiler.compile

        if Compiler has property 'compileProject' #v0.4
            declare valid Compiler.compileProject
            Compiler.compileProject(mainModuleName, options);

        else # v0.3 and lower
            Compiler.compile(mainModuleName, options);
        
        end if

### function compileAndRun(compileAndRunParams,Compiler,mainModuleName,options)

        var nodeArgs = options.es6?" --harmony":"" +
                       options.debug?" --debug-brk":""

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
                            process.exit error.errno or 1

        else //run here

            compileAndRunParams.unshift 'lite',mainModuleName  #add 'lite filename...' to arguments
            if options.verboseLevel, print "RUN: #{compileAndRunParams.join(' ')}"
            
register require() extensions, so if .lite and .md LiteScript 
files can be required() from node

            declare valid Compiler.registerRequireExtensions
            Compiler.registerRequireExtensions

hack for require(). Simulate we're at the run module dir,
for require() to look at the same dirs as at runtime

            declare on module paths:string array
            declare valid module.constructor._nodeModulePaths
            module.filename = path.resolve(filename)
            module.paths = module.constructor._nodeModulePaths(path.dirname(module.filename))
            __dirname = path.dirname(module.filename)

set process.argv to parameters after "--run filename"

            process.argv = compileAndRunParams

run code

            eval compiledCode

### function watchDir(Compiler, options)

Watch a directory and compile when files change
    
        options.compileIfNewer = true //compile only if source is newer

        var mainDir = path.resolve('.')
        console.log "watching dir #{mainDir}"
        var watcher = fs.watch(mainDir)
        var readdirTimeout

        watcher.on 'error' -> err
          watcher.close
          throw err

        watcher.on 'change' -> event,file
          clearTimeout readdirTimeout
          readdirTimeout = setTimeout(
                function
                    //console.log "DIR CHANGE"
                    compileOnChange(file, Compiler, mainDir, options) 
                ,250)

### function compileOnChange(file, Compiler, dir, options)
    
        if file # we have specific file information
            if file like /\.(lite|lite\.md)$/
                launchCompilation Compiler, file, options
        else
            # check entire dir
            var files:array = fs.readdirSync(dir)
            for each dirFile in files where dirFile like /\.(lite|lite\.md)$/
                try
                    launchCompilation Compiler, dirFile, options

            
        exception err
            console.log err.message
