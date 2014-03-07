check-version.lite.md

    global import fs, path
    global declare __dirname

read version fom package.json and from lib/out/lite -v

    print __dirname
    var package = require(path.join(__dirname,'../../../package.json'))
    declare valid package.version
    print "package version", package.version

    var exec = require('child_process').exec;

    var cmd = path.join(__dirname,'../../../devel/util/out/lib/lite') + ' -version'

    print process.cwd()
    print cmd
    exec cmd -> err, stdout, stderr
        var cliVersion = stdout.toString().replace(/[\s\n\r]/g,"")
        print "CLI VERSION: ",cliVersion
        if err
            declare valid err.code
            print "exit code", err.code
            process.exit err.code or 1

        print "VERSION: pkg:|",package.version,"|/ cli:|",cliVersion,"|"
        if cliVersion isnt package.version
            print "VERSION MISMATCH!"
            process.exit 1

