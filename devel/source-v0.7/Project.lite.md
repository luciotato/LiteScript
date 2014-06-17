The LiteScript Project Module
==============================
LiteScript is a highly readable language that compiles to JavaScript.

###Module Dependencies

The Project Class require all other modules to
compile LiteScript code.

    import 
        ASTBase, Grammar, Lexer
        NameDeclaration, Validate
        log

    var debug = log.debug

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

A **Project** object acts as the root for a complex AST spanning several related **Modules**

Normally, you launch the project compilation by calling `compile()` on the main module 
of your project. At `compile()` the main module is imported and compiled.

When a `ImportStatement: import IDENTIFIER`, or a `require()` call is found in the module code, 
the *imported|required* "child" module is loaded, compiled **and cached**. 
(is the same logic behind node's 'require' function).

This creates a **tree** of Modules, cached, and recursively parsed on demand.
The Modules dependency tree is the *Project tree*.

#### Properties

        options
        name
        moduleCache
        root: Grammar.Module
        compilerVars: NameDeclaration
        globalScope: NameDeclaration
        main: Grammar.Module
        Producer
        recurseLevel = 0

#### constructor new Project(filename, options)

normalize options

        #ifdef PROD_C
        var DEFAULT_TARGET="c"
        #else
        var DEFAULT_TARGET="js"
        #end if

        default options =
            verbose: 1
            warning: 1
            comments: 1
            target: DEFAULT_TARGET
            outDir: '.'
            debug: undefined
            skip: undefined
            nomap: undefined
            single: undefined
            compileIfNewer: undefined
            browser:undefined
            extraComments:1
            defines:[]

            mainModuleName: filename
            basePath: undefined
            outBasePath: options.outDir


Initialize this project. Project has a cache for required modules. 
As with node's `require` mechanism, a module, 
when imported|required is only compiled once and then cached.
    
        .name = 'Project'
        .options = options
        .moduleCache = {}

        log.error.count = 0
        log.options.verbose = options.verbose
        log.options.warning = options.warning
        log.options.debug.enabled = options.debug
        if options.debug, log.debug.clear

set basePath from main module path

        Environment.setBasePath filename,options

        log.info 'Base Path:',.options.basePath
        log.info 'Main Module:',.options.mainModuleName
        log.info 'Out Base Path:',.options.outBasePath

create a 'root' dummy-module to hold global scope

        .root = new Grammar.Module(this)
        .root.name = 'Project Root'
        .root.fileInfo = new Environment.FileInfo({name:'Project'}) 
        .root.fileInfo.relFilename='Project'
        .root.fileInfo.dirname = options.basePath

The "scope" of rootNode is the global scope. 
Initialize the global scope

        Validate.createGlobalScope this 

Note: we defer requiring utility string functions to *after* **createGlobalScope**
to avoid tainting core classes in the compiled module global scope.
In 'string-shims' we add methods to core's String & Array

        import StringShims

compiler vars, to use at conditional compilation
        
        .compilerVars = new NameDeclaration("Compiler Vars")
        .compilerVars.addMember 'debug',{value:true}

        for each def in options.defines
            .compilerVars.addMember def,{value:true}

add 'inNode' and 'inBrowser' as compiler vars

        declare var window
        var inNode = type of window is 'undefined'
        .compilerVars.addMember 'inNode',{value:inNode}
        .compilerVars.addMember 'inBrowser',{value: not inNode}

        //log.info .root.compilerVars
        //log.info ""

in 'options' we receive also the target code to generate. (default is 'js')

Now we load the **Producer** module for the selected target code.

The **Producer** module will append to each Grammar class a `produce()` method
which generates target code for the AST class
    
        .Producer = require('./Producer_'+options.target)

#### Method compile()

Import & compile the main module. The main module will, in turn, 'import' and 'compile' 
-if not cached-, all dependent modules. 

        .main = .importModule(.root, {name:.options.mainModuleName})

        if log.error.count is 0
            log.info "\nParsed OK"

Validate

        if no .options.skip 
            log.info "Validating"
            Validate.validate this
            if log.error.count, log.throwControled log.error.count,"errors"

Produce, for each module

        log.info "\nProducing #{.options.target} at #{.options.outDir}\n"

        #ifdef PROD_C
        Producer_c.preProduction this
        #endif

        for each own property filename in .moduleCache
          var moduleNode:Grammar.Module = .moduleCache[filename]

          if not moduleNode.fileInfo.isCore and moduleNode.referenceCount 

            log.extra "source:", moduleNode.fileInfo.importInfo.name
            var result:string

            if not moduleNode.fileInfo.isLite 
                log.extra 'non-Lite module, copy to out dir.'
                #copy the file to output dir
                var contents = Environment.loadFile(moduleNode.fileInfo.filename)
                Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents)
                declare valid contents.length
                result = "#{contents.length>>10 or 1} kb"
                contents=undefined

            else

