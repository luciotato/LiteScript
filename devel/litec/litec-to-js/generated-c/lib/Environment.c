#include "Environment.h"
//-------------------------
//Module Environment
//-------------------------
#include "Environment.c.extra"
//-------------------------
//NAMESPACE Environment
//-------------------------
var Environment_projectDir, Environment_outDir, Environment_targetExt;
    //-----------------------
    // Class Environment_FileInfo: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Environment_FileInfo_METHODS = {
      { outWithExtension_, Environment_FileInfo_outWithExtension },
      { searchModule_, Environment_FileInfo_searchModule },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t Environment_FileInfo_PROPS[] = {
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
any Environment_getDir(DEFAULT_ARGUMENTS); //forward declare
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
    
    static propIndex_t Environment_ImportParameterInfo_PROPS[] = {
    name_
    , source_
    , line_
    , isGlobalDeclare_
    , globalImport_
    , createFile_
    };
    
    

//--------------
    // Environment_FileInfo
    any Environment_FileInfo; //Class Environment_FileInfo
    
    //auto Environment_FileInfo_newFromObject
    inline any Environment_FileInfo_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(Environment_FileInfo,argc,arguments);
    }
//The 'Environment' object, must provide functions to load files, 
//search modules in external cache, load and save from external cache (disk). 
//The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.
//Dependencies
    //global import fs, path
    //import mkPath, logger
//Module vars
    //var 
        //projectDir: string
        //outDir: string
        //targetExt: string
//### export Class FileInfo
//#### properties
        //importInfo:ImportParameterInfo #: .name, .globalImport .interface - info passed to new
        //dir:string #: path.dirname(importParameter)
        //extension:string #: path.extname(importParameter)
        //base:string #: path.basename(importParameter, ext) #with out extensions
        //sourcename:string #: path.basename(importParameter, ext) #with  extensions
        //hasPath # true if starts with '.' or '/'
        //isCore # true if it's a core node module as 'fs' or 'path'
        //isLite #: true if extension is '.lite'|'.lite.md' 
        //isInterface # set after search: true if this.sourcename.contains('.interface.')
        //filename:string #: found full module filename
        //relPath:string # path.relative(basePath, this.dirname); //relative to basePath
        //relFilename: string
        //outDir: string
        //outFilename: string # output file for code production
        //outRelFilename: string # path.relative(options.outDir, this.outFilename); //relative to basePath
        //outExtension: string
        //outFileIsNewer: boolean # true if generated file is newer than source
        //interfaceFile: string #: interface file (.[auto-]interface.md) declaring exports cache
        //interfaceFileExists: boolean #: if interfaceFileName file exists
        //externalCacheExists: boolean
     ;
//#### constructor (info:ImportParameterInfo)
     void Environment_FileInfo__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var info= argc? arguments[0] : undefined;
        //---------
        //if typeof info is 'string'
        if (__is(_typeof(info),any_LTR("string")))  {
            //var filename = info
            var 
        filename = info
;
            //info = new ImportParameterInfo
            info = new(Environment_ImportParameterInfo,0,NULL);
            //info.name = filename
            PROP(name_,info) = filename;
        };
        //var name = info.name;
        var 
        name = PROP(name_,info)
