#include "Environment.h"
//-------------------------
//Module Environment
//-------------------------
var Environment_projectDir, Environment_outDir, Environment_targetExt;
   //-----------------------
   // Class Environment_FileInfo: static list of METHODS(verbs) and PROPS(things)
   //-----------------------
   
   static _methodInfoArr Environment_FileInfo_METHODS = {
     { outWithExtension_, Environment_FileInfo_outWithExtension },
     { searchModule_, Environment_FileInfo_searchModule },
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t Environment_FileInfo_PROPS[] = {
   importInfo_
    , dir_
    , extension_
    , base_
    , sourcename_
    , hasPath_
    , isCore_
    , isLite_
    , isInterface_
    , filename_
    , relPath_
    , relFilename_
    , outDir_
    , outFilename_
    , outRelFilename_
    , outExtension_
    , outFileIsNewer_
    , interfaceFile_
    , interfaceFileExists_
    , externalCacheExists_
    };
   
any Environment_setBaseInfo(DEFAULT_ARGUMENTS); //forward declare
any Environment_relativeFrom(DEFAULT_ARGUMENTS); //forward declare
any Environment_resolvePath(DEFAULT_ARGUMENTS); //forward declare
any Environment_dirName(DEFAULT_ARGUMENTS); //forward declare
any Environment_loadFile(DEFAULT_ARGUMENTS); //forward declare
any Environment_externalCacheSave(DEFAULT_ARGUMENTS); //forward declare
any Environment_isBuiltInModule(DEFAULT_ARGUMENTS); //forward declare
any Environment_isBuiltInObject(DEFAULT_ARGUMENTS); //forward declare
any Environment_getGlobalObject(DEFAULT_ARGUMENTS); //forward declare
any Environment_fileInfoNewFile(DEFAULT_ARGUMENTS); //forward declare
   //-----------------------
   // Class Environment_ImportParameterInfo: static list of METHODS(verbs) and PROPS(things)
   //-----------------------
   
   static _methodInfoArr Environment_ImportParameterInfo_METHODS = {
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t Environment_ImportParameterInfo_PROPS[] = {
   name_
    , isGlobalDeclare_
    , globalImport_
    , createFile_
    };
   
   

//--------------
   // Environment_FileInfo
   any Environment_FileInfo; //Class Environment_FileInfo

    // properties
    ;

    // constructor (info:ImportParameterInfo)
    void Environment_FileInfo__init(DEFAULT_ARGUMENTS){
       // define named params
       var info= argc? arguments[0] : undefined;
       //---------

       // if typeof info is 'string'
       if (__is(_typeof(info),any_str("string")))  {
           // var filename = info
           var filename = info;
           // info = new ImportParameterInfo
           info = new(Environment_ImportParameterInfo,0,NULL);
           // info.name = filename
           PROP(name_,info) = filename;
       };

       // var name = info.name;
       var name = PROP(name_,info);
       // this.importInfo = info;
       PROP(importInfo_,this) = info;
       // this.filename = name
       PROP(filename_,this) = name;
       // this.dir = path.resolve(path.dirname(name))
       PROP(dir_,this) = path_resolve(undefined,1,(any_arr){path_dirname(undefined,1,(any_arr){name})});
       // this.hasPath = name.charAt(0) in [path.sep,'.']
       PROP(hasPath_,this) = any_number(__in(CALL1(charAt_,name,any_number(0)),2,(any_arr){path_sep, any_str(".")}));
       // this.sourcename = path.basename(name)
       PROP(sourcename_,this) = path_basename(undefined,1,(any_arr){name});
       // this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
       PROP(isInterface_,this) = any_number(!__is(CALL1(indexOf_,PROP(sourcename_,this),any_str(".interface.")),any_number(-1)));
       // this.extension = path.extname(name)
       PROP(extension_,this) = path_extname(undefined,1,(any_arr){name});
       // this.base = path.basename(name,this.extension)
       PROP(base_,this) = path_basename(undefined,2,(any_arr){name, PROP(extension_,this)});

        // #remove .lite from double extension .lite.md
       // if this.base.endsWith('.lite'), this.base=this.base.slice(0,-5)
       if (_anyToBool(CALL1(endsWith_,PROP(base_,this),any_str(".lite")))) {PROP(base_,this) = CALL2(slice_,PROP(base_,this),any_number(0), any_number(-5));};
    }

    // method outWithExtension(ext)
    any Environment_FileInfo_outWithExtension(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Environment_FileInfo));
       //---------
       // define named params
       var ext= argc? arguments[0] : undefined;
       //---------
       // return path.join(.outDir,"#{.base}#{ext}")
       return path_join(undefined,2,(any_arr){PROP(outDir_,this), _concatAny(2,(any_arr){PROP(base_,this), ext})});
    return undefined;
    }

    // method searchModule(importingModuleFileInfo )
    any Environment_FileInfo_searchModule(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Environment_FileInfo));
       //---------
       // define named params
       var importingModuleFileInfo= argc? arguments[0] : undefined;
       //---------