produce & get result target code
        
                .produceModule moduleNode
                var resultLines:array =  moduleNode.lexer.out.getResult()

save to disk / add to external cache

                Environment.externalCacheSave moduleNode.fileInfo.outFilename,resultLines
                result = "#{resultLines.length} lines"

                #ifdef PROD_C
                resultLines =  moduleNode.lexer.out.getResult(1) //get .h file contents
                if resultLines.length
                    Environment.externalCacheSave moduleNode.fileInfo.outFilename.slice(0,-1)+'h',resultLines
                #endif

                #ifdef PROD_C
                do nothing //no source map
                #else
                if moduleNode.lexer.out.sourceMap

                    Environment.externalCacheSave moduleNode.fileInfo.outFilename+'.map',
                            moduleNode.lexer.out.sourceMap.generate({
                                          generatedFile: moduleNode.fileInfo.basename+moduleNode.fileInfo.outExtension
                                          sourceFiles  : [moduleNode.fileInfo.sourcename]
                                          })
                #end if

    /*
                var exportedArray = moduleNode.exports.toExportArray()
                var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
                Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
    */

            end if

            log.message "#{log.color.green}[OK] #{result} -> #{moduleNode.fileInfo.outRelFilename} #{log.color.normal}"
            log.extra #blank line

        end for each module cached

        log.message "#{log.error.count} errors, #{log.warning.count} warnings."

        #ifdef PROD_C
        if no log.error.count, Producer_c.postProduction this
        #endif

#### Method compileFile(filename, moduleNode:Grammar.Module)

Compilation:
Load source -> Lexer/Tokenize -> Parse/create AST 

        log.info String.spaces(this.recurseLevel*2),"compile: '#{Environment.relName(filename,.options.basePath)}'"

Load source code, parse

        .parseOnModule moduleNode, filename, Environment.loadFile(filename)

Check if this module 'imported other modules'. Process Imports (recursive)

        if no .options.single
            .importDependencies moduleNode



#### method parseOnModule(moduleNode:Grammar.Module, filename, sourceLines)
This method will initialize lexer & parse  source lines into ModuleNode scope

set Lexer source code, process lines, tokenize

        log.error.count = 0

        var stage = "lexer"
        moduleNode.lexer.initSource( filename, sourceLines )
        moduleNode.lexer.process()

Parse source
        
        stage = "parsing"
        moduleNode.parse()

Check if errors were emitted

        if log.error.count
            var errsEmitted = new Error("#{log.error.count} errors emitted")
            errsEmitted.controled = true
            throw errsEmitted

Handle errors, add stage info, and stack

        exception err
    
            err = moduleNode.lexer.hardError or err //get important (inner) error
            if not err.controled  //if not 'controled' show lexer pos & call stack (includes err text)
                declare valid err.stack
                err.message = "#{moduleNode.lexer.posToString()}\n#{err.stack or err.message}"

            log.error err.message

            #show last soft error. Can be useful to pinpoint the problem
            if moduleNode.lexer.softError, log.message "previous soft-error: #{moduleNode.lexer.softError.message}"

            //if process #we're in node.js
            //    process.exit(1) 
            //else
            throw err

#### method createNewModule(fileInfo) returns Grammar.Module