;
        //this.importInfo = info;
        PROP(importInfo_,this) = info;
        //this.filename = name
        PROP(filename_,this) = name;
        //this.dir = path.resolve(path.dirname(name))
        PROP(dir_,this) = path_resolve(undefined,1,(any_arr){
        path_dirname(undefined,1,(any_arr){
        name
})
});
        //this.hasPath = name.charAt(0) in [path.sep,'.']
        PROP(hasPath_,this) = any_number(__in(METHOD(charAt_,name)(name,1,(any_arr){
        any_number(0)
}),2,(any_arr){path_sep, any_LTR(".")}));
        //this.sourcename = path.basename(name) 
        PROP(sourcename_,this) = path_basename(undefined,1,(any_arr){
        name
});
        //this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
        PROP(isInterface_,this) = any_number(!__is(__call(indexOf_,PROP(sourcename_,this),1,(any_arr){
        any_LTR(".interface.")
}),any_number(-1)));
        //this.extension = path.extname(name)
        PROP(extension_,this) = path_extname(undefined,1,(any_arr){
        name
});
        //this.base = path.basename(name,this.extension) 
        PROP(base_,this) = path_basename(undefined,2,(any_arr){
        name, 
        PROP(extension_,this)
});
        //#remove .lite from double extension .lite.md
        //if this.base.endsWith('.lite'), this.base=this.base.slice(0,-5)
        if (_anyToBool(__call(endsWith_,PROP(base_,this),1,(any_arr){
        any_LTR(".lite")
}))) {PROP(base_,this) = __call(slice_,PROP(base_,this),2,(any_arr){
        any_number(0), 
        any_number(-5)
});};
     }
//#### method outWithExtension(ext)
     any Environment_FileInfo_outWithExtension(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Environment_FileInfo));
        //---------
        // define named params
        var ext= argc? arguments[0] : undefined;
        //---------
        //return path.join(.outDir,"#{.base}#{ext}")
        return path_join(undefined,2,(any_arr){
        PROP(outDir_,this), 
        _concatAny(2,
        PROP(base_,this), 
        ext
)
});
     return undefined;
     }
//#### method searchModule(importingModuleDir:string)
     any Environment_FileInfo_searchModule(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Environment_FileInfo));
        //---------
        // define named params
        var importingModuleDir= argc? arguments[0] : undefined;
        //---------
////------------------
////provide a searchModule function to the LiteScript environment
//// to use to locate modules for the `import/require` statement
////------------------
        //#logger.debug "searchModule #{JSON.stringify(this)}"
//check if it's a node global module (if require() parameter do not start with '.' or './') 
//if compiling for node, and "global import" and no extension, asume global lib or core module
        ////ifndef TARGET_C //no "require hack" possible in .c
        ////if this.importInfo.globalImport and targetExt is "js"
            ////// if running on node.js and global import ASSSUME core node module / installed node_modules
            ////this.isCore = isBuiltInModule(this.base) #core module like 'fs' or 'path'
            ////this.isLite = false
            ////return
        ////endif
//if parameter has no extension or extension is [.lite].md
//we search the module 
        //var full,found = undefined
        var 
        full = undefined, 
        found = undefined
