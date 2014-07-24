The LiteScript Compiler Module
==============================
LiteScript is a highly readable language that compiles to JavaScript.

This v0.3 compiler is written in v0.2 syntax. 
That is, you use the v0.2 compiler to compile this code 
and you get a v0.3 compiler, suporting v0.3 syntax.

###Module Dependencies

The Compiler module is the main module, requiring all other modules to
compile LiteScript code.

    var ASTBase = require('ASTBase')
    var Grammar = require('Grammar')
    var Lexer = require('Lexer')
    var NameDeclaration = require('NameDeclaration')
    var Validate = require('Validate')
    var log = require('log')

    declare valid log.color.normal
    declare valid log.color.red
    declare valid log.color.green
    declare valid log.color.yellow

Get the 'Environment' object for the compiler to use.
The 'Environment' object, must provide functions to load files, search modules, 
and a optional external cache (disk). 
The `Environment` abstraction allows us to support compile on server(node) or the browser.

    var Environment = require('Environment')

    require('Producer_js')
    
## Main function: compile

### Public Function compile (mainModule, options)

The 'compile' function will import and compile the main Module of a project. 
The compilation of the main module will trigger import and compilation of all its "child" modules 
(dependency tree is constructed by `import`/`require` between modules)

The main module is the root of the module dependency tree, and references
another modules via import|require.

        default options = 
            outDir: 'out/debug'
            target: 'js'

        log.extra "Out Dir: #{options.outDir}"

Create a 'Project' to hold the main module and dependant modules

        var project = new Project(mainModule, options)

        project.compile

After generating all modules, if no errors occurred, 
mainModuleName and all its dependencies will be compiled in the output dir


## Secondary Function: compileLines

### Public Function compileLines (filename, sourceLines, options)
Used to compile source from memory (instead of a file, aka js: new Function/eval)
input: 
* filename (for error reporting), 
* sourceLines: string array, LiteScript code.

output: 
* moduleNode: Grammar.Module, parsed AST 
* compiled result is at: moduleNode.outCode.getResult() :string array

        var project = new Project(filename, options )

        var moduleNode = project.createNewModule(project.fileInfo)

parse source lines & store in moduleCache for validation
        
        project.parseOnModule moduleNode, filename, sourceLines
        project.moduleCache[filename] = moduleNode

validate var & property names

        Validate.validate project
        if log.error.count is 0, log.message "Validation OK"

initialize out buffer & produce target code 
    
        log.message "Generating #project.options.target"
        moduleNode.outCode.start
        moduleNode.produce
        # the produced code will be at: moduleNode.outCode.getResult() :string array

        if log.error.count isnt 0, log.throwControled "#log.error.count errors during compilation"

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

        options, 
        name, fileInfo
        moduleCache
        root: Grammar.Module
        main: Grammar.Module
        Producer
        recurseLevel = 0

#### constructor new Project(filename, options)

normalize options

        default options =
            verbose: 1
            warning: 1
            target: 'js'
            outDir: 'out/Debug'
            force: false
            debug: false
            skip: false

Initialize this project. Project has a cache for required modules. 
As with node's `require` mechanism, a module, 
when imported|required is only compiled once and then cached.
    
        me.name = 'Project'
        me.options = options
        me.moduleCache = {}

        log.error.count = 0
        log.options.verbose = options.verbose
        log.options.warning = options.warning
        log.options.debug.enabled = options.debug
        if options.debug, log.debug.clear

Analyze main module path. Main module path, becomes new base path

        me.fileInfo = new Environment.FileInfo(filename)
        Environment.setBasePath me.fileInfo.dirname
        me.fileInfo.dirname=''

When no explicit path is included, node's "require()" starts searching in './node_modules'. 
This is not inuitive from the command line, so we force compile parameter ".hasPath" 
to avoid node's special behavior on command line parameter

        me.fileInfo.hasPath = true

