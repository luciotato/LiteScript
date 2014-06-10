LiteScript Compiler Source v0.7
===============================

This .lite code is written in v0.6 SYNTAX, and when processed by v0.6 compiler,
will generate the v0.7 compiler, supporting v0.7 SYNTAX. 

Actually, v0.7 compiler is able to compile itself.

##IMPORTANT: development is made at /devel/source-v0.7

Ig you're reading /source/, it's just a snapshot of the las release.
Do NOT work on /source/, work on /devel/source-v0.7

v0.7 
----

### MAIN CHANGES

First "Compile-to-C" incorporation.
When compiled with "-D PROD_C", this source will incorporate
"producer_c.js" and will hace as default target ".C"
see: build-PRODC.sh


###TO DO:
PropertyDeclaration:
    [enumerable][read-only] property IDENTIFIER ["=" value-Expression]
                [get ":" get-FunctionDeclaration]
                [set ":" set-FunctionDeclaration]

---

