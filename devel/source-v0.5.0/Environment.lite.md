The 'Environment' object, must provide functions to load files, 
search modules in external cache, load and save from external cache (disk). 

The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.

Dependencies

    global import fs, path

    import mkPath, log
    var debug = log.debug

### export Class FileInfo
     properties
        importParameter:string #: raw string passed to import/require
        dirname:string #: path.dirname(importParameter)
        extension:string #: path.extname(importParameter)
        basename:string #: path.basname(importParameter, ext) #with out extensions
        sourcename:string #: path.basname(importParameter, ext) #with  extensions
        hasPath # true if starts with '.' or '/'
        isCore # true if it's a core node module as 'fs' or 'path'
        isLite #: true is extension is '.lite'|'.lite.md' 
        filename:string #: found full module filename
        relPath:string # path.relative(basePath, this.dirname); //relative to basePath
        relFilename
        outFilename #: output file for code production
        outRelFilename # path.relative(options.outBasePath, this.outFilename); //relative to basePath
        outExtension
        interfaceFile #: interface file (.[auto-]interface.md) declaring exports cache
        interfaceFileExists #: if interfaceFileName file exists
        externalCacheExists


#### constructor (importParameter)
          
        this.importParameter = importParameter
        this.filename = importParameter
        this.dirname = path.resolve(path.dirname(importParameter))
        this.hasPath = importParameter[0] in [path.delimiter,'.']
        this.sourcename = path.basename(importParameter) 
        this.extension = path.extname(importParameter)
        this.basename = path.basename(importParameter,this.extension) 

        #remove .lite from double extension .lite.md
        this.basename = this.basename.replace(/.lite$/,"")


#### method searchModule(importingModuleFileInfo, options )

//------------------
//provide a searchModule function to the LiteScript environment
// to use to locate modules for the `import/require` statement
//------------------

        default options = 
            target: 'js'
        
        declare on options
            basePath,outBasePath

check if it's a core module like 'fs' or 'path'

        if no this.hasPath and no this.extension and isBuiltInModule(this.basename)
            this.isCore = true
            this.isLite = false
            return 

if parameter has no extension or extension is [.lite].md
we search the module 

        if no this.extension or this.extension is '.md'

            //search the file
            var search;
            if this.hasPath #specific path indicated
                search = path.resolve(importingModuleFileInfo.dirname,this.importParameter)
            else
                //search in node_modules, unless we're already in node_modules:
                if path.basename(importingModuleFileInfo.dirname) is 'node_modules'
                    search = path.join(importingModuleFileInfo.dirname, this.importParameter)
                else
                    search = path.join(importingModuleFileInfo.dirname,'node_modules',this.importParameter)

            var full,found;
            for each ext in ['.lite.md','.md','.interface.md','.js']
                full = search+ext;
                if fs.existsSync(full)
                    found=full;
                    break;
                
            //console.log(basePath);
            //console.log(full);

            if not found
                log.throwControled '#{importingModuleFileInfo.relFilename}: Module not found: #{this.importParameter}\n'
                                    +'\tSearched as:\n'
                                    +'\t#search(.lite.md|.md|.js)]'
            
            //set filename & Recalc extension
            this.filename =  path.resolve(full); //full path
            this.extension = path.extname(this.filename);
        
        else 

            //other extensions
            //No compilation (only copy to output dir), and keep extension 
            this.filename = path.resolve(importingModuleFileInfo.dirname,this.importParameter);
        

        //recalc data from found file
        this.dirname = path.dirname(this.filename);
        this.sourcename = path.basename(this.filename); #with extensions
        this.relPath = path.relative(options.basePath, this.dirname); //relative to basePath
        this.relFilename = path.relative(options.basePath, this.filename); //relative to basePath

        // based on result extension                
        this.isLite = this.extension in ['.md','.lite']
        this.outExtension = this.isLite? ".#{options.target}" else (this.extension or '.js');
            
        this.outFilename = path.join(options.outBasePath, this.relPath, this.basename+this.outExtension);
        this.outRelFilename = path.relative(options.outBasePath, this.outFilename); //relative to basePath

Also calculate this.interfaceFile (cache of module exported names), 
check if the file exists, and if it is updated

        this.interfaceFile = path.join(this.dirname,this.basename+'.interface.md');
        var isCacheFile
        if fs.existsSync(this.interfaceFile)
            this.interfaceFileExists = true
            isCacheFile = false
        else
            //set for auto-generated interface
            this.interfaceFile = path.join(this.dirname,this.basename+'.cache-interface.md');
            isCacheFile = true
            this.interfaceFileExists = fs.existsSync(this.interfaceFile)

Check if interface cache is updated

        if this.interfaceFileExists and isCacheFile
            //get source date & time 
            var stat = fs.statSync(this.filename);
            declare on stat mtime
            //get interface date & time 
            var statInterface = fs.statSync(this.interfaceFile);
            declare on statInterface mtime
            //cache exists if source is older
            this.interfaceFileExists = (statInterface.mtime > stat.mtime ); 
            if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated

        debug this
        
        return
    
    end class FileInfo

### export helper function setBasePath(filename, options)

        declare on options 
            basePath,outBasePath,mainModuleName,outDir

        var fileInfo = new FileInfo(filename)
        options.basePath = fileInfo.dirname
        options.mainModuleName = '.' + path.sep + fileInfo.basename
        
        options.outBasePath = path.resolve(options.outDir)

    
### export helper export function relName(filename,basePath)
        //relative to basePath
        return path.relative(basePath, filename)
    
----------

    export function loadFile(filename)
    //------------------
    //provide a loadFile function to the LiteScript environment.
    //return file contents
    //------------------
        return fs.readFileSync(filename);
    

    export function externalCacheSave(filename, fileLines)
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


    //------------------
    // Check for built in and global names
    //------------------
    
    export function isBuiltInModule (name,prop)
    //
    // return true if 'name' is a built-in node module
    //

       var isCoreModule = name in ['assert', 'buffer', 'child_process', 'cluster',
          'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib']

       if isCoreModule
            if no prop, return true; //just asking: is core module?

            var r = require(name); //load module
            if r has property prop, return true; //is the member there?
            
     
    export function isBuiltInObject(name)
    //
    // return true if 'name' is a javascript built-in object
    //

        return name in ['isNaN','parseFloat','parseInt','isFinite'
            ,'decodeURI','decodeURIComponent'
            ,'encodeURI','encodeURIComponent'
            ,'eval','console'
            ,'process','require']


    export function getGlobalObject(name)
        try 
            return global[name]
        
        catch e
            log.error "Environment.getGlobalObject '#{name}'"
            log.error e.stack
            debugger



