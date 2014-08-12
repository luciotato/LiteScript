# shims 
## utility methods appended to core classes & namespaces

Helper methods to class String. 
Also add 'remove' & 'clear' to class Array

### Append to class String

        shim method startsWith(text:string)
            return this.slice(0, text.length) is text 

        shim method endsWith(text:string)
            return this.slice(-text.length) is text 

        shim method trimRight()
            if no this.length into var inx, return this //empty str
            do
                inx-- 
            loop while inx>=0 and this.charAt(inx) is ' '
            return this.slice(0,inx+1) 

        shim method trimLeft()
            if no this.length into var len, return this
            var inx=0
            while inx<len and this.charAt(inx) is ' '
                inx++
            return this.slice(inx) 

.capitalized

        method capitalized returns string
           if this, return "#{this.charAt(0).toUpperCase()}#{this.slice(1)}"

.replaceAll, equiv. to .replace(/./g, newStr)

        shim method replaceAll(searched,newStr)
           return this.replace(new RegExp(searched,"g"), newStr)

.countSpaces()

        shim method countSpaces()
            var inx=0
            while inx<this.length-1
                if this.charAt(inx) isnt ' ', break
                inx++

            return inx

.quoted(quotechar)

        method quoted(quoteChar)
            return '#{quoteChar}#{this}#{quoteChar}'

        shim method rpad(howMany)
            return .concat(String.spaces(howMany-.length))

repeat(howMany)

        shim method repeat(howMany)
            if howMany<=0, return ''
            
            var a=''
            while howMany--
                a &= this
            
            return a

### append to namespace String

        shim method spaces(howMany)
            return " ".repeat(howMany)

Checks if a name is Capitalized, unicode aware.
capitalized is like: /^[A-Z]+[$_a-z0-9]+$/ ,but unicode aware.

        method isCapitalized(text:string) returns boolean 
            if text and text.charAt(0) is text.charAt(0).toUpperCase() 
                if text.length is 1, return true;
                
                for n=1 while n<text.length
                    if text.charAt(n) is text.charAt(n).toLowerCase(), return true
                            
            return false
            
String.findMatchingPair(text,start,closer).
Note: text[start] MUST be the opener char

        method findMatchingPair(text:string, start, closer)
            var opener=text.charAt(start);
            var opencount=1;
            for n=start+1 while n<text.length
                if text.charAt(n) is closer and --opencount is 0 
                    return n
                else if text.charAt(n) is opener 
                    opencount++

            return -1
            


### Append to class Array

method .remove(element)

        shim method remove(element)  [not enumerable]

            if this.indexOf(element) into var inx >= 0
                 return this.splice(inx,1)


        shim method clear       [not enumerable]
            //empty the array
            for n=1 to .length
                .pop


##Console group

### append to namespace console

Note: Today, Node.js "console" object do not have `group` & `groupEnd` methods
neither do older browsers

        properties indentLevel

        shim method group() 
            console.log.apply undefined,arguments
            console.indentLevel = console.indentLevel or 0 + 1

        shim method groupEnd() 
            if console.indentLevel 
                console.indentLevel--

