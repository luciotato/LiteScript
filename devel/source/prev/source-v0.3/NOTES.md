ver node_modules/log.lite.md 

la exportacion de var color={red: green...}
no exporta .red .green
ver compiler.lite.md . hubo que poner:

    declare valid log.color.red
    declare valid log.color.green


----------
otra: agregar "filter" como function

            var defaults = filter param in me.params where param.assignedValue is 'algo'
es igual a:

            var defaults=[]
            for param in me.params where param.assignedValue is 'algo'
                defaults.push param

----

better: CASE 
        
        lite: myfn( a, case when no b then 4 else 5 end) 

        js: myfn( a, (!b)?4:5) 



--------
HAS OWN PROPERTY ? - ya esta "HAS[NT] PROPERTY"

"obj has own property name" -> obj.hasOwnProperty(name)



---------
##DONE
INTO assignment-expression

original:

          do
              var ac:Accessor = me.parseDirect(me.lexer.token.value, AccessorsDirect)
              if no ac, break

              me.addAccessor ac

          loop #continue parsing accesors

with into:

          var ac:Accessor

          while me.parseDirect(me.lexer.token.value, AccessorsDirect) into ac
              me.addAccessor ac


other

            var result = actual.findOwnMember(name)
            if result, return result
vs
           
            if actual.findOwnMember(name) into var result, return result


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




"else" for catch/exception
--------------------------
Esta bueno porque podes poner el catch cerca de lo que queres catchear
el "else" block se ejecuta solo si no hubo exception

ver el caso de test.js


exit when 
---------

exit/break when condition
return when condition

Nota: return when condition NO ACEPTA VALORES, es equivalente a -> if condition then return (undefined)
para retornar valores se peude hacer
when condition then return




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


--------
TERNARY STATEMENT : NO - "if" is better

            x is 5?
                kjdf
                sdfs
            else
                sdlkfsdñl
                sdlkfsdñl

            if x is 5
                kjdf
                sdfs
            else
                sdlkfsdñl
                sdlkfsdñl


            actual.findOwnMember(name) into var result?, return result
            if actual.findOwnMember(name) into var result, return result


--------
NOPE: TRUTHY CHECK ([no] VariableRef ?) 

            if no actual.findOwnMember(name)
                log 'cant find'
                actual.addMember(name)
                actual = 'unk'
            else
                actual = name


            actual = no actual.findOwnMember(name)? "unk" : name

            no actual.findOwnMember(name)?
                log 'cant find'
                actual.addMember(name)
                actual = 'unk'
            else
                actual = name



NOPE: TRUTHY CHECK ([no] VariableRef ?) + INTO
NOPE: WITHOUT 'INTO' ONLY FOR VariableRefs

            var result = actual.findOwnMember(name)
            if result, return result

vs

            var result
            actual.findOwnMember(name) into result?, return result
            
            if actual.findOwnMember(name) into var result, return result

to js:

            var result=undefined;if (result=actual.findOwnMember(name)) {return result};


NOT:        4+3 is 7?
                ddsfsdf
            else
                sdñflsd

not recognized-

YES:        4+3 is 7 into var checkSum?
                ddsfsdf
            else
                sdñflsd


NOPE: how about?: NOPE - magical 'it'

            actual.findOwnMember(name)? list.push it 

            actual.findOwnMember(name)? 
                list.push it
                print it
                wrap it
            else
                print "not found"

            ##OOP
            actual.findOwnMember(name)? 
                list.push it
                it.show
                it.wrap
                it.send
            else
                print "not found"

            actual.findOwnMember(name) into var found? 
                list.push found
                print found
                wrap found
            else
                print "not found"


NOPE: how about: mmmm CFDE

            if it = actual.findOwnMember(name)?, return it


----------------
NOPE: aceptar en ternary:

        me.isGlobal = me.opt('global')? true : false
        me.isGlobal = me.opt('global')? true, else false

NOPE: y en function? cfde
        
        myfn( a, b? 4, else 5) # BAD CFDE

