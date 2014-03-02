LiteScript Compiler Source Version 3
===

This .lite code is written in V2 SYNTAX, and when processed by V2 compiler,
will generate the V3 compiler, supporting V3 SYNTAX.

V3 version major changes are: new syntax added, and some syntax sugar

v0.3 SYNTAX
-----------

## Assume 'this' on dot: a single dot is alias for 'this'

Example: ".x" is alias for "this.x" 

Example:
    
    class ClassA
        properties
            a,b,c

        constructor new ClassA(start, value) 
            .a = start
            .b = start+value
            .c = value


## New syntax: assignment-expression: `into [var] IDENTIFIER` 

Examples: 

old v0.2:

        var msg
        do
            msg = getNextMsg()
            if no msg, break
            print msg
            wrap msg
            send msg
        loop

new in v0.3:

        while getNextMsg() into var msg
            print msg
            wrap msg
            send msg

others:

        var userName
        if getName('user') into userName
            log.login userName, new Date
            createSession userName
        else
            fail with 'unknown user name'

        var userName:string, welcomeMessage
        welcomeMessage = getName('user') into userName? 'Hello #userName' : 'please login, stranger'


## ForLoop, variant: For-each-property: added second variable: [,value-IDENTIFIER] 

`ForEachProperty: for each [own] property name-IDENTIFIER ["," value-IDENTIFIER] in object-VariableRef [where Expression]`

Example: `for each own property prop,value in myObject where value>10 and value<20`


## new syntax sugar: `ForWhereFilter: for [each] IDENTIFIER in array-Expression [where filter-Expression]` 

Example: `for each item in myArray where item>10 and item<20`


## new syntax sugar: **like**: Grammar: `STRING like REGEXP` -> js:`REGEXP.test(STRING)`

Example: `if str like /abc|123/, alert 'yes'` ->  js:`if(/abc|123/.test(str)){alert('yes')}`

## syntax change: **export** instead of **public** to adhere to ES6 

Example: old: `public function xx...`, new: `export function xx...`

http://www.2ality.com/2013/07/es6-modules.html


## new syntax sugar: **import**: alias for "require()"

Grammar: `import (VariableDecl,)+` -> js:`var VariableDecl.name = require('VariableDecl.name|VariableDecl.assignedValue')`

Example: `import fs, path` ->  js:`var fs=require('fs'),path=require('path')`

Example: `import http, wait='wait.for'` ->  js:`var http=require('http'),wait=require('wait.for')`


Controls added
--------------

* Do not allow 'function' declaration inside 'class/append to' body. Require a "method" declaration.


------
TO DO: New syntax -> js:Object.defineProperty

PropertyDeclaration:
    [enumerable][read-only] property IDENTIFIER ["=" value-Expression]
                [get ":" get-FunctionDeclaration]
                [set ":" set-FunctionDeclaration]

---



