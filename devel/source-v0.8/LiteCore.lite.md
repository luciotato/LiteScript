
Shim for Lite-C core support, when target is JS

    namespace LiteCore

        shim method getSymbol(name)
            return name
            // in js, every object property is accessed by 'name' (a string)
            // in LiteC, every object property is accessed by a "symbol" (a integer)

        shim method getSymbolName(symbol)
            return symbol
            // in js, a symbol "name" is the same symbol (a symbol is already a string)
            // in LiteC, a symbol name is looked-up in the table _symbol[]

    append to class Object

        shim method tryGetMethod(methodSymbol) returns function
            return this[methodSymbol]

        shim method tryGetProperty(propSymbol)
            return this[propSymbol]

        shim method getProperty(propSymbol) 
            if propSymbol not in Object.keys(this), throw new Error('object has not property "#{propSymbol}"')
            return this[propSymbol]

        shim method getPropertyName(propIndex) 
            return Object.keys(this)[propIndex]

    append to namespace console

        properties indentLevel

        shim method group() 
            console.log.apply undefined,arguments
            console.indentLevel = console.indentLevel or 0 + 1

        shim method groupEnd() 
            if console.indentLevel 
                console.indentLevel--
