# JS Engine global environment declarations

The compiler pre-creates some core objects, to allow declaration of property and return types

global vars pre-created are:
  undefined, null, true, false, NaN

global Classes pre-created are:
  Object, Function, Array, String, Number, Boolean


### Append to class Function

        properties name
        method bind
        method call
        method apply

### Append to Class Object
        properties
            constructor: Function

        method toString() returns string   
        method hasOwnProperty(name) returns boolean
        
    append to namespace Object
        
        method keys(obj) returns array of string
        method create 
        method defineProperty
        method defineProperties
        method freeze 
        method getPrototypeOf(obj)
        method setPrototypeOf(obj,newProto)
        method getOwnPropertyDescriptor
        method getOwnPropertyNames(ibj)
        //method is() 
        method isExtensible 
        method isFrozen 
        method isSealed 
        method preventExtensions 
        method seal 
        //method getOwnPropertySymbols() 

### Append to class Array 
        properties
            length:number
        
        method toLocaleString() 
        method join(separator:string) returns string
        method pop() 
        method push
        method concat
        method reverse() 
        method shift() 
        method unshift 
        method slice(startIndex,endIndexNotIncluded) returns array
        method splice(startIndex,howManytoDelete,...) returns array
        method sort 
        method filter 
        method forEach 
        method some 
        method every 
        method map 
        method indexOf 
        method lastIndexOf 
        method reduce 
        method reduceRight 
        #ifdef ES6
        method keys() 
        method entries()
        method find 
        method findIndex 
        #endif
    
    append to namespace Array
        method isArray() 

### Append to class String 
        
        properties
            length:number

        method valueOf() 
        method charAt(index) 
        method charCodeAt(index) 
        method concat
        method indexOf(needle:string, startIndex) 
        method lastIndexOf(needle:string, startIndex) 
        method localeCompare
        method match
        //method normalize() 
        method replace
        method search
        method slice(startIndex,endIndexNotIncluded) returns string
        method split(separator:string, limit) returns array of string
        method substring
        method substr
        method toLowerCase() 
        method toLocaleLowerCase 
        method toUpperCase() 
        method toLocaleUpperCase 
        method trim() 
        //method trimLeft() 
        //method trimRight() 
        method link 
        method anchor 
        method fontcolor 
        method fontsize 
        method big 
        method blink 
        method bold 
        method fixed 
        method italics 
        method small 
        method strike 
        method sub 
        method sup 
        method repeat 
        #ifdef ES6
        method startsWith(text:string, position) 
        method endsWith(text:string, position) 
        method contains(text:string, position) 
        #endif ES6

    append to namespace String
        method fromCharCode

### Append to class Number

        method toLocaleString 
        method valueOf 
        method toFixed 
        method toExponential 
        method toPrecision 
    
    append to namespace Number
        properties
            MAX_VALUE:number
            MIN_VALUE:number
            NaN:number
            NEGATIVE_INFINITY:number
            POSITIVE_INFINITY:number
            MAX_SAFE_INTEGER:number
            MIN_SAFE_INTEGER:number
            EPSILON:number

        method isFinite() 
        method isInteger() 
        method isNaN() 
        method isSafeInteger() 
        method parseInt
        method parseFloat


## Classes declared here

### global class Error extends Object
        properties
            name, message,stack

        constructor new Error(...)

    append to namespace Error
        properties
            stackTraceLimit:number

        method captureStackTrace 


### global class Date extends Object
        
        constructor new Date(...)

        method toDateString() 
        method toTimeString() 
        method toLocaleString() 
        method toLocaleDateString() 
        method toLocaleTimeString() 
        method valueOf() 
        method getTime() 
        method getFullYear() 
        method getUTCFullYear() 
        method getMonth() 
        method getUTCMonth() 
        method getDate() 
        method getUTCDate() 
        method getDay() 
        method getUTCDay() 
        method getHours() 
        method getUTCHours() 
        method getMinutes() 
        method getUTCMinutes() 
        method getSeconds() 
        method getUTCSeconds() 
        method getMilliseconds() 
        method getUTCMilliseconds() 
        method getTimezoneOffset() 
        method setTime 
        method setMilliseconds 
        method setUTCMilliseconds 
        method setSeconds 
        method setUTCSeconds 
        method setMinutes 
        method setUTCMinutes 
        method setHours 
        method setUTCHours 
        method setDate 
        method setUTCDate 
        method setMonth 
        method setUTCMonth 
        method setFullYear 
        method setUTCFullYear 
        method toGMTString() 
        method toUTCString()
        method getYear 
        method setYear 
        method toISOString() 
        method toJSON() 
    
    append to namespace Date
        method UTC 
        method parse 
        method now() 

### global class RegExp

        properties
            source:string
            global:boolean
            ignoreCase:boolean
            multiline:boolean
            lastIndex:number

        constructor new RegExp(pattern,flags:string)
        
        method exec 
        method test 
        method toString 
        method compile 
    
    append to namespace RegExp
        properties
            input:string
            $_:string
            $input:string
            multiline:boolean
            lastMatch:string
            lastParen:string
            leftContext:string
            rightContext:string

    
### global namespace JSON
        method parse(text, reviver:function) 
        method stringify(obj, replacer, indent)     

### global namespace Math
        properties
            E:number
            PI:number
        
        method random 
        method abs 
        method acos 
        method asin 
        method atan 
        method ceil 
        method cos 
        method exp 
        method floor 
        method log 
        method round 
        method sin 
        method sqrt 
        method tan 
        method atan2 
        method pow 
        method max 
        method min 
        method imul 
        method sign 
        method trunc 
        method sinh 
        method cosh 
        method tanh 
        method asinh 
        method acosh 
        method atanh 
        method log10 
        method log2 
        method hypot 
        method fround 
        method clz32 
        method cbrt 
        method log1p 
        method expm1 

### global functions

    global function Val
    global function Str

## Global Namespaces

### global namespace Debug

        method print
        method assert