//------------------
//provide a searchModule function to the LiteScript environment
// to use to locate modules for the `import/require` statement
//------------------

        // #logger.debug "searchModule #{JSON.stringify(this)}"

// check if it's a node global module (if require() parameter do not start with '.' or './')
// if compiling for node, and "global import" and no extension, asume global lib or core module

       // if this.importInfo.globalImport and no this.hasPath
       if (_anyToBool(PROP(globalImport_,PROP(importInfo_,this))) && !_anyToBool(PROP(hasPath_,this)))  {
           // this.isCore = isBuiltInModule(this.base) #core module like 'fs' or 'path'
           PROP(isCore_,this) = Environment_isBuiltInModule(undefined,1,(any_arr){PROP(base_,this)});// #core module like 'fs' or 'path'
           // this.isLite = false
           PROP(isLite_,this) = false;
           // return
           return undefined;
       };

// if parameter has no extension or extension is [.lite].md
// we search the module

       // var full,found = undefined
       var full = undefined, found = undefined;

       // if this.importInfo.createFile
       if (_anyToBool(PROP(createFile_,PROP(importInfo_,this))))  {
           // full = path.join(projectDir, this.importInfo.name)
           full = path_join(undefined,2,(any_arr){Environment_projectDir, PROP(name_,PROP(importInfo_,this))});
       }
       
       else {
            //search the file
           // var search
           var search = undefined;
           // if this.hasPath #specific path indicated
           if (_anyToBool(PROP(hasPath_,this)))  {// #specific path indicated
               // search = [ path.resolve(importingModuleFileInfo.dir,this.importInfo.name)]
               search = new(Array,1,(any_arr){path_resolve(undefined,2,(any_arr){PROP(dir_,importingModuleFileInfo), PROP(name_,PROP(importInfo_,this))})});
           }
           
           else {
                // #normal: search local ./ & .[projectDir]/lib
               // search = [
               search = new(Array,2,(any_arr){path_join(undefined,2,(any_arr){PROP(dir_,importingModuleFileInfo), PROP(name_,PROP(importInfo_,this))}), path_join(undefined,3,(any_arr){Environment_projectDir, any_str("/lib"), PROP(name_,PROP(importInfo_,this))})});

               // if targetExt is "c"
               if (__is(Environment_targetExt,any_str("c")))  {
                    // add Project/C_global_import if target is 'c'
                   // search.push path.join(projectDir,'/C_global_import',this.importInfo.name)
                   CALL1(push_,search,path_join(undefined,3,(any_arr){Environment_projectDir, any_str("/C_global_import"), PROP(name_,PROP(importInfo_,this))}));
               };
           };


           // for each item in search
           any _list57=search;
           { var item=undefined;
           for(int item__inx=0 ; item__inx<_list57.value.arr->length ; item__inx++){item=ITEM(item__inx,_list57);
               // for each ext in ['.lite.md','.md','.interface.md','.js']
               any _list58=new(Array,4,(any_arr){any_str(".lite.md"), any_str(".md"), any_str(".interface.md"), any_str(".js")});
               { var ext=undefined;
               for(int ext__inx=0 ; ext__inx<_list58.value.arr->length ; ext__inx++){ext=ITEM(ext__inx,_list58);
                   // if fs.existsSync("#{item}#{ext}" into full)
                   if (_anyToBool(fs_existsSync(undefined,1,(any_arr){(full=_concatAny(2,(any_arr){item, ext}))})))  {
                       // found=full
                       found = full;
                       // break
                       break;
                   };
               }};// end for each in new(Array,4,(any_arr){any_str(".lite.md"), any_str(".md"), any_str(".interface.md"), any_str(".js")})
               // end for
               // if found, break
               if (_anyToBool(found)) {break;};
           }};// end for each in search
           // end for

            //console.log(basePath);
            //logger.debug full

            // #try \t#{search.join('\n\t')}

           // if not found
           if (!(_anyToBool(found)))  {
               // logger.throwControlled "#{importingModuleFileInfo.relFilename}: Module not found: #{this.importInfo.name}\nSearched as:\n#{(search.join('\n'))}\n   with extensions (.lite.md|.md|.interface.md|.js)"
               logger_throwControlled(undefined,1,(any_arr){_concatAny(6,(any_arr){PROP(relFilename_,importingModuleFileInfo), any_str(": Module not found: "), PROP(name_,PROP(importInfo_,this)), any_str("\nSearched as:\n"), ((CALL1(join_,search,any_str("\n")))), any_str("\n   with extensions (.lite.md|.md|.interface.md|.js)")})});
           };
       };

       // end if

        //set filename & Recalc extension
       // this.filename =  path.resolve(full); //full path
       PROP(filename_,this) = path_resolve(undefined,1,(any_arr){full}); //full path
       // this.extension = path.extname(this.filename);
       PROP(extension_,this) = path_extname(undefined,1,(any_arr){PROP(filename_,this)});

        //else

            //other extensions
            //No compilation (only copy to output dir), and keep extension
        //    this.filename = path.resolve(importingModuleFileInfo.dirname,this.importInfo.name);


        //recalc data from found file
       // this.dir = path.dirname(this.filename);
       PROP(dir_,this) = path_dirname(undefined,1,(any_arr){PROP(filename_,this)});
       // this.sourcename = path.basename(this.filename); #with extensions
       PROP(sourcename_,this) = path_basename(undefined,1,(any_arr){PROP(filename_,this)});// #with extensions
       // this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
       PROP(isInterface_,this) = any_number(!__is(CALL1(indexOf_,PROP(sourcename_,this),any_str(".interface.")),any_number(-1)));
       // this.relPath = path.relative(projectDir, this.dir); //relative to basePath
       PROP(relPath_,this) = path_relative(undefined,2,(any_arr){Environment_projectDir, PROP(dir_,this)}); //relative to basePath
       // this.relFilename = path.relative(projectDir, this.filename); //relative to basePath
       PROP(relFilename_,this) = path_relative(undefined,2,(any_arr){Environment_projectDir, PROP(filename_,this)}); //relative to basePath

        // based on result extension
       // this.isLite = this.extension in ['.md','.lite']
       PROP(isLite_,this) = any_number(__in(PROP(extension_,this),2,(any_arr){any_str(".md"), any_str(".lite")}));
       // this.outExtension = not this.isLite and this.extension? this.extension else ".#{targetExt}"
       PROP(outExtension_,this) = !(_anyToBool(PROP(isLite_,this))) && _anyToBool(PROP(extension_,this)) ? PROP(extension_,this) : _concatAny(2,(any_arr){any_str("."), Environment_targetExt});

       // this.outDir = path.join(outDir, this.relPath)
       PROP(outDir_,this) = path_join(undefined,2,(any_arr){Environment_outDir, PROP(relPath_,this)});
       // this.outFilename = path.join(this.outDir, "#{this.base}#{this.outExtension}");
       PROP(outFilename_,this) = path_join(undefined,2,(any_arr){PROP(outDir_,this), _concatAny(2,(any_arr){PROP(base_,this), PROP(outExtension_,this)})});
       // this.outRelFilename = path.relative(outDir, this.outFilename); //relative to options.outDir
       PROP(outRelFilename_,this) = path_relative(undefined,2,(any_arr){Environment_outDir, PROP(outFilename_,this)}); //relative to options.outDir

        //print JSON.stringify(this,null,2)

       // if this.importInfo.createFile, return #we're creating this file
       if (_anyToBool(PROP(createFile_,PROP(importInfo_,this)))) {return undefined;};

