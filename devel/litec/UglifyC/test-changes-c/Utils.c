#include "Utils.h"
//-------------------------
//Module Utils
//-------------------------
//-------------------------
//NAMESPACE Utils
//-------------------------
any Utils_characters(DEFAULT_ARGUMENTS); //forward declare
any Utils_member(DEFAULT_ARGUMENTS); //forward declare
any Utils_find_if(DEFAULT_ARGUMENTS); //forward declare
any Utils_repeat_string(DEFAULT_ARGUMENTS); //forward declare
any Utils_push_uniq(DEFAULT_ARGUMENTS); //forward declare
any Utils_remove(DEFAULT_ARGUMENTS); //forward declare
any Utils_makePredicate(DEFAULT_ARGUMENTS); //forward declare
any Utils_isPredicate(DEFAULT_ARGUMENTS); //forward declare
any Utils_all(DEFAULT_ARGUMENTS); //forward declare
//Lucio Tato - 2014
//Litescript translation of:

    ///***********************************************************************

      //A JavaScript tokenizer / parser / beautifier / compressor.
      //https://github.com/mishoo/UglifyJS2

      //-------------------------------- (C) ---------------------------------

                               //Author: Mihai Bazon
                             //<mihai.bazon@gmail.com>
                           //http://mihai.bazon.net/blog

      //Distributed under the BSD license:

        //Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>

        //Redistribution and use in source and binary forms, with or without
        //modification, are permitted provided that the following conditions
        //are met:

            //* Redistributions of source code must retain the above
              //copyright notice, this list of conditions and the following
              //disclaimer.

            //* Redistributions in binary form must reproduce the above
              //copyright notice, this list of conditions and the following
              //disclaimer in the documentation and/or other materials
              //provided with the distribution.

        //THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
        //EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
        //IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
        //PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
        //LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
        //OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
        //PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
        //PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
        //THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
        //TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
        //THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
        //SUCH DAMAGE.

     //***********************************************************************/

    ///*function array_to_hash(a) 
        //var ret = Object.create(null);
        //for (var i = 0; i < a.length; ++i)
            //ret[a[i]] = true;
        //return ret;
    //*/

    //function slice(a, start) {
    //    return Array.prototype.slice.call(a, start || 0);
    //};

    //public function characters(str:string) 
    any Utils_characters(DEFAULT_ARGUMENTS){
        // define named params
        var str= argc? arguments[0] : undefined;
        //---------
        //return str.split("")
        return METHOD(split_,str)(str,1,(any_arr){any_EMPTY_STR
       });
    return undefined;
    }


    //public function member(name, array) 
    any Utils_member(DEFAULT_ARGUMENTS){
        // define named params
        var name, array;
        name=array=undefined;
        switch(argc){
          case 2:array=arguments[1];
          case 1:name=arguments[0];
        }
        //---------
        //for each item in array
        {
        var iter=_newIterPos(); int __inx=0;
        for(int __inx=0; ITER_NEXT(array,iter); __inx++ ){
          var item=PROP(value_,iter), item__name=PROP(key_,iter), item__inx=any_number(__inx);
        
            //if item is name, return true
            if (__is(item,name)) {return true;};
        }};// end for each loop
        //return false;
        return false;
    return undefined;
    }

    //public function find_if(func:function, array) 
    any Utils_find_if(DEFAULT_ARGUMENTS){
        // define named params
        var func, array;
        func=array=undefined;
        switch(argc){
          case 2:array=arguments[1];
          case 1:func=arguments[0];
        }
        //---------
        //for each item in array
        {
        var iter=_newIterPos(); int __inx=0;
        for(int __inx=0; ITER_NEXT(array,iter); __inx++ ){
          var item=PROP(value_,iter), item__name=PROP(key_,iter), item__inx=any_number(__inx);
        
            //if func.call(undefined,item), return item
            if (_anyToBool(__apply(func,undefined,1,(any_arr){item
           }))) {return item;};
        }};// end for each loop
        
    return undefined;
    }


    //public function repeat_string(str:string, i) 
    any Utils_repeat_string(DEFAULT_ARGUMENTS){
        // define named params
        var str, i;
        str=i=undefined;
        switch(argc){
          case 2:i=arguments[1];
          case 1:str=arguments[0];
        }
        //---------
        //return str.repeat(i)
        return METHOD(repeat_,str)(str,1,(any_arr){i
       });
    return undefined;
    }

    ///*
    //function DefaultsError(msg, defs) {
        //Error.call(this, msg);
        //this.msg = msg;
        //this.defs = defs;
    //};
    //DefaultsError.prototype = Object.create(Error.prototype);
    //DefaultsError.prototype.constructor = DefaultsError;

    //DefaultsError.croak = function(msg, defs) {
        //throw new DefaultsError(msg, defs);
    //};
    //*/

    ///*
    //function defaults(args, defs, croak) {
        //if (args === true)
            //args = {};
        //var ret = args || {};
        //if (croak) for (var i in ret) if (ret.hasOwnProperty(i) && !defs.hasOwnProperty(i))
            //DefaultsError.croak("`" + i + "` is not a supported option", defs);
        //for (var i in defs) if (defs.hasOwnProperty(i)) {
            //ret[i] = (args && args.hasOwnProperty(i)) ? args[i] : defs[i];
        //}
        //return ret;
    //};
    //*/

    ///*
    //function merge(obj, ext) {
        //for (var i in ext) if (ext.hasOwnProperty(i)) {
            //obj[i] = ext[i];
        //}
        //return obj;
    //};
    //*/

    //function noop() {};

    ///*
    //var MAP = (function(){
        //function MAP(a, f, backwards) {
            //var ret = [], top = [], i;
            //function doit() {
                //var val = f(a[i], i);
                //var is_last = val instanceof Last;
                //if (is_last) val = val.v;
                //if (val instanceof AtTop) {
                    //val = val.v;
                    //if (val instanceof Splice) {
                        //top.push.apply(top, backwards ? val.v.slice().reverse() : val.v);
                    //} else {
                        //top.push(val);
                    //}
                //}
                //else if (val !== skip) {
                    //if (val instanceof Splice) {
                        //ret.push.apply(ret, backwards ? val.v.slice().reverse() : val.v);
                    //} else {
                        //ret.push(val);
                    //}
                //}
                //return is_last;
            //};
            //if (a instanceof Array) {
                //if (backwards) {
                    //for (i = a.length; --i >= 0;) if (doit()) break;
                    //ret.reverse();
                    //top.reverse();
                //} else {
                    //for (i = 0; i < a.length; ++i) if (doit()) break;
                //}
            //}
            //else {
                //for (i in a) if (a.hasOwnProperty(i)) if (doit()) break;
            //}
            //return top.concat(ret);
        //};
        //MAP.at_top = function(val) { return new AtTop(val) };
        //MAP.splice = function(val) { return new Splice(val) };
        //MAP.last = function(val) { return new Last(val) };
        //var skip = MAP.skip = {};
        //function AtTop(val) { this.v = val };
        //function Splice(val) { this.v = val };
        //function Last(val) { this.v = val };
        //return MAP;
    //})();
    //*/

    //public function push_uniq(array, el) 
    any Utils_push_uniq(DEFAULT_ARGUMENTS){
        // define named params
        var array, el;
        array=el=undefined;
        switch(argc){
          case 2:el=arguments[1];
          case 1:array=arguments[0];
        }
        //---------
        //if array.indexOf(el) < 0, array.push el
        if (_anyToNumber(METHOD(indexOf_,array)(array,1,(any_arr){el
       })) < 0) {METHOD(push_,array)(array,1,(any_arr){el
      });};
    return undefined;
    }


    ///* LMT: replaced by string interpolation

    //function string_template(text, props) {
        //return text.replace(/\{(.+?)\}/g, function(str, p){
            //return props[p];
        //});
    //};
    //*/

    //public function remove(array, el) 
    any Utils_remove(DEFAULT_ARGUMENTS){
        // define named params
        var array, el;
        array=el=undefined;
        switch(argc){
          case 2:el=arguments[1];
          case 1:array=arguments[0];
        }
        //---------
        //for each i,item in array
        {
        var iter=_newIterPos(); int __inx=0;
        for(int __inx=0; ITER_NEXT(array,iter); __inx++ ){
          var item=PROP(value_,iter), i=PROP(key_,iter), item__inx=any_number(__inx);
        
            //if item is el 
            if (__is(item,el))  {
                //array.splice i, 1
                METHOD(splice_,array)(array,2,(any_arr){i
                   , any_number(1)
               });
                //return
                return undefined;
            };
        }};// end for each loop
        
    return undefined;
    }

    ///*
    //function mergeSort(array, cmp) {
        //if (array.length < 2) return array.slice();
        //function merge(a, b) {
            //var r = [], ai = 0, bi = 0, i = 0;
            //while (ai < a.length && bi < b.length) {
                //cmp(a[ai], b[bi]) <= 0
                    //? r[i++] = a[ai++]
                    //: r[i++] = b[bi++];
            //}
            //if (ai < a.length) r.push.apply(r, a.slice(ai));
            //if (bi < b.length) r.push.apply(r, b.slice(bi));
            //return r;
        //};
        //function _ms(a) {
            //if (a.length <= 1)
                //return a;
            //var m = Math.floor(a.length / 2), left = a.slice(0, m), right = a.slice(m);
            //left = _ms(left);
            //right = _ms(right);
            //return merge(left, right);
        //};
        //return _ms(array);
    //};
    //*/

    ///*
    //function set_difference(a, b) {
        //return a.filter(function(el){
            //return b.indexOf(el) < 0;
        //});
    //};

    //function set_intersection(a, b) {
        //return a.filter(function(el){
            //return b.indexOf(el) >= 0;
        //});
    //};
    //*/

