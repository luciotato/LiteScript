# Lite-C Engine global environment declarations

The compiler pre-creates some core objects, to allow declaration of property and return types

global pre-created vars are:
  undefined, null, true, false, NaN

global pre-created Classes are:
  Object, Function, Array, String, Number, Boolean

### Namespace LiteCore

        properties
            version,buildDate

        method getSymbol(name:string) returns number
        method getSymbolName(symbol) returns string


## Append properties & methods to classes declared in the compiler 

### Append to class Function

        properties name

        //method bind
        method call
        method apply

        method newFromObject(model) // LiteC-compatible form to allow Object literal instance initialization

### Append to Class Object

        properties
            constructor: Function

        method toString() returns string
        method hasOwnProperty(name) returns boolean 

#### portability

## portability: Objects used as Dictionaries

when compiling-to-c, any Literal Object *{ ... }*
will be coded as a new *Map*() instead of a *Object*.
In Lite-C, the Object Class is the root of all classes, 
but has no properties, and you cannot add or remove
properties from Object or any other class except "Map" and derivates.

Also Maps will be created (instead of objects) when passing 
literal objects {...} as function arguments.

We add here a "tryGetProperty" method to access *BOTH* map keys *and* object properties.
This allows you to write portable Litescript-to-js and Litescript-to-c code, by using:

- hasProperty       : js => "in" operator. true if property in this object or in proto chain
- tryGetProperty    : js => normal property access, returns "undefined" on invalid key 
- getProperty       : controlled property access, *throws* if invalid key
- setProperty       : js => normal property set
- allPropertyNames  : js =>  a=[];for(p in obj)a.push(p); return a //all props in proto chain

Both *Map* and *Object* implement this methods, so by using this methods
you can write code that will work when it receives 
a Map (compile-to-c) or a Object (compile-to-js)

        method hasProperty(key:string) returns boolean [not enumerable]  //use Map|Object interchangeably

        method tryGetProperty(key) [not enumerable] //use Map|Object interchangeably
                                                    // do not throws, returns any or undefined

        method getProperty(propSymbol) returns any // or throws

        method setProperty(key:string, value) //use Map|Object interchangeably

        method allPropertyNames() returns array //use Map|Object interchangeably


Object as *Iterable*

        method iterableNext(iter:Position) returns boolean

Other Object methods - LiteC specific

        method tryGetMethod(methodSymbol) returns function // or undefined

        method getPropertyName(propIndex) returns string // or throws
        method getPropertyNameAtIndex(index:number) //LiteC-compatible


## Iterable.Position as supported by core (see also: Iterable.lite.md)

### Namespace Iterable
    
        class Position
            properties 
                key, value 
                index // (=-1 set at constructor new Iterable.Position(iterable)
                size 
                iterable // iterable object
                extra 

            constructor new Position(iterable)

            method next()
            

### Append to class Array 

        properties
            length:number
        
        //method toLocaleString() 
        method join returns string
        method pop()
        method push 
        method concat returns array
        //method reverse() 
        method shift()
        method unshift
        method slice returns array
        method splice returns array
        method sort 
        //method filter() 
        //method forEach() 
        //method some() 
        //method every() 
        //method map() 
        method indexOf(needle,startIndex=undefined) 
        method lastIndexOf(needle,startIndex=undefined) 
        //method reduce() 
        //method reduceRight() 
        //method entries() 
        method values() returns array
        method keys() returns array
        //method find() 
        //method findIndex() 

new methods not in js
    
        method clear
        method tryGetProperty(index:number)
        method set(index:number, value)
        method tryGet(index:Number) 

*Iterable* interface

        method iterableNext(iter:Position) returns boolean


## JS array item access 

#### set array item value

js allows you to do: 
 `var a = []`
 `a[100]='foo'`

and after that the js "array" will have only one element, index:100 value:'foo',
but length will be 101

LiteC arrays do not behave like that, if you do:
    `var a = []`
    `a[100]='foo'` => EXCEPTION: OUT OF BOUNDS

you'll get an "OUT OF BOUNDS" exception. You cannot set value for an
array item out of current bounds.

#### get array item value

LiteC arrays will also give an "OUT OF BOUNDS" exception, when accessing an unexisting array item.

