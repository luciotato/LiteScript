Boolean examples
----------------

    var Tests = {

        "`is` -> `===`  / `isnt`|`<>` -> `!==`":

            code: function()
                var result=[]
                var value = 0
                if value is 0
                    result.push(1)
                if value isnt "0"
                    result.push(2)
                if value isnt 1
                    result.push(3)
                if value <> 1
                    result.push(4)
                return result

            expected: [1,2,3,4]

        "`no` -> `not` -> !":

            code: function()
                var state
                var result=[]
                if no state then result.push(1)
                if not state then result.push(2)
                return result

            expected: [1,2]

        "and or":

            code: function()
                var value = 0
                var param = 7
                if value is 0 and param <> 10
                    if param is 5 or param is 7
                        return "ok"

            expected: "ok"

        "'is not' -> !==":

            code: function()
                var value = 0
                return  value is not 3

            expected: true

        "'is function|Array|Object'":

            code: function()
                var value = 0
                var result=[]

                var testFn = function()
                    do nothing

                result.push( type of testFn )

                if testFn is instance of Function
                    result.push("testFn is a Function")
                else
                    result.push("testFn isnt a Function")

                if testFn isnt instance of Array
                    result.push("testFn isnt an Array")
                else
                    result.push("testFn IS an Array")

                if testFn isnt instance of Object 
                    result.push('testFn ISNT a Object')                                    
                else
                    result.push('testFn is a Object')                                    

                if testFn is instance of Object and testFn instanceof Function 
                    result.push('testFn is a Object and a Function')
                else
                    result.push('NOT(testFn is a Object and a Function)')

                if testFn isnt instance of Object or testFn isnt instanceof Function 
                    result.push('something is wrong')
                else
                    result.push('not testFn is object or not testFn is function')

                return result

            expected:[
                    "function"
                    "testFn is a Function"
                    "testFn isnt an Array"
                    "testFn is a Object"
                    'testFn is a Object and a Function'
                    'not testFn is object or not testFn is function'
                    ]

    }
    