//### public function makePredicate(text:string) 
    any Utils_makePredicate(DEFAULT_ARGUMENTS){
        // define named params
        var text= argc? arguments[0] : undefined;
        //---------

    // this function is taken from Acorn [1], written by Marijn Haverbeke
    // [1] https://github.com/marijnh/acorn

//LMT: the function makePredicate(words) generates js code (a switch statement) to recognize the
//word. Later instantiates the code in a function and returns the function.
//Since we cannot create and compile c code while in c, let's return
//an optimized array to fulfill a similar function.

//Note: just return a coded string: e.g.: "|for|while|do|"

        //var words:array
        var words = undefined
       ;

        //if text is instance of Array
        if (_instanceof(text,Array))  {
            //words=text
            words = text;
        }
        //else
        
        else {
            //words = text.split(" ")
            words = METHOD(split_,text)(text,1,(any_arr){any_LTR(" ")
           });
        };

        //return "|#{words.join('|')}|"
        return _concatAny(3,any_LTR("|")
           , (METHOD(join_,words)(words,1,(any_arr){any_LTR("|")
          }))
           , any_LTR("|")
       );
    return undefined;
    }


    //public function isPredicate(pred,word) returns boolean
    any Utils_isPredicate(DEFAULT_ARGUMENTS){
        // define named params
        var pred, word;
        pred=word=undefined;
        switch(argc){
          case 2:word=arguments[1];
          case 1:pred=arguments[0];
        }
        //---------
        //return "|#{word}|" in pred
        return any_number(CALL1(indexOf_,pred,_concatAny(3,any_LTR("|")
           , word
           , any_LTR("|")
       )).value.number>=0);
    return undefined;
    }


