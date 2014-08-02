Environment support to emulate some node globals
to run LiteScritp as C-compiled bin

##Helper "path" namespace
Provides a C-coded partial support for node's require('path')

    public namespace path
    
        properties 
            sep = "/"
            delimiter = ":"

        method join
            var args:array = arguments.toArray()
            return args.join("/")

        method resolve(text:string)
            return text

        method relative(from:string, toFname:string)
            var n=0 
            while n<toFname.length
                if toFname[n] isnt from[n], break
                n++

            return toFname.slice(n) or '.'


        method dirname(text:string)
            if text.lastIndexOf("/") into var n is -1, return text
            return text.slice(0,n)

        method extname(text:string)
            return text.slice(text.lastIndexOf(".")+1)

        method basename(text:string)
            return text.slice(text.lastIndexOf("/")+1)

