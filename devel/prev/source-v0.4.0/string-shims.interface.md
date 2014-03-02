
Helper methods added to String.protoype or String namespace
also add 'remove' to Array

### Append to class String

        shim method startsWith(text)
        shim method endsWith(text)

        method capitalized
        method quoted
        method repeat(howMany)
        method translate(map:Object)

### Append to class Array
        method remove(element)


### Append to namespace String
//--------------------------------------
// Additions to String **as namespace** 
//--------------------------------------

        method spaces(howMany)

        method isCapitalized(text) returns boolean 
            //Checks if a name is Capitalized, unicode aware.

        method findMatchingPair(text, start, closer)
            // this[start] MUST be the opener char

        method replaceQuoted(text,rep)
            // replace every quoted string inside text, by rep

        method splitExpressions(text, delimiter)
            // look for ${expression} inside a quoted string
