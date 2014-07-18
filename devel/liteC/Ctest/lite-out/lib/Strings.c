#include "Strings.h"
//-------------------------
//Module Strings
//-------------------------


    //-------------------------
    //NAMESPACE Strings
    //-------------------------

        //method spaces(howMany)
        any Strings_spaces(DEFAULT_ARGUMENTS){
            
            // define named params
            var howMany= argc? arguments[0] : undefined;
            //---------
            //return Strings.repeat(" ",howMany)
            return Strings_repeat(undefined,2,(any_arr){any_str(" "), howMany});
        return undefined;
        }

// repeat(str, howMany)

        //shim method repeat(str,howMany)
        any Strings_repeat(DEFAULT_ARGUMENTS){
            
            // define named params
            var str, howMany;
            str=howMany=undefined;
            switch(argc){
              case 2:howMany=arguments[1];
              case 1:str=arguments[0];
            }
            //---------

            //if howMany<=0, return ""
            if (_anyToNumber(howMany) <= 0) {return any_EMPTY_STR;};

            //var a=''
            var a = any_EMPTY_STR;
            //while howMany--
            while(howMany.value.number--){
                //a="#{a}#{str}"
                a = _concatAny(2,(any_arr){a, str});
            };// end loop

            //return a
            return a;
        return undefined;
        }


// Checks if a name is Capitalized, unicode aware.
// capitalized is like: /^[A-Z]+[$_a-z0-9]+$/ ,but unicode aware.

        //method isCapitalized(text:string) returns boolean 
        any Strings_isCapitalized(DEFAULT_ARGUMENTS){
            
            // define named params
            var text= argc? arguments[0] : undefined;
            //---------
            //if text and text.charAt(0) is text.charAt(0).toUpperCase() 
            if (_anyToBool(text) && __is(METHOD(charAt_,text)(text,1,(any_arr){any_number(0)}),__call(toUpperCase_,METHOD(charAt_,text)(text,1,(any_arr){any_number(0)}),0,NULL)))  {
                //if text.length is 1, return true;
                if (__is(any_number(_length(text)),any_number(1))) {return true;};

                //for n=1 while n<text.length
                for(int64_t n=1; n < _length(text); n++) {
                    //if text.charAt(n) is text.charAt(n).toLowerCase(), return true
                    if (__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(n)}),__call(toLowerCase_,METHOD(charAt_,text)(text,1,(any_arr){any_number(n)}),0,NULL))) {return true;};
                };// end for n
                
            };

            //return false
            return false;
        return undefined;
        }

// String.findMatchingPair(text,start,closer).
// Note: text[start] MUST be the opener char

        //method findMatchingPair(text:string, start, closer)
        any Strings_findMatchingPair(DEFAULT_ARGUMENTS){
            
            // define named params
            var text, start, closer;
            text=start=closer=undefined;
            switch(argc){
              case 3:closer=arguments[2];
              case 2:start=arguments[1];
              case 1:text=arguments[0];
            }
            //---------
            //var opener=text.charAt(start);
            var opener = METHOD(charAt_,text)(text,1,(any_arr){start});
            //var opencount=1;
            var opencount = any_number(1);
            //for n=start+1 while n<text.length
            for(int64_t n=_anyToNumber(start) + 1; n < _length(text); n++) {
                //if text.charAt(n) is closer and --opencount is 0 
                if (__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(n)}),closer) && __is(any_number(--opencount.value.number),any_number(0)))  {
                    //return n
                    return any_number(n);
                }
                //else if text.charAt(n) is opener 
                
                else if (__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(n)}),opener))  {
                    //opencount++
                    opencount.value.number++;
                };
            };// end for n

            //return -1
            return any_number(-1);
        return undefined;
        }

// String.replaceQuoted(text,rep)
// replace every quoted string inside text, by rep

        //method replaceQuoted(text:string, rep:string)
        any Strings_replaceQuoted(DEFAULT_ARGUMENTS){
            
            // define named params
            var text, rep;
            text=rep=undefined;
            switch(argc){
              case 2:rep=arguments[1];
              case 1:text=arguments[0];
            }
            //---------

            //var p = 0
            var p = any_number(0);

// look for first quote (single or double?),
// loop until no quotes found

            //var anyQuote = '"' & "'"
            var anyQuote = _concatAny(2,(any_arr){any_str("\""),any_str("'")});

            //do while PMREX.findRanges(text,p,anyQuote) into p  < text.length
            while(_anyToNumber((p=PMREX_findRanges(undefined,3,(any_arr){text, p, anyQuote}))) < _length(text)){

                //if text.slice(p,p+3) is '"""' //ignore triple quotes (valid token)
                if (__is(METHOD(slice_,text)(text,2,(any_arr){p, any_number(_anyToNumber(p) + 3)}),any_str("\"\"\"")))  { //ignore triple quotes (valid token)
                    //p+=3
                    p.value.number += 3;
                }
                //else
                
                else {
                    //var quoteNext = PMREX.whileUnescaped(text,p+1,text.charAt(p))
                    var quoteNext = PMREX_whileUnescaped(undefined,3,(any_arr){text, any_number(_anyToNumber(p) + 1), METHOD(charAt_,text)(text,1,(any_arr){p})});
                    //if quoteNext<0, break //unmatched quote 
                    if (_anyToNumber(quoteNext) < 0) {break;};

                    //text = "#{text.slice(0,p)}#{rep}#{text.slice(quoteNext)}"
                    text = _concatAny(3,(any_arr){METHOD(slice_,text)(text,2,(any_arr){any_number(0), p}), rep, METHOD(slice_,text)(text,1,(any_arr){quoteNext})});
                    //p+=rep.length
                    p.value.number += _length(rep);
                };
            };// end loop

            //return text
            return text;
        return undefined;
        }
    
    //------------------
    void Strings__namespaceInit(void){
    };
    //shim import PMREX
