#include "Producer_c.h"
//-------------------------
//Module Producer_c
//-------------------------
var Producer_c_allClasses;
var Producer_c_allMethodNames;
var Producer_c_allPropertyNames;
var Producer_c_coreSupportedMethods;
var Producer_c_coreSupportedProps;
var Producer_c_dispatcherModule;
var Producer_c_appendToCoreClassMethods;
var Producer_c_DEFAULT_ARGUMENTS;
any Producer_c_postProduction(DEFAULT_ARGUMENTS); //forward declare
any Producer_c_normalizeDefine(DEFAULT_ARGUMENTS); //forward declare
any Producer_c_makeSymbolName(DEFAULT_ARGUMENTS); //forward declare
var Producer_c_IDENTIFIER_ALIASES;
var Producer_c_NL;
var Producer_c_OPER_TRANSLATION_map;
any Producer_c_operTranslate(DEFAULT_ARGUMENTS); //forward declare
// Producer C
// ===========

// The `producer` module extends Grammar classes, adding a `produce()` method
// to generate target code for the node.

// The compiler calls the `.produce()` method of the root 'Module' node
// in order to return the compiled code for the entire tree.

// We extend the Grammar classes, so this module require the `Grammar` module.

   // import

   // shim import LiteCore, Map


   // public function postProduction(project)
   any Producer_c_postProduction(DEFAULT_ARGUMENTS){// define named params
       var project= argc? arguments[0] : undefined;
       //---------

// create _dispatcher.c & .h

       // dispatcherModule = new Grammar.Module()
       Producer_c_dispatcherModule = new(Grammar_Module,0,NULL);
        // declare valid project.options
       // dispatcherModule.lexer = new Parser.Lexer(project, project.options)
       PROP(lexer_,Producer_c_dispatcherModule) = new(Parser_Lexer,2,(any_arr){project, PROP(options_,project)});

       // project.redirectOutput dispatcherModule.lexer.outCode // all Lexers now out here
       CALL1(redirectOutput_,project,PROP(outCode_,PROP(lexer_,Producer_c_dispatcherModule))); // all Lexers now out here

       // dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher", project.options.target)
       PROP(fileInfo_,Producer_c_dispatcherModule) = Environment_fileInfoNewFile(undefined,2,(any_arr){any_str("_dispatcher"), PROP(target_,PROP(options_,project))});
       // dispatcherModule.produceDispatcher project
       CALL1(produceDispatcher_,Producer_c_dispatcherModule,project);

       // var resultLines:string array =  dispatcherModule.lexer.outCode.getResult() //get .c file contents
       var resultLines = CALL0(getResult_,PROP(outCode_,PROP(lexer_,Producer_c_dispatcherModule))); //get .c file contents
       // if resultLines.length
       if (_length(resultLines))  {
           // Environment.externalCacheSave dispatcherModule.fileInfo.outFilename,resultLines
           Environment_externalCacheSave(undefined,2,(any_arr){PROP(outFilename_,PROP(fileInfo_,Producer_c_dispatcherModule)), resultLines});
       };

       // resultLines =  dispatcherModule.lexer.outCode.getResult(1) //get .h file contents
       resultLines = CALL1(getResult_,PROP(outCode_,PROP(lexer_,Producer_c_dispatcherModule)),any_number(1)); //get .h file contents
       // if resultLines.length
       if (_length(resultLines))  {
           // Environment.externalCacheSave '#{dispatcherModule.fileInfo.outFilename.slice(0,-1)}h',resultLines
           Environment_externalCacheSave(undefined,2,(any_arr){_concatAny(2,(any_arr){(CALL2(slice_,PROP(outFilename_,PROP(fileInfo_,Producer_c_dispatcherModule)),any_number(0), any_number(-1))), any_str("h")}), resultLines});
       };

       // logger.msg "#{color.green}[OK] -> #{dispatcherModule.fileInfo.outRelFilename} #{color.normal}"
       logger_msg(undefined,1,(any_arr){_concatAny(5,(any_arr){color_green, any_str("[OK] -> "), PROP(outRelFilename_,PROP(fileInfo_,Producer_c_dispatcherModule)), any_str(" "), color_normal})});
       // logger.extra #blank line
       logger_extra(undefined,0,NULL);// #blank line
   return undefined;
   }

   // helper function normalizeDefine(name:string)
   any Producer_c_normalizeDefine(DEFAULT_ARGUMENTS){// define named params
       var name= argc? arguments[0] : undefined;
       //---------
       // var chr, result=""
       var chr = undefined, result = any_EMPTY_STR;
       // for n=0 to name.length
       int64_t _end6=_length(name);
       for(int64_t n=0; n<=_end6; n++) {
           // chr=name.charAt(n).toUpperCase()
           chr = CALL0(toUpperCase_,CALL1(charAt_,name,any_number(n)));
           // if chr<'A' or chr>'Z', chr="_"
           if (_anyToBool(__or(any_number(_anyToNumber(chr) < 'A'),any_number(_anyToNumber(chr) > 'Z')))) {chr = any_str("_");};
           // result="#{result}#{chr}"
           result = _concatAny(2,(any_arr){result, chr});
       };// end for n

       // return result
       return result;
   return undefined;
   }


   // append to class Grammar.Module ###

    // method produceDispatcher(project)
    any Grammar_Module_produceDispatcher(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Module));
       //---------
       // define named params
       var project= argc? arguments[0] : undefined;
       //---------

       // var requiredHeaders: Grammar.Module array = []
       var requiredHeaders = new(Array,0,NULL);

// _dispatcher.h

       // .out
       __call(out_,this,11,(any_arr){new(Map,1,(any_arr){
           _newPair("h",any_number(1))
           })
, Producer_c_NL, _concatAny(3,(any_arr){any_str("#ifndef "), (Producer_c_normalizeDefine(undefined,1,(any_arr){PROP(outRelFilename_,PROP(fileInfo_,this))})), any_str("_H")}), Producer_c_NL, _concatAny(3,(any_arr){any_str("#define "), (Producer_c_normalizeDefine(undefined,1,(any_arr){PROP(outRelFilename_,PROP(fileInfo_,this))})), any_str("_H")}), Producer_c_NL, Producer_c_NL, any_str("#include \"../core/LiteC-core.h\""), Producer_c_NL, Producer_c_NL, Producer_c_NL});

// LiteC__init extern declaration

       // .out
       __call(out_,this,6,(any_arr){Producer_c_NL, new(Map,1,(any_arr){
           _newPair("COMMENT",any_str("core support and defined classes init"))
           })
, Producer_c_NL, any_str("extern void __declareClasses();"), Producer_c_NL, Producer_c_NL});

// verbs & things

// now all distinct method names

       // .out
       __call(out_,this,5,(any_arr){new(Map,1,(any_arr){
           _newPair("COMMENT",any_str("methods"))
           })
, Producer_c_NL, Producer_c_NL, any_str("enum _VERBS { //a symbol for each distinct method name"), Producer_c_NL});

       // var initialValue = " = -_CORE_METHODS_MAX-#{allMethodNames.size}"
       var initialValue = _concatAny(2,(any_arr){any_str(" = -_CORE_METHODS_MAX-"), PROP(size_,Producer_c_allMethodNames)});
       // for each methodDeclaration in map allMethodNames
       any _list59=Producer_c_allMethodNames;
       { NameValuePair_ptr _nvp12=NULL; //name:value pair
        var methodDeclaration=undefined; //value
       for(int64_t methodDeclaration__inx=0 ; methodDeclaration__inx<_list59.value.arr->length ; methodDeclaration__inx++){
           assert(ITEM(methodDeclaration__inx,_list59).class==&NameValuePair_CLASSINFO);
       _nvp12 = ITEM(methodDeclaration__inx,_list59).value.ptr;
           methodDeclaration=_nvp12->value;
           // .out '    ',makeSymbolName(methodDeclaration.name),initialValue,",",NL
           __call(out_,this,5,(any_arr){any_str("    "), Producer_c_makeSymbolName(undefined,1,(any_arr){PROP(name_,methodDeclaration)}), initialValue, any_str(","), Producer_c_NL});
           // initialValue=undefined
           initialValue = undefined;
       }};// end for each in map Producer_c_allMethodNames
       // .out NL,"_LAST_VERB};",NL
       CALL3(out_,this,Producer_c_NL, any_str("_LAST_VERB};"), Producer_c_NL);

// all  distinct property names

       // .out
       __call(out_,this,5,(any_arr){new(Map,1,(any_arr){
           _newPair("COMMENT",any_str("propery names"))
           })
, Producer_c_NL, Producer_c_NL, any_str("enum _THINGS { //a symbol for each distinct property name"), Producer_c_NL});

       // initialValue = "= _CORE_PROPS_LENGTH"
       initialValue = any_str("= _CORE_PROPS_LENGTH");
       // for each name,value in map allPropertyNames
       any _list60=Producer_c_allPropertyNames;
       { NameValuePair_ptr _nvp13=NULL; //name:value pair
            var name=undefined; //key
        var value=undefined; //value
       for(int64_t value__inx=0 ; value__inx<_list60.value.arr->length ; value__inx++){
           assert(ITEM(value__inx,_list60).class==&NameValuePair_CLASSINFO);
       _nvp13 = ITEM(value__inx,_list60).value.ptr;
           name=_nvp13->name;
           value=_nvp13->value;
           // .out '    ',makeSymbolName(name), initialValue, ",",NL
           __call(out_,this,5,(any_arr){any_str("    "), Producer_c_makeSymbolName(undefined,1,(any_arr){name}), initialValue, any_str(","), Producer_c_NL});
           // initialValue=undefined
           initialValue = undefined;
       }};// end for each in map Producer_c_allPropertyNames
       // .out NL,"_LAST_THING};",NL,NL,NL
       __call(out_,this,5,(any_arr){Producer_c_NL, any_str("_LAST_THING};"), Producer_c_NL, Producer_c_NL, Producer_c_NL});

// Now include headers for all the imported modules.
// To put this last is important, because if there's a error in the included.h
// and it's *before* declaring _VERBS and _THINGS, _VERBS and _THINGS don't get
// declared and the C compiler shows errors everywhere

       // for each moduleNode:Grammar.Module in map project.moduleCache
       any _list61=PROP(moduleCache_,project);
       { NameValuePair_ptr _nvp14=NULL; //name:value pair
        var moduleNode=undefined; //value
       for(int64_t moduleNode__inx=0 ; moduleNode__inx<_list61.value.arr->length ; moduleNode__inx++){
           assert(ITEM(moduleNode__inx,_list61).class==&NameValuePair_CLASSINFO);
       _nvp14 = ITEM(moduleNode__inx,_list61).value.ptr;
           moduleNode=_nvp14->value;
           // var hFile = moduleNode.fileInfo.outWithExtension(".h")
           var hFile = CALL1(outWithExtension_,PROP(fileInfo_,moduleNode),any_str(".h"));
           // hFile = Environment.relativeFrom(.fileInfo.outDir, hFile)
           hFile = Environment_relativeFrom(undefined,2,(any_arr){PROP(outDir_,PROP(fileInfo_,this)), hFile});
           // .out '#include "#{hFile}"',NL
           CALL2(out_,this,_concatAny(3,(any_arr){any_str("#include \""), hFile, any_str("\"")}), Producer_c_NL);
       }};// end for each in map PROP(moduleCache_,project)

       // .out NL,NL,"#endif",NL,NL
       __call(out_,this,5,(any_arr){Producer_c_NL, Producer_c_NL, any_str("#endif"), Producer_c_NL, Producer_c_NL});

// _dispatcher.c

       // .out
       __call(out_,this,7,(any_arr){new(Map,1,(any_arr){
           _newPair("h",any_number(0))
           })
, Producer_c_NL, any_str("#include \"_dispatcher.h\""), Producer_c_NL, Producer_c_NL, Producer_c_NL, Producer_c_NL});

// static definition added verbs (methods) and things (properties)

       // .out
       __call(out_,this,9,(any_arr){new(Map,1,(any_arr){
           _newPair("COMMENT",any_str("methods"))
           })
, Producer_c_NL, Producer_c_NL, any_str("static str _ADD_VERBS[] = { //string name for each distinct method name"), Producer_c_NL, new(Map,3,(any_arr){
           _newPair("pre",any_str("    \"")), 
           _newPair("CSL",CALL0(keys_,Producer_c_allMethodNames)), 
           _newPair("post",any_str("\"\n"))
           })
, any_str("};"), Producer_c_NL, Producer_c_NL});

// all  distinct property names

       // .out
       __call(out_,this,9,(any_arr){new(Map,1,(any_arr){
           _newPair("COMMENT",any_str("propery names"))
           })
, Producer_c_NL, Producer_c_NL, any_str("static str _ADD_THINGS[] = { //string name for each distinct property name"), Producer_c_NL, new(Map,3,(any_arr){
           _newPair("pre",any_str("    \"")), 
           _newPair("CSL",CALL0(keys_,Producer_c_allPropertyNames)), 
           _newPair("post",any_str("\"\n"))
           })
, any_str("};"), Producer_c_NL, Producer_c_NL});

// All literal Maps & arrays

// for each nameDecl in map .scope.members
//             where nameDecl.nodeDeclared instanceof Grammar.Literal
//                 .out nameDecl,";",NL
//         

// _dispatcher.c contains main function

       // .out
       __call(out_,this,10,(any_arr){any_str("\n\n\n//-------------------------------"), Producer_c_NL, any_str("int main(int argc, char** argv) {"), Producer_c_NL, any_str("    LiteC_init(argc,argv);"), Producer_c_NL, _concatAny(3,(any_arr){any_str("    LiteC_addMethodSymbols( "), PROP(size_,Producer_c_allMethodNames), any_str(", _ADD_VERBS);")}), Producer_c_NL, _concatAny(3,(any_arr){any_str("    LiteC_addPropSymbols( "), PROP(size_,Producer_c_allPropertyNames), any_str(", _ADD_THINGS);")}), Producer_c_NL});


// process methods appended to core classes, by calling LiteC_registerShim

       // .out '\n'
       CALL1(out_,this,any_str("\n"));
       // for each methodDeclaration in appendToCoreClassMethods
       any _list62=Producer_c_appendToCoreClassMethods;
       { var methodDeclaration=undefined;
       for(int methodDeclaration__inx=0 ; methodDeclaration__inx<_list62.value.arr->length ; methodDeclaration__inx++){methodDeclaration=ITEM(methodDeclaration__inx,_list62);
               // var appendToDeclaration = methodDeclaration.getParent(Grammar.ClassDeclaration)
               var appendToDeclaration = CALL1(getParent_,methodDeclaration,Grammar_ClassDeclaration);
               // .out '    LiteC_registerShim(',appendToDeclaration.varRef,
               __call(out_,this,8,(any_arr){any_str("    LiteC_registerShim("), PROP(varRef_,appendToDeclaration), _concatAny(3,(any_arr){any_str(","), PROP(name_,methodDeclaration), any_str("_,")}), PROP(varRef_,appendToDeclaration), any_str("_"), PROP(name_,methodDeclaration), any_str(");"), Producer_c_NL});
       }};// end for each in Producer_c_appendToCoreClassMethods

// call __ModuleInit for all the imported modules. call the base modules init first

       // var moduleList: array of Grammar.Module=[]
       var moduleList = new(Array,0,NULL);

       // for each moduleNode:Grammar.Module in map project.moduleCache
       any _list63=PROP(moduleCache_,project);
       { NameValuePair_ptr _nvp15=NULL; //name:value pair
        var moduleNode=undefined; //value
       for(int64_t moduleNode__inx=0 ; moduleNode__inx<_list63.value.arr->length ; moduleNode__inx++){
               assert(ITEM(moduleNode__inx,_list63).class==&NameValuePair_CLASSINFO);
       _nvp15 = ITEM(moduleNode__inx,_list63).value.ptr;
               moduleNode=_nvp15->value;
         // where moduleNode isnt project.main
           if(!__is(moduleNode,PROP(main_,project))){
               // moduleList.push moduleNode //order in moduleCache is lower level to higher level
               CALL1(push_,moduleList,moduleNode); //order in moduleCache is lower level to higher level
       }}};// end for each in map PROP(moduleCache_,project)

       // .out '\n'
       CALL1(out_,this,any_str("\n"));
       // for each nodeModule in moduleList
       any _list64=moduleList;
       { var nodeModule=undefined;
       for(int nodeModule__inx=0 ; nodeModule__inx<_list64.value.arr->length ; nodeModule__inx++){nodeModule=ITEM(nodeModule__inx,_list64);
           // .out '    ',nodeModule.fileInfo.base,'__moduleInit();',NL
           CALL4(out_,this,any_str("    "), PROP(base_,PROP(fileInfo_,nodeModule)), any_str("__moduleInit();"), Producer_c_NL);
       }};// end for each in moduleList

// call main module __init

       // .out '\n\n    ',project.main.fileInfo.base,'__moduleInit();',NL
       CALL4(out_,this,any_str("\n\n    "), PROP(base_,PROP(fileInfo_,PROP(main_,project))), any_str("__moduleInit();"), Producer_c_NL);

       // .out '}',NL, {COMMENT: 'end main'},NL
       CALL4(out_,this,any_str("}"), Producer_c_NL, new(Map,1,(any_arr){
       _newPair("COMMENT",any_str("end main"))
       })
, Producer_c_NL);
    return undefined;
    }


    // method produce() # Module
    any Grammar_Module_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Module));
       //---------

// default #includes:
// "LiteC-core.h" in the header, the .h in the .c

       // .out
       __call(out_,this,7,(any_arr){new(Map,1,(any_arr){
           _newPair("h",any_number(1))
           })
, Producer_c_NL, _concatAny(3,(any_arr){any_str("#ifndef "), (Producer_c_normalizeDefine(undefined,1,(any_arr){PROP(outRelFilename_,PROP(fileInfo_,this))})), any_str("_H")}), Producer_c_NL, _concatAny(3,(any_arr){any_str("#define "), (Producer_c_normalizeDefine(undefined,1,(any_arr){PROP(outRelFilename_,PROP(fileInfo_,this))})), any_str("_H")}), Producer_c_NL, Producer_c_NL});

       // var thisBase = Environment.dirName(.fileInfo.outFilename)
       var thisBase = Environment_dirName(undefined,1,(any_arr){PROP(outFilename_,PROP(fileInfo_,this))});

        // declare valid .parent.fileInfo.outFilename
       // var dispatcherFull = "#{Environment.dirName(.parent.fileInfo.outFilename)}/_dispatcher.h"
       var dispatcherFull = _concatAny(2,(any_arr){(Environment_dirName(undefined,1,(any_arr){PROP(outFilename_,PROP(fileInfo_,PROP(parent_,this)))})), any_str("/_dispatcher.h")});
       // .out '#include "#{Environment.relativeFrom(thisBase,dispatcherFull)}"',NL
       CALL2(out_,this,_concatAny(3,(any_arr){any_str("#include \""), (Environment_relativeFrom(undefined,2,(any_arr){thisBase, dispatcherFull})), any_str("\"")}), Producer_c_NL);

       // var prefix=.fileInfo.base
       var prefix = PROP(base_,PROP(fileInfo_,this));

// header

       // .out
       __call(out_,this,7,(any_arr){any_str("//-------------------------"), Producer_c_NL, any_str("//Module "), prefix, Producer_c_NL, any_str("//-------------------------"), Producer_c_NL});

// Modules have a __moduleInit function holding module items initialization and any loose statements

       // .out "extern void ",prefix,"__moduleInit(void);",NL
       CALL4(out_,this,any_str("extern void "), prefix, any_str("__moduleInit(void);"), Producer_c_NL);

// Interfaces have a __nativeInit function to provide a initialization opportunity
// to module native support

       // if .fileInfo.isInterface // add call to native hand-coded C support for this module
       if (_anyToBool(PROP(isInterface_,PROP(fileInfo_,this))))  { // add call to native hand-coded C support for this module
           // .out "extern void ",prefix,"__nativeInit(void);",NL
           CALL4(out_,this,any_str("extern void "), prefix, any_str("__nativeInit(void);"), Producer_c_NL);
       };

// Since we cannot initialize a module var at declaration in C (err:initializer element is not constant),
// we separate declaration from initialization.

// Var names declared inside a module/namespace, get prefixed with namespace name

// module vars declared public

        // add each public/export item as a extern declaration
       // .produceDeclaredExternProps prefix
       CALL1(produceDeclaredExternProps_,this,prefix);

// Now produce the .c file,

       // .out
       __call(out_,this,12,(any_arr){new(Map,1,(any_arr){
           _newPair("h",any_number(0))
           })
, _concatAny(3,(any_arr){any_str("#include \""), prefix, any_str(".h\"")}), Producer_c_NL, Producer_c_NL, any_str("//-------------------------"), Producer_c_NL, any_str("//Module "), prefix, _anyToBool(PROP(isInterface_,PROP(fileInfo_,this))) ? any_str(" - INTERFACE") : any_EMPTY_STR, Producer_c_NL, any_str("//-------------------------"), Producer_c_NL});

        // add sustance for the module
       // .produceSustance prefix
       CALL1(produceSustance_,this,prefix);

// __moduleInit: module main function

       // .out
       __call(out_,this,6,(any_arr){any_str("\n\n//-------------------------"), Producer_c_NL, any_str("void "), prefix, any_str("__moduleInit(void){"), Producer_c_NL});

//         for each nameDecl in map .scope.members
//             if nameDecl.nodeDeclared instanceof Grammar.ObjectLiteral
//                 .out nameDecl, "=new(Map,"
//                 var objectLiteral = nameDecl.nodeDeclared
//                 if no objectLiteral.items or objectLiteral.items.length is 0
//                     .out "0,NULL"
//                 else
//                     .out
//                         objectLiteral.items.length,',(any_arr){'
//                         {CSL:objectLiteral.items}
//                         NL,"}"
//                 .out ");",NL
//             else if nameDecl.nodeDeclared instanceof Grammar.ArrayLiteral
//                 .out nameDecl,"=new(Array,"
//                 var arrayLiteral = nameDecl.nodeDeclared
//                 if no arrayLiteral.items or arrayLiteral.items.length is 0
//                     .out "0,NULL"
//                 else
//                     // e.g.: LiteScript:   var list = [a,b,c]
//                     // e.g.: "C": any list = (any){Array_TYPEID,.value.arr=&(Array_s){3,.item=(any_arr){a,b,c}}};
//                     .out arrayLiteral.items.length,",(any_arr){",{CSL:arrayLiteral.items},"}"
//                 .out ");",NL
//         end for
//         

       // .produceMainFunctionBody prefix
       CALL1(produceMainFunctionBody_,this,prefix);

       // if .fileInfo.isInterface // add call to native hand-coded C support for this module
       if (_anyToBool(PROP(isInterface_,PROP(fileInfo_,this))))  { // add call to native hand-coded C support for this module
           // .out NL,'    ',prefix,"__nativeInit();"
           CALL4(out_,this,Producer_c_NL, any_str("    "), prefix, any_str("__nativeInit();"));
       };

       // .out NL,"};",NL
       CALL3(out_,this,Producer_c_NL, any_str("};"), Producer_c_NL);

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;


