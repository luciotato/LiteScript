//
// Helper methods added to String.protoype or String namespace
// also add 'remove' to Array
//

//----
//shims
//----
if (!String.prototype.startsWith)
    String.prototype.startsWith = function (text) {
        return this.slice(0, text.length) === text 
    };

if (!String.prototype.endsWith)
    String.prototype.endsWith = function (text) {
        return this.slice(-text.length) === text 
    };

if (!Array.prototype.remove) Object.defineProperty(
    Array.prototype,"remove", 
        {value:function(element){
                    var inx = this.indexOf(element);
                    if (inx>=0) return this.splice(inx,1);
               }            
        }
    );

//----------
// Additions (to the prototype)
//----------

//capitalized
String.prototype.capitalized = function(){
    if (this) return this[0].toUpperCase()+this.slice(1)
}

//----------
// .quoted(quotechar)
//----------
String.prototype.quoted = function(quoteChar){
    return quoteChar+this+quoteChar;
};

//----------
// .repeat(howMany)
//----------
String.prototype.repeat = function(howMany){
    if (howMany<=0) return;
    var a=[];
    a[howMany]="";
    return a.join(this);
};

//----------
// .translate(TRANSLATE_CONST_MAP) -> returns translated string or original string if no translation found
//----------
String.prototype.translate = function(map){
    if (map.hasOwnProperty(this))
        return map[this];
    else
        return this.valueOf();
};



//--------------------------------------
//--------------------------------------
// Additions to String **as namespace** 
//--------------------------------------
//--------------------------------------

//----------
// String.spaces(howMany)
//----------
String.spaces = function(howMany){
    if (howMany<=0) return "";
    return " ".repeat(howMany);
};


//Checks if a name is Capitalized, unicode aware.
//capitalized is like: /^[A-Z]+[$_a-z0-9]+$/ ,but unicode aware.
String.isCapitalized = function(text){
        if (text && text[0]===text[0].toUpperCase()) {
            if(text.length===1) return true;
            for(var n=1;n<text.length;n++) {
                if (text[n]===text[n].toLowerCase()) return true;
            }
        }
        return false
};

//----------
// .findMatchingPair(start,closer)
// at this[start] MUST be the opener char
//----------

String.findMatchingPair = function(text, start, closer) {
    var opener=text[start];
    var opencount=1;
    for (var n=start+1;n<text.length;n++) {
        if (text[n]===closer && --opencount===0) return n;
        if (text[n]===opener) opencount++;
    }
    return -1;
};

//----------
// .replaceQuoted(text,rep)
// replace every quoted string inside text, by rep
//----------

String.replaceQuoted = function (text,rep) {

    while (true) {

        //get first quote (single or double?)
        var p = text.search(/"|'/)
        
        if (p<0) break; //no more quotes

        var quote = text[p];

        var regExp = new RegExp( quote + "([^" + quote + "\\\\" + "]|\\\\.)+" + quote);
        // quote, followed by: ( [ anything but: quote or \ ] |or| \+any.char ) ONE or more times, and quote
        // Note: ...ONE or more times..., to do not convert """ into "
        
        if (!regExp.test(text)) break; //unmatched quote 

        text = text.replace(regExp,rep);

    }
    return text;
}

//------------------------
//- split on $expresion --
//-------------------------
String.splitExpressions = function(text, delimiter){ //returns { items:[{pre,$pos,$len,expr},...], post:string}

// look for $expression or ${expression} inside a quoted string

    if (!text) return [];

    //get quotes
    var quotes = text[0];
    if (quotes!=='"' && quotes!=="'") 
        throw new Error('splitExpressions: expected text to be a quoted string, quotes included') 

    var delimiterPos, closerPos, itemPos, item;
    var items=[];

    // helper internal function
    function push(text, quotes){
        if (text) {
            if (quotes) text=text.quoted(quotes)
            items.push(text);
        }
    }

    //clear start and end quotes
    var str = text.substr(1,text.length-2);

    var lastDelimiterPos=0;
    while (true) {

        delimiterPos = lastDelimiterPos;
        while(delimiterPos>=0){
            delimiterPos = str.indexOf(delimiter,delimiterPos);
            if(str[delimiterPos-1]==='\\') delimiterPos++; // continue on \# or \$
            else break;
        };
        if (delimiterPos<0) break;

        // first part - text upto first delimiter
        push( str.slice(lastDelimiterPos,delimiterPos), quotes );
        
        var start = delimiterPos + 1;

        if (str[start]==="{") { // is "${...}"

            closerPos = String.findMatchingPair(str,start,"}");

            if (closerPos<0) {
                throw new Error('unmatched "'+ delimiter +'{" at string: '+ text);
                break;
            }

            item = str.slice(start+1, closerPos);
            // since its ${...} add parens to the expression
            if (item) item = '('+item+')';

            lastDelimiterPos = closerPos + 1; 
        }
        else { // is not "${"

            // look for delimiter: regexp: not (word_character or . )
            closerPos = str.slice(start).search(/[^\w\.]/);
            if (closerPos===-1) lastDelimiterPos = str.length;
            else {
                lastDelimiterPos = start + closerPos;
                if (str[lastDelimiterPos-1]==='.') lastDelimiterPos--; //ends with '.', do not include
            }

            item = str.slice(start,lastDelimiterPos);
        }

        push(item); //push expression

    }
    
    // remainder
    push ( str.slice(lastDelimiterPos), quotes);

    return items;
}


