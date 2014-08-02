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
        
        method keys() returns array of string
        method create() 
        method defineProperty() 
        method defineProperties() 
        method freeze() 
        method getPrototypeOf() 
        method setPrototypeOf() 
        method getOwnPropertyDescriptor() 
        method getOwnPropertyNames() 
        //method is() 
        method isExtensible() 
        method isFrozen() 
        method isSealed() 
        method preventExtensions() 
        method seal() 
        //method getOwnPropertySymbols() 

### Append to class Array 
        properties
            length:number
        
        method toLocaleString() 
        method join() returns string
        method pop() 
        method push() 
        method concat() 
        method reverse() 
        method shift() 
        method unshift() 
        method slice() returns array
        method splice() 
        method sort() 
        method filter() 
        method forEach() 
        method some() 
        method every() 
        method map() 
        method indexOf() 
        method lastIndexOf() 
        method reduce() 
        method reduceRight() 
        method entries() 
        method values() 
        method keys() 
        method find() 
        method findIndex() 
    
    append to namespace Array
        method isArray() 

### Append to class String 
        
        properties
            length:number
        
        method valueOf() 
        method charAt() 
        method charCodeAt() 
        method concat() 
        method indexOf() 
        method lastIndexOf() 
        method localeCompare() 
        method match() 
        //method normalize() 
        method replace() 
        method search() 
        method slice() returns string
        method split() returns array of string
        method substring() 
        method substr() 
        method toLowerCase() 
        method toLocaleLowerCase() 
        method toUpperCase() 
        method toLocaleUpperCase() 
        method trim() 
        //method trimLeft() 
        //method trimRight() 
        method link() 
        method anchor() 
        method fontcolor() 
        method fontsize() 
        method big() 
        method blink() 
        method bold() 
        method fixed() 
        method italics() 
        method small() 
        method strike() 
        method sub() 
        method sup() 
        method repeat() 
        method startsWith() 
        method endsWith() 
        method contains() 

    append to namespace String
        method fromCharCode()

### Append to class Number
        
        method toLocaleString() 
        method valueOf() 
        method toFixed() 
        method toExponential() 
        method toPrecision() 
    
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
        method parseInt() 
        method parseFloat() 


## Classes declared here

### public class Error extends Object
        properties
            name, message,stack

    append to namespace Error
        properties
            stackTraceLimit:number

        method captureStackTrace() 


### public class Date extends Object
        
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
        method setTime() 
        method setMilliseconds() 
        method setUTCMilliseconds() 
        method setSeconds() 
        method setUTCSeconds() 
        method setMinutes() 
        method setUTCMinutes() 
        method setHours() 
        method setUTCHours() 
        method setDate() 
        method setUTCDate() 
        method setMonth() 
        method setUTCMonth() 
        method setFullYear() 
        method setUTCFullYear() 
        method toGMTString() 
        method toUTCString() 
        method getYear() 
        method setYear() 
        method toISOString() 
        method toJSON() 
    
    append to namespace Date
        method UTC() 
        method parse() 
        method now() 

### public class RegExp

        properties
            source:string
            global:boolean
            ignoreCase:boolean
            multiline:boolean
            lastIndex:number
        
        method exec() 
        method test() 
        method toString() 
        method compile() 
    
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

    
### public namespace JSON
        method parse() 
        method stringify()     

### public namespace Math
        properties
            E:number
            PI:number
        
        method random() 
        method abs() 
        method acos() 
        method asin() 
        method atan() 
        method ceil() 
        method cos() 
        method exp() 
        method floor() 
        method log() 
        method round() 
        method sin() 
        method sqrt() 
        method tan() 
        method atan2() 
        method pow() 
        method max() 
        method min() 
        method imul() 
        method sign() 
        method trunc() 
        method sinh() 
        method cosh() 
        method tanh() 
        method asinh() 
        method acosh() 
        method atanh() 
        method log10() 
        method log2() 
        method hypot() 
        method fround() 
        method clz32() 
        method cbrt() 
        method log1p() 
        method expm1() 

### global functions

    function setTimeout
    function clearTimeout
    function setInterval
    function clearInterval
    function eval

## Global Namespaces

### public namespace console

        method log
        method error
        method info
        method warn

        method group
        method groupEnd

        method time(key:string)
        method timeEnd(key:string)

not supported yet by liteC

        method count(label:string)        
        method dir(obj)

        method groupCollapsed

        method trace 