// close .h #ifdef

       // .out
       __call(out_,this,5,(any_arr){new(Map,1,(any_arr){
           _newPair("h",any_number(1))
           })
, Producer_c_NL, any_str("#endif"), Producer_c_NL, new(Map,1,(any_arr){
           _newPair("h",any_number(0))
           })
           });
    return undefined;
    }


// ----------------------------

// ## Grammar.ClassDeclaration & derivated

   // append to class Grammar.AppendToDeclaration ###

// Any class|object can have properties or methods appended at any time.
// Append-to body contains properties and methods definitions.

     // method produceHeader()
     any Grammar_AppendToDeclaration_produceHeader(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_AppendToDeclaration));
       //---------

       // var nameDeclClass = .varRef.tryGetReference() // get class being append to
       var nameDeclClass = CALL0(tryGetReference_,PROP(varRef_,this)); // get class being append to
       // if no nameDeclClass, return .sayErr("append to: no reference found")
       if (!_anyToBool(nameDeclClass)) {return CALL1(sayErr_,this,any_str("append to: no reference found"));};

       // if .toNamespace
       if (_anyToBool(PROP(toNamespace_,this)))  {
               // .body.produceDeclaredExternProps nameDeclClass.getComposedName(), true
               CALL2(produceDeclaredExternProps_,PROP(body_,this),CALL0(getComposedName_,nameDeclClass), true);
               // return //nothing more to do if it's "append to namespace"
               return undefined; //nothing more to do if it's "append to namespace"
       };

// handle methods added to core classes

       // if nameDeclClass.nodeDeclared and nameDeclClass.nodeDeclared.name is "*Global Scope*"
       if (_anyToBool(PROP(nodeDeclared_,nameDeclClass)) && __is(PROP(name_,PROP(nodeDeclared_,nameDeclClass)),any_str("*Global Scope*")))  {

// for each method declaration in .body

           // for each item in .body.statements
           any _list65=PROP(statements_,PROP(body_,this));
           { var item=undefined;
           for(int item__inx=0 ; item__inx<_list65.value.arr->length ; item__inx++){item=ITEM(item__inx,_list65);
             // where item.specific.constructor is Grammar.MethodDeclaration
               if(__is(any_class(PROP(specific_,item).class),Grammar_MethodDeclaration)){
                    // declare item.specific: Grammar.MethodDeclaration

                   // if no item.specific.nameDecl, continue // do not process, is a shim
                   if (!_anyToBool(PROP(nameDecl_,PROP(specific_,item)))) {continue;};

// keep a list of all methods appended to core-defined classes (like String)
// they require a special registration, because the class pre-exists in core

                   // appendToCoreClassMethods.push item.specific
                   CALL1(push_,Producer_c_appendToCoreClassMethods,PROP(specific_,item));

// also add to allMethods, since the class is core, is not declared in this project

                   // item.specific.nameDecl.addToAllMethodNames
                   __call(addToAllMethodNames_,PROP(nameDecl_,PROP(specific_,item)),0,NULL);

// out header

                   // .out 'extern any ',item.specific.nameDecl.getComposedName(),"(DEFAULT_ARGUMENTS);",NL
                   CALL4(out_,this,any_str("extern any "), CALL0(getComposedName_,PROP(nameDecl_,PROP(specific_,item))), any_str("(DEFAULT_ARGUMENTS);"), Producer_c_NL);
           }}};// end for each in PROP(statements_,PROP(body_,this))
           
       };
     return undefined;
     }



     // method produce()
     any Grammar_AppendToDeclaration_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_AppendToDeclaration));
       //---------

        //if .toNamespace, return //nothing to do if it's "append to namespace"
       // .out .body
       CALL1(out_,this,PROP(body_,this));
       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }


   // append to class Grammar.NamespaceDeclaration ###
// namespaces are like modules inside modules

    // method produceCallNamespaceInit()
    any Grammar_NamespaceDeclaration_produceCallNamespaceInit(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_NamespaceDeclaration));
       //---------
       // .out '    ',.makeName(),'__namespaceInit();',NL
       CALL4(out_,this,any_str("    "), CALL0(makeName_,this), any_str("__namespaceInit();"), Producer_c_NL);
    return undefined;
    }

    // method makeName()
    any Grammar_NamespaceDeclaration_makeName(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_NamespaceDeclaration));
       //---------

       // var prefix = .nameDecl.getComposedName()
       var prefix = CALL0(getComposedName_,PROP(nameDecl_,this));

// if this is a namespace declared at module scope, we check if it has
// the same name as the module. If it does, is the "default export",
// if it not, we prepend module name to namespace name.
// (Modules act as namespaces, var=property, function=method)

       // if .nameDecl.parent.isScope //is a namespace declared at module scope
       if (_anyToBool(PROP(isScope_,PROP(parent_,PROP(nameDecl_,this)))))  { //is a namespace declared at module scope
           // var moduleNode:Grammar.Module = .getParent(Grammar.Module)
           var moduleNode = CALL1(getParent_,this,Grammar_Module);
           // if moduleNode.fileInfo.base is .nameDecl.name
           if (__is(PROP(base_,PROP(fileInfo_,moduleNode)),PROP(name_,PROP(nameDecl_,this))))  {
                //this namespace have the same name as the module
               //do nothing
               ; //prefix is OK
           }
                //this namespace have the same name as the module
           
           else {
                //append modulename to prefix
               // prefix = "#{moduleNode.fileInfo.base}_#{prefix}"
               prefix = _concatAny(3,(any_arr){PROP(base_,PROP(fileInfo_,moduleNode)), any_str("_"), prefix});
           };
           // end if
           
       };
       // end if

       // return prefix
       return prefix;
    return undefined;
    }

    // method produceHeader
    any Grammar_NamespaceDeclaration_produceHeader(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_NamespaceDeclaration));
       //---------

       // var prefix= .makeName()
       var prefix = CALL0(makeName_,this);

       // .out
       __call(out_,this,7,(any_arr){any_str("//-------------------------"), Producer_c_NL, any_str("// namespace "), prefix, Producer_c_NL, any_str("//-------------------------"), Producer_c_NL});

// all namespace methods & props are public

        // add each method
       // var count=0
       var count = any_number(0);
       // var namespaceMethods=[]
       var namespaceMethods = new(Array,0,NULL);
       // for each member in map .nameDecl.members
       any _list66=PROP(members_,PROP(nameDecl_,this));
       { NameValuePair_ptr _nvp16=NULL; //name:value pair
        var member=undefined; //value
       for(int64_t member__inx=0 ; member__inx<_list66.value.arr->length ; member__inx++){
               assert(ITEM(member__inx,_list66).class==&NameValuePair_CLASSINFO);
       _nvp16 = ITEM(member__inx,_list66).value.ptr;
               member=_nvp16->value;
         // where member.name not in ['constructor','length','prototype']
           if(!(__in(PROP(name_,member),3,(any_arr){any_str("constructor"), any_str("length"), any_str("prototype")}))){
               // if member.isProperty
               if (_anyToBool(PROP(isProperty_,member)))  {
                   // .out '    extern var ',prefix,'_',member.name,';',NL
                   __call(out_,this,6,(any_arr){any_str("    extern var "), prefix, any_str("_"), PROP(name_,member), any_str(";"), Producer_c_NL});
               }
               
               else if (_anyToBool(PROP(isMethod_,member)))  {
                   // .out '    extern any ',prefix,'_',member.name,'(DEFAULT_ARGUMENTS);',NL
                   __call(out_,this,6,(any_arr){any_str("    extern any "), prefix, any_str("_"), PROP(name_,member), any_str("(DEFAULT_ARGUMENTS);"), Producer_c_NL});
               };
       }}};// end for each in map PROP(members_,PROP(nameDecl_,this))

         // recurse, add internal classes and namespaces
       // .body.produceDeclaredExternProps prefix, forcePublic=true
       CALL2(produceDeclaredExternProps_,PROP(body_,this),prefix, true);
    return undefined;
    }


    // method produce
    any Grammar_NamespaceDeclaration_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_NamespaceDeclaration));
       //---------

       // var prefix= .makeName()
       var prefix = CALL0(makeName_,this);
       // var isPublic = .hasAdjective('export')
       var isPublic = CALL1(hasAdjective_,this,any_str("export"));

        //logger.debug "produce Namespace",c

// Now on the .c file,

       // .out
       __call(out_,this,7,(any_arr){any_str("//-------------------------"), Producer_c_NL, any_str("//NAMESPACE "), prefix, Producer_c_NL, any_str("//-------------------------"), Producer_c_NL});

       // .body.produceSustance prefix
       CALL1(produceSustance_,PROP(body_,this),prefix);

// __namespaceInit function

       // .out
       __call(out_,this,8,(any_arr){Producer_c_NL, Producer_c_NL, any_str("//------------------"), Producer_c_NL, any_str("void "), prefix, any_str("__namespaceInit(void){"), Producer_c_NL});

       // .body.produceMainFunctionBody prefix
       CALL1(produceMainFunctionBody_,PROP(body_,this),prefix);
       // .out "};",NL
       CALL2(out_,this,any_str("};"), Producer_c_NL);

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
    return undefined;
    }


   // append to class Grammar.ClassDeclaration ###

    // method produceHeader()
    any Grammar_ClassDeclaration_produceHeader(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ClassDeclaration));
       //---------

       // if no .nameDecl, return //shim class
       if (!_anyToBool(PROP(nameDecl_,this))) {return undefined;};

        // keep a list of classes in each moudle, to out __registerClass
       // allClasses.push this
       CALL1(push_,Producer_c_allClasses,this);

       // var c = .nameDecl.getComposedName()
       var c = CALL0(getComposedName_,PROP(nameDecl_,this));

        //logger.debug "produce header class",c

// header

       // .outClassTitleComment c
       CALL1(outClassTitleComment_,this,c);

// In C we create a struct for "instance properties" of each class

       // .out
       __call(out_,this,10,(any_arr){any_str("typedef struct "), c, any_str("_s * "), c, any_str("_ptr;"), Producer_c_NL, any_str("typedef struct "), c, any_str("_s {"), Producer_c_NL});

// out all properties, from the start of the "super-extends" chain

       // .nameDecl.outSuperChainProps this
       CALL1(outSuperChainProps_,PROP(nameDecl_,this),this);

// close instance struct

       // .out NL,"} ",c,"_s;",NL,NL
       __call(out_,this,6,(any_arr){Producer_c_NL, any_str("} "), c, any_str("_s;"), Producer_c_NL, Producer_c_NL});

// and declare extern for class __init

        //declare extern for this class methods
       // .out "extern void ",c,"__init(DEFAULT_ARGUMENTS);",NL
       CALL4(out_,this,any_str("extern void "), c, any_str("__init(DEFAULT_ARGUMENTS);"), Producer_c_NL);


// add each prop to "all properties list", each method to "all methods list"
// and declare extern for each class method

       // var classMethods=[]
       var classMethods = new(Array,0,NULL);

       // var prt = .nameDecl.findOwnMember('prototype')
       var prt = CALL1(findOwnMember_,PROP(nameDecl_,this),any_str("prototype"));
       // for each prtNameDecl in map prt.members
       any _list67=PROP(members_,prt);
       { NameValuePair_ptr _nvp17=NULL; //name:value pair
        var prtNameDecl=undefined; //value
       for(int64_t prtNameDecl__inx=0 ; prtNameDecl__inx<_list67.value.arr->length ; prtNameDecl__inx++){
               assert(ITEM(prtNameDecl__inx,_list67).class==&NameValuePair_CLASSINFO);
       _nvp17 = ITEM(prtNameDecl__inx,_list67).value.ptr;
               prtNameDecl=_nvp17->value;
         // where prtNameDecl.name not in ['constructor','length','prototype']
           if(!(__in(PROP(name_,prtNameDecl),3,(any_arr){any_str("constructor"), any_str("length"), any_str("prototype")}))){
               // if prtNameDecl.isProperty
               if (_anyToBool(PROP(isProperty_,prtNameDecl)))  {
                    // keep a list of all classes props
                   // prtNameDecl.addToAllProperties
                   __call(addToAllProperties_,prtNameDecl,0,NULL);
               }
                    // keep a list of all classes props
               
               else {
                    // keep a list of all classes methods
                   // prtNameDecl.addToAllMethodNames
                   __call(addToAllMethodNames_,prtNameDecl,0,NULL);

                    //declare extern for this class methods
                   // .out "extern any ",c,"_",prtNameDecl.name,"(DEFAULT_ARGUMENTS);",NL
                   __call(out_,this,6,(any_arr){any_str("extern any "), c, any_str("_"), PROP(name_,prtNameDecl), any_str("(DEFAULT_ARGUMENTS);"), Producer_c_NL});
               };
       }}};// end for each in map PROP(members_,prt)
       
    return undefined;
    }


    // method produce()
    any Grammar_ClassDeclaration_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ClassDeclaration));
       //---------

       // if no .nameDecl, return //shim class
       if (!_anyToBool(PROP(nameDecl_,this))) {return undefined;};

        //logger.debug "produce body class",c

// this is the class body, goes on the .c file,

       // var c = .nameDecl.getComposedName()
       var c = CALL0(getComposedName_,PROP(nameDecl_,this));

       // .outClassTitleComment c
       CALL1(outClassTitleComment_,this,c);

       // var hasConstructor: boolean
       var hasConstructor = undefined;
       // for each index,item in .body.statements
       any _list68=PROP(statements_,PROP(body_,this));
       { var item=undefined;
       for(int index=0 ; index<_list68.value.arr->length ; index++){item=ITEM(index,_list68);
           // if item.specific instanceof Grammar.ConstructorDeclaration
           if (_instanceof(PROP(specific_,item),Grammar_ConstructorDeclaration))  {
               // if hasConstructor # what? more than one?
               if (_anyToBool(hasConstructor))  {// # what? more than one?
                   // .throwError('Two constructors declared for class #{c}')
                   CALL1(throwError_,this,_concatAny(2,(any_arr){any_str("Two constructors declared for class "), c}));
               };
               // hasConstructor = true
               hasConstructor = true;
           };
       }};// end for each in PROP(statements_,PROP(body_,this))

// default constructor

       // if not hasConstructor and not .getParent(Grammar.Module).fileInfo.isInterface
       if (!(_anyToBool(hasConstructor)) && !(_anyToBool(PROP(isInterface_,PROP(fileInfo_,CALL1(getParent_,this,Grammar_Module))))))  {
            // produce a default constructor
           // .out
           __call(out_,this,10,(any_arr){any_str("//auto "), c, any_str("__init"), Producer_c_NL, any_str("void "), c, any_str("__init"), Producer_c_DEFAULT_ARGUMENTS, any_str("{"), Producer_c_NL});

           // if .varRefSuper
           if (_anyToBool(PROP(varRefSuper_,this)))  {
               // .out
               __call(out_,this,7,(any_arr){any_str("    "), new(Map,1,(any_arr){
                   _newPair("COMMENT",any_str("//auto call super class __init"))
                   })
, Producer_c_NL, any_str("    "), PROP(varRefSuper_,this), any_str("__init(this,argc,arguments);"), Producer_c_NL});
           };

           // .body.producePropertiesInitialValueAssignments '((#{c}_ptr)this.value.ptr)->'
           CALL1(producePropertiesInitialValueAssignments_,PROP(body_,this),_concatAny(3,(any_arr){any_str("(("), c, any_str("_ptr)this.value.ptr)->")}));

            // end default constructor
           // .out "};",NL
           CALL2(out_,this,any_str("};"), Producer_c_NL);
       };

// produce class body

       // .body.produce
       __call(produce_,PROP(body_,this),0,NULL);
       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
    return undefined;
    }


// -------------------------------------
    // helper method outClassTitleComment(c:string)
    any Grammar_ClassDeclaration_outClassTitleComment(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ClassDeclaration));
       //---------
       // define named params
       var c= argc? arguments[0] : undefined;
       //---------

       // .out
       __call(out_,this,8,(any_arr){any_str("\n\n//--------------"), Producer_c_NL, new(Map,1,(any_arr){
           _newPair("COMMENT",c)
           })
, Producer_c_NL, _concatAny(3,(any_arr){any_str("any "), c, any_str("; //Class ")}), c, _anyToBool(PROP(varRefSuper_,this)) ? new(Array,3,(any_arr){any_str(" extends "), PROP(varRefSuper_,this), Producer_c_NL}) : any_EMPTY_STR, Producer_c_NL});
    return undefined;
    }


// -------------------------------------
    // method produceStaticListMethodsAndProps
    any Grammar_ClassDeclaration_produceStaticListMethodsAndProps(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ClassDeclaration));
       //---------

// static definition info for each class: list of _METHODS and _PROPS

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
       // if .constructor isnt Grammar.ClassDeclaration, return
       if (!__is(any_class(this.class),Grammar_ClassDeclaration)) {return undefined;};

       // var c = .nameDecl.getComposedName()
       var c = CALL0(getComposedName_,PROP(nameDecl_,this));

       // .out
       __call(out_,this,13,(any_arr){any_str("//-----------------------"), Producer_c_NL, any_str("// Class "), c, any_str(": static list of METHODS(verbs) and PROPS(things)"), Producer_c_NL, any_str("//-----------------------"), Producer_c_NL, Producer_c_NL, any_str("static _methodInfoArr "), c, any_str("_METHODS = {"), Producer_c_NL});

       // var propList=[]
       var propList = new(Array,0,NULL);
       // var prt = .nameDecl.findOwnMember('prototype')
       var prt = CALL1(findOwnMember_,PROP(nameDecl_,this),any_str("prototype"));
       // for each nameDecl in map prt.members
       any _list69=PROP(members_,prt);
       { NameValuePair_ptr _nvp18=NULL; //name:value pair
        var nameDecl=undefined; //value
       for(int64_t nameDecl__inx=0 ; nameDecl__inx<_list69.value.arr->length ; nameDecl__inx++){
               assert(ITEM(nameDecl__inx,_list69).class==&NameValuePair_CLASSINFO);
       _nvp18 = ITEM(nameDecl__inx,_list69).value.ptr;
               nameDecl=_nvp18->value;
         // where nameDecl.name not in ['constructor','length','prototype']
           if(!(__in(PROP(name_,nameDecl),3,(any_arr){any_str("constructor"), any_str("length"), any_str("prototype")}))){
               // if nameDecl.isMethod
               if (_anyToBool(PROP(isMethod_,nameDecl)))  {
                   // .out '  { #{makeSymbolName(nameDecl.name)}, #{c}_#{nameDecl.name} },',NL
                   CALL2(out_,this,_concatAny(7,(any_arr){any_str("  { "), (Producer_c_makeSymbolName(undefined,1,(any_arr){PROP(name_,nameDecl)})), any_str(", "), c, any_str("_"), PROP(name_,nameDecl), any_str(" },")}), Producer_c_NL);
               }
               
               else {
                   // propList.push makeSymbolName(nameDecl.name)
                   CALL1(push_,propList,Producer_c_makeSymbolName(undefined,1,(any_arr){PROP(name_,nameDecl)}));
               };
       }}};// end for each in map PROP(members_,prt)

       // .out
       __call(out_,this,12,(any_arr){Producer_c_NL, any_str("{0,0}}; //method jmp table initializer end mark"), Producer_c_NL, Producer_c_NL, any_str("static _posTableItem_t "), c, any_str("_PROPS[] = {"), Producer_c_NL, new(Map,2,(any_arr){
           _newPair("CSL",propList), 
           _newPair("post",any_str("\n    "))
           })
, any_str("};"), Producer_c_NL, Producer_c_NL});
    return undefined;
    }

    // method produceClassRegistration
    any Grammar_ClassDeclaration_produceClassRegistration(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ClassDeclaration));
       //---------

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
       // if .constructor isnt Grammar.ClassDeclaration, return
       if (!__is(any_class(this.class),Grammar_ClassDeclaration)) {return undefined;};

       // var c = .nameDecl.getComposedName()
       var c = CALL0(getComposedName_,PROP(nameDecl_,this));

       // var superName = .nameDecl.superDecl? .nameDecl.superDecl.getComposedName() else 'Object'
       var superName = _anyToBool(PROP(superDecl_,PROP(nameDecl_,this))) ? CALL0(getComposedName_,PROP(superDecl_,PROP(nameDecl_,this))) : any_str("Object");

       // .out
       __call(out_,this,7,(any_arr){_concatAny(11,(any_arr){any_str("    "), c, any_str(" =_newClass(\""), c, any_str("\", "), c, any_str("__init, sizeof(struct "), c, any_str("_s), "), superName, any_str(".value.classINFOptr);")}), Producer_c_NL, _concatAny(5,(any_arr){any_str("    _declareMethods("), c, any_str(", "), c, any_str("_METHODS);")}), Producer_c_NL, _concatAny(7,(any_arr){any_str("    _declareProps("), c, any_str(", "), c, any_str("_PROPS, sizeof "), c, any_str("_PROPS);")}), Producer_c_NL, Producer_c_NL});
    return undefined;
    }

// -------------------------------------
   // append to class Names.Declaration
    // method outSuperChainProps(node:Grammar.ClassDeclaration) #recursive
    any Names_Declaration_outSuperChainProps(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var node= argc? arguments[0] : undefined;
       //---------

// out all properties of a class, including those of the super's-chain

       // if .superDecl, .superDecl.outSuperChainProps node #recurse
       if (_anyToBool(PROP(superDecl_,this))) {CALL1(outSuperChainProps_,PROP(superDecl_,this),node);};

       // node.out '    //',.name,NL
       CALL3(out_,node,any_str("    //"), PROP(name_,this), Producer_c_NL);
       // var prt = .ownMember('prototype')
       var prt = CALL1(ownMember_,this,any_str("prototype"));
       // if no prt, .sayErr "class #{.name} has no prototype"
       if (!_anyToBool(prt)) {CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("class "), PROP(name_,this), any_str(" has no prototype")}));};

       // for each prtNameDecl in map prt.members
       any _list70=PROP(members_,prt);
       { NameValuePair_ptr _nvp19=NULL; //name:value pair
        var prtNameDecl=undefined; //value
       for(int64_t prtNameDecl__inx=0 ; prtNameDecl__inx<_list70.value.arr->length ; prtNameDecl__inx++){
               assert(ITEM(prtNameDecl__inx,_list70).class==&NameValuePair_CLASSINFO);
       _nvp19 = ITEM(prtNameDecl__inx,_list70).value.ptr;
               prtNameDecl=_nvp19->value;
         // where prtNameDecl.name not in ['constructor','length','prototype']
           if(!(__in(PROP(name_,prtNameDecl),3,(any_arr){any_str("constructor"), any_str("length"), any_str("prototype")}))){
               // if prtNameDecl.isProperty
               if (_anyToBool(PROP(isProperty_,prtNameDecl)))  {
                   // node.out '    any ',prtNameDecl.name,";",NL
                   CALL4(out_,node,any_str("    any "), PROP(name_,prtNameDecl), any_str(";"), Producer_c_NL);
               };
       }}};// end for each in map PROP(members_,prt)
       
    return undefined;
    }



   // append to class Grammar.Body