///*
        //var f = "", cats = []

//Seems to: split words into categories based on words length

//LMT: add catsLen to avoid costly utf-8 length calculation every time

        //var categorized:boolean // LMT: to avoid label

        //var catsLen=[]        

        //for each word in words

            //categorized=false

            //for each j,len in catsLen
                //if word.length is len 
                    //cats[j].push word
                    //categorized=true
                    //break

            //end loop

            //if categorized, break

            //cats.push [word] //first word in category
            //catsLen.push word.length

        //end loop

    //*/

//Original JS

    ///*
    //function makePredicate(words) {
        //if words isnt instance of Array, words = words.split(" ")
        //var f = "", cats = []

        //out: for (var i = 0; i < words.length; ++i) {
            //for (var j = 0; j < cats.length; ++j)
                //if (cats[j][0].length == words[i].length) {
                    //cats[j].push(words[i]);
                    //continue out;
                //}
            //cats.push([words[i]]);
        //}

//Seems to: split words into categories based on words length

//LMT: add catsLen to avoid costly utf-8 length calculation every time

        //var categorized:boolean // LMT: to avoid label

        //var catsLen=[]        

        //for each word in words

            //categorized=false

            //for each j,len in catsLen
                //if word.length is len 
                    //cats[j].push word
                    //categorized=true
                    //break

            //end loop

            //if categorized, break

            //cats.push [word] //first word in category
            //catsLen.push word.length

        //end loop


        //function compareTo(arr) {
            //if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
            //f += "switch(str){";
            //for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
            //f += "return true}return false;";
        //}
        // When there are more than three length categories, an outer
        // switch first dispatches on the lengths, to save on comparisons.
        //if (cats.length > 3) {
            //cats.sort(function(a, b) {return b.length - a.length;});
            //f += "switch(str.length){";
            //for (var i = 0; i < cats.length; ++i) {
                //var cat = cats[i];
                //f += "case " + cat[0].length + ":";
                //compareTo(cat);
            //}
            //f += "}";
            // Otherwise, simply generate a flat `switch` statement.
        //} else {
            //compareTo(words);
        //}
        //return new Function("str", f);
    //};
    //*/

    //public function all(array, predicate) 
    any Utils_all(DEFAULT_ARGUMENTS){
        // define named params
        var array, predicate;
        array=predicate=undefined;
        switch(argc){
          case 2:predicate=arguments[1];
          case 1:array=arguments[0];
        }
        //---------
        //for each item in array
        {
        var iter=_newIterPos(); int __inx=0;
        for(int __inx=0; ITER_NEXT(array,iter); __inx++ ){
          var item=PROP(value_,iter), item__name=PROP(key_,iter), item__inx=any_number(__inx);
        
            //if item not in predicate 
            if (CALL1(indexOf_,predicate,item).value.number==-1)  {
                //return false
                return false;
            };
        }};// end for each loop
        //return true
        return true;
    return undefined;
    }


