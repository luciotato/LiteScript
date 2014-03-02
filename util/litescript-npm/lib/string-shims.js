//# String namespace helpers

//Helper methods added to String.protoype or String namespace
//also add 'remove' to Array

//## Additions (to the prototype)

   //append to class String
   

       //shim method startsWith(text:string)
       if (!String.prototype.startsWith)
       String.prototype.startsWith = function(text){
           return this.slice(0, text.length) === text;
       };

       //shim method endsWith(text:string)
       if (!String.prototype.endsWith)
       String.prototype.endsWith = function(text){
           return this.slice(-text.length) === text;
       };

//.capitalized

       //method capitalized
       String.prototype.capitalized = function(){
          //if this, return this[0].toUpperCase()+this.slice(1)
          if (this) {
              return this[0].toUpperCase() + this.slice(1)};
       };

//.quoted(quotechar)

       //method quoted(quoteChar)
       String.prototype.quoted = function(quoteChar){
           return quoteChar + this + quoteChar;
       };

//.repeat(howMany)

       //method repeat(howMany)
       String.prototype.repeat = function(howMany){
           //if howMany<=0, return
           if (howMany <= 0) {
               return};
           var a = [];
           a[howMany] = "";
           return a.join(this);
       };

//.translate(TRANSLATE_CONST_MAP) -> returns translated string or original string if no translation found

       //method translate(map:Object)
       String.prototype.translate = function(map){
           //if map.hasOwnProperty(this)
           if (map.hasOwnProperty(this)) {
               return map[this];
           }
           
           else {
               return this.valueOf();
           };
       };


   //append to class Array
   

//method remove(element)

       //method remove(element)  [not enumerable, not writable, configurable]
       Object.defineProperty(
       Array.prototype,'remove',{value:function(element){

           //if this.indexOf(element) into var inx >= 0
           var inx=undefined;
           if ((inx=this.indexOf(element)) >= 0) {
                return this.splice(inx, 1);
           };
       }
       ,enumerable:false
       ,writable:false
       ,configurable:true
       });

       //end method
       

        //property last [not enumerable]
        //    get: function
        //        return .length-1


   //append to namespace String
   
//--------------------------------------
// Additions to String **as namespace**
//--------------------------------------

//String.spaces(howMany)

       //method spaces(howMany)
       String.spaces = function(howMany){
           //if howMany<=0, return ""
           if (howMany <= 0) {
               return ""};
           return " ".repeat(howMany);
       };

//Checks if a name is Capitalized, unicode aware.
//capitalized is like: /^[A-Z]+[$_a-z0-9]+$/ ,but unicode aware.

       //method isCapitalized(text:string) returns boolean
       String.isCapitalized = function(text){
           //if text and text[0] is text[0].toUpperCase()
           if (text && text[0] === text[0].toUpperCase()) {
               //if text.length  is 1, return true;
               if (text.length === 1) {
                   return true};

               //for n=1 while n<text.length
               for( var n=1; n < text.length; n++) {
                   //if text[n] is text[n].toLowerCase(), return true
                   if (text[n] === text[n].toLowerCase()) {
                       return true};
               }; // end for n
               
           };

           return false;
       };

//String.findMatchingPair(text,start,closer).
//Note: text[start] MUST be the opener char

       //method findMatchingPair(text:string, start, closer)
       String.findMatchingPair = function(text, start, closer){
           var opener = text[start];
           var opencount = 1;
           //for n=start+1 while n<text.length
           for( var n=start + 1; n < text.length; n++) {
               //if text[n] is closer and --opencount is 0, return n
               if (text[n] === closer && --opencount === 0) {
                   return n};
               //if text[n] is opener, opencount++
               if (text[n] === opener) {
                   opencount++};
           }; // end for n

           return -1;
       };

//String.replaceQuoted(text,rep)
//replace every quoted string inside text, by rep

       //method replaceQuoted(text:string,rep)
       String.replaceQuoted = function(text, rep){

           //do
           while(true){

                //get first quote (single or double?)
               var p = text.search(/"|'/);

               //if p<0, break //no more quotes
               if (p < 0) {
                   break};

               var quote = text[p];

               var regExp = new RegExp(quote + "([^" + quote + "\\\\" + "]|\\\\.)+" + quote);
                // quote, followed by: ( [ anything but: quote or \ ] |or| \+any.char ) ONE or more times, and quote
                // Note: ...ONE or more times..., to do not convert """ into "

               //if no regExp.test(text), break //unmatched quote
               if (!regExp.test(text)) {
                   break};

               text = text.replace(regExp, rep);
           };//end loop

           return text;
       };

//String.splitExpressions(text, delimiter)
//split on #{expresion}

       //method splitExpressions(text:string, delimiter) returns array
       String.splitExpressions = function(text, delimiter){

//look for #{expression} inside a quoted string
//split expressions

               //if no text then return []
               if (!text) {
                   return []};

                //get quotes
               var quotes = text[0];
               //if quotes isnt '"' and quotes isnt "'"
               if (quotes !== '"' && quotes !== "'") {
                   //fail with 'splitExpressions: expected text to be a quoted string, quotes included'
                   throw new Error('splitExpressions: expected text to be a quoted string, quotes included');
               };

               var 
               delimiterPos = undefined, 
               closerPos = undefined, 
               itemPos = undefined, 
               item = undefined
               ;
               var items = [];

                // helper internal function
               //helper function push(content:string, useQuotes)
               function push(content, useQuotes){
                   //if content
                   if (content) {
                       //if useQuotes, content = content.quoted(useQuotes)
                       if (useQuotes) {
                           content = content.quoted(useQuotes)};
                       items.push(content);
                   };
               };


                //clear start and end quotes
               var str = text.substr(1, text.length - 2);

               var lastDelimiterPos = 0;

               //do
               while(true){

                   delimiterPos = str.indexOf(delimiter + "{", lastDelimiterPos);
                   //if delimiterPos<0 then break
                   if (delimiterPos < 0) {
                       break};

                    // first part - text upto first delimiter
                   push(str.slice(lastDelimiterPos, delimiterPos), quotes);

                   var start = delimiterPos + 1;

                   closerPos = String.findMatchingPair(str, start, "}");

                   //if closerPos<0
                   if (closerPos < 0) {
                       //fail with 'unmatched "'+ delimiter +'{" at string: '+ text
                       throw new Error('unmatched "' + delimiter + '{" at string: ' + text);
                   };


                   item = str.slice(start + 1, closerPos);
                    // add parens if expression
                   //if item not like /^[A-Za-z0-9_$.]+$/ then item = '('+item+')';
                   if (!(/^[A-Za-z0-9_$.]+$/.test(item))) {
                       item = '(' + item + ')'};

                   lastDelimiterPos = closerPos + 1;

                   push(item); //push expression
               };//end loop

                // make sure we start with a string to avoid '+' numeric behavior
               //if items.length and items[0][0] isnt quotes then items.unshift(quotes+quotes)
               if (items.length && items[0][0] !== quotes) {
                   items.unshift(quotes + quotes)};

                // remainder
               push(str.slice(lastDelimiterPos), quotes);

               return items;
       };



//Compiled by LiteScript compiler v0.5.0, source: /home/ltato/LiteScript/source-v0.6.0/string-shims.md
//# sourceMappingURL=string-shims.js.map