// A "Body" is an ordered list of statements.

// "Body"s lines have all the same indent, representing a scope.

// "Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

    // method produce()
    any Grammar_Body_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Body));
       //---------

       // for each statement in .statements
       any _list71=PROP(statements_,this);
       { var statement=undefined;
       for(int statement__inx=0 ; statement__inx<_list71.value.arr->length ; statement__inx++){statement=ITEM(statement__inx,_list71);
         // statement.produce()
         CALL0(produce_,statement);
       }};// end for each in PROP(statements_,this)

       // .out NL
       CALL1(out_,this,Producer_c_NL);
    return undefined;
    }

    // method produceDeclaredExternProps(parentName,forcePublic)
    any Grammar_Body_produceDeclaredExternProps(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Body));
       //---------
       // define named params
       var parentName, forcePublic;
       parentName=forcePublic=undefined;
       switch(argc){
         case 2:forcePublic=arguments[1];
         case 1:parentName=arguments[0];
       }
       //---------

       // var prefix = parentName? "#{parentName}_" else ""
       var prefix = _anyToBool(parentName) ? _concatAny(2,(any_arr){parentName, any_str("_")}) : any_EMPTY_STR;

        // add each declared prop as a extern prefixed var
       // for each item in .statements
       any _list72=PROP(statements_,this);
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list72.value.arr->length ; item__inx++){item=ITEM(item__inx,_list72);

           // var isPublic = forcePublic or item.hasAdjective('export')
           var isPublic = __or(forcePublic,CALL1(hasAdjective_,item,any_str("export")));

           // switch item.specific.constructor
           any _switch6=any_class(PROP(specific_,item).class);
                // case Grammar.VarStatement:
           if (__is(_switch6,Grammar_VarStatement)){
                    // declare item.specific:Grammar.VarStatement
                   // if isPublic, .out 'extern var ',{pre:prefix, CSL:item.specific.getNames()},";",NL
                   if (_anyToBool(isPublic)) {CALL4(out_,this,any_str("extern var "), new(Map,2,(any_arr){
                   _newPair("pre",prefix), 
                   _newPair("CSL",CALL0(getNames_,PROP(specific_,item)))
                   })
, any_str(";"), Producer_c_NL);};
           
           }// case Grammar.FunctionDeclaration:
           else if (__is(_switch6,Grammar_FunctionDeclaration)){
                    // declare item.specific:Grammar.FunctionDeclaration
                    //export module function
                   // if isPublic, .out 'extern any ',prefix,item.specific.name,"(DEFAULT_ARGUMENTS);",NL
                   if (_anyToBool(isPublic)) {__call(out_,this,5,(any_arr){any_str("extern any "), prefix, PROP(name_,PROP(specific_,item)), any_str("(DEFAULT_ARGUMENTS);"), Producer_c_NL});};
           
           }// case Grammar.ClassDeclaration, Grammar.AppendToDeclaration:
           else if (__is(_switch6,Grammar_ClassDeclaration)||__is(_switch6,Grammar_AppendToDeclaration)){
                    // declare item.specific:Grammar.ClassDeclaration
                    //produce class header declarations
                   // item.specific.produceHeader
                   __call(produceHeader_,PROP(specific_,item),0,NULL);
           
           }// case Grammar.NamespaceDeclaration:
           else if (__is(_switch6,Grammar_NamespaceDeclaration)){
                    // declare item.specific:Grammar.NamespaceDeclaration
                   // item.specific.produceHeader #recurses
                   __call(produceHeader_,PROP(specific_,item),0,NULL);// #recurses
           
           };
       }};// end for each in PROP(statements_,this)
       
    return undefined;
    }
                    // as in JS, always public. Must produce, can have classes inside


    // method produceSustance(prefix)
    any Grammar_Body_produceSustance(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Body));
       //---------
       // define named params
       var prefix= argc? arguments[0] : undefined;
       //---------

// before main function,
// produce body sustance: vars & other functions declarations

       // var produceSecond: array of Grammar.Statement = []
       var produceSecond = new(Array,0,NULL);
       // var produceThird: array of Grammar.Statement = []
       var produceThird = new(Array,0,NULL);

       // for each item in .statements
       any _list73=PROP(statements_,this);
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list73.value.arr->length ; item__inx++){item=ITEM(item__inx,_list73);

           // if item.specific instanceof Grammar.VarDeclList // PropertiesDeclaration & VarStatement
           if (_instanceof(PROP(specific_,item),Grammar_VarDeclList))  { // PropertiesDeclaration & VarStatement
                // declare item.specific:Grammar.VarDeclList
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
               // .out 'var ',{pre:"#{prefix}_", CSL:item.specific.getNames()},";",NL
               CALL4(out_,this,any_str("var "), new(Map,2,(any_arr){
               _newPair("pre",_concatAny(2,(any_arr){prefix, any_str("_")})), 
               _newPair("CSL",CALL0(getNames_,PROP(specific_,item)))
               })
, any_str(";"), Producer_c_NL);
           }

            //since C require to define a fn before usage. we make forward declarations
           
           else if (__is(any_class(PROP(specific_,item).class),Grammar_FunctionDeclaration))  {
                // declare item.specific:Grammar.FunctionDeclaration
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
               // .out 'any ',prefix,'_',item.specific.name,"(DEFAULT_ARGUMENTS); //forward declare",NL
               __call(out_,this,6,(any_arr){any_str("any "), prefix, any_str("_"), PROP(name_,PROP(specific_,item)), any_str("(DEFAULT_ARGUMENTS); //forward declare"), Producer_c_NL});
               // produceThird.push item
               CALL1(push_,produceThird,item);
           }
           
           else if (__is(any_class(PROP(specific_,item).class),Grammar_ClassDeclaration))  {
                // declare item.specific:Grammar.ClassDeclaration
               // item.specific.produceStaticListMethodsAndProps
               __call(produceStaticListMethodsAndProps_,PROP(specific_,item),0,NULL);
               // produceSecond.push item.specific
               CALL1(push_,produceSecond,PROP(specific_,item));
           }
           
           else if (__is(any_class(PROP(specific_,item).class),Grammar_NamespaceDeclaration))  {
                // declare item.specific:Grammar.NamespaceDeclaration
               // produceSecond.push item.specific #recurses
               CALL1(push_,produceSecond,PROP(specific_,item));// #recurses
           }
           
           else if (__is(any_class(PROP(specific_,item).class),Grammar_AppendToDeclaration))  {
               // item.specific.callOnSubTree 'produceStaticListMethodsAndProps' //if there are internal classes
               CALL1(callOnSubTree_,PROP(specific_,item),any_str("produceStaticListMethodsAndProps")); //if there are internal classes
               // produceThird.push item
               CALL1(push_,produceThird,item);
           }
           
           else if (_anyToBool(CALL0(isDeclaration_,item)))  {
               // produceThird.push item
               CALL1(push_,produceThird,item);
           };
       }};// end for each in PROP(statements_,this)

       // end for //produce vars functions & classes sustance

       // for each item in produceSecond //class & namespace sustance
       any _list74=produceSecond;
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list74.value.arr->length ; item__inx++){item=ITEM(item__inx,_list74);
           // item.produce
           __call(produce_,item,0,NULL);
       }};// end for each in produceSecond

       // for each item in produceThird //other declare statements
       any _list75=produceThird;
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list75.value.arr->length ; item__inx++){item=ITEM(item__inx,_list75);
           // item.produce
           __call(produce_,item,0,NULL);
       }};// end for each in produceThird
       
    return undefined;
    }


    // method produceMainFunctionBody(prefix)
    any Grammar_Body_produceMainFunctionBody(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Body));
       //---------
       // define named params
       var prefix= argc? arguments[0] : undefined;
       //---------

// First: register user classes

       // .callOnSubTree 'produceClassRegistration'
       CALL1(callOnSubTree_,this,any_str("produceClassRegistration"));

// Second: recurse for namespaces

       // .callOnSubTree 'produceCallNamespaceInit'
       CALL1(callOnSubTree_,this,any_str("produceCallNamespaceInit"));

// Third: assign values for module vars.
// if there is var or properties with assigned values, produce those assignment.
// User classes must be registered previously, in case the module vars use them as initial values.

       // for each item in .statements
       any _list76=PROP(statements_,this);
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list76.value.arr->length ; item__inx++){item=ITEM(item__inx,_list76);
         // where item.specific instanceof Grammar.VarDeclList //for modules:VarStatement, for Namespaces: PropertiesDeclaration
           if(_instanceof(PROP(specific_,item),Grammar_VarDeclList)){
                // declare item.specific:Grammar.VarDeclList
               // for each variableDecl in item.specific.list
               any _list77=PROP(list_,PROP(specific_,item));
               { var variableDecl=undefined;
               for(int variableDecl__inx=0 ; variableDecl__inx<_list77.value.arr->length ; variableDecl__inx++){variableDecl=ITEM(variableDecl__inx,_list77);
                 // where variableDecl.assignedValue
                   if(_anyToBool(PROP(assignedValue_,variableDecl))){
                       // .out '    ',prefix,'_',variableDecl.name,' = ', variableDecl.assignedValue,";",NL
                       __call(out_,this,8,(any_arr){any_str("    "), prefix, any_str("_"), PROP(name_,variableDecl), any_str(" = "), PROP(assignedValue_,variableDecl), any_str(";"), Producer_c_NL});
               }}};// end for each in PROP(list_,PROP(specific_,item))
               
       }}};// end for each in PROP(statements_,this)


        // all other loose statements in module body
       // .produceLooseExecutableStatements()
       CALL0(produceLooseExecutableStatements_,this);
    return undefined;
    }


    // method producePropertiesInitialValueAssignments(fullPrefix)
    any Grammar_Body_producePropertiesInitialValueAssignments(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Body));
       //---------
       // define named params
       var fullPrefix= argc? arguments[0] : undefined;
       //---------

// if there is var or properties with assigned values, produce those assignment

       // for each item in .statements
       any _list78=PROP(statements_,this);
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list78.value.arr->length ; item__inx++){item=ITEM(item__inx,_list78);
         // where item.specific.constructor is Grammar.PropertiesDeclaration
           if(__is(any_class(PROP(specific_,item).class),Grammar_PropertiesDeclaration)){
                // declare item.specific:Grammar.PropertiesDeclaration
               // for each variableDecl in item.specific.list
               any _list79=PROP(list_,PROP(specific_,item));
               { var variableDecl=undefined;
               for(int variableDecl__inx=0 ; variableDecl__inx<_list79.value.arr->length ; variableDecl__inx++){variableDecl=ITEM(variableDecl__inx,_list79);
                 // where variableDecl.assignedValue
                   if(_anyToBool(PROP(assignedValue_,variableDecl))){
                       // .out 'PROP(',variableDecl.name,'_,this)=',variableDecl.assignedValue,";",NL
                       __call(out_,this,6,(any_arr){any_str("PROP("), PROP(name_,variableDecl), any_str("_,this)="), PROP(assignedValue_,variableDecl), any_str(";"), Producer_c_NL});
               }}};// end for each in PROP(list_,PROP(specific_,item))
               
       }}};// end for each in PROP(statements_,this)
       
    return undefined;
    }


    // method produceLooseExecutableStatements()
    any Grammar_Body_produceLooseExecutableStatements(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Body));
       //---------
        // all loose executable statements in a namespace or module body
       // for each item in .statements
       any _list80=PROP(statements_,this);
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list80.value.arr->length ; item__inx++){item=ITEM(item__inx,_list80);
         // where item.isExecutableStatement()
           if(_anyToBool(CALL0(isExecutableStatement_,item))){
               // item.produce //produce here
               __call(produce_,item,0,NULL); //produce here
       }}};// end for each in PROP(statements_,this)
       
    return undefined;
    }


// -------------------------------------
   // append to class Grammar.Statement ###

// `Statement` objects call their specific statement node's `produce()` method
// after adding any comment lines preceding the statement

     // method produce()
     any Grammar_Statement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Statement));
       //---------

        // declare valid .specific.body

// add comment lines, in the same position as the source

       // .outPrevLinesComments()
       CALL0(outPrevLinesComments_,this);

// To ease reading of compiled code, add original Lite line as comment

       // if .lexer.options.comments
       if (_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this)))))  {
         // if .lexer.outCode.lastOriginalCodeComment<.lineInx
         if (_anyToNumber(PROP(lastOriginalCodeComment_,PROP(outCode_,PROP(lexer_,this)))) < _anyToNumber(PROP(lineInx_,this)))  {
           // if not (.specific.constructor in [
           if (!((__in(any_class(PROP(specific_,this).class),3,(any_arr){Grammar_CompilerStatement, Grammar_DeclareStatement, Grammar_DoNothingStatement}))))  {
             // .out {COMMENT: .lexer.infoLines[.lineInx].text.trim()},NL
             CALL2(out_,this,new(Map,1,(any_arr){
             _newPair("COMMENT",CALL0(trim_,PROP(text_,ITEM(_anyToNumber(PROP(lineInx_,this)),PROP(infoLines_,PROP(lexer_,this))))))
             })
, Producer_c_NL);
           };
         };
         // .lexer.outCode.lastOriginalCodeComment = .lineInx
         PROP(lastOriginalCodeComment_,PROP(outCode_,PROP(lexer_,this))) = PROP(lineInx_,this);
       };

// Each statement in its own line

       // if .specific isnt instance of Grammar.SingleLineBody
       if (!(_instanceof(PROP(specific_,this),Grammar_SingleLineBody)))  {
         // .lexer.outCode.ensureNewLine
         __call(ensureNewLine_,PROP(outCode_,PROP(lexer_,this)),0,NULL);
       };

// if there are one or more 'into var x' in a expression in this statement,
// declare vars before the statement (exclude body of FunctionDeclaration)

       // var methodToCall = LiteCore.getSymbol('declareIntoVar')
       var methodToCall = LiteCore_getSymbol(undefined,1,(any_arr){any_str("declareIntoVar")});
       // this.callOnSubTree methodToCall, excludeClass=Grammar.Body
       CALL2(callOnSubTree_,this,methodToCall, Grammar_Body);

// call the specific statement (if,for,print,if,function,class,etc) .produce()

       // var mark = .lexer.outCode.markSourceMap(.indent)
       var mark = CALL1(markSourceMap_,PROP(outCode_,PROP(lexer_,this)),PROP(indent_,this));
       // .out .specific
       CALL1(out_,this,PROP(specific_,this));

// add ";" after the statement
// then EOL comment (if it isnt a multiline statement)
// then NEWLINE

       // if not .specific.skipSemiColon
       if (!(_anyToBool(PROP(skipSemiColon_,PROP(specific_,this)))))  {
         // .addSourceMap mark
         CALL1(addSourceMap_,this,mark);
         // .out ";"
         CALL1(out_,this,any_str(";"));
         // if not .specific.body
         if (!(_anyToBool(PROP(body_,PROP(specific_,this)))))  {
           // .out .getEOLComment()
           CALL1(out_,this,CALL0(getEOLComment_,this));
         };
       };
     return undefined;
     }

// helper function to determine if a statement is a declaration (can be outside a funcion in "C")
// or a "statement" (must be inside a funcion in "C")

     // helper method isDeclaration returns boolean
     any Grammar_Statement_isDeclaration(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Statement));
       //---------

       // return .specific is instance of Grammar.ClassDeclaration
       return __or(__or(__or(any_number(_instanceof(PROP(specific_,this),Grammar_ClassDeclaration)),any_number(_instanceof(PROP(specific_,this),Grammar_FunctionDeclaration))),any_number(_instanceof(PROP(specific_,this),Grammar_VarStatement))),any_number(__in(any_class(PROP(specific_,this).class),3,(any_arr){Grammar_ImportStatement, Grammar_DeclareStatement, Grammar_CompilerStatement})));
     return undefined;
     }

     // helper method isExecutableStatement returns boolean
     any Grammar_Statement_isExecutableStatement(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Statement));
       //---------

       // return not .isDeclaration()
       return any_number(!(_anyToBool(CALL0(isDeclaration_,this))));
     return undefined;
     }

// called above, pre-declare vars from 'into var x' assignment-expression

   // append to class Grammar.Oper
     // method declareIntoVar()
     any Grammar_Oper_declareIntoVar(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,Grammar_Oper));
         //---------
         // if .intoVar
         if (_anyToBool(PROP(intoVar_,this)))  {
             // .out "var ",.right,"=undefined;",NL
             CALL4(out_,this,any_str("var "), PROP(right_,this), any_str("=undefined;"), Producer_c_NL);
         };
     return undefined;
     }


// ---------------------------------
   // append to class Grammar.ThrowStatement ###

     // method produce()
     any Grammar_ThrowStatement_produce(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,Grammar_ThrowStatement));
         //---------
         // if .specifier is 'fail'
         if (__is(PROP(specifier_,this),any_str("fail")))  {
           // .out "throw(new(Error,1,(any_arr){",.expr,"}));"
           CALL3(out_,this,any_str("throw(new(Error,1,(any_arr){"), PROP(expr_,this), any_str("}));"));
         }
         
         else {
           // .out "throw(",.expr,")"
           CALL3(out_,this,any_str("throw("), PROP(expr_,this), any_str(")"));
         };
     return undefined;
     }


   // append to class Grammar.ReturnStatement ###

     // method produce()
     any Grammar_ReturnStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ReturnStatement));
       //---------
       // var defaultReturn = .getParent(Grammar.ConstructorDeclaration)? '' else 'undefined'
       var defaultReturn = _anyToBool(CALL1(getParent_,this,Grammar_ConstructorDeclaration)) ? any_EMPTY_STR : any_str("undefined");


// we need to unwind try-catch blocks, to calculate to which active exception frame
// we're "returning" to

       // var countTryBlocks = 0
       var countTryBlocks = any_number(0);
       // var node:ASTBase = this.parent
       var node = PROP(parent_,this);
       // do until node instance of Grammar.FunctionDeclaration
       while(!(_instanceof(node,Grammar_FunctionDeclaration))){

           // if node.constructor is Grammar.TryCatch
           if (__is(any_class(node.class),Grammar_TryCatch))  {
                //a return inside a "TryCatch" block
               // countTryBlocks++ //we need to explicitly unwind
               countTryBlocks.value.number++; //we need to explicitly unwind
           };

           // node = node.parent
           node = PROP(parent_,node);
       };// end loop

// we reached function header here.
// if the function had a ExceptionBlock, we need to unwind
// because an auto "try{" is inserted at function start

        // declare node:Grammar.FunctionDeclaration
       // if node.hasExceptionBlock, countTryBlocks++
       if (_anyToBool(PROP(hasExceptionBlock_,node))) {countTryBlocks.value.number++;};

       // if countTryBlocks
       if (_anyToBool(countTryBlocks))  {
           // .out "{e4c_exitTry(",countTryBlocks,");"
           CALL3(out_,this,any_str("{e4c_exitTry("), countTryBlocks, any_str(");"));
       };

       // .out 'return ',.expr or defaultReturn
       CALL2(out_,this,any_str("return "), __or(PROP(expr_,this),defaultReturn));

       // if countTryBlocks
       if (_anyToBool(countTryBlocks))  {
           // .out ";}"
           CALL1(out_,this,any_str(";}"));
       };
     return undefined;
     }


   // append to class Grammar.FunctionCall ###

     // method produce()
     any Grammar_FunctionCall_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_FunctionCall));
       //---------

// Check if varRef "executes"
// (a varRef executes if last accessor is "FunctionCall" or it has --/++)

// if varRef do not "executes" add "FunctionCall",
// so varRef production adds (),
// and C/JS executes the function call

       // if no .varRef.executes, .varRef.addAccessor new Grammar.FunctionAccess(.varRef)
       if (!_anyToBool(PROP(executes_,PROP(varRef_,this)))) {CALL1(addAccessor_,PROP(varRef_,this),new(Grammar_FunctionAccess,1,(any_arr){PROP(varRef_,this)}));};

       // var result = .varRef.calcReference()
       var result = CALL0(calcReference_,PROP(varRef_,this));
       // .out result
       CALL1(out_,this,result);
     return undefined;
     }


   // append to class Grammar.Operand ###

// `Operand:
  // |NumberLiteral|StringLiteral|RegExpLiteral
  // |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  // |VariableRef

// A `Operand` is the left or right part of a binary oper
// or the only Operand of a unary oper.

     // properties
     ;

     // method produce()
     any Grammar_Operand_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Operand));
       //---------

       // var pre,post
       var pre = undefined, post = undefined;

       // if .name instance of Grammar.StringLiteral
       if (_instanceof(PROP(name_,this),Grammar_StringLiteral))  {
            // declare .name:Grammar.StringLiteral
            // in C we only have "" to define strings, '' are for char constants
            // if the StringLiteral is defined with '', change to "" and escape all internal \"
           // var strValue:string = .name.name
           var strValue = PROP(name_,PROP(name_,this));
           // if strValue.charAt(0) is "'"
           if (__is(CALL1(charAt_,strValue,any_number(0)),any_str("'")))  {
               // strValue = .name.getValue() // w/o quotes
               strValue = CALL0(getValue_,PROP(name_,this)); // w/o quotes
               // strValue = strValue.replaceAll("\"",'\\"') // escape internal " => \"
               strValue = CALL2(replaceAll_,strValue,any_str("\""), any_str("\\\"")); // escape internal " => \"
               // strValue = '"#{strValue}"' // enclose in ""
               strValue = _concatAny(3,(any_arr){any_str("\""), strValue, any_str("\"")}); // enclose in ""
           };

           // if strValue is '""'
           if (__is(strValue,any_str("\"\"")))  {
               // .out "any_EMPTY_STR"
               CALL1(out_,this,any_str("any_EMPTY_STR"));
           }
           
           else if (__is(PROP(produceType_,this),any_str("Number")) && (_anyToBool(__or(any_number(__is(any_number(_length(strValue)),any_number(3))),any_number(__is(CALL1(charAt_,strValue,any_number(1)),any_str("/")) && __is(any_number(_length(strValue)),any_number(4)))))))  { //a single char (maybe escaped)
               // .out "'", strValue.slice(1,-1), "'" // out as C 'char' (C char = byte, a numeric value)
               CALL3(out_,this,any_str("'"), CALL2(slice_,strValue,any_number(1), any_number(-1)), any_str("'")); // out as C 'char' (C char = byte, a numeric value)
           }
           
           else {
               // .out "any_str(",strValue,")"
               CALL3(out_,this,any_str("any_str("), strValue, any_str(")"));
           };

           // .out .accessors
           CALL1(out_,this,PROP(accessors_,this));
       }
       
       else if (_instanceof(PROP(name_,this),Grammar_NumberLiteral))  {

           // if .produceType is 'any'
           if (__is(PROP(produceType_,this),any_str("any")))  {
               // pre="any_number("
               pre = any_str("any_number(");
               // post=")"
               post = any_str(")");
           };

           // .out pre,.name,.accessors,post
           CALL4(out_,this,pre, PROP(name_,this), PROP(accessors_,this), post);
       }
       
       else if (_instanceof(PROP(name_,this),Grammar_VariableRef))  {
            // declare .name:Grammar.VariableRef
           // .name.produceType = .produceType
           PROP(produceType_,PROP(name_,this)) = PROP(produceType_,this);
           // .out .name
           CALL1(out_,this,PROP(name_,this));
       }
       
       else {
            // declare valid .name.produceType
           // .name.produceType = .produceType
           PROP(produceType_,PROP(name_,this)) = PROP(produceType_,this);
           // .out .name, .accessors
           CALL2(out_,this,PROP(name_,this), PROP(accessors_,this));
       };

       // end if
       
     return undefined;
     }

      // #end Operand


   // append to class Grammar.UnaryOper ###

