##This script will update version at model.package.json

    var usage = 'usage: lite -run update-package-json x.y.z'

    if no process.argv[2] into var version
        print usage
        process.exit 1

    if version not like /[0-9]+\.[0-9]+\.[0-9]+(\-\w+)?(\+\w+)?/
        print usage
        print "I dont like #{version}, it is semver-compatible?"
        process.exit 1

update package.json version
    
    global import fs
    
    var package = JSON.parse(fs.readFileSync('model.package.json'))
    declare valid package.version
    if package.version isnt version
        var prev = package.version
        package.version = version
        fs.writeFileSync('model.package.json',JSON.stringify(package,undefined,2))
        print "package updated from #{prev} to #{version}"
    else
        print "package is already version #{version}"
    end if

