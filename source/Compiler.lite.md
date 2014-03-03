The LiteScript Compiler Module
==============================
LiteScript is a highly readable language that compiles to JavaScript.

    export var version = '0.6.1'

This v0.6 compiler is written in v0.5 syntax. 
That is, you use the v0.5 compiler to compile this code 
and you get a v0.6 compiler, suporting v0.6 syntax.

###Module Dependencies

The Compiler module is the main module, requiring all other modules to
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

    import Producer_js

## Main API functions: LiteScript.compile & LiteScript.compileProject

### export Function compile (filename, sourceLines, options) returns string

Used to compile source code loaded in memory (instead of loading a file)
input: 
* filename (for error reporting), 
* sourceLines: LiteScript code: string array | large string | Buffer 

output: 
* string, compiled code

        var moduleNode = compileModule(filename, sourceLines, options)

        return moduleNode.getCompiledText()


### export Function compileProject (mainModule, options) returns Project

The 'compileProject' function will load and compile the main Module of a project. 
The compilation of the main module will trigger import and compilation of all its "child" modules 
(dependency tree is constructed by `import`/`require` between modules)

The main module is the root of the module dependency tree, and can reference
another modules via import|require.

        default options = 
            outDir: '.'
            target: 'js'

        log.extra "Out Dir: #{options.outDir}"

Create a 'Project' to hold the main module and dependant modules

        var project = new Project(mainModule, options)

        project.compile

        return project

After generating all modules, if no errors occurred, 
mainModuleName and all its dependencies will be compiled in the output dir

## Secondary Function: compileModule, returns Grammar.Module

### export Function compileModule (filename, sourceLines, options) returns Grammar.Module
Compile a module from source in memory
input: 
* filename (for error reporting), 
* sourceLines: LiteScript code: string array | large string | Buffer 

output: 
* moduleNode: Grammar.Module: module's code AST root node 

        var project = new Project(filename, options )

        var fileInfo = new Environment.FileInfo(filename)

        var moduleNode = project.createNewModule(fileInfo)

parse source lines & store in moduleCache for validation
        
        project.parseOnModule moduleNode, filename, sourceLines
        project.moduleCache[filename] = moduleNode

import dependencies

        if no project.options.single
            project.importDependencies moduleNode

validate var & property names

        if no project.options.skip

            Validate.validate project
            if log.error.count is 0, log.message "Validation OK"

initialize out buffer & produce target code 
    
        log.message "Generating #{project.options.target}"
        project.produceModule moduleNode
        # the produced code will be at: moduleNode.lexer.out.getResult() :string array

        if log.error.count isnt 0, log.throwControled "#log.error.count errors during compilation"

text compiled result can be obtained with: moduleNode.lexer.out.getResult() :string array

        return moduleNode


----------------
### Class Project

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
        globalScope: NameDeclaration
        mainModuleFileInfo
        main: Grammar.Module
        Producer
        recurseLevel = 0

#### constructor new Project(filename, options)

normalize options

        default options =
            verbose: 1
            warning: 1
            comments: 1
            target: 'js'
            outDir: '.'
            debug: undefined
            skip: undefined
            nomap: undefined
            single: undefined
            browser:undefined
            extraComments: true

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

        log.message 'Base Path:',.options.basePath
        log.message 'Main Module:',.options.mainModuleName
        log.message 'Out Base Path:',.options.outBasePath

create a 'root' dummy-module to hold global scope

        .root = new Grammar.Module(this)
        .root.name = 'Project Root'
        .root.fileInfo = new Environment.FileInfo('./Project') 
        .root.fileInfo.relFilename='Project'
        .root.fileInfo.dirname = options.basePath

The "scope" of rootNode is the global scope. 
Initialize the global scope

        Validate.createGlobalScope this 

Note: we defer requiring utility string functions to *after* **createGlobalScope**
to avoid tainting core classes in the compiled module global scope.
In 'string-shims' we add methods to core's String & Array

        require './string-shims'

compiler vars, to use at conditional compilation
        
        declare valid this.root.compilerVars.addMember
        .root.compilerVars = new NameDeclaration("Compiler Vars")
        .root.compilerVars.addMember 'debug',{value:true}