// `UnaryOper: ('-'|new|type of|not|no|bitwise not) `

// A Unary Oper is an operator acting on a single operand.
// Unary Oper inherits from Oper, so both are `instance of Oper`

// Examples:
// 1) `not`     *boolean negation*     `if not a is b`
// 2) `-`       *numeric unary minus*  `-(4+3)`
// 3) `new`     *instantiation*        `x = new classNumber[2]`
// 4) `type of` *type name access*     `type of x is classNumber[2]`
// 5) `no`      *'falsey' check*       `if no options then options={}`
// 6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

     // method produce()
     any Grammar_UnaryOper_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_UnaryOper));
       //---------

       // var translated = operTranslate(.name)
       var translated = Producer_c_operTranslate(undefined,1,(any_arr){PROP(name_,this)});
       // var prepend,append
       var prepend = undefined, append = undefined;

// Consider "not":
// if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
// -(prettier generated code) do not add () for simple "falsey" variable check: "if no x"

       // if translated is "!"
       if (__is(translated,any_str("!")))  {
           // if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
           if (!((__is(PROP(name_,this),any_str("no")) && _instanceof(PROP(name_,PROP(right_,this)),Grammar_VariableRef))))  {
               // prepend ="("
               prepend = any_str("(");
               // append=")"
               append = any_str(")");
           };
       };

// Special cases

       // var pre,post
       var pre = undefined, post = undefined;

       // if translated is "new" and .right.name instance of Grammar.VariableRef
       if (__is(translated,any_str("new")) && _instanceof(PROP(name_,PROP(right_,this)),Grammar_VariableRef))  {
            // declare .right.name:Grammar.VariableRef
           // .out "new(", .right.name.calcReference(callNew=true)
           CALL2(out_,this,any_str("new("), CALL1(calcReference_,PROP(name_,PROP(right_,this)),true));
           // return
           return undefined;
       };

       // if translated is "typeof"
       if (__is(translated,any_str("typeof")))  {
           // pre="_typeof("
           pre = any_str("_typeof(");
           // translated=""
           translated = any_EMPTY_STR;
           // post=")"
           post = any_str(")");
       }
       
       else {
           // if .produceType is 'any'
           if (__is(PROP(produceType_,this),any_str("any")))  {
               // pre="any_number("
               pre = any_str("any_number(");
               // post=")"
               post = any_str(")");
           };

           // .right.produceType = translated is "!"? 'Bool' else 'Number' //Except "!", unary opers require numbers
           PROP(produceType_,PROP(right_,this)) = __is(translated,any_str("!")) ? any_str("Bool") : any_str("Number"); //Except "!", unary opers require numbers
       };

       // end if

//add a space if the unary operator is a word. Example `typeof`
//            if /\w/.test(translated), translated+=" "

       // .out pre, translated, prepend, .right, append, post
       __call(out_,this,6,(any_arr){pre, translated, prepend, PROP(right_,this), append, post});
     return undefined;
     }


   // append to class Grammar.Oper ###

     // properties
     ;

     // method produce()
     any Grammar_Oper_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Oper));
       //---------

       // var oper = .name
       var oper = PROP(name_,this);

// Discourage string concat using '+':

// +, the infamous js string concat. You should not use + to concat strings. use string interpolation instead.
// e.g.: DO NOT: `stra+": "+strb`   DO: `"#{stra}: #{strb}"`

       // if oper is '+'
       if (__is(oper,any_str("+")))  {
           // var lresultNameDecl = .left.getResultType()
           var lresultNameDecl = CALL0(getResultType_,PROP(left_,this));
           // var rresultNameDecl = .right.getResultType()
           var rresultNameDecl = CALL0(getResultType_,PROP(right_,this));
           // if (lresultNameDecl and lresultNameDecl.isInstanceof('String'))
           if (_anyToBool(__or((any_number(_anyToBool(lresultNameDecl) && _anyToBool(CALL1(isInstanceof_,lresultNameDecl,any_str("String"))))),(any_number(_anyToBool(rresultNameDecl) && _anyToBool(CALL1(isInstanceof_,rresultNameDecl,any_str("String"))))))))  {
                   // .sayErr "You should not use + to concat strings. use string interpolation instead.\ne.g.: DO: \"#\{stra}: #\{strb}\"  vs.  DO NOT: stra + \": \" + strb"
                   CALL1(sayErr_,this,any_str("You should not use + to concat strings. use string interpolation instead.\ne.g.: DO: \"#\{stra}: #\{strb}\"  vs.  DO NOT: stra + \": \" + strb"));
           };
       };

// default mechanism to handle 'negated' operand

       // var toAnyPre, toAnyPost
       var toAnyPre = undefined, toAnyPost = undefined;
       // if .produceType is 'any'
       if (__is(PROP(produceType_,this),any_str("any")))  {
           // toAnyPre = 'any_number('
           toAnyPre = any_str("any_number(");
           // toAnyPost = ")"
           toAnyPost = any_str(")");
       };

       // var prepend,append
       var prepend = undefined, append = undefined;
       // if .negated # NEGATED
       if (_anyToBool(PROP(negated_,this)))  {// # NEGATED

// else -if NEGATED- we add `!( )` to the expression

               // prepend ="!("
               prepend = any_str("!(");
               // append=")"
               append = any_str(")");
       };

// Check for special cases:

// 1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
// example: `x in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))>=0`
// example: `x not in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))==-1`
// example: `char not in myString` -> `indexOf(char,myString)==-1`

       // switch .name
       any _switch7=PROP(name_,this);
          // case 'in':
       if (__is(_switch7,any_str("in"))){
           // if .right.name instanceof Grammar.ArrayLiteral
           if (_instanceof(PROP(name_,PROP(right_,this)),Grammar_ArrayLiteral))  {
               // var haystack:Grammar.ArrayLiteral = .right.name
               var haystack = PROP(name_,PROP(right_,this));
               // .out toAnyPre,prepend,"__in(",.left,",",haystack.items.length,",(any_arr){",{CSL:haystack.items},"})",append,toAnyPost
               __call(out_,this,11,(any_arr){toAnyPre, prepend, any_str("__in("), PROP(left_,this), any_str(","), any_number(_length(PROP(items_,haystack))), any_str(",(any_arr){"), new(Map,1,(any_arr){
               _newPair("CSL",PROP(items_,haystack))
               })
, any_str("})"), append, toAnyPost});
           }
           
           else {
               // .out toAnyPre,"CALL1(indexOf_,",.right,",",.left,").value.number", .negated? "==-1" : ">=0",toAnyPost
               __call(out_,this,8,(any_arr){toAnyPre, any_str("CALL1(indexOf_,"), PROP(right_,this), any_str(","), PROP(left_,this), any_str(").value.number"), _anyToBool(PROP(negated_,this)) ? any_str("==-1") : any_str(">=0"), toAnyPost});
           };
       
       }// case 'has property':
       else if (__is(_switch7,any_str("has property"))){
           // .throwError "NOT IMPLEMENTED YET for C"
           CALL1(throwError_,this,any_str("NOT IMPLEMENTED YET for C"));
       
       }// case 'into':
       else if (__is(_switch7,any_str("into"))){
           // if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
           if (_anyToBool(PROP(produceType_,this)) && !__is(PROP(produceType_,this),any_str("any"))) {CALL3(out_,this,any_str("_anyTo"), PROP(produceType_,this), any_str("("));};
           // .left.produceType='any'
           PROP(produceType_,PROP(left_,this)) = any_str("any");
           // .out "(",.right,"=",.left,")"
           __call(out_,this,5,(any_arr){any_str("("), PROP(right_,this), any_str("="), PROP(left_,this), any_str(")")});
           // if .produceType and .produceType isnt 'any', .out ')'
           if (_anyToBool(PROP(produceType_,this)) && !__is(PROP(produceType_,this),any_str("any"))) {CALL1(out_,this,any_str(")"));};
       
       }// case 'instance of':
       else if (__is(_switch7,any_str("instance of"))){
           // .left.produceType = 'any'
           PROP(produceType_,PROP(left_,this)) = any_str("any");
           // .right.produceType = 'any'
           PROP(produceType_,PROP(right_,this)) = any_str("any");
           // .out toAnyPre,prepend,'_instanceof(',.left,',',.right,')',append,toAnyPost
           __call(out_,this,9,(any_arr){toAnyPre, prepend, any_str("_instanceof("), PROP(left_,this), any_str(","), PROP(right_,this), any_str(")"), append, toAnyPost});
       
       }// case 'like':
       else if (__is(_switch7,any_str("like"))){
           // .throwError "like not supported yet for C-production"
           CALL1(throwError_,this,any_str("like not supported yet for C-production"));
       
       }// case 'is':
       else if (__is(_switch7,any_str("is"))){
           // .left.produceType = 'any'
           PROP(produceType_,PROP(left_,this)) = any_str("any");
           // .right.produceType = 'any'
           PROP(produceType_,PROP(right_,this)) = any_str("any");
           // .out toAnyPre,.negated?'!':'', '__is(',.left,',',.right,')',toAnyPost
           __call(out_,this,8,(any_arr){toAnyPre, _anyToBool(PROP(negated_,this)) ? any_str("!") : any_EMPTY_STR, any_str("__is("), PROP(left_,this), any_str(","), PROP(right_,this), any_str(")"), toAnyPost});
       
       }// case 'or':
       else if (__is(_switch7,any_str("or"))){
           // .left.produceType = 'any'
           PROP(produceType_,PROP(left_,this)) = any_str("any");
           // .right.produceType = 'any'
           PROP(produceType_,PROP(right_,this)) = any_str("any");
           // if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
           if (_anyToBool(PROP(produceType_,this)) && !__is(PROP(produceType_,this),any_str("any"))) {CALL3(out_,this,any_str("_anyTo"), PROP(produceType_,this), any_str("("));};
           // .out '__or(',.left,',',.right,')'
           __call(out_,this,5,(any_arr){any_str("__or("), PROP(left_,this), any_str(","), PROP(right_,this), any_str(")")});
           // if .produceType and .produceType isnt 'any', .out ')'
           if (_anyToBool(PROP(produceType_,this)) && !__is(PROP(produceType_,this),any_str("any"))) {CALL1(out_,this,any_str(")"));};
       
       }// case '%':
       else if (__is(_switch7,any_str("%"))){
           // if .produceType and .produceType isnt 'Number', .out 'any_number('
           if (_anyToBool(PROP(produceType_,this)) && !__is(PROP(produceType_,this),any_str("Number"))) {CALL1(out_,this,any_str("any_number("));};
           // .left.produceType = 'Number'
           PROP(produceType_,PROP(left_,this)) = any_str("Number");
           // .right.produceType = 'Number'
           PROP(produceType_,PROP(right_,this)) = any_str("Number");
           // .out '(int64_t)',.left,' % (int64_t)',.right
           CALL4(out_,this,any_str("(int64_t)"), PROP(left_,this), any_str(" % (int64_t)"), PROP(right_,this));
           // if .produceType and .produceType isnt 'Number', .out ')'
           if (_anyToBool(PROP(produceType_,this)) && !__is(PROP(produceType_,this),any_str("Number"))) {CALL1(out_,this,any_str(")"));};
       
       }
       else {

           // var operC = operTranslate(oper)
           var operC = Producer_c_operTranslate(undefined,1,(any_arr){oper});

           // switch operC
           any _switch8=operC;
                // case '?': // left is condition, right is: if_true
           if (__is(_switch8,any_str("?"))){
                   // .left.produceType = 'Bool'
                   PROP(produceType_,PROP(left_,this)) = any_str("Bool");
                   // .right.produceType = .produceType
                   PROP(produceType_,PROP(right_,this)) = PROP(produceType_,this);
           
           }// case ':': // left is a?b, right is: if_false
           else if (__is(_switch8,any_str(":"))){
                   // .left.produceType = .produceType
                   PROP(produceType_,PROP(left_,this)) = PROP(produceType_,this);
                   // .right.produceType = .produceType
                   PROP(produceType_,PROP(right_,this)) = PROP(produceType_,this);
           
           }// case '&&': // boolean and
           else if (__is(_switch8,any_str("&&"))){
                   // .left.produceType = 'Bool'
                   PROP(produceType_,PROP(left_,this)) = any_str("Bool");
                   // .right.produceType = 'Bool'
                   PROP(produceType_,PROP(right_,this)) = any_str("Bool");
           
           }
           else {
                   // .left.produceType = 'Number'
                   PROP(produceType_,PROP(left_,this)) = any_str("Number");
                   // .right.produceType = 'Number'
                   PROP(produceType_,PROP(right_,this)) = any_str("Number");
           };

           // var extra, preExtra
           var extra = undefined, preExtra = undefined;

           // if operC isnt '?' // cant put xx( a ? b )
           if (!__is(operC,any_str("?")))  { // cant put xx( a ? b )
               // if .produceType is 'any'
               if (__is(PROP(produceType_,this),any_str("any")))  {
                   // if .left.produceType is 'any' and .right.produceType is 'any'
                   if (__is(PROP(produceType_,PROP(left_,this)),any_str("any")) && __is(PROP(produceType_,PROP(right_,this)),any_str("any")))  {
                       //do nothing
                       ;
                   }
                   
                   else {
                       // preExtra = 'any_number('
                       preExtra = any_str("any_number(");
                       // extra = ")"
                       extra = any_str(")");
                   };
               }
               
               else if (_anyToBool(PROP(produceType_,this)))  {
                   // if ( .left.produceType is .produceType and .right.produceType is .produceType )
                   if (_anyToBool(__or((any_number(__is(PROP(produceType_,PROP(left_,this)),PROP(produceType_,this)) && __is(PROP(produceType_,PROP(right_,this)),PROP(produceType_,this)))),(any_number(__is(PROP(produceType_,this),any_str("Bool")) && __is(PROP(produceType_,PROP(left_,this)),any_str("Number")) && __is(PROP(produceType_,PROP(right_,this)),any_str("Number")))))))  {
                       //do nothing
                       ;
                   }
                   
                   else {
                     // preExtra = '_anyTo#{.produceType}('
                     preExtra = _concatAny(3,(any_arr){any_str("_anyTo"), PROP(produceType_,this), any_str("(")});
                     // extra = ")"
                     extra = any_str(")");
                   };
               };
           };

           // .out preExtra, prepend, .left,' ', operC, ' ',.right, append, extra
           __call(out_,this,9,(any_arr){preExtra, prepend, PROP(left_,this), any_str(" "), operC, any_str(" "), PROP(right_,this), append, extra});
       };

       // end case oper
       
     return undefined;
     }


   // append to class Grammar.Expression ###

     // properties
     ;

     // method produce(negated)
     any Grammar_Expression_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Expression));
       //---------
       // define named params
       var negated= argc? arguments[0] : undefined;
       //---------

// Produce the expression body, optionally negated

       // default .produceType='any'
       _default(&PROP(produceType_,this),any_str("any"));

       // var prepend=""
       var prepend = any_EMPTY_STR;
       // var append=""
       var append = any_EMPTY_STR;
       // if negated
       if (_anyToBool(negated))  {

// (prettier generated code) Try to avoid unnecessary parens after '!'
// for example: if the expression is a single variable, as in the 'falsey' check:
// Example: `if no options.logger then... ` --> `if (!options.logger) {...`
// we don't want: `if (!(options.logger)) {...`

         // if .operandCount is 1
         if (__is(PROP(operandCount_,this),any_number(1)))  {
              // #no parens needed
             // prepend = "!"
             prepend = any_str("!");
         }
              // #no parens needed
         
         else {
             // prepend = "!("
             prepend = any_str("!(");
             // append = ")"
             append = any_str(")");
         };
       };
          // #end if
        // #end if negated

// produce the expression body

        // declare valid .root.produceType
       // .root.produceType = .produceType
       PROP(produceType_,PROP(root_,this)) = PROP(produceType_,this);
       // .out prepend, .root, append
       CALL3(out_,this,prepend, PROP(root_,this), append);
     return undefined;
     }
        //.out preExtra, prepend, .root, append, extra


   // append to class Grammar.FunctionArgument ###

       // method produce
       any Grammar_FunctionArgument_produce(DEFAULT_ARGUMENTS){
           assert(_instanceof(this,Grammar_FunctionArgument));
           //---------
           // .out .expression
           CALL1(out_,this,PROP(expression_,this));
       return undefined;
       }


   // helper function makeSymbolName(symbol)
   any Producer_c_makeSymbolName(DEFAULT_ARGUMENTS){// define named params
       var symbol= argc? arguments[0] : undefined;
       //---------
        // hack: make "symbols" avoid interference with C's reserved words
        // and also common variable names
       // return "#{symbol}_"
       return _concatAny(2,(any_arr){symbol, any_str("_")});
   return undefined;
   }

   // append to class Grammar.VariableRef ###

// `VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

// `VariableRef` is a Variable Reference.

 // a VariableRef can include chained 'Accessors', which can:
 // *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 // *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

     // properties
     ;

     // method produce()
     any Grammar_VariableRef_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableRef));
       //---------

// Prefix ++/--, varName, Accessors and postfix ++/--

       // if .name is 'arguments'
       if (__is(PROP(name_,this),any_str("arguments")))  {
           // .out '_newArray(argc,arguments)'
           CALL1(out_,this,any_str("_newArray(argc,arguments)"));
           // return
           return undefined;
       };

       // var result = .calcReference()
       var result = CALL0(calcReference_,this);

       // var pre,post
       var pre = undefined, post = undefined;

       // if .produceType is 'any' and not .calcType is 'any'
       if (__is(PROP(produceType_,this),any_str("any")) && !(__is(PROP(calcType_,this),any_str("any"))))  {
           // pre = 'any_number('
           pre = any_str("any_number(");
           // post = ')'
           post = any_str(")");
       }
       
       else if (_anyToBool(PROP(produceType_,this)) && !__is(PROP(produceType_,this),any_str("any")) && __is(PROP(calcType_,this),any_str("any")))  {
           // pre = '_anyTo#{.produceType}('
           pre = _concatAny(3,(any_arr){any_str("_anyTo"), PROP(produceType_,this), any_str("(")});
           // post = ')'
           post = any_str(")");
       };

       // .out pre, result, post
       CALL3(out_,this,pre, result, post);
     return undefined;
     }

     // helper method calcReference(callNew) returns array of array
     any Grammar_VariableRef_calcReference(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableRef));
       //---------
       // define named params
       var callNew= argc? arguments[0] : undefined;
       //---------

       // var result = .calcReferenceArr(callNew)
       var result = CALL1(calcReferenceArr_,this,callNew);

// PreIncDec and postIncDec: ++/--

       // var hasIncDec = .preIncDec or .postIncDec
       var hasIncDec = __or(PROP(preIncDec_,this),PROP(postIncDec_,this));

       // if hasIncDec
       if (_anyToBool(hasIncDec))  {

           // if no .calcType
           if (!_anyToBool(PROP(calcType_,this)))  {
               // .throwError "pre or post inc/dec (++/--) can only be used on simple variables"
               CALL1(throwError_,this,any_str("pre or post inc/dec (++/--) can only be used on simple variables"));
           };

           // if .calcType is 'any'
           if (__is(PROP(calcType_,this),any_str("any")))  {
               // result.push ['.value.number']
               CALL1(push_,result,new(Array,1,(any_arr){any_str(".value.number")}));
               // .calcType = 'Number'
               PROP(calcType_,this) = any_str("Number");
           }
           
           else {
               //do nothing
               ;
           };
       };

       // if .postIncDec
       if (_anyToBool(PROP(postIncDec_,this)))  {
           // result.push [.postIncDec]
           CALL1(push_,result,new(Array,1,(any_arr){PROP(postIncDec_,this)}));
       };

       // if .preIncDec
       if (_anyToBool(PROP(preIncDec_,this)))  {
           // result.unshift [.preIncDec]
           CALL1(unshift_,result,new(Array,1,(any_arr){PROP(preIncDec_,this)}));
       };

       // return result
       return result;
     return undefined;
     }

     // helper method calcReferenceArr(callNew) returns array of array
     any Grammar_VariableRef_calcReferenceArr(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableRef));
       //---------
       // define named params
       var callNew= argc? arguments[0] : undefined;
       //---------

// Start with main variable name, to check property names

       // var actualVar = .tryGetFromScope(.name)
       var actualVar = CALL1(tryGetFromScope_,this,PROP(name_,this));
       // if no actualVar, .throwError("var '#{.name}' not found in scope")
       if (!_anyToBool(actualVar)) {CALL1(throwError_,this,_concatAny(3,(any_arr){any_str("var '"), PROP(name_,this), any_str("' not found in scope")}));};

       // var result: array = [] //array of arrays
       var result = new(Array,0,NULL); //array of arrays

       // var partial = actualVar.getComposedName()
       var partial = CALL0(getComposedName_,actualVar);

       // result.push [partial]
       CALL1(push_,result,new(Array,1,(any_arr){partial}));

       // .calcType = 'any' //default
       PROP(calcType_,this) = any_str("any"); //default
       // if actualVar.findOwnMember("**proto**") is '**native number**', .calcType = '**native number**'
       if (__is(CALL1(findOwnMember_,actualVar,any_str("**proto**")),any_str("**native number**"))) {PROP(calcType_,this) = any_str("**native number**");};

       // if no .accessors, return result
       if (!_anyToBool(PROP(accessors_,this))) {return result;};

