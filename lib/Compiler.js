//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.7/Compiler.lite.md
   var version = '0.7.0';
   
   module.exports.version = version;
   var buildDate = '20140609';
   
   module.exports.buildDate = buildDate;
   var Project = require('./Project');
   var Validate = require('./Validate');
   var Grammar = require('./Grammar');
   var log = require('./log');
   Project.version = version;
   var debug = log.debug;
   var Environment = require('./Environment');
   function compile(filename, sourceLines, options){
       
       if (options.storeMessages) {
           log.options.storeMessages = true;
           log.getMessages();
       };
       var moduleNode = compileModule(filename, sourceLines, options);
       return moduleNode.getCompiledText();
   };
   
   module.exports.compile=compile;
   function compileProject(mainModule, options){
       if(!options) options={};
       if(options.outDir===undefined) options.outDir='.';
       if(options.target===undefined) options.target='js';
       log.extra("Out Dir: " + options.outDir);
       var project = new Project(mainModule, options);
       project.compile();
       return project;
   };
   
   module.exports.compileProject=compileProject;
   function compileModule(filename, sourceLines, options){
       if(filename===undefined) filename='unnamed';
       
       options.version = version;
       var project = new Project(filename, options);
       var fileInfo = new Environment.FileInfo({name: filename});
       var moduleNode = project.createNewModule(fileInfo);
       project.parseOnModule(moduleNode, filename, sourceLines);
       project.moduleCache[filename] = moduleNode;
       if (!project.options.single) {
           project.importDependencies(moduleNode);
       };
       if (!project.options.skip) {
           Validate.validate(project);
           if (log.error.count === 0) {log.info("Validation OK");};
       };
       log.info("Generating " + project.options.target);
       project.produceModule(moduleNode);
       if (log.error.count !== 0) {log.throwControled("#log.error.count errors during compilation");};
       return moduleNode;
   };
   
   module.exports.compileModule=compileModule;
   function extension_LoadLS(requiringModule, filename){
       var content = compile(filename, Environment.loadFile(filename), {verbose: 0, warnings: 0});
       
       requiringModule._compile(content, filename);
   };
   function registerRequireExtensions(){
       
       if (require.extensions) {
         require.extensions['.lite.md'] = extension_LoadLS;
         require.extensions['.lite'] = extension_LoadLS;
         require.extensions['.md'] = extension_LoadLS;
       };
   };
   
   module.exports.registerRequireExtensions=registerRequireExtensions;
   function getMessages(){
       return log.getMessages();
   };
   
   module.exports.getMessages=getMessages;