LiteScript Compiler Source v0.6
===============================

This .lite code is written in v0.5 SYNTAX, and when processed by v0.5 compiler,
will generate the v0.6 compiler, supporting v0.6 SYNTAX. 

Actually, v0.6 compiler is able to compile itself.

##IMPORTANT: development is made at /devel/source-v0.6

Ig you're reading /source/, it's just a snapshot of the las release.
Do NOT work on /source/, work on /devel/source-v0.6/.


v0.6 SYNTAX
-----------

### Preprocessor

added meta-statement 'compiler generate' to generate LiteScript code on the fly
while compiling.


### Added 
New syntax method x [not enumerable, configurable]-> js:Object.defineProperty


###TO DO:
PropertyDeclaration:
    [enumerable][read-only] property IDENTIFIER ["=" value-Expression]
                [get ":" get-FunctionDeclaration]
                [set ":" set-FunctionDeclaration]

---
