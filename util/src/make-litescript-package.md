This script will create at ./litescript-npm
a clean version of the LiteScript compiler, in order to
make the litescript compiler stable package for the npm repository

    var DEFAULT_VERSION = 'v0.6.0'

    global import path,fs
    import fsUtil,Args

    var color=
            normal:   "\x1b[39;49m"
            red:      "\x1b[91m"
            yellow:   "\x1b[93m"
            green:    "\x1b[32m" 



--------------------------------------
# MAIN


    var usage = """
    Usage:
    > lite make-litescript-package -use v0.5

    This script will create at ./litescript-npm
    a clean version of the LiteScript compiler, in order to
    make the litescript compiler stable package for the npm repository
    
    options are:
    -use *v0.5*: select LiteScript Compiler Version to use
    -verbose *level*: verbose level, default is 1 (0-2)
    """

    var args = new Args(process.argv)

    var options = 
        outDir: args.value("o") or '../litescript-npm' //output dir
        verbose: args.value("verbose") 

    var use:string = args.value('use') or DEFAULT_VERSION

    var destPath = path.resolve(options.outDir)

    print """

        Make LiteScript Package
        -----------------------
        using version: #{use}
        cwd: #{process.cwd()}
        dest dir: #{destPath}
    """

update package.json version

    var package = JSON.parse(fs.readFileSync('model.package.json'))
    declare valid package.version
    if package.version isnt use.slice(1)
        package.version = use.slice(1)
        fs.writeFileSync('model.package.json',JSON.stringify(package,undefined,2))
    end if

    fsUtil.copyIfNewer 'model.package.json', path.join(destPath,'package.json')

copy if newer, README.md, LICENSE

    fsUtil.copyIfNewer '../../README.md', path.join(destPath,'README.md')
    fsUtil.copyIfNewer '../../LICENSE', path.join(destPath,'LICENSE')

copy if newer, lite (#!/usr/bin/env node), calls lite-cli.js

    fsUtil.copyIfNewer 'lite', path.join(destPath,'lite'),{mode:0777}

add newer -compiled- files from ../../liteCompiler-v0.5 to litescript-npm/lib

    copyDir '../../liteCompiler-#{use}', path.join(destPath,'lib')

    print '[OK] Package dir created'


### Helper function copyDir(srcDir,destDir)    

        for each fnameOnly in fs.readdirSync(srcDir)

            //get Full Path
            var full = path.join(srcDir, fnameOnly);
        
            //check if it is a dir
            if fs.statSync(full).isDirectory()
                do nothing
           
            else //single file, copy
                fsUtil.copyIfNewer full, path.join(destDir,fnameOnly)

