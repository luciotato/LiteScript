
#Named Params vs. use a class as "options" param

###problem: using a class imposes calling "new" and create a new object before calling
### you loose the advantages of the "options" object in js.


#Option 1: Keep as js "LiteralObject" syntax but auto-declare a class
##allows to "upgrade" to a explicitly defined class when necessary


#### constructor new Declaration(name, options:NameDeclOptions, node)

    // "default options" is like declaring a class "Declaration_options"
    // the body which follows is treated as properties declaration

            default options

                normalizeModeKeepFirstCase: boolean

                pointsTo : Declaration
                type, itemType, returnType 
                value, isForward, isDummy

                informError: boolean

    // after this you can "upgrade" to a full named class if you want to add methods
    // or you can use the options as parameters of other functions
    // by using the default name "[function name]_[parameter name]"

Auto generated class:

### export class Declaration_options
        properties

            normalizeModeKeepFirstCase:boolean = false

            pointsTo : Declaration

            type, itemType, returnType 
            value, isForward, isDummy

            informError: boolean

como se traduce?

    var a = new Declaration(name, {type:'Function', informError:false}, node)

js=> queda igual- se valida el objeto que coincida con los miembros de Names.Declaration.options (compiler model only)

C=>

    var a = new(Declaration, name, _newOpt(Declaration_default_options,2 ,type_,any_LTR("Function") ,informError_,false ), node)

se crea siempre la auto-clase (eso lo hace "defatul options")
_newOpt recibe una clase y una lista de symbol:value para inicializar solo ciertos miembros


##with named params:

example:

#### constructor new Declaration( name, 

          normalizeModeKeepFirstCase: boolean = false

          pointsTo : Declaration

          type, itemType, returnType 
          value, isForward, isDummy

          informError: boolean

          options:NameDeclOptions
          
          nodeDeclared: ASTBase 

          )

como se traduce?

    var a = new Declaration(name,undefined,undefined,undefined,'Function',undefined,undefined, /*informError*/false, node)

js=> queda igual- se valida el objeto que coincida con los miembros de NameDeclOptions

C=>

    var a = new Declaration(name,undefined,undefined,undefined,'Function',undefined,undefined, /*informError*/false, node)

    var a = new(Declaration, 12,(any_arr){name,undefined,undefined,undefined,any_LTR("Function"),undefined,/*informError:*/false,node})

### Problems:
- generated code has a long string of undefined,undefined,undefined
- list of option cannot be esily reused in other functions
- cant add methods 

###RESULT: Use auto-defined classes with "default options"


#CASE 2
when there's one or two simple boolean params modifying function behavior

    method getReference(informError:boolean, travelProto:boolean)

should allow named params here, and check order
*** named arguments are a way to better document a function call, not a way to handle optional params***

    var result=getReference(true,true) //ok, not too clear

    getReference(informError=true) into var result //ok, better

    var result=getReference(travelProto=true) // should convert to =>
    => var result=getReference(informError=undefined, travelProto=true) 
