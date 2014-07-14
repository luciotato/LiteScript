The LiteScript Project Module
==============================
LiteScript is a highly readable language that compiles to JavaScript.

###Module Dependencies

The Project Class require all other modules to
compile LiteScript code.

    import 
        ASTBase, Grammar, Parser
        Names, Validate
        ControlledError, GeneralOptions
        logger, color, Strings

    shim import Map

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
### export default Class Project

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

        //lexer=undefined //dummy, to allow Project to be main module's parent

#### constructor new Project(filename, options:GeneralOptions)

Initialize this project. Project has a cache for required modules. 
As with node's `require` mechanism, a module, 
when imported|required is only compiled once and then cached.
    
        .name = 'Project'

        .options = options
        default options.now = new Date()

        .moduleCache = new Map 

        logger.errorCount = 0
        logger.options.verboseLevel = options.verboseLevel
        logger.options.warningLevel = options.warningLevel
        logger.options.debugOptions.enabled = options.debugEnabled
        if options.debugEnabled, logger.debugClear

set basePath from main module path

        var tempFileInfo = new Environment.FileInfo(filename)
        options.projectDir = tempFileInfo.dir
        options.mainModuleName = './#{tempFileInfo.base}'
        options.outDir = Environment.resolvePath(options.outDir)

        Environment.setBaseInfo options.projectDir, options.outDir, options.target

        logger.info 'Project Dir:',.options.projectDir
        logger.info 'Main Module:',.options.mainModuleName
        logger.info 'Out Dir:',.options.outDir

compiler vars, to use at conditional compilation
        
        .compilerVars = new Map

        for each def in options.defines
            .compilerVars.set def,new Names.Declaration(def)

add 'inNode' and 'inBrowser' as compiler vars

        #ifdef TARGET_JS
        .compilerVars.set 'ENV_JS', new Names.Declaration("ENV_JS")
        declare var window
        var inNode = type of window is 'undefined'
        if inNode
            .compilerVars.set 'ENV_NODE',new Names.Declaration("ENV_NODE")
        else
            .compilerVars.set 'ENV_BROWSER',new Names.Declaration("ENV_BROWSER")
        end if
        #endif

        #ifdef TARGET_C
        .compilerVars.set 'ENV_C', new Names.Declaration("ENV_C")
        #endif

        var targetDef = 'TARGET_#{options.target.toUpperCase()}'
        .compilerVars.set targetDef,new Names.Declaration(targetDef)

        logger.msg 'preprocessor #defined', .compilerVars.keys()

        //logger.message .compilerVars
        //logger.info ""

create a 'rootModule' module to hold global scope

        .rootModule = new Grammar.Module() //parent is Project
        .rootModule.name = '*Global Scope*' 

        .rootModule.fileInfo = new Environment.FileInfo('Project') 
        .rootModule.fileInfo.relFilename='Project'
        .rootModule.fileInfo.dir = options.projectDir
        .rootModule.fileInfo.outFilename = "#{options.outDir}/_project_"
        

Validate.initialize will prepare the global scope 
by parsing the file: "lib/GlobalScopeJS.interface.md"

        Validate.initialize this 

In 'options' we receive also the target code to generate. (default is 'js')

#### Method compile()

Import & compile the main module. The main module will, in turn, 'import' and 'compile' 
-if not cached-, all dependent modules. 

        var importInfo = new Environment.ImportParameterInfo
        importInfo.name = .options.mainModuleName
        .main = .importModule(.rootModule, importInfo)
        .main.isMain = true

        if logger.errorCount is 0
            logger.info "\nParsed OK"

Validate

        if no .options.skip 
            logger.info "Validating"
            Validate.validate this
            if logger.errorCount, logger.throwControlled '#{logger.errorCount} errors'

Produce, for each module

        logger.info "\nProducing #{.options.target} at #{.options.outDir}\n"

        for each moduleNode:Grammar.Module in map .moduleCache

          if not moduleNode.fileInfo.isCore and moduleNode.referenceCount 

            logger.extra "source:", moduleNode.fileInfo.importInfo.name
            var result:string

            if not moduleNode.fileInfo.isLite 
                logger.extra 'non-Lite module, copy to out dir.'
                #copy the file to output dir
                var contents = Environment.loadFile(moduleNode.fileInfo.filename)
                Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents)
                declare valid contents.length
                result = "#{contents.length>>10 or 1} kb"
                contents=undefined

            else

