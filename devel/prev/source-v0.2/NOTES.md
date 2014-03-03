".x" alias for "this.x" / "me.x"


----------------
aceptar en ternary:

        me.isGlobal = me.opt('global')? true : false

        me.isGlobal = me.opt('global')? true, else false

--------
HAS OWN PROPERTY ? - ya esta "HAS[NT] PROPERTY"

"obj has own property name" -> obj.hasOwnProperty(name)
<del>msdkjsd</del>


--------

#MAP: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

##Actual javascript object implementation

var moduleCache: object map to Grammar.Module 
for each property filename,moduleNode in moduleCache

dado:

        for each own property fname in project.moduleCache
          var moduleNode:Grammar.Module = project.moduleCache[fname]

-- aceptar

        for each own property fname,moduleNode in project.moduleCache


##ES6 MAP
var moduleCache: string to Grammar.Module map

for each filename,moduleNode of moduleCache

or?

for each filename,moduleNode in map moduleCache


------ 
CONTROLAR
que si estas en ClassDeclaration o Append To, 
no use 'function'. Si te equivocas y usas 'function'
no pasa nada, solo que NO LO PONE EN EL PROTOTYPE.

-----
INTO as assignment-expression

original:

          do
              var ac:Accessor = me.parseDirect(me.lexer.token.value, AccessorsDirect)
              if no ac, break

              me.addAccessor ac

          loop #continue parsing accesors

with into:

          var ac:Accessor

          while me.parseDirect(me.lexer.token.value, AccessorsDirect) into var ac
              me.addAccessor ac

--------
TERNARY STATEMENT ?

            var result = actual.findOwnMember(name)
            if result, return result
vs

            actual.findOwnMember(name)? return it

            actual.findOwnMember(name) into var found? return found

to js:

            if (var it=actual.findOwnMember(name)) {return it};

            if (var found=actual.findOwnMember(name)) {return found};

how about?:

            actual.findOwnMember(name)? list.push it 

            actual.findOwnMember(name)? 
                list.push it
                print it
                wrap it
            else
                print "not found"


            actual.findOwnMember(name) into var found? 
                list.push found
                print found
                wrap found
            else
                print "not found"


how about: mmmm CFDE

            if it = actual.findOwnMember(name)?, return it


-----
vs
            with actual.findOwnMember(name)
                return it
to js:
            if (var it=actual.findOwnMember(name)) {return it};

how about?:

            actual.findOwnMember(name)? list.push it 

            actual.findOwnMember(name)? 
                list.push it
                print it
                wrap it
            else
                print "not found"

CASE ?

            case actual.findOwnMember(name)
                when instance of XX
                    list.push it
                    print it
                    wrap it
                when is empty
                    print "not found"

            var result = actual.findOwnMember(name)
            if result, return result


--------
Agregar LIKE -> .test 

if str like /ab_.*_name/ 

js:

if (/ab_.*_name/.test(str))



---
## DeclareStatement para v0.3

`DeclareStatement: declare INDENTIFIER [":" (type-IDENTIFIER|FreeObjectLiteral)]`

Declare statement allows you to declare:
* external variables
* type for local variables
* object members.
Also declare the valid accessors for externally created objects
when you dont want to create a class to use as type.

Examples
/*

    declare log:
              message: function
              error: function
              warning: function

    function theApi(object,params,callback)

      declare callback: function

      declare params:
          throwErrorsFn: function
          options:
            start: function
            encoding: string
            debug:
              enabled:boolean
              level: number
      end declare

      log.message "debug:", params.options.debug.enabled

    end function
*/

    class DeclareStatement inherits from ASTBase
  
      properties
        varRef, list

      method parse()

        me.req 'declare'
        me.lock()

        if me.lexer.token.type is 'NEWLINE'
          me.list = me.reqSeparatedList(VariableDecl,",")
          return


        me.name = me.req('IDENTIFIER')

        if me.name is 'valid'
          me.varRef = me.req(VariableRef)
          return

        if me.name is 'on'
          me.varRef = me.req(VariableRef)
          me.list = me.reqSeparatedList(VariableDecl,",")
          return

        if me.opt(":")

          if me.lexer.token.type is 'NEWLINE'
            me.type = me.req(FreeObjectLiteral)

          else
            me.type = me.req(VariableRef)



---

