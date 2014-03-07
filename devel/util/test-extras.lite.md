test-extra.lite.md

    global import fs, path
    import fsUtil 

run all files .lite.md at dir test-v0.6

    var testPath = 'test-v0.6'

    for each filename:string in fs.readdirSync(testPath)

        //console.error(filename,path.extname(filename));
        if filename like /(extra-.*\.lite\.md)$/ 

            var cmd = 'lite -es6 -run #{path.join(testPath,filename)}'

            var exec = require('child_process').exec;

            print process.cwd()
            print cmd
            exec cmd -> err, stdout, stderr
                print stdout
                print stderr
                if err
                    declare valid err.code
                    print "exit code", err.code
                    process.exit err.code or 1
