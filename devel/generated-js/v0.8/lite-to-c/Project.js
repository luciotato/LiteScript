//The LiteScript Project Module
//==============================
//LiteScript is a highly readable language that compiles to JavaScript.

//###Module Dependencies

//The Project Class require all other modules to
//compile LiteScript code.

    //import 
        //ASTBase, Grammar, Parser
        //Names, Validate
        //ControlledError, GeneralOptions
        //logger, color, shims, mkPath
    var ASTBase = require('./ASTBase.js');
    var Grammar = require('./Grammar.js');
    var Parser = require('./Parser.js');
    var Names = require('./Names.js');
    var Validate = require('./Validate.js');
    var ControlledError = require('./lib/ControlledError.js');
    var GeneralOptions = require('./lib/GeneralOptions.js');
    var logger = require('./lib/logger.js');
    var color = require('./lib/color.js');
    var shims = require('./interfaces/shims.js');
    var mkPath = require('./lib/mkPath.js');

    //shim import LiteCore
    var LiteCore = require('./interfaces/LiteCore.js');

//Get the 'Environment' object for the compiler to use.
//The 'Environment' object, must provide functions to load files, search modules, 
//and a optional external cache (disk). 
//The `Environment` abstraction allows us to support compile on server(node) or the browser.

    //import Environment
    var Environment = require('./lib/Environment.js');

//Require the Producer (to include it in the dependency tree)

    //ifdef PROD_C
    //import Producer_c
    var Producer_c = require('./Producer_c.js');
    //else
    //import Producer_js
    //endif

