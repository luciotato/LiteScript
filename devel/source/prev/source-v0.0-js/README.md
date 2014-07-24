This is Version 0 of LiteScript compiler
===

This js code, can compile ./sources-V1 and generate ./liteCompiler-V1

The code in ./sources-V1 is written in 'V0 Syntax' with the new V1 syntax 
specially enclosed between /! and !/ 

This V0 compiler ignores sections between /! and !/ 


This code started from a forked and enhanced version of Kal (https://github.com/rzimmerman/kal)
the first days of december 2013.
Added:
- better compile error context (example: know which file is being compiled)
- SourceMap generation - Note: dependencies: npm install source-map
The compiler was altered to read '.lite.[md]' files, then frozen into .js form, to 
be able to discard Kal, and start writing LiteScript V1 compiler sources.

After that, special "comment" sections "/! !/" were added, in order
to make this compiler (V0) ignore new syntax sections of the source.
Also a consideration was added so this compiler accepts "var" statement 
and "type annotations", but ignore them.

The V1 version is a complete rewrite, adding:
- Type Annotations and variable and properties names check.
- class properties
- exception blocks
- comma/semicolon and free-form separated lists
- source and output are handled as array of strings 
- separate "new" from "parse" in AST Nodes
- added parseDirect, using keword-Symbol maps, great performance improvement
- added outCode helper methods for code generation to ASTBase
- removed 'generator', added 'producer'. Instead of constructing and returning string, OutCode helpers
   are user in recursive form to generate code from the AST tree.
- removed tail conditions, added ternary operator support, and single-line ifs
- removed 'literate', literate support is in the lexer
- removed 'parser', since all the parsing is done in the PEG nodes
- removed 'sugar', because of changes and enhancements, no need to pre-process
- removed req_multi
- removed all kal waitfor and parallel code.

Changes from v0 to v1
------------------|-----
module            | lines | Lite Module       | lines| notes
------------------|----
AST.litkal        | 185   | ASTBase.lite      | 915  | +code generation helpers, separated lists, parseDirect
generator.litkal  | 1905  | Producer_js.lite  | 1265 | +for (3 variants), -waitfor.kal
grammar.litkal    | 1119  | Grammar.lite      | 3428 | +Grammar Meta-Syntax, VariableDecl, For, Grow Expresion Tree
lexer.litkal      | 254   | Lexer.lite        | 1008 | +Error reporting, Multiline comments, literate
sugar.litkal      | 480   |                   |      | done in Lexer.lite 