create a 'root' dummy-module to hold global scope

        me.root = new Grammar.Module(me)
        me.root.name = 'Project Root'
        me.root.fileInfo = new Environment.FileInfo(filename) #another instance
        me.root.fileInfo.basename='Project'
        me.root.fileInfo.dirname=''

The "scope" of rootNode is the global scope. 
Initialize the global scope

        Validate.createGlobalScope me 

Note: we defer requiring utility string functions to *after* **createGlobalScope**
to avoid tainting core classes in the compiled module global scope.
In 'string-shims' we add methods to core's String & Array

        require('string-shims') #.startWith, endsWith

compiler vars, to use at conditional compilation
        
        declare valid me.root.compilerVars.addMember
        me.root.compilerVars = new NameDeclaration("Compiler Vars")
        me.root.compilerVars.addMember 'debug',{value:true}

add 'inNode' and 'inBrowser' as compiler vars

        var inNode = type of window is 'undefined'
        me.root.compilerVars.addMember 'inNode',{value:inNode}
        me.root.compilerVars.addMember 'inBrowser',{value: not inNode}

        //log.message me.root.compilerVars
        //log.message ""

in 'options' we receive also the target code to generate. (default is 'js')

Now we load the **Producer** module for the selected target code.

The **Producer** module will append to each Grammar class a `produce()` method
which generates target code for the AST class
    
        me.Producer = require('Producer_'+options.target)

### Project.compile

#### method compile()

Import the main module. The main module will, in turn, 'import' and 'compile' -if not cached-, 
all dependent modules. Throw if errror.

        me.main = me.importModule(me.root, me.fileInfo)

        if log.error.count is 0
            log.message "parsed OK"

        if no me.options.skip 
            log.message "Validating"
            Validate.validate me
            if log.error.count, log.throwControled log.error.count,"errors"

        log.message "\nProducing #me.options.target at #me.options.outDir\n"

        for each own property filename in me.moduleCache
          var moduleNode:Grammar.Module = me.moduleCache[filename]
          if not moduleNode.fileInfo.isCore

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

initialize out buffer, produce target code & get result target code
        
                moduleNode.outCode.start
                moduleNode.produce
                var resultLines:array =  moduleNode.outCode.getResult()

save to disk / add to external cache

                Environment.externalCacheSave(moduleNode.fileInfo.outFilename,resultLines)
                result = "#resultLines.length lines"

    /*
                var exportedArray = moduleNode.exports.toExportArray()
                var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
                Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
    */

            end if

            log.message "#log.color.green[OK] #result -> #moduleNode.fileInfo.outRelFilename #log.color.normal"
            log.extra #blank line

        end for each module cached

        print "#log.error.count errors, #log.warning.count warnings."

#### method createNewModule(fileInfo) returns Grammar.Module

create a **new Module** and then create a **new lexer** for the Module 
(each module has its own lexer. There is one lexer per file)

        var moduleNode = new Grammar.Module(me.root)
        moduleNode.name = fileInfo.filename
        moduleNode.fileInfo = fileInfo

        moduleNode.lexer = new Lexer()

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

            #show last soft error. Helps the programmer pinpoint the problem
            if moduleNode.lexer.softError, log.message "previous soft-error: #moduleNode.lexer.softError.message"

            if process #we're in node.js
                process.exit(1) 
            else
                throw err


#### method importModule(importingModule:Grammar.Module, fileInfo)

The importModule method can receive a string in `fileInfo`, 
the raw string passed to `import/require` statements,
with the module to load and compile.

*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        declare valid me.root
        declare valid me.recurseLevel

        declare importingModule:Grammar.Module

convert parameters 

        if type of fileInfo is 'string'
            fileInfo = new Environment.FileInfo(fileInfo)

        me.recurseLevel+=1
        var indent = String.spaces(this.recurseLevel*2)
        log.message ""
        log.message indent,"'#{importingModule.fileInfo.basename}' imports '#{fileInfo.basename}'"

Determine the full module filename. Search for the module in the environment.

        fileInfo.searchModule importingModule.fileInfo, me.options

