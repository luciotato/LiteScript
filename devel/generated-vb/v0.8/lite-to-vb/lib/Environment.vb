'Generated by LiteScript compiler v0.8.9, source: lib/Environment.lite.md
' -----------
Module Environment
' -----------
'search modules in external cache, load and save from external cache (disk).

'The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.

'Dependencies

    'import fs, path
    'var fs = require('fs');
    'var path = require('path');

    'import mkPath, logger, GeneralOptions
    'var mkPath = require('./mkPath.vb');
    'var logger = require('./logger.vb');
    'var GeneralOptions = require('./GeneralOptions.vb');

'Module vars

    'public var options: GeneralOptions
    Dim options = Nothing


    '    export class FileInfo
    ' constructor
    Class FileInfo
        Public Property importInfo as ImportParameterInfo' mainType: ImportParameterInfo  
     
         Public Property dir as String' mainType: String  
     
         Public Property extension as String' mainType: String  
     
         Public Property base as String' mainType: String  
     
         Public Property sourcename as String' mainType: String  
     
         Public Property hasPath as Object
         Public Property isCore as Object
         Public Property isLite as Object
         Public Property isInterface as Object
         Public Property filename as String' mainType: String  
     
         Public Property relPath as String' mainType: String  
     
         Public Property relFilename as String' mainType: String  
     
         Public Property outDir as String' mainType: String  
     
         Public Property outFilename as String' mainType: String  
     
         Public Property outRelFilename as String' mainType: String  
     
         Public Property outExtension as String' mainType: String  
     
         Public Property outFileIsNewer as Boolean' mainType: Boolean  
     
         Public Property interfaceFile as String' mainType: String  
     
         Public Property interfaceFileExists as Boolean' mainType: Boolean  
     
         Public Property externalCacheExists as Boolean' mainType: Boolean  
     
    
    Sub New(info)

        'if typeof info is 'string'
        if TypeOf info = "string" Then
        
            'var filename = info
            Dim filename = info
            'info = new ImportParameterInfo
            info = new ImportParameterInfo()
            'info.name = filename
            info.name = filename
        
        End if

        'var name = info.name;
        Dim name = info.name
        'this.importInfo = info;
        Me.importInfo = info
        'this.filename = name
        Me.filename = name
        'this.dir = path.resolve(path.dirname(name))
        Me.dir = path.resolve(path.dirname(name))
        'this.hasPath = name.charAt(0) in [path.sep,'.']
        Me.hasPath = new ArrayList From {path.sep, "."}
        .Contains(name.charAt(0))
        'this.sourcename = path.basename(name)
        Me.sourcename = path.basename(name)
        'this.isInterface = '.interface.' in this.sourcename
        Me.isInterface = Me.sourcename.Contains(".interface.")
        'this.extension = path.extname(name)
        Me.extension = path.extname(name)
        'this.base = path.basename(name,this.extension)
        Me.base = path.basename(name, Me.extension)

        '#remove .lite from double extension .lite.md
        'if this.base.endsWith('.lite'), this.base=this.base.slice(0,-5)
        if Me.base.endsWith(".lite") Then Me.base = Me.base.slice(0, -5)
     end function
    
     ' ---------------------------
     Public Function outWithExtension (ext)
        'return path.join(.outDir,"#{.base}#{ext}")
        return path.join(Me.outDir, "" + Me.base + ext)
     end function
     ' ---------------------------
     Public Function searchModule (importingModuleDir)

'//------------------
'//provide a searchModule function to the LiteScript environment
'// to use to locate modules for the `import/require` statement
'//------------------

        '#logger.debug "searchModule #{JSON.stringify(this)}"

'check if it's a node global module (if require() parameter do not start with '.' or './')
'if compiling for node, and "global import" and no extension, asume global lib or core module

        '//ifndef TARGET_C //"require() hack" not possible in .c
        'if .importInfo.globalImport and options.target is 'js'
        if Me.importInfo.globalImport AndAlso options.target = "js" Then
        
            '// if running on node.js and global import ASSSUME core node module / installed node_modules
            'this.isCore = isBuiltInModule(this.base) #core module like 'fs' or 'path'
            Me.isCore = isBuiltInModule(Me.base)
            'this.isLite = false
            Me.isLite = false
            'return
            return
        
        End if
        '//endif

