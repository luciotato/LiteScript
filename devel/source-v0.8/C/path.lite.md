Environment support to emulate some node globals
to run LiteScritp as C-compiled bin

##Helper "path" namespace
Provides a replacement for node's require('path')

    public namespace path
    
        properties 
            sep = "/"

        method join
            var args:array = arguments.toArray()
            return args.join("/")

        method resolve
            var args:array = arguments.toArray()
            return args.join("")

        method dirname(text:string)
            if text.lastIndexOf("/") into var n is -1, return text
            return text.slice(0,n)

        method extname(text:string)
            return text.slice(text.lastIndexOf(".")+1)

        method basename(text:string)
            return text.slice(text.lastIndexOf("/")+1)

