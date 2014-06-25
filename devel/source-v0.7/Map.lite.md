Map string to object shim

    export default class Map
        properties
            map_members:Object = new Object

        method set(key:string, value)
            .map_members[key]=value

        method get(key:string)
            return .map_members[key]

        method has(key:string)
            return .map_members has property key

        method forEach(callb)
            for each own property propName,value in .map_members
                callb(propName,value)

        method clear()
            .map_members = new Object
