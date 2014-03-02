# String namespace helpers

Helper methods added to String.protoype or String namespace
also add 'remove' to Array

## Additions (to the prototype)

### Append to class String

        shim method startsWith(text:string)
            return this.slice(0, text.length) is text 

        shim method endsWith(text:string)
            return this.slice(-text.length) is text 

.capitalized

        method capitalized
           if this, return this[0].toUpperCase()+this.slice(1)

.quoted(quotechar)

        method quoted(quoteChar)
            return quoteChar+this+quoteChar

.repeat(howMany)

        method repeat(howMany)
            if howMany<=0, return
            var a=[]
            a[howMany]=""
            return a.join(this)

.translate(TRANSLATE_CONST_MAP) -> returns translated string or original string if no translation found

        method translate(map:Object)
            if map.hasOwnProperty(this)
                return map[this]
            else
                return this.valueOf()


### Append to class Array

method remove(element)

        method remove(element)  [not enumerable, not writable, configurable]

            if this.indexOf(element) into var inx >= 0
                 return this.splice(inx,1)

        end method

        //property last [not enumerable]
        //    get: function
        //        return .length-1


### Append to namespace String
//--------------------------------------
// Additions to String **as namespace** 
//--------------------------------------

String.spaces(howMany)

        method spaces(howMany)
            if howMany<=0, return ""
            return " ".repeat(howMany)

Checks if a name is Capitalized, unicode aware.
capitalized is like: /^[A-Z]+[$_a-z0-9]+$/ ,but unicode aware.

        method isCapitalized(text:string) returns boolean 
            if text and text[0] is text[0].toUpperCase() 
                if text.length  is 1, return true;
                
                for n=1 while n<text.length
                    if text[n] is text[n].toLowerCase(), return true
                            
            return false
            
String.findMatchingPair(text,start,closer).
Note: text[start] MUST be the opener char

        method findMatchingPair(text:string, start, closer)
            var opener=text[start];
            var opencount=1;
            for n=start+1 while n<text.length
                if text[n] is closer and --opencount is 0, return n
                if text[n] is opener, opencount++

            return -1;
            
String.replaceQuoted(text,rep)
replace every quoted string inside text, by rep

        method replaceQuoted(text:string,rep)

            do

                //get first quote (single or double?)
                var p = text.search(/"|'/)
                
                if p<0, break //no more quotes

                var quote = text[p]

                var regExp = new RegExp( quote + "([^" + quote + "\\\\" + "]|\\\\.)+" + quote);
                // quote, followed by: ( [ anything but: quote or \ ] |or| \+any.char ) ONE or more times, and quote
                // Note: ...ONE or more times..., to do not convert """ into "
                
                if no regExp.test(text), break //unmatched quote 

                text = text.replace(regExp,rep)

            loop
            
            return text

String.splitExpressions(text, delimiter)
split on #{expresion}

        method splitExpressions(text:string, delimiter) returns array

look for #{expression} inside a quoted string
split expressions

                if no text then return []

                //get quotes
                var quotes = text[0]
                if quotes isnt '"' and quotes isnt "'"
                    fail with 'splitExpressions: expected text to be a quoted string, quotes included'

                var delimiterPos, closerPos, itemPos, item;
                var items=[];

                // helper internal function
                helper function push(content:string, useQuotes)
                    if content
                        if useQuotes, content = content.quoted(useQuotes)
                        items.push content
                    
                
                //clear start and end quotes
                var str:string = text.substr(1,text.length-2)

                var lastDelimiterPos=0;
                
                do

                    delimiterPos = str.indexOf(delimiter+"{",lastDelimiterPos);
                    if delimiterPos<0 then break

                    // first part - text upto first delimiter
                    push str.slice(lastDelimiterPos,delimiterPos),quotes 
                    
                    var start = delimiterPos + 1

                    closerPos = String.findMatchingPair(str,start,"}")

                    if closerPos<0
                        fail with 'unmatched "'+ delimiter +'{" at string: '+ text
                   

                    item = str.slice(start+1, closerPos);
                    // add parens if expression
                    if item not like /^[A-Za-z0-9_$.]+$/ then item = '('+item+')';

                    lastDelimiterPos = closerPos + 1

                    push item //push expression

                loop

                // make sure we start with a string to avoid '+' numeric behavior
                if items.length and items[0][0] isnt quotes then items.unshift(quotes+quotes)
                
                // remainder
                push str.slice(lastDelimiterPos),quotes

                return items
            