Separar TypeCheck y sacarlo por completo del proceso de parsing
parsear todos los trees primero 
y LUEGO (pass 1) asignar scope y types
y LUEGO (pass 2) controlar uso


---

Pavada:
Agregar 'where' al for
en realidad hacer 'where' synon de 'if' y permitir 'if' pegado al for

			for paramDecl in me.paramsDeclarations
				if paramDecl.assignedValue 
				    me.assignIfUndefined paramDecl.name, paramDecl.assignedValue
			#end for

			for paramDecl in me.paramsDeclarations where paramDecl.assignedValue is 'algo'
			    me.assignIfUndefined paramDecl.name, paramDecl.assignedValue
			#end for

otra: agregar "filter" como function

			var defaults = filter param in me.params where param.assignedValue is 'algo'
es igual a:

			var defaults=[]
			for param in me.params where param.assignedValue is 'algo'
				defaults.push param

----


------
permitir:

PropertyDeclaration:
	[non-enumerable][read-only] property IDENTIFIER ["=" value-Expression]
				[get ":" get-FunctionDeclaration]
				[set ":" set-FunctionDeclaration]

---


sacar GLOBAL log y debug
y crear modulo 'log'
que tenga .debug, .message, .error y .warning



------------------------------------------------------------------------

    method checkTypeString(checkType)

            if typeof(checkType) is 'string'
              var typeName = checkType
              checkType = me.findInScope(typeName)
              if no checkType
                var rootNode = me.getRootNode()
                for prop in Object.keys(rootNode.parent.moduleCache)
                  var module = rootNode.parent.moduleCache[prop]
                  var normalized = normalize(typeName)
                  checkType = module.findInScope(typeName)

              if no checkType
                me.throwError "type '#{typeName}' not found in scope"
-----------


Notes:
======

dejar solo .req y .opt
y reconocer: allLower -> reqValue, allCAPS -> reqType, y Function, --> req symbol

reconocer also '{LISTOF:'

so:

    class PrintStatement inherits from ASTBase
      method parse()

        me.reqValue 'print'

        me.lock()

        me.args = me.optSeparatedList(Expression,",")
	
		me.args = me.opt({listOf:Expression, separator:","})

pasa a:

    class PrintStatement inherits from ASTBase
      method parse()

        me.req 'print'

        me.lock()

		me.args = me.opt({LISTOF:Expression, separatedBy:","})

mas adelante, hacer un parser de grammar expressions
y quedaria:

    class PrintStatement inherits from ASTBase
      method parse()

      	me.simpleGrammar "print {lock} [Expression,]"

      	lists van a .list y Body a .body


scope vs object valid members
------------------------------
estas confuncdiendo "scope" con "members"
¿no convendria crear un '.scope' en los nodes que tengan scope?

'members' son siempre 'name.declarations[]' 

MEJOR: reemplaza ".declarations[]" por ".members[]"
y creas .scope que tendra como "members" all the scope vars

y hacer scope como una class, como corresponde?
y pasar NameDeclaration a scope?


types:
------
Parece necesario para validar correctamente miembros


Function object 'prototype' var.
-------------

Each function, when created, creates for itself a "prototype" member.
the "prototype" member has a "constructor" member pointing to the function.

traceur (google es6 transpiler) uses __proto__

classes:
class A proto is B

A.__proto__ = B # A inherits also as namespace
A.super = B.prototype # so a.super.construtor is B.constructor
A.prototype.__proto__ = B.prototype # A's instances have access to B's prototype



POWER OF PROTO CHAIN
--------------------
instead of having a .lexer pointer in each instance of the ast class, 
a *dedicated* prototype (for the specific lexer) can be crafted having the right .lexer pointer
and then inserted before ASTBase in the proto chain.

TEMA GRAMMAR
------------
para separar las classes de grammar, hacerun file grammar.lite.md
* sacar en out/js/xxx los files
* sacar en out/declare/xxx files con declarations

asi cuando en el producer haces:
import Grammar

ya hace los declares de Grammar



RUN-TIME ACCESSOR CONTROL???	
-------------------------
Se podra agregar un control en run-time para evitar los subtle bugs
cuando se usa una propr en un objeto qu eno era el que tenia la prop 
(pasa los controles del compiler)