Before compiling the module, check internal, and external cache

Check Internal Cache: if it is already compiled, return cached Module node

        if me.moduleCache.hasOwnProperty(fileInfo.filename) #registered
            log.message indent,'cached: ',fileInfo.filename
            me.recurseLevel-=1
            return me.moduleCache[fileInfo.filename]

It isn't on internal cache, then create a **new Module**.

        var moduleNode = me.createNewModule(fileInfo)

early add to local cache, to cut off circular references

        me.moduleCache[fileInfo.filename] = moduleNode

Check if we can get exports from a "interface.md" file

        if this.getInterface(importingModule, fileInfo, moduleNode)
            do nothing #getInterface sets moduleNode.exports

else, we need to compile the file 
    
        else 
            this.compileFile fileInfo.filename, moduleNode

at last, return the parsed Module node

        this.recurseLevel-=1
        return moduleNode 

    #end importModule


#### method compileFile(filename, moduleNode:Grammar.Module)

Compilation:
Load source -> Lexer/Tokenize -> Parse/create AST 

        log.message String.spaces(this.recurseLevel*2),"compile: '#{Environment.relName(filename)}'"

Load source code, parse

        me.parseOnModule moduleNode, filename, Environment.loadFile(filename)

Check if this module 'imported other modules'. Process Imports (recursive)

        for each node in moduleNode.requireCallNodes

            var requireParameter 

get import parameter, and parent Module
store pointer to imported module in AST node

If the origin is: ImportStatement

            if node instance of Grammar.VariableDecl #ImportStatement
                declare node:Grammar.VariableDecl
                if node.assignedValue
                    declare valid node.assignedValue.root.name.getValue
                    if node.assignedValue.root.name instanceof Grammar.StringLiteral
                        requireParameter = node.assignedValue.root.name.getValue()                        
                else
                    requireParameter = node.name

if it wansn't 'global import', add './' to the filename

                declare valid node.parent.global 
                if no node.parent.global,  requireParameter = './'+requireParameter

else, If the origin is a 'require()'' call

            else if node instance of Grammar.VariableRef #require() call
                declare node:Grammar.VariableRef
                if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
                    var requireCall:Grammar.FunctionAccess = node.accessors[0]
                    if requireCall.args[0].root.name instanceof Grammar.StringLiteral
                        requireParameter = requireCall.args[0].root.name.getValue()

if a valid filename to import was found. 
Import file (recursive)

            if requireParameter
                node.importedModule = me.importModule(moduleNode, requireParameter)

        #loop

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
                log.message module.filename

            var requiredNodeJSModule = require(fileInfo.importParameter)
            moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule)

            if not fileInfo.isCore #restore
                module.paths= save.paths
                module.filename= save.filename
        
            return true


##Add helper properties and methods to AST node class Module

### Append to class Grammar.Module
#### Properties
        fileInfo #module file info
        exports: NameDeclaration # holds module.exports as members
        requireCallNodes: Grammar.VariableRef array #list of VariableRef being `require()` calls or `import` statements
        
### Append to class Grammar.VariableRef
#### Properties
        importedModule: Grammar.Module

### Append to class Grammar.VariableDecl
#### Properties
        importedModule: Grammar.Module


----------------
### Append to class NameDeclaration
#### helper method toExportArray() 

converts .members={} to 
simpler arrays for JSON.stringify & cache

      #declare valid me.members
      #declare valid item.type.fullName
      #declare valid item.itemType.fullName

      #FIX WITH for each own property
      if me.members
        var result = []
        # FIX with for each property
        for prop in Object.keys(me.members)
          var item:NameDeclaration = me.members[prop]
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

        for item in exportedArr
          var nameDecl = new NameDeclaration(item.name or '(unnamed)')
          if item.hasOwnProperty('type')
            nameDecl.type = item.type
          if item.hasOwnProperty('value')
            nameDecl.value = item.value
          me.addMember nameDecl 
          if item.members
            nameDecl.importMembersFromArray(item.members) #recursive
