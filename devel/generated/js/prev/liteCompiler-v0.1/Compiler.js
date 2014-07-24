var ASTBase, Grammar, Lexer, Scope;

/* The LiteScript Compiler Module 
   ============================== 
   LiteScript is a highly readable language that compiles to JavaScript. 
   The LiteScript compiler is written in LiteScript. 
   String helpers. Note: if not assigned to dummy, not recognized as 'import' */
require('./string-shims');
require('./util'); /* .startWith, endsWith */
/* /! 
    
   declare Environment 
   declare on Environment 
   splitImportParameter 
   searchModule 
   checkExternalCache 
   loadFile 
   externalCacheSave 
    
   declare debug,log,color 
   declare on log 
   errors,warning,message 
    
   !/ 
   Dependencies */
ASTBase = require('./ASTBase');
Grammar = require('./Grammar');
Lexer = require('./Lexer');
Scope = require('./TypeCheck');
require('./Producer_js');

/* ---------------- 
   ###a Helper method *addBuiltInObject(name, type)* 
   Adds a BuiltIn Class to global scope 
   return class prototype */
ASTBase.prototype.addBuiltInObject = function (name, options) {
  var builtInObject, prop, lastProp, protoMember, ki$2, kobj$2, ki$1, kobj$1;
  /* /! 
      
     declare builtInObject:Grammar.NameDeclaration 
     !/ */
  if (!(options)) {
    options = {};
  }
  options.inScope = true;
  builtInObject = this.getRootNode().addToScope(name, options);
  /* Add 1st level properties, and for 'prototype', 2nd level as well */
  kobj$1 = Environment.getGlobalObjectProperties(name);
  for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
    prop = kobj$1[ki$1];
    lastProp = builtInObject.addMember(prop);
    if (prop === 'prototype') {
      kobj$2 = Environment.getGlobalObjectProperties(name, prop);
      for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
        protoMember = kobj$2[ki$2];
        lastProp.addMember(protoMember);
      }
    }
  }
  return builtInObject;
}

/* ###a helper method getMembersFromObjProperties(obj) - Recursive 
   recursively converts a obj properties in NameDeclarations. 
   it's used when a pure.js module is imported by 'require' 
   to convert required 'exports' to LiteScript compiler usable NameDeclarations */
Grammar.NameDeclaration.prototype.getMembersFromObjProperties = function (obj) {
  var prop, newMember, ki$3, kobj$3;
  /* /! 
      
     declare newMember:Grammar.NameDeclaration 
     !/ */
  newMember;
  if (obj instanceof Object) {
    kobj$3 = Object.keys(obj);
    for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
      prop = kobj$3[ki$3];
      newMember = this.addMember(prop);
      newMember.getMembersFromObjProperties(obj[prop]); /* recursive */
    }
  }
  /* 'protoype' is hidden from Object.keys(obj) */
  if (obj.prototype) {
    newMember = this.addMember('prototype');
    newMember.getMembersFromObjProperties(obj.prototype); /* recursive */
  }
}

/* ---------------- 
   Project class 
   ============= 
   A **Project** object acts as the root for a complex AST spanning several related **Modules** 
   Normally, you launch the project compilation by calling `Project.compile()` on the main module 
   of your project. At `Project.compile()` the main module is imported and compiled. 
   When a `ImportStatement: import IDENTIFIER`, or a `require()` call is found in the module code, 
   the *imported/required* "child" module is loaded, compiled **and cached**. 
   (is the same logic behind node's 'require' function). 
   This creates a **tree** of Modules, cached, and recursively parsed on demand. 
   The Modules dependency tree is the *Project tree*. 
   Project 
   ------- */