add 'inNode' and 'inBrowser' as compiler vars

        global declare window
        var inNode = type of window is 'undefined'
        .root.compilerVars.addMember 'inNode',{value:inNode}
        .root.compilerVars.addMember 'inBrowser',{value: not inNode}

        //log.message .root.compilerVars
        //log.message ""

in 'options' we receive also the target code to generate. (default is 'js')

Now we load the **Producer** module for the selected target code.

The **Producer** module will append to each Grammar class a `produce()` method
which generates target code for the AST class
    
        .Producer = require('./Producer_'+options.target)

### Project.compile

#### method compile()

Import & compile the main module. The main module will, in turn, 'import' and 'compile' 
-if not cached-, all dependent modules. 

        .main = .importModule(.root, .options.mainModuleName)

        if log.error.count is 0
            log.message "\nParsed OK"

Validate

        if no .options.skip 
            log.message "Validating"
            Validate.validate this
            if log.error.count, log.throwControled log.error.count,"errors"

Produce, for each module

        log.message "\nProducing #{.options.target} at #{.options.outDir}\n"

        for each own property filename in .moduleCache
          var moduleNode:Grammar.Module = .moduleCache[filename]

          if not moduleNode.fileInfo.isCore and moduleNode.referenceCount 

            log.extra "source:", moduleNode.fileInfo.importParameter
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

                if moduleNode.lexer.out.sourceMap

                    Environment.externalCacheSave moduleNode.fileInfo.outFilename+'.map',
                            moduleNode.lexer.out.sourceMap.generate({
                                          generatedFile: moduleNode.fileInfo.basename+moduleNode.fileInfo.outExtension
                                          sourceFiles  : [moduleNode.fileInfo.sourcename]
                                          })

    /*
                var exportedArray = moduleNode.exports.toExportArray()
                var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
                Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
    */

            end if

            log.message "#{log.color.green}[OK] #{result} -> #{moduleNode.fileInfo.outRelFilename} #{log.color.normal}"
            log.extra #blank line

        end for each module cached

        print "#{log.error.count} errors, #{log.warning.count} warnings."


#### method compileFile(filename, moduleNode:Grammar.Module)

Compilation:
Load source -> Lexer/Tokenize -> Parse/create AST 

        log.message String.spaces(this.recurseLevel*2),"compile: '#{Environment.relName(filename,.options.basePath)}'"

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
                err.message = "#{moduleNode.lexer.posToString()}\n#{err.stack or err.message}"

            log.error err.message

            #show last soft error. Can be useful to pinpoint the problem
            if moduleNode.lexer.softError, log.message "previous soft-error: #{moduleNode.lexer.softError.message}"

            if process #we're in node.js
                process.exit(1) 
            else
                throw err

#### method createNewModule(fileInfo) returns Grammar.Module

create a **new Module** and then create a **new lexer** for the Module 
(each module has its own lexer. There is one lexer per file)

        var moduleNode = new Grammar.Module(.root)
        moduleNode.name = fileInfo.filename
        moduleNode.fileInfo = fileInfo
        moduleNode.referenceCount = 0

create a Lexer for the module. The Lexer receives this module exports as a "compiler"
because the lexer preprocessor can compile marcros and generate code in the fly via 'compiler generate'

        moduleNode.lexer = new Lexer(module.exports, .options)

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


#### method produceModule(moduleNode:Grammar.Module)

        moduleNode.lexer.out.addSourceAsComment = .options.extraComments
        moduleNode.lexer.out.browser = .options.browser

        moduleNode.lexer.out.put "//Compiled by LiteScript compiler v#{version}, source: #{moduleNode.fileInfo.filename}"
        moduleNode.lexer.out.startNewLine

        moduleNode.produce 

        #referenceSourceMap
        if no .options.nomap and moduleNode.fileInfo.outExtension
            moduleNode.lexer.out.startNewLine
            moduleNode.lexer.out.put "//# sourceMappingURL=#{moduleNode.fileInfo.basename+moduleNode.fileInfo.outExtension+'.map'}"
        

#### method importDependencies(moduleNode:Grammar.Module)

Check if this module 'imported other modules'. Process Imports (recursive)

        for each node in moduleNode.requireCallNodes

            var requireParameter 

get import parameter, and parent Module
store a pointer to the imported module in 
the statement AST node

If the origin is: ImportStatement

            if node instance of Grammar.ImportStatementItem
                declare node:Grammar.ImportStatementItem
                if node.importParameter
                    requireParameter = node.importParameter.getValue()                        
                else
                    requireParameter = node.name

