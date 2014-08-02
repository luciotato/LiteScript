#include "shims.h"
//-------------------------
//Module shims
//-------------------------
#include "shims.c.extra"
//-------------------------
//NAMESPACE shims
//-------------------------
//# shims - appends to core namespaces

//Helper methods to class String. 
//Also add 'remove' & 'clear' to class Array

//Dependencies:

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
            return any_number(__is(METHOD(slice_,this)(this,2,(any_arr){any_number(0)
            , any_number(_length(text))
            }),text));
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
            return any_number(__is(METHOD(slice_,this)(this,1,(any_arr){any_number(-_length(text))
            }),text));
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
            } while (_anyToNumber(inx) >= 0 && __is(METHOD(charAt_,this)(this,1,(any_arr){inx
            }),any_LTR(" ")));// end loop
            //loop while inx>=0 and this.charAt(inx) is ' '
            //return this.slice(0,inx+1) 
            return METHOD(slice_,this)(this,2,(any_arr){any_number(0)
            , any_number(_anyToNumber(inx) + 1)
            });
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
            var inx = any_number(0)
            ;
            //while inx<len and this.charAt(inx) is ' '
            while(_anyToNumber(inx) < _anyToNumber(len) && __is(METHOD(charAt_,this)(this,1,(any_arr){inx
            }),any_LTR(" "))){
                //inx++
                inx.value.number++;
            };// end loop
            //return this.slice(inx) 
            return METHOD(slice_,this)(this,1,(any_arr){inx
            });
        return undefined;
        }

//.capitalized

        //method capitalized returns string
        any String_capitalized(DEFAULT_ARGUMENTS){
           assert(_instanceof(this,String));
           //---------
           //if this, return "#{this.charAt(0).toUpperCase()}#{this.slice(1)}"
           if (_anyToBool(this)) {return _concatAny(2,(__call(toUpperCase_,METHOD(charAt_,this)(this,1,(any_arr){any_number(0)
           }),0,NULL))
           , (METHOD(slice_,this)(this,1,(any_arr){any_number(1)
           }))
           );};
        return undefined;
        }

//.replaceAll, equiv. to .replace(/./g, newStr)

        //shim method replaceAll(searched,newStr)
        ;
           //return this.replace(new RegExp(searched,"g"), newStr)

//.countSpaces()

        //shim method countSpaces()
        ;
            //var inx=0
            //while inx<this.length-1
                //if this.charAt(inx) isnt ' ', break
                //inx++

            //return inx

//.quoted(quotechar)

        //method quoted(quoteChar)
        any String_quoted(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            // define named params
            var quoteChar= argc? arguments[0] : undefined;
            //---------
            //return '#{quoteChar}#{this}#{quoteChar}'
            return _concatAny(3,quoteChar
            , this
            , quoteChar
            );
        return undefined;
        }

        //shim method rpad(howMany)
        any String_rpad(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            // define named params
            var howMany= argc? arguments[0] : undefined;
            //---------
            //return .concat(String.spaces(howMany-.length))
            return METHOD(concat_,this)(this,1,(any_arr){String_spaces(undefined,1,(any_arr){any_number(_anyToNumber(howMany) - _length(this))
            })
            });
        return undefined;
        }

//repeat(howMany)

        //shim method repeat(howMany)
        any String_repeat(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,String));
            //---------
            // define named params
            var howMany= argc? arguments[0] : undefined;
            //---------
            //if howMany<=0, return ''
            if (_anyToNumber(howMany) <= 0) {return any_EMPTY_STR;};

            //var a=''
            var a = any_EMPTY_STR
            ;
            //while howMany--
            while(howMany.value.number--){
                //a &= this
                a=_concatAny(2,a,this);
            };// end loop

            //return a
            return a;
        return undefined;
        }

//### append to namespace String
    

        //shim method spaces(howMany)
        ;
            //return " ".repeat(howMany)

//Checks if a name is Capitalized, unicode aware.
//capitalized is like: /^[A-Z]+[$_a-z0-9]+$/ ,but unicode aware.

        //method isCapitalized(text:string) returns boolean 
        any String_isCapitalized(DEFAULT_ARGUMENTS){
            
            // define named params
            var text= argc? arguments[0] : undefined;
            //---------
            //if text and text.charAt(0) is text.charAt(0).toUpperCase() 
            if (_anyToBool(text) && __is(METHOD(charAt_,text)(text,1,(any_arr){any_number(0)
            }),__call(toUpperCase_,METHOD(charAt_,text)(text,1,(any_arr){any_number(0)
            }),0,NULL)))  {
                //if text.length is 1, return true;
                if (__is(any_number(_length(text)),any_number(1))) {return true;};

                //for n=1 while n<text.length
                for(int64_t n=1; n < _length(text); n++){
                    //if text.charAt(n) is text.charAt(n).toLowerCase(), return true
                    if (__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(n)
                    }),__call(toLowerCase_,METHOD(charAt_,text)(text,1,(any_arr){any_number(n)
                    }),0,NULL))) {return true;};
                };// end for n
                
            };

            //return false
            return false;
        return undefined;
        }