;
        //if this.importInfo.createFile
        if (_anyToBool(PROP(createFile_,PROP(importInfo_,this))))  {
            //full = path.join(projectDir, this.importInfo.name)
            full = path_join(undefined,2,(any_arr){
        Environment_projectDir, 
        PROP(name_,PROP(importInfo_,this))
});
        }
        //else
        
        else {
            ////search the file
            //var search
            var 
        search = undefined
;
            //if this.hasPath #specific path indicated
            if (_anyToBool(PROP(hasPath_,this)))  {// #specific path indicated
                //search = [ path.resolve(importingModuleDir,this.importInfo.name)]
                search = new(Array,1,(any_arr){path_resolve(undefined,2,(any_arr){
        importingModuleDir, 
        PROP(name_,PROP(importInfo_,this))
})});
            }
            //else
            
            else {
                //#normal: search local ./ & .[projectDir]/lib & .[projectDir]/interfaces
                //search = [ 
                    //path.join(importingModuleDir, this.importInfo.name)
                    //path.join(projectDir,'/lib',this.importInfo.name)
                    //path.join(projectDir,'/interfaces',this.importInfo.name)
                    //path.join(projectDir,'../lib',this.importInfo.name)
                    //path.join(projectDir,'../interfaces',this.importInfo.name)
                search = new(Array,5,(any_arr){path_join(undefined,2,(any_arr){
        importingModuleDir, 
        PROP(name_,PROP(importInfo_,this))
}), path_join(undefined,3,(any_arr){
        Environment_projectDir, 
        any_LTR("/lib"), 
        PROP(name_,PROP(importInfo_,this))
}), path_join(undefined,3,(any_arr){
        Environment_projectDir, 
        any_LTR("/interfaces"), 
        PROP(name_,PROP(importInfo_,this))
}), path_join(undefined,3,(any_arr){
        Environment_projectDir, 
        any_LTR("../lib"), 
        PROP(name_,PROP(importInfo_,this))
}), path_join(undefined,3,(any_arr){
        Environment_projectDir, 
        any_LTR("../interfaces"), 
        PROP(name_,PROP(importInfo_,this))
})});
                    //]
//if we're generating c-code a "global import" of core modules like "path" and "fs", 
//gets redirected to dir `ENV_C_global_import` or `../ENV_C_global_import`
                //if targetExt is 'c'
                if (__is(Environment_targetExt,any_LTR("c")))  {
                    //// prepend Project/ENV_C_global_import to found "path" "fs" and other  
                    //// core node-js modules (migrated to Litescript and or native-c)
                    //search.unshift 
                        //path.join(projectDir,'/ENV_C_global_import',this.importInfo.name)
                        //path.join(projectDir,'../ENV_C_global_import',this.importInfo.name)
                    METHOD(unshift_,search)(search,2,(any_arr){
        path_join(undefined,3,(any_arr){
        Environment_projectDir, 
        any_LTR("/ENV_C_global_import"), 
        PROP(name_,PROP(importInfo_,this))
}), 
        path_join(undefined,3,(any_arr){
        Environment_projectDir, 
        any_LTR("../ENV_C_global_import"), 
        PROP(name_,PROP(importInfo_,this))
})
});
                };
                //end if
                
            };
//Now search the fille in all the locations/with all the extensions
            //for each item in search 
            any _list63=search;
            { var item=undefined;
            for(int item__inx=0 ; item__inx<_list63.value.arr->length ; item__inx++){item=ITEM(item__inx,_list63);
            
                //for each ext in ['.lite.md','.md','.interface.md','.js'] 
                any _list64=new(Array,4,(any_arr){any_LTR(".lite.md"), any_LTR(".md"), any_LTR(".interface.md"), any_LTR(".js")});
                { var ext=undefined;
                for(int ext__inx=0 ; ext__inx<_list64.value.arr->length ; ext__inx++){ext=ITEM(ext__inx,_list64);
                
                    //if fs.existsSync("#{item}#{ext}" into full)
                    if (_anyToBool(fs_existsSync(undefined,1,(any_arr){
        (full=_concatAny(2,
        item, 
        ext
))
})))  {
                        //found=full
                        found = full;
                        //break
                        break;
                    };
                }};// end for each in
                //end for
                
                //if found, break
                if (_anyToBool(found)) {break;};
            }};// end for each in
            //end for
            
                
            ////console.log(basePath);
            ////logger.debug full
            //#try \t#{search.join('\n\t')}
            //if not found
            if (!(_anyToBool(found)))  {
                //logger.throwControlled """
                logger_throwControlled(undefined,1,(any_arr){
        _concatAny(8,
        PROP(source_,PROP(importInfo_,this)), 
        any_LTR(":"), 
        PROP(line_,PROP(importInfo_,this)), 
        any_LTR(":1 Module not found: "), 
        PROP(name_,PROP(importInfo_,this)), 
        any_LTR("\nSearched as:\n"), 
        ((METHOD(join_,search)(search,1,(any_arr){
        any_LTR("\n")
}))), 
        any_LTR("\n   with extensions (.lite.md|.md|.interface.md|.js)")
)
});
            };
        };
                        //#{this.importInfo.source}:#{this.importInfo.line}:1 Module not found: #{this.importInfo.name}
                        //Searched as:
                        //#{search.join('\n')}
                           //with extensions (.lite.md|.md|.interface.md|.js)
                        //"""
        //end if
        
        ////set filename & Recalc extension
        //this.filename =  path.resolve(full); //full path
        PROP(filename_,this) = path_resolve(undefined,1,(any_arr){
        full
}); //full path
        //this.extension = path.extname(this.filename);
        PROP(extension_,this) = path_extname(undefined,1,(any_arr){
        PROP(filename_,this)
});
        
        ////else 
            ////other extensions
            ////No compilation (only copy to output dir), and keep extension 
        ////    this.filename = path.resolve(importingModuleDirname,this.importInfo.name);
        
        ////recalc data from found file
        //this.dir = path.dirname(this.filename);
        PROP(dir_,this) = path_dirname(undefined,1,(any_arr){
        PROP(filename_,this)
});
        //this.sourcename = path.basename(this.filename); #with extensions
        PROP(sourcename_,this) = path_basename(undefined,1,(any_arr){
        PROP(filename_,this)
});// #with extensions
        //this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
        PROP(isInterface_,this) = any_number(!__is(__call(indexOf_,PROP(sourcename_,this),1,(any_arr){
        any_LTR(".interface.")
}),any_number(-1)));
        //this.relPath = path.relative(projectDir, this.dir); //relative to basePath
        PROP(relPath_,this) = path_relative(undefined,2,(any_arr){
        Environment_projectDir, 
        PROP(dir_,this)
}); //relative to basePath
        //this.relFilename = path.relative(projectDir, this.filename); //relative to basePath
        PROP(relFilename_,this) = path_relative(undefined,2,(any_arr){
        Environment_projectDir, 
        PROP(filename_,this)
}); //relative to basePath
        //// based on result extension                
        //this.isLite = this.extension in ['.md','.lite']
        PROP(isLite_,this) = any_number(__in(PROP(extension_,this),2,(any_arr){any_LTR(".md"), any_LTR(".lite")}));
        //this.outExtension = not this.isLite and this.extension? this.extension else ".#{targetExt}"
        PROP(outExtension_,this) = !(_anyToBool(PROP(isLite_,this))) && _anyToBool(PROP(extension_,this)) ? PROP(extension_,this) : _concatAny(2,
        any_LTR("."), 
        Environment_targetExt
);
            
        //this.outDir = path.join(outDir, this.relPath)
        PROP(outDir_,this) = path_join(undefined,2,(any_arr){
        Environment_outDir, 
        PROP(relPath_,this)
});
        //this.outFilename = path.join(this.outDir, "#{this.base}#{this.outExtension}");
        PROP(outFilename_,this) = path_join(undefined,2,(any_arr){
        PROP(outDir_,this), 
        _concatAny(2,
        PROP(base_,this), 
        PROP(outExtension_,this)
)
});
        //this.outRelFilename = path.relative(outDir, this.outFilename); //relative to options.outDir
        PROP(outRelFilename_,this) = path_relative(undefined,2,(any_arr){
        Environment_outDir, 
        PROP(outFilename_,this)
}); //relative to options.outDir
        ////print JSON.stringify(this,null,2)
        //if this.importInfo.createFile, return #we're creating this file
        if (_anyToBool(PROP(createFile_,PROP(importInfo_,this)))) {return undefined;};