// Check if outFile exists, but is older than Source

        //get source date & time
       // var sourceStat = fs.statSync(this.filename);
       var sourceStat = fs_statSync(undefined,1,(any_arr){PROP(filename_,this)});
        // declare on sourceStat mtime

       // if fs.existsSync(this.outFilename)
       if (_anyToBool(fs_existsSync(undefined,1,(any_arr){PROP(outFilename_,this)})))  {
            //get generated date & time
           // var statGenerated = fs.statSync(this.outFilename);
           var statGenerated = fs_statSync(undefined,1,(any_arr){PROP(outFilename_,this)});
            // declare on statGenerated mtime
            //if source is older
           // this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime );
           PROP(outFileIsNewer_,this) = (any_number(_anyToNumber(PROP(mtime_,statGenerated)) > _anyToNumber(PROP(mtime_,sourceStat))));
       };

//         console.log this.filename
//         console.log sourceStat.mtime
//         console.log this.outFilename
//         if statGenerated, console.log statGenerated.mtime
//         console.log this.outFileIsNewer
//         

// Also calculate this.interfaceFile (cache of module exported names),
// check if the file exists, and if it is updated

       // this.interfaceFile = path.join(this.dir,'#{this.base}.interface.md');
       PROP(interfaceFile_,this) = path_join(undefined,2,(any_arr){PROP(dir_,this), _concatAny(2,(any_arr){PROP(base_,this), any_str(".interface.md")})});
        // #logger.debug this.interfaceFile
       // var isCacheFile
       var isCacheFile = undefined;
       // if fs.existsSync(this.interfaceFile)
       if (_anyToBool(fs_existsSync(undefined,1,(any_arr){PROP(interfaceFile_,this)})))  {
           // this.interfaceFileExists = true
           PROP(interfaceFileExists_,this) = true;
           // isCacheFile = false
           isCacheFile = false;
       }
       
       else {
            //set for auto-generated interface
           // this.interfaceFile = path.join(this.dir,'#{this.base}.cache-interface.md');
           PROP(interfaceFile_,this) = path_join(undefined,2,(any_arr){PROP(dir_,this), _concatAny(2,(any_arr){PROP(base_,this), any_str(".cache-interface.md")})});
           // isCacheFile = true
           isCacheFile = true;
           // this.interfaceFileExists = fs.existsSync(this.interfaceFile)
           PROP(interfaceFileExists_,this) = fs_existsSync(undefined,1,(any_arr){PROP(interfaceFile_,this)});
       };

