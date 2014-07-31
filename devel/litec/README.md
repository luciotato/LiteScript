##litec - standalone executable

litec is the result of self-compiling LiteScript compiler source code to .c
and then generate a executable with GCC

##To install

1. Use the js-version of the LiteScript compiler to generate c-code from LiteScript own sources (bld-c-code-lite-to-js.sh)
2. compile with GCC (select lite-to-js project)
3. `cd ~/LiteScript/devel/litec/litec-to-js/dist/Release/GNU-Linux-x86`
3. `sudo ln ./litec-to-js /usr/bin/litec`

now you have a `litec` compiler, which runs 6x-7x faster than the .js version of the LiteScript compiler.

##Recommended Tools
- I've used Netbeans with C/C++ plugin to compile and debug c code generated
by LiteScript, and the self-generated compiler c-code itself  