//Check if outFile exists, but is older than Source
        ////get source date & time 
        //var sourceStat = fs.statSync(this.filename);
        var 
        sourceStat = fs_statSync(undefined,1,(any_arr){
        PROP(filename_,this)
})
;
        //declare on sourceStat mtime
        
        //if fs.existsSync(this.outFilename)
        if (_anyToBool(fs_existsSync(undefined,1,(any_arr){
        PROP(outFilename_,this)
})))  {
            ////get generated date & time 
            //var statGenerated = fs.statSync(this.outFilename);
            var 
        statGenerated = fs_statSync(undefined,1,(any_arr){
        PROP(outFilename_,this)
})
;
            //declare on statGenerated mtime
            
            ////if source is older
            //this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime ); 
            PROP(outFileIsNewer_,this) = (any_number(_anyToNumber(PROP(mtime_,statGenerated)) > _anyToNumber(PROP(mtime_,sourceStat))));
        };
        ///*
        //console.log this.filename
        //console.log sourceStat.mtime
        //console.log this.outFilename
        //if statGenerated, console.log statGenerated.mtime
        //console.log this.outFileIsNewer
        //*/
//Also calculate this.interfaceFile (cache of module exported names), 
//check if the file exists, and if it is updated
        //this.interfaceFile = path.join(this.dir,'#{this.base}.interface.md');
        PROP(interfaceFile_,this) = path_join(undefined,2,(any_arr){
        PROP(dir_,this), 
        _concatAny(2,
        PROP(base_,this), 
        any_LTR(".interface.md")
)
});
        //#logger.debug this.interfaceFile 
        //var isCacheFile
        var 
        isCacheFile = undefined
