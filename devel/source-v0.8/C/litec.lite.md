## This is the command line interface to LiteScript-C Compiler

    import path, fs
    import OptionsParser,color from '../color'

    import Compiler from '../Compiler'

    var VERSION = '0.8.1'

## module vars

    var usage = """
    
    LiteScript-C v#{VERSION}
    
    Usage: 
            litec -compile mainModule.lite.md [options]

    This command will compile mainModule.lite.md
    
    options are:
    -c, -compile     compile project, mainModule & all dependent files
    -o dir           output dir. Default is '.'
    -v, -verbose     verbose level, default is 0 (0-3)
    -w, -warning     warning level, default is 1 (0-1)
    -comments        comment level on generated files, default is 1 (0-2)
    -version         print LiteScript version & exit

    Advanced options:
    -s,  -single     compile single file. do not follow import/require() calls
    -ifn, -ifnew     compile only if source is newer
    -noval           skip property name validation
    -D FOO -D BAR    Defines preprocessor names (#ifdef FOO/#ifndef BAR)
    -u, -use vX.Y.Z  select LiteScript Compiler Version to use (devel)
    -d, -debug       enable full compiler debug log file at 'out/debug.log'
    
    """

    class LiteC_Options
        properties
            outDir
            verbose
            warning
            comments
            target
            debug
            skip
            single
            compileIfNewer
            defines : array of string
        
        constructor(args:OptionsParser)
            .outDir  = path.resolve(args.value('o') or '.') //output dir
            .verbose = Number(args.value('v',"verbose") or 0) 
            .warning = Number(args.value('w',"warning") or 1)
            .comments= Number(args.value('comment',"comments") or 1) 
            .target  = args.value('target') or 'js' //target
            .debug   = args.option('d',"debug") 
            .skip    = args.option('noval',"novalidation") // skip name validation
            .single  = args.option('s',"single") // single file- do not follow require() calls
            .compileIfNewer= args.option('ifn',"ifnew") // single file, compile if source is newer
            .defines = []

        method toString
            return """
                outDir:#{.outDir}
                verbose:#{.verbose}
                defines:#{.defines.join()}
                """

    end class

start the program

    initFunction()

### function initFunction()

Get & process command line arguments

        var args = new OptionsParser(process.argv)

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
            compileAndRunParams = args.items.splice(args.lastIndex) #remove params after --run

get compiler version to --use

        var use = args.value('u','use')

Check for other options

        var options = new LiteC_Options(args)

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

        var Compiler
        declare valid Compiler.compileProject
        declare valid Compiler.compile

        declare valid Compiler.version
        declare valid Compiler.buildDate

        /*
        if options.verbose, print 'LiteScript compiler version #{Compiler.version}  #{Compiler.buildDate}'
        */

get mainModuleName

        if no mainModuleName, mainModuleName = args.value('c',"compile") 

        //no args should be left
        if args.items.length
            print "Invalid arguments:", args.items.join(' ')
            print "lite -h for help"
            process.exit 2
            
        if no mainModuleName
            console.error "Missing -compile MainModule or -run filename.\nlite -h for help"
            process.exit 2

show args

        //console.log(process.cwd());
        if options.verbose>1
            print '\n\ncompiler path: #{compilerPath}'
            print 'compiler options: \n#{options}'
            print 'cwd: #{process.cwd()}'
            print 'compile#{compileAndRunOption?" and run":""}: #{mainModuleName}'
            if options.debug, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.log",color.normal


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

            declare valid e.extra.get
            declare valid e.extra.has
            if e.extra and e.extra.has("controled")
                console.error(color.red, e.message, color.normal);
                process.exit(1);
            
            else if e.extra and e.extra.get("code") is 'EISDIR'
                console.error('#{color.red}ERROR: "#{mainModuleName}" is a directory#{color.normal}');
                console.error('Please specify a *file* as the main module to compile');
                process.exit(2);
            
            else 
                console.log('UNCONTROLED ERROR:');
                console.log(e);
                throw e;
        
        end exception

    end main function

### function launchCompilation( mainModuleName, options)

        do nothing
        //Compiler.compileProject(mainModuleName, options);

### function compileAndRun(compileAndRunParams,mainModuleName,options)

        fail with 'NOT IMPLEMENTED for C code generation'
