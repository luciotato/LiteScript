LiteScript Compiler Source v0.5
===

This .lite code is written in v0.5 SYNTAX, and when processed by v0.4 compiler,
will generate the v0.5 compiler, supporting v0.5 SYNTAX.

v0.5 version major changes are:

### add 'public' as alias for 'export'

example: `public default class MainModuleClass`

### add 'compiler import' to import type definitions without including a 'require()'

### inteface.md and compiling for the browser

- added differential parsing for 'interface.md'
  - see Document.interface.md at LiteScript_online_playground
  - 'compiler import' puts in window (global namespace) all public items in the file

- added  -b, -browser compiler option

when -browser option is set, neither 'global' nor 'process' are created in the global scope,
also, 'public' vars in imported modules, are just added to the global scope instead
of adding 'module.exports = x'.

### new syntax 'namespace x'

To define 'namespaces' (objects). Namespaces can have properties, methods *and other classes* inside.
- see: ace.interface.md at LiteScript_online_playground

### Class properties, when assigned value

Class properties, when assigned value, are converted to assignment statement
in the class constructor. 

### added SourceMap generation

See: SourceMap.lite.md 

### added method definition properties 

Example:

    Append to class Array

        method remove(element) [not enumerable, not writable, configurable]

            if this.indexOf(element) into var inx >= 0
                 return this.splice(inx,1)

        end method

This causes Producer_js to code: Object.DefineProperty:

   //append to class Array
       //method remove(element)  [not enumerable, not writable, configurable]
       Object.defineProperty(
       Array.prototype,'remove',{value:function(element){

           //if this.indexOf(element) into var inx >= 0
           var inx=undefined;
           if ((inx=this.indexOf(element)) >= 0) {
                return this.splice(inx, 1);
           };
       }
       ,enumerable:false
       ,writable:false
       ,configurable:true
       });

       //end method

------
TO DO: New syntax -> js:Object.defineProperty

PropertyDeclaration:
    property IDENTIFIER [not enumerable, not writable, configurable, get, set]
        [get ":" get-FunctionDeclaration]
        [set ":" set-FunctionDeclaration]

---



