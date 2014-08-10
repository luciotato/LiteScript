##Lite-c
This is the command line interface to LiteScript Compiler,
when it is generated as C-code standalone executable 

    #define C_LITE

    import fs, path

    import color, ControlledError
    import OptionsParser  

    import GeneralOptions, Compiler, ASTBase

    var 
        VERSION = '0.8.5'
        BUILD_DATE = '__DATE__'

## module vars

    var options = new GeneralOptions()

    var usage = """
    
    LiteScript compiler v#{VERSION} #{BUILD_DATE} (standalone executable)
    
    Usage: litec main.lite.md [options]
    
    options are:
    -o dir           output dir. Default is '#{options.outDir}'
    -v, -verbose     verbose level, default is #{options.verboseLevel} (0-3)
    -w, -warning     warning level, default is #{options.warningLevel} (0-1)
    -c, -comment     comment level on generated files, default is #{options.comments} (0-2)

    -h, -help        print this help
    -version         print LiteScript version & exit

    Advanced options:
    -D FOO -D BAR    #define preprocessor names (#ifdef FOO/#ifndef BAR)
    -nm, -nomap      do not generate sourcemap
    -d, -debug       enable full compiler debug log file at 'out/debug.logger'
    -perf            0..2: show performance timers
    
    """

Get & parse command line arguments

    var args = new OptionsParser(process.argv)

Check for -help

    if args.option('h','help') 
        print usage
        process.exit 0

Check for -version

    if args.option('vers','version') 
        print VERSION
        process.exit 0

Check for other options

    var optValue

    with options

        if args.valueFor('o') into optValue,            .outDir = path.resolve(optValue) //output dir
        if args.valueFor('v',"verbose") into optValue,  .verboseLevel = parseInt(optValue)
        if args.valueFor('w',"warning") into optValue,  .warningLevel = parseInt(optValue)
        if args.valueFor('c',"comment") into optValue,  .comments = parseInt(optValue)
        if args.valueFor('perf') into optValue,         .perf = parseInt(optValue)

        if args.option('d',"debug"),     .debugEnabled = true
        if args.option('noval'),         .skip = true
        if args.option('nm',"nomap"),    .generateSourceMap = false // do not generate sourcemap
        if args.option('s',"single"),    .single = true // single file- do not follow imports
        if args.option('b',"browser"),   .browser = true // single file- do not follow imports
        if args.option('es6',"harmony"), .browser = true // single file- do not follow imports

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
        
