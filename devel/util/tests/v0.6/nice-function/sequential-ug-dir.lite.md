
    global import fs, path, proc from 'child_process'

    import fsUtil, wait from '../../waitfor'

    var normal = "\x1b[39;49m";
    var red = "\x1b[91m";
    var green = "\x1b[32m";


uglify a js file
------------------------------------------

    async function ugFile(filename, output_dir, options) 

        default options = {}

        var extension, js_filename, source, js_output;

        var stat = wait for fs.stat filename
        
        if stat.isDirectory(), fail with 'expected a file'

        extension = path.extname(filename)

        if extension is '.js'

            // get filename for output .js
            jsFilename = path.join(output_dir, path.basename(filename, extension)) + '.ug.js';

            wait.for(fsUtil,mkPathToFile(jsFilename))

            print green,'ug', filename,normal, '->', jsFilename

            wait.for(proc.exec,'uglifyjs #{filename} -b -o #{jsFilename}')

            //do some replacement on the file
            var contents = wait.for(fs.readFile,jsFilename,'utf-8')

            wait.for(fs.writeFile,jsFilename,contents.replace(/\svar\s/g," "))

            print green, jsFilename,'removed "var"',normal

            print normal,'-----------'


### function ugDir(sourceDir, outDir, options)

    print 'ug dir #{sourceDir} -to- #{outDir}'

    if options, print 'OPTIONS:',options

    //get files
    var files = []
    var filename
    fsUtil.recurseDir sourceDir function(filename)
        if path.extname(filename) is '.js'
            and (no options.filter or options.filter in filename)
            and (no options.exclude or options.exclude not in filename)      
                   files.push filename

    //run ug sequentially on each one
    for each filename in files
        wait for ugFile filename,outDir,options
    

### function mainFiber


//
//-- MAIN--------------------------------------
//

    print 
    print process.argv
    print process.cwd()

    var options:
          beautify : true
          exclude  : 'README'
          force    : "-force" in process.argv


    ugDir 'test','out',options, function(err,data)
        if err
            print red,error.message,normal
        else
            print 'result data is: #{data}'


    ugDir 'test','out',options, (err,data)->
        if err
            print red,error.message,normal
        else
            print 'result data is: #{data}'


    async call ugDir 'test','out',options
        if err
            print red,error.message,normal
        else
            print 'result data is: #{data}'




    var frontDoor = new Door('brown')
    
    frontDoor.on 'open', ->
        print 'ring ring ring'

    frontDoor.open

    var server = new http.createServer

    server.on 'request', (request,response)-> 
        
        request.on 'data', (chunk)-> 
              print chunk.toString()
            
        request.on 'end', ->
              print 'request completed!'



