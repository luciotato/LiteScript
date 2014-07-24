LiteScript Compiler Source v0.4
===

This .lite code is written in v0.3 SYNTAX, and when processed by v0.3 compiler,
will generate the v0.4 compiler, supporting v0.4 SYNTAX.

v0.4 version major changes are: apply v0.3 syntax sugar 

v0.4 SYNTAX
-----------

### add 'export default' to 'export' adjective to adhere to ES6

example: `export default class MainModuleClass`


### changed ImportStatement to adhere to ES6

old: `import wait='lib/wait.for'`  new:  `'import wait from 'lib/wait.for'`




------
TO DO: New syntax -> js:Object.defineProperty

PropertyDeclaration:
    [enumerable][read-only] property IDENTIFIER ["=" value-Expression]
                [get ":" get-FunctionDeclaration]
                [set ":" set-FunctionDeclaration]

---



