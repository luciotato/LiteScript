LiteScript Compiler Source v0.8
===============================

This .lite code is written in v0.7 SYNTAX, and when processed by v0.7 compiler,
will generate the v0.8 compiler, supporting v0.8 SYNTAX. 

Eventually the, v0.8 compiler should be able to compile itself.

##IMPORTANT: development is made at /devel/source-v0.8

Ig you're reading /source/, it's *just a snapshot of the last release*.
work on /devel/source-v0.8

v0.8
----

### MAIN CHANGES

"Compile-to-C" incorporation.
When compiled with "-D PROD_C", this source will incorporate
"producer_c.js" and will hace as default target ".C"

For every *imported* (aka required) module, if there is 
a namespace with the same name as the module filename,
is by default a "export default namespace x"

e.g.:

-- main file:

    import path

-- file path.lite.md:

    namespace path   // same as filename, so it is "export default". 
                    // Exports from this module are path's methods and properties, public by default

        properties
            sep='/'

        method resolve(...)
    
    end namespace path