AUTO DECLARE - IMPORT REQUIRE
-----------------------------
al compilar, generar en /out: [module].exports
con "compile declare on" de todo lo exportado. 
Asi, es posible buscar y procesar inline este file
cuando se hace "require" o "import"


RESERVED WORDS
--------------
estaba usando la palabra constructor y se armo alog indebuggeable
mantener reserved words


Classes
-------

classes are syntax sugar for prototypal inheritance

LiteScript, inpired by JavaScript embraces Prototypal Inheritance, so you are not 
constrained by the confines of the classical model.

http://javascript.crockford.com/prototypal.html

Example:
/*

LiteScript:

	class Person

		properties
			name: string= 'a person'
			canTalk = true

		method greet
	    	if canTalk then print "Hi, I'm #name"

	end class

javascript:

	var Person = function() {
	    this.canTalk = true;
	};
	Person.prototype = new Object(); //redundant, but makes example more clear

	Person.prototype.greet = function() {
        if (this.canTalk) {
            console.log("Hi, I'm " + this.name);
        }
    };

LiteScript:

	class Employee extends Person
		
		properties
			title: string

	    constructor(aName, aTitle)
	    	name = aName
	    	title = aTitle

	    method greet 
	    	if canTalk then print 'Hi, I'm #name, the #title'

	end class

javascript:

	var Employee = function(aName, aTitle) {
	    this.name = aName;
	    this.title = aTitle;
	};
	Employee.prototype = new Person();

	Employee.prototype.greet = function() {
	    if (this.canTalk) {
	        console.log("Hi, I'm " + this.name + ", the " + this.title);
	    };
    };

LiteScript:

	class Customer extends Person
		constructor(aName)
	    	name = aName
	
	class Mime extends Person
		constructor(aName)
	    	name = aName
	    	canTalk = false

javascript:

	var Customer = function(name) {
	    this.name = name;
	};
	Customer.prototype = new Person();

	var Mime = function(name) {
	    this.name = name;
	    this.canTalk = false;
	};
	Mime.prototype = new Person();

LiteScript:

	var bob = new Employee 'Bob','Builder'
	var joe = new Customer('Joe')
	var rg = new Employee('Red Green','Handyman');
	var mike = new Customer 'Mike'
	var mime = new Mime 'Marcel'
	bob.greet
	joe.greet()
	rg.greet();
	mike.greet
	mime.greet()

javascript:

	var bob = new Employee('Bob','Builder');
	var joe = new Customer('Joe');
	var rg = new Employee('Red Green','Handyman');
	var mike = new Customer('Mike');
	var mime = new Mime('Marcel');
	bob.greet();
	joe.greet();
	rg.greet();
	mike.greet();
	mime.greet();


This will output:

Hi, I'm Bob, the Builder
Hi, I'm Joe
Hi, I'm Red Green, the Handyman
Hi, I'm Mike
*/

One *important* difference in prototypal inheritance, is that *you do not need
to call super.constructor* for classes that "extend" another class. 

Since your parent class prototype is a fully constructed object, it is constructed once
and ther shared by all derives instances.
So *you do not call super.constructor on each instantiation of the derived class*, you "use"
the shared object already created.
All the derived class instances, use the shared instance of the parent class as "prototype".

This is very efficient and faster than the classical model. In the classical model, there are
no prototypes, so each instantiation need to call all the parent classes constructors.
Also all the properties of all parent classes are created for every instance.

In prototypal inheritance, the parent class properties *are in the shared prototype*, so they're
shared by all derived instances. 

Only when a instance tries to alter a property found in the prototype, instead of modifying the prototype's
property, *it creates a property of it's own*, with the same name, and set's the value in it's own property
which will "shadow" the prototype's property for this specific instance.


Graphical (pun intended) Example
--------------------------------
If you've used Gimp or Photoshop, you can think of prototypes as Photoshop transparent "layers". 

Until you "cover" a layer region with paint of it's own, you'll see thru all the layers 
down to the "Background" layer. 

In LiteScript (and in Javascript) the "background layer" is `Object.prototype`

In LiteScript every time you create a class, 
you're creating a "transparent layer" over the parent class.

Any space you do not "cover" with a property in this class, will be a transparent window
to the parent classs, then to the parent's parent class, and so on until the `Object` class.

As in Gimp and Photoshop, in LiteScript (and in Javascript) your "background" layer is `Object.prototype`


LiteScript, a compiler with plugins
===================================