produce & get result target code
        
                .produceModule moduleNode
                var resultLines:string array =  moduleNode.lexer.outCode.getResult()

save to disk / add to external cache

                Environment.externalCacheSave moduleNode.fileInfo.outFilename,resultLines
                result = "#{resultLines.length} lines"

                #ifdef PROD_C
                resultLines =  moduleNode.lexer.outCode.getResult(1) //get .h file contents
                if resultLines.length
                    Environment.externalCacheSave '#{moduleNode.fileInfo.outFilename.slice(0,-1)}h',resultLines
                end if

                #else
                if moduleNode.lexer.out.sourceMap

                    Environment.externalCacheSave moduleNode.fileInfo.outFilename+'.map',
                            moduleNode.lexer.out.sourceMap.generate({
                                          generatedFile: moduleNode.fileInfo.basename+moduleNode.fileInfo.outExtension
                                          sourceFiles  : [moduleNode.fileInfo.sourcename]
                                          })
                end if
                #endif

                /*
                var exportedArray = moduleNode.exports.toExportArray()
                var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
                Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
                */

            end if

            logger.msg "#{color.green}[OK] #{result} -> #{moduleNode.fileInfo.outRelFilename} #{color.normal}"
            logger.extra #blank line

        end for each module cached

        logger.msg "#{logger.errorCount} errors, #{logger.warningCount} warnings."

        #ifdef PROD_C
        if no logger.errorCount, Producer_c.postProduction this
        #endif

#### Method compileFile(filename) returns Grammar.Module

        var filenameInfo = new Environment.FileInfo(filename)

        //search the file
        filenameInfo.searchModule .rootModule.fileInfo

        // create a module
        var newModule = .createNewModule(filenameInfo, .rootModule)

        // compile the file
        .compileFileOnModule filenameInfo.filename, newModule

        return newModule

#### Method compileFileOnModule(filename, moduleNode:Grammar.Module)

Compilation:
Load source -> Lexer/Tokenize -> Parse/create AST 

        logger.info Strings.spaces(this.recurseLevel*2),"compile: '#{Environment.relativeFrom(.options.projectDir,filename)}'"

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
        //var opt = new Names.NameDeclOptions
        //opt.normalizeModeKeepFirstCase = true
        moduleNode.exports = new Names.Declaration(fileInfo.base,undefined,moduleNode)
        moduleNode.exportsReplaced = false
        
        var moduleVar = moduleNode.addToScope('module')
        //moduleNode.exports = moduleVar.addMember('exports') #add as member of 'module'
        //var opt = new Names.NameDeclOptions
        //opt.pointsTo = moduleNode.exports
        //moduleNode.addToScope('exports',opt) #add also as 'exports' in scope

add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

        var fnameOpt = new Names.NameDeclOptions
        fnameOpt.value = fileInfo.filename
        moduleVar.addMember moduleNode.declareName('filename',fnameOpt)

Also, register every `import|require` in this module body, to track modules dependencies.
We create a empty a empty `.requireCallNodes[]`, to hold:
1. VariableRef, when is a require() call
2. each VariableDecl, from ImportStatements

        moduleNode.requireCallNodes=[]

        return moduleNode


#### Method produceModule(moduleNode:Grammar.Module)

        moduleNode.lexer.outCode.browser = .options.browser

        if .options.extraComments
            moduleNode.lexer.outCode.put "//Compiled by LiteScript compiler v#{.options.version}, source: #{moduleNode.fileInfo.filename}"
            moduleNode.lexer.outCode.startNewLine

        moduleNode.produce 

        #referenceSourceMap
        if no .options.nomap and moduleNode.fileInfo.outExtension is 'js'
            moduleNode.lexer.outCode.startNewLine
            moduleNode.lexer.outCode.put "//# sourceMappingURL=#{moduleNode.fileInfo.base}#{moduleNode.fileInfo.outExtension}.map"
        

#### Method importDependencies(moduleNode:Grammar.Module)

