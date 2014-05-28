### public default class Args extends Array
parse command line parameters

#### properties
        lastIndex

    
#### constructor new Args(argv:array)
        var arr= argv.slice(2) //remove 'node lite' from command line arguments
        declare valid arr.__proto__
        arr.__proto__ = Args.prototype //convert arr:Array into arr:Args:Array
        return arr //return as created object

#### method option(short,argName)
        
        if .getPos(short,argName) into var pos >= 0
            this.splice(pos,1)
            return true
        
        return false

#### method value(short,argName) returns string
        
        if .getPos(short,argName) into var pos >= 0
            var value = this[pos+1]
            this.splice(pos,2)
            return value
        
        return undefined

#### helper method getPos(short,argName)

        .lastIndex = .search(['-#{short}','--#{short}','--#{argName}','-#{argName}'])
        return .lastIndex

#### helper method search(list:array)
        for each item in list
            var result = .indexOf(item)
            if result >=0, return result
        return -1