//----------------
//### Public Class Project
    // constructor
    function Project(options){

//A **Project** object acts as the rootModule for a complex AST spanning several related **Modules**

//Normally, you launch the project compilation by calling `compile()` on the main module 
//of your project. At `compile()` the main module is imported and compiled.

//When a `ImportStatement: import IDENTIFIER`, or a `require()` call is found in the module code, 
//the *imported|required* "child" module is loaded, compiled **and cached**. 
//(is the same logic behind node's 'require' function).

//This creates a **tree** of Modules, cached, and recursively parsed on demand.
//The Modules dependency tree is the *Project tree*.

//#### Properties

        //options: GeneralOptions
        //name
        //moduleCache: Map string to Grammar.Module
        //rootModule: Grammar.Module
        //compilerVars: Map string to Names.Declaration
        //main: Grammar.Module
        //Producer
        //recurseLevel = 0
        //filesProducedCount
         this.recurseLevel=0;

        //lexer=undefined //dummy, to allow Project to be main module's parent

//#### constructor new Project(options:GeneralOptions)

//Initialize this project. Project has a cache for required modules. 
//As with node's `require` mechanism, a module, 
//when imported|required is only compiled once and then cached.

        //console.time 'Init Project'
        console.time('Init Project');

        //.name = 'Project'
        this.name = 'Project';

        //options.now = new Date()
        options.now = new Date();
        //.options = options
        this.options = options;

        //.moduleCache = new Map 
        this.moduleCache = new Map();

        //logger.init options
        logger.init(options);

//set basePath from main module path

        //var tempFileInfo = new Environment.FileInfo(options.mainModuleName)
        var tempFileInfo = new Environment.FileInfo(options.mainModuleName);
        //options.projectDir = tempFileInfo.dir
        options.projectDir = tempFileInfo.dir;
        //options.mainModuleName = './#{tempFileInfo.base}'
        options.mainModuleName = './' + tempFileInfo.base;
        //options.outDir = Environment.resolvePath(options.outDir or '.')
        options.outDir = Environment.resolvePath(options.outDir || '.');

        //Environment.setBaseInfo options
        Environment.setBaseInfo(options);

        //logger.msg 'Project Dir:',.options.projectDir
        logger.msg('Project Dir:', this.options.projectDir);
        //logger.msg 'Main Module:',.options.mainModuleName
        logger.msg('Main Module:', this.options.mainModuleName);
        //logger.msg 'Out Dir:',.options.outDir
        logger.msg('Out Dir:', this.options.outDir);

//compiler vars, #defines, to use at conditional compilation

        //.compilerVars = new Map
        this.compilerVars = new Map();

        //for each def in options.defines
        for( var def__inx=0,def ; def__inx<options.defines.length ; def__inx++){def=options.defines[def__inx];
        
            //.setCompilerVar def
            this.setCompilerVar(def);
        };// end for each in options.defines

//add 'ENV_JS' => this compiler is JS code

        //ifdef TARGET_JS
        //.setCompilerVar 'ENV_JS'
        this.setCompilerVar('ENV_JS');

//add 'ENV_NODE' or 'ENV_JS' as compiler vars.
//ENV_NODE: this compiler is JS code & we're running on node
//ENV_NODE: this compiler is JS code & we're running on the browser

        //declare var window
        
        //var inNode = type of window is 'undefined'
        var inNode = typeof window === 'undefined';
        //.setCompilerVar inNode? 'ENV_NODE' else 'ENV_BROWSER'
        this.setCompilerVar(inNode ? 'ENV_NODE' : 'ENV_BROWSER');
        //endif

//add 'ENV_C' => this compiler is C-code (*native exe*)

        //ifdef TARGET_C
        //.setCompilerVar 'ENV_C'
        //endif

//add 'TARGET_x'

//TARGET_JS: this is the compile-to-js version of LiteScript compiler

//TARGET_C: this is the compile-to-c version of LiteScript compiler

        //.setCompilerVar 'TARGET_#{options.target.toUpperCase()}'
        this.setCompilerVar('TARGET_' + (options.target.toUpperCase()));

        //logger.msg 'preprocessor #defined', .compilerVars.keys()
        logger.msg('preprocessor #defined', this.compilerVars.keys());
        //logger.info "" //blank line
        logger.info(""); //blank line

//create a 'rootModule' module to hold global scope

        //.rootModule = new Grammar.Module() //parent is Project
        this.rootModule = new Grammar.Module(); //parent is Project
        //.rootModule.name = '*Global Scope*' 
        this.rootModule.name = '*Global Scope*';

        //.rootModule.fileInfo = new Environment.FileInfo('Project') 
        this.rootModule.fileInfo = new Environment.FileInfo('Project');
        //.rootModule.fileInfo.relFilename='Project'
        this.rootModule.fileInfo.relFilename = 'Project';
        //.rootModule.fileInfo.dir = options.projectDir
        this.rootModule.fileInfo.dir = options.projectDir;
        //.rootModule.fileInfo.outFilename = "#{options.outDir}/_project_"
        this.rootModule.fileInfo.outFilename = '' + options.outDir + "/_project_";

//Validate.initialize will prepare the global scope 
//by parsing the file: "lib/GlobalScope(JS|NODE|C).interface.md"

        //Validate.initialize this 
        Validate.initialize(this);

        //if options.perf>1, console.timeEnd 'Init Project'
        if (options.perf > 1) {console.timeEnd('Init Project')};
     };