create a **new Module** and then create a **new lexer** for the Module 
(each module has its own lexer. There is one lexer per file)

        var moduleNode = new Grammar.Module(.root)
        moduleNode.name = fileInfo.filename
        moduleNode.fileInfo = fileInfo
        moduleNode.referenceCount = 0

create a Lexer for the module. The Lexer receives this module exports as a "compiler"
because the lexer preprocessor can compile marcros and generate code on the fly
via 'compiler generate'

        moduleNode.lexer = new Lexer(module.exports, this, .options)

Now create the module scope, with two local scope vars: 
'module' and 'exports = module.exports'. 'exports' will hold all exported members.

        moduleNode.createScope()
        var moduleVar = moduleNode.addToScope('module')
        moduleNode.exports = moduleVar.addMember('exports') #add as member of 'module'
        moduleNode.addToScope('exports',{pointsTo:moduleNode.exports}) #add also as 'exports' in scope

add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

        moduleVar.addMember moduleNode.declareName('filename',{value: fileInfo.filename})

Also, register every `import|require` in this module body, to track modules dependencies.
We create a empty a empty `.requireCallNodes[]`, to hold:
1. VariableRef, when is a require() call
2. each VariableDecl, from ImportStatements

        moduleNode.requireCallNodes=[]

        return moduleNode


#### Method produceModule(moduleNode:Grammar.Module)

        moduleNode.lexer.out.browser = .options.browser

        if .options.extraComments
            moduleNode.lexer.out.put "//Compiled by LiteScript compiler v#{Project.version}, source: #{moduleNode.fileInfo.filename}"
            moduleNode.lexer.out.startNewLine

        moduleNode.produce 

        #referenceSourceMap
        if no .options.nomap and moduleNode.fileInfo.outExtension
            moduleNode.lexer.out.startNewLine
            moduleNode.lexer.out.put "//# sourceMappingURL=#{moduleNode.fileInfo.basename+moduleNode.fileInfo.outExtension+'.map'}"
        

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

if it was 'global import, inform, els search will be local '.','./lib' and '../lib'

                declare valid node.parent.global 
                if node.parent instanceof Grammar.DeclareStatement
                    importInfo.interface = true
                else if node.parent instanceof Grammar.ImportStatement 
                    importInfo.globalImport = node.parent.global 

else, If the origin is a require() call

            else if node instance of Grammar.VariableRef #require() call
                declare node:Grammar.VariableRef
                if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
                    var requireCall:Grammar.FunctionAccess = node.accessors[0]
                    if requireCall.args[0].root.name instanceof Grammar.StringLiteral
                        importInfo.name = requireCall.args[0].root.name.getValue()

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

        log.info ""
        log.info indent,"'#{importingModule.fileInfo.relFilename}' imports '#{importInfo.name}'"

Determine the full module filename. Search for the module in the environment.

        var fileInfo = new Environment.FileInfo(importInfo)

        fileInfo.searchModule importingModule.fileInfo, .options

Before compiling the module, check internal, and external cache

Check Internal Cache: if it is already compiled, return cached Module node

        if .moduleCache.hasOwnProperty(fileInfo.filename) #registered
            log.info indent,'cached: ',fileInfo.filename
            .recurseLevel--
            return .moduleCache[fileInfo.filename]

It isn't on internal cache, then create a **new Module**.

        var moduleNode = .createNewModule(fileInfo)

early add to local cache, to cut off circular references

        .moduleCache[fileInfo.filename] = moduleNode

Check if we can get exports from a "interface.md" file

        if .getInterface(importingModule, fileInfo, moduleNode)
            #getInterface also loads and analyze .js interfaces
            do nothing

else, we need to compile the file 
    
        else 

            if importingModule is .root and .options.compileIfNewer and fileInfo.outFileIsNewer 
                do nothing //do not compile if source didnt change
            else
                this.compileFile fileInfo.filename, moduleNode
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
            this.compileFile fileInfo.interfaceFile, moduleNode
            return true //got Interface

Check if we're compiling for the browser

        if .options.browser
            if fileInfo.extension is '.js'
                log.throwControled 'Missing #{fileInfo.relPath}/#{fileInfo.basename}.interface.md for '
            else # assume a .lite.md file
                return false //getInterface returning false means call "CompileFile"