//String.findMatchingPair(text,start,closer).
//Note: text[start] MUST be the opener char

        //method findMatchingPair(text:string, start, closer)
        any String_findMatchingPair(DEFAULT_ARGUMENTS){
            
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
            var opener = METHOD(charAt_,text)(text,1,(any_arr){start
            })
            ;
            //var opencount=1;
            var opencount = any_number(1)
            ;
            //for n=start+1 while n<text.length
            for(int64_t n=_anyToNumber(start) + 1; n < _length(text); n++){
                //if text.charAt(n) is closer and --opencount is 0 
                if (__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(n)
                }),closer) && __is(any_number(--opencount.value.number),any_number(0)))  {
                    //return n
                    return any_number(n);
                }
                //else if text.charAt(n) is opener 
                
                else if (__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(n)
                }),opener))  {
                    //opencount++
                    opencount.value.number++;
                };
            };// end for n

            //return -1
            return any_number(-1);
        return undefined;
        }

//String.replaceQuoted(text,rep)
//replace every quoted string inside text, by rep

        //method replaceQuoted(text:string, rep:string)
        any String_replaceQuoted(DEFAULT_ARGUMENTS){
            
            // define named params
            var text, rep;
            text=rep=undefined;
            switch(argc){
              case 2:rep=arguments[1];
              case 1:text=arguments[0];
            }
            //---------

            //var p = 0
            var p = any_number(0)
            ;

//look for first quote (single or double?),
//loop until no quotes found 

            //var anyQuote = '"' & "'"
            var anyQuote = _concatAny(2,any_LTR("\""),any_LTR("'"))
            ;

            //var resultText=""
            var resultText = any_EMPTY_STR
            ;

            //do 
            do{
                //var preQuotes=PMREX.untilRanges(text,anyQuote) 
                var preQuotes = PMREX_untilRanges(undefined,2,(any_arr){text
                , anyQuote
                })
                ;

                //resultText &= preQuotes
                resultText=_concatAny(2,resultText,preQuotes);
                //text = text.slice(preQuotes.length)
                text = METHOD(slice_,text)(text,1,(any_arr){any_number(_length(preQuotes))
                });
                //if no text, break // all text processed|no quotes found
                if (!_anyToBool(text)) {break;};

                //if text.slice(0,3) is '"""' //ignore triple quotes (valid token)
                if (__is(METHOD(slice_,text)(text,2,(any_arr){any_number(0)
                , any_number(3)
                }),any_LTR("\"\"\"")))  { //ignore triple quotes (valid token)
                    //resultText &= text.slice(0,3)
                    resultText=_concatAny(2,resultText,METHOD(slice_,text)(text,2,(any_arr){any_number(0)
                    , any_number(3)
                    }));
                    //text = text.slice(3)
                    text = METHOD(slice_,text)(text,1,(any_arr){any_number(3)
                    });
                }
                //else
                
                else {

                    //var quotedContent
                    var quotedContent = undefined
                    ;

                    //try // accept malformed quoted chunks (do not replace)
                    try{

                         //quotedContent = PMREX.quotedContent(text)
                         quotedContent = PMREX_quotedContent(undefined,1,(any_arr){text
                         });
                         //text = text.slice(1+quotedContent.length+1)
                         text = METHOD(slice_,text)(text,1,(any_arr){any_number(1 + _length(quotedContent) + 1)
                         });
                    
                    }catch(err){

                    //catch err // if malformed - closing quote not found
                        //resultText &= text.slice(0,1) //keep quote
                        resultText=_concatAny(2,resultText,METHOD(slice_,text)(text,2,(any_arr){any_number(0)
                        , any_number(1)
                        })); //keep quote
                        //text = text.slice(1) //only remove quote
                        text = METHOD(slice_,text)(text,1,(any_arr){any_number(1)
                        }); //only remove quote
                    };
                };
            } while (!!_anyToBool(text));// end loop

            //loop until no text

            //return resultText
            return resultText;
        return undefined;
        }


//### Append to class Array
    

//method .remove(element)

        //shim method remove(element)  [not enumerable]
        any Array_remove(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,Array));
            //---------
            // define named params
            var element= argc? arguments[0] : undefined;
            //---------

            //if this.indexOf(element) into var inx >= 0
            var inx=undefined;
            if (_anyToNumber((inx=METHOD(indexOf_,this)(this,1,(any_arr){element
            }))) >= 0)  {
                 //return this.splice(inx,1)
                 return METHOD(splice_,this)(this,2,(any_arr){inx
                 , any_number(1)
                 });
            };
        return undefined;
        }


        //shim method clear       [not enumerable]
        ;
//------------------
void shims__namespaceInit(void){
};


//-------------------------
void shims__moduleInit(void){
    shims__namespaceInit();
};
