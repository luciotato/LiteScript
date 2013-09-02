function boolean_sugar(state, value, param)  //uses globals: leido, pos

    if no state then state={};

    if ++pos.blockCount is 1 then state.keyword = 'main' // 1st block

    if not value is 0
        value++

    if value<>0 then value++

    if value is 0 and param <> 10
        if param is 5 or param is 7

    if value is not 3 then
        console.log('value is not 3')

    if param is function
        console.log("param is a function, param(value) is $(param(value))");
    else if param is Array
        console.log("param is Array, length: $param.length")
    end if

    // check if param is function or param is Array and param.length>0
    bool var isFn_or_arr = param is function or param is Array and param.length>0
    
    // return true if value is 5 or value is 6 or param is Array
    bool return value is 5 or value is 6 or param is Array