Compiler Hooks
--------------
Compiler Hooks allow you to hook code to the compilation process. Its meta-programming.
Only use it for simple replacements and if you really-really need it.

To introduce a compiler hook, you type `compiler hook`
in the second line, you add the type of hook. in this example we will see
an "alter lexer line" hook.

`alter lexer line` means the hook code will be called for each lexer tokenized line.
You'll have a "line" parameter with properties: 
	.tokens[] # the line array of tokens
	.text     # the raw line textr (trimmed)
	.indent	  # the line indent

You can change the .tokens[] or you can alter directly the .text (.text has precedece)
You can also assign a *string array* to the .text property, to insert of several lines lines in the compilation process.

Example 1:

Let's add a compiler hook, to create a 'shim' statement, synatx sugar for 'create if not exists method...'

	compiler hook "Shim"
		alter lexer line
			if line.tokens.length > 2 line.tokens[0] is 'shim'
				line.tokens[0] = 'create if not exist method'

Done, we have "shim" sugar, so instead of coding:

	extend class String

	    create if not exists method startsWith(text)
	        return this.slice(0, text.length) is text

	    create if not exists method endsWith(text)
	        return this.slice(-text.length) is text

	end extend String

now we can type:

	extend class String

	    shim startsWith(text)
	        return this.slice(0, text.length) is text

	    shim endsWith(text)
	        return this.slice(-text.length) is text

	end extend String



*BAD* *BAD* *BAD* *BAD* *BAD* 
Se necesita alter de varias lines para convertir -> en function
ya que CofeeScript hace la truchada de agregar 'return' a la ultima linea
de la funcionm que debe ser una expresion
*BAD* *BAD* *BAD* *BAD* *BAD* 

*BAD* *BAD* *BAD* *BAD* *BAD* Example 2:

Let's add a compiler hook, to accept simple CoffeeScript-style arrow function declarations

	compiler hook "CoffeeScript thin arrow"
		alter lexer line

Check if the line ends with '->'

			var minusPos = line.tokens.indexOf('-')
			if minusPos and line.tokens.indexOf('>') is minusPos+1

Ok, we have here a CoffeeScript thin arrow function declaration (a "->")
Let's alter the line tokens, in order to convert:
	`square = (x) -> x*x`  into  `square = function(x)`

First, search the "="

				pos = line.tokens.indexOf('=')
				if pos is -1 then fail with "can't find '='"

Now insert "function"

				line.tokens.splice(pos+1,0,"function")

Now remove the '->'

				line.tokens.splice(-2,2)

*BAD* *BAD* *BAD* *BAD* *BAD*  Done, we have "CoffeeScript thin arrow" "macro" in 5 lines of code, so:

	square = (x) -> x * x

	    create if not exists method startsWith(text)
	        return this.slice(0, text.length) is text

	    create if not exists method endsWith(text)
	        return this.slice(-text.length) is text

	end extend String

now we can type:

	extend class String

	    shim startsWith(text)
	        return this.slice(0, text.length) is text

	    shim endsWith(text)
	        return this.slice(-text.length) is text

	end extend String



Compiler Hooks, Inception Style
-------------------------------

*BAD* *BAD* *BAD* *BAD* *BAD* 
Se necesita alter de varias lines para convertir -> en function
ya que CofeeScript hace la truchada de agregar 'return' a la ultima linea
de la funcionm que debe ser una expresion
*BAD* *BAD* *BAD* *BAD* *BAD* 

When the LiteScript parser finds 'compiler hook|macro', a new compiler is created
in order to compile the hook code and then add the hook to the actual compiler. 
This new compiler, let's call it "compiler level 2" has the same power of the main
compiler, so you can go "in inception-mode", and use again 'compiler hook'
on compiler level 2.

Example: let's do the same "CoffeeScript thin arrow", in "inception-style"

Let's add a compiler hook, to accept CoffeeScript-style arrow function declaration

	compiler hook "CoffeeScript slender arrow"
		alter lexer line

