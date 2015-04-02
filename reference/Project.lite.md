The LiteScript Project Module
==============================
LiteScript is a highly readable language that compiles to JavaScript.

###Module Dependencies

    shim import Map

The Project Class require all other modules to
compile LiteScript code.

    import 
        ASTBase, Grammar, Parser
        Names, Validate
        ControlledError, GeneralOptions
        logger, color, shims, mkPath

Get the 'Environment' object for the compiler to use.
The 'Environment' object, must provide functions to load files, search modules, 
and a optional external cache (disk). 
The `Environment` abstraction allows us to support compile on server(node) or the browser.

    import Environment

Require the Producer (to include it in the dependency tree)

    #ifdef PROD_C
    import Producer_c
    #else
    import Producer_js
    #endif
    
----------------
### export only Class Project

A **Project** object acts as the rootModule for a complex AST spanning several related **Modules**

Normally, you launch the project compilation by calling `compile()` on the main module 
of your project. At `compile()` the main module is imported and compiled.

When a `ImportStatement: import IDENTIFIER`, or a `require()` call is found in the module code, 
the *imported|required* "child" module is loaded, compiled **and cached**. 
(is the same logic behind node's 'require' function).

This creates a **tree** of Modules, cached, and recursively parsed on demand.
The Modules dependency tree is the *Project tree*.

#### Properties

        options: GeneralOptions
        name
        moduleCache: Map string to Grammar.Module
        rootModule: Grammar.Module
        compilerVars: Map string to Names.Declaration
        main: Grammar.Module
        Producer
        recurseLevel = 0
        filesProducedCount

        //lexer=undefined //dummy, to allow Project to be main module's parent

#### constructor new Project(options:GeneralOptions)

Initialize this project. Project has a cache for required modules. 
As with node's `require` mechanism, a module, 
when imported|required is only compiled once and then cached.
    
        console.time 'Init Project'

        .name = 'Project'

        options.now = new Date()
        .options = options

        .moduleCache = new Map 

        logger.init options

calculate project dir from main module

        var tempFileInfo = new Environment.FileInfo(options.mainModuleName)
        options.projectDir = tempFileInfo.dir
        options.mainModuleName = '#{tempFileInfo.base}'

        options.outDir = Environment.resolvePath(options.outDir or '.')

        Environment.setBaseInfo options

        logger.msg 'Project Dir:',.options.projectDir
        logger.msg 'Main Module:',.options.mainModuleName
        logger.msg 'Out Dir:',.options.outDir

compiler vars, #defines, to use at conditional compilation
        
        .compilerVars = new Map

        for each def in options.defines
            .setCompilerVar def

add 'ENV_JS' => this compiler is JS code

        #ifdef TARGET_JS
        .setCompilerVar 'ENV_JS'
        .setCompilerVar options.browser? 'ENV_BROWSER' else 'ENV_NODE' 
        #endif

add 'ENV_C' => this compiler is C-code (*native exe*)

        #ifdef TARGET_C
        .setCompilerVar 'ENV_C' 
        #endif

add 'TARGET_x'

TARGET_JS: this is the compile-to-js version of LiteScript compiler

TARGET_C: this is the compile-to-c version of LiteScript compiler

        .setCompilerVar 'TARGET_#{options.target.toUpperCase()}'

        logger.msg 'preprocessor #defined', .compilerVars.keys()
        logger.info "" //blank line

create a 'rootModule' module to hold global scope

        .rootModule = new Grammar.Module() //parent is Project
        .rootModule.name = '*Global Scope*' 

        .rootModule.fileInfo = new Environment.FileInfo('Project') 
        .rootModule.fileInfo.relFilename='Project'
        .rootModule.fileInfo.dir = options.projectDir
        .rootModule.fileInfo.outFilename = "#{options.outDir}/_project_"
        
Validate.initialize will prepare the global scope 
by parsing the file: "interfaces/GlobalScope(JS|C|NODE|BROWSER).interface.md"

        Validate.initialize this 

        if options.perf>1, console.timeEnd 'Init Project'


#### Method compile()

Import & compile the main module. The main module will, in turn, 'import' and 'compile' 
all dependent modules. 

        logger.msg "Compiling",.options.mainModuleName

        var importInfo = new Environment.ImportParameterInfo
        importInfo.name = .options.mainModuleName
        importInfo.source = 'Project'
        importInfo.line=0

        console.time 'Parse'
        .main = .importModule(.rootModule, importInfo)
        .main.isMain = true

        if .options.perf>1, console.timeEnd 'Parse'

        if logger.errorCount is 0
            logger.info "\nParsed OK"

Validate

        if no .options.skip 
            logger.info "Validating"
            console.time 'Validate'
            Validate.execute
            if .options.perf>1, console.timeEnd 'Validate'
            if logger.errorCount, logger.throwControlled '#{logger.errorCount} errors'

Produce, for each module

        console.time 'Produce'
        logger.msg "Producing #{.options.target}"
        .filesProducedCount=0
        mkPath.create .options.outDir

        for each moduleNode:Grammar.Module in map .moduleCache

            var result:string
            logger.extra "source:", moduleNode.fileInfo.importInfo.name

            var shouldProduce = true
            if moduleNode.fileInfo.isCore or no moduleNode.referenceCount 
                shouldProduce = false
            
            if moduleNode.lexer.interfaceMode and .options.target is 'js'            
                // no interface files in js.
                shouldProduce = false

            if shouldProduce 

                if not moduleNode.fileInfo.isLite 
                    logger.extra 'non-Lite module, copy to out dir.'
                    #copy the file to output dir
                    logger.msg "Note: non-lite module '#{moduleNode.fileInfo.filename}' required"
                    result = moduleNode.fileInfo.filename

                else

produce & get result target code

                    moduleNode.lexer.outCode.filenames[0]=moduleNode.fileInfo.outFilename
                    moduleNode.lexer.outCode.filenames[1]='#{moduleNode.fileInfo.outFilename.slice(0,-1)}h'
                    moduleNode.lexer.outCode.fileMode=true //direct out to file 

                    .produceModule moduleNode

                    moduleNode.lexer.outCode.close
                    result = "#{moduleNode.lexer.outCode.lineNum} lines"

                    #ifdef PROD_JS
                    if .options.generateSourceMap
                        //console.time('Generate SourceMap #{moduleNode.fileInfo.base}')
                        Environment.externalCacheSave '#{moduleNode.fileInfo.outFilename}.map',
                                moduleNode.lexer.outCode.sourceMap.generate(
                                              moduleNode.fileInfo.base & moduleNode.fileInfo.outExtension
                                              ,''
                                              ,[Environment.relativeFrom(moduleNode.fileInfo.outDir,moduleNode.fileInfo.filename)]
                                              )
                        //if .options.perf, console.timeEnd('Generate SourceMap #{moduleNode.fileInfo.base}')
                    #endif

                end if

                logger.info color.green,"[OK]",result, " -> ",moduleNode.fileInfo.outRelFilename,color.normal
                logger.extra #blank line
                .filesProducedCount++

            end if //shouldProduce

        end for each module cached

        logger.msg "Generated .#{.options.target} files (#{.filesProducedCount}) at #{.options.outDir}"
        logger.msg "#{logger.errorCount} errors, #{logger.warningCount} warnings."

        #ifdef PROD_C
        if no logger.errorCount, Producer_c.postProduction this
        #endif

        if .options.perf>1, console.timeEnd 'Produce'

#### Method compileFile(filename) returns Grammar.Module

Called to compile GlobalScopeX.interface.md, from Validate module

        var filenameInfo = new Environment.FileInfo(filename)
        filenameInfo.importInfo.source = 'Compiler'
        filenameInfo.importInfo.line=0

        //search the file
        filenameInfo.searchModule .rootModule.fileInfo.dir

        // create a module
        var newModule = .createNewModule(filenameInfo, .rootModule)

        // compile the file
        .compileFileOnModule filenameInfo.filename, newModule

        return newModule


#### Method compileFileOnModule(filename, moduleNode:Grammar.Module)

Compilation:
Load source -> Lexer/Tokenize -> Parse/create AST 

        logger.info String.spaces(this.recurseLevel*2),"compile: '#{Environment.relativeFrom(.options.projectDir,filename)}'"

Load source code, parse

        .parseOnModule moduleNode, filename, Environment.loadFile(filename)

Check if this module 'imported other modules'. Process Imports (recursive)

        if no .options.single 
            .importDependencies moduleNode


#### method parseOnModule(moduleNode:Grammar.Module, filename, sourceLines)
This method will initialize lexer & parse  source lines into ModuleNode scope

set Lexer source code, process lines, tokenize

        logger.errorCount = 0

        var stage = "lexer"
        moduleNode.lexer.initSource( filename, sourceLines )
        moduleNode.lexer.process()

Parse source
        
        stage = "parsing"
        moduleNode.parse()

Check if errors were emitted

        if logger.errorCount, logger.throwControlled "#{logger.errorCount} errors emitted"

Handle errors, add stage info, and stack

        exception err
    
            if err instanceof ControlledError  //if not 'controlled' show lexer pos & call stack (includes err text)
                err = moduleNode.lexer.hardError or err //get important (inner) error
            else
                // uncontrolled
                // add position & stack
                err.message = "#{moduleNode.lexer.posToString()}\n#{err.stack or err.message}" 

            logger.error err.message

            #show last soft error. Can be useful to pinpoint the problem
            if moduleNode.lexer.softError, logger.msg "previous soft-error: #{moduleNode.lexer.softError.message}"

            //if process #we're in node.js
            //    process.exit(1) 
            //else
            throw err

#### method createNewModule(fileInfo, parent) returns Grammar.Module

create a **new Module** and then create a **new lexer** for the Module 
(each module has its own lexer. There is one lexer per file)

        default parent = .rootModule

        var moduleNode = new Grammar.Module(parent)
        moduleNode.name = fileInfo.filename
        moduleNode.fileInfo = fileInfo
        moduleNode.referenceCount = 0

create a Lexer for the module. The Lexer receives this module exports as a "compiler"
because the lexer preprocessor can compile marcros and generate code on the fly
via 'compiler generate'

        moduleNode.lexer = new Parser.Lexer(this, .options)

Now create the module scope, with two local scope vars: 
'module' and 'exports = module.exports'. 'exports' will hold all exported members.

        moduleNode.createScope()
        moduleNode.exports = new Names.Declaration('exports', {
                nodeClass:Grammar.NamespaceDeclaration
                normalizeModeKeepFirstCase:true
                }
                , moduleNode)
        moduleNode.exportsReplaced = false
        
        var moduleVar = moduleNode.addToScope('module',{nodeClass:Grammar.NamespaceDeclaration})
        //moduleNode.exports = moduleVar.addMember('exports') #add as member of 'module'
        //var opt = new Names.NameDeclOptions
        //opt.pointsTo = moduleNode.exports
        //moduleNode.addToScope('exports',opt) #add also as 'exports' in scope

add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

        moduleVar.addMember moduleNode.declareName('filename',{value:fileInfo.filename, nodeClass:Grammar.VariableDecl})

Also, register every `import|require` in this module body, to track modules dependencies.
We create a empty a empty `.requireCallNodes[]`, to hold:
1. VariableRef, when is a require() call
2. each VariableDecl, from ImportStatements

        moduleNode.requireCallNodes=[]

        return moduleNode


#### Method produceModule(moduleNode:Grammar.Module)

        moduleNode.lexer.outCode.browser = .options.browser

        if .options.comments
            moduleNode.lexer.outCode.put "//Generated by LiteScript compiler v#{.options.version}, source: #{moduleNode.fileInfo.relFilename}"
            moduleNode.lexer.outCode.startNewLine

        moduleNode.produce 

        #referenceSourceMap
        if .options.generateSourceMap and moduleNode.fileInfo.outExtension is '.js'
            moduleNode.lexer.outCode.startNewLine
            moduleNode.lexer.outCode.put "//# sourceMappingURL=#{moduleNode.fileInfo.base}#{moduleNode.fileInfo.outExtension}.map"
        

#### Method importDependencies(moduleNode:Grammar.Module)

Check if this module 'imported other modules'. Process Imports (recursive)<br>
Note: This function does not get called if lite was run with the '-s' option

        for each node:ASTBase in moduleNode.requireCallNodes

            var importInfo = new Environment.ImportParameterInfo
            importInfo.source=moduleNode.fileInfo.filename
            importInfo.line=node.sourceLineNum


get import parameter, and parent Module
store a pointer to the imported module in 
the statement AST node

If the origin is: ImportStatement/global Declare

            if node instance of Grammar.ImportStatementItem
                declare node:Grammar.ImportStatementItem
                if node.importParameter
                    importInfo.name = node.importParameter.getValue()                        
                else
                    importInfo.name = node.name

                if node.hasAdjective('shim') and node.findInScope(importInfo.name) 
                    continue // do not import if "shim import" and already declared

if it was 'global declare' set flags

                if node.parent instanceof Grammar.DeclareStatement
                    importInfo.isGlobalDeclare = true

                else if node.parent instanceof Grammar.ImportStatement 
                    importInfo.globalImport = node.hasAdjective("global")

if found a valid filename to import

            if importInfo.name
                node.importedModule = .importModule(moduleNode, importInfo)

        #loop


#### Method importModule(importingModule:Grammar.Module, importInfo: Environment.ImportParameterInfo)

importParameter is the raw string passed to `import/require` statements,

*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        declare valid .recurseLevel

        .recurseLevel++
        var indent = String.spaces(.recurseLevel*2)

        logger.info ""
        logger.info indent,"'#{importingModule.fileInfo.relFilename}' imports '#{importInfo.name}'"

Determine the full module filename. Search for the module in the environment.

        var fileInfo = new Environment.FileInfo(importInfo)

        fileInfo.searchModule importingModule.fileInfo.dir

        var moduleNode

Before compiling the module, check internal, and external cache

Check Internal Cache: if it is already compiled, return cached Module node

        if .moduleCache.has(fileInfo.filename) #registered
            logger.info indent,'cached: ',fileInfo.filename
            moduleNode =  .moduleCache.get(fileInfo.filename)
            moduleNode.dependencyTreeLevelOrder++
            if moduleNode.dependencyTreeLevel<=importingModule.dependencyTreeLevel 
                moduleNode.dependencyTreeLevel=importingModule.dependencyTreeLevel+1
            .recurseLevel--
            return moduleNode

It isn't on internal cache, then create a **new Module**.

        moduleNode = .createNewModule(fileInfo)
        moduleNode.dependencyTreeLevel = .recurseLevel

early add to local cache, to cut off circular references

        .moduleCache.set fileInfo.filename, moduleNode
        moduleNode.importOrder = .moduleCache.size

Check if we can get exports from a "interface.md" file

        if .getInterface(importingModule, fileInfo, moduleNode)
            #getInterface also loads and analyze .js interfaces

            #if it is an interface, but loaded from 'import' statement
            #we increment .referenceCount in order to produce the file
            if not importInfo.isGlobalDeclare, moduleNode.referenceCount++

else, we need to compile the file 
    
        else 

            if importingModule is .rootModule and .options.compileIfNewer and fileInfo.outFileIsNewer 
                do nothing //do not compile if source didnt change
            else
                this.compileFileOnModule fileInfo.filename, moduleNode
                moduleNode.referenceCount++


at last, return the parsed Module node

        this.recurseLevel-=1
        return moduleNode 

    #end importModule



#### method getInterface(importingModule,fileInfo, moduleNode:Grammar.Module )
If a 'interface' file exists, compile interface declarations instead of file
return true if interface (exports) obtained

        if fileInfo.interfaceFileExists 
            # compile interface
            this.compileFileOnModule fileInfo.interfaceFile, moduleNode
            return true //got Interface

if we're generating c-code, a interface or file must exist

        if .options.target is 'c', return 

else, if we're running on node.js 
we can try a "hack". 
We call "require(x.js)" here and generate the interface 
from the loaded module exported object

        #ifdef TARGET_JS //if this compiler generates js code

Check if we're compiling for the browser

        if .options.browser
            if fileInfo.extension is '.js'
                logger.throwControlled 'Missing #{fileInfo.relPath}/#{fileInfo.base}.interface.md'
            else # assume a .lite.md file
                return false //getInterface returning false means call "CompileFile"

here, we're compiling for node.js environment
for .js file/core/global module, 
call node.js **require()** for parameter
and generate & cache interface

        if fileInfo.isCore or fileInfo.importInfo.globalImport or fileInfo.extension is '.js' 

            logger.info String.spaces(this.recurseLevel*2),
                fileInfo.isCore?"core module":"javascript file",
                "require('#{fileInfo.base}')"

            if not fileInfo.isCore

hack for require(). Simulate we're at the importingModule dir
for node's require() function to look at the same dirs as at runtime

                declare on module paths:string array
                declare valid module.constructor._nodeModulePaths

                var savePaths = module.paths, saveFilename = module.filename
                module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dir)
                module.filename = importingModule.fileInfo.filename
                logger.debug "importingModule", module.filename

            var requiredNodeJSModule = require(fileInfo.importInfo.name)
            moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule)

            if not fileInfo.isCore #restore
                module.paths= savePaths
                module.filename= saveFilename
            
            return true

        #endif // skip node-js code if we're generatice the compile-to-C compiler


