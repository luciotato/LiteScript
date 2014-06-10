simple.lite.md

    b 1,2,3

    function b
        print Array.prototype.join.call(arguments," ")

        #ifdef PROD_C
        var DEFAULT_TARGET="c"
        #else
        var DEFAULT_TARGET="js"
        #end if

        default options =
            verbose: 1
            warning: 1
            comments: 1
            target: DEFAULT_TARGET
            outDir: '.'
            debug: undefined
            skip: undefined
            nomap: undefined
            single: undefined
            compileIfNewer: undefined
            browser:undefined
            extraComments:1
            defines:[]

    var a = [1,2,3]
    var params = [1,1]
    Array.prototype.splice.apply a,params #remove 1 start at 1
    print a

The main module is the root of the module dependency tree, and can reference
another modules via import|require.
    
    var options = {}

    #ifdef PROD_C
    default options = 
        outDir: 'out'
        target: 'c'
    #else
    default options = 
        outDir: '.'
        target: 'js'
    #endif

    print "Out Dir: #{options.outDir}"

