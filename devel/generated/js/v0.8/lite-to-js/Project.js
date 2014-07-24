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
        //logger, color, Strings, mkPath
    var ASTBase = require('./ASTBase.js');
    var Grammar = require('./Grammar.js');
    var Parser = require('./Parser.js');
    var Names = require('./Names.js');
    var Validate = require('./Validate.js');
    var ControlledError = require('./lib/ControlledError.js');
    var GeneralOptions = require('./lib/GeneralOptions.js');
    var logger = require('./lib/logger.js');
    var color = require('./lib/color.js');
    var Strings = require('./lib/Strings.js');
    var mkPath = require('./lib/mkPath.js');

    //shim import Map
    var Map = require('./lib/Map.js');

//Get the 'Environment' object for the compiler to use.
//The 'Environment' object, must provide functions to load files, search modules, 
//and a optional external cache (disk). 
//The `Environment` abstraction allows us to support compile on server(node) or the browser.

    //import Environment
    var Environment = require('./lib/Environment.js');

//Require the Producer (to include it in the dependency tree)

    ////ifdef PROD_C
    ////import Producer_c
    ////else
    //import Producer_js
    var Producer_js = require('./Producer_js.js');
    ////endif
    
//----------------
//### Public Class Project
    // constructor
    function Project(filename, options){

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
         this.recurseLevel=0;

        ////lexer=undefined //dummy, to allow Project to be main module's parent

//#### constructor new Project(filename, options:GeneralOptions)

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

        //var tempFileInfo = new Environment.FileInfo(filename)
        var tempFileInfo = new Environment.FileInfo(filename);
        //options.projectDir = tempFileInfo.dir
        options.projectDir = tempFileInfo.dir;
        //options.mainModuleName = './#{tempFileInfo.base}'
        options.mainModuleName = './' + tempFileInfo.base;
        //options.outDir = Environment.resolvePath(options.outDir)
        options.outDir = Environment.resolvePath(options.outDir);

        //Environment.setBaseInfo options.projectDir, options.outDir, options.target
        Environment.setBaseInfo(options.projectDir, options.outDir, options.target);

        //logger.info 'Project Dir:',.options.projectDir
        logger.info('Project Dir:', this.options.projectDir);
        //logger.info 'Main Module:',.options.mainModuleName
        logger.info('Main Module:', this.options.mainModuleName);
        //logger.info 'Out Dir:',.options.outDir
        logger.info('Out Dir:', this.options.outDir);

//compiler vars, to use at conditional compilation
        
        //.compilerVars = new Map
        this.compilerVars = new Map();

        //for each def in options.defines
        for( var def__inx=0,def ; def__inx<options.defines.length ; def__inx++){def=options.defines[def__inx];
        
            //.compilerVars.set def,new Names.Declaration(def)
            this.compilerVars.set(def, new Names.Declaration(def));
        };// end for each in options.defines

//add 'inNode' and 'inBrowser' as compiler vars

        ////ifdef TARGET_JS
        //.compilerVars.set 'ENV_JS', new Names.Declaration("ENV_JS")
        this.compilerVars.set('ENV_JS', new Names.Declaration("ENV_JS"));
        //declare var window
        
        //var inNode = type of window is 'undefined'
        var inNode = typeof window === 'undefined';
        //if inNode
        if (inNode) {
            //.compilerVars.set 'ENV_NODE',new Names.Declaration("ENV_NODE")
            this.compilerVars.set('ENV_NODE', new Names.Declaration("ENV_NODE"));
        }
        else {
        //else
            //.compilerVars.set 'ENV_BROWSER',new Names.Declaration("ENV_BROWSER")
            this.compilerVars.set('ENV_BROWSER', new Names.Declaration("ENV_BROWSER"));
        };
        //end if
        
        ////endif

        ////ifdef TARGET_C
        ////.compilerVars.set 'ENV_C', new Names.Declaration("ENV_C")
        ////endif

        //var targetDef = 'TARGET_#{options.target.toUpperCase()}'
        var targetDef = 'TARGET_' + (options.target.toUpperCase());
        //.compilerVars.set targetDef,new Names.Declaration(targetDef)
        this.compilerVars.set(targetDef, new Names.Declaration(targetDef));

        //logger.msg 'preprocessor #defined', .compilerVars.keys()
        logger.msg('preprocessor #defined', this.compilerVars.keys());

        ////logger.message .compilerVars
        ////logger.info ""

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
//by parsing the file: "lib/GlobalScopeJS.interface.md"

        //Validate.initialize this 
        Validate.initialize(this);

        //console.timeEnd 'Init Project'
        console.timeEnd('Init Project');
     };

