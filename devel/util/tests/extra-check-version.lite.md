check-version.lite.md

    global import fs, path
    declare var __dirname

read version fom package.json, compiler.js and from lib/out/lite -v 

    print __dirname
    var package = require(path.join(__dirname,'../../../package.json'))
    declare valid package.version
    print "VERSION: |",package.version,"| <-- package.json"

    var requireCompilerVersion = require('../out/lib/Compiler').version;
    print "VERSION: |",requireCompilerVersion,"| <-- require('litescript') (../out/lib/Compiler.lite.md)"

    if requireCompilerVersion isnt package.version
        print "VERSION MISMATCH!"
        process.exit 1

    var exec = require('child_process').exec;

    var cmd = path.join(__dirname,'../../../devel/util/out/lib/lite') + ' -version'

    print process.cwd()
    print cmd
    exec cmd -> err, stdout, stderr
        var cliVersion = stdout.toString().replace(/[\s\n\r]/g,"")
        print "VERSION: |",cliVersion,"| <-- lite-cli.md)"
        if err
            declare valid err.code
            print "exit code", err.code
            process.exit err.code or 1

        if cliVersion isnt package.version
            print "VERSION MISMATCH!"
            process.exit 1