'if parameter has no extension or extension is [.lite].md
'we search the module

        'var full, found, foundIndex=-1, includeDirsIndex=1
        Dim 
            full = Nothing
            , found = Nothing
            , foundIndex = -1
            , includeDirsIndex = 1

        'if this.importInfo.createFile
        if Me.importInfo.createFile Then
        
            'full = path.join(options.projectDir, this.importInfo.name)
            full = path.join(options.projectDir, Me.importInfo.name)
        
        'if this.importInfo.createFile
        
        else
        
            '//search the file
            'var search = [ importingModuleDir ]
            Dim search = new ArrayList From {importingModuleDir}
            'if this.hasPath #specific path indicated
            if Me.hasPath Then
            
                'do nothing // only search at specified dir
                Do Nothing
            
            'if this.hasPath #specific path indicated
            
            else
            
                '#normal: search local ./ & .[projectDir]/lib & .[projectDir]/interfaces & -i dirs
                'search.push
                    'path.join(options.projectDir,'/lib')
                    'path.join(options.projectDir,'/interfaces')
                    'path.join(options.projectDir,'../lib')
                    'path.join(options.projectDir,'../interfaces')

'if we're generating c-code a "global import" of core modules like "path" and "fs",
'gets redirected to dir `ENV_C_global_import` or `../ENV_C_global_import`

                'if options.target is 'c'
                search.push(path.join(options.projectDir, "/lib"), path.join(options.projectDir, "/interfaces"), path.join(options.projectDir, "../lib"), path.join(options.projectDir, "../interfaces"))

'if we're generating c-code a "global import" of core modules like "path" and "fs",
'gets redirected to dir `ENV_C_global_import` or `../ENV_C_global_import`

                'if options.target is 'c'
                if options.target = "c" Then
                
                    '// prepend interfaces/C_standalone to found "path" "fs" and other
                    '// core node-js modules (migrated to Litescript and/or native-c)
                    'search.unshift
                        'path.join(options.projectDir,'/interfaces/C_standalone')
                        'path.join(options.projectDir,'../interfaces/C_standalone')
                'end if
                    search.unshift(path.join(options.projectDir, "/interfaces/C_standalone"), path.join(options.projectDir, "../interfaces/C_standalone"))
                
                End if
                'end if

'include command-line (-i foo/bar) specified dirs

                'for each extra in options.includeDirs
                

'include command-line (-i foo/bar) specified dirs

                'for each extra in options.includeDirs
                For Each extra in options.includeDirs
                
                    'search.push path.resolve(options.projectDir,extra)
                    search.push(path.resolve(options.projectDir, extra))
                Next'  each in options.includeDirs

'add compiler directory to "include dirs" so GlobalScopeX.interface.md can be found

                'includeDirsIndex = search.length
                includeDirsIndex = search.length
                'if __dirname
                if __dirname Then
                

                    'if options.target is 'c' //include first: /interfaces/C_standalone'
                    if options.target = "c" Then
                    
                        'search.push path.resolve('#{__dirname}/../interfaces/C_standalone')
                        search.push(path.resolve("" + __dirname + "/../interfaces/C_standalone"))
                    
                    End if
                    'end if

                    'search.push path.resolve('#{__dirname}/../interfaces')
                    

                    'search.push path.resolve('#{__dirname}/../interfaces')
                    search.push(path.resolve("" + __dirname + "/../interfaces"))
                
                End if
                'end if


'Now search the file in all specidief dirs/with all the extensions

            'for each dirIndex,dir in search
                
            
            End if


