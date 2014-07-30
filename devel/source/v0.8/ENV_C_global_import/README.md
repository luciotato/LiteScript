##C-based core support for Litescript

### Implementation Details

All distinct method names and distinct property names are symbols.
Symbol machine representation is a "int".
Property symbols symbols are positive ints(>=0), method symbols are negative ints (<0),
this allows you to differentiate  property symbols (>=0), from method symbols (<0)

Symbols on the C-Compiler are translated as enum{}, and the symbol name with "_" attached.
e.g.: property "name", `name_`, symbol:1
e.g.: method "toString", `toString_`, symbol:-1

There is a global table of symbol names. 

Each class has a "pos" redirection table 
----------------------------------------
containing the property relative position in the instance.
Properties are always type any

Each class has a "method" jmp table 
---------------------------------
containing a function pointer to the method implementation.
All functions/methods are type: "any functionName(DEFAULT_ARGUMENTS)"

###access "toString" implementation for this instance

this.class->method[-toString](this,argc,arguments)

###to retrieve property "y" of this instance

this.value.prop[this.class->pos[y]]



Exceptions to the rule/hacks
----------------------------

### "length" reserved property name

"length", is used as as property, but gets compiled to a function call
LiteScript: bar.length => C: _length(bar)

Reasons: 
    - UTF-8 string length get's calculated only when required
    - Array length can be stored as type size_t instead of any

### "constructor" reserved property, symbol:0

"constructor" (type Class), is the first property of every instance, symbol=0, also a pointer to the class.
When accessed, it shortcuts to: `any_class(this.class)`

LiteScript: `bar.constructor` 
    => C: `any_class(bar.class)`  => `(any){&Class_CLASSINFO,bar.class}`

Reasons: 

    - so pseudo-classes (String,Number,Undefined,Null) still have a property "constructor" 
        even if they do not have instance memory space (no real properties)

    - so 0 can be used to signal "invalid property" on the Class.pos[] table.


### "prototype" pseudo-property


"prototype", when applied to a Class, let's you access the class methods
converted to a Function. 
"C.prototype.x" get's translated to "any_Function(C.value.class->method[-x]}"

Examples:

LiteScript: `Array.prototype.splice` 
    => C: `any_func(Array.value.class->method[-toString])`

LiteScript: bar.constructor.prototype.toString 
    => C: `any_func(any_Class(bar.class).value.class->method[-toString] }`



----OPTIONAL---- NOT IMPLEMENTED YET
Global functions are methods of Global class
--------------------------------------------

There's only one global instance, named "global", class "Global"
All global vars are properties of this instance.
all global functions are methods of class "Global".

Global functions are called as methods of class Global. 
Global functions with "undefined" as value for "this"
(as in javascript "strict" mode).

> a global "function" is a "method" of the "Global" Class.

###to call a global function foo

LiteScript: foo(10,1)

C: global.class->method[-foo](undefined,argc,arguments)

###to retrieve a global property bar

LiteScript: print globFoo

C: print(global.value.prop[global.class->pos[globFoo]]))

