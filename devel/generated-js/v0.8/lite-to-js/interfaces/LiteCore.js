//#Shim for Lite-C core support

//Import this file if you want to create LiteScript code
//that can be compiled-to-js and also compiled-to-c

//Most of the methods here are shims for Lite-C core methods.

//When compiled-to-js, this methods will be used,
//When compiled-to-c, native, fast methods from Lite-C core
//will be used. See file: "GlobalScopeC.interface.md"


    //namespace LiteCore
    var LiteCore={};

        //method getSymbol(name)
        LiteCore.getSymbol = function(name){
            //return name
            return name;
        };
            // in js, every object property is accessed by 'name' (a string)
            // in LiteC, every object property is accessed by a "symbol" (a integer)

        //method getSymbolName(symbol)
        LiteCore.getSymbolName = function(symbol){
            //return symbol
            return symbol;
        };
            // in js, a symbol "name" is the same symbol (a symbol is already a string)
            // in LiteC, a symbol name is looked-up in the table _symbol[]


//## portability: Objects used as Dictionaries

//when compiling-to-c, any Literal Object *{ ... }*
//will be coded as a new *Map*() instead of a *Object*.
//In Lite-C, the Object Class is the root of all classes,
//but has no properties, and you cannot add or remove
//properties from Object or any other class except "Map" and derivates.

//Also Maps will be created (instead of objects) when passing
//literal objects {...} as function arguments.

//We add here a "tryGetProperty" method to access *BOTH* map keys *and* object properties.
//This allows you to write portable Litescript-to-js and Litescript-to-c code, by using:

//- hasProperty       : js "in" operator. true if property in this object or super classes
//- tryGetProperty    : js normal property access, returns "undefined" on invalid key
//- getProperty       : controlled property access, *throws* if invalid key
//- setProperty       : js normal property set
//- allPropertyNames  : js Object.keys(objFoo)


//Both *Map* and *Object* implement this methods, so by using this methods
//you can write code that will work when it receives
//a Map (compile-to-c) or a Object (compile-to-js)


    //    append to class Object
    

        //shim method hasProperty(key:string) [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.hasOwnProperty.call(Object.prototype,'hasProperty'))
        Object.defineProperty(
        Object.prototype,'hasProperty',{value:function(key){
            //return this has property key
            return key in this;
        }
        ,enumerable:false
        });

        //shim method tryGetProperty(key) [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.hasOwnProperty.call(Object.prototype,'tryGetProperty'))
        Object.defineProperty(
        Object.prototype,'tryGetProperty',{value:function(key){
            //return this[key]
            return this[key];
        }
        ,enumerable:false
        });

        //shim method getProperty(key) [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.hasOwnProperty.call(Object.prototype,'getProperty'))
        Object.defineProperty(
        Object.prototype,'getProperty',{value:function(key){
            //if this hasnt property key, fail with "invalid property: #{key}"
            if (!(key in this)) {throw new Error("invalid property: " + key)};
            //return this[key]
            return this[key];
        }
        ,enumerable:false
        });

        //shim method setProperty(key:string, value) [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.hasOwnProperty.call(Object.prototype,'setProperty'))
        Object.defineProperty(
        Object.prototype,'setProperty',{value:function(key, value){
            //this[key] = value
            this[key] = value;
        }
        ,enumerable:false
        });

//portable code -to-js & -to-c

        //shim method tryGetMethod(methodSymbol) returns function [not enumerable]
        if (!Object.prototype.hasOwnProperty.call(Object.prototype,'tryGetMethod'))
        Object.defineProperty(
        Object.prototype,'tryGetMethod',{value:function(methodSymbol){
            //return this[methodSymbol]
            return this[methodSymbol];
        }
        ,enumerable:false
        });

        //shim method allPropertyNames() returns array [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.hasOwnProperty.call(Object.prototype,'allPropertyNames'))
        Object.defineProperty(
        Object.prototype,'allPropertyNames',{value:function(){
            //var result=[]
            var result = [];
            //for each property prop in this
            var prop=undefined;
            for ( var _inx1 in this){prop=this[_inx1];
                {
                //result.push prop
                result.push(prop);
                }
                
                }// end for each property
            //return result
            return result;
        }
        ,enumerable:false
        });

        //shim method getPropertyNameAtIndex(index:number) [not enumerable] //LiteC-compatible
        if (!Object.prototype.hasOwnProperty.call(Object.prototype,'getPropertyNameAtIndex'))
        Object.defineProperty(
        Object.prototype,'getPropertyNameAtIndex',{value:function(index){
            //for each property prop in this
            var prop=undefined;
            for ( var _inx2 in this){prop=this[_inx2];
                {
                //if index is 0, return prop
                if (index === 0) {return prop};
                //index--
                index--;
                }
                
                }// end for each property
            
        }
        ,enumerable:false
        });