'Now search the file in all specidief dirs/with all the extensions

            'for each dirIndex,dir in search
            Dim dirIndex as Integer =0
            For Each dir in search
            
                'var fname = path.join(dir,this.importInfo.name)
                Dim fname = path.join(dir, Me.importInfo.name)
                'for each ext in ['.lite.md','.md','.interface.md','.js']
                var _list5=new ArrayList From {".lite.md", ".md", ".interface.md", ".js"}
                
                For Each ext in _list5
                
                    'full = fname & ext
                    full = fname & ext
                    'if fs.existsSync(full)
                    if fs.existsSync(full) Then
                    
                        'found=full
                        found = full
                        'foundIndex=dirIndex
                        foundIndex = dirIndex
                        'break
                        break
                    
                    End if
                    
                Next'  each in new ArrayList From {".lite.md", ".md", ".interface.md", ".js"}
                
                'end for
                'if found, break
                
                'if found, break
                if found Then break
            Next'  each in search
            'end for

            '//console.log(basePath);
            '//logger.debug full

            '#try \t#{search.join('\n\t')}

            'if not found
            

            '//console.log(basePath);
            '//logger.debug full

            '#try \t#{search.join('\n\t')}

            'if not found
            if Not(found) Then
            
                'logger.throwControlled '' + .importInfo.source + ":" + .importInfo.line + ":1 Module not found:\nSearched '" + .importInfo.name + "' at:\n" + (search.join('\n')) + "\n   with extensions (.lite.md|.md|.interface.md|.js)"
                logger.throwControlled("" + Me.importInfo.source + ":" + Me.importInfo.line + ":1 Module not found:\nSearched '" + Me.importInfo.name + "' at:\n" + (search.join("\n")) + "\n   with extensions (.lite.md|.md|.interface.md|.js)")
            
            End if
            
        
        End if

        'end if

        '//set filename & Recalc extension
        'this.filename =  path.resolve(full); //full path
        

        '//set filename & Recalc extension
        'this.filename =  path.resolve(full); //full path
        Me.filename = path.resolve(full)
        'this.extension = path.extname(this.filename);
        Me.extension = path.extname(Me.filename)

        '//else

            '//other extensions
            '//No compilation (only copy to output dir), and keep extension
        '//    this.filename = path.resolve(importingModuleDirname,this.importInfo.name);


        '//recalc data from found file
        'this.dir = path.dirname(this.filename);
        Me.dir = path.dirname(Me.filename)
        'this.sourcename = path.basename(this.filename); #with extensions
        Me.sourcename = path.basename(Me.filename)
        'this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
        Me.isInterface = Me.sourcename.indexOf(".interface.") <> -1
        'this.relFilename = path.relative(options.projectDir, this.filename); //relative project path
        Me.relFilename = path.relative(options.projectDir, Me.filename)
        'this.relPath = path.relative(options.projectDir, this.dir); //relative to project path
        Me.relPath = path.relative(options.projectDir, Me.dir)

        '// based on result extension
        'this.isLite = this.extension in ['.md','.lite']
        Me.isLite = new ArrayList From {".md", ".lite"}
        .Contains(Me.extension)
        'this.outExtension = not this.isLite and this.extension? this.extension else ".#{options.target}"
        Me.outExtension = Not(Me.isLite) AndAlso Me.extension ? Me.extension : "." + options.target

        'this.outDir = path.join(options.outDir, this.relPath)
        Me.outDir = path.join(options.outDir, Me.relPath)
        'if this.outDir.slice(0,options.outDir.length) isnt options.outDir // the out path is outside inicated path
        if Me.outDir.slice(0, options.outDir.length) <> options.outDir Then
        
            '//mainly because .. on the found file.
            '// fix it to be inside options.outDir
            'this.outDir = path.join(options.outDir, path.basename(this.dir)) // use only one last dir
            Me.outDir = path.join(options.outDir, path.basename(Me.dir))
        
        End if

        'this.outFilename = path.join(this.outDir, "#{this.base}#{this.outExtension}");
        Me.outFilename = path.join(Me.outDir, "" + Me.base + Me.outExtension)
        'this.outRelFilename = path.relative(options.outDir, this.outFilename); //relative to options.outDir
        Me.outRelFilename = path.relative(options.outDir, Me.outFilename)

        '//print JSON.stringify(this,null,2)

        'if this.importInfo.createFile, return #we're creating this file
        if Me.importInfo.createFile Then return