*Sometimes* is useful to get "undefined" when accessing a "out of bounds" array index.
In order to get such behavior, you'll have to use `Array.tryGet(index)`

js: 
 `var a = []`
 `console.log(a[100]);` => OK, undefined

LiteC:
 `var a = []`
 `console.log(a[100]);` => EXCEPTION: OUT OF BOUNDS
 `console.log(a.tryGet(100));` => OK, undefined


### Append to namespace Array

        method isArray(x) // in js "x instanceof Array" do not work for all cases
                          // in LiteC-core, this is equivalent to _instanceof(x,Array)


### Append to class String 
        
        properties
            length:number
        
        //method valueOf() 
        method charAt() returns string
        method charCodeAt() 
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

        method countSpaces returns number

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
        */
        method repeat() 

        //method startsWith() 
        //method endsWith() 

        //method contains() 

*Iterable* interface

        method iterableNext(iter:Position) returns boolean

        /**
        * String_byteSubstr(byteStartIndex:number, charCount:number)
        * similar to String_substr, but start position
        * is the start index *in bytes* -not codepoints-
        * from the beginning of the string.
        *
        * Since internal representation is UTF-8, this method is faster than Substr
        * for large strings and large values of "start"
        *
        * Note: "count" is still in measuerd in *codepoints*, only *start* is measured in bytes
        */
        method byteSubstr(byteStartIndex:number, charCount:number) 

        /** String_byteIndexOf(searched:string, fromByteIndex:number) 
        * similar to String_indexOf, but start position
        * is the start index *in bytes* -not codepoints-
        * from the beginning of the string.
        *
        * @returns: *BYTE* index of the found string, or -1
        */
        method byteIndexOf(searched:string, fromByteIndex:number)

        method byteSlice(startByteIndex,endByteIndex)
        
### Append to namespace String 

        method spaces(howMany) returns string 
        method fromCharCode() returns string


/*
### Append to class Number
        
        method toLocaleString() 
        method valueOf() 
        method toFixed() 
        method toExponential() 
        method toPrecision() 

*/    
    append to namespace Number

/*        properties
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
        method isSafeInteger() 
        method parseInt() 
        method parseFloat() 
*/
        method isNaN() 


### public Class Date 
        
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

*Iterable* interface

        method iterableNext(iter:Position) returns boolean


### public class RegExp

/*
        properties
            source:string
            global:boolean
            ignoreCase:boolean
            multiline:boolean
            lastIndex:number
        
*/
        //method exec() 
        //method test() 
        method toString() 
        //method compile() 

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
        method info
        method warn

        method group
        method groupEnd

        method time(key:string)
        method timeEnd(key:string)

only in liteC

        method debug 

not supported yet by liteC

        //method count(label:string)        
        //method dir(obj)

        //method groupCollapsed

        //method trace 


node.js compatible 
-------------------

### public class Buffer

API compatible with nodejs Buffers

        properties  
            length

        method toString()

        method copy(dest:Buffer)

        method write(text:string, offset)
        
        method append(text:string)

    append to namespace Buffer

        method byteLength(s:string)

### public namespace process

        properties
            argv: array of string

        method cwd returns string //current working directory

        method exit(exitCode:number)


#PMREX, poor's man RegEx - native implemented at core -

### public namespace PMREX

#### method whileRanges(chunk:string, rangesStr:string) returns string

whileRanges, advance from start, while the char is in the ranges specified. 
will return index of first char not in range, or searched string length all chars in range
e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"
e.g.: whileRanges("123ABC",0,"0-9A-Z") will return 6, string length because all chars are in range

#### method untilRanges(chunk:string, rangesStr:string) returns string

findRanges: advance from start, *until* a char in one of the specified ranges is found.
will return index of first char *in range* or searched string length if no match
e.g.: findRanges("123ABC",0,"A-Z") will return 3, string[3] is "A"
e.g.: findRanges("123ABC",0,"D-Z") will return 6 => length of "123ABC" => not found

#### helper method parseRanges(rangesStr:string) returns string

helper internal method

#### method whileUnescaped(chunk:string,endChar) returns string

#### method quotedContent(chunk:string) returns string

Note: chunk[0] MUST be the openinig quote


