The LiteScript Compiler Module
==============================
LiteScript is a highly readable language that compiles to JavaScript.

    public var version = '0.8.8'

    public var buildDate = "__DATE__ __TIME__"

This v0.8 compiler is written in v0.7 syntax. 
That is, you use the v0.7 compiler to compile this code 
and you get a v0.8 compiler, suporting v0.8 syntax.

Today 2014-07-22, V0.8 can compile itself to .js and to .c

###Module Dependencies

The Compiler module is the main interface to LiteScript Project module.
    
    import 
        Project, Validate, GeneralOptions
        Grammar 
        logger, shims
    
Get the 'Environment' object for the compiler to use.
The 'Environment' object, must provide functions to load files, search modules, 
and a optional external cache (disk). 
The `Environment` abstraction allows us to support compile on server(node) or the browser.

    import Environment

   
## Main API functions: LiteScript.compileProject & LiteScript.compile 

### export Function compileProject (options:GeneralOptions) returns Project

The 'compileProject' function will load and compile the main Module of a project. 
The compilation of the main module will trigger import and compilation of all its "child" modules 
(dependency tree is constructed by `import`/`require` between modules)

The main module is the root of the module dependency tree, and can reference
another modules via import|require.

Create a 'Project' to hold the main module and dependant modules

        #since "options" come from a external source, it can be anything
        options = prepareOptions(options)

        console.time 'Total Compile Project'

        var project = new Project(options)

        project.compile

        if options.perf
            console.timeEnd 'Total Compile Project'

        return project

After generating all modules, if no errors occurred, 
mainModuleName and all its dependencies will be compiled in the output dir

### export Function compile (filename, sourceLines, options: GeneralOptions) returns array of string

Used to compile source code loaded in memory (instead of loading a file)
result is sotred also in memory (instead of writing to a file)

input: 
* filename (for error reporting), 
* sourceLines: LiteScript code: string array | large string | Buffer 
* options: GeneralOptions

output: 
* string, compiled code

        #since "options" come from a external source, it can be anything
        options = prepareOptions(options)

        if options.storeMessages
            logger.options.storeMessages = true
            logger.getMessages //clear

        var moduleNode = compileModule(filename, sourceLines, options)

        return moduleNode.getCompiledLines()


## Secondary Function: compileModule, returns Grammar.Module

### export Function compileModule (filename, sourceLines, options:GeneralOptions) returns Grammar.Module
Compile a module from source in memory
input: 
* filename (for error reporting), 
* sourceLines: LiteScript code: string array | large string | Buffer 
* options: GeneralOptions

output: 
* moduleNode: Grammar.Module: module's code AST root node 

        default filename = 'unnamed'
        options.mainModuleName = filename

        #since "options" come from a external source, it can be anything
        options = prepareOptions(options)

        var project = new Project(options)

        var fileInfo = new Environment.FileInfo(filename)

        var moduleNode = project.createNewModule(fileInfo)

add to module list, so WalkAllNodes includes it

        project.moduleCache.set fileInfo.filename, moduleNode

store result in memory
        
        moduleNode.lexer.outCode.fileMode=false

parse source lines

        project.parseOnModule moduleNode, filename, sourceLines

        if no project.options.single
            project.importDependencies moduleNode

validate var & property names

        if no project.options.skip

            Validate.execute
            if logger.errorCount is 0, logger.info "Validation OK"

initialize out buffer & produce target code 
    
        logger.msg "Generating #{project.options.target}"

        project.produceModule moduleNode
        # the produced code will be at: moduleNode.lexer.out.getResult() :string array

        if logger.errorCount isnt 0, logger.throwControlled "#logger.errorCount errors during compilation"

text compiled result can be obtained with: moduleNode.lexer.out.getResult() :string array

        return moduleNode

### helper function prepareOptions(options) returns GeneralOptions


        if options isnt instance of GeneralOptions

            var generalOptions = new GeneralOptions
            for each own property key,value in options
                generalOptions.setProperty key, value
            end for
            options = generalOptions


        options.version = version

        return options


Require Extensions
------------------

only if this compiler will generate js code

    #ifdef TARGET_JS

This segment adds extensions to node's `require` function 
for LiteScript files so that you can just `require` a .lite.md file 
without having to compile it ahead of time 

    helper function extension_LoadLS(requiringModule, filename)

Read the file, then compile using the `compile` function above. 
Then use node's built-in compile function to compile the generated JavaScript.

        var options = new GeneralOptions
        options.verboseLevel = 0
        options.warningLevel = 0 
        var content = compile(filename, Environment.loadFile(filename),options)
        declare valid requiringModule._compile:function
        requiringModule._compile(content, filename)


    export helper function registerRequireExtensions
    
Add the extension for all appropriate file types. Don't overwrite `.md` in case CoffeeScript or something else is already using it.

        declare valid require.extensions :array

        if require.extensions

          require.extensions['.lite.md'] = extension_LoadLS
          require.extensions['.lite'] = extension_LoadLS
          require.extensions['.md'] = extension_LoadLS

    #endif 

##Helper module functions

### public function getMessages() returns string array
if compile() throws, call getMessages() to retrieve compiler messages

        return logger.getMessages();