function Project(basePath, options) {
  var rootNode, root, objectPrototype, stringPrototype, functionPrototype, booleanPrototype;
  /* /! 
      
     declare root:Grammar.NameDeclaration 
     declare valid root.scope.addMember 
      
     declare functionPrototype:Grammar.NameDeclaration 
      
     declare valid me.root 
     declare valid me.recurseLevel 
      
     declare on options 
     target, debug, outDir 
      
     declare valid GLOBAL.debugOptions.enabled 
      
     declare window 
     declare valid window.Environment 
     declare valid GLOBAL.Environment 
     !/ 
     normalize options */
  if (!(options)) {
    options = {};
  }
  if (!(options.target)) {
    options.target = 'js';
  }
  if (!(options.debug)) {
    GLOBAL.debugOptions.enabled = false;
  }
  /* First create a 'Environment' for the compiler to use. 
     The global 'Environment' object, must provide functions to load files, search modules, 
     and a optional external cache (disk). 
     The `Environment` abstraction allows us to support compile on server(node) or the browser. */
  if (typeof window === 'undefined') {
    /* in node */
    GLOBAL.Environment = require('./node-environment-support.js');
  } else {
    window.Environment = require('./browser-environment-support.js');
  }
  /* Initialize this project. Receives compiling options 
     Project has a cache for required modules. As with node's `require` mechanism, a module, 
     when imported/required is only compiled once and then cached. */
  this.name = 'Project';
  this.basePath = basePath;
  this.options = options;
  this.moduleCache = {};
  this.fileInfo = {dirname: ".", moduleName: this.name};
  /* Create the "root" node (a NameDeclaration) to hold the globalScope and all modules. 
     All modules are children of "root". */
  rootNode = new Grammar.NameDeclaration(this);
  rootNode.name = "Project Root Node";
  /* Initialize global scope 
     "scope" in "project root Module" is the global scope (root) */
  root = rootNode.createScope();
  objectPrototype = root.addBuiltInObject('Object');
  stringPrototype = root.addBuiltInObject('String');
  functionPrototype = root.addBuiltInObject('Function');
  booleanPrototype = root.addBuiltInObject('Boolean');
  functionPrototype.addMember('name', {type: stringPrototype});
  functionPrototype.addMember('apply');
  functionPrototype.addMember('bind');
  functionPrototype.addMember('call');
  root.addBuiltInObject('Array');
  root.addBuiltInObject('Number');
  root.addBuiltInObject('RegExp');
  root.addBuiltInObject('JSON');
  root.addBuiltInObject('Error');
  root.addBuiltInObject('Math');
  root.addMember('true', {value: true});
  root.addMember('false', {value: false});
  root.addMember('undefined', {value: undefined});
  root.addMember('null', {value: null});
  root.addMember('require', {type: functionPrototype});
  root.addMember('debugger', {type: functionPrototype});
  root.addToScope('global', {type: root.scope});
  if (this.options.addGlobals) {
    root.addMembers(this.options.addGlobals);
  }
  this.root = root;
  /* compiler vars, usable at conditional compile */
  this.compilerVars = this.root.declareName('Compiler Vars');
  this.compilerVars.addMember('debug', {value: options.debug || false});
  log.message(this.compilerVars.toText());
  log.message("");
  /* in 'options' we receive also the target code to generate. (default is 'js') 
     Now we load the **Producer** module for the selected targent code. 
     The **Producer** extends Grammar classes adding a `produce()` method 
     which generates target code for the AST class. Example: [Producer_js.lite.md] */
  this.Producer = require('./Producer_' + options.target);
}

/* /! 
    
   properties 
   options, 
   name, basePath, fileInfo 
   moduleCache 
   root: Grammar.NameDeclaration 
   compilerVars: Grammar.NameDeclaration 
   lexer 
   Producer 
   recurseLevel 
    
   !/ */

/* ##Project.createNewModule */
Project.prototype.createNewModule = function (fileInfo) {
  var moduleNode, moduleVar;
  /* create a **new Module**. 
     and then create a **new lexer** for the Module 
     (each module has its own lexer. There is one lexer per file) */
  moduleNode = new Grammar.Module(this.root);
  moduleNode.name = fileInfo.filename;
  moduleNode.fileInfo = fileInfo;
  moduleNode.lexer = new Lexer();
  /* create the module scope 
     create two local scope vars: 
     'module' and 'exports = module.exports' 
     'exports' will hold all exported members */
  moduleNode.createScope();
  moduleVar = moduleNode.addToScope('module');
  moduleNode.exports = moduleVar.addMember('exports'); /* first, as member of 'module' */
  moduleNode.addToScope(moduleNode.exports); /* second reference as scope var 'exports' */
  /* add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id */
  moduleVar.addMember('filename', {value: fileInfo.filename});
  moduleVar.addMember('parent');
  /* Also, register every `import/require` in this module body, to track dependency. 
     We create a empty `.required[]` to keep track of every other importe/require '**importParameter**' 
     and also a empty `.imported[]` to hold the **imported AST Module node** */
  moduleNode.required = [];
  moduleNode.imported = [];
  return moduleNode;
}