// now follow each accessor

       // var avType:Names.Declaration
       var avType = undefined;

       // var hasInstanceReference:boolean
       var hasInstanceReference = undefined;

       // var isOk, functionAccess, args:array
       var isOk = undefined, functionAccess = undefined, args = undefined;

       // for each inx,ac in .accessors
       any _list81=PROP(accessors_,this);
       { var ac=undefined;
       for(int inx=0 ; inx<_list81.value.arr->length ; inx++){ac=ITEM(inx,_list81);
            // declare valid ac.name

            //if no actualVar
            //    .throwError("processing '#{partial}', cant follow property chain types")

// for PropertyAccess

           // if ac instanceof Grammar.PropertyAccess
           if (_instanceof(ac,Grammar_PropertyAccess))  {

               // var classNameArr:array
               var classNameArr = undefined;

               // if ac.name is 'constructor' //hack, all vars have a "constructor".
               if (__is(PROP(name_,ac),any_str("constructor")))  { //hack, all vars have a "constructor".
                    //convert "bar.constructor" to: "any_class(bar.class)"
                    //var classNameArr:array = result.pop()
                   // result.unshift ['any_class(']
                   CALL1(unshift_,result,new(Array,1,(any_arr){any_str("any_class(")}));
                    // here goes any class
                   // result.push [".class)"]
                   CALL1(push_,result,new(Array,1,(any_arr){any_str(".class)")}));
                    //result.push classNameArr
                   // .calcType = 'any'
                   PROP(calcType_,this) = any_str("any");
                   // hasInstanceReference=true
                   hasInstanceReference = true;
                   // if actualVar, actualVar = actualVar.findOwnMember('**proto**')
                   if (_anyToBool(actualVar)) {actualVar = CALL1(findOwnMember_,actualVar,any_str("**proto**"));};
               }
               
               else if (__is(PROP(name_,ac),any_str("prototype")))  { //hack, all classes have a "prototype" to access methods
                    //convert "Foo.prototype.toString" to: "__classMethodAny(toString,Foo)"
                   // if inx+1 >= .accessors.length or .accessors[inx+1].constructor isnt Grammar.PropertyAccess
                   if (_anyToBool(__or(any_number(inx + 1 >= _length(PROP(accessors_,this))),any_number(!__is(any_class(ITEM(inx + 1,PROP(accessors_,this)).class),Grammar_PropertyAccess)))))  {
                       // .sayErr "expected: Class.prototype.method, e.g.: 'Foo.prototype.toString'"
                       CALL1(sayErr_,this,any_str("expected: Class.prototype.method, e.g.: 'Foo.prototype.toString'"));
                   }
                   
                   else {
                       // classNameArr = result.pop()
                       classNameArr = CALL0(pop_,result);
                       // classNameArr.unshift '__classMethodFunc(',.accessors[inx+1].name,"_ ," //__classMethodFunc(methodName,
                       CALL3(unshift_,classNameArr,any_str("__classMethodFunc("), PROP(name_,ITEM(inx + 1,PROP(accessors_,this))), any_str("_ ,")); //__classMethodFunc(methodName,
                        // here goes any class
                       // classNameArr.push ")"
                       CALL1(push_,classNameArr,any_str(")"));
                       // result.push classNameArr //now converted to any Function
                       CALL1(push_,result,classNameArr); //now converted to any Function
                       // inx+=1 //skip method name
                       inx += 1; //skip method name
                       // .calcType = 'any' // __classMethodFunc returns any_func
                       PROP(calcType_,this) = any_str("any"); // __classMethodFunc returns any_func
                       // hasInstanceReference = true
                       hasInstanceReference = true;

                       // actualVar = .tryGetFromScope('Function')
                       actualVar = CALL1(tryGetFromScope_,this,any_str("Function"));
                       // if actualVar, actualVar=actualVar.findOwnMember('prototype') //actual var is now function prototype
                       if (_anyToBool(actualVar)) {actualVar = CALL1(findOwnMember_,actualVar,any_str("prototype"));};
                   };
               }
               
               else if (__is(PROP(name_,ac),any_str("length")))  { //hack, convert x.length in a funcion call, _length(x)
                   // result.unshift ['_length','('] // put "length(" first - call to dispatcher
                   CALL1(unshift_,result,new(Array,2,(any_arr){any_str("_length"), any_str("(")})); // put "length(" first - call to dispatcher
                   // result.push [")"]
                   CALL1(push_,result,new(Array,1,(any_arr){any_str(")")}));
                   // .calcType = '**native number**'
                   PROP(calcType_,this) = any_str("**native number**");
                   // actualVar = undefined
                   actualVar = undefined;
               }
               
               else if (__is(PROP(name_,ac),any_str("call")))  {
                    //hack: .call
                    // this is .call use __apply(Function,instance,argc,arguments)

                    //should be here after Class.prototype.xxx.call
                   // if no actualVar or no actualVar.findMember('call')
                   if (_anyToBool(__or(any_number(!_anyToBool(actualVar)),any_number(!_anyToBool(CALL1(findMember_,actualVar,any_str("call")))))))  {
                       // .throwError 'cannot use .call on a non-Function. Use: Class.prototype.method.call(this,arg1,...)'
                       CALL1(throwError_,this,any_str("cannot use .call on a non-Function. Use: Class.prototype.method.call(this,arg1,...)"));
                   };

                    //let's make sure next accessor is FunctionAccess with at least one arg
                   // isOk=false
                   isOk = false;

                   // if inx+1<.accessors.length
                   if (inx + 1 < _length(PROP(accessors_,this)))  {
                       // if .accessors[inx+1].constructor is Grammar.FunctionAccess
                       if (__is(any_class(ITEM(inx + 1,PROP(accessors_,this)).class),Grammar_FunctionAccess))  {
                           // functionAccess=.accessors[inx+1]
                           functionAccess = ITEM(inx + 1,PROP(accessors_,this));
                           // if functionAccess.args and functionAccess.args.length >= 1
                           if (_anyToBool(PROP(args_,functionAccess)) && _length(PROP(args_,functionAccess)) >= 1)  {
                               // isOk=true
                               isOk = true;
                           };
                       };
                   };

                   // if no isOk, .throwError 'expected instance and optional arguments after ".call": foo.call(this,arg1,arg2)'
                   if (!_anyToBool(isOk)) {CALL1(throwError_,this,any_str("expected instance and optional arguments after \".call\": foo.call(this,arg1,arg2)"));};

                   // args = functionAccess.args
                   args = PROP(args_,functionAccess);

                   // result.unshift ['__apply(']
                   CALL1(unshift_,result,new(Array,1,(any_arr){any_str("__apply(")}));
                    //here goes Function ref
                   // var FnArr = [",",args[0],","] // instance
                   var FnArr = new(Array,3,(any_arr){any_str(","), ITEM(0,args), any_str(",")}); // instance
                   // .addArguments args.slice(1), FnArr //other arguments
                   CALL2(addArguments_,this,CALL1(slice_,args,any_number(1)), FnArr); //other arguments
                   // FnArr.push ')'
                   CALL1(push_,FnArr,any_str(")"));

                   // result.push FnArr
                   CALL1(push_,result,FnArr);
                   // inx+=1 //skip fn.call and args
                   inx += 1; //skip fn.call and args
                   // actualVar = undefined
                   actualVar = undefined;
               }

               
               else if (__is(PROP(name_,ac),any_str("apply")))  {
                    //hack: .apply
                    // this is .apply(this,args:anyArr) use __applyArr(Function,instance,anyArgsArray)

                    //should be here after Class.prototype.xxx.apply
                   // if no actualVar or no actualVar.findMember('apply')
                   if (_anyToBool(__or(any_number(!_anyToBool(actualVar)),any_number(!_anyToBool(CALL1(findMember_,actualVar,any_str("apply")))))))  {
                       // .throwError 'cannot use .apply on a non-Function. Use: Class.prototype.method.apply(this,args:Array)'
                       CALL1(throwError_,this,any_str("cannot use .apply on a non-Function. Use: Class.prototype.method.apply(this,args:Array)"));
                   };

                    //let's make sure next accessor is FunctionAccess with at least one arg
                   // isOk=false
                   isOk = false;
                   // if inx+1<.accessors.length
                   if (inx + 1 < _length(PROP(accessors_,this)))  {
                       // if .accessors[inx+1].constructor is Grammar.FunctionAccess
                       if (__is(any_class(ITEM(inx + 1,PROP(accessors_,this)).class),Grammar_FunctionAccess))  {
                           // functionAccess=.accessors[inx+1]
                           functionAccess = ITEM(inx + 1,PROP(accessors_,this));
                           // if functionAccess.args and functionAccess.args.length >= 2
                           if (_anyToBool(PROP(args_,functionAccess)) && _length(PROP(args_,functionAccess)) >= 2)  {
                               // isOk=true
                               isOk = true;
                           };
                       };
                   };

                   // if no isOk, .throwError 'expected two arguments after ".apply". e.g.: foo.apply(this,argArray)'
                   if (!_anyToBool(isOk)) {CALL1(throwError_,this,any_str("expected two arguments after \".apply\". e.g.: foo.apply(this,argArray)"));};

                   // args = functionAccess.args
                   args = PROP(args_,functionAccess);

                   // result.unshift ['__applyArr(', hasInstanceReference? '': 'any_func(']
                   CALL1(unshift_,result,new(Array,2,(any_arr){any_str("__applyArr("), _anyToBool(hasInstanceReference) ? any_EMPTY_STR : any_str("any_func(")}));
                    //here goes Function ref
                   // result.push [hasInstanceReference? '': ')',',',args[0],',',args[1],')']
                   CALL1(push_,result,new(Array,6,(any_arr){_anyToBool(hasInstanceReference) ? any_EMPTY_STR : any_str(")"), any_str(","), ITEM(0,args), any_str(","), ITEM(1,args), any_str(")")}));

                   // inx+=1 //skip fn.call and args
                   inx += 1; //skip fn.call and args
                   // actualVar = undefined
                   actualVar = undefined;
               }
               
               else if (_anyToBool(actualVar) && _anyToBool(PROP(isNamespace_,actualVar)))  { //just namespace access
                   // var prevArr:array = result.pop()
                   var prevArr = CALL0(pop_,result);
                   // prevArr.push "_",ac.name
                   CALL2(push_,prevArr,any_str("_"), PROP(name_,ac));
                   // result.push prevArr
                   CALL1(push_,result,prevArr);

                   // actualVar = actualVar.findOwnMember(ac.name)
                   actualVar = CALL1(findOwnMember_,actualVar,PROP(name_,ac));
               }
               
               else if (inx + 1 < _length(PROP(accessors_,this)) && __is(any_class(ITEM(inx + 1,PROP(accessors_,this)).class),Grammar_FunctionAccess))  {
                    // if next is function access, this is a method name. just make name a symbol
                   // result.push [makeSymbolName(ac.name)]
                   CALL1(push_,result,new(Array,1,(any_arr){Producer_c_makeSymbolName(undefined,1,(any_arr){PROP(name_,ac)})}));
                   // .calcType = 'any'
                   PROP(calcType_,this) = any_str("any");
                   // hasInstanceReference=true
                   hasInstanceReference = true;
                   // if actualVar, actualVar = actualVar.findOwnMember(ac.name)
                   if (_anyToBool(actualVar)) {actualVar = CALL1(findOwnMember_,actualVar,PROP(name_,ac));};
               }
               
               else {
                    // normal property access
                    //out PROP(propName,instance)
                   // .calcType = 'any'
                   PROP(calcType_,this) = any_str("any");
                   // hasInstanceReference=true
                   hasInstanceReference = true;
                   // result.unshift ["PROP","(", makeSymbolName(ac.name), ","] // PROP macro enclose all
                   CALL1(unshift_,result,new(Array,4,(any_arr){any_str("PROP"), any_str("("), Producer_c_makeSymbolName(undefined,1,(any_arr){PROP(name_,ac)}), any_str(",")})); // PROP macro enclose all
                    // here goes thisValue (instance)
                   // result.push [")"]
                   CALL1(push_,result,new(Array,1,(any_arr){any_str(")")}));

                   // if actualVar, actualVar = actualVar.findOwnMember(ac.name)
                   if (_anyToBool(actualVar)) {actualVar = CALL1(findOwnMember_,actualVar,PROP(name_,ac));};
               };

               // end if // subtypes of propertyAccess

               // partial ="#{partial}.#{ac.name}"
               partial = _concatAny(3,(any_arr){partial, any_str("."), PROP(name_,ac)});
           }

// else, for FunctionAccess
           
           else if (__is(any_class(ac.class),Grammar_FunctionAccess))  {

               // partial ="#{partial}(...)"
               partial = _concatAny(2,(any_arr){partial, any_str("(...)")});
               // .calcType = 'any'
               PROP(calcType_,this) = any_str("any");

               // functionAccess = ac
               functionAccess = ac;

                //we're calling on an IndexAccess or the result of a function. Mandatory use of apply/call
               // if inx>1 and .accessors[inx-1].constructor isnt Grammar.PropertyAccess
               if (inx > 1 && !__is(any_class(ITEM(inx - 1,PROP(accessors_,this)).class),Grammar_PropertyAccess))  {
                   // .throwError("'#{partial}.call' or '.apply' must be used to call a function pointer stored in a variable")
                   CALL1(throwError_,this,_concatAny(3,(any_arr){any_str("'"), partial, any_str(".call' or '.apply' must be used to call a function pointer stored in a variable")}));
               };

               // var callParams:array
               var callParams = undefined;

               // if callNew
               if (_anyToBool(callNew))  {
                   // callParams = [","] // new(Class,argc,arguments*)
                   callParams = new(Array,1,(any_arr){any_str(",")}); // new(Class,argc,arguments*)
                    //add arguments: count,(any_arr){...}
                   // .addArguments functionAccess.args, callParams
                   CALL2(addArguments_,this,PROP(args_,functionAccess), callParams);
               }
               
               else {
                   // var fnNameArray:array = result.pop() //take fn name
                   var fnNameArray = CALL0(pop_,result); //take fn name
                   // if no hasInstanceReference //first accessor is function access, this is a call to a global function
                   if (!_anyToBool(hasInstanceReference))  { //first accessor is function access, this is a call to a global function

                       // fnNameArray.push "(" //add "("
                       CALL1(push_,fnNameArray,any_str("(")); //add "("
                        //if fnNameArray[0] is 'Number', fnNameArray[0]='_toNumber'; //convert "Number" (class name) to fn "_toNumber"
                       // result.unshift fnNameArray // put "functioname" first - call to global function
                       CALL1(unshift_,result,fnNameArray); // put "functioname" first - call to global function

                       // if fnNameArray[0] is '_concatAny'
                       if (__is(ITEM(0,fnNameArray),any_str("_concatAny")))  {
                           // callParams =[] // no "thisValue" for internal _concatAny, just params to concat
                           callParams = new(Array,0,NULL); // no "thisValue" for internal _concatAny, just params to concat
                       }
                       
                       else {
                           // callParams = ["undefined", ","] //this==undefined as in js "use strict" mode
                           callParams = new(Array,2,(any_arr){any_str("undefined"), any_str(",")}); //this==undefined as in js "use strict" mode
                       };

                        //add arguments: count,(any_arr){...}
                       // .addArguments functionAccess.args, callParams
                       CALL2(addArguments_,this,PROP(args_,functionAccess), callParams);
                   }
                   
                   else {
                        //method call

                        //to ease C-code reading, use macros CALL1 to CALL4 if possible
                       // if functionAccess.args and functionAccess.args.length<=4
                       if (_anyToBool(PROP(args_,functionAccess)) && _length(PROP(args_,functionAccess)) <= 4)  {

                            // __call enclose all
                           // fnNameArray.unshift "CALL#{functionAccess.args.length}("
                           CALL1(unshift_,fnNameArray,_concatAny(3,(any_arr){any_str("CALL"), any_number(_length(PROP(args_,functionAccess))), any_str("(")}));
                            // here goes methodName
                           // fnNameArray.push "," // CALLn(symbol_ *,*
                           CALL1(push_,fnNameArray,any_str(",")); // CALLn(symbol_ *,*
                            // here: instance reference as 2nd param (this value)
                           // result.unshift fnNameArray //prepend CALLn(method_,instanceof,...
                           CALL1(unshift_,result,fnNameArray); //prepend CALLn(method_,instanceof,...
                           // callParams = functionAccess.args.length? [","] else []
                           callParams = _length(PROP(args_,functionAccess)) ? new(Array,1,(any_arr){any_str(",")}) : new(Array,0,NULL);
                           // callParams.push {CSL:functionAccess.args}
                           CALL1(push_,callParams,new(Map,1,(any_arr){
                           _newPair("CSL",PROP(args_,functionAccess))
                           })
                           );
                       }
                       
                       else {

                            // __call enclose all
                           // fnNameArray.unshift "__call("
                           CALL1(unshift_,fnNameArray,any_str("__call("));
                            // here goes methodName
                           // fnNameArray.push "," // __call(symbol_ *,*
                           CALL1(push_,fnNameArray,any_str(",")); // __call(symbol_ *,*
                            // here: instance reference as 2nd param (this value)
                           // result.unshift fnNameArray //prepend __call(methodName, ...instanceof
                           CALL1(unshift_,result,fnNameArray); //prepend __call(methodName, ...instanceof
                            //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
                           // callParams = [","]
                           callParams = new(Array,1,(any_arr){any_str(",")});
                            //add arguments: count,(any_arr){...}
                           // .addArguments functionAccess.args, callParams
                           CALL2(addArguments_,this,PROP(args_,functionAccess), callParams);
                       };

                       // end if
                       
                   };

                   // end if //global fn or method
                   
               };

               // end if //callNew

               // callParams.push ")" //close __call(symbol,this,argc, any* arguments )  | function(undefined,arg,any* arguments)
               CALL1(push_,callParams,any_str(")")); //close __call(symbol,this,argc, any* arguments )  | function(undefined,arg,any* arguments)
               // result.push callParams
               CALL1(push_,result,callParams);

               // if actualVar, actualVar = actualVar.findMember('**return type**')
               if (_anyToBool(actualVar)) {actualVar = CALL1(findMember_,actualVar,any_str("**return type**"));};
           }
                // #the actualVar is now function's return type'
                // #and next property access should be on defined members of the return type


// else, for IndexAccess, the varRef type is now 'name.value.item[...]'
// and next property access should be on defined members of the type
           
           else if (__is(any_class(ac.class),Grammar_IndexAccess))  {

               // partial ="#{partial}[...]"
               partial = _concatAny(2,(any_arr){partial, any_str("[...]")});

               // .calcType = 'any'
               PROP(calcType_,this) = any_str("any");

                // declare ac:Grammar.IndexAccess

                //ac.name is a Expression
               // ac.name.produceType = 'Number'
               PROP(produceType_,PROP(name_,ac)) = any_str("Number");

                //add macro ITEM(index, array )
                //macro ITEM() encloses all
               // result.unshift ["ITEM(",ac.name,"," ]
               CALL1(unshift_,result,new(Array,3,(any_arr){any_str("ITEM("), PROP(name_,ac), any_str(",")}));
                // here goes instance
               // result.push [")"]
               CALL1(push_,result,new(Array,1,(any_arr){any_str(")")}));

               // if actualVar, actualVar = actualVar.findOwnMember('**item type**')
               if (_anyToBool(actualVar)) {actualVar = CALL1(findOwnMember_,actualVar,any_str("**item type**"));};
           };

           // end if //type of accessor
           
       }};// end for each in PROP(accessors_,this)

       // end for #each accessor

       // return result
       return result;
     return undefined;
     }



     // method getTypeName() returns string
     any Grammar_VariableRef_getTypeName(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableRef));
       //---------

       // var opt = new Names.NameDeclOptions
       var opt = new(Names_NameDeclOptions,0,NULL);
       // opt.informError = true
       PROP(informError_,opt) = true;
       // opt.isForward = true
       PROP(isForward_,opt) = true;
       // opt.isDummy = true
       PROP(isDummy_,opt) = true;
       // var avType = .tryGetReference(opt)
       var avType = CALL1(tryGetReference_,this,opt);
        // #get type name
       // var typeStr = avType.name
       var typeStr = PROP(name_,avType);
       // if typeStr is 'prototype'
       if (__is(typeStr,any_str("prototype")))  {
           // typeStr = avType.parent.name
           typeStr = PROP(name_,PROP(parent_,avType));
       };
       // end if

       // return typeStr
       return typeStr;
     return undefined;
     }


     // helper method addArguments(args:array , callParams:array)
     any Grammar_VariableRef_addArguments(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableRef));
       //---------
       // define named params
       var args, callParams;
       args=callParams=undefined;
       switch(argc){
         case 2:callParams=arguments[1];
         case 1:args=arguments[0];
       }
       //---------

        //add arguments[]
       // if args and args.length
       if (_anyToBool(args) && _length(args))  {
           // callParams.push "#{args.length},(any_arr){",{CSL:args},"}"
           CALL3(push_,callParams,_concatAny(2,(any_arr){any_number(_length(args)), any_str(",(any_arr){")}), new(Map,1,(any_arr){
           _newPair("CSL",args)
           })
, any_str("}"));
       }
       
       else {
           // callParams.push "0,NULL"
           CALL1(push_,callParams,any_str("0,NULL"));
       };
     return undefined;
     }



   // append to class Grammar.AssignmentStatement ###

     // method produce()
     any Grammar_AssignmentStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_AssignmentStatement));
       //---------

       // var extraLvalue='.value.number'
       var extraLvalue = any_str(".value.number");
       // if .lvalue.tryGetReference() into var nameDecl
       var nameDecl=undefined;
       if (_anyToBool((nameDecl=CALL0(tryGetReference_,PROP(lvalue_,this)))) && __is(CALL1(findOwnMember_,nameDecl,any_str("**proto**")),any_str("**native number**")))  {
               // extraLvalue=undefined
               extraLvalue = undefined;
       };

       // var oper = operTranslate(.name)
       var oper = Producer_c_operTranslate(undefined,1,(any_arr){PROP(name_,this)});
       // switch oper
       any _switch9=oper;
            // case "+=","-=","*=","/=":
       if (__is(_switch9,any_str("+="))||__is(_switch9,any_str("-="))||__is(_switch9,any_str("*="))||__is(_switch9,any_str("/="))){

               // .rvalue.produceType = 'Number'
               PROP(produceType_,PROP(rvalue_,this)) = any_str("Number");
               // .out .lvalue,extraLvalue,' ', oper,' ',.rvalue
               __call(out_,this,6,(any_arr){PROP(lvalue_,this), extraLvalue, any_str(" "), oper, any_str(" "), PROP(rvalue_,this)});
       
       }
       else {
               // .rvalue.produceType = 'any'
               PROP(produceType_,PROP(rvalue_,this)) = any_str("any");
               // .out .lvalue, ' ', operTranslate(.name), ' ' , .rvalue
               __call(out_,this,5,(any_arr){PROP(lvalue_,this), any_str(" "), Producer_c_operTranslate(undefined,1,(any_arr){PROP(name_,this)}), any_str(" "), PROP(rvalue_,this)});
       };
     return undefined;
     }

// -------
   // append to class Grammar.DefaultAssignment ###

     // method produce()
     any Grammar_DefaultAssignment_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_DefaultAssignment));
       //---------

       // .process(.assignment.lvalue, .assignment.rvalue)
       CALL2(process_,this,PROP(lvalue_,PROP(assignment_,this)), PROP(rvalue_,PROP(assignment_,this)));

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }

