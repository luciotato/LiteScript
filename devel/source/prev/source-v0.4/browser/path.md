//-------------------------------------------------------
// Environment support to run LiteScritp compiler on the browser
//-------------------------------------------------------

##Helper Dummy path 

    module.exports =
            
        sep : "/"

        join: function 
            return Array.prototype.join.call(arguments,"/")

        resolve: function 
            return Array.prototype.join.call(arguments,"/")

        dirname: function(text:string)
            if text.lastIndexOf("/") into var n is -1, return text
            return text.slice(0,n)

        extname: function(text:string)
            return text.slice(text.lastIndexOf(".")+1)

        basename: function(text:string)
            return text.slice(text.lastIndexOf("/")+1)