;
        //if fs.existsSync(this.interfaceFile)
        if (_anyToBool(fs_existsSync(undefined,1,(any_arr){
        PROP(interfaceFile_,this)
})))  {
            //this.interfaceFileExists = true
            PROP(interfaceFileExists_,this) = true;
            //isCacheFile = false
            isCacheFile = false;
        }
        //else
        
        else {
            ////set for auto-generated interface
            //this.interfaceFile = path.join(this.dir,'#{this.base}.cache-interface.md');
            PROP(interfaceFile_,this) = path_join(undefined,2,(any_arr){
        PROP(dir_,this), 
        _concatAny(2,
        PROP(base_,this), 
        any_LTR(".cache-interface.md")
)
});
            //isCacheFile = true
            isCacheFile = true;
            //this.interfaceFileExists = fs.existsSync(this.interfaceFile)
            PROP(interfaceFileExists_,this) = fs_existsSync(undefined,1,(any_arr){
        PROP(interfaceFile_,this)
});
        };
//Check if interface cache is updated
        //if this.interfaceFileExists and isCacheFile
        if (_anyToBool(PROP(interfaceFileExists_,this)) && _anyToBool(isCacheFile))  {
            ////get interface date & time 
            //var statInterface = fs.statSync(this.interfaceFile);
            var 
        statInterface = fs_statSync(undefined,1,(any_arr){
        PROP(interfaceFile_,this)
})
;
            //declare on statInterface mtime
            
            ////cache exists if source is older
            //this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime ); 
            PROP(interfaceFileExists_,this) = (any_number(_anyToNumber(PROP(mtime_,statInterface)) > _anyToNumber(PROP(mtime_,sourceStat))));
            //if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated
            if (!(_anyToBool(PROP(interfaceFileExists_,this)))) {Environment_externalCacheSave(undefined,2,(any_arr){
        PROP(interfaceFile_,this), 
        null
});};
        };
        
        //return
        return undefined;
     return undefined;
     }
    

//--------------
    // Environment_ImportParameterInfo
    any Environment_ImportParameterInfo; //Class Environment_ImportParameterInfo
    //auto Environment_ImportParameterInfo__init
    void Environment_ImportParameterInfo__init(any this, len_t argc, any* arguments){
    };
    
    //auto Environment_ImportParameterInfo_newFromObject
    inline any Environment_ImportParameterInfo_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(Environment_ImportParameterInfo,argc,arguments);
    }
    
    //end class FileInfo
//### export helper function setBaseInfo(aProjectDir, aOutDir, aTargetExt)
        ////set module vars
        //projectDir = aProjectDir
        //outDir = aOutDir
        //targetExt = aTargetExt
//### export helper function relativeFrom(actualPath, destFilename) returns string
        ////relative to fromFileinfo.outFilename
        ////print "relativeFileRef(filename, fromFileinfo)"
        ////print filename
        ////print fromFileinfo.outDir
        ////print path.relative(fromFileinfo.outDir, filename)
        //return path.relative(actualPath, destFilename ) //from path, to filename/fullpath
//### export helper function resolvePath(text)
        //return path.resolve(text)
//### export helper function getDir(filename)
        ////dir name
        //return path.dirname(filename)
    
//----------
//### export helper function loadFile(filename)
    ////------------------
    ////provide a loadFile function to the LiteScript environment.
    ////return file contents
    ////------------------
        //return fs.readFileSync(filename);
    