//#### Method compile()
     Project.prototype.compile = function(){

//Import & compile the main module. The main module will, in turn, 'import' and 'compile' 
//-if not cached-, all dependent modules. 

        //logger.msg "Compiling",.options.mainModuleName
        logger.msg("Compiling", this.options.mainModuleName);

        //var importInfo = new Environment.ImportParameterInfo
        var importInfo = new Environment.ImportParameterInfo();
        //importInfo.name = .options.mainModuleName
        importInfo.name = this.options.mainModuleName;
        //importInfo.source = 'Project'
        importInfo.source = 'Project';
        //importInfo.line=0
        importInfo.line = 0;

        //console.time 'Parse'
        console.time('Parse');
        //.main = .importModule(.rootModule, importInfo)
        this.main = this.importModule(this.rootModule, importInfo);
        //.main.isMain = true
        this.main.isMain = true;

        //if .options.perf>1, console.timeEnd 'Parse'
        if (this.options.perf > 1) {console.timeEnd('Parse')};

        //if logger.errorCount is 0
        if (logger.errorCount === 0) {
            //logger.info "\nParsed OK"
            logger.info("\nParsed OK");
        };

//Validate

        //if no .options.skip 
        if (!this.options.skip) {
            //logger.info "Validating"
            logger.info("Validating");
            //console.time 'Validate'
            console.time('Validate');
            //Validate.launch this
            Validate.launch(this);
            //if .options.perf>1, console.timeEnd 'Validate'
            if (this.options.perf > 1) {console.timeEnd('Validate')};
            //if logger.errorCount, logger.throwControlled '#{logger.errorCount} errors'
            if (logger.errorCount) {logger.throwControlled('' + logger.errorCount + ' errors')};
        };

//Produce, for each module

        //console.time 'Produce'
        console.time('Produce');
        //logger.msg "Producing #{.options.target}"
        logger.msg("Producing " + this.options.target);
        //.filesProducedCount=0
        this.filesProducedCount = 0;
        //mkPath.create .options.outDir
        mkPath.create(this.options.outDir);

        //for each moduleNode:Grammar.Module in map .moduleCache
        var moduleNode=undefined;
        if(!this.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in this.moduleCache.dict){moduleNode=this.moduleCache.dict[moduleNode__propName];
            {

            //var result:string
            var result = undefined;
            //logger.extra "source:", moduleNode.fileInfo.importInfo.name
            logger.extra("source:", moduleNode.fileInfo.importInfo.name);

            //var shouldProduce = true
            var shouldProduce = true;
            //if moduleNode.fileInfo.isCore or no moduleNode.referenceCount 
            if (moduleNode.fileInfo.isCore || !moduleNode.referenceCount) {
                //shouldProduce = false
                shouldProduce = false;
            };

            //if moduleNode.lexer.interfaceMode and .options.target is 'js'            
            if (moduleNode.lexer.interfaceMode && this.options.target === 'js') {
                // no interface files in js.
                //shouldProduce = false
                shouldProduce = false;
            };

            //if shouldProduce 
            if (shouldProduce) {

                //if not moduleNode.fileInfo.isLite 
                if (!(moduleNode.fileInfo.isLite)) {
                    //logger.extra 'non-Lite module, copy to out dir.'
                    logger.extra('non-Lite module, copy to out dir.');
                    //#copy the file to output dir
                    //logger.msg "Note: non-lite module '#{moduleNode.fileInfo.filename}' required"
                    logger.msg("Note: non-lite module '" + moduleNode.fileInfo.filename + "' required");
                    //result = moduleNode.fileInfo.filename
                    result = moduleNode.fileInfo.filename;
                }
                else {

                //else

//produce & get result target code

                    //moduleNode.lexer.outCode.filenames[0]=moduleNode.fileInfo.outFilename
                    moduleNode.lexer.outCode.filenames[0] = moduleNode.fileInfo.outFilename;
                    //moduleNode.lexer.outCode.filenames[1]='#{moduleNode.fileInfo.outFilename.slice(0,-1)}h'
                    moduleNode.lexer.outCode.filenames[1] = '' + (moduleNode.fileInfo.outFilename.slice(0, -1)) + 'h';
                    //moduleNode.lexer.outCode.fileMode=true //direct out to file 
                    moduleNode.lexer.outCode.fileMode = true; //direct out to file

                    //.produceModule moduleNode
                    this.produceModule(moduleNode);

                    //moduleNode.lexer.outCode.close
                    moduleNode.lexer.outCode.close();
                    //result = "#{moduleNode.lexer.outCode.lineNum} lines"
                    result = '' + moduleNode.lexer.outCode.lineNum + " lines";
                };

                    //ifdef PROD_JS
                    //if .options.generateSourceMap
                        ////console.time('Generate SourceMap #{moduleNode.fileInfo.base}')
                        //Environment.externalCacheSave '#{moduleNode.fileInfo.outFilename}.map',
                                //moduleNode.lexer.outCode.sourceMap.generate(
                                              //moduleNode.fileInfo.base & moduleNode.fileInfo.outExtension
                                              //,[moduleNode.fileInfo.sourcename]
                                              //)
                        ////if .options.perf, console.timeEnd('Generate SourceMap #{moduleNode.fileInfo.base}')
                    //endif

                //end if
                

                //logger.info color.green,"[OK]",result, " -> ",moduleNode.fileInfo.outRelFilename,color.normal
                logger.info(color.green, "[OK]", result, " -> ", moduleNode.fileInfo.outRelFilename, color.normal);
                //logger.extra #blank line
                logger.extra();// #blank line
                //.filesProducedCount++
                this.filesProducedCount++;
            };

            //end if //shouldProduce
            
            }
            
            }// end for each property

        //end for each module cached
        

        //logger.msg "Generated .#{.options.target} files (#{.filesProducedCount}) at #{.options.outDir}"
        logger.msg("Generated ." + this.options.target + " files (" + this.filesProducedCount + ") at " + this.options.outDir);
        //logger.msg "#{logger.errorCount} errors, #{logger.warningCount} warnings."
        logger.msg('' + logger.errorCount + " errors, " + logger.warningCount + " warnings.");

        //ifdef PROD_C
        //if no logger.errorCount, Producer_c.postProduction this
        if (!logger.errorCount) {Producer_c.postProduction(this)};
        //endif

        //if .options.perf>1, console.timeEnd 'Produce'
        if (this.options.perf > 1) {console.timeEnd('Produce')};
     };

