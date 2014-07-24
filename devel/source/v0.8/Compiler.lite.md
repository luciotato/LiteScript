The LiteScript Compiler Module
==============================
LiteScript is a highly readable language that compiles to JavaScript.

    public var version = '0.8.4'

    public var buildDate = '20140722'

This v0.8 compiler is written in v0.7 syntax. 
That is, you use the v0.7 compiler to compile this code 
and you get a v0.8 compiler, suporting v0.8 syntax.

Today 2014-07-22, V0.8 can compile itself to .js and to .c

###Module Dependencies

The Compiler module is the main interface to LiteScript Project module.
    
    import 
        Project, Validate
        Grammar 
        logger, GeneralOptions
    
Get the 'Environment' object for the compiler to use.
The 'Environment' object, must provide functions to load files, search modules, 
and a optional external cache (disk). 
The `Environment` abstraction allows us to support compile on server(node) or the browser.

    import Environment

   
## Main API functions: LiteScript.compile & LiteScript.compileProject

### export Function compile (filename, sourceLines, options: GeneralOptions) returns string

Used to compile source code loaded in memory (instead of loading a file)
input: 
* filename (for error reporting), 
* sourceLines: LiteScript code: string array | large string | Buffer 

output: 
* string, compiled code

        options.version = version

        if options.storeMessages
            logger.options.storeMessages = true
            logger.getMessages //clear

        var moduleNode = compileModule(filename, sourceLines, options)

        return moduleNode.getCompiledText()


### export Function compileProject (mainModule, options:GeneralOptions) returns Project

The 'compileProject' function will load and compile the main Module of a project. 
The compilation of the main module will trigger import and compilation of all its "child" modules 
(dependency tree is constructed by `import`/`require` between modules)

The main module is the root of the module dependency tree, and can reference
another modules via import|require.

Create a 'Project' to hold the main module and dependant modules

        #ifdef PROD_C
        default options.outDir = 'out'
        default options.target = 'c'
        #else
        default options.outDir = 'out'
        default options.target = 'js'
        #endif

        options.version = version

        console.time 'Total Compile Project'

        var project = new Project(mainModule, options)

        project.compile

        console.timeEnd 'Total Compile Project'

        return project

After generating all modules, if no errors occurred, 
mainModuleName and all its dependencies will be compiled in the output dir

## Secondary Function: compileModule, returns Grammar.Module

### export Function compileModule (filename, sourceLines, options:GeneralOptions) returns Grammar.Module
Compile a module from source in memory
input: 
* filename (for error reporting), 
* sourceLines: LiteScript code: string array | large string | Buffer 

output: 
* moduleNode: Grammar.Module: module's code AST root node 

		default filename = 'unnamed'

        options.version = version

        var project = new Project(filename, options)

        var fileInfo = new Environment.FileInfo(filename)

        var moduleNode = project.createNewModule(fileInfo)

parse source lines & store in moduleCache for validation
        
        project.parseOnModule moduleNode, filename, sourceLines
        project.moduleCache.set filename,moduleNode

import dependencies

        if no project.options.single
            project.importDependencies moduleNode

validate var & property names

        if no project.options.skip

            Validate.validate project
            if logger.errorCount is 0, logger.info "Validation OK"

initialize out buffer & produce target code 
    
        logger.info "Generating #{project.options.target}"

        project.produceModule moduleNode
        # the produced code will be at: moduleNode.lexer.out.getResult() :string array

        if logger.errorCount isnt 0, logger.throwControlled "#logger.errorCount errors during compilation"

text compiled result can be obtained with: moduleNode.lexer.out.getResult() :string array

        return moduleNode


    #ifndef PROD_C

Require Extensions
------------------

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
        declare valid requiringModule._compile
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

