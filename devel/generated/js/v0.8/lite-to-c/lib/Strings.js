//# Strings - namespace helpers

//Helper methods added here (Strings), or added to class String. 
//Also add 'remove' to class Array

    //shim import PMREX
    var PMREX = require('./PMREX.js');

//### Append to class String
    

        //shim method startsWith(text:string)
        if (!String.prototype.startsWith)
        String.prototype.startsWith = function(text){
            //return this.slice(0, text.length) is text 
            return this.slice(0, text.length) === text;
        };

        //shim method endsWith(text:string)
        if (!String.prototype.endsWith)
        String.prototype.endsWith = function(text){
            //return this.slice(-text.length) is text 
            return this.slice(-text.length) === text;
        };

        //shim method trimRight()
        if (!String.prototype.trimRight)
        String.prototype.trimRight = function(){
            //if no this.length into var inx, return this //empty str
            var inx=undefined;
            if (!((inx=this.length))) {return this};
            //do
            do{
                //inx-- 
                inx--;
            } while (inx >= 0 && this.charAt(inx) === ' ');// end loop
            //loop while inx>=0 and this.charAt(inx) is ' '
            //return this.slice(0,inx+1) 
            return this.slice(0, inx + 1);
        };

        //shim method trimLeft()
        if (!String.prototype.trimLeft)
        String.prototype.trimLeft = function(){
            //if no this.length into var len, return this
            var len=undefined;
            if (!((len=this.length))) {return this};
            //var inx=0
            var inx = 0;
            //while inx<len and this.charAt(inx) is ' '
            while(inx < len && this.charAt(inx) === ' '){
                //inx++
                inx++;
            };// end loop
            //return this.slice(inx) 
            return this.slice(inx);
        };

//.capitalized

        //method capitalized returns string
        String.prototype.capitalized = function(){
           //if this, return "#{this.charAt(0).toUpperCase()}#{this.slice(1)}"
           if (this) {return '' + (this.charAt(0).toUpperCase()) + (this.slice(1))};
        };

//.replaceAll, equiv. to .replace(/./g, newStr)

        //shim method replaceAll(searched,newStr)
        if (!String.prototype.replaceAll)
        String.prototype.replaceAll = function(searched, newStr){
           //return this.replace(new RegExp(searched,"g"), newStr)
           return this.replace(new RegExp(searched, "g"), newStr);
        };

//.countSpaces()

        //shim method countSpaces()
        if (!String.prototype.countSpaces)
        String.prototype.countSpaces = function(){
            //var inx=0
            var inx = 0;
            //while inx<this.length-1
            while(inx < this.length - 1){
                //if this.charAt(inx) isnt ' ', break
                if (this.charAt(inx) !== ' ') {break};
                //inx++
                inx++;
            };// end loop

            //return inx
            return inx;
        };

//.quoted(quotechar)

        //method quoted(quoteChar)
        String.prototype.quoted = function(quoteChar){
            //return '#{quoteChar}#{this}#{quoteChar}'
            return '' + quoteChar + this + quoteChar;
        };

        //shim method rpad(howMany)
        if (!String.prototype.rpad)
        String.prototype.rpad = function(howMany){
            //return .concat(String.spaces(howMany-.length))
            return this.concat(String.spaces(howMany - this.length));
        };


//### append to namespace String
    

        //shim method spaces(howMany)
        if (!String.spaces)
        String.spaces = function(howMany){
            //return String.repeat(" ",howMany)
            return String.repeat(" ", howMany);
        };


//repeat(str, howMany)

        //shim method repeat(str,howMany)
        if (!String.repeat)
        String.repeat = function(str, howMany){
            
            //if howMany<=0, return ""
            if (howMany <= 0) {return ""};
            
            //var a=''
            var a = '';
            //while howMany--
            while(howMany--){
                //a="#{a}#{str}"
                a = '' + a + str;
            };// end loop
            
            //return a
            return a;
        };