//#### Method compileFile(filename) returns Grammar.Module
     Project.prototype.compileFile = function(filename){

//Called to compile GlobalScopeX.interface.md, from Validate module

        //var filenameInfo = new Environment.FileInfo(filename)
        var filenameInfo = new Environment.FileInfo(filename);
        //filenameInfo.importInfo.source = 'Compiler'
        filenameInfo.importInfo.source = 'Compiler';
        //filenameInfo.importInfo.line=0
        filenameInfo.importInfo.line = 0;

        //search the file
        //filenameInfo.searchModule .rootModule.fileInfo.dir
        filenameInfo.searchModule(this.rootModule.fileInfo.dir);

        // create a module
        //var newModule = .createNewModule(filenameInfo, .rootModule)
        var newModule = this.createNewModule(filenameInfo, this.rootModule);

        // compile the file
        //.compileFileOnModule filenameInfo.filename, newModule
        this.compileFileOnModule(filenameInfo.filename, newModule);

        //return newModule
        return newModule;
     };


//#### Method compileFileOnModule(filename, moduleNode:Grammar.Module)
     Project.prototype.compileFileOnModule = function(filename, moduleNode){

//Compilation:
//Load source -> Lexer/Tokenize -> Parse/create AST 

        //logger.info String.spaces(this.recurseLevel*2),"compile: '#{Environment.relativeFrom(.options.projectDir,filename)}'"
        logger.info(String.spaces(this.recurseLevel * 2), "compile: '" + (Environment.relativeFrom(this.options.projectDir, filename)) + "'");

//Load source code, parse

        //.parseOnModule moduleNode, filename, Environment.loadFile(filename)
        this.parseOnModule(moduleNode, filename, Environment.loadFile(filename));

//Check if this module 'imported other modules'. Process Imports (recursive)

        //if no .options.single 
        if (!this.options.single) {
            //.importDependencies moduleNode
            this.importDependencies(moduleNode);
        };
     };


//#### method parseOnModule(moduleNode:Grammar.Module, filename, sourceLines)
     Project.prototype.parseOnModule = function(moduleNode, filename, sourceLines){ try{
//This method will initialize lexer & parse  source lines into ModuleNode scope

//set Lexer source code, process lines, tokenize

        //logger.errorCount = 0
        logger.errorCount = 0;

        //var stage = "lexer"
        var stage = "lexer";
        //moduleNode.lexer.initSource( filename, sourceLines )
        moduleNode.lexer.initSource(filename, sourceLines);
        //moduleNode.lexer.process()
        moduleNode.lexer.process();

//Parse source

        //stage = "parsing"
        stage = "parsing";
        //moduleNode.parse()
        moduleNode.parse();

//Check if errors were emitted

        //if logger.errorCount, logger.throwControlled "#{logger.errorCount} errors emitted"
        if (logger.errorCount) {logger.throwControlled('' + logger.errorCount + " errors emitted")};

//Handle errors, add stage info, and stack

        //exception err
        
        }catch(err){

            //if err instanceof ControlledError  //if not 'controlled' show lexer pos & call stack (includes err text)
            if (err instanceof ControlledError) { //if not 'controlled' show lexer pos & call stack (includes err text)
                //err = moduleNode.lexer.hardError or err //get important (inner) error
                err = moduleNode.lexer.hardError || err; //get important (inner) error
            }
            else {
            //else
                // uncontrolled
                // add position & stack
                //err.message = "#{moduleNode.lexer.posToString()}\n#{err.stack or err.message}" 
                err.message = '' + (moduleNode.lexer.posToString()) + "\n" + (err.stack || err.message);
            };

            //logger.error err.message
            logger.error(err.message);

            //#show last soft error. Can be useful to pinpoint the problem
            //if moduleNode.lexer.softError, logger.msg "previous soft-error: #{moduleNode.lexer.softError.message}"
            if (moduleNode.lexer.softError) {logger.msg("previous soft-error: " + moduleNode.lexer.softError.message)};

            //if process #we're in node.js
            //    process.exit(1) 
            //else
            //throw err
            throw err;
        };
     };

