
### class OptionsParser
parse command line parameters

#### properties
        lastIndex
        items: Array of string

#### constructor(argv:array)

        if argv.length and argv[0] is 'node' 
                argv=argv.slice(1) //remove 'node' if calling as a script

        .items = argv.slice(1) //remove this script/exe 'litec.out' from command line arguments

#### method option(shortOption,argName)
        
        if .getPos(shortOption,argName) into var pos >= 0
            .items.splice(pos,1)
            return true
        
        return false

#### method valueFor(shortOption,argName) returns string
        
        if .getPos(shortOption,argName) into var pos >= 0
            var value = .items[pos+1]
            .items.splice(pos,2)
            return value
        
        return undefined

#### helper method getPos(shortOption,argName)

search several possible forms of the option, e.g. -o --o -outdir --outdir

        var forms=['-#{shortOption}','--#{shortOption}']
        if argName, forms.push('--#{argName}','-#{argName}')

        return .search(forms) into .lastIndex

#### helper method search(list:array)
        for each item in list
            var result = .items.indexOf(item)
            if result >=0, return result
        return -1


