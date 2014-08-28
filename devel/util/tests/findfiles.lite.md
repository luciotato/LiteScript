    import fs, path 

### function fromDir(startPath, filter:RegExp, callback:Function)

        //print 'Starting from dir #{startPath}/'

        if not fs.existsSync(startPath)
            print "no dir ",startPath
            return

        var files=fs.readdirSync(startPath)
        for each file in files
            var filename=path.join(startPath,file)
            var stat = fs.lstatSync(filename)
            if stat.isDirectory()
                fromDir filename,filter,callback //recurse
            
            else if no test or filter.test(filename) 
                    callback filename
    

### main

    fromDir '../LiteScript' -> filename
        print '-- found: ',filename
