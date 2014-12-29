##Map

Use this class instead of js built-in Object Class, 
when you're using the js built-in Object as a "dictionary" 
and you want to be able to compile the code to C 

You can declare a Map *Literally" using the keyword `map`.

Examples: /*

#### Standard JS Literal Object

LiteScript:

    var foo = 
        a: 1
        b: "text"
        c: new MyClass

    var baz = foo.b

=> when compiled-to-js:

    var foo = {a: 1, b: "text", c: new MyClass()};
    var baz = foo.b;

=> when compiled-to-Lite-C:
    ***Can not be compiled to lite-C***.- Solution: Use litescript *map*

#### Litescript Literal Map

LiteScript:

    var foo = map
        a: 1
        b: "text"
        c: new MyClass

    var baz = foo.get("b")

=> when compiled-to-js:

    var foo = new Map().fromObject( {a: 1, b: "text", c: new MyClass()} );
    var baz = foo.get("b");

=> when compiled-to-Lite-C:

    #define _NV(n,v) {&NameValuePair_CLASSINFO, &(NameValuePair_s){n,v}

    var foo = new(Map,3,(any_arr){
                    _NV(any_LTR("a"),any_number(1)),
                    _NV(any_LTR("b"),any_LTR("text"))
                    _NV(any_LTR("c"),new(MyClass,0,NULL))
        });

    var baz = CALL1(get_,foo,any_LTR("b"))

*/

As you can see, to be able to compile litescript code to Lite-C
you'll need to use *map* instead of using js:Object as a dictionary. The required changes are:
  1. add the keyword "map" after "var foo ="
  2. use `map.get(key)` and `map.set(key,value)` instead of `object[key]` and `object[key]=value`

The *map* class is a native class in Lite-C.

Here we're declaring a *map* class to be used when the code is compiled-to-js


####export only class Map

        properties
            dict:Object
            size

        constructor new Map
            .clear
            
        method clear()
            .dict= new Object()
            .dict.__proto__ = null //no __proto__ chain, no "extra" properties
            .size=0

we have a special "Map.fromObject()" used to create a Map from a Literal Object. 
// To keep compatibility with ES6, we can't use default Map constructor, 
since ES6 Map constructor is: new Map([iterator])

        method fromObject(object)
            .dict = object
            .dict.__proto__ = null //no __proto__ chain, no "extra" properties
            .size = Object.keys(.dict).length
            return this

        method set(key:string, value)
            if .dict hasnt property key, .size++
            .dict[key]=value

        method setProperty(name:string, value) //use Map|Object interchangeably
            .dict[name] = value

        method delete(key:string)
            if .dict has property key 
                .size--
                delete .dict[key]

        method get(key:string)
            return .dict[key]

        method tryGetProperty(key:string) //use Map|Object interchangeably
            return .dict[key]

        method has(key:string)
            return .dict has property key

        method hasProperty(key:string) //use Map|Object interchangeably
            return .dict has property key

        method hasOwnProperty(key:string) //use Map|Object interchangeably
            return .dict has property key

        method allPropertyNames(map) returns array  //use Map|Object interchangeably
            return Object.keys(.dict)

        method forEach(callb:function)
            for each property propName,value in .dict
                callb.call(this,propName,value)

        method toString()
            return JSON.stringify(.dict)

        method keys() returns array
            return Object.keys(.dict)
