##Lite-c
This is the command line interface to LiteScript Compiler,
when it is generated as C-code standalone executable 

    #define C_LITE

    global import fs, path

    import color, ControlledError
    import OptionsParser  

    import GeneralOptions, Compiler, ASTBase

    var 
        VERSION = '0.8.5'
        BUILD_DATE = '__DATE__'

## module vars

    var usage = """
    
    LiteScript compiler v#{VERSION} #{BUILD_DATE} (standalone executable)
    
    Usage: litec main.lite.md [options]
    
    options are:
    -o dir           output dir. Default is './out'
    -v, -verbose     verbose level, default is 0 (0-3)
    -w, -warning     warning level, default is 1 (0-1)
    -comments        comment level on generated files, default is 1 (0-2)
    -version         print LiteScript version & exit

    Advanced options:
    -D FOO -D BAR    Defines preprocessor names (#ifdef FOO/#ifndef BAR)
    -nm, -nomap      do not generate sourcemap
    -d, -debug       enable full compiler debug log file at 'out/debug.logger'
    -perf            0..2: show performance timers
    
    """

Get & parse command line arguments

    var args = new OptionsParser(process.argv)

    var options = new GeneralOptions()

Check for -help

    if args.option('h','help') 
        print usage
        process.exit 0

Check for -version

    if args.option('vers','version') 
        print VERSION
        process.exit 0

Check for other options

    with options

        .outDir         = path.resolve(args.valueFor('o') or './out') //output dir
        .verboseLevel   = parseInt(args.valueFor('v',"verbose") or 0) 
        .warningLevel   = parseInt(args.valueFor('w',"warning") or 1)
        .perf           = parseInt(args.valueFor('perf',"performance") or 0)
        .comments       = parseInt(args.valueFor('comment',"comments") or 1) 
        .debugEnabled   = args.option('d',"debug") 
        .generateSourceMap = args.option('nm',"nomap")? false:true // do not generate sourcemap

    if options.verboseLevel>1
        print JSON.stringify(process.argv)

    while args.valueFor('D') into var newDef
        options.defines.push newDef

    while args.valueFor('i') into var includeDir
        options.includeDirs.push includeDir

get mainModuleName

    if no args.items.length
        console.error "Missing file.lite.md to compile\nlitec -h for help"
        process.exit 

    //only main module name should be left
    if args.items.length>1
        print "Invalid arguments:", args.items.join(' ')
        print "litec -h for help"
        process.exit 2
        
    options.mainModuleName = args.items[0]

show options

    //console.log(process.cwd());
    if options.verboseLevel 
        print """
            LiteScript compiler version: #{Compiler.version} #{Compiler.buildDate}
            compiler options: #{JSON.stringify(options)}
            cwd: #{process.cwd()}
            compile: #{options.mainModuleName}
            """

    if options.debugEnabled, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.logger",color.normal

launch project compilation

    startCompilation


### function startCompilation

        Compiler.compileProject(options);

Compile Exception handler

        Exception err

            if err instance of ControlledError
                console.error color.red, err.message, color.normal
                process.exit 1
            
            else if err.code is 'EISDIR'
                console.error '#{color.red}ERROR: "#{options.mainModuleName}" is a directory#{color.normal}'
                console.error 'Please specify a *file* as the main module to compile'
                process.exit 2
            
            else 
                console.error 'UNCONTROLLED ERROR:'
                console.error err
                console.error 'stack:',err.stack
                process.exit 3
        