#### helper method compilerVar(name) returns Names.Declaration // or undefined
helper compilerVar(name)
return rootModule.compilerVars.members[name].value

        return .compilerVars.get(name) 

#### helper method setCompilerVar(name,value) 
helper compilerVar(name)
rootModule.compilerVars.members.set(name,value)

        if no .compilerVars.get(name) into var nameDecl
            nameDecl = new Names.Declaration(name,{nodeClass:Grammar.VariableDecl})
            .compilerVars.set name, nameDecl

        nameDecl.setMember "**value**",value

#### helper method redirectOutput(newOut)

        for each moduleNode:Grammar.Module in map .moduleCache
              moduleNode.lexer.outCode = newOut

    end class Project

##Add helper properties and methods to AST node class Module

### Append to class Grammar.Module
#### Properties
        isMain: boolean
        fileInfo #module file info
        exports: Names.Declaration # holds module.exports as members
        exportsReplaced: boolean # if exports was replaced by a item with 'export only'
        requireCallNodes: Grammar.ImportStatementItem array #list of `import` item nodes or `require()` function calls (varRef)
        referenceCount
        movedToGlobal: boolean 
        
#### method getCompiledLines returns string array 
        return .lexer.outCode.getResult()

#### method getCompiledText returns string 
        return .lexer.outCode.getResult().join('\n')


/*### Append to class Grammar.VariableRef
#### Properties
        importedModule: Grammar.Module
*/

### Append to class Grammar.ImportStatementItem
#### Properties
        importedModule: Grammar.Module