// #### helper Functions

      // #recursive duet 1
     // helper method process(name,value)
     any Grammar_DefaultAssignment_process(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,Grammar_DefaultAssignment));
         //---------
         // define named params
         var name, value;
         name=value=undefined;
         switch(argc){
           case 2:value=arguments[1];
           case 1:name=arguments[0];
         }
         //---------

// if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'

// check if it's a ObjectLiteral (level indent)

         // if value instanceof Grammar.ObjectLiteral
         if (_instanceof(value,Grammar_ObjectLiteral))  {
           // .processItems name, value # recurse Grammar.ObjectLiteral
           CALL2(processItems_,this,name, value);// # recurse Grammar.ObjectLiteral
         }

// else, simple value (Expression)
         
         else {
           // .assignIfUndefined name, value # Expression
           CALL2(assignIfUndefined_,this,name, value);// # Expression
         };
     return undefined;
     }


      // #recursive duet 2
     // helper method processItems(main, objectLiteral)
     any Grammar_DefaultAssignment_processItems(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,Grammar_DefaultAssignment));
         //---------
         // define named params
         var main, objectLiteral;
         main=objectLiteral=undefined;
         switch(argc){
           case 2:objectLiteral=arguments[1];
           case 1:main=arguments[0];
         }
         //---------

         // .throwError "default for objects not supported on C-generation"
         CALL1(throwError_,this,any_str("default for objects not supported on C-generation"));
     return undefined;
     }
//           .out "_defaultObject(&",main,");",NL
//           for each nameValue in objectLiteral.items
//             var itemFullName = [main,'.',nameValue.name]
//             .process(itemFullName, nameValue.value)
//           

    // #end helper recursive functions

// -----------

   // append to class ASTBase
    // helper method lastLineInxOf(list:ASTBase array)
    any ASTBase_lastLineInxOf(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var list= argc? arguments[0] : undefined;
       //---------

// More Helper methods, get max line of list

       // var lastLine = .lineInx
       var lastLine = PROP(lineInx_,this);
       // for each item in list
       any _list82=list;
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list82.value.arr->length ; item__inx++){item=ITEM(item__inx,_list82);
           // if item.lineInx>lastLine
           if (_anyToNumber(PROP(lineInx_,item)) > _anyToNumber(lastLine))  {
             // lastLine = item.lineInx
             lastLine = PROP(lineInx_,item);
           };
       }};// end for each in list

       // return lastLine
       return lastLine;
    return undefined;
    }


// ---
   // append to class Grammar.WithStatement ###

// `WithStatement: with VariableRef Body`

// The WithStatement simplifies calling several methods of the same object:
// Example:
// ```
// with frontDoor
    // .show
    // .open
    // .show
    // .close
    // .show
// ```
// to js:
// ```
// var with__1=frontDoor;
  // with__1.show;
  // with__1.open
  // with__1.show
  // with__1.close
  // with__1.show
// ```

     // method produce()
     any Grammar_WithStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_WithStatement));
       //---------

       // .out "var ",.nameDecl.getComposedName(),'=',.varRef,";"
       __call(out_,this,5,(any_arr){any_str("var "), CALL0(getComposedName_,PROP(nameDecl_,this)), any_str("="), PROP(varRef_,this), any_str(";")});
       // .out .body
       CALL1(out_,this,PROP(body_,this));
     return undefined;
     }



// ---

   // append to class Names.Declaration ###

     // method addToAllProperties
     any Names_Declaration_addToAllProperties(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------

       // var name = .name
       var name = PROP(name_,this);
       // if name not in coreSupportedProps and not allPropertyNames.has(name)
       if (CALL1(indexOf_,Producer_c_coreSupportedProps,name).value.number==-1 && !(_anyToBool(CALL1(has_,Producer_c_allPropertyNames,name))))  {
           // if allMethodNames.has(name)
           if (_anyToBool(CALL1(has_,Producer_c_allMethodNames,name)))  {
               // .sayErr "Ambiguity: A method named '#{name}' is already defined. Cannot reuse the symbol for a property"
               CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Ambiguity: A method named '"), name, any_str("' is already defined. Cannot reuse the symbol for a property")}));
               // allMethodNames.get(name).sayErr "declaration of method '#{name}'"
               CALL1(sayErr_,CALL1(get_,Producer_c_allMethodNames,name),_concatAny(3,(any_arr){any_str("declaration of method '"), name, any_str("'")}));
           }
           
           else if (CALL1(indexOf_,Producer_c_coreSupportedMethods,name).value.number>=0)  {
               // .sayErr "'#{name}' is declared in as a core method. Cannot use the symbol for a property"
               CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("'"), name, any_str("' is declared in as a core method. Cannot use the symbol for a property")}));
           }
           
           else {
               // allPropertyNames.set name, this
               CALL2(set_,Producer_c_allPropertyNames,name, this);
           };
       };
     return undefined;
     }

   // append to class Grammar.VarDeclList ###

     // method addToAllProperties
     any Grammar_VarDeclList_addToAllProperties(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VarDeclList));
       //---------
       // for each varDecl in .list
       any _list83=PROP(list_,this);
       { var varDecl=undefined;
       for(int varDecl__inx=0 ; varDecl__inx<_list83.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list83);
           // varDecl.nameDecl.addToAllProperties
           __call(addToAllProperties_,PROP(nameDecl_,varDecl),0,NULL);
       }};// end for each in PROP(list_,this)
       
     return undefined;
     }

     // method getNames returns array of string
     any Grammar_VarDeclList_getNames(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VarDeclList));
       //---------
       // var result=[]
       var result = new(Array,0,NULL);
       // for each varDecl in .list
       any _list84=PROP(list_,this);
       { var varDecl=undefined;
       for(int varDecl__inx=0 ; varDecl__inx<_list84.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list84);
           // result.push varDecl.name
           CALL1(push_,result,PROP(name_,varDecl));
       }};// end for each in PROP(list_,this)
       // return result
       return result;
     return undefined;
     }


   // append to class Grammar.VarStatement ###

// 'var' followed by a list of comma separated: var names and optional assignment

     // method produce()
     any Grammar_VarStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VarStatement));
       //---------
       // .out 'var ',{CSL:.list}
       CALL2(out_,this,any_str("var "), new(Map,1,(any_arr){
       _newPair("CSL",PROP(list_,this))
       })
       );
     return undefined;
     }

   // append to class Grammar.VariableDecl ###

// variable name and optionally assign a value

     // method produce
     any Grammar_VariableDecl_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableDecl));
       //---------
       // .out .name,' = ', .assignedValue or 'undefined'
       CALL3(out_,this,PROP(name_,this), any_str(" = "), __or(PROP(assignedValue_,this),any_str("undefined")));
     return undefined;
     }


//       method produceAssignments(prefix)
//         var count=0
//         for each variableDecl in .list
//             if count++ and no prefix, .out ", "
//             variableDecl.produceAssignment prefix
//             if prefix, .out ";",NL
//         if count and no prefix, .out ";",NL
// /*
// ---
// ### Append to class Grammar.PropertiesDeclaration ###
// 'properties' followed by a list of comma separated: var names and optional assignment
// See: Grammar.VariableDecl
//       method produce()
//         //.outLinesAsComment .lineInx, .lastLineInxOf(.list)
//         .out 'any ',{CSL:.list, freeForm:1},";"
//         //for each inx,varDecl in .list
//         //    .out inx>0?',':'',varDecl.name,NL
//         .addToAllProperties
//         .skipSemiColon = true
// ### Append to class Grammar.VariableDecl ###
// variable name and optionally assign a value
//       method produceAssignment(prefix) // prefix+name = [assignedValue|undefined]
//             .out prefix, .name,' = '
//             if .assignedValue
//                 .out .assignedValue
//             else
//                 .out 'undefined'
//     end VariableDecl
// ### Append to class Grammar.VarStatement ###
// 'var' followed by a list of comma separated: var names and optional assignment
//       method produceDeclare()
//         .out 'var ',{CSL:.list},";",NL
//       method produce()
// 'var' (alias for 'any') and one or more comma separated VariableDecl with assignments
//         .out 'var '
//         .produceAssignments
//         .skipSemiColon = true
// If 'var' was adjectivated 'export', add to exportNamespace
//         /*
//         if not .lexer.out.browser
//               if .export and not .default
//                 .out ";", NL,{COMMENT:'export'},NL
//                 for each varDecl in .list
//                     .out .lexer.out.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
//                 .skipSemiColon = true
//         
// */

   // append to class Grammar.ImportStatement ###

// 'import' followed by a list of comma separated: var names and optional assignment

     // method produce()
     any Grammar_ImportStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ImportStatement));
       //---------

        //for each item in .list
        //    .out '#include "', item.getRefFilename('.h'),'"', NL

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }


   // append to class Grammar.SingleLineBody ###

     // method produce()
     any Grammar_SingleLineBody_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_SingleLineBody));
       //---------

       // var bare=[]
       var bare = new(Array,0,NULL);
       // for each item in .statements
       any _list85=PROP(statements_,this);
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list85.value.arr->length ; item__inx++){item=ITEM(item__inx,_list85);
           // bare.push item.specific
           CALL1(push_,bare,PROP(specific_,item));
       }};// end for each in PROP(statements_,this)

       // .out {CSL:bare, separator:";"},";"
       CALL2(out_,this,new(Map,2,(any_arr){
       _newPair("CSL",bare), 
       _newPair("separator",any_str(";"))
       })
, any_str(";"));
     return undefined;
     }


   // append to class Grammar.IfStatement ###

     // method produce()
     any Grammar_IfStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_IfStatement));
       //---------

        // declare valid .elseStatement.produce
       // .conditional.produceType = 'Bool'
       PROP(produceType_,PROP(conditional_,this)) = any_str("Bool");
       // .out "if (", .conditional,") "
       CALL3(out_,this,any_str("if ("), PROP(conditional_,this), any_str(") "));

       // if .body instanceof Grammar.SingleLineBody
       if (_instanceof(PROP(body_,this),Grammar_SingleLineBody))  {
           // .out '{',.body,'}'
           CALL3(out_,this,any_str("{"), PROP(body_,this), any_str("}"));
       }
       
       else {
           // .out " {", .getEOLComment()
           CALL2(out_,this,any_str(" {"), CALL0(getEOLComment_,this));
           // .out .body, "}"
           CALL2(out_,this,PROP(body_,this), any_str("}"));
       };

       // if .elseStatement
       if (_anyToBool(PROP(elseStatement_,this)))  {
           // .outPrevLinesComments .elseStatement.lineInx-1
           CALL1(outPrevLinesComments_,this,any_number(_anyToNumber(PROP(lineInx_,PROP(elseStatement_,this))) - 1));
           // .elseStatement.produce()
           CALL0(produce_,PROP(elseStatement_,this));
       };
     return undefined;
     }


   // append to class Grammar.ElseIfStatement ###

     // method produce()
     any Grammar_ElseIfStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ElseIfStatement));
       //---------

       // .out NL,"else ", .nextIf
       CALL3(out_,this,Producer_c_NL, any_str("else "), PROP(nextIf_,this));
     return undefined;
     }

   // append to class Grammar.ElseStatement ###

     // method produce()
     any Grammar_ElseStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ElseStatement));
       //---------

       // .out NL,"else {", .body, "}"
       CALL4(out_,this,Producer_c_NL, any_str("else {"), PROP(body_,this), any_str("}"));
     return undefined;
     }

   // append to class Grammar.ForStatement ###

// There are 3 variants of `ForStatement` in LiteScript

     // method produce()
     any Grammar_ForStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForStatement));
       //---------

        // declare valid .variant.produce
       // .variant.produce()
       CALL0(produce_,PROP(variant_,this));

// Since al 3 cases are closed with '}; //comment', we skip statement semicolon

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }


   // append to class Grammar.ForEachProperty
// ### Variant 1) 'for each property' to loop over *object property names*

// `ForEachProperty: for each property [name-IDENTIFIER,]value-IDENTIFIER in this-VariableRef`

     // method produce()
     any Grammar_ForEachProperty_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForEachProperty));
       //---------

// => C:  for(inx=0;inx<obj.getPropertyCount();inx++){
            // value=obj.value.prop[inx]; name=obj.getPropName(inx);
        // ...

// Create a default index var name if none was provided

       // var listName, uniqueName = UniqueID.getVarName('list')  #unique temp listName var name
       var listName = undefined, uniqueName = UniqueID_getVarName(undefined,1,(any_arr){any_str("list")});// #unique temp listName var name
        // declare valid .iterable.root.name.hasSideEffects
       // if .iterable.operandCount>1 or .iterable.root.name.hasSideEffects or .iterable.root.name instanceof Grammar.Literal
       if (_anyToBool(__or(__or(any_number(_anyToNumber(PROP(operandCount_,PROP(iterable_,this))) > 1),PROP(hasSideEffects_,PROP(name_,PROP(root_,PROP(iterable_,this))))),any_number(_instanceof(PROP(name_,PROP(root_,PROP(iterable_,this))),Grammar_Literal)))))  {
           // listName = uniqueName
           listName = uniqueName;
           // .out "any ",listName,"=",.iterable,";",NL
           __call(out_,this,6,(any_arr){any_str("any "), listName, any_str("="), PROP(iterable_,this), any_str(";"), Producer_c_NL});
       }
       
       else {
           // listName = .iterable
           listName = PROP(iterable_,this);
       };

// create a var holding object property count

       // .out "len_t ",uniqueName,"_len=",listName,'.class->instanceSize / sizeof(any);' ,NL
       __call(out_,this,6,(any_arr){any_str("len_t "), uniqueName, any_str("_len="), listName, any_str(".class->instanceSize / sizeof(any);"), Producer_c_NL});

       // var startValue = "0"
       var startValue = any_str("0");
       // var intIndexVarName = '#{.mainVar.name}__inx';
       var intIndexVarName = _concatAny(2,(any_arr){PROP(name_,PROP(mainVar_,this)), any_str("__inx")});
       // if .indexVar
       if (_anyToBool(PROP(indexVar_,this)))  {
           // .out "any ",.indexVar.name,"=undefined;",NL
           CALL4(out_,this,any_str("any "), PROP(name_,PROP(indexVar_,this)), any_str("=undefined;"), Producer_c_NL);
       };

       // .out "any ",.mainVar.name,"=undefined;",NL
       CALL4(out_,this,any_str("any "), PROP(name_,PROP(mainVar_,this)), any_str("=undefined;"), Producer_c_NL);

       // .out
       __call(out_,this,12,(any_arr){any_str("for(int "), intIndexVarName, any_str("="), startValue, any_str(" ; "), intIndexVarName, any_str("<"), uniqueName, any_str("_len"), any_str(" ; "), intIndexVarName, any_str("++){")});

       // .body.out .mainVar.name,"=",listName,".value.prop[",intIndexVarName,"];",NL
       __call(out_,PROP(body_,this),7,(any_arr){PROP(name_,PROP(mainVar_,this)), any_str("="), listName, any_str(".value.prop["), intIndexVarName, any_str("];"), Producer_c_NL});

       // if .indexVar
       if (_anyToBool(PROP(indexVar_,this)))  {
           // .body.out .indexVar.name,"= _getPropertyName(",listName,",",intIndexVarName,");",NL
           __call(out_,PROP(body_,this),7,(any_arr){PROP(name_,PROP(indexVar_,this)), any_str("= _getPropertyName("), listName, any_str(","), intIndexVarName, any_str(");"), Producer_c_NL});
       };

       // if .where
       if (_anyToBool(PROP(where_,this)))  {
         // .out '  ',.where,"{",.body,"}"
         __call(out_,this,5,(any_arr){any_str("  "), PROP(where_,this), any_str("{"), PROP(body_,this), any_str("}")});
       }
       
       else {
         // .out .body
         CALL1(out_,this,PROP(body_,this));
       };

       // .out "};",{COMMENT:["end for each property in ",.iterable]},NL
       CALL3(out_,this,any_str("};"), new(Map,1,(any_arr){
       _newPair("COMMENT",new(Array,2,(any_arr){any_str("end for each property in "), PROP(iterable_,this)}))
       })
, Producer_c_NL);
     return undefined;
     }

   // append to class Grammar.ForEachInArray
// ### Variant 2) 'for each index' to loop over *Array indexes and items*

// `ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

     // method produce()
     any Grammar_ForEachInArray_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForEachInArray));
       //---------

// Create a default index var name if none was provided

       // var listName
       var listName = undefined;
       // listName = UniqueID.getVarName('list')  #unique temp listName var name
       listName = UniqueID_getVarName(undefined,1,(any_arr){any_str("list")});// #unique temp listName var name
       // .out "any ",listName,"=",.iterable,";",NL
       __call(out_,this,6,(any_arr){any_str("any "), listName, any_str("="), PROP(iterable_,this), any_str(";"), Producer_c_NL});

       // if .isMap
       if (_anyToBool(PROP(isMap_,this)))  {
           // return .produceForMap(listName)
           return CALL1(produceForMap_,this,listName);
       };

       // var intIndexVarName
       var intIndexVarName = undefined;
       // var startValue = "0"
       var startValue = any_str("0");
       // if .indexVar
       if (_anyToBool(PROP(indexVar_,this)))  {
           // .indexVar.nameDecl.members.set '**proto**','**native number**'
           CALL2(set_,PROP(members_,PROP(nameDecl_,PROP(indexVar_,this))),any_str("**proto**"), any_str("**native number**"));
           // intIndexVarName = .indexVar.name
           intIndexVarName = PROP(name_,PROP(indexVar_,this));
           // startValue = .indexVar.assignedValue or "0"
           startValue = __or(PROP(assignedValue_,PROP(indexVar_,this)),any_str("0"));
       }
       
       else {
           // intIndexVarName = '#{.mainVar.name}__inx';
           intIndexVarName = _concatAny(2,(any_arr){PROP(name_,PROP(mainVar_,this)), any_str("__inx")});
       };

// include mainVar.name in a bracket block to contain scope

       // .out "{ var ",.mainVar.name,"=undefined;",NL
       CALL4(out_,this,any_str("{ var "), PROP(name_,PROP(mainVar_,this)), any_str("=undefined;"), Producer_c_NL);

       // .out
       __call(out_,this,12,(any_arr){any_str("for(int "), intIndexVarName, any_str("="), startValue, any_str(" ; "), intIndexVarName, any_str("<"), listName, any_str(".value.arr->length"), any_str(" ; "), intIndexVarName, any_str("++){")});

       // .body.out .mainVar.name,"=ITEM(",intIndexVarName,",",listName,");",NL
       __call(out_,PROP(body_,this),7,(any_arr){PROP(name_,PROP(mainVar_,this)), any_str("=ITEM("), intIndexVarName, any_str(","), listName, any_str(");"), Producer_c_NL});

       // if .where
       if (_anyToBool(PROP(where_,this)))  {
           // .out '  ',.where,"{",.body,"}" //filter condition
           __call(out_,this,5,(any_arr){any_str("  "), PROP(where_,this), any_str("{"), PROP(body_,this), any_str("}")}); //filter condition
       }
       
       else {
           // .out .body
           CALL1(out_,this,PROP(body_,this));
       };

       // .out "}};",{COMMENT:["end for each in ",.iterable]},NL
       CALL3(out_,this,any_str("}};"), new(Map,1,(any_arr){
       _newPair("COMMENT",new(Array,2,(any_arr){any_str("end for each in "), PROP(iterable_,this)}))
       })
, Producer_c_NL);
     return undefined;
     }


     // method produceForMap(listName)
     any Grammar_ForEachInArray_produceForMap(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForEachInArray));
       //---------
       // define named params
       var listName= argc? arguments[0] : undefined;
       //---------

       // var intIndexVarName = "#{.mainVar.name}__inx" # unique map numeric index
       var intIndexVarName = _concatAny(2,(any_arr){PROP(name_,PROP(mainVar_,this)), any_str("__inx")});// # unique map numeric index
       // var nvp = UniqueID.getVarName('nvp') # pointer to name-value pair[inx]
       var nvp = UniqueID_getVarName(undefined,1,(any_arr){any_str("nvp")});// # pointer to name-value pair[inx]

       // .out "{ NameValuePair_ptr ",nvp,"=NULL; //name:value pair",NL
       CALL4(out_,this,any_str("{ NameValuePair_ptr "), nvp, any_str("=NULL; //name:value pair"), Producer_c_NL);
       // if .indexVar, .body.out " var ",.indexVar.name,"=undefined; //key",NL
       if (_anyToBool(PROP(indexVar_,this))) {CALL4(out_,PROP(body_,this),any_str(" var "), PROP(name_,PROP(indexVar_,this)), any_str("=undefined; //key"), Producer_c_NL);};
       // .out " var ",.mainVar.name,"=undefined; //value",NL
       CALL4(out_,this,any_str(" var "), PROP(name_,PROP(mainVar_,this)), any_str("=undefined; //value"), Producer_c_NL);

       // .out
       __call(out_,this,12,(any_arr){any_str("for(int64_t "), intIndexVarName, any_str("=0"), any_str(" ; "), intIndexVarName, any_str("<"), listName, any_str(".value.arr->length"), any_str(" ; "), intIndexVarName, any_str("++){"), Producer_c_NL});

       // .body.out "assert(ITEM(",intIndexVarName,",",listName,").class==&NameValuePair_CLASSINFO);",NL
       __call(out_,PROP(body_,this),6,(any_arr){any_str("assert(ITEM("), intIndexVarName, any_str(","), listName, any_str(").class==&NameValuePair_CLASSINFO);"), Producer_c_NL});

       // .out nvp," = ITEM(",intIndexVarName,",",listName,").value.ptr;",NL //get nv pair
       __call(out_,this,7,(any_arr){nvp, any_str(" = ITEM("), intIndexVarName, any_str(","), listName, any_str(").value.ptr;"), Producer_c_NL}); //get nv pair
       // if .indexVar, .body.out .indexVar.name,"=",nvp,"->name;",NL //get key
       if (_anyToBool(PROP(indexVar_,this))) {__call(out_,PROP(body_,this),5,(any_arr){PROP(name_,PROP(indexVar_,this)), any_str("="), nvp, any_str("->name;"), Producer_c_NL});};
       // .body.out .mainVar.name,"=",nvp,"->value;",NL //get value
       __call(out_,PROP(body_,this),5,(any_arr){PROP(name_,PROP(mainVar_,this)), any_str("="), nvp, any_str("->value;"), Producer_c_NL}); //get value

       // if .where
       if (_anyToBool(PROP(where_,this)))  {
         // .out '  ',.where,"{",.body,"}" //filter condition
         __call(out_,this,5,(any_arr){any_str("  "), PROP(where_,this), any_str("{"), PROP(body_,this), any_str("}")}); //filter condition
       }
       
       else {
         // .out .body
         CALL1(out_,this,PROP(body_,this));
       };

       // .out "}};",{COMMENT:["end for each in map ",.iterable]},NL
       CALL3(out_,this,any_str("}};"), new(Map,1,(any_arr){
       _newPair("COMMENT",new(Array,2,(any_arr){any_str("end for each in map "), PROP(iterable_,this)}))
       })
, Producer_c_NL);
     return undefined;
     }

   // append to class Grammar.ForIndexNumeric
