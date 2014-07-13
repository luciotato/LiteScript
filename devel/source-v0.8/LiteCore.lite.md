
Shim for Lite-C core support, when target is JS

    namespace LiteCore

        shim method getSymbol(name)
            return name

    append to class Object

        shim method tryGetMethod(methodSymbol) returns function
            return this[methodSymbol]

        shim method tryGetProperty(propSymbol)
            return this[propSymbol]

        shim method getProperty(propSymbol) 
            if propSymbol not in Object.keys(this), throw new Error('object has not property "'+propSymbol+'"')
            return this[propSymbol]

        shim method getPropertyName(propIndex) 
            return Object.keys(this)[propIndex]