//#### method createNewModule(fileInfo, parent) returns Grammar.Module
     Project.prototype.createNewModule = function(fileInfo, parent){

//create a **new Module** and then create a **new lexer** for the Module 
//(each module has its own lexer. There is one lexer per file)

        //default parent = .rootModule
        if(parent===undefined) parent=this.rootModule;

        //var moduleNode = new Grammar.Module(parent)
        var moduleNode = new Grammar.Module(parent);
        //moduleNode.name = fileInfo.filename
        moduleNode.name = fileInfo.filename;
        //moduleNode.fileInfo = fileInfo
        moduleNode.fileInfo = fileInfo;
        //moduleNode.referenceCount = 0
        moduleNode.referenceCount = 0;

//create a Lexer for the module. The Lexer receives this module exports as a "compiler"
//because the lexer preprocessor can compile marcros and generate code on the fly
//via 'compiler generate'

        //moduleNode.lexer = new Parser.Lexer(this, .options)
        moduleNode.lexer = new Parser.Lexer(this, this.options);

//Now create the module scope, with two local scope vars: 
//'module' and 'exports = module.exports'. 'exports' will hold all exported members.

        //moduleNode.createScope()
        moduleNode.createScope();
        //var opt = new Names.NameDeclOptions
        var opt = new Names.NameDeclOptions();
        //opt.nodeClass = Grammar.NamespaceDeclaration // each "Module" is a Namespace
        opt.nodeClass = Grammar.NamespaceDeclaration; // each "Module" is a Namespace
        //moduleNode.exports = new Names.Declaration(fileInfo.base,opt,moduleNode)
        moduleNode.exports = new Names.Declaration(fileInfo.base, opt, moduleNode);
        //moduleNode.exportsReplaced = false
        moduleNode.exportsReplaced = false;

        //var moduleVar = moduleNode.addToScope('module',opt)
        var moduleVar = moduleNode.addToScope('module', opt);
        //moduleNode.exports = moduleVar.addMember('exports') #add as member of 'module'
        //var opt = new Names.NameDeclOptions
        //opt.pointsTo = moduleNode.exports
        //moduleNode.addToScope('exports',opt) #add also as 'exports' in scope

//add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

        //var fnameOpt = new Names.NameDeclOptions
        var fnameOpt = new Names.NameDeclOptions();
        //fnameOpt.value = fileInfo.filename
        fnameOpt.value = fileInfo.filename;
        //fnameOpt.nodeClass = Grammar.VariableDecl
        fnameOpt.nodeClass = Grammar.VariableDecl;
        //moduleVar.addMember moduleNode.declareName('filename',fnameOpt)
        moduleVar.addMember(moduleNode.declareName('filename', fnameOpt));

//Also, register every `import|require` in this module body, to track modules dependencies.
//We create a empty a empty `.requireCallNodes[]`, to hold:
//1. VariableRef, when is a require() call
//2. each VariableDecl, from ImportStatements

        //moduleNode.requireCallNodes=[]
        moduleNode.requireCallNodes = [];

        //return moduleNode
        return moduleNode;
     };