here, we're compiling for node.js environment
for .js file/core/global module, 
call node.js **require()** for parameter
and generate & cache interface

        if fileInfo.isCore or fileInfo.importInfo.globalImport or fileInfo.extension is '.js' 

            log.info String.spaces(this.recurseLevel*2),
                fileInfo.isCore?"core module":"javascript file",
                "require('#{fileInfo.relFilename}')"

            if not fileInfo.isCore
                #hack for require(). Simulate we're at the importingModule dir
                #for require() fn to look at the same dirs as at runtime
                declare on module paths:string array
                declare valid module.constructor._nodeModulePaths
                #declare valid module.filename
                var save = {paths:module.paths, filename: module.filename}
                module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname)
                module.filename = importingModule.fileInfo.filename
                debug "importingModule", module.filename

            var requiredNodeJSModule = require(fileInfo.importInfo.name)
            moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule)

            if not fileInfo.isCore #restore
                module.paths= save.paths
                module.filename= save.filename
            
            return true

#### helper method compilerVar(name) 
helper compilerVar(name)
return root.compilerVars.members[name].value

        var compVar = .compilerVars.findOwnMember(name) 
        if compVar, return compVar.findOwnMember("**value**")

#### helper method setCompilerVar(name,value) 
helper compilerVar(name)
set root.compilerVars.members[name].value

        var compVar = .compilerVars.findOwnMember(name) 
        if no compVar, compVar = .compilerVars.addMember(name)
        compVar.setMember "**value**",value

#### helper method redirectOutput(newOut)

        for each own property filename in .moduleCache
              var moduleNode:Grammar.Module = .moduleCache[filename]
              moduleNode.lexer.out = newOut

    end class Project

### Append to namespace Project
#### properties // as namespace properties
        version:string #version. set from compiler


##Add helper properties and methods to AST node class Module

### Append to class Grammar.Module
#### Properties
        fileInfo #module file info
        exports: NameDeclaration # holds module.exports as members
        requireCallNodes: Grammar.ImportStatementItem array #list of `import` item nodes or `require()` function calls (varRef)
        referenceCount
        
#### method getCompiledLines returns array
        return .lexer.out.getResult()

#### method getCompiledText returns string 
        return .lexer.out.getResult().join('\n')


### Append to class Grammar.VariableRef
#### Properties
        importedModule: Grammar.Module

### Append to class Grammar.ImportStatementItem
#### Properties
        importedModule: Grammar.Module


----------------
### Append to class NameDeclaration
#### helper method toExportArray() 

converts .members={} to 
simpler arrays for JSON.stringify & cache

      #declare valid .members
      #declare valid item.type.fullName
      #declare valid item.itemType.fullName

      #FIX WITH for each own property
      if .members
        var result = []
        # FIX with for each property
        for each prop in Object.keys(.members)
          var item:NameDeclaration = .members[prop]
          var membersArr:array = item.toExportArray() #recursive
          # FIX with Ternary
          var arrItem= {name:item.name}

          declare valid arrItem.members
          declare valid arrItem.type
          declare valid arrItem.itemType
          declare valid arrItem.value

          if membersArr.length
            arrItem.members = membersArr

          if item.hasOwnProperty('type') and item.type
            arrItem.type = item.type.toString()

          if item.hasOwnProperty('itemType') and item.itemType
            arrItem.itemType = item.itemType.toString()

          if item.hasOwnProperty('value')
            arrItem.value = item.value

          result.push arrItem

      return result

----------------
### Append to class NameDeclaration
#### helper method importMembersFromArray(exportedArr: NameDeclaration array) ### Recursive

Inverse of helper method toExportObject() 
converts exported object, back to NameDeclarations and .members[]

        #declare item:Grammar.Identifier

        for each item in exportedArr
          var nameDecl = new NameDeclaration(item.name or '(unnamed)')
          if item.hasOwnProperty('type')
            nameDecl.type = item.type
          if item.hasOwnProperty('value')
            nameDecl.value = item.value
          .addMember nameDecl 
          if item.members
            nameDecl.importMembersFromArray(item.members) #recursive
