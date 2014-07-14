//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/lib/Map.lite.md
// Map:

// Use this class instead of js built-in objects, when you're
// using the js built-in Object as a "dictionary" or "map string to object"
// and you want to be able to compile the code to C

// You can declare a Map *Literally" using the keyword `map`.

// Examples:
// #### Standard JS Literal Object
// LiteScript:
//     var foo =
//         a: 1
//         b: "text"
//         c: new MyClass
//     var baz = foo.b
// => js:
//     var foo = {a: 1, b: "text", c: new MyClass()};
//     var baz = foo.b;
// => C:
//     ***Not translatable to C***
// #### Litescript Literal Map
// LiteScript:
//     var foo = map
//         a: 1
//         b: "text"
//         c: new MyClass
//     var baz = foo.get("b")
// => js:
//     var foo = new Map().fromObject( {a: 1, b: "text", c: new MyClass()} );
//     var baz = foo.get("b");
// => Lite-C
//     #define _NV(n,v) {&NameValuePair_CLASSINFO, &(NameValuePair_s){n,v}
//     var foo = new(Map,3,(any_arr){
//                     _NV(any_str("a"),any_number(1)),
//                     _NV(any_str("b"),any_str("text"))
//                     _NV(any_str("c"),new(MyClass,0,NULL))
//         });
//     var baz = CALL1(get_,foo,any_str("b"))

// As you can see, the required changes are:
// a) add the keyword "map" after "var foo ="
// b) use `map.get(key)` and `map.set(key,value)` instead of `object[key]` and `object[key]=value`


   // class Map
   // constructor
       function Map(){
        // properties
            // dict:Object
            // size
           this.clear();
       };

       Map.prototype.clear = function(){
           this.dict = new Object();
           this.size = 0;
       };

// To keep compatibility with ES6, we have a special "Map.fromObject()"
// used to create a Map from a Literal Object.
// We can't use default Map constructor, since ES6 Map constructor is: new Map([iterator])

       // method fromObject(object)
       Map.prototype.fromObject = function(object){
           this.dict = object;
           this.size = Object.keys(this.dict).length;
           return this;
       };

       // method set(key:string, value)
       Map.prototype.set = function(key, value){
           // if no .dict.hasOwnProperty(key), .size++
           if (!this.dict.hasOwnProperty(key)) {this.size++};
           this.dict[key] = value;
       };

       // method delete(key:string)
       Map.prototype.delete = function(key){
           // if .dict.hasOwnProperty(key), .size--
           if (this.dict.hasOwnProperty(key)) {this.size--};
           // delete .dict[key]
           delete this.dict[key];
       };

       // method get(key:string)
       Map.prototype.get = function(key){
           return this.dict[key];
       };

       // method has(key:string)
       Map.prototype.has = function(key){
           return key in this.dict;
       };

       // method keys() returns array
       Map.prototype.keys = function(){
           return Object.keys(this.dict);
       };

       // method forEach(callb)
       Map.prototype.forEach = function(callb){
           // for each property propName,value in .dict
           var value=undefined;
           for ( var propName in this.dict)if (this.dict.hasOwnProperty(propName)){value=this.dict[propName];
               {
               callb(propName, value);
               }
               
               }// end for each property
           
       };

       // method toString()
       Map.prototype.toString = function(){
           return JSON.stringify(this.dict);
       };
   // end class Map

// # JS array access

// ## set array item value

// js also allows you to do:
 // `var a = []`
 // `a[100]='foo'`

// and after that the js "array" will have only one element, index:100 value:'foo',
// but length will be 101

// LiteC arrays do not behave like that, if you do:
    // `var a = []`
    // `a[100]='foo'` => EXCEPTION: OUT OF BOUNDS

// you'll get an "OUT OF BOUNDS" exception. You cannot set value for an
// array item out of current bounds.

// ## get array item value

// LiteC arrays will also give an "OUT OF BOUNDS" exception, when accessing a unexisting array item.

// Sometimes is useful to get "undefined" when accessing a "out of bounds" index.
// In order to provide such functionality, you'll have to use `Array.tryGet(index)`

// js:
 // `var a = []`
 // `console.log(a[100]);` => OK, undefined

// LiteC:
 // `var a = []`
 // `console.log(a[100]);` => EXCEPTION: OUT OF BOUNDS
 // `console.log(a.tryGet(100));` => OK, undefined


   // append to class Array

       // method tryGet(index:Number)
       Array.prototype.tryGet = function(index){
           return this[index];
       };
module.exports=Map;