/* ##Project.compileOnModule */
Project.prototype.compileOnModule = function (moduleNode, sourceLines) {
  var stage, errsEmitted, err;
  stage;
  /* set Lexer source code 
     process lines, tokenize 
     Parse source 
     prepare out buffer 
     & produce target code 
     the produced code will be at: moduleNode.outCode.getResult() :string array 
     Check if errors were emitted 
     Handle errors,  add stage info, and stack */
  try {
    stage = "lexer";
    moduleNode.lexer.initSource(moduleNode.name, sourceLines);
    moduleNode.lexer.process();
    stage = "parsing";
    moduleNode.parse();
    stage = "producing";
    moduleNode.outCode.start();
    moduleNode.produce();
    if (log.error.count) {
      errsEmitted = new Error(("" + (log.error.count) + " errors emitted"));
      errsEmitted.controled = true;
      throw errsEmitted;
    }
  } catch (err) {
    err = moduleNode.lexer.hardError || err; /* get important (inner) error */
    if (!(err.controled)) { /* if not 'controled' show call stack (includes err text) */
      err.message = ("" + stage + " stage\n" + (moduleNode.lexer.posToString()) + "\n" + (err.stack || err.message));
    } else {
      /* add stage info */
      err.message = ("" + stage + " stage. " + (err.message));
    }
    log.error(err.message);
    if (process) { /* we're in node.js */
      process.exit(1);
    } else {
      throw err;
    }
  }
}

/* ## Project.importModule - Recursive */
Project.prototype.importModule = function (importingModule, importParameter) {
  var indent, fileInfo, moduleNode, contents, declarationsContent, declarationsCache, requiredParam, ki$4, kobj$4, resultLines, exportedArray, cacheContents;
  /* The importModule method receives a `importParameter` string, 
     the raw string passed to `import/require` statements, 
     with the module to load and compile. 
     *Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation) 
     /! 
      
     declare valid me.root 
     declare valid me.recurseLevel 
      
     declare moduleNode:Grammar.Module 
     declare valid moduleNode.exports 
     declare valid moduleNode.required 
     declare valid moduleNode.imported 
      
     declare valid me.recurseLevel 
      
     declare contents:string 
      
     declare fileInfo 
     declare on fileInfo 
     importParameter #: raw string passed to import/require 
     dirname #: path.dirname(importParameter) 
     extension #: path.extname(importParameter) 
     moduleName #: clean module name, no path no extension 
     isLite #: true is extension is '.lite'|'.lite.md' 
     filename #: found full module filename 
     outFilename #: output file for code production 
     outExportRequired #: output file for export members cache 
     outExportRequiredExists #: if outExportRequired file exists 
      
     declare valid importingModule.fileInfo.dirname 
     !/ 
     Determine the full module filename. Search for the module in the environment. */
  this.recurseLevel += 1;
  indent = String.spaces(this.recurseLevel * 2);
  log.message("");
  log.message(indent, ("module '" + (importingModule.name) + "' imports '" + importParameter + "'"));
  fileInfo = Environment.searchModule(importParameter, this.basePath, importingModule.fileInfo.dirname, this.options);
  /* Before compiling the module, check internal, and external cache 
     Check Internal Cache: if it is already compiled, return cached Module node */
  if (this.moduleCache.hasOwnProperty(fileInfo.filename)) {
    log.message(indent, 'cached: ', fileInfo.filename);
    this.recurseLevel -= 1;
    return this.moduleCache[fileInfo.filename];
  }
  /* It isn't on internal cache, 
     then create a **new Module**. 
     and then create a **new lexer** for the Module 
     (each module has its own lexer. There is one lexer per file) */
  moduleNode = this.createNewModule(fileInfo);
  /* early add to local cache, to cut off circular references */
  this.moduleCache[fileInfo.filename] = moduleNode;
  /* if it is not a lite file, require the module, and get the exported vars 
     (it can be a pure-js module required) */
  if (!(fileInfo.isLite)) {
    log.message(indent, 'non-Lite module: ', fileInfo.filename);
    contents = Environment.loadFile(fileInfo.filename);
    Environment.externalCacheSave(fileInfo.outFilename, contents);
    contents = undefined;
    if (fileInfo.extension === '.js') {
      log.message(indent, ("require('" + (fileInfo.filename) + "')"));
      moduleNode.exports.getMembersFromObjProperties(require(fileInfo.filename));
    }
    this.recurseLevel -= 1;
    return moduleNode; /* import is done here */
  }
  /* /! 
      
     declare valid me.options.force 
     !/ 
     ####External cache 
     EXTERNAL CACHE DISABLED - beta */
  if (true || this.options.force) {
    /* do not use cache, delete files */
    Environment.externalCacheSave(fileInfo.outFilename);
    Environment.externalCacheSave(fileInfo.outExportRequired);
  } else {
    /* Check External Cache: 
       If the module is already compiled and cached in external cache (disk) 
       We just retrieve externally cached members and the list of required modules, 
       to continue with the dependency tree */
    if (Environment.checkExternalCache(fileInfo, this.options)) {
      log.message(indent, 'cached (external): ', fileInfo.outFilename);
      /* Get cached members */
      declarationsContent = Environment.loadFile(fileInfo.outExportRequired);
      declarationsCache = JSON.parse(declarationsContent);
      /* /! 
          
         declare on declarationsCache 
         exported,required 
          
         !/ 
         exported names goes to moduleNode.exports */
      moduleNode.exports.importMembersFromArray(declarationsCache.exported);
      /* Import the required modules, walk the dependency tree */
      moduleNode.required = declarationsCache.required;
      kobj$4 = moduleNode.required;
      for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
        requiredParam = kobj$4[ki$4];
        this.importModule(moduleNode, requiredParam);
      }
      /* and return the node, since it does not need compilation */
      this.recurseLevel -= 1;
      return moduleNode;
    }
  }
  /* end if - external cache 
     end if force - External cache 
     ####compile 
     If we have reached here, we need to compile the source. 'to compile' a module means: 
     Load source -> Lexer/Tokenize -> Parse/create AST -> Produce target code -> cache */
  log.message(indent, 'compile: ', fileInfo.filename);
  /* Load source code, compile into module */
  this.compileOnModule(moduleNode, Environment.loadFile(fileInfo.filename));
  /* Get the produced code */
  resultLines = moduleNode.outCode.getResult();
  /* add to external cache (save to disk) 
     Note: convert exports NameDeclarations to a simpler object structure for JSON & cache */
  Environment.externalCacheSave(fileInfo.outFilename, resultLines);
  exportedArray = moduleNode.exports.toExportArray();
  cacheContents = JSON.stringify({required: moduleNode.required, exported: exportedArray}, null, 2);
  Environment.externalCacheSave(fileInfo.outExportRequired, cacheContents);
  /* and return the Module node */
  log.message("");
  log.message(indent, color.green, 'compiled:', fileInfo.filename, color.normal);
  log.message(indent, resultLines.length, 'lines ->', fileInfo.outFilename);
  this.recurseLevel -= 1;
  return moduleNode;
}

