#include "Compiler.h"
//-------------------------
//Module Compiler
//-------------------------
#include "Compiler.c.extra"
var Compiler_version;
var Compiler_buildDate;
any Compiler_compile(DEFAULT_ARGUMENTS); //forward declare
any Compiler_compileProject(DEFAULT_ARGUMENTS); //forward declare
any Compiler_compileModule(DEFAULT_ARGUMENTS); //forward declare
any Compiler_getMessages(DEFAULT_ARGUMENTS); //forward declare
//The LiteScript Compiler Module
//==============================
//LiteScript is a highly readable language that compiles to JavaScript.
    //export var version = '0.8.1'
    //export var buildDate = '20140618'
    //lexer options literal map //make new Map() from literal objects {name:value}
//This v0.6 compiler is written in v0.5 syntax. 
//That is, you use the v0.5 compiler to compile this code 
//and you get a v0.6 compiler, suporting v0.6 syntax.
//###Module Dependencies
//The Compiler module is the main interface to LiteScript Project module.
   // 
    //import 
        //Project, Validate
        //Grammar 
        //logger, GeneralOptions
    
   // 
//Get the 'Environment' object for the compiler to use.
//The 'Environment' object, must provide functions to load files, search modules, 
//and a optional external cache (disk). 
//The `Environment` abstraction allows us to support compile on server(node) or the browser.
    //import Environment
    
  // 
//## Main API functions: LiteScript.compile & LiteScript.compileProject
//### export Function compile (filename, sourceLines, options: GeneralOptions) returns string
    any Compiler_compile(DEFAULT_ARGUMENTS){
        // define named params
        var filename, sourceLines, options;
        filename=sourceLines=options=undefined;
        switch(argc){
          case 3:options=arguments[2];
          case 2:sourceLines=arguments[1];
          case 1:filename=arguments[0];
        }
        //---------
//Used to compile source code loaded in memory (instead of loading a file)
//input: 
//* filename (for error reporting), 
//* sourceLines: LiteScript code: string array | large string | Buffer 
//output: 
//* string, compiled code
        //options.version = version
        PROP(version_,options) = Compiler_version;
        //if options.storeMessages
        if (_anyToBool(PROP(storeMessages_,options)))  {
            //logger.options.storeMessages = true
            PROP(storeMessages_,logger_options) = true;
            //logger.getMessages //clear
            logger_getMessages(undefined,0,NULL); //clear
        };
        //var moduleNode = compileModule(filename, sourceLines, options)
        var moduleNode = Compiler_compileModule(undefined,3,(any_arr){filename, sourceLines, options});
        //return moduleNode.getCompiledText()
        return METHOD(getCompiledText_,moduleNode)(moduleNode,0,NULL);
    return undefined;
    }
//### export Function compileProject (mainModule, options:GeneralOptions) returns Project
    any Compiler_compileProject(DEFAULT_ARGUMENTS){
        // define named params
        var mainModule, options;
        mainModule=options=undefined;
        switch(argc){
          case 2:options=arguments[1];
          case 1:mainModule=arguments[0];
        }
        //---------
//The 'compileProject' function will load and compile the main Module of a project. 
//The compilation of the main module will trigger import and compilation of all its "child" modules 
//(dependency tree is constructed by `import`/`require` between modules)
//The main module is the root of the module dependency tree, and can reference
//another modules via import|require.
//Create a 'Project' to hold the main module and dependant modules
        ////ifdef PROD_C
        //default options.outDir = 'out'
        _default(&PROP(outDir_,options),any_str("out"));
        //default options.target = 'c'
        _default(&PROP(target_,options),any_str("c"));
        ////else
        ////default options.outDir = '.'
        ////default options.target = 'js'
        ////endif
        //options.version = version
        PROP(version_,options) = Compiler_version;
        //console.time 'Total Compile Project'
        console_time(undefined,1,(any_arr){any_str("Total Compile Project")});
        //var project = new Project(mainModule, options)
        var project = new(Project,2,(any_arr){mainModule, options});
        //project.compile
        METHOD(compile_,project)(project,0,NULL);
        //console.timeEnd 'Total Compile Project'
        console_timeEnd(undefined,1,(any_arr){any_str("Total Compile Project")});
        //return project
        return project;
    return undefined;
    }