//### export helper function externalCacheSave(filename, fileLines)
    ////------------------
    ////provide a externalCacheSave (disk) function to the LiteScript environment
    //// receive a filename and an array of lines
    ////------------------
        //if no fileLines
            //if fs.existsSync(filename)
                ////remove file
                //fs.unlinkSync filename
        //else 
            //// make sure output dir exists
            //mkPath.toFile(filename);
            //if fileLines instanceof Array 
                //declare fileLines:Array
                //fileLines=fileLines.join("\n")
            ////console.log('save file',filename,fileLines.length,'lines');
            //fs.writeFileSync filename,fileLines
//### export helper function isBuiltInModule (name,prop)
//Check for built in and global names
//return true if 'name' is a built-in node module
        ////ifdef TARGET_C
        //do nothing // if generating the compile-to-C compiler
        
        ////else
        ////var isCoreModule = name in ['assert', 'buffer', 'child_process', 'cluster',
          ////'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          ////'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          ////'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib']
        ////if isCoreModule
            ////if no prop, return true; //just asking: is core module?
            ////var r = require(name); //load module
            ////if r has property prop, return true; //is the member there?
            
        ////endif
//### export helper function isBuiltInObject(name)
    ////
    //// return true if 'name' is a javascript built-in object
    ////
        //return name in ['isNaN','parseFloat','parseInt','isFinite'
            //,'decodeURI','decodeURIComponent'
            //,'encodeURI','encodeURIComponent'
            //,'eval','console'
            //,'process','require']
//### export helper function getGlobalObject(name)
        
        //if targetExt is 'c'
            //return
        //else
            ////ifdef TARGET_C
            //do nothing
            
            ////else
            ////try
                ////return global[name]
            
            ////catch e
                ////logger.error "Environment.getGlobalObject '#{name}'"
                ////logger.error 'stack:',e.stack
                ////debugger
            
            ////endif
        //end if
    
//### export helper function fileInfoNewFile(name) returns FileInfo
//create a fileInfo with paths and data for a file to be created
        //var importParam = new ImportParameterInfo
        //importParam.name = name
        //importParam.source="(compiler)"
        //importParam.line=0
        //importParam.createFile = true
        //var fileInfo = new FileInfo(importParam)
        //fileInfo.searchModule null
        //return fileInfo