/* end importModule 
   ##Project.startCompilation (mainModuleName) */
Project.prototype.startCompilation = function (mainModuleName) {
  /* /! 
      
     declare valid me.options.outDir 
     declare valid me.options.debug 
     !/ */
  log.message(("Base Path: " + (this.basePath)));
  log.message(("Out Dir: " + (this.options.outDir)));
  /* Import the main module. The main module will trigger import/require on the dependency tree */
  this.recurseLevel = 0;
  this.importModule(this, mainModuleName);
  if (log.error.count === 0) {
    console.log("compilation OK");
  }
}

/* After importing mainModuleName, if no errors occurred, 
   mainModuleName and all its dependencies, will be compiled in 
   the output dir: './out/debug' 
   end Project.startCompilation 
   ##export.compileLines 
   input: filename (for error reporting), LiteScript code: string array 
   output: moduleNode:Grammar.Module 
   compiled result is at: moduleNode.outCode.getResult() :string array */
exports.compileLines = function (filename, sourceLines, options) {
  var project, fileInfo, moduleNode;
  project = new Project('.', options || {});
  fileInfo = {filename: filename, dirname: '.'};
  moduleNode = project.createNewModule(fileInfo);
  project.compileOnModule(moduleNode, sourceLines);
  return moduleNode;
};

/* ##export.compile 
   The 'compile' function will import and compile the main Module of a project. 
   The compilation of the main module will trigger import and compilation of all its "child" modules 
   (dependency tree is constructed by `import`/`require` between modules) */
exports.compile = function (basePath, mainModuleName, options) {
  var project;
  /* Create a 'Project' to hold the main module and dependent modules */
  project = new Project(basePath, options);
  /* Now call `importModule` on the main module 
     and store the result in me.main 
     The main module is the root of the module dependency tree, and can reference 
     another modules via import/require. 
     We 'import' the main module, which in turn will 'import' and 'compile' -if not cached-, 
     all dependent modules. */
  project.startCompilation(mainModuleName);
  /* After project compilation, if no errors occurred, 
     mainModuleName and all its dependencies, will be compiled in 
     the output dir: './out/debug' */
  return project;
};