// ### Variant 3) 'for index=...' to create *numeric loops*

// `ForIndexNumeric: for index-VariableDecl [","] (while|until|to|down to) end-Expression ["," increment-Statement] ["," where Expression]`

// Examples: `for n=0 while n<10`, `for n=0 to 9`
// Handle by using a js/C standard for(;;){} loop

     // method produce(iterable)
     any Grammar_ForIndexNumeric_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForIndexNumeric));
       //---------
       // define named params
       var iterable= argc? arguments[0] : undefined;
       //---------

       // var isToDownTo: boolean
       var isToDownTo = undefined;
       // var endTempVarName
       var endTempVarName = undefined;

       // .endExpression.produceType='Number'
       PROP(produceType_,PROP(endExpression_,this)) = any_str("Number");

        // indicate .indexVar is a native number, so no ".value.number" required to produce a number
       // .indexVar.nameDecl.members.set '**proto**','**native number**'
       CALL2(set_,PROP(members_,PROP(nameDecl_,PROP(indexVar_,this))),any_str("**proto**"), any_str("**native number**"));

       // if .indexVar.assignedValue, .indexVar.assignedValue.produceType='Number'
       if (_anyToBool(PROP(assignedValue_,PROP(indexVar_,this)))) {PROP(produceType_,PROP(assignedValue_,PROP(indexVar_,this))) = any_str("Number");};

       // if .conditionPrefix in['to','down']
       if (__in(PROP(conditionPrefix_,this),2,(any_arr){any_str("to"), any_str("down")}))  {

           // isToDownTo= true
           isToDownTo = true;

// store endExpression in a temp var.
// For loops "to/down to" evaluate end expresion only once

           // endTempVarName = UniqueID.getVarName('end')
           endTempVarName = UniqueID_getVarName(undefined,1,(any_arr){any_str("end")});
           // .out "int64_t ",endTempVarName,"=",.endExpression,";",NL
           __call(out_,this,6,(any_arr){any_str("int64_t "), endTempVarName, any_str("="), PROP(endExpression_,this), any_str(";"), Producer_c_NL});
       };

       // end if

       // .out "for(int64_t ", .indexVar.name,"=", .indexVar.assignedValue or "0","; "
       __call(out_,this,5,(any_arr){any_str("for(int64_t "), PROP(name_,PROP(indexVar_,this)), any_str("="), __or(PROP(assignedValue_,PROP(indexVar_,this)),any_str("0")), any_str("; ")});

       // if isToDownTo
       if (_anyToBool(isToDownTo))  {

            // #'for n=0 to 10' -> for(n=0;n<=10;n++)
            // #'for n=10 down to 0' -> for(n=10;n>=0;n--)
           // .out .indexVar.name, .conditionPrefix is 'to'? "<=" else ">=", endTempVarName
           CALL3(out_,this,PROP(name_,PROP(indexVar_,this)), __is(PROP(conditionPrefix_,this),any_str("to")) ? any_str("<=") : any_str(">="), endTempVarName);
       }
       
       else {

// produce the condition, negated if the prefix is 'until'

            // #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            // #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
           // .endExpression.produceType='Bool'
           PROP(produceType_,PROP(endExpression_,this)) = any_str("Bool");
           // .endExpression.produce( negated = .conditionPrefix is 'until' )
           CALL1(produce_,PROP(endExpression_,this),any_number(__is(PROP(conditionPrefix_,this),any_str("until"))));
       };

       // end if

       // .out "; "
       CALL1(out_,this,any_str("; "));

// if no increment specified, the default is indexVar++/--

       // .out
       __call(out_,this,7,(any_arr){_anyToBool(PROP(increment_,this)) ? PROP(specific_,PROP(increment_,this)) : new(Array,2,(any_arr){PROP(name_,PROP(indexVar_,this)), __is(PROP(conditionPrefix_,this),any_str("down")) ? any_str("--") : any_str("++")}), any_str(") "), any_str("{"), PROP(body_,this), any_str("};"), new(Map,1,(any_arr){
           _newPair("COMMENT",_concatAny(2,(any_arr){any_str("end for "), PROP(name_,PROP(indexVar_,this))}))
           })
, Producer_c_NL});
     return undefined;
     }



   // append to class Grammar.ForWhereFilter
// ### Helper for where filter
// `ForWhereFilter: [where Expression]`

     // method produce()
     any Grammar_ForWhereFilter_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForWhereFilter));
       //---------
       // .outLineAsComment .lineInx
       CALL1(outLineAsComment_,this,PROP(lineInx_,this));
       // .filterExpression.produceType='Bool'
       PROP(produceType_,PROP(filterExpression_,this)) = any_str("Bool");
       // .out 'if(',.filterExpression,')'
       CALL3(out_,this,any_str("if("), PROP(filterExpression_,this), any_str(")"));
     return undefined;
     }

   // append to class Grammar.DeleteStatement
// `DeleteStatement: delete VariableRef`

     // method produce()
     any Grammar_DeleteStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_DeleteStatement));
       //---------
       // .out 'delete ',.varRef
       CALL2(out_,this,any_str("delete "), PROP(varRef_,this));
     return undefined;
     }

   // append to class Grammar.WhileUntilExpression ###

     // method produce(askFor:string, negated:boolean)
     any Grammar_WhileUntilExpression_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_WhileUntilExpression));
       //---------
       // define named params
       var askFor, negated;
       askFor=negated=undefined;
       switch(argc){
         case 2:negated=arguments[1];
         case 1:askFor=arguments[0];
       }
       //---------

// If the parent ask for a 'while' condition, but this is a 'until' condition,
// or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

       // if askFor and .name isnt askFor
       if (_anyToBool(askFor) && !__is(PROP(name_,this),askFor))  {
           // negated = true
           negated = true;
       };

// *options.askFor* is used when the source code was, for example,
// `do until Expression` and we need to code: `while(!(Expression))`
// or the code was `loop while Expression` and we need to code: `if (!(Expression)) break`

// when you have a `until` condition, you need to negate the expression
// to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

       // .expr.produceType = 'Bool'
       PROP(produceType_,PROP(expr_,this)) = any_str("Bool");
       // .expr.produce(negated=negated)
       CALL1(produce_,PROP(expr_,this),negated);
     return undefined;
     }


   // append to class Grammar.DoLoop ###

     // method produce()
     any Grammar_DoLoop_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_DoLoop));
       //---------

// Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
// is used by both symbols.

       // if .postWhileUntilExpression
       if (_anyToBool(PROP(postWhileUntilExpression_,this)))  {

// if we have a post-condition, for example: `do ... loop while x>0`,

           // .out
           CALL4(out_,this,any_str("do{"), CALL0(getEOLComment_,this), PROP(body_,this), any_str("} while ("));

           // .postWhileUntilExpression.produce(askFor='while')
           CALL1(produce_,PROP(postWhileUntilExpression_,this),any_str("while"));

           // .out ")"
           CALL1(out_,this,any_str(")"));
       }

// else, optional pre-condition:
       
       else {

           // .out 'while('
           CALL1(out_,this,any_str("while("));
           // if .preWhileUntilExpression
           if (_anyToBool(PROP(preWhileUntilExpression_,this)))  {
             // .preWhileUntilExpression.produce(askFor='while')
             CALL1(produce_,PROP(preWhileUntilExpression_,this),any_str("while"));
           }
           
           else {
             // .out 'TRUE'
             CALL1(out_,this,any_str("TRUE"));
           };

           // .out '){', .body , "}"
           CALL3(out_,this,any_str("){"), PROP(body_,this), any_str("}"));
       };

       // end if

       // .out ";",{COMMENT:"end loop"},NL
       CALL3(out_,this,any_str(";"), new(Map,1,(any_arr){
       _newPair("COMMENT",any_str("end loop"))
       })
, Producer_c_NL);
       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }

   // append to class Grammar.LoopControlStatement ###
// This is a very simple produce() to allow us to use the `break` and `continue` keywords.

     // method produce()
     any Grammar_LoopControlStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_LoopControlStatement));
       //---------

// validate usage inside a for/while

       // var nodeASTBase = this.parent
       var nodeASTBase = PROP(parent_,this);
       // do
       while(TRUE){

           // if .control is 'break' and nodeASTBase is instanceof Grammar.SwitchCase
           if (__is(PROP(control_,this),any_str("break")) && _instanceof(nodeASTBase,Grammar_SwitchCase))  {
               // .sayErr 'cannot use "break" from inside a "switch" statement for "historic" reasons'
               CALL1(sayErr_,this,any_str("cannot use \"break\" from inside a \"switch\" statement for \"historic\" reasons"));
           }
           
           else if (_instanceof(nodeASTBase,Grammar_FunctionDeclaration))  {
                //if we reach function header
               // .sayErr '"{.control}" outside a for|while|do loop'
               CALL1(sayErr_,this,any_str("\"{.control}\" outside a for|while|do loop"));
               // break loop
               break;
           }
           
           else if (_anyToBool(__or(any_number(_instanceof(nodeASTBase,Grammar_ForStatement)),any_number(_instanceof(nodeASTBase,Grammar_DoLoop)))))  {
                   // break loop //ok, break/continue used inside a loop
                   break; //ok, break/continue used inside a loop
           };

           // end if

           // nodeASTBase = nodeASTBase.parent
           nodeASTBase = PROP(parent_,nodeASTBase);
       };// end loop

       // .out .control
       CALL1(out_,this,PROP(control_,this));
     return undefined;
     }


   // append to class Grammar.DoNothingStatement ###

     // method produce()
     any Grammar_DoNothingStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_DoNothingStatement));
       //---------
       // .out "//do nothing",NL
       CALL2(out_,this,any_str("//do nothing"), Producer_c_NL);
     return undefined;
     }

   // append to class Grammar.ParenExpression ###
// A `ParenExpression` is just a normal expression surrounded by parentheses.

     // properties
     ;

     // method produce()
     any Grammar_ParenExpression_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ParenExpression));
       //---------
       // .expr.produceType = .produceType
       PROP(produceType_,PROP(expr_,this)) = PROP(produceType_,this);
       // .out "(",.expr,")"
       CALL3(out_,this,any_str("("), PROP(expr_,this), any_str(")"));
     return undefined;
     }

   // append to class Grammar.ArrayLiteral ###

// A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`.
// On js we just pass this through, on C we create the array on the fly

     // method produce()
     any Grammar_ArrayLiteral_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ArrayLiteral));
       //---------

       // .out "new(Array,"
       CALL1(out_,this,any_str("new(Array,"));

       // if no .items or .items.length is 0
       if (_anyToBool(__or(any_number(!_anyToBool(PROP(items_,this))),any_number(__is(any_number(_length(PROP(items_,this))),any_number(0))))))  {
           // .out "0,NULL"
           CALL1(out_,this,any_str("0,NULL"));
       }
       
       else {
           // .out .items.length, ',(any_arr){', {CSL:.items}, '}'
           CALL4(out_,this,any_number(_length(PROP(items_,this))), any_str(",(any_arr){"), new(Map,1,(any_arr){
           _newPair("CSL",PROP(items_,this))
           })
, any_str("}"));
       };

       // .out ")"
       CALL1(out_,this,any_str(")"));
     return undefined;
     }


   // append to class Grammar.NameValuePair ###

// A `NameValuePair` is a single item in an Map definition.
// we call _newPair to create a new NameValuePair

     // method produce()
     any Grammar_NameValuePair_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_NameValuePair));
       //---------
       // var strName = .name
       var strName = PROP(name_,this);

       // if strName instanceof Grammar.Literal
       if (_instanceof(strName,Grammar_Literal))  {
            // declare strName: Grammar.Literal
           // strName = strName.getValue()
           strName = CALL0(getValue_,strName);
       };

       // .out NL,'_newPair("',strName, '",', .value,')'
       __call(out_,this,6,(any_arr){Producer_c_NL, any_str("_newPair(\""), strName, any_str("\","), PROP(value_,this), any_str(")")});
     return undefined;
     }

   // append to class Grammar.ObjectLiteral ### also FreeObjectLiteral

// A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`.
// JavaScript supports this syntax, so we just pass it through.
// C99 does only support "static" initializers for structs.

     // method produce()
     any Grammar_ObjectLiteral_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ObjectLiteral));
       //---------

       // .out "new(Map,"
       CALL1(out_,this,any_str("new(Map,"));

       // if no .items or .items.length is 0
       if (_anyToBool(__or(any_number(!_anyToBool(PROP(items_,this))),any_number(__is(any_number(_length(PROP(items_,this))),any_number(0))))))  {
           // .out "0,NULL"
           CALL1(out_,this,any_str("0,NULL"));
       }
       
       else {
           // .out
           __call(out_,this,5,(any_arr){any_number(_length(PROP(items_,this))), any_str(",(any_arr){"), new(Map,1,(any_arr){
               _newPair("CSL",PROP(items_,this))
               })
, Producer_c_NL, any_str("}")});
       };

       // .out ")",NL
       CALL2(out_,this,any_str(")"), Producer_c_NL);
     return undefined;
     }

   // append to class Grammar.ConstructorDeclaration ###

// Produce a Constructor

     // method produce()
     any Grammar_ConstructorDeclaration_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ConstructorDeclaration));
       //---------

       // if no .body.statements
       if (!_anyToBool(PROP(statements_,PROP(body_,this))))  {
           // .skipSemiColon=true
           PROP(skipSemiColon_,this) = true;
           // return // just method declaration (interface)
           return undefined; // just method declaration (interface)
       };

        // get owner: should be ClassDeclaration
       // var ownerClassDeclaration  = .getParent(Grammar.ClassDeclaration)
       var ownerClassDeclaration = CALL1(getParent_,this,Grammar_ClassDeclaration);
       // if no ownerClassDeclaration.nameDecl, return
       if (!_anyToBool(PROP(nameDecl_,ownerClassDeclaration))) {return undefined;};

       // var c = ownerClassDeclaration.nameDecl.getComposedName()
       var c = CALL0(getComposedName_,PROP(nameDecl_,ownerClassDeclaration));

       // .out "void ",c,"__init(DEFAULT_ARGUMENTS){",NL
       CALL4(out_,this,any_str("void "), c, any_str("__init(DEFAULT_ARGUMENTS){"), Producer_c_NL);

// auto call supper init

       // if ownerClassDeclaration.varRefSuper
       if (_anyToBool(PROP(varRefSuper_,ownerClassDeclaration)))  {
           // .out
           __call(out_,this,7,(any_arr){any_str("  "), new(Map,1,(any_arr){
               _newPair("COMMENT",any_str("auto call super class __init"))
               })
, Producer_c_NL, any_str("  "), PROP(varRefSuper_,ownerClassDeclaration), any_str("__init(this,argc,arguments);"), Producer_c_NL});
       };

// On the constructor, assign initial values for properties.
// Initialize (non-undefined) properties with assigned values.

       // .getParent(Grammar.ClassDeclaration).body.producePropertiesInitialValueAssignments "#{c}_"
       CALL1(producePropertiesInitialValueAssignments_,PROP(body_,CALL1(getParent_,this,Grammar_ClassDeclaration)),_concatAny(2,(any_arr){c, any_str("_")}));

// now the rest of the constructor body

       // .produceFunctionBody c
       CALL1(produceFunctionBody_,this,c);
     return undefined;
     }


   // append to class Grammar.MethodDeclaration ###

// Produce a Method

     // method produce()
     any Grammar_MethodDeclaration_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_MethodDeclaration));
       //---------

       // if no .body.statements
       if (!_anyToBool(PROP(statements_,PROP(body_,this))))  {
           // .skipSemiColon=true
           PROP(skipSemiColon_,this) = true;
           // return //just interface
           return undefined; //just interface
       };

       // if no .nameDecl, return //shim
       if (!_anyToBool(PROP(nameDecl_,this))) {return undefined;};
       // var name = .nameDecl.getComposedName()
       var name = CALL0(getComposedName_,PROP(nameDecl_,this));

       // var ownerNameDecl  = .nameDecl.parent
       var ownerNameDecl = PROP(parent_,PROP(nameDecl_,this));
       // if no ownerNameDecl, return
       if (!_anyToBool(ownerNameDecl)) {return undefined;};

       // var isClass = ownerNameDecl.name is 'prototype'
       var isClass = any_number(__is(PROP(name_,ownerNameDecl),any_str("prototype")));

       // var c = ownerNameDecl.getComposedName()
       var c = CALL0(getComposedName_,ownerNameDecl);

       // .out "any ",name,"(DEFAULT_ARGUMENTS){",NL
       CALL4(out_,this,any_str("any "), name, any_str("(DEFAULT_ARGUMENTS){"), Producer_c_NL);

        //assert 'this' parameter class
       // if isClass
       if (_anyToBool(isClass))  {
           // .body.out
           __call(out_,PROP(body_,this),6,(any_arr){any_str("assert(_instanceof(this,"), c, any_str("));"), Producer_c_NL, any_str("//---------"), Producer_c_NL});
       };

       // .produceFunctionBody c
       CALL1(produceFunctionBody_,this,c);
     return undefined;
     }


   // append to class Grammar.FunctionDeclaration ###

// only module function production
// (methods & constructors handled above)

// `FunctionDeclaration: '[export] function [name] '(' FunctionParameterDecl* ')' Block`

     // method produce()
     any Grammar_FunctionDeclaration_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_FunctionDeclaration));
       //---------

// exit if it is a *shim* method which never got declared (method exists, shim not required)

       // if no .nameDecl, return
       if (!_anyToBool(PROP(nameDecl_,this))) {return undefined;};

// being a function, the only possible parent is a Module

       // var parentModule = .getParent(Grammar.Module)
       var parentModule = CALL1(getParent_,this,Grammar_Module);
       // var prefix = parentModule.fileInfo.base
       var prefix = PROP(base_,PROP(fileInfo_,parentModule));
       // var name = "#{prefix}_#{.name}"
       var name = _concatAny(3,(any_arr){prefix, any_str("_"), PROP(name_,this)});

       // var isInterface = no .body.statements
       var isInterface = any_number(!_anyToBool(PROP(statements_,PROP(body_,this))));
       // if isInterface, return // just method declaration (interface)
       if (_anyToBool(isInterface)) {return undefined;};

       // .out "any ",name,"(DEFAULT_ARGUMENTS){"
       CALL3(out_,this,any_str("any "), name, any_str("(DEFAULT_ARGUMENTS){"));

       // .produceFunctionBody prefix
       CALL1(produceFunctionBody_,this,prefix);
     return undefined;
     }


     // helper method produceFunctionBody(prefix:string)
     any Grammar_FunctionDeclaration_produceFunctionBody(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_FunctionDeclaration));
       //---------
       // define named params
       var prefix= argc? arguments[0] : undefined;
       //---------

// common code
// start body

        // function named params
       // if .paramsDeclarations and .paramsDeclarations.length
       if (_anyToBool(PROP(paramsDeclarations_,this)) && _length(PROP(paramsDeclarations_,this)))  {

               // .body.out "// define named params",NL
               CALL2(out_,PROP(body_,this),any_str("// define named params"), Producer_c_NL);

               // if .paramsDeclarations.length is 1
               if (__is(any_number(_length(PROP(paramsDeclarations_,this))),any_number(1)))  {
                   // .body.out "var ",.paramsDeclarations[0].name,"= argc? arguments[0] : undefined;",NL
                   CALL4(out_,PROP(body_,this),any_str("var "), PROP(name_,ITEM(0,PROP(paramsDeclarations_,this))), any_str("= argc? arguments[0] : undefined;"), Producer_c_NL);
               }
               
               else {
                   // var namedParams:array=[]
                   var namedParams = new(Array,0,NULL);

                   // for each paramDecl in .paramsDeclarations
                   any _list86=PROP(paramsDeclarations_,this);
                   { var paramDecl=undefined;
                   for(int paramDecl__inx=0 ; paramDecl__inx<_list86.value.arr->length ; paramDecl__inx++){paramDecl=ITEM(paramDecl__inx,_list86);
                       // namedParams.push paramDecl.name
                       CALL1(push_,namedParams,PROP(name_,paramDecl));
                   }};// end for each in PROP(paramsDeclarations_,this)

                   // .body.out
                   __call(out_,PROP(body_,this),9,(any_arr){any_str("var "), new(Map,1,(any_arr){
                       _newPair("CSL",namedParams)
                       })
, any_str(";"), Producer_c_NL, CALL1(join_,namedParams,any_str("=")), any_str("=undefined;"), Producer_c_NL, any_str("switch(argc){"), Producer_c_NL});


                   // for inx=namedParams.length-1, while inx>=0, inx--
                   for(int64_t inx=_length(namedParams) - 1; inx >= 0; inx--) {
                       // .body.out "  case #{inx+1}:#{namedParams[inx]}=arguments[#{inx}];",NL
                       CALL2(out_,PROP(body_,this),_concatAny(7,(any_arr){any_str("  case "), (any_number(inx + 1)), any_str(":"), (ITEM(inx,namedParams)), any_str("=arguments["), any_number(inx), any_str("];")}), Producer_c_NL);
                   };// end for inx

                   // .body.out "}",NL
                   CALL2(out_,PROP(body_,this),any_str("}"), Producer_c_NL);
               };

               // end if
               // .body.out "//---------",NL
               CALL2(out_,PROP(body_,this),any_str("//---------"), Producer_c_NL);
       };

       // end if //named params

// if single line body, insert return. Example: `function square(x) = x*x`

       // if .body instance of Grammar.Expression
       if (_instanceof(PROP(body_,this),Grammar_Expression))  {
           // .out "return ", .body
           CALL2(out_,this,any_str("return "), PROP(body_,this));
       }
       
       else {

// if it has a exception block, insert 'try{'

           // if .hasExceptionBlock, .body.out " try{",NL
           if (_anyToBool(PROP(hasExceptionBlock_,this))) {CALL2(out_,PROP(body_,this),any_str(" try{"), Producer_c_NL);};

// now produce function body

           // .body.produce()
           CALL0(produce_,PROP(body_,this));

// close the function, to all functions except *constructors* (__init),
// add default "return undefined", to emulate js behavior on C.
// if you dot not insert a "return", the C function will return garbage.

           // if not .constructor is Grammar.ConstructorDeclaration // declared as void Class__init(...)
           if (!(__is(any_class(this.class),Grammar_ConstructorDeclaration)))  { // declared as void Class__init(...)
               // .out "return undefined;",NL
               CALL2(out_,this,any_str("return undefined;"), Producer_c_NL);
           };
       };

// close function

       // .out "}"
       CALL1(out_,this,any_str("}"));

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }

        //if .lexer.out.sourceMap
        //    .lexer.out.sourceMap.add ( .EndFnLineNum, 0, .lexer.out.lineNum-1, 0)
        //endif


// --------------------
   // append to class Grammar.PrintStatement ###