// Check if interface cache is updated

       // if this.interfaceFileExists and isCacheFile
       if (_anyToBool(PROP(interfaceFileExists_,this)) && _anyToBool(isCacheFile))  {
            //get interface date & time
           // var statInterface = fs.statSync(this.interfaceFile);
           var statInterface = fs_statSync(undefined,1,(any_arr){PROP(interfaceFile_,this)});
            // declare on statInterface mtime
            //cache exists if source is older
           // this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime );
           PROP(interfaceFileExists_,this) = (any_number(_anyToNumber(PROP(mtime_,statInterface)) > _anyToNumber(PROP(mtime_,sourceStat))));
           // if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated
           if (!(_anyToBool(PROP(interfaceFileExists_,this)))) {Environment_externalCacheSave(undefined,2,(any_arr){PROP(interfaceFile_,this), null});};
       };

       // return
       return undefined;
    return undefined;
    }
   

//--------------
   // Environment_ImportParameterInfo
   any Environment_ImportParameterInfo; //Class Environment_ImportParameterInfo
   //auto Environment_ImportParameterInfo__init
   void Environment_ImportParameterInfo__init(any this, len_t argc, any* arguments){
   };
       // properties
       ;
   // import mkPath, logger

   // export helper function setBaseInfo(aProjectDir, aOutDir, aTargetExt)
   any Environment_setBaseInfo(DEFAULT_ARGUMENTS){// define named params
       var aProjectDir, aOutDir, aTargetExt;
       aProjectDir=aOutDir=aTargetExt=undefined;
       switch(argc){
         case 3:aTargetExt=arguments[2];
         case 2:aOutDir=arguments[1];
         case 1:aProjectDir=arguments[0];
       }
       //---------

        //set module vars
       // projectDir = aProjectDir
       Environment_projectDir = aProjectDir;
       // outDir = aOutDir
       Environment_outDir = aOutDir;
       // targetExt = aTargetExt
       Environment_targetExt = aTargetExt;
   return undefined;
   }


   // export helper function relativeFrom(actualPath, destFilename)
   any Environment_relativeFrom(DEFAULT_ARGUMENTS){// define named params
       var actualPath, destFilename;
       actualPath=destFilename=undefined;
       switch(argc){
         case 2:destFilename=arguments[1];
         case 1:actualPath=arguments[0];
       }
       //---------

        //relative to fromFileinfo.outFilename
        //print "relativeFileRef(filename, fromFileinfo)"
        //print filename
        //print fromFileinfo.outDir
        //print path.relative(fromFileinfo.outDir, filename)
       // return path.relative(actualPath, destFilename ) //from path, to filename/fullpath
       return path_relative(undefined,2,(any_arr){actualPath, destFilename}); //from path, to filename/fullpath
   return undefined;
   }


   // export helper function resolvePath(text)
   any Environment_resolvePath(DEFAULT_ARGUMENTS){// define named params
       var text= argc? arguments[0] : undefined;
       //---------
       // return path.resolve(text)
       return path_resolve(undefined,1,(any_arr){text});
   return undefined;
   }

   // export helper function dirName(filename)
   any Environment_dirName(DEFAULT_ARGUMENTS){// define named params
       var filename= argc? arguments[0] : undefined;
       //---------
        //dir name
       // return path.dirname(filename)
       return path_dirname(undefined,1,(any_arr){filename});
   return undefined;
   }

