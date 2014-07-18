# Lite-C Engine global environment declarations

The compiler pre-creates some core objects, to allow declaration of property and return types

global vars pre-created are:
  undefined, null, true, false, NaN

global Classes pre-created are:
  Object, Function, Array, String, Number, Boolean

### Namespace LiteCore

        method getSymbol(name:string) returns number
        method getSymbolName(symbol:number) returns number

## classes declared in the compiler 

### Append to class Function

        properties name

        //method bind
        method call
        method apply

### Append to Class Object

        properties
            constructor: Function

        method toString() returns string

        method tryGetMethod(methodSymbol) returns function // or undefined

        method tryGetProperty(propSymbol) returns any // or undefined
        method getProperty(propSymbol) returns any // or throws
        method getPropertyName(propIndex) returns string // or throws
        
### Append to class Array 
        properties
            length:number
        
        method tryGet(index:number)

        //method toLocaleString() 
        method join() returns string
        method pop() 
        method push() 
        method concat() 
        //method reverse() 
        method shift() 
        method unshift() 
        method slice() 
        method splice() 
        //method sort() 
        //method filter() 
        //method forEach() 
        //method some() 
        //method every() 
        //method map() 
        method indexOf() 
        method lastIndexOf() 
        //method reduce() 
        //method reduceRight() 
        //method entries() 
        method values() 
        method keys() 
        //method find() 
        //method findIndex() 
    
### Append to class String 
        
        properties
            length:number
        
        //method valueOf() 
        method charAt() returns string
        //method charCodeAt() 
        method concat() returns string
        method indexOf() 
        method lastIndexOf() 
        //method localeCompare() 
        //method match() 
        //method normalize() 
        method replace() returns string
        //method search() 

        method replaceAll(search,replaceby) //like .replace //g
        
        method slice() returns string
        method split(separator:string,limit) returns array of string

        //method substring() 
        method substr() 
        method toLowerCase() returns string
        //method toLocaleLowerCase() 
        method toUpperCase() returns string
        //method toLocaleUpperCase() 
        method trim() returns string
        //method trimLeft() 
        //method trimRight() 

        /*method link() 
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
        */

        //method startsWith() 
        //method endsWith() 

        //method contains() 

/*
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
*/


### append to Class Date
        
        method toDateString() 
        method toTimeString() 
        method toUTCString() 
        method toISOString() 
        /*method toLocaleString() 
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
        method getYear() 
        method setYear() 
        method toJSON() 
        */
    
    /*append to namespace Date
        method UTC() 
        method parse() 
        method now() 
    */
*/

## Classes declared here (not in compiler code)

### public class Error extends Object
        properties
            name, message
            stack
            code

    //append to namespace Error
    //    properties
    //        stackTraceLimit:number
    //
    //    method captureStackTrace() 


### public class Map

        properties
            size

        method clear()

To keep compatibility with ES6, we have a special "Map.fromObject()"
used to create a Map from a Literal Object. 
We can't use default Map constructor, since ES6 Map constructor is: new Map([iterator])

        method fromObject(object)

        method set(key:string, value)
        method delete(key:string)
        method get(key:string)
        method has(key:string)
        method keys() returns array
        method forEach(callb)
        method toString()



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

/*    
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

*/    
### public namespace JSON
        //method parse() 
        method stringify()     

/*
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
*/

## global Functions

    /* 
    function setTimeout
    function clearTimeout
    function setInterval
    function clearInterval
    */

## Global Namespaces

### public namespace console

        method log
        method error
        method debug
        
        method group
        method groupEnd

        method time(key:string)
        method timeEnd(key:string)

### public namespace process

        properties
            argv: array of string

        method cwd returns string //current working directory

        method exit(exitCode:number)


