The 'Environment' object, must provide functions to load files, 
search modules in external cache, load and save from external cache (disk). 

The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.

Dependencies

    import fs, path

    import mkPath, logger, GeneralOptions

Module vars

    public var options: GeneralOptions


### export Class FileInfo

#### properties

        importInfo:ImportParameterInfo #: .name, .globalImport .interface - info passed to new
        dir:string #: path.dirname(importParameter)
        extension:string #: path.extname(importParameter)
        base:string #: path.basename(importParameter, ext) #without extensions
        sourcename:string #: path.basename(importParameter, ext) #with  extensions
        hasPath # true if starts with '.' or '/'
        isCore # true if it's a core node module as 'fs' or 'path'
        isLite #: true if extension is '.lite'|'.lite.md' 
        isInterface # set after search: true if this.sourcename.contains('.interface.')
        filename:string #: found full module filename
        relPath:string # path.relative(basePath, this.dirname); //relative to basePath
        relFilename: string
        outDir: string
        outFilename: string # output file for code production
        outRelFilename: string # path.relative(options.outDir, this.outFilename); //relative to basePath
        outExtension: string
        outFileIsNewer: boolean # true if generated file is newer than source
        interfaceFile: string #: interface file (.[auto-]interface.md) declaring exports cache
        interfaceFileExists: boolean #: if interfaceFileName file exists
        externalCacheExists: boolean

#### constructor (info:ImportParameterInfo)

        if typeof info is 'string'
            var filename = info
            info = new ImportParameterInfo
            info.name = filename

        var name = info.name;
        this.importInfo = info;
        this.filename = name
        this.dir = path.resolve(path.dirname(name))
        this.hasPath = name.charAt(0) in [path.sep,'.']
        this.sourcename = path.basename(name) 
        this.isInterface = '.interface.' in this.sourcename
        this.extension = path.extname(name)
        this.base = path.basename(name,this.extension) 

        #remove .lite from double extension .lite.md
        if this.base.endsWith('.lite'), this.base=this.base.slice(0,-5)

#### method outWithExtension(ext)
        return path.join(.outDir,"#{.base}#{ext}")

#### method searchModule(importingModuleDir:string)

//------------------
//provide a searchModule function to the LiteScript environment
// to use to locate modules for the `import/require` statement
//------------------

        #logger.debug "searchModule #{JSON.stringify(this)}"

check if it's a node global module (if require() parameter do not start with '.' or './') 
if compiling for node, and "global import" and no extension, asume global lib or core module

        #ifndef TARGET_C //"require() hack" not possible in .c
        if .importInfo.globalImport and options.target is 'js'
            // if running on node.js and global import ASSSUME core node module / installed node_modules
            this.isCore = isBuiltInModule(this.base) #core module like 'fs' or 'path'
            this.isLite = false
            return 
        #endif

if parameter has no extension or extension is [.lite].md
we search the module 

        var full, found, foundIndex=-1, includeDirsIndex=1

        if this.importInfo.createFile
            full = path.join(options.projectDir, this.importInfo.name)

        else
            //search the file
            var search = [ importingModuleDir ]
            if this.hasPath #specific path indicated
                do nothing // only search at specified dir
            else
                #normal: search local ./ & .[projectDir]/lib & .[projectDir]/interfaces & -i dirs
                search.push 
                    path.join(options.projectDir,'/lib')
                    path.join(options.projectDir,'/interfaces')
                    path.join(options.projectDir,'../lib')
                    path.join(options.projectDir,'../interfaces')

if we're generating c-code a "global import" of core modules like "path" and "fs", 
gets redirected to dir `ENV_C_global_import` or `../ENV_C_global_import`

                if options.target is 'c'
                    // prepend interfaces/C_standalone to found "path" "fs" and other  
                    // core node-js modules (migrated to Litescript and/or native-c)
                    search.unshift 
                        path.join(options.projectDir,'/interfaces/C_standalone')
                        path.join(options.projectDir,'../interfaces/C_standalone')
                end if

include command-line (-i foo/bar) specified dirs

                for each extra in options.includeDirs
                    search.push path.resolve(options.projectDir,extra)

add compiler directory to "include dirs" so GlobalScopeX.interface.md can be found

                includeDirsIndex = search.length
                if __dirname 

                    if options.target is 'c' //include first: /interfaces/C_standalone'
                        search.push path.resolve('#{__dirname}/../interfaces/C_standalone')
                    end if

                    search.push path.resolve('#{__dirname}/../interfaces')
                end if


