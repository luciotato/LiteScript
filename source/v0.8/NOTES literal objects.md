#Js literal objects

###problem: a literal object is a bug waiting to happen

but js libs require literal object

###proposal

####when compiling to-js:

  - default is to generate literal object - to be able to use all the js libs

  - a different object can be created using: ` new class "{" (name:value,)* "}"` syntax.
  - e.g: "new map.{a:1,b:2}" or "new ClassX.{x:1,a:'baz'}", also freeform: "var x = map[NEWLINE]name:value[NEWLINE]name:value..." 
    example: 
      ls: `new Foo.{a:1,b:2}` =>
      => js:`new Foo().newFromObject({a:1,b:2})` 
      => C:`new(Foo).newFromObject(new(Map,{a:1,b:2})` 

ls: 

    var x = map
        a : 1
        b : 2 

=>
      js:`new map().newFromObject({a:1,b:2})` 
      C:`_new(Foo).newFromObject(new(Map,{a:1,b:2})` 


  - for function arguments generate literal objects *unless* function argument 
    has class :type specified 

    if so, `function Bar(options:Foo)`... `Bar({a:1,b:2})` becames `Bar( new Foo{a:1,b:2} )` =>
      => js:`Bar( new Foo().newFromObject({a:1,b:2}) )` 
      => C: `Bar( new(Foo).newFromObject(new Map({a:1,b:2})) )`

Result:
  - generate literal object
  - unless class specified
  - unless function argument has class specified 


####when compiling C:

  - default is to raise error: "cannot generate literal object in C, prepend 'map' or a specific class to create and initialize a instance"
  
  - the rest: IDEM

### to write portable LiteScript code valid to compile-to-js and compile-to-c:

1. Use a defined class to type function arguments
2. You can use 'default options' syntax sugar to avoid boilerplate
3. Use "map" when you cannot define a specific class or you need a dictionary