if it wansn't 'global import', add './' to the filename

                declare valid node.parent.global 
                if no node.parent.global,  requireParameter = './'+requireParameter

else, If the origin is a require() call

            else if node instance of Grammar.VariableRef #require() call
                declare node:Grammar.VariableRef
                if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
                    var requireCall:Grammar.FunctionAccess = node.accessors[0]
                    if requireCall.args[0].root.name instanceof Grammar.StringLiteral
                        requireParameter = requireCall.args[0].root.name.getValue()

if found a valid filename to import

            if requireParameter
                node.importedModule = .importModule(moduleNode, requireParameter)

        #loop


#### method importModule(importingModule:Grammar.Module, importParameter)

importParameter is the raw string passed to `import/require` statements,

*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        declare valid .recurseLevel

        .recurseLevel++
        var indent = String.spaces(.recurseLevel*2)

        log.message ""
        log.message indent,"'#{importingModule.fileInfo.relFilename}' imports '#{importParameter}'"

Determine the full module filename. Search for the module in the environment.

        var fileInfo = new Environment.FileInfo(importParameter)

        fileInfo.searchModule importingModule.fileInfo, .options

Before compiling the module, check internal, and external cache

Check Internal Cache: if it is already compiled, return cached Module node

        if .moduleCache.hasOwnProperty(fileInfo.filename) #registered
            log.message indent,'cached: ',fileInfo.filename
            .recurseLevel--
            return .moduleCache[fileInfo.filename]

It isn't on internal cache, then create a **new Module**.

        var moduleNode = .createNewModule(fileInfo)

early add to local cache, to cut off circular references

        .moduleCache[fileInfo.filename] = moduleNode

Check if we can get exports from a "interface.md" file

        if .getInterface(importingModule, fileInfo, moduleNode)
            #getInterface also loads and analyze .js interfaces
            do nothing #getInterface sets moduleNode.exports

else, we need to compile the file 
    
        else 
            this.compileFile fileInfo.filename, moduleNode
            moduleNode.referenceCount++


at last, return the parsed Module node

        this.recurseLevel-=1
        return moduleNode 

    #end importModule



#### method getInterface(importingModule,fileInfo, moduleNode:Grammar.Module)
If a 'interface' file exists, compile interface declarations instead of file
return true if interface (exports) obtained

        if fileInfo.interfaceFileExists 

            this.compileFile fileInfo.interfaceFile, moduleNode

            return true

else, for .js file, **require()** the file and generate & cache interface

        else if fileInfo.extension is '.js' or fileInfo.isCore

            log.message String.spaces(this.recurseLevel*2),
                fileInfo.isCore? "core module" : "javascript file",
                "require('#{fileInfo.importParameter}')"

            if not fileInfo.isCore
                #hack for require(). Simulate we're at the importingModule dir
                #for require() to look at the same dirs as at runtime
                declare global module
                declare on module paths:string array
                declare valid module.constructor._nodeModulePaths
                #declare valid module.filename
                var save = {paths:module.paths, filename: module.filename}
                module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname)
                module.filename = importingModule.fileInfo.filename
                debug "importingModule", module.filename

            var requiredNodeJSModule = require(fileInfo.importParameter)
            moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule)

            if not fileInfo.isCore #restore
                module.paths= save.paths
                module.filename= save.filename
        
            return true


Require Extensions
------------------

This segment adds extensions to node's `require` function 
for LiteScript files so that you can just `require` a .lite.md file 
without having to compile it ahead of time 

    helper function extension_LoadLS(requiringModule, filename)

Read the file, then compile using the `compile` function above. 
Then use node's built-in compile function to compile the generated JavaScript.

        var content = compile(filename, Environment.loadFile(filename),{verbose:0,warnings:0})
        declare valid requiringModule._compile
        requiringModule._compile(content, filename)


    export helper function registerRequireExtensions
    
Add the extension for all appropriate file types. Don't overwrite `.md` in case CoffeeScript or something else is already using it.

        declare on require 
            extensions

        if require.extensions

          require.extensions['.lite.md'] = extension_LoadLS
          require.extensions['.lite'] = extension_LoadLS
          require.extensions['.md'] = extension_LoadLS



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