///* replaced by Map

    //function Dictionary() {
        //this._values = Object.create(null);
        //this._size = 0;
    //};
    //Dictionary.prototype = {
        //set: function(key, val) {
            //if (!this.has(key)) ++this._size;
            //this._values["$" + key] = val;
            //return this;
        //},
        //add: function(key, val) {
            //if (this.has(key)) {
                //this.get(key).push(val);
            //} else {
                //this.set(key, [ val ]);
            //}
            //return this;
        //},
        //get: function(key) { return this._values["$" + key] },
        //del: function(key) {
            //if (this.has(key)) {
                //--this._size;
                //delete this._values["$" + key];
            //}
            //return this;
        //},
        //has: function(key) { return ("$" + key) in this._values },
        //each: function(f) {
            //for (var i in this._values)
                //f(this._values[i], i.substr(1));
        //},
        //size: function() {
            //return this._size;
        //},
        //map: function(f) {
            //var ret = [];
            //for (var i in this._values)
                //ret.push(f(this._values[i], i.substr(1)));
            //return ret;
        //}
    //};
//*/


//### Append to class String
    

//.replaceAll, equiv. to .replace(/./g, newStr)

        //shim method replaceAll(searched,newStr)
        ;
//------------------
void Utils__namespaceInit(void){
};


//-------------------------
void Utils__moduleInit(void){
    Utils__namespaceInit();
};