Now let's go a level deep

		compiler hook "a little language, inception level 2"
			alter lexer line
			
				if line.text is "on thin arrow"
					line.text = 'if line.tokens.slice(-2).join("") is "->"'

				elseif line.tokens[0] is "replace" and line.tokens[2] is "with"
					line.text = [
						"var pos = line.tokens.indexOf(#{line.tokens[1]}"
						"if pos is -1 then fail with "can't find #{line.tokens[1]}"
						"line.tokens = line.tokens.splice(pos,1," 
										+ line.tokens.slice(3).join() + ")"
							]
				elseif line.tokens[0] is "remove" and line.tokens[1] is "last"
					line.text = "line.tokens.splice(-#{line.tokens[1]},#{line.tokens[1]})

		end compiler hook

Now, back to level 1, the "CoffeeScript thin arrow macro, in meta

		on thin arrow
			remove last 2
			replace "=" with "=" "function"

Done, we have "CoffeeScript thin arrow" macro in 3 lines of meta-code (and 9 of level 2)




.last
-----

agregar al proto de Array 
arr.last --> arr[arr.length-1] 

subtle bug
----------
se debe largar un WARNING si se define 2 veces el MISMO PROTOTYPE METHOD
para una clase.
Puede ser que quede una definicion mas abajo que no se ve, y luego no
coincide la ejecucion con lo que 'supuestamente' se ve.



control
-------

Avisar si se hace esto:

if a is 5 then print 'es 5'
    else print 'no es 5'

El 'else' debiera estar con el mismo indent del 'if'

if a is 5 then 
	print 'es 5'
    	else print 'no es 5'

if a is 5 then print 'es 5'
    else 
    	print 'no es 5'


"else" for catch/exception
--------------------------
Esta bueno porque podes poner el catch cerca de lo que queres catchear
el "else" block se ejecuta solo si no hubo exception

ver el caso de test.js


Documentation in code
---------------------

Reconocer en la col 1:
'namespace', 'class', 'function' -> CODE
"Usage:" -> BLOCK, wich is *comment* not code
"Example:" -> BLOCK, wich is *comment* not code


if Not x in [a,b,c] then...
----------------
Reconocer esta estructura y proponer:
if x not in [a,b,c] then...

No
----------------
if no x then...

Reconocer 'if no' como existencial check y PERMITIR alias 'no=false', 'yes=true'


exit when 
---------

exit/break when condition
return when condition

Nota: return when condition NO ACEPTA VALORES, es equivalente a -> if condition then return (undefined)
para retornar valores se peude hacer
when condition then return

FALSEY
------

ver si hacemos que "falsey" sea: false, null, undefined, ''
en tanto que culaquier otra cosa sea "truthey" - incluso 0

Lo "novedoso" es que 0 NO ES false

lo unico que evalua to "false" es "empty" = [false,null,undefined,'']

entonces:

if a ===> if a isnt empty ===> if a not in [false,undefined,null,'']

if no a  ===>  if a is empty ===> if a in [false,null,undefined,'']

"not" a ===> solo es valido si "a" es boolean, para otra cosa DA ERROR

un campo boolean - NO ES NUMERICO 


SHORT CIRCUIT MEMBER ACCESS
---------------------------

Cuando se escribe obj.prop.member.value

if no obj ===> undefined
if no obj.prop ===> undefined
if no obj.prop.member ===> undefined

Es decir, cuando un member accessor por '.' da 'undefined'
ya sale antes 


JAVASCRIPT, VAR, and SCOPE
--------------------------

javascript:

	// show even numbers
	var n=0;
	var ta = document.getElementById('result');
	var s='';
	for (var i=0;i<10;i++){
	    var j;
	    if (i%2 === 0) j = i;
        if (j) s += j.toString()+',';
	}
	ta.innerText = s;

Expected result is: 2,4,6,8,

this js code outs: 2,2,4,4,6,6,8,8,


LiteScript:

	var n = 0
	var ta = document.getElementById('result')
	var s
	for var i=0 while i<10
	    var j
	    if i mod 2 is 0 then j = i
        if j then s += j.toString()+','
	}
	ta.innerText = s

this outs: 2,4,6,8,

Why the difference?
Because LiteScript forces variables to be initialized at the point of declaration,
thus limiting the scope, but Javascript pushes al var declarations to the start of the function
and does not force an implicit assignment at the point of declaration. 

The compiled js is:

	var n=0;
	var ta = document.getElementById('result');
	var s=null;
	for (var i=0;i<10;i++){
	    var j=null;  //<-- difference is here
	    if (i%2 === 0) j = i;
        if (j) s += j.toString()+',';
	}
	ta.innerText = s;