'Check if outFile exists, but is older than Source

        '//get source date & time
        'var sourceStat = fs.statSync(this.filename);
        Dim sourceStat = fs.statSync(Me.filename)
        'declare on sourceStat mtime
        

        'if fs.existsSync(this.outFilename)
        if fs.existsSync(Me.outFilename) Then
        
            '//get generated date & time
            'var statGenerated = fs.statSync(this.outFilename);
            Dim statGenerated = fs.statSync(Me.outFilename)
            'declare on statGenerated mtime
            
            '//if source is older
            'this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime );
            Me.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime)
        
        End if

'
'        console.log this.filename
'        console.log sourceStat.mtime
'        console.log this.outFilename
'        if statGenerated, console.log statGenerated.mtime
'        console.log this.outFileIsNewer
'        

'Also calculate this.interfaceFile (cache of module exported names),
'check if the file exists, and if it is updated

        'this.interfaceFile = path.join(this.dir,'#{this.base}.interface.md');
        Me.interfaceFile = path.join(Me.dir, "" + Me.base + ".interface.md")
        '#logger.debug this.interfaceFile
        'var isCacheFile
        Dim isCacheFile = Nothing
        'if fs.existsSync(this.interfaceFile)
        if fs.existsSync(Me.interfaceFile) Then
        
            'this.interfaceFileExists = true
            Me.interfaceFileExists = true
            'isCacheFile = false
            isCacheFile = false
        
        'if fs.existsSync(this.interfaceFile)
        
        else
        
            '//set for auto-generated interface
            'this.interfaceFile = path.join(this.dir,'#{this.base}.cache-interface.md');
            Me.interfaceFile = path.join(Me.dir, "" + Me.base + ".cache-interface.md")
            'isCacheFile = true
            isCacheFile = true
            'this.interfaceFileExists = fs.existsSync(this.interfaceFile)
            Me.interfaceFileExists = fs.existsSync(Me.interfaceFile)
        
        End if

'Check if interface cache is updated

        'if this.interfaceFileExists and isCacheFile
        if Me.interfaceFileExists AndAlso isCacheFile Then
        
            '//get interface date & time
            'var statInterface = fs.statSync(this.interfaceFile);
            Dim statInterface = fs.statSync(Me.interfaceFile)
            'declare on statInterface mtime
            
            '//cache exists if source is older
            'this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime );
            Me.interfaceFileExists = (statInterface.mtime > sourceStat.mtime)
            'if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated
            if Not(Me.interfaceFileExists) Then externalCacheSave(Me.interfaceFile, null)
        
        End if

        'return
        return
     end function
    
    end class 'FileInfo

    '    export helper function setBaseInfo(projectOptions)
    ' ---------------------------
    function setBaseInfo(projectOptions)

        '//set module vars
        'options = projectOptions
        options = projectOptions
    end function


    '    export helper function relativeFrom(actualPath, destFullPathFilename) returns string
    ' ---------------------------
    function relativeFrom(actualPath, destFullPathFilename)

        '//relative to fromFileinfo.outFilename
        '//print "relativeFileRef(filename, fromFileinfo)"
        '//print filename
        '//print fromFileinfo.outDir
        '//print path.relative(fromFileinfo.outDir, filename)
        'return path.relative(actualPath, destFullPathFilename ) //from path, to fullpath/filename
        return path.relative(actualPath, destFullPathFilename)
    end function


    '    export helper function resolvePath(text)
    ' ---------------------------
    function resolvePath(text)
        'return path.resolve(text)
        return path.resolve(text)
    end function

    '    export helper function getDir(filename)
    ' ---------------------------
    function getDir(filename)
        '//dir name
        'return path.dirname(filename)
        return path.dirname(filename)
    end function

