#include "Project.h"
//-------------------------
//Module Project
//-------------------------
   //-----------------------
   // Class Project: static list of METHODS(verbs) and PROPS(things)
   //-----------------------
   
   static _methodInfoArr Project_METHODS = {
     { compile_, Project_compile },
     { compileFile_, Project_compileFile },
     { compileFileOnModule_, Project_compileFileOnModule },
     { parseOnModule_, Project_parseOnModule },
     { createNewModule_, Project_createNewModule },
     { produceModule_, Project_produceModule },
     { importDependencies_, Project_importDependencies },
     { importModule_, Project_importModule },
     { getInterface_, Project_getInterface },
     { compilerVar_, Project_compilerVar },
     { setCompilerVar_, Project_setCompilerVar },
     { redirectOutput_, Project_redirectOutput },
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t Project_PROPS[] = {
   options_
    , name_
    , moduleCache_
    , rootModule_
    , compilerVars_
    , main_
    , Producer_
    , recurseLevel_
    };
   
   // Project
   
   any Project; //Class Object

// A **Project** object acts as the rootModule for a complex AST spanning several related **Modules**

// Normally, you launch the project compilation by calling `compile()` on the main module
// of your project. At `compile()` the main module is imported and compiled.

// When a `ImportStatement: import IDENTIFIER`, or a `require()` call is found in the module code,
// the *imported|required* "child" module is loaded, compiled **and cached**.
// (is the same logic behind node's 'require' function).

// This creates a **tree** of Modules, cached, and recursively parsed on demand.
// The Modules dependency tree is the *Project tree*.

    // properties
    ;

        //lexer=undefined //dummy, to allow Project to be main module's parent

    // constructor new Project(filename, options:GeneralOptions)
    void Project__init(DEFAULT_ARGUMENTS){
    PROP(recurseLevel_,this)=any_number(0);
       // define named params
       var filename, options;
       filename=options=undefined;
       switch(argc){
         case 2:options=arguments[1];
         case 1:filename=arguments[0];
       }
       //---------

// Initialize this project. Project has a cache for required modules.
// As with node's `require` mechanism, a module,
// when imported|required is only compiled once and then cached.

       // .name = 'Project'
       PROP(name_,this) = any_str("Project");

       // .options = options
       PROP(options_,this) = options;
       // default options.now = new Date()
       _default(&PROP(now_,options),new(Date,0,NULL));

       // .moduleCache = new Map
       PROP(moduleCache_,this) = new(Map,0,NULL);

       // logger.errorCount = 0
       logger_errorCount = any_number(0);
       // logger.options.verboseLevel = options.verboseLevel
       PROP(verboseLevel_,logger_options) = PROP(verboseLevel_,options);
       // logger.options.warningLevel = options.warningLevel
       PROP(warningLevel_,logger_options) = PROP(warningLevel_,options);
       // logger.options.debugOptions.enabled = options.debugEnabled
       PROP(enabled_,PROP(debugOptions_,logger_options)) = PROP(debugEnabled_,options);
       // if options.debugEnabled, logger.debugClear
       if (_anyToBool(PROP(debugEnabled_,options))) {logger_debugClear(undefined,0,NULL);};

// set basePath from main module path

       // var tempFileInfo = new Environment.FileInfo(filename)
       var tempFileInfo = new(Environment_FileInfo,1,(any_arr){filename});
       // options.projectDir = tempFileInfo.dir
       PROP(projectDir_,options) = PROP(dir_,tempFileInfo);
       // options.mainModuleName = './#{tempFileInfo.base}'
       PROP(mainModuleName_,options) = _concatAny(2,(any_arr){any_str("./"), PROP(base_,tempFileInfo)});
       // options.outDir = Environment.resolvePath(options.outDir)
       PROP(outDir_,options) = Environment_resolvePath(undefined,1,(any_arr){PROP(outDir_,options)});

       // Environment.setBaseInfo options.projectDir, options.outDir, options.target
       Environment_setBaseInfo(undefined,3,(any_arr){PROP(projectDir_,options), PROP(outDir_,options), PROP(target_,options)});

       // logger.info 'Project Dir:',.options.projectDir
       logger_info(undefined,2,(any_arr){any_str("Project Dir:"), PROP(projectDir_,PROP(options_,this))});
       // logger.info 'Main Module:',.options.mainModuleName
       logger_info(undefined,2,(any_arr){any_str("Main Module:"), PROP(mainModuleName_,PROP(options_,this))});
       // logger.info 'Out Dir:',.options.outDir
       logger_info(undefined,2,(any_arr){any_str("Out Dir:"), PROP(outDir_,PROP(options_,this))});

// compiler vars, to use at conditional compilation

       // .compilerVars = new Map
       PROP(compilerVars_,this) = new(Map,0,NULL);

       // for each def in options.defines
       any _list5=PROP(defines_,options);
       { var def=undefined;
       for(int def__inx=0 ; def__inx<_list5.value.arr->length ; def__inx++){def=ITEM(def__inx,_list5);
           // .compilerVars.set def,new Names.Declaration(def)
           CALL2(set_,PROP(compilerVars_,this),def, new(Names_Declaration,1,(any_arr){def}));
       }};// end for each in PROP(defines_,options)

// add 'inNode' and 'inBrowser' as compiler vars

        //ifdef TARGET_JS
        //.compilerVars.set 'ENV_JS', new Names.Declaration("ENV_JS")
        //declare var window
        //var inNode = type of window is 'undefined'
        //if inNode
            //.compilerVars.set 'ENV_NODE',new Names.Declaration("ENV_NODE")
        //else
            //.compilerVars.set 'ENV_BROWSER',new Names.Declaration("ENV_BROWSER")
        //end if
        //endif

        //ifdef TARGET_C
       // .compilerVars.set 'ENV_C', new Names.Declaration("ENV_C")
       CALL2(set_,PROP(compilerVars_,this),any_str("ENV_C"), new(Names_Declaration,1,(any_arr){any_str("ENV_C")}));
        //endif

       // var targetDef = 'TARGET_#{options.target.toUpperCase()}'
       var targetDef = _concatAny(2,(any_arr){any_str("TARGET_"), (CALL0(toUpperCase_,PROP(target_,options)))});
       // .compilerVars.set targetDef,new Names.Declaration(targetDef)
       CALL2(set_,PROP(compilerVars_,this),targetDef, new(Names_Declaration,1,(any_arr){targetDef}));

       // logger.msg 'preprocessor #defined', .compilerVars.keys()
       logger_msg(undefined,2,(any_arr){any_str("preprocessor #defined"), CALL0(keys_,PROP(compilerVars_,this))});

        //logger.message .compilerVars
        //logger.info ""

// create a 'rootModule' module to hold global scope

       // .rootModule = new Grammar.Module() //parent is Project
       PROP(rootModule_,this) = new(Grammar_Module,0,NULL); //parent is Project
       // .rootModule.name = '*Global Scope*'
       PROP(name_,PROP(rootModule_,this)) = any_str("*Global Scope*");

       // .rootModule.fileInfo = new Environment.FileInfo('Project')
       PROP(fileInfo_,PROP(rootModule_,this)) = new(Environment_FileInfo,1,(any_arr){any_str("Project")});
       // .rootModule.fileInfo.relFilename='Project'
       PROP(relFilename_,PROP(fileInfo_,PROP(rootModule_,this))) = any_str("Project");
       // .rootModule.fileInfo.dir = options.projectDir
       PROP(dir_,PROP(fileInfo_,PROP(rootModule_,this))) = PROP(projectDir_,options);
       // .rootModule.fileInfo.outFilename = "#{options.outDir}/_project_"
       PROP(outFilename_,PROP(fileInfo_,PROP(rootModule_,this))) = _concatAny(2,(any_arr){PROP(outDir_,options), any_str("/_project_")});


// Validate.initialize will prepare the global scope
// by parsing the file: "lib/GlobalScopeJS.interface.md"

       // Validate.initialize this
       Validate_initialize(undefined,1,(any_arr){this});
    }

// In 'options' we receive also the target code to generate. (default is 'js')

    // method compile()
    any Project_compile(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------

// Import & compile the main module. The main module will, in turn, 'import' and 'compile'
// -if not cached-, all dependent modules.

       // var importInfo = new Environment.ImportParameterInfo
       var importInfo = new(Environment_ImportParameterInfo,0,NULL);
       // importInfo.name = .options.mainModuleName
       PROP(name_,importInfo) = PROP(mainModuleName_,PROP(options_,this));
       // .main = .importModule(.rootModule, importInfo)
       PROP(main_,this) = CALL2(importModule_,this,PROP(rootModule_,this), importInfo);
       // .main.isMain = true
       PROP(isMain_,PROP(main_,this)) = true;

       // if logger.errorCount is 0
       if (__is(logger_errorCount,any_number(0)))  {
           // logger.info "\nParsed OK"
           logger_info(undefined,1,(any_arr){any_str("\nParsed OK")});
       };

// Validate

       // if no .options.skip
       if (!_anyToBool(PROP(skip_,PROP(options_,this))))  {
           // logger.info "Validating"
           logger_info(undefined,1,(any_arr){any_str("Validating")});
           // Validate.validate this
           Validate_validate(undefined,1,(any_arr){this});
           // if logger.errorCount, logger.throwControlled '#{logger.errorCount} errors'
           if (_anyToBool(logger_errorCount)) {logger_throwControlled(undefined,1,(any_arr){_concatAny(2,(any_arr){logger_errorCount, any_str(" errors")})});};
       };

// Produce, for each module

       // logger.info "\nProducing #{.options.target} at #{.options.outDir}\n"
       logger_info(undefined,1,(any_arr){_concatAny(5,(any_arr){any_str("\nProducing "), PROP(target_,PROP(options_,this)), any_str(" at "), PROP(outDir_,PROP(options_,this)), any_str("\n")})});

       // for each moduleNode:Grammar.Module in map .moduleCache
       any _list6=PROP(moduleCache_,this);
       { NameValuePair_ptr _nvp1=NULL; //name:value pair
        var moduleNode=undefined; //value
       for(int64_t moduleNode__inx=0 ; moduleNode__inx<_list6.value.arr->length ; moduleNode__inx++){
         assert(ITEM(moduleNode__inx,_list6).value.class==&NameValuePair_CLASSINFO);
       _nvp1 = ITEM(moduleNode__inx,_list6).value.ptr;
         moduleNode=_nvp1->value;

         // if not moduleNode.fileInfo.isCore and moduleNode.referenceCount
         if (!(_anyToBool(PROP(isCore_,PROP(fileInfo_,moduleNode)))) && _anyToBool(PROP(referenceCount_,moduleNode)))  {

           // logger.extra "source:", moduleNode.fileInfo.importInfo.name
           logger_extra(undefined,2,(any_arr){any_str("source:"), PROP(name_,PROP(importInfo_,PROP(fileInfo_,moduleNode)))});
           // var result:string
           var result = undefined;

           // if not moduleNode.fileInfo.isLite
           if (!(_anyToBool(PROP(isLite_,PROP(fileInfo_,moduleNode)))))  {
               // logger.extra 'non-Lite module, copy to out dir.'
               logger_extra(undefined,1,(any_arr){any_str("non-Lite module, copy to out dir.")});
                // #copy the file to output dir
               // var contents = Environment.loadFile(moduleNode.fileInfo.filename)
               var contents = Environment_loadFile(undefined,1,(any_arr){PROP(filename_,PROP(fileInfo_,moduleNode))});
               // Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents)
               Environment_externalCacheSave(undefined,2,(any_arr){PROP(outFilename_,PROP(fileInfo_,moduleNode)), contents});
                // declare valid contents.length
               // result = "#{contents.length>>10 or 1} kb"
               result = _concatAny(2,(any_arr){(__or(any_number(_length(contents) >> 10),any_number(1))), any_str(" kb")});
               // contents=undefined
               contents = undefined;
           }
           
           else {

// produce & get result target code

               // .produceModule moduleNode
               CALL1(produceModule_,this,moduleNode);
               // var resultLines:string array =  moduleNode.lexer.outCode.getResult()
               var resultLines = CALL0(getResult_,PROP(outCode_,PROP(lexer_,moduleNode)));

// save to disk / add to external cache

               // Environment.externalCacheSave moduleNode.fileInfo.outFilename,resultLines
               Environment_externalCacheSave(undefined,2,(any_arr){PROP(outFilename_,PROP(fileInfo_,moduleNode)), resultLines});
               // result = "#{resultLines.length} lines"
               result = _concatAny(2,(any_arr){any_number(_length(resultLines)), any_str(" lines")});

                //ifdef PROD_C
               // resultLines =  moduleNode.lexer.outCode.getResult(1) //get .h file contents
               resultLines = CALL1(getResult_,PROP(outCode_,PROP(lexer_,moduleNode)),any_number(1)); //get .h file contents
               // if resultLines.length
               if (_length(resultLines))  {
                   // Environment.externalCacheSave '#{moduleNode.fileInfo.outFilename.slice(0,-1)}h',resultLines
                   Environment_externalCacheSave(undefined,2,(any_arr){_concatAny(2,(any_arr){(CALL2(slice_,PROP(outFilename_,PROP(fileInfo_,moduleNode)),any_number(0), any_number(-1))), any_str("h")}), resultLines});
               };
               // end if
               
           };

                //else
                //if moduleNode.lexer.out.sourceMap
//
                    //Environment.externalCacheSave moduleNode.fileInfo.outFilename+'.map',
                            //moduleNode.lexer.out.sourceMap.generate({
                                          //generatedFile: moduleNode.fileInfo.basename+moduleNode.fileInfo.outExtension
                                          //sourceFiles  : [moduleNode.fileInfo.sourcename]
                                          //})
                //end if
                //endif

//                 var exportedArray = moduleNode.exports.toExportArray()
//                 var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
//                 Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
//                 

           // end if

           // logger.msg "#{color.green}[OK] #{result} -> #{moduleNode.fileInfo.outRelFilename} #{color.normal}"
           logger_msg(undefined,1,(any_arr){_concatAny(7,(any_arr){color_green, any_str("[OK] "), result, any_str(" -> "), PROP(outRelFilename_,PROP(fileInfo_,moduleNode)), any_str(" "), color_normal})});
           // logger.extra #blank line
           logger_extra(undefined,0,NULL);// #blank line
         };
       }};// end for each in map PROP(moduleCache_,this)

       // end for each module cached

       // logger.msg "#{logger.errorCount} errors, #{logger.warningCount} warnings."
       logger_msg(undefined,1,(any_arr){_concatAny(4,(any_arr){logger_errorCount, any_str(" errors, "), logger_warningCount, any_str(" warnings.")})});

        //ifdef PROD_C
       // if no logger.errorCount, Producer_c.postProduction this
       if (!_anyToBool(logger_errorCount)) {Producer_c_postProduction(undefined,1,(any_arr){this});};
    return undefined;
    }
        //endif

    // method compileFile(filename) returns Grammar.Module
    any Project_compileFile(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var filename= argc? arguments[0] : undefined;
       //---------

       // var filenameInfo = new Environment.FileInfo(filename)
       var filenameInfo = new(Environment_FileInfo,1,(any_arr){filename});

        //search the file
       // filenameInfo.searchModule .rootModule.fileInfo
       CALL1(searchModule_,filenameInfo,PROP(fileInfo_,PROP(rootModule_,this)));

        // create a module
       // var newModule = .createNewModule(filenameInfo, .rootModule)
       var newModule = CALL2(createNewModule_,this,filenameInfo, PROP(rootModule_,this));

        // compile the file
       // .compileFileOnModule filenameInfo.filename, newModule
       CALL2(compileFileOnModule_,this,PROP(filename_,filenameInfo), newModule);

       // return newModule
       return newModule;
    return undefined;
    }

    // method compileFileOnModule(filename, moduleNode:Grammar.Module)
    any Project_compileFileOnModule(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var filename, moduleNode;
       filename=moduleNode=undefined;
       switch(argc){
         case 2:moduleNode=arguments[1];
         case 1:filename=arguments[0];
       }
       //---------

// Compilation:
// Load source -> Lexer/Tokenize -> Parse/create AST

       // logger.info Strings.spaces(this.recurseLevel*2),"compile: '#{Environment.relativeFrom(.options.projectDir,filename)}'"
       logger_info(undefined,2,(any_arr){Strings_spaces(undefined,1,(any_arr){any_number(_anyToNumber(PROP(recurseLevel_,this)) * 2)}), _concatAny(3,(any_arr){any_str("compile: '"), (Environment_relativeFrom(undefined,2,(any_arr){PROP(projectDir_,PROP(options_,this)), filename})), any_str("'")})});

// Load source code, parse

       // .parseOnModule moduleNode, filename, Environment.loadFile(filename)
       CALL3(parseOnModule_,this,moduleNode, filename, Environment_loadFile(undefined,1,(any_arr){filename}));

// Check if this module 'imported other modules'. Process Imports (recursive)

       // if no .options.single
       if (!_anyToBool(PROP(single_,PROP(options_,this))))  {
           // .importDependencies moduleNode
           CALL1(importDependencies_,this,moduleNode);
       };
    return undefined;
    }



    // method parseOnModule(moduleNode:Grammar.Module, filename, sourceLines)
    any Project_parseOnModule(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var moduleNode, filename, sourceLines;
       moduleNode=filename=sourceLines=undefined;
       switch(argc){
         case 3:sourceLines=arguments[2];
         case 2:filename=arguments[1];
         case 1:moduleNode=arguments[0];
       }
       //---------
        try{
// This method will initialize lexer & parse  source lines into ModuleNode scope

// set Lexer source code, process lines, tokenize

       // logger.errorCount = 0
       logger_errorCount = any_number(0);

       // var stage = "lexer"
       var stage = any_str("lexer");
       // moduleNode.lexer.initSource( filename, sourceLines )
       CALL2(initSource_,PROP(lexer_,moduleNode),filename, sourceLines);
       // moduleNode.lexer.process()
       CALL0(process_,PROP(lexer_,moduleNode));

// Parse source

       // stage = "parsing"
       stage = any_str("parsing");
       // moduleNode.parse()
       CALL0(parse_,moduleNode);

// Check if errors were emitted

       // if logger.errorCount, logger.throwControlled "#{logger.errorCount} errors emitted"
       if (_anyToBool(logger_errorCount)) {logger_throwControlled(undefined,1,(any_arr){_concatAny(2,(any_arr){logger_errorCount, any_str(" errors emitted")})});};

// Handle errors, add stage info, and stack

       // exception err
       
       }catch(err){

           // if err instanceof ControlledError  //if not 'controlled' show lexer pos & call stack (includes err text)
           if (_instanceof(err,ControlledError))  { //if not 'controlled' show lexer pos & call stack (includes err text)
               // err = moduleNode.lexer.hardError or err //get important (inner) error
               err = __or(PROP(hardError_,PROP(lexer_,moduleNode)),err); //get important (inner) error
           }
           
           else {
                // uncontrolled
                // add position & stack
               // err.message = "#{moduleNode.lexer.posToString()}\n#{err.stack or err.message}"
               PROP(message_,err) = _concatAny(3,(any_arr){(CALL0(posToString_,PROP(lexer_,moduleNode))), any_str("\n"), (__or(PROP(stack_,err),PROP(message_,err)))});
           };

           // logger.error err.message
           logger_error(undefined,1,(any_arr){PROP(message_,err)});

            // #show last soft error. Can be useful to pinpoint the problem
           // if moduleNode.lexer.softError, logger.msg "previous soft-error: #{moduleNode.lexer.softError.message}"
           if (_anyToBool(PROP(softError_,PROP(lexer_,moduleNode)))) {logger_msg(undefined,1,(any_arr){_concatAny(2,(any_arr){any_str("previous soft-error: "), PROP(message_,PROP(softError_,PROP(lexer_,moduleNode)))})});};

            //if process #we're in node.js
            //    process.exit(1)
            //else
           // throw err
           throw(err);
       };
    return undefined;
    }

    // method createNewModule(fileInfo, parent) returns Grammar.Module
    any Project_createNewModule(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var fileInfo, parent;
       fileInfo=parent=undefined;
       switch(argc){
         case 2:parent=arguments[1];
         case 1:fileInfo=arguments[0];
       }
       //---------

// create a **new Module** and then create a **new lexer** for the Module
// (each module has its own lexer. There is one lexer per file)

       // default parent = .rootModule
       _default(&parent,PROP(rootModule_,this));

       // var moduleNode = new Grammar.Module(parent)
       var moduleNode = new(Grammar_Module,1,(any_arr){parent});
       // moduleNode.name = fileInfo.filename
       PROP(name_,moduleNode) = PROP(filename_,fileInfo);
       // moduleNode.fileInfo = fileInfo
       PROP(fileInfo_,moduleNode) = fileInfo;
       // moduleNode.referenceCount = 0
       PROP(referenceCount_,moduleNode) = any_number(0);

// create a Lexer for the module. The Lexer receives this module exports as a "compiler"
// because the lexer preprocessor can compile marcros and generate code on the fly
// via 'compiler generate'

       // moduleNode.lexer = new Parser.Lexer(this, .options)
       PROP(lexer_,moduleNode) = new(Parser_Lexer,2,(any_arr){this, PROP(options_,this)});

// Now create the module scope, with two local scope vars:
// 'module' and 'exports = module.exports'. 'exports' will hold all exported members.

       // moduleNode.createScope()
       CALL0(createScope_,moduleNode);
        //var opt = new Names.NameDeclOptions
        //opt.normalizeModeKeepFirstCase = true
       // moduleNode.exports = new Names.Declaration(fileInfo.base,undefined,moduleNode)
       PROP(exports_,moduleNode) = new(Names_Declaration,3,(any_arr){PROP(base_,fileInfo), undefined, moduleNode});
       // moduleNode.exportsReplaced = false
       PROP(exportsReplaced_,moduleNode) = false;

       // var moduleVar = moduleNode.addToScope('module')
       var moduleVar = CALL1(addToScope_,moduleNode,any_str("module"));
        //moduleNode.exports = moduleVar.addMember('exports') #add as member of 'module'
        //var opt = new Names.NameDeclOptions
        //opt.pointsTo = moduleNode.exports
        //moduleNode.addToScope('exports',opt) #add also as 'exports' in scope

// add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

       // var fnameOpt = new Names.NameDeclOptions
       var fnameOpt = new(Names_NameDeclOptions,0,NULL);
       // fnameOpt.value = fileInfo.filename
       PROP(value_,fnameOpt) = PROP(filename_,fileInfo);
       // moduleVar.addMember moduleNode.declareName('filename',fnameOpt)
       CALL1(addMember_,moduleVar,CALL2(declareName_,moduleNode,any_str("filename"), fnameOpt));

// Also, register every `import|require` in this module body, to track modules dependencies.
// We create a empty a empty `.requireCallNodes[]`, to hold:
// 1. VariableRef, when is a require() call
// 2. each VariableDecl, from ImportStatements

       // moduleNode.requireCallNodes=[]
       PROP(requireCallNodes_,moduleNode) = _newArray(0,NULL);

       // return moduleNode
       return moduleNode;
    return undefined;
    }


    // method produceModule(moduleNode:Grammar.Module)
    any Project_produceModule(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var moduleNode= argc? arguments[0] : undefined;
       //---------

       // moduleNode.lexer.outCode.browser = .options.browser
       PROP(browser_,PROP(outCode_,PROP(lexer_,moduleNode))) = PROP(browser_,PROP(options_,this));

       // if .options.extraComments
       if (_anyToBool(PROP(extraComments_,PROP(options_,this))))  {
           // moduleNode.lexer.outCode.put "//Compiled by LiteScript compiler v#{.options.version}, source: #{moduleNode.fileInfo.filename}"
           CALL1(put_,PROP(outCode_,PROP(lexer_,moduleNode)),_concatAny(4,(any_arr){any_str("//Compiled by LiteScript compiler v"), PROP(version_,PROP(options_,this)), any_str(", source: "), PROP(filename_,PROP(fileInfo_,moduleNode))}));
           // moduleNode.lexer.outCode.startNewLine
           __call(startNewLine_,PROP(outCode_,PROP(lexer_,moduleNode)),0,NULL);
       };

       // moduleNode.produce
       __call(produce_,moduleNode,0,NULL);

        // #referenceSourceMap
       // if no .options.nomap and moduleNode.fileInfo.outExtension is 'js'
       if (!_anyToBool(PROP(nomap_,PROP(options_,this))) && __is(PROP(outExtension_,PROP(fileInfo_,moduleNode)),any_str("js")))  {
           // moduleNode.lexer.outCode.startNewLine
           __call(startNewLine_,PROP(outCode_,PROP(lexer_,moduleNode)),0,NULL);
           // moduleNode.lexer.outCode.put "//# sourceMappingURL=#{moduleNode.fileInfo.base}#{moduleNode.fileInfo.outExtension}.map"
           CALL1(put_,PROP(outCode_,PROP(lexer_,moduleNode)),_concatAny(4,(any_arr){any_str("//# sourceMappingURL="), PROP(base_,PROP(fileInfo_,moduleNode)), PROP(outExtension_,PROP(fileInfo_,moduleNode)), any_str(".map")}));
       };
    return undefined;
    }


    // method importDependencies(moduleNode:Grammar.Module)
    any Project_importDependencies(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var moduleNode= argc? arguments[0] : undefined;
       //---------

// Check if this module 'imported other modules'. Process Imports (recursive)

       // for each node in moduleNode.requireCallNodes
       any _list7=PROP(requireCallNodes_,moduleNode);
       { var node=undefined;
       for(int node__inx=0 ; node__inx<_list7.value.arr->length ; node__inx++){node=ITEM(node__inx,_list7);

           // var importInfo = new Environment.ImportParameterInfo
           var importInfo = new(Environment_ImportParameterInfo,0,NULL);

// get import parameter, and parent Module
// store a pointer to the imported module in
// the statement AST node

// If the origin is: ImportStatement/global Declare

           // if node instance of Grammar.ImportStatementItem
           if (_instanceof(node,Grammar_ImportStatementItem))  {
                // declare node:Grammar.ImportStatementItem
               // if node.importParameter
               if (_anyToBool(PROP(importParameter_,node)))  {
                   // importInfo.name = node.importParameter.getValue()
                   PROP(name_,importInfo) = CALL0(getValue_,PROP(importParameter_,node));
               }
               
               else {
                   // importInfo.name = node.name
                   PROP(name_,importInfo) = PROP(name_,node);
               };

               // if node.hasAdjective('shim') and node.findInScope(importInfo.name)
               if (_anyToBool(CALL1(hasAdjective_,node,any_str("shim"))) && _anyToBool(CALL1(findInScope_,node,PROP(name_,importInfo))))  {
                   // continue // do not import if shim and already declared
                   continue; // do not import if shim and already declared
               };

// if it was 'global import, inform, els search will be local '.','./lib' and '../lib'

                // declare valid node.parent.global
               // if node.parent instanceof Grammar.DeclareStatement
               if (_instanceof(PROP(parent_,node),Grammar_DeclareStatement))  {
                   // importInfo.isGlobalDeclare = true
                   PROP(isGlobalDeclare_,importInfo) = true;
               }
               
               else if (_instanceof(PROP(parent_,node),Grammar_ImportStatement))  {
                   // importInfo.globalImport = node.parent.global
                   PROP(globalImport_,importInfo) = PROP(global_,PROP(parent_,node));
               };
           }

// else, If the origin is a require() call
           
           else if (_instanceof(node,Grammar_VariableRef))  {// #require() call
                // declare node:Grammar.VariableRef
               // if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
               if (_anyToBool(PROP(accessors_,node)) && _instanceof(ITEM(0,PROP(accessors_,node)),Grammar_FunctionAccess))  {
                   // var requireCall:Grammar.FunctionAccess = node.accessors[0]
                   var requireCall = ITEM(0,PROP(accessors_,node));
                   // if requireCall.args[0].expression.root.name instanceof Grammar.StringLiteral
                   if (_instanceof(PROP(name_,PROP(root_,PROP(expression_,ITEM(0,PROP(args_,requireCall))))),Grammar_StringLiteral))  {
                       // var stringLiteral = requireCall.args[0].expression.root.name
                       var stringLiteral = PROP(name_,PROP(root_,PROP(expression_,ITEM(0,PROP(args_,requireCall)))));
                       // importInfo.name = stringLiteral.getValue()
                       PROP(name_,importInfo) = CALL0(getValue_,stringLiteral);
                   };
               };
           };

// if found a valid filename to import

           // if importInfo.name
           if (_anyToBool(PROP(name_,importInfo)))  {
               // node.importedModule = .importModule(moduleNode, importInfo)
               PROP(importedModule_,node) = CALL2(importModule_,this,moduleNode, importInfo);
           };
       }};// end for each in PROP(requireCallNodes_,moduleNode)
       
    return undefined;
    }

        // #loop


    // method importModule(importingModule:Grammar.Module, importInfo: Environment.ImportParameterInfo)
    any Project_importModule(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var importingModule, importInfo;
       importingModule=importInfo=undefined;
       switch(argc){
         case 2:importInfo=arguments[1];
         case 1:importingModule=arguments[0];
       }
       //---------

// importParameter is the raw string passed to `import/require` statements,

// *Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        // declare valid .recurseLevel

       // .recurseLevel++
       PROP(recurseLevel_,this).value.number++;
       // var indent = Strings.spaces(.recurseLevel*2)
       var indent = Strings_spaces(undefined,1,(any_arr){any_number(_anyToNumber(PROP(recurseLevel_,this)) * 2)});

       // logger.info ""
       logger_info(undefined,1,(any_arr){any_EMPTY_STR});
       // logger.info indent,"'#{importingModule.fileInfo.relFilename}' imports '#{importInfo.name}'"
       logger_info(undefined,2,(any_arr){indent, _concatAny(5,(any_arr){any_str("'"), PROP(relFilename_,PROP(fileInfo_,importingModule)), any_str("' imports '"), PROP(name_,importInfo), any_str("'")})});

// Determine the full module filename. Search for the module in the environment.

       // var fileInfo = new Environment.FileInfo(importInfo)
       var fileInfo = new(Environment_FileInfo,1,(any_arr){importInfo});

       // fileInfo.searchModule importingModule.fileInfo
       CALL1(searchModule_,fileInfo,PROP(fileInfo_,importingModule));

// Before compiling the module, check internal, and external cache

// Check Internal Cache: if it is already compiled, return cached Module node

       // if .moduleCache.has(fileInfo.filename) #registered
       if (_anyToBool(CALL1(has_,PROP(moduleCache_,this),PROP(filename_,fileInfo))))  {// #registered
           // logger.info indent,'cached: ',fileInfo.filename
           logger_info(undefined,3,(any_arr){indent, any_str("cached: "), PROP(filename_,fileInfo)});
           // .recurseLevel--
           PROP(recurseLevel_,this).value.number--;
           // return .moduleCache.get(fileInfo.filename)
           return CALL1(get_,PROP(moduleCache_,this),PROP(filename_,fileInfo));
       };

// It isn't on internal cache, then create a **new Module**.

       // var moduleNode = .createNewModule(fileInfo)
       var moduleNode = CALL1(createNewModule_,this,fileInfo);

// early add to local cache, to cut off circular references

       // .moduleCache.set fileInfo.filename, moduleNode
       CALL2(set_,PROP(moduleCache_,this),PROP(filename_,fileInfo), moduleNode);

// Check if we can get exports from a "interface.md" file

       // if .getInterface(importingModule, fileInfo, moduleNode)
       if (_anyToBool(CALL3(getInterface_,this,importingModule, fileInfo, moduleNode)))  {
            // #getInterface also loads and analyze .js interfaces

            // #if it is an interface, but loaded from 'import' statement
            // #we increment .referenceCount in order to produce the file
           // if not importInfo.isGlobalDeclare, moduleNode.referenceCount++
           if (!(_anyToBool(PROP(isGlobalDeclare_,importInfo)))) {PROP(referenceCount_,moduleNode).value.number++;};
       }

// else, we need to compile the file
       
       else {

           // if importingModule is .rootModule and .options.compileIfNewer and fileInfo.outFileIsNewer
           if (__is(importingModule,PROP(rootModule_,this)) && _anyToBool(PROP(compileIfNewer_,PROP(options_,this))) && _anyToBool(PROP(outFileIsNewer_,fileInfo)))  {
               //do nothing
               ; //do not compile if source didnt change
           }
           
           else {
               // this.compileFileOnModule fileInfo.filename, moduleNode
               CALL2(compileFileOnModule_,this,PROP(filename_,fileInfo), moduleNode);
               // moduleNode.referenceCount++
               PROP(referenceCount_,moduleNode).value.number++;
           };
       };


// at last, return the parsed Module node

       // this.recurseLevel-=1
       PROP(recurseLevel_,this).value.number -= 1;
       // return moduleNode
       return moduleNode;
    return undefined;
    }

    // #end importModule



    // method getInterface(importingModule,fileInfo, moduleNode:Grammar.Module )
    any Project_getInterface(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var importingModule, fileInfo, moduleNode;
       importingModule=fileInfo=moduleNode=undefined;
       switch(argc){
         case 3:moduleNode=arguments[2];
         case 2:fileInfo=arguments[1];
         case 1:importingModule=arguments[0];
       }
       //---------
// If a 'interface' file exists, compile interface declarations instead of file
// return true if interface (exports) obtained

       // if fileInfo.interfaceFileExists
       if (_anyToBool(PROP(interfaceFileExists_,fileInfo)))  {
            // # compile interface
           // this.compileFileOnModule fileInfo.interfaceFile, moduleNode
           CALL2(compileFileOnModule_,this,PROP(interfaceFile_,fileInfo), moduleNode);
           // return true //got Interface
           return true; //got Interface
       };
    return undefined;
    }


        //ifndef PROD_C //except we're generating the compile-to-C compiler
//
//Check if we're compiling for the browser
//
        //if .options.browser
            //if fileInfo.extension is '.js'
                //logger.throwControlled 'Missing #{fileInfo.relPath}/#{fileInfo.basename}.interface.md for '
            //else # assume a .lite.md file
                //return false //getInterface returning false means call "CompileFile"
//
//here, we're compiling for node.js environment
//for .js file/core/global module,
//call node.js **require()** for parameter
//and generate & cache interface
//
        //if fileInfo.isCore or fileInfo.importInfo.globalImport or fileInfo.extension is '.js'
//
            //logger.info String.spaces(this.recurseLevel*2),
                //fileInfo.isCore?"core module":"javascript file",
                //"require('#{fileInfo.basename}')"
//
            //if not fileInfo.isCore
//
//hack for require(). Simulate we're at the importingModule dir
//for node's require() function to look at the same dirs as at runtime
//
                //declare on module paths:string array
                //declare valid module.constructor._nodeModulePaths
//
                //var savePaths = module.paths, saveFilename = module.filename
                //module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname)
                //module.filename = importingModule.fileInfo.filename
                //logger.debug "importingModule", module.filename
//
            //var requiredNodeJSModule = require(fileInfo.importInfo.name)
            //moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule)
//
            //if not fileInfo.isCore #restore
                //module.paths= savePaths
                //module.filename= saveFilename
//
            //return true
//
        //endif // skip node-js code if we're generatice the compile-to-C compiler


    // helper method compilerVar(name) returns Names.Declaration // or undefined
    any Project_compilerVar(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
// helper compilerVar(name)
// return rootModule.compilerVars.members[name].value

       // return .compilerVars.get(name)
       return CALL1(get_,PROP(compilerVars_,this),name);
    return undefined;
    }

    // helper method setCompilerVar(name,value)
    any Project_setCompilerVar(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var name, value;
       name=value=undefined;
       switch(argc){
         case 2:value=arguments[1];
         case 1:name=arguments[0];
       }
       //---------
// helper compilerVar(name)
// rootModule.compilerVars.members.set(name,value)

       // if no .compilerVars.get(name) into var nameDecl
       var nameDecl=undefined;
       if (!(_anyToBool((nameDecl=CALL1(get_,PROP(compilerVars_,this),name)))))  {
           // nameDecl = new Names.Declaration(name)
           nameDecl = new(Names_Declaration,1,(any_arr){name});
           // .compilerVars.set name, nameDecl
           CALL2(set_,PROP(compilerVars_,this),name, nameDecl);
       };

       // nameDecl.setMember "**value**",value
       CALL2(setMember_,nameDecl,any_str("**value**"), value);
    return undefined;
    }

    // helper method redirectOutput(newOut)
    any Project_redirectOutput(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Project));
       //---------
       // define named params
       var newOut= argc? arguments[0] : undefined;
       //---------

       // for each moduleNode:Grammar.Module in map .moduleCache
       any _list8=PROP(moduleCache_,this);
       { NameValuePair_ptr _nvp2=NULL; //name:value pair
        var moduleNode=undefined; //value
       for(int64_t moduleNode__inx=0 ; moduleNode__inx<_list8.value.arr->length ; moduleNode__inx++){
             assert(ITEM(moduleNode__inx,_list8).value.class==&NameValuePair_CLASSINFO);
       _nvp2 = ITEM(moduleNode__inx,_list8).value.ptr;
             moduleNode=_nvp2->value;
             // moduleNode.lexer.outCode = newOut
             PROP(outCode_,PROP(lexer_,moduleNode)) = newOut;
       }};// end for each in map PROP(moduleCache_,this)
       
    return undefined;
    }
   // shim import Map
   // import Environment
   // import Producer_c

// ##Add helper properties and methods to AST node class Module

   // append to class Grammar.Module
    // properties
    ;

    // method getCompiledLines returns string array
    any Grammar_Module_getCompiledLines(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Module));
       //---------
       // return .lexer.outCode.getResult()
       return CALL0(getResult_,PROP(outCode_,PROP(lexer_,this)));
    return undefined;
    }

    // method getCompiledText returns string
    any Grammar_Module_getCompiledText(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Module));
       //---------
       // return .lexer.outCode.getResult().join('\n')
       return CALL1(join_,CALL0(getResult_,PROP(outCode_,PROP(lexer_,this))),any_str("\n"));
    return undefined;
    }


   // append to class Grammar.VariableRef
    // properties
    ;

   // append to class Grammar.ImportStatementItem
    // properties
    ;


//-------------------------
void Project__moduleInit(void){
       Project =_newClass("Project", Project__init, sizeof(struct Project_s), Object.value.class);
   
       _declareMethods(Project.value.class, Project_METHODS);
       _declareProps(Project.value.class, Project_PROPS, sizeof Project_PROPS);
   
};