//#### Method produceModule(moduleNode:Grammar.Module)
     Project.prototype.produceModule = function(moduleNode){

        //moduleNode.lexer.outCode.browser = .options.browser
        moduleNode.lexer.outCode.browser = this.options.browser;

        //if .options.comments>=2
        if (this.options.comments >= 2) {
            //moduleNode.lexer.outCode.put "//Compiled by LiteScript compiler v#{.options.version}, source: #{moduleNode.fileInfo.filename}"
            moduleNode.lexer.outCode.put("//Compiled by LiteScript compiler v" + this.options.version + ", source: " + moduleNode.fileInfo.filename);
            //moduleNode.lexer.outCode.startNewLine
            moduleNode.lexer.outCode.startNewLine();
        };

        //moduleNode.produce 
        moduleNode.produce();

        //#referenceSourceMap
        //if .options.generateSourceMap and moduleNode.fileInfo.outExtension is 'js'
        if (this.options.generateSourceMap && moduleNode.fileInfo.outExtension === 'js') {
            //moduleNode.lexer.outCode.startNewLine
            moduleNode.lexer.outCode.startNewLine();
            //moduleNode.lexer.outCode.put "//# sourceMappingURL=#{moduleNode.fileInfo.base}#{moduleNode.fileInfo.outExtension}.map"
            moduleNode.lexer.outCode.put("//# sourceMappingURL=" + moduleNode.fileInfo.base + moduleNode.fileInfo.outExtension + ".map");
        };
     };


//#### Method importDependencies(moduleNode:Grammar.Module)
     Project.prototype.importDependencies = function(moduleNode){

//Check if this module 'imported other modules'. Process Imports (recursive)

        //for each node:ASTBase in moduleNode.requireCallNodes
        for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];
        

            //var importInfo = new Environment.ImportParameterInfo
            var importInfo = new Environment.ImportParameterInfo();
            //importInfo.source=moduleNode.fileInfo.filename
            importInfo.source = moduleNode.fileInfo.filename;
            //importInfo.line=node.sourceLineNum
            importInfo.line = node.sourceLineNum;


//get import parameter, and parent Module
//store a pointer to the imported module in 
//the statement AST node

//If the origin is: ImportStatement/global Declare

            //if node instance of Grammar.ImportStatementItem
            if (node instanceof Grammar.ImportStatementItem) {
                //declare node:Grammar.ImportStatementItem
                
                //if node.importParameter
                if (node.importParameter) {
                    //importInfo.name = node.importParameter.getValue()                        
                    importInfo.name = node.importParameter.getValue();
                }
                else {
                //else
                    //importInfo.name = node.name
                    importInfo.name = node.name;
                };

                //if node.hasAdjective('shim') and node.findInScope(importInfo.name) 
                if (node.hasAdjective('shim') && node.findInScope(importInfo.name)) {
                    //continue // do not import if "shim import" and already declared
                    continue; // do not import if "shim import" and already declared
                };

//if it was 'global declare', or 'global import' set flags
//else search will be local: './' and './lib'

                //if node.parent instanceof Grammar.DeclareStatement
                if (node.parent instanceof Grammar.DeclareStatement) {
                    //importInfo.isGlobalDeclare = true
                    importInfo.isGlobalDeclare = true;
                }
                else if (node.parent instanceof Grammar.ImportStatement) {

                //else if node.parent instanceof Grammar.ImportStatement 
                    //importInfo.globalImport = node.hasAdjective("global")
                    importInfo.globalImport = node.hasAdjective("global");
                };
            };

//if found a valid filename to import

            //if importInfo.name
            if (importInfo.name) {
                //node.importedModule = .importModule(moduleNode, importInfo)
                node.importedModule = this.importModule(moduleNode, importInfo);
            };
        };// end for each in moduleNode.requireCallNodes
        
     };

        //#loop


