
//Shim for Lite-C core support (used when target is JS)

//### namespace LiteCore
    var LiteCore={};

        //shim method getSymbol(name)
        if (!LiteCore.getSymbol)
        LiteCore.getSymbol = function(name){
            //return name
            return name;
        };
            // in js, every object property is accessed by 'name' (a string)
            // in LiteC, every object property is accessed by a "symbol" (a integer)

        //shim method getSymbolName(symbol)
        if (!LiteCore.getSymbolName)
        LiteCore.getSymbolName = function(symbol){
            //return symbol
            return symbol;
        };
            // in js, a symbol "name" is the same symbol (a symbol is already a string)
            // in LiteC, a symbol name is looked-up in the table _symbol[]


//## portability

//when compiling-to-c, Maps will be created (instead of objects) when passing 
//literal objects {} as function arguments.

//we add a "getProperty" method to access *BOTH* map keys *and* object properties.
//This allows to make portable to-js to-c code, by using:
//- hasOwnProperty
//- tryGetProperty
//- setProperty
//- getObjectKeys

//Map and Object implement this methods, so by using this methods
//you can write code that work when it receives a Map (compile-to-c) or a Object (compile-to-js)

//### Append to Class Object
    

        //shim method hasProperty(key:string) [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.hasProperty)
        Object.defineProperty(
        Object.prototype,'hasProperty',{value:function(key){ //use Map|Object interchangeably
            //return this has property key
            return key in this;
        }
        ,enumerable:false
        });

        //shim method tryGetMethod(methodSymbol) returns function [not enumerable] //portable code -to-js & -to-c
        if (!Object.prototype.tryGetMethod)
        Object.defineProperty(
        Object.prototype,'tryGetMethod',{value:function(methodSymbol){ //portable code -to-js & -to-c
            //return this[methodSymbol]
            return this[methodSymbol];
        }
        ,enumerable:false
        });

        //shim method tryGetProperty(key) [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.tryGetProperty)
        Object.defineProperty(
        Object.prototype,'tryGetProperty',{value:function(key){ //use Map|Object interchangeably
            //return this[key]            
            return this[key];
        }
        ,enumerable:false
        });

        //shim method setProperty(key:string, value) [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.setProperty)
        Object.defineProperty(
        Object.prototype,'setProperty',{value:function(key, value){ //use Map|Object interchangeably
            //this[key] = value
            this[key] = value;
        }
        ,enumerable:false
        });

        //shim method getObjectKeys() returns array [not enumerable] //use Map|Object interchangeably
        if (!Object.prototype.getObjectKeys)
        Object.defineProperty(
        Object.prototype,'getObjectKeys',{value:function(){ //use Map|Object interchangeably
            //return Object.keys(this)
            return Object.keys(this);
        }
        ,enumerable:false
        });

        //shim method getPropertyNameAtIndex(index:number) [not enumerable] //LiteC-compatible
        if (!Object.prototype.getPropertyNameAtIndex)
        Object.defineProperty(
        Object.prototype,'getPropertyNameAtIndex',{value:function(index){ //LiteC-compatible
            //return Object.keys(this)[index]
            return Object.keys(this)[index];
        }
        ,enumerable:false
        });

//### Append to Class Function #Function-Class for js
    

        //shim method newFromObject(model) //LiteC-compatible
        if (!Function.prototype.newFromObject)
        Function.prototype.newFromObject = function(model){ //LiteC-compatible
            //var newInstance = new this()
            var newInstance = new this();
            //for each property name,value in model
            var value=undefined;
            for ( var name in model)if (model.hasOwnProperty(name)){value=model[name];
                {
                //newInstance.setProperty name, value
                newInstance.setProperty(name, value);
                }
                
                }// end for each property
            //return newInstance
            return newInstance;
        };


//# JS array access 

//### Append to class Array 
    

        //shim method tryGet(index:Number) [not enumerable]
        if (!Array.prototype.tryGet)
        Object.defineProperty(
        Array.prototype,'tryGet',{value:function(index){
            //return this[index]
            return this[index];
        }
        ,enumerable:false
        });

        //shim method set(index:Number, value) [not enumerable]
        if (!Array.prototype.set)
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



//### append to namespace console
    

//Note: Today, Node.js "console" object do not have `group` & `groupEnd` methods
//neither some older browsers

        //properties indentLevel
        

        //shim method group() 
        if (!console.group)
        console.group = function(){
            //console.log.apply undefined,arguments
            console.log.apply(undefined, Array.prototype.slice.call(arguments));
            //console.indentLevel = console.indentLevel or 0 + 1
            console.indentLevel = console.indentLevel || 0 + 1;
        };

        //shim method groupEnd() 
        if (!console.groupEnd)
        console.groupEnd = function(){
            //if console.indentLevel 
            if (console.indentLevel) {
                //console.indentLevel--
                console.indentLevel--;
            };
        };


module.exports=LiteCore;