//### export Class ImportParameterInfo
        //properties
            //name: string
            
            //source:string, line:number //position of "import" statement
            //isGlobalDeclare: boolean
            //globalImport: boolean
            //createFile: boolean
        ;
    
    
    any Environment_setBaseInfo(DEFAULT_ARGUMENTS){
        // define named params
        var aProjectDir, aOutDir, aTargetExt;
        aProjectDir=aOutDir=aTargetExt=undefined;
        switch(argc){
          case 3:aTargetExt=arguments[2];
          case 2:aOutDir=arguments[1];
          case 1:aProjectDir=arguments[0];
        }
        //---------
        Environment_projectDir = aProjectDir;
        Environment_outDir = aOutDir;
        Environment_targetExt = aTargetExt;
    return undefined;
    }
    any Environment_relativeFrom(DEFAULT_ARGUMENTS){
        // define named params
        var actualPath, destFilename;
        actualPath=destFilename=undefined;
        switch(argc){
          case 2:destFilename=arguments[1];
          case 1:actualPath=arguments[0];
        }
        //---------
        return path_relative(undefined,2,(any_arr){
        actualPath, 
        destFilename
}); //from path, to filename/fullpath
    return undefined;
    }
    any Environment_resolvePath(DEFAULT_ARGUMENTS){
        // define named params
        var text= argc? arguments[0] : undefined;
        //---------
        return path_resolve(undefined,1,(any_arr){
        text
});
    return undefined;
    }
    any Environment_getDir(DEFAULT_ARGUMENTS){
        // define named params
        var filename= argc? arguments[0] : undefined;
        //---------
        return path_dirname(undefined,1,(any_arr){
        filename
});
    return undefined;
    }
    any Environment_loadFile(DEFAULT_ARGUMENTS){
        // define named params
        var filename= argc? arguments[0] : undefined;
        //---------
        return fs_readFileSync(undefined,1,(any_arr){
        filename
});
    return undefined;
    }
    any Environment_externalCacheSave(DEFAULT_ARGUMENTS){
        // define named params
        var filename, fileLines;
        filename=fileLines=undefined;
        switch(argc){
          case 2:fileLines=arguments[1];
          case 1:filename=arguments[0];
        }
        //---------
        if (!_anyToBool(fileLines))  {
            if (_anyToBool(fs_existsSync(undefined,1,(any_arr){
        filename
})))  {
                fs_unlinkSync(undefined,1,(any_arr){
        filename
});
            };
        }
        //else 
        
        else {
            mkPath_toFile(undefined,1,(any_arr){
        filename
});
            if (_instanceof(fileLines,Array))  {
                
                fileLines = METHOD(join_,fileLines)(fileLines,1,(any_arr){
        any_LTR("\n")
});
            };
            fs_writeFileSync(undefined,2,(any_arr){
        filename, 
        fileLines
});
        };
    return undefined;
    }
    any Environment_isBuiltInModule(DEFAULT_ARGUMENTS){
        // define named params
        var name, prop;
        name=prop=undefined;
        switch(argc){
          case 2:prop=arguments[1];
          case 1:name=arguments[0];
        }
        //---------
        //do nothing
        ; // if generating the compile-to-C compiler
    return undefined;
    }
    any Environment_isBuiltInObject(DEFAULT_ARGUMENTS){
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
        return any_number(__in(name,12,(any_arr){any_LTR("isNaN"), any_LTR("parseFloat"), any_LTR("parseInt"), any_LTR("isFinite"), any_LTR("decodeURI"), any_LTR("decodeURIComponent"), any_LTR("encodeURI"), any_LTR("encodeURIComponent"), any_LTR("eval"), any_LTR("console"), any_LTR("process"), any_LTR("require")}));
    return undefined;
    }
    any Environment_getGlobalObject(DEFAULT_ARGUMENTS){
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
        if (__is(Environment_targetExt,any_LTR("c")))  {
            return undefined;
        }
        //else
        
        else {
            //do nothing
            ;
        };
        
    return undefined;
    }
    any Environment_fileInfoNewFile(DEFAULT_ARGUMENTS){
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
        var 
        importParam = new(Environment_ImportParameterInfo,0,NULL)
;
        PROP(name_,importParam) = name;
        PROP(source_,importParam) = any_LTR("(compiler)");
        PROP(line_,importParam) = any_number(0);
        PROP(createFile_,importParam) = true;
        var 
        fileInfo = new(Environment_FileInfo,1,(any_arr){
        importParam
})
;
        METHOD(searchModule_,fileInfo)(fileInfo,1,(any_arr){
        null
});
        return fileInfo;
    return undefined;
    }
//------------------
void Environment__namespaceInit(void){
        Environment_FileInfo =_newClass("Environment_FileInfo", Environment_FileInfo__init, sizeof(struct Environment_FileInfo_s), Object);
        _declareMethods(Environment_FileInfo, Environment_FileInfo_METHODS);
        _declareProps(Environment_FileInfo, Environment_FileInfo_PROPS, sizeof Environment_FileInfo_PROPS);
    
        Environment_ImportParameterInfo =_newClass("Environment_ImportParameterInfo", Environment_ImportParameterInfo__init, sizeof(struct Environment_ImportParameterInfo_s), Object);
        _declareMethods(Environment_ImportParameterInfo, Environment_ImportParameterInfo_METHODS);
        _declareProps(Environment_ImportParameterInfo, Environment_ImportParameterInfo_PROPS, sizeof Environment_ImportParameterInfo_PROPS);
    
};


//-------------------------
void Environment__moduleInit(void){
    Environment__namespaceInit();
    
};