//In JS the global environment (global|window) is a *Object*, and as such it
//*has* Object.prototype in its prototype chain, which means
//*all properties in Object.prototype are also in the global scope*

//**To avoid ramifications of this (quirky) behavior, you should be very careful
//altering Object.prototype. e.g.: all the methods declared above are now
//part of the global scope.


    //    append to class Function #Function-Class - "Class" in LiteC
    

        //shim method newFromObject(model) [not enumerable] //LiteC-compatible
        if (!Object.prototype.hasOwnProperty.call(Function.prototype,'newFromObject'))
        Object.defineProperty(
        Function.prototype,'newFromObject',{value:function(model){
            //var newInstance = new this()
            var newInstance = new this();
            //for each own property name,value in model
            var value=undefined;
            for ( var name in model)if (model.hasOwnProperty(name)){value=model[name];
                {
                //newInstance.setProperty name, value
                newInstance.setProperty(name, value);
                }
                
                }// end for each property
            //return newInstance
            return newInstance;
        }
        ,enumerable:false
        });


//# JS array access

    //    append to class Array
    

        //shim method tryGet(index:Number) [not enumerable]
        if (!Object.prototype.hasOwnProperty.call(Array.prototype,'tryGet'))
        Object.defineProperty(
        Array.prototype,'tryGet',{value:function(index){
            //return this[index]
            return this[index];
        }
        ,enumerable:false
        });

        //shim method set(index:Number, value) [not enumerable]
        if (!Object.prototype.hasOwnProperty.call(Array.prototype,'set'))
        Object.defineProperty(
        Array.prototype,'set',{value:function(index, value){
            //this[index]=value
            this[index] = value;
            //return value
            return value;
        }
        ,enumerable:false
        });


//## set array item value

//js also allows you to do:
 //`var a = []`
 //`a[100]='foo'`

//and after that the js "array" will have only one element, index:100 value:'foo',
//but length will be 101

//LiteC arrays do not behave like that, if you do:
    //`var a = []`
    //`a[100]='foo'` => EXCEPTION: OUT OF BOUNDS

//you'll get an "OUT OF BOUNDS" exception. You cannot use [] set value for an
//array item out of current bounds.

//In order to get such behavior, you'll have to use `Array.set(index,value)`


//## get array item value

//LiteC arrays will also give an "OUT OF BOUNDS" exception, when accessing an unexisting array item.

//*Sometimes* is useful to get "undefined" when accessing a "out of bounds" array index.
//In order to get such behavior, you'll have to use `Array.tryGet(index)`

//js:
 //`var a = []`
 //`console.log(a[100]);` => OK, undefined

//LiteC:
 //`var a = []`
 //`console.log(a[100]);` => EXCEPTION: OUT OF BOUNDS
 //`console.log(a.tryGet(100));` => OK, undefined


    //    append to class String
    

//*
//        * String_byteSubstr(byteStartIndex:number, charCount:number)
//        * similar to String_substr, but start position
//        * is the start index *in bytes* -not codepoints-
//        * from the beginning of the string.
//        *
//        * Since internal representation is UTF-8, this method is faster than Substr
//        * for large strings and large values of "start"
//        *
//        * Note: "count" is still in measuerd in *codepoints*, only *start* is measured in bytes
//        
        //method byteSubstr(byteStartIndex:number, charCount:number)
        String.prototype.byteSubstr = function(byteStartIndex, charCount){
            //return this.substr(byteStartIndex,charCount)
            return this.substr(byteStartIndex, charCount);
        };

//* String_byteIndexOf(searched:string, fromByteIndex:number)
//        * similar to String_indexOf, but start position
//        * is the start index *in bytes* -not codepoints-
//        * from the beginning of the string.
//        *
//        * @returns: *BYTE* index of the found string, or -1
//        
        //method byteIndexOf(searched:string, fromByteIndex:number)
        String.prototype.byteIndexOf = function(searched, fromByteIndex){
            //return this.indexOf(searched,fromByteIndex)
            return this.indexOf(searched, fromByteIndex);
        };

        //method byteSlice(startByteIndex,endByteIndex)
        String.prototype.byteSlice = function(startByteIndex, endByteIndex){
            //return this.slice(startByteIndex,endByteIndex)
            return this.slice(startByteIndex, endByteIndex);
        };
module.exports=LiteCore;