//### Append to class String
        //shim method startsWith(text:string)
        any String_startsWith(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            // define named params
            var text= argc? arguments[0] : undefined;
            //---------
            //return this.slice(0, text.length) is text 
            return any_number(__is(METHOD(slice_,this)(this,2,(any_arr){any_number(0), any_number(_length(text))}),text));
        return undefined;
        }
        //shim method endsWith(text:string)
        any String_endsWith(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            // define named params
            var text= argc? arguments[0] : undefined;
            //---------
            //return this.slice(-text.length) is text 
            return any_number(__is(METHOD(slice_,this)(this,1,(any_arr){any_number(-_length(text))}),text));
        return undefined;
        }
        //shim method trimRight()
        any String_trimRight(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            //if no this.length into var inx, return this //empty str
            var inx=undefined;
            if (!(_anyToBool((inx=any_number(_length(this)))))) {return this;};
            //do
            do{
                //inx-- 
                inx.value.number--;
            } while (_anyToNumber(inx) >= 0 && __is(METHOD(charAt_,this)(this,1,(any_arr){inx}),any_str(" ")));// end loop
            //return this.slice(0,inx+1) 
            return METHOD(slice_,this)(this,2,(any_arr){any_number(0), any_number(_anyToNumber(inx) + 1)});
        return undefined;
        }
        //shim method trimLeft()
        any String_trimLeft(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            //if no this.length into var len, return this
            var len=undefined;
            if (!(_anyToBool((len=any_number(_length(this)))))) {return this;};
            //var inx=0
            var inx = any_number(0);
            //while inx<len and this.charAt(inx) is ' '
            while(_anyToNumber(inx) < _anyToNumber(len) && __is(METHOD(charAt_,this)(this,1,(any_arr){inx}),any_str(" "))){
                //inx++
                inx.value.number++;
            };// end loop
            //return this.slice(inx) 
            return METHOD(slice_,this)(this,1,(any_arr){inx});
        return undefined;
        }
        //method capitalized returns string
        any String_capitalized(DEFAULT_ARGUMENTS){
           assert(_instanceof(this,String));
           //---------
           //if this, return "#{this.charAt(0).toUpperCase()}#{this.slice(1)}"
           if (_anyToBool(this)) {return _concatAny(2,(any_arr){__call(toUpperCase_,METHOD(charAt_,this)(this,1,(any_arr){any_number(0)}),0,NULL), METHOD(slice_,this)(this,1,(any_arr){any_number(1)})});};
        return undefined;
        }
        //shim method replaceAll(searched,newStr)
        ;
        //shim method countSpaces()
        any String_countSpaces(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            //var inx=0
            var inx = any_number(0);
            //while inx<this.length-1
            while(_anyToNumber(inx) < _length(this) - 1){
                //if this.charAt(inx) isnt ' ', break
                if (!__is(METHOD(charAt_,this)(this,1,(any_arr){inx}),any_str(" "))) {break;};
                //inx++
                inx.value.number++;
            };// end loop
            //return inx
            return inx;
        return undefined;
        }
        //method quoted(quoteChar)
        any String_quoted(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            // define named params
            var quoteChar= argc? arguments[0] : undefined;
            //---------
            //return '#{quoteChar}#{this}#{quoteChar}'
            return _concatAny(3,(any_arr){quoteChar, this, quoteChar});
        return undefined;
        }
        //shim method rpad(howMany)
        any String_rpad(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            // define named params
            var howMany= argc? arguments[0] : undefined;
            //---------
            //return .concat(Strings.spaces(howMany-.length))
            return METHOD(concat_,this)(this,1,(any_arr){Strings_spaces(undefined,1,(any_arr){any_number(_anyToNumber(howMany) - _length(this))})});
        return undefined;
        }
//### Append to class Array
        //method remove(element)  [not enumerable, not writable, configurable]
        any Array_remove(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,Array));
            //---------
            // define named params
            var element= argc? arguments[0] : undefined;
            //---------
            //if this.indexOf(element) into var inx >= 0
            var inx=undefined;
            if (_anyToNumber((inx=METHOD(indexOf_,this)(this,1,(any_arr){element}))) >= 0)  {
                 //return this.splice(inx,1)
                 return METHOD(splice_,this)(this,2,(any_arr){inx, any_number(1)});
            };
        return undefined;
        }
        //end method
        


//-------------------------
void Strings__moduleInit(void){
        Strings__namespaceInit();
};