//After generating all modules, if no errors occurred, 
//mainModuleName and all its dependencies will be compiled in the output dir
//## Secondary Function: compileModule, returns Grammar.Module
//### export Function compileModule (filename, sourceLines, options:GeneralOptions) returns Grammar.Module
    any Compiler_compileModule(DEFAULT_ARGUMENTS){
        // define named params
        var filename, sourceLines, options;
        filename=sourceLines=options=undefined;
        switch(argc){
          case 3:options=arguments[2];
          case 2:sourceLines=arguments[1];
          case 1:filename=arguments[0];
        }
        //---------
//Compile a module from source in memory
//input: 
//* filename (for error reporting), 
//* sourceLines: LiteScript code: string array | large string | Buffer 
//output: 
//* moduleNode: Grammar.Module: module's code AST root node 
//		default filename = 'unnamed'
        _default(&filename,any_str("unnamed"));
        //options.version = version
        PROP(version_,options) = Compiler_version;
        //var project = new Project(filename, options)
        var project = new(Project,2,(any_arr){filename, options});
        //var fileInfo = new Environment.FileInfo(filename)
        var fileInfo = new(Environment_FileInfo,1,(any_arr){filename});
        //var moduleNode = project.createNewModule(fileInfo)
        var moduleNode = METHOD(createNewModule_,project)(project,1,(any_arr){fileInfo});
//parse source lines & store in moduleCache for validation
       // 
        //project.parseOnModule moduleNode, filename, sourceLines
        METHOD(parseOnModule_,project)(project,3,(any_arr){moduleNode, filename, sourceLines});
        //project.moduleCache.set filename,moduleNode
        __call(set_,PROP(moduleCache_,project),2,(any_arr){filename, moduleNode});
//import dependencies
        //if no project.options.single
        if (!_anyToBool(PROP(single_,PROP(options_,project))))  {
            //project.importDependencies moduleNode
            METHOD(importDependencies_,project)(project,1,(any_arr){moduleNode});
        };
//validate var & property names
        //if no project.options.skip
        if (!_anyToBool(PROP(skip_,PROP(options_,project))))  {
            //Validate.validate project
            Validate_validate(undefined,1,(any_arr){project});
            //if logger.errorCount is 0, logger.info "Validation OK"
            if (__is(logger_errorCount,any_number(0))) {logger_info(undefined,1,(any_arr){any_str("Validation OK")});};
        };
//initialize out buffer & produce target code 
   // 
        //logger.info "Generating #{project.options.target}"
        logger_info(undefined,1,(any_arr){_concatAny(2,any_str("Generating "), PROP(target_,PROP(options_,project)))});
        //project.produceModule moduleNode
        METHOD(produceModule_,project)(project,1,(any_arr){moduleNode});
        //# the produced code will be at: moduleNode.lexer.out.getResult() :string array
        //if logger.errorCount isnt 0, logger.throwControlled "#logger.errorCount errors during compilation"
        if (!__is(logger_errorCount,any_number(0))) {logger_throwControlled(undefined,1,(any_arr){any_str("#logger.errorCount errors during compilation")});};
//text compiled result can be obtained with: moduleNode.lexer.out.getResult() :string array
        //return moduleNode
        return moduleNode;
    return undefined;
    }
    ////ifndef PROD_C
////
////Require Extensions
////------------------
////
////This segment adds extensions to node's `require` function
////for LiteScript files so that you can just `require` a .lite.md file
////without having to compile it ahead of time
////
    ////helper function extension_LoadLS(requiringModule, filename)
////
////Read the file, then compile using the `compile` function above.
////Then use node's built-in compile function to compile the generated JavaScript.
////
        ////var options = new GeneralOptions
        ////options.verboseLevel = 0
        ////options.warningsLevel = 0
        ////var content = compile(filename, Environment.loadFile(filename),options)
        ////declare valid requiringModule._compile
        ////requiringModule._compile(content, filename)
////
////
    ////export helper function registerRequireExtensions
////
////Add the extension for all appropriate file types. Don't overwrite `.md` in case CoffeeScript or something else is already using it.
////
        ////declare on require
            ////extensions
////
        ////if require.extensions
////
          ////require.extensions['.lite.md'] = extension_LoadLS
          ////require.extensions['.lite'] = extension_LoadLS
          ////require.extensions['.md'] = extension_LoadLS
////
    ////endif
//##Helper module functions
//### public function getMessages() returns string array
    any Compiler_getMessages(DEFAULT_ARGUMENTS){
//if compile() throws, call getMessages() to retrieve compiler messages
        //return logger.getMessages();
        return logger_getMessages(undefined,0,NULL);
    return undefined;
    }

//-------------------------
void Compiler__moduleInit(void){
    Compiler_version = any_str("0.8.1");
    Compiler_buildDate = any_str("20140618");
};