//#### Method importModule(importingModule:Grammar.Module, importInfo: Environment.ImportParameterInfo)
     Project.prototype.importModule = function(importingModule, importInfo){

//importParameter is the raw string passed to `import/require` statements,

//*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        //declare valid .recurseLevel
        

        //.recurseLevel++
        this.recurseLevel++;
        //var indent = String.spaces(.recurseLevel*2)
        var indent = String.spaces(this.recurseLevel * 2);

        //logger.info ""
        logger.info("");
        //logger.info indent,"'#{importingModule.fileInfo.relFilename}' imports '#{importInfo.name}'"
        logger.info(indent, "'" + importingModule.fileInfo.relFilename + "' imports '" + importInfo.name + "'");

//Determine the full module filename. Search for the module in the environment.

        //var fileInfo = new Environment.FileInfo(importInfo)
        var fileInfo = new Environment.FileInfo(importInfo);

        //fileInfo.searchModule importingModule.fileInfo.dir
        fileInfo.searchModule(importingModule.fileInfo.dir);

//Before compiling the module, check internal, and external cache

//Check Internal Cache: if it is already compiled, return cached Module node

        //if .moduleCache.has(fileInfo.filename) #registered
        if (this.moduleCache.has(fileInfo.filename)) {// #registered
            //logger.info indent,'cached: ',fileInfo.filename
            logger.info(indent, 'cached: ', fileInfo.filename);
            //.recurseLevel--
            this.recurseLevel--;
            //return .moduleCache.get(fileInfo.filename)
            return this.moduleCache.get(fileInfo.filename);
        };

//It isn't on internal cache, then create a **new Module**.

        //var moduleNode = .createNewModule(fileInfo)
        var moduleNode = this.createNewModule(fileInfo);
        //moduleNode.dependencyTreeLevel = .recurseLevel
        moduleNode.dependencyTreeLevel = this.recurseLevel;

//early add to local cache, to cut off circular references

        //.moduleCache.set fileInfo.filename, moduleNode
        this.moduleCache.set(fileInfo.filename, moduleNode);

//Check if we can get exports from a "interface.md" file

        //if .getInterface(importingModule, fileInfo, moduleNode)
        if (this.getInterface(importingModule, fileInfo, moduleNode)) {
            //#getInterface also loads and analyze .js interfaces

            //#if it is an interface, but loaded from 'import' statement
            //#we increment .referenceCount in order to produce the file
            //if not importInfo.isGlobalDeclare, moduleNode.referenceCount++
            if (!(importInfo.isGlobalDeclare)) {moduleNode.referenceCount++};
        }
        else {

//else, we need to compile the file 

        //else 

            //if importingModule is .rootModule and .options.compileIfNewer and fileInfo.outFileIsNewer 
            if (importingModule === this.rootModule && this.options.compileIfNewer && fileInfo.outFileIsNewer) {
                //do nothing //do not compile if source didnt change
                null; //do not compile if source didnt change
            }
            else {
            //else
                //this.compileFileOnModule fileInfo.filename, moduleNode
                this.compileFileOnModule(fileInfo.filename, moduleNode);
                //moduleNode.referenceCount++
                moduleNode.referenceCount++;
            };
        };


//at last, return the parsed Module node

        //this.recurseLevel-=1
        this.recurseLevel -= 1;
        //return moduleNode 
        return moduleNode;
     };

    //#end importModule



//#### method getInterface(importingModule,fileInfo, moduleNode:Grammar.Module )
     Project.prototype.getInterface = function(importingModule, fileInfo, moduleNode){
//If a 'interface' file exists, compile interface declarations instead of file
//return true if interface (exports) obtained

        //if fileInfo.interfaceFileExists 
        if (fileInfo.interfaceFileExists) {
            //# compile interface
            //this.compileFileOnModule fileInfo.interfaceFile, moduleNode
            this.compileFileOnModule(fileInfo.interfaceFile, moduleNode);
            //return true //got Interface
            return true; //got Interface
        };

//if we're generating c-code, a interface or file must exist

        //if .options.target is 'c', return 
        if (this.options.target === 'c') {return};

//else, if we're running on node.js 
//we can try a "hack". 
//We call "require(x.js)" here and generate the interface 
//from the loaded module exported object

        //ifdef TARGET_JS //if this compiler generates js code

//Check if we're compiling for the browser

        //if .options.browser
        if (this.options.browser) {
            //if fileInfo.extension is '.js'
            if (fileInfo.extension === '.js') {
                //logger.throwControlled 'Missing #{fileInfo.relPath}/#{fileInfo.base}.interface.md'
                logger.throwControlled('Missing ' + fileInfo.relPath + '/' + fileInfo.base + '.interface.md');
            }
            else {
            //else # assume a .lite.md file
                //return false //getInterface returning false means call "CompileFile"
                return false; //getInterface returning false means call "CompileFile"
            };
        };

//here, we're compiling for node.js environment
//for .js file/core/global module, 
//call node.js **require()** for parameter
//and generate & cache interface

        //if fileInfo.isCore or fileInfo.importInfo.globalImport or fileInfo.extension is '.js' 
        if (fileInfo.isCore || fileInfo.importInfo.globalImport || fileInfo.extension === '.js') {

            //logger.info String.spaces(this.recurseLevel*2),
            logger.info(String.spaces(this.recurseLevel * 2), fileInfo.isCore ? "core module" : "javascript file", "require('" + fileInfo.base + "')");
                //fileInfo.isCore?"core module":"javascript file",
                //"require('#{fileInfo.base}')"

            //if not fileInfo.isCore
            if (!(fileInfo.isCore)) {

//hack for require(). Simulate we're at the importingModule dir
//for node's require() function to look at the same dirs as at runtime

                //declare on module paths:string array
                
                //declare valid module.constructor._nodeModulePaths
                

                //var savePaths = module.paths, saveFilename = module.filename
                var savePaths = module.paths, saveFilename = module.filename;
                //module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dir)
                module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dir);
                //module.filename = importingModule.fileInfo.filename
                module.filename = importingModule.fileInfo.filename;
                //logger.debug "importingModule", module.filename
                logger.debug("importingModule", module.filename);
            };

            //var requiredNodeJSModule = require(fileInfo.importInfo.name)
            var requiredNodeJSModule = require(fileInfo.importInfo.name);
            //moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule)
            moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule);

            //if not fileInfo.isCore #restore
            if (!(fileInfo.isCore)) {// #restore
                //module.paths= savePaths
                module.paths = savePaths;
                //module.filename= saveFilename
                module.filename = saveFilename;
            };

            //return true
            return true;
        };
     };

        //endif // skip node-js code if we're generatice the compile-to-C compiler