//#### Method compile()
     Project.prototype.compile = function(){

//Import & compile the main module. The main module will, in turn, 'import' and 'compile' 
//-if not cached-, all dependent modules. 

        //console.time 'Parse'
        console.time('Parse');

        //var importInfo = new Environment.ImportParameterInfo
        var importInfo = new Environment.ImportParameterInfo();
        //importInfo.name = .options.mainModuleName
        importInfo.name = this.options.mainModuleName;
        //.main = .importModule(.rootModule, importInfo)
        this.main = this.importModule(this.rootModule, importInfo);
        //.main.isMain = true
        this.main.isMain = true;

        //console.timeEnd 'Parse'
        console.timeEnd('Parse');

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
            //Validate.validate this
            Validate.validate(this);
            //console.timeEnd 'Validate'
            console.timeEnd('Validate');
            //if logger.errorCount, logger.throwControlled '#{logger.errorCount} errors'
            if (logger.errorCount) {logger.throwControlled('' + logger.errorCount + ' errors')};
        };

//Produce, for each module

        //console.time 'Produce'
        console.time('Produce');
        //logger.info "\nProducing #{.options.target} at #{.options.outDir}\n"
        logger.info("\nProducing " + this.options.target + " at " + this.options.outDir + "\n");
        //mkPath.create .options.outDir
        mkPath.create(this.options.outDir);

        //for each moduleNode:Grammar.Module in map .moduleCache
        var moduleNode=undefined;
        if(!this.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in this.moduleCache.dict) if (this.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=this.moduleCache.dict[moduleNode__propName];
          {

          //if not moduleNode.fileInfo.isCore and moduleNode.referenceCount 
          if (!(moduleNode.fileInfo.isCore) && moduleNode.referenceCount) {

            //logger.extra "source:", moduleNode.fileInfo.importInfo.name
            logger.extra("source:", moduleNode.fileInfo.importInfo.name);
            //var result:string
            var result = undefined;

            //if not moduleNode.fileInfo.isLite 
            if (!(moduleNode.fileInfo.isLite)) {
                //logger.extra 'non-Lite module, copy to out dir.'
                logger.extra('non-Lite module, copy to out dir.');
                //#copy the file to output dir
                //var contents = Environment.loadFile(moduleNode.fileInfo.filename)
                var contents = Environment.loadFile(moduleNode.fileInfo.filename);
                //Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents)
                Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents);
                //declare valid contents.length
                
                //result = "#{contents.length>>10 or 1} kb"
                result = '' + (contents.length >> 10 || 1) + " kb";
                //contents=undefined
                contents = undefined;
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

                //if not moduleNode.lexer.outCode.fileMode                
                if (!(moduleNode.lexer.outCode.fileMode)) {
                
                    //var resultLines:string array =  moduleNode.lexer.outCode.getResult()
                    var resultLines = moduleNode.lexer.outCode.getResult();

                    //// save to disk

                    //Environment.externalCacheSave moduleNode.fileInfo.outFilename,resultLines
                    Environment.externalCacheSave(moduleNode.fileInfo.outFilename, resultLines);
                    //result = "#{resultLines.length} lines"
                    result = '' + resultLines.length + " lines";

                    ////ifdef PROD_C
                    ////resultLines =  moduleNode.lexer.outCode.getResult(1) //get .h file contents
                    ////if resultLines.length
                        ////Environment.externalCacheSave '#{moduleNode.fileInfo.outFilename.slice(0,-1)}h',resultLines
                    ////end if

                    ////else
                    //if .options.nomap is false
                    if (this.options.nomap === false) {

                        //Environment.externalCacheSave '#{moduleNode.fileInfo.outFilename}.map',
                                //moduleNode.lexer.outCode.sourceMap.generate(
                                              //moduleNode.fileInfo.base & moduleNode.fileInfo.outExtension
                                              //,[moduleNode.fileInfo.sourcename]
                        Environment.externalCacheSave('' + moduleNode.fileInfo.outFilename + '.map', moduleNode.lexer.outCode.sourceMap.generate(moduleNode.fileInfo.base + moduleNode.fileInfo.outExtension, [moduleNode.fileInfo.sourcename]));
                    };
                                              //)
                    //end if
                    
                };
                    ////endif

                //end if //direct out to file
                
            };

            //end if
            

            //logger.info color.green,"[OK]",result, " -> ",moduleNode.fileInfo.outRelFilename,color.normal
            logger.info(color.green, "[OK]", result, " -> ", moduleNode.fileInfo.outRelFilename, color.normal);
            //logger.extra #blank line
            logger.extra();// #blank line
          };
          }
          
          }// end for each property

        //end for each module cached
        

        //logger.msg "#{logger.errorCount} errors, #{logger.warningCount} warnings."
        logger.msg('' + logger.errorCount + " errors, " + logger.warningCount + " warnings.");

        ////ifdef PROD_C
        ////if no logger.errorCount, Producer_c.postProduction this
        ////endif

        //console.timeEnd 'Produce'
        console.timeEnd('Produce');
     };

