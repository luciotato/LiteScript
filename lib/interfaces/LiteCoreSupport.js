
//Shim for Lite-C core support (used when target is JS)

    //shim global namespace LiteCore
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
    //global class
    GLOBAL.LiteCore=LiteCore;
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



//##Map

//Use this class instead of js built-in objects, when you're
//using the js built-in Object as a "dictionary" or "map string to object"
//and you want to be able to compile the code to C 

//You can declare a Map *Literally" using the keyword `map`.

//Examples: /*

//#### Standard JS Literal Object

//LiteScript:

    //var foo = 
        //a: 1
        //b: "text"
        //c: new MyClass

    //var baz = foo.b

//=> js:

    //var foo = {a: 1, b: "text", c: new MyClass()};
    //var baz = foo.b;

//=> C:
    //***Not translatable to C***

//#### Litescript Literal Map

//LiteScript:

    //var foo = map
        //a: 1
        //b: "text"
        //c: new MyClass

    //var baz = foo.get("b")

//=> js:

    //var foo = new Map().fromObject( {a: 1, b: "text", c: new MyClass()} );
    //var baz = foo.get("b");

//=> Lite-C

    //#define _NV(n,v) {&NameValuePair_CLASSINFO, &(NameValuePair_s){n,v}

    //var foo = new(Map,3,(any_arr){
                    //_NV(any_LTR("a"),any_number(1)),
                    //_NV(any_LTR("b"),any_LTR("text"))
                    //_NV(any_LTR("c"),new(MyClass,0,NULL))
        //});

    //var baz = CALL1(get_,foo,any_LTR("b"))

//*/

//As you can see, the required changes are:
//a) add the keyword "map" after "var foo ="
//b) use `map.get(key)` and `map.set(key,value)` instead of `object[key]` and `object[key]=value`


    //shim global class Map
    // constructor
    function Map(){

//shim global: Declare Map as a glboal Object, unless it is already in the global scope

        //properties
            //dict:Object
            //size

        //constructor new Map
            //.clear
            this.clear();
        };
    //global class
    GLOBAL.Map=Map;

        //method clear()
        Map.prototype.clear = function(){
            //.dict= new Object
            this.dict = new Object();
            //.size=0
            this.size = 0;
        };

//we have a special "Map.fromObject()"
//used to create a Map from a Literal Object. 
//To keep compatibility with ES6, we can't use default Map constructor, 
//since ES6 Map constructor is: new Map([iterator])

        //method fromObject(object)
        Map.prototype.fromObject = function(object){
            //.dict = object
            this.dict = object;
            //.size = Object.keys(.dict).length
            this.size = Object.keys(this.dict).length;
            //return this
            return this;
        };

        //method set(key:string, value)
        Map.prototype.set = function(key, value){
            //if no .dict.hasOwnProperty(key), .size++
            if (!this.dict.hasOwnProperty(key)) {this.size++};
            //.dict[key]=value
            this.dict[key] = value;
        };

        //method setProperty(name:string, value) //use Map|Object interchangeably
        Map.prototype.setProperty = function(name, value){ //use Map|Object interchangeably
            //.dict[name] = value
            this.dict[name] = value;
        };

        //method delete(key:string)
        Map.prototype.delete = function(key){
            //if .dict.hasOwnProperty(key), .size--
            if (this.dict.hasOwnProperty(key)) {this.size--};
            //delete .dict[key]
            delete this.dict[key];
        };

        //method get(key:string)
        Map.prototype.get = function(key){
            //return .dict[key]
            return this.dict[key];
        };

        //method tryGetProperty(key:string) //use Map|Object interchangeably
        Map.prototype.tryGetProperty = function(key){ //use Map|Object interchangeably
            //return .dict[key]
            return this.dict[key];
        };

        //method has(key:string)
        Map.prototype.has = function(key){
            //return .dict has property key
            return key in this.dict;
        };

        //method hasProperty(key:string) //use Map|Object interchangeably
        Map.prototype.hasProperty = function(key){ //use Map|Object interchangeably
            //return .dict has property key
            return key in this.dict;
        };

        //method hasOwnProperty(key:string) //use Map|Object interchangeably
        Map.prototype.hasOwnProperty = function(key){ //use Map|Object interchangeably
            //return .dict has property key
            return key in this.dict;
        };

        //method keys() returns array
        Map.prototype.keys = function(){
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        };

        //method getObjectKeys() returns array  //use Map|Object interchangeably
        Map.prototype.getObjectKeys = function(){ //use Map|Object interchangeably
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        };

        //method forEach(callb)
        Map.prototype.forEach = function(callb){
            //for each property propName,value in .dict
            var value=undefined;
            for ( var propName in this.dict)if (this.dict.hasOwnProperty(propName)){value=this.dict[propName];
                {
                //callb(propName,value)
                callb(propName, value);
                }
                
                }// end for each property
            
        };

        //method toString()
        Map.prototype.toString = function(){
            //return JSON.stringify(.dict)
            return JSON.stringify(this.dict);
        };
    // end class Map


//### Append to Class Function #Function-Class - "Class" in LiteC
    

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



//#Iterable

