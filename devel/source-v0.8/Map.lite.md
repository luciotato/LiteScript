Map string to object shim

    export default class Map
        properties
            members:Object = new Object

        method set(key:string, value)
            .members[key]=value

        method get(key:string)
            return .members[key]

        method has(key:string)
            return .members has property key

        method forEach(callb)
            for each own property propName,value in .members
                callb(propName,value)

        method clear()
            .members = new Object