Now search the file in all specidief dirs/with all the extensions

            for each dirIndex,dir in search 
                var fname = path.join(dir,this.importInfo.name)
                for each ext in ['.lite.md','.md','.interface.md','.js'] 
                    full = fname & ext
                    if fs.existsSync(full)
                        found=full
                        foundIndex=dirIndex
                        break
                end for
                if found, break
            end for
                
            //console.log(basePath);
            //logger.debug full

            #try \t#{search.join('\n\t')}

            if not found
                logger.throwControlled """
                        #{.importInfo.source}:#{.importInfo.line}:1 Module not found: 
                        Searched '#{.importInfo.name}' at:
                        #{search.join('\n')}
                           with extensions (.lite.md|.md|.interface.md|.js)
                        """

        end if

        //set filename & Recalc extension
        this.filename =  path.resolve(full); //full path
        this.extension = path.extname(this.filename);
        
        //else 

            //other extensions
            //No compilation (only copy to output dir), and keep extension 
        //    this.filename = path.resolve(importingModuleDirname,this.importInfo.name);
        

        //recalc data from found file
        this.dir = path.dirname(this.filename);
        this.sourcename = path.basename(this.filename); #with extensions
        this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
        this.relFilename = path.relative(options.projectDir, this.filename); //relative project path
        this.relPath = path.relative(options.projectDir, this.dir); //relative to project path

        // based on result extension                
        this.isLite = this.extension in ['.md','.lite']
        this.outExtension = not this.isLite and this.extension? this.extension else ".#{options.target}"
            
        this.outDir = path.join(options.outDir, this.relPath)
        if this.outDir.slice(0,options.outDir.length) isnt options.outDir // the out path is outside inicated path 
            //mainly because .. on the found file. 
            // fix it to be inside options.outDir
            this.outDir = path.join(options.outDir, path.basename(this.dir)) // use only one last dir

        this.outFilename = path.join(this.outDir, "#{this.base}#{this.outExtension}");
        this.outRelFilename = path.relative(options.outDir, this.outFilename); //relative to options.outDir

        //print JSON.stringify(this,null,2)

        if this.importInfo.createFile, return #we're creating this file

Check if outFile exists, but is older than Source

        //get source date & time 
        var sourceStat = fs.statSync(this.filename);
        declare on sourceStat mtime

        if fs.existsSync(this.outFilename)
            //get generated date & time 
            var statGenerated = fs.statSync(this.outFilename);
            declare on statGenerated mtime
            //if source is older
            this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime ); 

        /*
        console.log this.filename
        console.log sourceStat.mtime
        console.log this.outFilename
        if statGenerated, console.log statGenerated.mtime
        console.log this.outFileIsNewer
        */

Also calculate this.interfaceFile (cache of module exported names), 
check if the file exists, and if it is updated

        this.interfaceFile = path.join(this.dir,'#{this.base}.interface.md');
        #logger.debug this.interfaceFile 
        var isCacheFile
        if fs.existsSync(this.interfaceFile)
            this.interfaceFileExists = true
            isCacheFile = false
        else
            //set for auto-generated interface
            this.interfaceFile = path.join(this.dir,'#{this.base}.cache-interface.md');
            isCacheFile = true
            this.interfaceFileExists = fs.existsSync(this.interfaceFile)

Check if interface cache is updated

        if this.interfaceFileExists and isCacheFile
            //get interface date & time 
            var statInterface = fs.statSync(this.interfaceFile);
            declare on statInterface mtime
            //cache exists if source is older
            this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime ); 
            if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated
        
        return
    
    end class FileInfo

### export helper function setBaseInfo(projectOptions)

        //set module vars
        options = projectOptions


### export helper function relativeFrom(actualPath, destFullPathFilename) returns string

        //relative to fromFileinfo.outFilename
        //print "relativeFileRef(filename, fromFileinfo)"
        //print filename
        //print fromFileinfo.outDir
        //print path.relative(fromFileinfo.outDir, filename)
        return path.relative(actualPath, destFullPathFilename ) //from path, to fullpath/filename


### export helper function resolvePath(text)
        return path.resolve(text)

### export helper function getDir(filename)
        //dir name
        return path.dirname(filename)
    
----------

### export helper function loadFile(filename)
    //------------------
    //provide a loadFile function to the LiteScript environment.
    //return file contents
    //------------------
        return fs.readFileSync(filename);
    

### export helper function externalCacheSave(filename, fileLines)
    //------------------
    //provide a externalCacheSave (disk) function to the LiteScript environment
    // receive a filename and an array of lines
    //------------------
        if no fileLines
            if fs.existsSync(filename)
                //remove file
                fs.unlinkSync filename

        else 

            // make sure output dir exists
            mkPath.toFile(filename);

            if fileLines instanceof Array 
                declare fileLines:Array
                fileLines=fileLines.join("\n")

            //console.log('save file',filename,fileLines.length,'lines');

            fs.writeFileSync filename,fileLines


### export helper function isBuiltInModule (name,prop)

Check for built in and global names
return true if 'name' is a built-in node module

        #ifdef TARGET_JS
        var isCoreModule = name in ['assert', 'buffer', 'child_process', 'cluster',
          'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib']

        if isCoreModule
            if no prop, return true; //just asking: is core module?

            var r = require(name); //load module
            if r has property prop, return true; //is the member there?
            

        #endif
        return

### export helper function isBuiltInObject(name)
    //
    // return true if 'name' is a javascript built-in object
    //
        #ifdef TARGET_JS

        return name in ['isNaN','parseFloat','parseInt','isFinite'
            ,'decodeURI','decodeURIComponent'
            ,'encodeURI','encodeURIComponent'
            ,'eval','console'
            ,'process','require']

        #endif
        return

### export helper function getGlobalObject(name)
        
        #ifdef TARGET_JS

        if options.target is 'c'
            return
        else
            try 
                return global[name]
            
            catch e
                logger.error "Environment.getGlobalObject '#{name}'"
                logger.error 'stack:',e.stack
                debugger
            
        end if

        #endif
        return

    
### export helper function fileInfoNewFile(name) returns FileInfo

create a fileInfo with paths and data for a file to be created

        var importParam = new ImportParameterInfo
        importParam.name = name
        importParam.source="(compiler)"
        importParam.line=0
        importParam.createFile = true
        var fileInfo = new FileInfo(importParam)
        fileInfo.searchModule null
        return fileInfo


### export Class ImportParameterInfo

        properties

            name: string
            
            source:string, line:number //position of "import" statement

            isGlobalDeclare: boolean
            globalImport: boolean
            createFile: boolean