// `print` is an alias for console.log

     // method produce()
     any Grammar_PrintStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_PrintStatement));
       //---------

       // if .args.length
       if (_length(PROP(args_,this)))  {
           // .out 'print(#{.args.length},(any_arr){',{CSL:.args},'})'
           CALL3(out_,this,_concatAny(3,(any_arr){any_str("print("), any_number(_length(PROP(args_,this))), any_str(",(any_arr){")}), new(Map,1,(any_arr){
           _newPair("CSL",PROP(args_,this))
           })
, any_str("})"));
       }
       
       else {
           // .out 'print(0,NULL)'
           CALL1(out_,this,any_str("print(0,NULL)"));
       };
     return undefined;
     }

// --------------------
   // append to class Grammar.EndStatement ###

// Marks the end of a block. It's just a comment for javascript

     // method produce()
     any Grammar_EndStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_EndStatement));
       //---------

        // declare valid .lexer.outCode.lastOriginalCodeComment
        // declare valid .lexer.infoLines

       // if .lexer.outCode.lastOriginalCodeComment<.lineInx
       if (_anyToNumber(PROP(lastOriginalCodeComment_,PROP(outCode_,PROP(lexer_,this)))) < _anyToNumber(PROP(lineInx_,this)))  {
         // .out {COMMENT: .lexer.infoLines[.lineInx].text}
         CALL1(out_,this,new(Map,1,(any_arr){
         _newPair("COMMENT",PROP(text_,ITEM(_anyToNumber(PROP(lineInx_,this)),PROP(infoLines_,PROP(lexer_,this)))))
         })
         );
       };

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }

// --------------------
   // append to class Grammar.CompilerStatement ###

     // method produce()
     any Grammar_CompilerStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_CompilerStatement));
       //---------

// first, out as comment this line

       // .outLineAsComment .lineInx
       CALL1(outLineAsComment_,this,PROP(lineInx_,this));

// if it's a conditional compile, output body is option is Set

       // if .conditional
       if (_anyToBool(PROP(conditional_,this)))  {
           // if .compilerVar(.conditional)
           if (_anyToBool(CALL1(compilerVar_,this,PROP(conditional_,this))))  {
                // declare valid .body.produce
               // .body.produce()
               CALL0(produce_,PROP(body_,this));
           };
       };

       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }


// --------------------
   // append to class Grammar.ImportStatementItem ###

       // method getRefFilename(ext)
       any Grammar_ImportStatementItem_getRefFilename(DEFAULT_ARGUMENTS){
           assert(_instanceof(this,Grammar_ImportStatementItem));
           //---------
           // define named params
           var ext= argc? arguments[0] : undefined;
           //---------

           // var thisModule = .getParent(Grammar.Module)
           var thisModule = CALL1(getParent_,this,Grammar_Module);

           // return Environment.relativeFrom(thisModule.fileInfo.outDir,
           return Environment_relativeFrom(undefined,2,(any_arr){PROP(outDir_,PROP(fileInfo_,thisModule)), CALL1(outWithExtension_,PROP(fileInfo_,PROP(importedModule_,this)),any_str(".h"))});
       return undefined;
       }

// --------------------
   // append to class Grammar.DeclareStatement ###

// Out as comments

     // method produce()
     any Grammar_DeclareStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_DeclareStatement));
       //---------
       // .outLinesAsComment .lineInx, .names? .lastLineInxOf(.names) : .lineInx
       CALL2(outLinesAsComment_,this,PROP(lineInx_,this), _anyToBool(PROP(names_,this)) ? CALL1(lastLineInxOf_,this,PROP(names_,this)) : PROP(lineInx_,this));
       // .skipSemiColon = true
       PROP(skipSemiColon_,this) = true;
     return undefined;
     }


// ----------------------------
   // append to class Names.Declaration ###
        //properties
            //productionInfo: ClassProductionInfo

       // method getComposedName
       any Names_Declaration_getComposedName(DEFAULT_ARGUMENTS){
           assert(_instanceof(this,Names_Declaration));
           //---------

// if this nameDecl is member of a namespace, goes up the parent chain
// composing the name. e.g.: Foo_Bar_var

           // var result = []
           var result = new(Array,0,NULL);
           // var node = this
           var node = this;
           // while node and not node.isScope
           while(_anyToBool(node) && !(_anyToBool(PROP(isScope_,node)))){
               // if node.name isnt 'prototype', result.unshift node.name
               if (!__is(PROP(name_,node),any_str("prototype"))) {CALL1(unshift_,result,PROP(name_,node));};
               // if node.nodeDeclared instanceof Grammar.ImportStatementItem
               if (_instanceof(PROP(nodeDeclared_,node),Grammar_ImportStatementItem))  {
                    //stop here, imported modules create a local var, but act as global var
                    //since all others import of the same name, return the same content
                   // return result.join('_')
                   return CALL1(join_,result,any_str("_"));
               };

               // node = node.parent
               node = PROP(parent_,node);
           };// end loop

// if we reach module scope, (and not Global Scope)
// then it's a var|fn|class declared at module scope.
// Since modules act as namespaces, we add module.fileinfo.base to the name.
// Except is the same name as the top namespace|class (auto export default).


           // if node and node.isScope and node.nodeDeclared.constructor is Grammar.Module
           if (_anyToBool(node) && _anyToBool(PROP(isScope_,node)) && __is(any_class(PROP(nodeDeclared_,node).class),Grammar_Module))  {
               // var scopeModule = node.nodeDeclared
               var scopeModule = PROP(nodeDeclared_,node);
               // if scopeModule.name isnt '*Global Scope*' //except for global scope
               if (!__is(PROP(name_,scopeModule),any_str("*Global Scope*")))  { //except for global scope
                   // if result[0] isnt scopeModule.fileInfo.base
                   if (!__is(ITEM(0,result),PROP(base_,PROP(fileInfo_,scopeModule))))  {
                       // result.unshift scopeModule.fileInfo.base
                       CALL1(unshift_,result,PROP(base_,PROP(fileInfo_,scopeModule)));
                   };
               };
           };

           // return result.join('_')
           return CALL1(join_,result,any_str("_"));
       return undefined;
       }

// For C production, we're declaring each distinct method name (verbs)

       // method addToAllMethodNames()
       any Names_Declaration_addToAllMethodNames(DEFAULT_ARGUMENTS){
           assert(_instanceof(this,Names_Declaration));
           //---------
           // var methodName=.name
           var methodName = PROP(name_,this);

           // if methodName not in coreSupportedMethods and not allMethodNames.has(methodName)
           if (CALL1(indexOf_,Producer_c_coreSupportedMethods,methodName).value.number==-1 && !(_anyToBool(CALL1(has_,Producer_c_allMethodNames,methodName))))  {
               // if allPropertyNames.has(methodName)
               if (_anyToBool(CALL1(has_,Producer_c_allPropertyNames,methodName)))  {
                   // .sayErr "Ambiguity: A property '#{methodName}' is already defined. Cannot reuse the symbol for a method."
                   CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Ambiguity: A property '"), methodName, any_str("' is already defined. Cannot reuse the symbol for a method.")}));
                   // allPropertyNames.get(methodName).sayErr "Definition of property '#{methodName}'."
                   CALL1(sayErr_,CALL1(get_,Producer_c_allPropertyNames,methodName),_concatAny(3,(any_arr){any_str("Definition of property '"), methodName, any_str("'.")}));
               }
               
               else if (CALL1(indexOf_,Producer_c_coreSupportedProps,methodName).value.number>=0)  {
                   // .sayErr "Ambiguity: A property '#{methodName}' is defined in core. Cannot reuse the symbol for a method."
                   CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Ambiguity: A property '"), methodName, any_str("' is defined in core. Cannot reuse the symbol for a method.")}));
               }
               
               else {
                   // allMethodNames.set methodName, this
                   CALL2(set_,Producer_c_allMethodNames,methodName, this);
               };
           };
       return undefined;
       }



   // append to class Grammar.TryCatch ###

     // method produce()
     any Grammar_TryCatch_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_TryCatch));
       //---------

       // .out 'try{', .body, .exceptionBlock
       CALL3(out_,this,any_str("try{"), PROP(body_,this), PROP(exceptionBlock_,this));
     return undefined;
     }

   // append to class Grammar.ExceptionBlock ###

     // method produce()
     any Grammar_ExceptionBlock_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ExceptionBlock));
       //---------

       // .out NL,'}catch(',.catchVar,'){', .body, '}'
       __call(out_,this,6,(any_arr){Producer_c_NL, any_str("}catch("), PROP(catchVar_,this), any_str("){"), PROP(body_,this), any_str("}")});

       // if .finallyBody
       if (_anyToBool(PROP(finallyBody_,this)))  {
           // .out NL,'finally{', .finallyBody, '}'
           CALL4(out_,this,Producer_c_NL, any_str("finally{"), PROP(finallyBody_,this), any_str("}"));
       };
     return undefined;
     }


   // append to class Grammar.SwitchStatement ###

     // method produce()
     any Grammar_SwitchStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_SwitchStatement));
       //---------

// if we have a varRef, is a switch over a value
// we produce as chained if-else, using == to switchValue

       // if .varRef
       if (_anyToBool(PROP(varRef_,this)))  {

           // var switchVar = UniqueID.getVarName('switch')
           var switchVar = UniqueID_getVarName(undefined,1,(any_arr){any_str("switch")});
           // .out "any ",switchVar,"=",.varRef,";",NL
           __call(out_,this,6,(any_arr){any_str("any "), switchVar, any_str("="), PROP(varRef_,this), any_str(";"), Producer_c_NL});

           // for each index,switchCase in .cases
           any _list87=PROP(cases_,this);
           { var switchCase=undefined;
           for(int index=0 ; index<_list87.value.arr->length ; index++){switchCase=ITEM(index,_list87);

               // .outLineAsComment switchCase.lineInx
               CALL1(outLineAsComment_,this,PROP(lineInx_,switchCase));

               // .out
               __call(out_,this,7,(any_arr){index > 0 ? any_str("else ") : any_EMPTY_STR, any_str("if ("), new(Map,4,(any_arr){
                   _newPair("pre",_concatAny(3,(any_arr){any_str("__is("), switchVar, any_str(",")})), 
                   _newPair("CSL",PROP(expressions_,switchCase)), 
                   _newPair("post",any_str(")")), 
                   _newPair("separator",any_str("||"))
                   })
, any_str("){"), PROP(body_,switchCase), Producer_c_NL, any_str("}")});
           }};// end for each in PROP(cases_,this)
           
       }

// else, it's a swtich over true-expression, we produce as chained if-else
// with the casee expresions
       
       else {

         // for each index,switchCase in .cases
         any _list88=PROP(cases_,this);
         { var switchCase=undefined;
         for(int index=0 ; index<_list88.value.arr->length ; index++){switchCase=ITEM(index,_list88);
             // .outLineAsComment switchCase.lineInx
             CALL1(outLineAsComment_,this,PROP(lineInx_,switchCase));
             // .out
             __call(out_,this,7,(any_arr){index > 0 ? any_str("else ") : any_EMPTY_STR, any_str("if ("), new(Map,4,(any_arr){
                   _newPair("pre",any_str("(")), 
                   _newPair("CSL",PROP(expressions_,switchCase)), 
                   _newPair("post",any_str(")")), 
                   _newPair("separator",any_str("||"))
                   })
, any_str("){"), PROP(body_,switchCase), Producer_c_NL, any_str("}")});
         }};// end for each in PROP(cases_,this)
         
       };

       // end if

// defaul case

       // if .defaultBody, .out NL,'else {',.defaultBody,'}'
       if (_anyToBool(PROP(defaultBody_,this))) {CALL4(out_,this,Producer_c_NL, any_str("else {"), PROP(defaultBody_,this), any_str("}"));};
     return undefined;
     }


   // append to class Grammar.SwitchCase ###

     // method produce()
     any Grammar_SwitchCase_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_SwitchCase));
       //---------

       // for each expression in .expressions
       any _list89=PROP(expressions_,this);
       { var expression=undefined;
       for(int expression__inx=0 ; expression__inx<_list89.value.arr->length ; expression__inx++){expression=ITEM(expression__inx,_list89);
           // expression.produceType = 'Number'
           PROP(produceType_,expression) = any_str("Number");
       }};// end for each in PROP(expressions_,this)

       // .out {pre:'case ', CSL:.expressions, post:':', separator:' '}
       CALL1(out_,this,new(Map,4,(any_arr){
       _newPair("pre",any_str("case ")), 
       _newPair("CSL",PROP(expressions_,this)), 
       _newPair("post",any_str(":")), 
       _newPair("separator",any_str(" "))
       })
       );
       // .out .body
       CALL1(out_,this,PROP(body_,this));
       // .body.out 'break;',NL
       CALL2(out_,PROP(body_,this),any_str("break;"), Producer_c_NL);
     return undefined;
     }


   // append to class Grammar.CaseWhenExpression ###

     // method produce()
     any Grammar_CaseWhenExpression_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_CaseWhenExpression));
       //---------

// if we have a varRef, is a case over a value

       // if .varRef
       if (_anyToBool(PROP(varRef_,this)))  {

           // var caseVar = UniqueID.getVarName('caseVar')
           var caseVar = UniqueID_getVarName(undefined,1,(any_arr){any_str("caseVar")});
           // .out '(function(',caseVar,'){',NL
           CALL4(out_,this,any_str("(function("), caseVar, any_str("){"), Producer_c_NL);
           // for each caseWhenSection in .cases
           any _list90=PROP(cases_,this);
           { var caseWhenSection=undefined;
           for(int caseWhenSection__inx=0 ; caseWhenSection__inx<_list90.value.arr->length ; caseWhenSection__inx++){caseWhenSection=ITEM(caseWhenSection__inx,_list90);
               // caseWhenSection.out 'if('
               __call(out_,caseWhenSection,6,(any_arr){any_str("if("), new(Map,4,(any_arr){
                   _newPair("pre",_concatAny(2,(any_arr){caseVar, any_str("==(")})), 
                   _newPair("CSL",PROP(expressions_,caseWhenSection)), 
                   _newPair("post",any_str(")")), 
                   _newPair("separator",any_str("||"))
                   })
, any_str(") return "), PROP(resultExpression_,caseWhenSection), any_str(";"), Producer_c_NL});
           }};// end for each in PROP(cases_,this)

           // if .elseExpression, .out '    return ',.elseExpression,';',NL
           if (_anyToBool(PROP(elseExpression_,this))) {CALL4(out_,this,any_str("    return "), PROP(elseExpression_,this), any_str(";"), Producer_c_NL);};
           // .out '        }(',.varRef,'))'
           CALL3(out_,this,any_str("        }("), PROP(varRef_,this), any_str("))"));
       }

// else, it's a var-less case. we code it as chained ternary operators
       
       else {

         // for each caseWhenSection in .cases
         any _list91=PROP(cases_,this);
         { var caseWhenSection=undefined;
         for(int caseWhenSection__inx=0 ; caseWhenSection__inx<_list91.value.arr->length ; caseWhenSection__inx++){caseWhenSection=ITEM(caseWhenSection__inx,_list91);
             // .outLineAsComment caseWhenSection.lineInx
             CALL1(outLineAsComment_,this,PROP(lineInx_,caseWhenSection));
             // caseWhenSection.booleanExpression.produceType = 'Bool'
             PROP(produceType_,PROP(booleanExpression_,caseWhenSection)) = any_str("Bool");
             // caseWhenSection.out '(',caseWhenSection.booleanExpression,') ? (', caseWhenSection.resultExpression,') :',NL
             __call(out_,caseWhenSection,6,(any_arr){any_str("("), PROP(booleanExpression_,caseWhenSection), any_str(") ? ("), PROP(resultExpression_,caseWhenSection), any_str(") :"), Producer_c_NL});
         }};// end for each in PROP(cases_,this)

         // .out '/* else */ ',.elseExpression or 'undefined'
         CALL2(out_,this,any_str("/* else */ "), __or(PROP(elseExpression_,this),any_str("undefined")));
       };
     return undefined;
     }


   // append to class Grammar.DebuggerStatement ###
     // method produce
     any Grammar_DebuggerStatement_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_DebuggerStatement));
       //---------
       // .out "assert(0)"
       CALL1(out_,this,any_str("assert(0)"));
     return undefined;
     }

   // append to class Grammar.YieldExpression ###

     // method produce()
     any Grammar_YieldExpression_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_YieldExpression));
       //---------

// Check location

       // if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration
       var functionDeclaration=undefined;
       if (_anyToBool(__or(any_number(!(_anyToBool((functionDeclaration=CALL1(getParent_,this,Grammar_FunctionDeclaration))))),any_number(!_anyToBool(CALL1(hasAdjective_,functionDeclaration,any_str("nice")))))))  {
               // .throwError '"yield" can only be used inside a "nice function/method"'
               CALL1(throwError_,this,any_str("\"yield\" can only be used inside a \"nice function/method\""));
       };

       // var yieldArr=[]
       var yieldArr = new(Array,0,NULL);

       // var varRef = .fnCall.varRef
       var varRef = PROP(varRef_,PROP(fnCall_,this));
        //from .varRef calculate object owner and method name

       // var thisValue='null'
       var thisValue = any_str("null");
       // var fnName = varRef.name #default if no accessors
       var fnName = PROP(name_,varRef);// #default if no accessors

       // if varRef.accessors
       if (_anyToBool(PROP(accessors_,varRef)))  {

           // var inx=varRef.accessors.length-1
           var inx = any_number(_length(PROP(accessors_,varRef)) - 1);
           // if varRef.accessors[inx] instance of Grammar.FunctionAccess
           if (_instanceof(ITEM(_anyToNumber(inx),PROP(accessors_,varRef)),Grammar_FunctionAccess))  {
               // var functionAccess = varRef.accessors[inx]
               var functionAccess = ITEM(_anyToNumber(inx),PROP(accessors_,varRef));
               // yieldArr = functionAccess.args
               yieldArr = PROP(args_,functionAccess);
               // inx--
               inx.value.number--;
           };

           // if inx>=0
           if (_anyToNumber(inx) >= 0)  {
               // if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
               if (!(_instanceof(ITEM(_anyToNumber(inx),PROP(accessors_,varRef)),Grammar_PropertyAccess)))  {
                   // .throwError 'yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.'
                   CALL1(throwError_,this,any_str("yield needs a clear method name. Example: \"yield until obj.method(10)\". redefine yield parameter."));
               };

               // fnName = "'#{varRef.accessors[inx].name}'"
               fnName = _concatAny(3,(any_arr){any_str("'"), (PROP(name_,ITEM(_anyToNumber(inx),PROP(accessors_,varRef)))), any_str("'")});
               // thisValue = [varRef.name]
               thisValue = new(Array,1,(any_arr){PROP(name_,varRef)});
               // thisValue = thisValue.concat(varRef.accessors.slice(0,inx))
               thisValue = CALL1(concat_,thisValue,CALL2(slice_,PROP(accessors_,varRef),any_number(0), inx));
           };
       };


       // if .specifier is 'until'
       if (__is(PROP(specifier_,this),any_str("until")))  {

           // yieldArr.unshift fnName
           CALL1(unshift_,yieldArr,fnName);
           // yieldArr.unshift thisValue
           CALL1(unshift_,yieldArr,thisValue);
       }
       
       else {

           // yieldArr.push "'map'",.arrExpression, thisValue, fnName
           CALL4(push_,yieldArr,any_str("'map'"), PROP(arrExpression_,this), thisValue, fnName);
       };


       // .out "yield [ ",{CSL:yieldArr}," ]"
       CALL3(out_,this,any_str("yield [ "), new(Map,1,(any_arr){
       _newPair("CSL",yieldArr)
       })
, any_str(" ]"));
     return undefined;
     }


   // function operTranslate(name:string)
   any Producer_c_operTranslate(DEFAULT_ARGUMENTS){// define named params
     var name= argc? arguments[0] : undefined;
     //---------
     // return OPER_TRANSLATION_map.get(name) or name
     return __or(CALL1(get_,Producer_c_OPER_TRANSLATION_map,name),name);
   return undefined;
   }

// ---------------------------------

   // append to class ASTBase
// Helper methods and properties, valid for all nodes

    // properties skipSemiColon
    ;

    // helper method assignIfUndefined(name,expression)
    any ASTBase_assignIfUndefined(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,ASTBase));
         //---------
         // define named params
         var name, expression;
         name=expression=undefined;
         switch(argc){
           case 2:expression=arguments[1];
           case 1:name=arguments[0];
         }
         //---------

          //.out "if(",name,'.class==&Undefined_CLASSINFO) ',name,"=",expression,";",NL
         // .out "_default(&",name,",",expression,");",NL
         __call(out_,this,6,(any_arr){any_str("_default(&"), name, any_str(","), expression, any_str(");"), Producer_c_NL});
    return undefined;
    }


//-------------------------
void Producer_c__moduleInit(void){
    Producer_c_allClasses = new(Array,0,NULL);
    Producer_c_allMethodNames = new(Map,0,NULL)
;
    Producer_c_allPropertyNames = new(Map,0,NULL)
;
    Producer_c_coreSupportedMethods = new(Array,31,(any_arr){any_str("toString"), any_str("tryGetMethod"), any_str("tryGetProperty"), any_str("getProperty"), any_str("getPropertyName"), any_str("has"), any_str("get"), any_str("set"), any_str("clear"), any_str("delete"), any_str("keys"), any_str("slice"), any_str("split"), any_str("indexOf"), any_str("lastIndexOf"), any_str("concat"), any_str("toUpperCase"), any_str("toLowerCase"), any_str("charAt"), any_str("replaceAll"), any_str("trim"), any_str("toDateString"), any_str("toTimeString"), any_str("toUTCString"), any_str("toISOString"), any_str("shift"), any_str("push"), any_str("unshift"), any_str("pop"), any_str("join"), any_str("splice")});
    Producer_c_coreSupportedProps = new(Array,5,(any_arr){any_str("name"), any_str("value"), any_str("message"), any_str("stack"), any_str("code")});
    Producer_c_appendToCoreClassMethods = new(Array,0,NULL);
    Producer_c_DEFAULT_ARGUMENTS = any_str("(any this, len_t argc, any* arguments)");
    Producer_c_IDENTIFIER_ALIASES = new(Map,2,(any_arr){
     _newPair("on",any_str("true")), 
     _newPair("off",any_str("false"))
     })
;
    Producer_c_NL = any_str("\n");
    Producer_c_OPER_TRANSLATION_map = new(Map,13,(any_arr){
     _newPair("no",any_str("!")), 
     _newPair("not",any_str("!")), 
     _newPair("unary -",any_str("-")), 
     _newPair("unary +",any_str("+")), 
     _newPair("type of",any_str("typeof")), 
     _newPair("instance of",any_str("instanceof")), 
     _newPair("is",any_str("==")), 
     _newPair("isnt",any_str("!=")), 
     _newPair("<>",any_str("!=")), 
     _newPair("and",any_str("&&")), 
     _newPair("but",any_str("&&")), 
     _newPair("or",any_str("||")), 
     _newPair("has property",any_str("in"))
     })
;
   
};