Check if this module 'imported other modules'. Process Imports (recursive)

        for each node in moduleNode.requireCallNodes

            var importInfo = new Environment.ImportParameterInfo

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
                    continue // do not import if shim and already declared

if it was 'global import, inform, els search will be local '.','./lib' and '../lib'

                declare valid node.parent.global 
                if node.parent instanceof Grammar.DeclareStatement
                    importInfo.isGlobalDeclare = true
                else if node.parent instanceof Grammar.ImportStatement 
                    importInfo.globalImport = node.parent.global 

else, If the origin is a require() call

            else if node instance of Grammar.VariableRef #require() call
                declare node:Grammar.VariableRef
                if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
                    var requireCall:Grammar.FunctionAccess = node.accessors[0]
                    if requireCall.args[0].expression.root.name instanceof Grammar.StringLiteral
                        var stringLiteral = requireCall.args[0].expression.root.name
                        importInfo.name = stringLiteral.getValue()

if found a valid filename to import

            if importInfo.name
                node.importedModule = .importModule(moduleNode, importInfo)

        #loop


#### Method importModule(importingModule:Grammar.Module, importInfo: Environment.ImportParameterInfo)

importParameter is the raw string passed to `import/require` statements,

*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        declare valid .recurseLevel

        .recurseLevel++
        var indent = Strings.spaces(.recurseLevel*2)

        logger.info ""
        logger.info indent,"'#{importingModule.fileInfo.relFilename}' imports '#{importInfo.name}'"

Determine the full module filename. Search for the module in the environment.

        var fileInfo = new Environment.FileInfo(importInfo)

        fileInfo.searchModule importingModule.fileInfo

Before compiling the module, check internal, and external cache

Check Internal Cache: if it is already compiled, return cached Module node

        if .moduleCache.has(fileInfo.filename) #registered
            logger.info indent,'cached: ',fileInfo.filename
            .recurseLevel--
            return .moduleCache.get(fileInfo.filename)

It isn't on internal cache, then create a **new Module**.

        var moduleNode = .createNewModule(fileInfo)

early add to local cache, to cut off circular references

        .moduleCache.set fileInfo.filename, moduleNode

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

        
        #ifndef PROD_C //except we're generating the compile-to-C compiler

Check if we're compiling for the browser

        if .options.browser
            if fileInfo.extension is '.js'
                logger.throwControlled 'Missing #{fileInfo.relPath}/#{fileInfo.basename}.interface.md for '
            else # assume a .lite.md file
                return false //getInterface returning false means call "CompileFile"

here, we're compiling for node.js environment
for .js file/core/global module, 
call node.js **require()** for parameter
and generate & cache interface

        if fileInfo.isCore or fileInfo.importInfo.globalImport or fileInfo.extension is '.js' 

            logger.info String.spaces(this.recurseLevel*2),
                fileInfo.isCore?"core module":"javascript file",
                "require('#{fileInfo.basename}')"

            if not fileInfo.isCore

hack for require(). Simulate we're at the importingModule dir
for node's require() function to look at the same dirs as at runtime

                declare on module paths:string array
                declare valid module.constructor._nodeModulePaths

                var savePaths = module.paths, saveFilename = module.filename
                module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname)
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
            nameDecl = new Names.Declaration(name)
            .compilerVars.set name, nameDecl

        nameDecl.setMember "**value**",value

#### helper method redirectOutput(newOut)

        for each moduleNode:Grammar.Module in map .moduleCache
              moduleNode.lexer.outCode = newOut

    end class Project

##Add helper properties and methods to AST node class Module

### Append to class Grammar.Module
#### Properties
        fileInfo #module file info
        exports: Names.Declaration # holds module.exports as members
        exportsReplaced: boolean # if exports was replaced by a ClassDeclaration with the module name
        requireCallNodes: Grammar.ImportStatementItem array #list of `import` item nodes or `require()` function calls (varRef)
        referenceCount
        
#### method getCompiledLines returns string array 
        return .lexer.outCode.getResult()

#### method getCompiledText returns string 
        return .lexer.outCode.getResult().join('\n')


### Append to class Grammar.VariableRef
#### Properties
        importedModule: Grammar.Module

### Append to class Grammar.ImportStatementItem
#### Properties
        importedModule: Grammar.Module