//Checks if a name is Capitalized, unicode aware.
//capitalized is like: /^[A-Z]+[$_a-z0-9]+$/ ,but unicode aware.

        //method isCapitalized(text:string) returns boolean 
        String.isCapitalized = function(text){
            //if text and text.charAt(0) is text.charAt(0).toUpperCase() 
            if (text && text.charAt(0) === text.charAt(0).toUpperCase()) {
                //if text.length is 1, return true;
                if (text.length === 1) {return true};
                
                //for n=1 while n<text.length
                for( var n=1; n < text.length; n++) {
                    //if text.charAt(n) is text.charAt(n).toLowerCase(), return true
                    if (text.charAt(n) === text.charAt(n).toLowerCase()) {return true};
                };// end for n
                
            };
                            
            //return false
            return false;
        };
            
//String.findMatchingPair(text,start,closer).
//Note: text[start] MUST be the opener char

        //method findMatchingPair(text:string, start, closer)
        String.findMatchingPair = function(text, start, closer){
            //var opener=text.charAt(start);
            var opener = text.charAt(start);
            //var opencount=1;
            var opencount = 1;
            //for n=start+1 while n<text.length
            for( var n=start + 1; n < text.length; n++) {
                //if text.charAt(n) is closer and --opencount is 0 
                if (text.charAt(n) === closer && --opencount === 0) {
                    //return n
                    return n;
                }
                else if (text.charAt(n) === opener) {
                //else if text.charAt(n) is opener 
                    //opencount++
                    opencount++;
                };
            };// end for n

            //return -1
            return -1;
        };
            
//String.replaceQuoted(text,rep)
//replace every quoted string inside text, by rep

        //method replaceQuoted(text:string, rep:string)
        String.replaceQuoted = function(text, rep){

            //var p = 0
            var p = 0;

//look for first quote (single or double?),
//loop until no quotes found 

            //var anyQuote = '"' & "'"
            var anyQuote = '"' + "'";

            //var resultText=""
            var resultText = "";

            //do 
            do{
                //var preQuotes=PMREX.untilRanges(text,anyQuote) 
                var preQuotes = PMREX.untilRanges(text, anyQuote);
                
                //resultText &= preQuotes
                resultText += preQuotes;
                //text = text.slice(preQuotes.length)
                text = text.slice(preQuotes.length);
                //if no text, break // all text processed|no quotes found
                if (!text) {break};

                //if text.slice(0,3) is '"""' //ignore triple quotes (valid token)
                if (text.slice(0, 3) === '"""') { //ignore triple quotes (valid token)
                    //resultText &= text.slice(0,3)
                    resultText += text.slice(0, 3);
                    //text = text.slice(3)
                    text = text.slice(3);
                }
                else {
                //else

                    //var quotedContent
                    var quotedContent = undefined;
                    
                    //try // accept malformed quoted chunks (do not replace)
                    try{

                         //quotedContent = PMREX.quotedContent(text)
                         quotedContent = PMREX.quotedContent(text);
                         //text = text.slice(1+quotedContent.length+1)
                         text = text.slice(1 + quotedContent.length + 1);
                    
                    }catch(err){

                    //catch err // if malformed - closing quote not found
                        //resultText &= text.slice(0,1) //keep quote
                        resultText += text.slice(0, 1); //keep quote
                        //text = text.slice(1) //only remove quote
                        text = text.slice(1); //only remove quote
                    };
                };
            } while (!!text);// end loop

            //loop until no text
            
            //return resultText
            return resultText;
        };


//### Append to class Array
    

//method remove(element)

        //method remove(element)  [not enumerable, not writable, configurable]
        Object.defineProperty(
        Array.prototype,'remove',{value:function(element){

            //if this.indexOf(element) into var inx >= 0
            var inx=undefined;
            if ((inx=this.indexOf(element)) >= 0) {
                 //return this.splice(inx,1)
                 return this.splice(inx, 1);
            };
        }
        ,enumerable:false
        ,writable:false
        ,configurable:true
        });

        //end method
        