//### LiteScript Iterable implementation without generators

//##Comparision

//### Actual ES6 Implementation

//ES6 implements iterables by using generators. You have several concepts:

//a) The "Iterable" *interface* consisting of a method "@@iterator()" 
//returning a function which in turns returns a object 
//which supports the "iterator" interface. 
//(ES6 core classes @@iterator() returns a *generator*)

//b) The "Iterator" *interface* consisting of a method "next" returning the next object in the sequence. 
//(*generators* support the *Iterator* interface, they have a method "next()")

//So basically generators API is designed to conform the *Iterable* and *Iterator* interfaces.

//#### To make your own class *iterable* in ES6 you need to:

//a) add a method to YourClass which returns a object with a method next(). So you will need to:

//a.1) create *another* class, YourClassIterator with a method next(). Store internal state inside
//YourClassIterable or make method next() a generator. 
//method next() should return a *object* with two properties {done:false,value:[next object in sequence]}

//a.2) add a method @@iterator to YourClass, returning new YourClassIterator()


//### LiteScript Implementation

//LiteScript simplifies iterable to a core class *IterablePos* (a generic "cursor") 
//and a single interface *iterable*

//a) The *IterablePos* core class, is a simple object with no methods, 
    //abstracting the position inside a iterable sequence.

    //shim global class IterablePos
    // constructor
    function IterablePos(){ // default constructor
        //properties 
            //name, value 
            //index = -1
            //size 
            //extra 
            this.index=-1;
    };
    //global class
    GLOBAL.IterablePos=IterablePos;
    
    // end class IterablePos

//b) The *Iterable* "interface" consisting of a method "iterableNext(pos:IterablePos)", advancing
//"pos" to the next item in the sequence and returning false if there is no more items.

//### To make your own class *iterable* in LiteScript you need to:

//a) add to YourClass a `method iterableNext(pos:IterablePos)` returning false if there is no more items.

//b) nothing more. just a)    

//### core classes *iterable* interface implementation in LiteScript

    //append to class Array
    

        //method iterableNext(iter:IterablePos)
        Array.prototype.iterableNext = function(iter){

            //var inx = iter.index
            var inx = iter.index;

            //if inx is -1 //initialization
            if (inx === -1) { //initialization
                //iter.size = this.length
                iter.size = this.length;
            };

            //if ++inx >= iter.size, return false
            if (++inx >= iter.size) {return false};

            //iter.name  = inx
            iter.name = inx;
            //iter.value = this[inx]
            iter.value = this[inx];

            //iter.index = inx
            iter.index = inx;
            //return true
            return true;
        };


    //append to class Object
    

        //method iterableNext(iter:IterablePos)
        Object.prototype.iterableNext = function(iter){

            //var inx = iter.index
            var inx = iter.index;

            //if inx is -1 //initialization
            if (inx === -1) { //initialization
                //iter.extra = Object.keys(this)
                iter.extra = Object.keys(this);
                //declare iter.extra:array
                
                //iter.size = iter.extra.length
                iter.size = iter.extra.length;
            };

            //if ++inx >= iter.size, return false
            if (++inx >= iter.size) {return false};

            //iter.name  = iter.extra[inx] //property name
            iter.name = iter.extra[inx]; //property name
            //iter.value = this.tryGetProperty(iter.name) //property value
            iter.value = this.tryGetProperty(iter.name); //property value

            //iter.index = inx
            iter.index = inx;
            //return true
            return true;
        };


    //append to class String
    
        //method iterableNext(iter:IterablePos) 
        String.prototype.iterableNext = function(iter){

            //var inx = iter.index
            var inx = iter.index;

            //if inx is -1 //initialization
            if (inx === -1) { //initialization
                //iter.size = this.length
                iter.size = this.length;
            };

            //if ++inx >= iter.size, return false
            if (++inx >= iter.size) {return false};

            //iter.name  = inx
            iter.name = inx;
            //iter.value = this.substr(inx,1)
            iter.value = this.substr(inx, 1);

            //iter.index = inx
            iter.index = inx;
            //return true
            return true;
        };

//Note: On LiteC-core (when compiling-to-c LiteScript source),
//the internal representation of strings is UTF-8.

//String.iterableNext keeps: 
//- *byte* index at IterablePos.index
//- *codepoint* index at IterablePos.name

//So to make portable code use *IterablePos.name* as *codepoint* index
//and consider that:
//IterablePos.name, *codepoint index* can be < IterablePos.index *byte index*
//if the string contains multibyte UTF-8 codes.


    //append to class Map
    
        //method iterableNext(iter:IterablePos) 
        Map.prototype.iterableNext = function(iter){

//Map is implemented with an internal js-Object used as dictionary

            //return .dict.iterableNext(iter)
            return this.dict.iterableNext(iter);
        };


//###Notes on IterablePos

//*IterablePos* also imlements the NameValuePair model/interface.

//The "extra" property type and content, depends on each class implementing
//the *Iterable* interface. Should be used to store the state required
//to perform a fast `iteratorNext()`


//##Console group

//### append to namespace console
    

//Note: Today, Node.js "console" object do not have `group` & `groupEnd` methods
//neither do older browsers

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



