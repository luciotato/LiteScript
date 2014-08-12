
//Use this class instead of js built-in Object Class,
//when you're using the js built-in Object as a "dictionary"
//and you want to be able to compile the code to C

//You can declare a Map *Literally" using the keyword `map`.

//Examples:
//
//
//#### Standard JS Literal Object
//
//LiteScript:
//
//    var foo =
//        a: 1
//        b: "text"
//        c: new MyClass
//
//    var baz = foo.b
//
//=> js:
//
//    var foo = {a: 1, b: "text", c: new MyClass()};
//    var baz = foo.b;
//
//=> C:
//    ***Not translatable to C***
//
//#### Litescript Literal Map
//
//LiteScript:
//
//    var foo = map
//        a: 1
//        b: "text"
//        c: new MyClass
//
//    var baz = foo.get("b")
//
//=> js:
//
//    var foo = new Map().fromObject( {a: 1, b: "text", c: new MyClass()} );
//    var baz = foo.get("b");
//
//=> Lite-C
//
//    #define _NV(n,v) {&NameValuePair_CLASSINFO, &(NameValuePair_s){n,v}
//
//    var foo = new(Map,3,(any_arr){
//                    _NV(any_LTR("a"),any_number(1)),
//                    _NV(any_LTR("b"),any_LTR("text"))
//                    _NV(any_LTR("c"),new(MyClass,0,NULL))
//        });
//
//    var baz = CALL1(get_,foo,any_LTR("b"))
//

//As you can see, the required changes are:
//a) add the keyword "map" after "var foo ="
//b) use `map.get(key)` and `map.set(key,value)` instead of `object[key]` and `object[key]=value`


    //global class Map
    // constructor
    function Map(){
        //properties
            //dict:Object
            //size
            //.clear
            this.clear();
        };
    //global class
    GLOBAL.Map=Map;

        //method clear()
        Map.prototype.clear = function(){
            //.dict= new Object()
            this.dict = new Object();
            //.dict.__proto__ = null //no __proto__ chain, no "extra" properties
            this.dict.__proto__ = null;
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
            //.dict.__proto__ = null //no __proto__ chain, no "extra" properties
            this.dict.__proto__ = null;
            //.size = Object.keys(.dict).length
            this.size = Object.keys(this.dict).length;
            //return this
            return this;
        };

        //method set(key:string, value)
        Map.prototype.set = function(key, value){
            //if .dict hasnt property key, .size++
            if (!(key in this.dict)) {this.size++};
            //.dict[key]=value
            this.dict[key] = value;
        };

        //method setProperty(name:string, value) //use Map|Object interchangeably
        Map.prototype.setProperty = function(name, value){
            //.dict[name] = value
            this.dict[name] = value;
        };

        //method delete(key:string)
        Map.prototype.delete = function(key){
            //if .dict has property key
            if (key in this.dict) {
            
                //.size--
                this.size--;
                //delete .dict[key]
                delete this.dict[key];
            };
        };

        //method get(key:string)
        Map.prototype.get = function(key){
            //return .dict[key]
            return this.dict[key];
        };

        //method tryGetProperty(key:string) //use Map|Object interchangeably
        Map.prototype.tryGetProperty = function(key){
            //return .dict[key]
            return this.dict[key];
        };

        //method has(key:string)
        Map.prototype.has = function(key){
            //return .dict has property key
            return key in this.dict;
        };

        //method hasProperty(key:string) //use Map|Object interchangeably
        Map.prototype.hasProperty = function(key){
            //return .dict has property key
            return key in this.dict;
        };

        //method hasOwnProperty(key:string) //use Map|Object interchangeably
        Map.prototype.hasOwnProperty = function(key){
            //return .dict has property key
            return key in this.dict;
        };

        //method allPropertyNames(map) returns array  //use Map|Object interchangeably
        Map.prototype.allPropertyNames = function(map){
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        };

        //method forEach(callb:function)
        Map.prototype.forEach = function(callb){
            //for each property propName,value in .dict
            var value=undefined;
            for ( var propName in this.dict){value=this.dict[propName];
                {
                //callb.call(this,propName,value)
                callb.call(this, propName, value);
                }
                
                }// end for each property
            
        };

        //method toString()
        Map.prototype.toString = function(){
            //return JSON.stringify(.dict)
            return JSON.stringify(this.dict);
        };

        //method keys() returns array
        Map.prototype.keys = function(){
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        };
    // end class Map
module.exports=Map;
