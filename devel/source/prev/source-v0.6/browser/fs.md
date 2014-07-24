//-------------------------------------------------------
// Environment support to run LiteScritp compiler on the browser
//-------------------------------------------------------

##Helper Dummy fs

    module.exports =

        existsSync: function 
            return false

        readFileSync: function 
            return false

        writeFileSync: function 
            return false

