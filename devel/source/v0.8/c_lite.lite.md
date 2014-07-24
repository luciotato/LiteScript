##Lite-c
This is the command line interface to LiteScript Compiler,
when it is generated as C-code standalone executable 

    //lexer options literal map 
    //call new Map() to create literal objects 
    // `{name:value}` => `new Map().fromObject({name:value})` 

    global import fs, path

    import color, ControlledError
    import OptionsParser  

    import GeneralOptions, Compiler, ASTBase

    //lexer options literal map

    var 
        VERSION = '0.8.1'
        BUILD_DATE = '__TIMESTAMP__'

## module vars

    var usage = """
    
    LiteScript-C v#{VERSION} #{BUILD_DATE}
    
    Usage: litec main.lite.md [options]
    
    options are:
    -o dir           output dir. Default is './out'
    -v, -verbose     verbose level, default is 0 (0-3)
    -w, -warning     warning level, default is 1 (0-1)
    -comments        comment level on generated files, default is 1 (0-2)
    -version         print LiteScript version & exit

    Advanced options:
    -D FOO -D BAR    Defines preprocessor names (#ifdef FOO/#ifndef BAR)
    -d, -debug       enable full compiler debug log file at 'out/debug.logger'
    
    """

Get & parse command line arguments

    print JSON.stringify(process.argv)

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

    if args.valueFor('r','run') into mainModuleName
        compileAndRunOption = true
        compileAndRunParams = args.items.splice(args.lastIndex) #remove params after --run


Check for other options

    var options = new GeneralOptions()

    with options

        .outDir  = path.resolve(args.valueFor('o') or './out') //output dir
        .verboseLevel = parseInt(args.valueFor('v',"verbose") or 0) 
        .warningLevel = parseInt(args.valueFor('w',"warning") or 1)
        .comments= parseInt(args.valueFor('comment',"comments") or 1) 
        .debugEnabled = args.option('d',"debug") 
        .defines = []


    //var compilerPath = use and use.charAt(0) is 'v'? '../../liteCompiler-#{use}' : '.'

    while args.valueFor('D') into var newDef
        options.defines.push newDef

get mainModuleName

    if no args.items.length
        console.error "Missing file.lite.md to compile\nlite -h for help"
        process.exit 

    //only main module name should be left
    if args.items.length>1
        print "Invalid arguments:", args.items.join(' ')
        print "lite -h for help"
        process.exit 2
        
    mainModuleName = args.items[0]

show args

    //console.log(process.cwd());
    if options.verboseLevel > 1
        print """
            compiler version: #{Compiler.version} #{Compiler.buildDate}
            compiler options: \n#{options}
            cwd: #{process.cwd()}
            compile: #{mainModuleName}
            """

        if options.debugEnabled 
            print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.logger",color.normal

launch project compilation

    startCompilation

    function startCompilation

        Compiler.compileProject(mainModuleName, options);

Compile Exception handler

        exception err

            if err instance of ControlledError
                console.error color.red, err.message, color.normal
                process.exit 1
            
            else if err.code is 'EISDIR'
                console.error '#{color.red}ERROR: "#{mainModuleName}" is a directory#{color.normal}'
                console.error 'Please specify a *file* as the main module to compile'
                process.exit 2
            
            else 
                console.error 'UNCONTROLLED ERROR:'
                console.error err
                console.error err.stack
                process.exit 3
        