'----------

    '    export helper function loadFile(filename)
    ' ---------------------------
    function loadFile(filename)
    '//------------------
    '//provide a loadFile function to the LiteScript environment.
    '//return file contents
    '//------------------
        'return fs.readFileSync(filename);
        return fs.readFileSync(filename)
    end function


    '    export helper function externalCacheSave(filename, fileLines)
    ' ---------------------------
    function externalCacheSave(filename, fileLines)
    '//------------------
    '//provide a externalCacheSave (disk) function to the LiteScript environment
    '// receive a filename and an array of lines
    '//------------------
        'if no fileLines
        if NotfileLines Then
        
            'if fs.existsSync(filename)
            if fs.existsSync(filename) Then
            
                '//remove file
                'fs.unlinkSync filename
                fs.unlinkSync(filename)
            
            End if
            
        
        'if no fileLines
        
        else
        

            '// make sure output dir exists
            'mkPath.toFile(filename);
            mkPath.toFile(filename)

            'if fileLines instanceof Array
            if TypeOf fileLines is Array Then
            
                'declare fileLines:Array
                
                'fileLines=fileLines.join("\n")
                fileLines = fileLines.join("\n")
            
            End if

            '//console.log('save file',filename,fileLines.length,'lines');

            'fs.writeFileSync filename,fileLines
            fs.writeFileSync(filename, fileLines)
        
        End if
        
    end function


    '    export helper function isBuiltInModule (name,prop)
    ' ---------------------------
    function isBuiltInModule(name, prop)

'Check for built in and global names
'return true if 'name' is a built-in node module

        '//ifdef TARGET_JS
        '//var isCoreModule = name in ['assert', 'buffer', 'child_process', 'cluster',
          '//'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          '//'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          '//'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib']

        '//if isCoreModule
            '//if no prop, return true; //just asking: is core module?

            '//var r = require(name); //load module
            '//if r has property prop, return true; //is the member there?


        '//endif
        'return
        return
    end function

    '    export helper function isBuiltInObject(name)
    ' ---------------------------
    function isBuiltInObject(name)
    '//
    '// return true if 'name' is a javascript built-in object
    '//
        '//ifdef TARGET_JS

        '//return name in ['isNaN','parseFloat','parseInt','isFinite'
            '//,'decodeURI','decodeURIComponent'
            '//,'encodeURI','encodeURIComponent'
            '//,'eval','console'
            '//,'process','require']

        '//endif
        'return
        return
    end function

    '    export helper function getGlobalObject(name)
    ' ---------------------------
    function getGlobalObject(name)

        '//ifdef TARGET_JS

        '//if options.target is 'c'
            '//return
        '//else
            '//try
                '//return global[name]

            '//catch e
                '//logger.error "Environment.getGlobalObject '#{name}'"
                '//logger.error 'stack:',e.stack
                '//debugger

        '//end if

        '//endif
        'return
        return
    end function


    '    export helper function fileInfoNewFile(name) returns FileInfo
    ' ---------------------------
    function fileInfoNewFile(name)

'create a fileInfo with paths and data for a file to be created

        'var importParam = new ImportParameterInfo
        Dim importParam = new ImportParameterInfo()
        'importParam.name = name
        importParam.name = name
        'importParam.source="(compiler)"
        importParam.source = "(compiler)"
        'importParam.line=0
        importParam.line = 0
        'importParam.createFile = true
        importParam.createFile = true
        'var fileInfo = new FileInfo(importParam)
        Dim fileInfo = new FileInfo(importParam)
        'fileInfo.searchModule null
        fileInfo.searchModule(null)
        'return fileInfo
        return fileInfo
    end function


    '    export class ImportParameterInfo
    ' constructor
    Class ImportParameterInfo
        Public Property name as String' mainType: String  
        
            Public Property source as String' mainType: String  
        
            Public Property line as Number' mainType: Number  
        
            Public Property isGlobalDeclare as Boolean' mainType: Boolean  
        
            Public Property globalImport as Boolean' mainType: Boolean  
        
            Public Property createFile as Boolean' mainType: Boolean  
        
    
    Sub New() 'default constructor
    
    
    end class 'ImportParameterInfo
' -----------
' Module code
' -----------

    'end class FileInfo

    '    export helper function setBaseInfo(projectOptions)
    
end module