// ----------

   // export helper function loadFile(filename)
   any Environment_loadFile(DEFAULT_ARGUMENTS){// define named params
       var filename= argc? arguments[0] : undefined;
       //---------
    //------------------
    //provide a loadFile function to the LiteScript environment.
    //return file contents
    //------------------
       // return fs.readFileSync(filename);
       return fs_readFileSync(undefined,1,(any_arr){filename});
   return undefined;
   }


   // export helper function externalCacheSave(filename, fileLines)
   any Environment_externalCacheSave(DEFAULT_ARGUMENTS){// define named params
       var filename, fileLines;
       filename=fileLines=undefined;
       switch(argc){
         case 2:fileLines=arguments[1];
         case 1:filename=arguments[0];
       }
       //---------
    //------------------
    //provide a externalCacheSave (disk) function to the LiteScript environment
    // receive a filename and an array of lines
    //------------------
       // if no fileLines
       if (!_anyToBool(fileLines))  {
           // if fs.existsSync(filename)
           if (_anyToBool(fs_existsSync(undefined,1,(any_arr){filename})))  {
                //remove file
               // fs.unlinkSync filename
               fs_unlinkSync(undefined,1,(any_arr){filename});
           };
       }
       
       else {

            // make sure output dir exists
           // mkPath.toFile(filename);
           mkPath_toFile(undefined,1,(any_arr){filename});

           // if fileLines instanceof Array
           if (_instanceof(fileLines,Array))  {
                // declare fileLines:Array
               // fileLines=fileLines.join("\n")
               fileLines = CALL1(join_,fileLines,any_str("\n"));
           };

            //console.log('save file',filename,fileLines.length,'lines');

           // fs.writeFileSync filename,fileLines
           fs_writeFileSync(undefined,2,(any_arr){filename, fileLines});
       };
   return undefined;
   }


   // export helper function isBuiltInModule (name,prop)
   any Environment_isBuiltInModule(DEFAULT_ARGUMENTS){// define named params
       var name, prop;
       name=prop=undefined;
       switch(argc){
         case 2:prop=arguments[1];
         case 1:name=arguments[0];
       }
       //---------

// Check for built in and global names
// return true if 'name' is a built-in node module

        //ifdef PROD_C
       //do nothing
       ; // if generating the compile-to-C compiler
   return undefined;
   }

        //else
