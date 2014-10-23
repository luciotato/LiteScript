##module UniqueID

### Support Module Var:

    shim import Map
    
    var uniqueIds = new Map

### public function set(prefix, value)
Generate unique numbers, starting at 1

        uniqueIds.set prefix, value-1

### public function get(prefix) returns number
Generate unique numbers, starting at 1

        var id = uniqueIds.get(prefix) or 0

        id += 1

        uniqueIds.set prefix, id

        return id

### public function getVarName(prefix) returns string
Generate unique variable names

        return '_#{prefix}#{get(prefix)}'

