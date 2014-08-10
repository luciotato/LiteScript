
#Shim for Lite-C core support 

Import this file if you want to create LiteScript code 
that can be compiled-to-js and also compiled-to-c

Most of the methods here are shims for Lite-C core methods.

When compiled-to-js, this methods will be used,
When compiled-to-c, native, fast methods from Lite-C core 
will be used. See file: "GlobalScopeC.interface.md"


    namespace LiteCore

        method getSymbol(name)
            return name
            // in js, every object property is accessed by 'name' (a string)
            // in LiteC, every object property is accessed by a "symbol" (a integer)

        method getSymbolName(symbol)
            return symbol
            // in js, a symbol "name" is the same symbol (a symbol is already a string)
            // in LiteC, a symbol name is looked-up in the table _symbol[]


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

- hasProperty       : js "in" operator. true if property in this object or super classes
- tryGetProperty    : js normal property access, returns "undefined" on invalid key 
- getProperty       : controlled property access, *throws* if invalid key
- setProperty       : js normal property set
- allPropertyNames  : js Object.keys(objFoo)


Both *Map* and *Object* implement this methods, so by using this methods
you can write code that will work when it receives 
a Map (compile-to-c) or a Object (compile-to-js)


### Append to Class Object

        shim method hasProperty(key:string) [not enumerable] //use Map|Object interchangeably
            return this has property key

        shim method tryGetProperty(key) [not enumerable] //use Map|Object interchangeably
            return this[key]            

        shim method getProperty(key) [not enumerable] //use Map|Object interchangeably
            if this hasnt property key, fail with "invalid property: #{key}"
            return this[key]            

        shim method setProperty(key:string, value) [not enumerable] //use Map|Object interchangeably
            this[key] = value

portable code -to-js & -to-c

        shim method tryGetMethod(methodSymbol) returns function [not enumerable] 
            return this[methodSymbol]

        shim method allPropertyNames() returns array [not enumerable] //use Map|Object interchangeably
            var result=[]
            for each property prop in this
                result.push prop
            return result

        shim method getPropertyNameAtIndex(index:number) [not enumerable] //LiteC-compatible
            for each property prop in this
                if index is 0, return prop
                index--

In JS the global environment (global|window) is a *Object*, and as such it 
*has* Object.prototype in its prototype chain, which means 
*all properties in Object.prototype are also in the global scope*

**To avoid ramifications of this (quirky) behavior, you should be very careful 
altering Object.prototype. e.g.: all the methods declared above are now
part of the global scope.


### Append to Class Function #Function-Class - "Class" in LiteC

        shim method newFromObject(model) [not enumerable] //LiteC-compatible
            var newInstance = new this()
            for each own property name,value in model
                newInstance.setProperty name, value
            return newInstance


# JS array access 

### Append to class Array 

        shim method tryGet(index:Number) [not enumerable]
            return this[index]

        shim method set(index:Number, value) [not enumerable]
            this[index]=value
            return value


## set array item value

js also allows you to do: 
 `var a = []`
 `a[100]='foo'`

and after that the js "array" will have only one element, index:100 value:'foo',
but length will be 101

LiteC arrays do not behave like that, if you do:
    `var a = []`
    `a[100]='foo'` => EXCEPTION: OUT OF BOUNDS

you'll get an "OUT OF BOUNDS" exception. You cannot use [] set value for an
array item out of current bounds.

In order to get such behavior, you'll have to use `Array.set(index,value)`


## get array item value

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


### Append to Class String

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
            return this.substr(byteStartIndex,charCount)

        /** String_byteIndexOf(searched:string, fromByteIndex:number) 
        * similar to String_indexOf, but start position
        * is the start index *in bytes* -not codepoints-
        * from the beginning of the string.
        *
        * @returns: *BYTE* index of the found string, or -1
        */
        method byteIndexOf(searched:string, fromByteIndex:number)
            return this.indexOf(searched,fromByteIndex)

        method byteSlice(startByteIndex,endByteIndex)
            return this.slice(startByteIndex,endByteIndex)