//#### helper method compilerVar(name) returns Names.Declaration // or undefined
     Project.prototype.compilerVar = function(name){ // or undefined
//helper compilerVar(name)
//return rootModule.compilerVars.members[name].value

        //return .compilerVars.get(name) 
        return this.compilerVars.get(name);
     };

//#### helper method setCompilerVar(name,value) 
     Project.prototype.setCompilerVar = function(name, value){
//helper compilerVar(name)
//rootModule.compilerVars.members.set(name,value)

        //if no .compilerVars.get(name) into var nameDecl
        var nameDecl=undefined;
        if (!((nameDecl=this.compilerVars.get(name)))) {
            //var opt = new Names.NameDeclOptions
            var opt = new Names.NameDeclOptions();
            //opt.nodeClass = Grammar.VariableDecl
            opt.nodeClass = Grammar.VariableDecl;
            //nameDecl = new Names.Declaration(name,opt)
            nameDecl = new Names.Declaration(name, opt);
            //.compilerVars.set name, nameDecl
            this.compilerVars.set(name, nameDecl);
        };

        //nameDecl.setMember "**value**",value
        nameDecl.setMember("**value**", value);
     };

//#### helper method redirectOutput(newOut)
     Project.prototype.redirectOutput = function(newOut){

        //for each moduleNode:Grammar.Module in map .moduleCache
        var moduleNode=undefined;
        if(!this.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in this.moduleCache.dict){moduleNode=this.moduleCache.dict[moduleNode__propName];
              {
              //moduleNode.lexer.outCode = newOut
              moduleNode.lexer.outCode = newOut;
              }
              
              }// end for each property
        
     };
    // end class Project

    //end class Project
    

//##Add helper properties and methods to AST node class Module

//### Append to class Grammar.Module
    
//#### Properties
        //fileInfo #module file info
        //exports: Names.Declaration # holds module.exports as members
        //exportsReplaced: boolean # if exports was replaced by a ClassDeclaration with the module name
        //requireCallNodes: Grammar.ImportStatementItem array #list of `import` item nodes or `require()` function calls (varRef)
        //referenceCount
     

//#### method getCompiledLines returns string array 
     Grammar.Module.prototype.getCompiledLines = function(){
        //return .lexer.outCode.getResult()
        return this.lexer.outCode.getResult();
     };

//#### method getCompiledText returns string 
     Grammar.Module.prototype.getCompiledText = function(){
        //return .lexer.outCode.getResult().join('\n')
        return this.lexer.outCode.getResult().join('\n');
     };


///*### Append to class Grammar.VariableRef
//#### Properties
        //importedModule: Grammar.Module
//*/

//### Append to class Grammar.ImportStatementItem
    
//#### Properties
        //importedModule: Grammar.Module
     

module.exports=Project;
