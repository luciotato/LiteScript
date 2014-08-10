A view from a compile-to-javascript & compile-to-c lang:

##javascript:

js's '||' operator returns first expression if "thruthy", second expression if first is "falsey".
http://james.padolsey.com/javascript/truthy-falsey/

ja || operator can be used to set a default value if first value is "falsey" (undefined,0,null or "") 

    var a = Foo.somevalue() || bar || 2;

This reads "var a is Foo.somevalue() or bar or 2". It works as SQL COALESCE, 
but with "falseys" instead of NULLs. http://en.wikipedia.org/wiki/Null_(SQL)#COALESCE

Once you internalize the notion of "falsey" it makes a very readable code, and its 
IMHO a pleasant combination of 'or' 'falsey' and short-circuit evaluation.

##C:

C's '||' operator, returns *1* or *0*, not the first expression or the second. 
Expressions are discarded in C's ||

The following statement **is not valid in C**

    any a = Foo.somevalue() || bar || null;

But we can use a var and the ternary operator to emulate js || behavior:
We'll use a ternary operator to emulate js behavior

code js "||" in C, using ternary-if:

js: `A || B` 
C: `any __or1;`
   `(_anyToBool(__or1=A)? __or1 : B)`