//#### Method compileFile(filename) returns Grammar.Module
     Project.prototype.compileFile = function(filename){

        //var filenameInfo = new Environment.FileInfo(filename)
        var filenameInfo = new Environment.FileInfo(filename);

        ////search the file
        //filenameInfo.searchModule .rootModule.fileInfo.dir
        filenameInfo.searchModule(this.rootModule.fileInfo.dir);

        //// create a module
        //var newModule = .createNewModule(filenameInfo, .rootModule)
        var newModule = this.createNewModule(filenameInfo, this.rootModule);

        //// compile the file
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
                //// uncontrolled
                //// add position & stack
                //err.message = "#{moduleNode.lexer.posToString()}\n#{err.stack or err.message}" 
                err.message = '' + (moduleNode.lexer.posToString()) + "\n" + (err.stack || err.message);
            };

            //logger.error err.message
            logger.error(err.message);

            //#show last soft error. Can be useful to pinpoint the problem
            //if moduleNode.lexer.softError, logger.msg "previous soft-error: #{moduleNode.lexer.softError.message}"
            if (moduleNode.lexer.softError) {logger.msg("previous soft-error: " + moduleNode.lexer.softError.message)};

            ////if process #we're in node.js
            ////    process.exit(1) 
            ////else
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
        ////var opt = new Names.NameDeclOptions
        ////opt.normalizeModeKeepFirstCase = true
        //moduleNode.exports = new Names.Declaration(fileInfo.base,undefined,moduleNode)
        moduleNode.exports = new Names.Declaration(fileInfo.base, undefined, moduleNode);
        //moduleNode.exportsReplaced = false
        moduleNode.exportsReplaced = false;
        
        //var moduleVar = moduleNode.addToScope('module')
        var moduleVar = moduleNode.addToScope('module');
        ////moduleNode.exports = moduleVar.addMember('exports') #add as member of 'module'
        ////var opt = new Names.NameDeclOptions
        ////opt.pointsTo = moduleNode.exports
        ////moduleNode.addToScope('exports',opt) #add also as 'exports' in scope

//add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

        //var fnameOpt = new Names.NameDeclOptions
        var fnameOpt = new Names.NameDeclOptions();
        //fnameOpt.value = fileInfo.filename
        fnameOpt.value = fileInfo.filename;
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
        //if no .options.nomap and moduleNode.fileInfo.outExtension is 'js'
        if (!this.options.nomap && moduleNode.fileInfo.outExtension === 'js') {
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

///*
//else, If the origin is a require() call

            //else if node instance of Grammar.VariableRef #require() call
                //declare node:Grammar.VariableRef
                //if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
                    //var requireCall:Grammar.FunctionAccess = node.accessors[0]
                    //if requireCall.args[0].expression.root.name instanceof Grammar.StringLiteral
                        //var stringLiteral = requireCall.args[0].expression.root.name
                        //importInfo.name = stringLiteral.getValue()
//*/

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

        
        ////ifndef PROD_C //except we're generating the compile-to-C compiler

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

        ////endif // skip node-js code if we're generatice the compile-to-C compiler


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
            //nameDecl = new Names.Declaration(name)
            nameDecl = new Names.Declaration(name);
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
        for ( var moduleNode__propName in this.moduleCache.dict) if (this.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=this.moduleCache.dict[moduleNode__propName];
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