//
        //var isCoreModule = name in ['assert', 'buffer', 'child_process', 'cluster',
          //'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          //'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          //'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib']
//
        //if isCoreModule
            //if no prop, return true; //just asking: is core module?
//
            //var r = require(name); //load module
            //if r has property prop, return true; //is the member there?
//
//
        //endif

   // export helper function isBuiltInObject(name)
   any Environment_isBuiltInObject(DEFAULT_ARGUMENTS){// define named params
       var name= argc? arguments[0] : undefined;
       //---------
    //
    // return true if 'name' is a javascript built-in object
    //

       // return name in ['isNaN','parseFloat','parseInt','isFinite'
       return any_number(__in(name,12,(any_arr){any_str("isNaN"), any_str("parseFloat"), any_str("parseInt"), any_str("isFinite"), any_str("decodeURI"), any_str("decodeURIComponent"), any_str("encodeURI"), any_str("encodeURIComponent"), any_str("eval"), any_str("console"), any_str("process"), any_str("require")}));
   return undefined;
   }


   // export helper function getGlobalObject(name)
   any Environment_getGlobalObject(DEFAULT_ARGUMENTS){// define named params
       var name= argc? arguments[0] : undefined;
       //---------

       // if targetExt is 'c'
       if (__is(Environment_targetExt,any_str("c")))  {
           // return
           return undefined;
       }
       
       else {
            //ifdef PROD_C
           //do nothing
           ;
       };

            //else
            //try
                //return global[name]
//
            //catch e
                //logger.error "Environment.getGlobalObject '#{name}'"
                //declare valid e.stack
                //logger.error e.stack
                //debugger
//
            //endif

       // end if
       
   return undefined;
   }

   // export helper function fileInfoNewFile(name) returns FileInfo
   any Environment_fileInfoNewFile(DEFAULT_ARGUMENTS){// define named params
       var name= argc? arguments[0] : undefined;
       //---------

// create a fileInfo with paths and data for a file to be created

       // var importParam = new ImportParameterInfo
       var importParam = new(Environment_ImportParameterInfo,0,NULL);
       // importParam.name = name
       PROP(name_,importParam) = name;
       // importParam.createFile = true
       PROP(createFile_,importParam) = true;
       // var fileInfo = new FileInfo(importParam)
       var fileInfo = new(Environment_FileInfo,1,(any_arr){importParam});
       // fileInfo.searchModule null
       CALL1(searchModule_,fileInfo,null);
       // return fileInfo
       return fileInfo;
   return undefined;
   }

//-------------------------
void Environment__moduleInit(void){
       Environment_FileInfo =_newClass("Environment_FileInfo", Environment_FileInfo__init, sizeof(struct Environment_FileInfo_s), Object.value.classINFOptr);
       _declareMethods(Environment_FileInfo, Environment_FileInfo_METHODS);
       _declareProps(Environment_FileInfo, Environment_FileInfo_PROPS, sizeof Environment_FileInfo_PROPS);
   
       Environment_ImportParameterInfo =_newClass("Environment_ImportParameterInfo", Environment_ImportParameterInfo__init, sizeof(struct Environment_ImportParameterInfo_s), Object.value.classINFOptr);
       _declareMethods(Environment_ImportParameterInfo, Environment_ImportParameterInfo_METHODS);
       _declareProps(Environment_ImportParameterInfo, Environment_ImportParameterInfo_PROPS, sizeof Environment_ImportParameterInfo_PROPS);
   
   
};