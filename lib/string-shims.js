//Compiled by LiteScript compiler v0.6.3, source: /home/ltato/LiteScript/devel/source-v0.6/string-shims.md
   
       if (!String.prototype.startsWith)
       String.prototype.startsWith = function(text){
           return this.slice(0, text.length) === text;
       };
       if (!String.prototype.endsWith)
       String.prototype.endsWith = function(text){
           return this.slice(-text.length) === text;
       };
       String.prototype.capitalized = function(){
          if (this) {
              return this[0].toUpperCase() + this.slice(1)};
       };
       String.prototype.quoted = function(quoteChar){
           return quoteChar + this + quoteChar;
       };
       String.prototype.repeat = function(howMany){
           if (howMany <= 0) {
               return};
           var a = [];
           a[howMany] = "";
           return a.join(this);
       };
       String.prototype.translate = function(map){
           if (map.hasOwnProperty(this)) {
               return map[this];
           }
           else {
               return this.valueOf();
           };
       };
   
       Object.defineProperty(
       Array.prototype,'remove',{value:function(element){
           var inx=undefined;
           if ((inx=this.indexOf(element)) >= 0) {
                return this.splice(inx, 1);
           };
       }
       ,enumerable:false
       ,writable:false
       ,configurable:true
       });
       
   
       String.spaces = function(howMany){
           if (howMany <= 0) {
               return ""};
           return " ".repeat(howMany);
       };
       String.isCapitalized = function(text){
           if (text && text[0] === text[0].toUpperCase()) {
               if (text.length === 1) {
                   return true};
               for( var n=1; n < text.length; n++) {
                   if (text[n] === text[n].toLowerCase()) {
                       return true};
               };
               
           };
           return false;
       };
       String.findMatchingPair = function(text, start, closer){
           var opener = text[start];
           var opencount = 1;
           for( var n=start + 1; n < text.length; n++) {
               if (text[n] === closer && --opencount === 0) {
                   return n};
               if (text[n] === opener) {
                   opencount++};
           };
           return -1;
       };
       String.replaceQuoted = function(text, rep){
           while(true){
               var p = text.search(/"|'/);
               if (p < 0) {
                   break};
               var quote = text[p];
               var regExp = new RegExp(quote + "([^" + quote + "\\\\" + "]|\\\\.)+" + quote);
               if (!regExp.test(text)) {
                   break};
               text = text.replace(regExp, rep);
           };
           return text;
       };
       String.splitExpressions = function(text, delimiter){
               if (!text) {
                   return []};
               var quotes = text[0];
               if (quotes !== '"' && quotes !== "'") {
                   throw new Error('splitExpressions: expected text to be a quoted string, quotes included');
               };
               var 
               delimiterPos = undefined, 
               closerPos = undefined, 
               itemPos = undefined, 
               item = undefined
               ;
               var items = [];
               function push(content, useQuotes){
                   if (content) {
                       if (useQuotes) {
                           content = content.quoted(useQuotes)};
                       items.push(content);
                   };
               };
               var str = text.substr(1, text.length - 2);
               var lastDelimiterPos = 0;
               while(true){
                   delimiterPos = str.indexOf(delimiter + "{", lastDelimiterPos);
                   if (delimiterPos < 0) {
                       break};
                   push(str.slice(lastDelimiterPos, delimiterPos), quotes);
                   var start = delimiterPos + 1;
                   closerPos = String.findMatchingPair(str, start, "}");
                   if (closerPos < 0) {
                       throw new Error('unmatched "' + delimiter + '{" at string: ' + text);
                   };
                   item = str.slice(start + 1, closerPos);
                   if (!(/^[A-Za-z0-9_$.]+$/.test(item))) {
                       item = '(' + item + ')'};
                   lastDelimiterPos = closerPos + 1;
                   push(item);
               };
               if (items.length && items[0][0] !== quotes) {
                   items.unshift(quotes + quotes)};
               push(str.slice(lastDelimiterPos), quotes);
               return items;
       };
