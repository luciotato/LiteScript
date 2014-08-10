#include "Parser.h"
//-------------------------
//Module Parser
//-------------------------
//-------------------------
//NAMESPACE Parser
//-------------------------
var Parser_KEYWORDS_s;
var Parser_KEYWORDS_ATOM_s;
var Parser_RESERVED_WORDS_s;
var Parser_KEYWORDS_BEFORE_EXPRESSION_s;
var Parser_KEYWORDS;
var Parser_RESERVED_WORDS;
var Parser_KEYWORDS_BEFORE_EXPRESSION;
var Parser_KEYWORDS_ATOM;
var Parser_OPERATOR_CHARS;
var Parser_OPERATORS;
var Parser_WHITESPACE_CHARS;
var Parser_PUNC_BEFORE_EXPRESSION;
var Parser_PUNC_CHARS;
var Parser_REGEXP_MODIFIERS;
var Parser_FOUR_ZEROES;
any Parser_is_letter(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_digit(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_alphanumeric_char(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_unicode_combining_mark(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_unicode_connector_punctuation(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_identifier(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_identifier_start(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_identifier_char(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_identifier_string(DEFAULT_ARGUMENTS); //forward declare
any Parser_parse_js_number(DEFAULT_ARGUMENTS); //forward declare
    //-----------------------
    // Class Parser_JS_Parse_Error: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_JS_Parse_Error_METHODS = {
      { toString_, Parser_JS_Parse_Error_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t Parser_JS_Parse_Error_PROPS[] = {
    line_
    , col_
    , pos_
    };
    
any Parser_js_error(DEFAULT_ARGUMENTS); //forward declare
any Parser_is_token(DEFAULT_ARGUMENTS); //forward declare
var Parser_EX_EOF;
var Parser_UNARY_PREFIX;
var Parser_UNARY_POSTFIX;
var Parser_ASSIGNMENT;
var Parser_PRECEDENCE;
var Parser_ATOMIC_START_TOKEN;
    //-----------------------
    // Class Parser_PRSOptions: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_PRSOptions_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t Parser_PRSOptions_PROPS[] = {
    strict_
    , filename_
    , toplevel_
    , expression_
    , html5_comments_
    };
    
        //-------------------------
        //NAMESPACE Parser_UNICODE
        //-------------------------
        var Parser_UNICODE_letter, Parser_UNICODE_non_spacing_mark, Parser_UNICODE_space_combining_mark, Parser_UNICODE_connector_punctuation;
        
        
        //------------------
        void Parser_UNICODE__namespaceInit(void){
            Parser_UNICODE_letter = any_LTR("A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0621-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971\u0972\u097B-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3D\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC\u0EDD\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8B\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10D0-\u10FA\u10FC\u1100-\u1159\u115F-\u11A2\u11A8-\u11F9\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u1676\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19A9\u19C1-\u19C7\u1A00-\u1A16\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u2094\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C6F\u2C71-\u2C7D\u2C80-\u2CE4\u2D00-\u2D25\u2D30-\u2D65\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31B7\u31F0-\u31FF\u3400\u4DB5\u4E00\u9FC3\uA000-\uA48C\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA65F\uA662-\uA66E\uA67F-\uA697\uA717-\uA71F\uA722-\uA788\uA78B\uA78C\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA90A-\uA925\uA930-\uA946\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAC00\uD7A3\uF900-\uFA2D\uFA30-\uFA6A\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC");
            Parser_UNICODE_non_spacing_mark = any_LTR("\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065E\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0900-\u0902\u093C\u0941-\u0948\u094D\u0951-\u0955\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1DC0-\u1DE6\u1DFD-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F\uA67C\uA67D\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26");
            Parser_UNICODE_space_combining_mark = any_LTR("\u0903\u093E-\u0940\u0949-\u094C\u094E\u0982\u0983\u09BE-\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062-\u1064\u1067-\u106D\u1083\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7\u17C8\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u19B0-\u19C0\u19C8\u19C9\u1A19-\u1A1B\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1C24-\u1C2B\u1C34\u1C35\u1CE1\u1CF2\uA823\uA824\uA827\uA880\uA881\uA8B4-\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD-\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC");
            Parser_UNICODE_connector_punctuation = any_LTR("_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F");
        };
    

//--------------
    // Parser_JS_Parse_Error
    any Parser_JS_Parse_Error; //Class Parser_JS_Parse_Error extends Error
    
    
    //auto Parser_JS_Parse_Error_newFromObject
    inline any Parser_JS_Parse_Error_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(Parser_JS_Parse_Error,argc,arguments);
    }

    //import Utils, AST

    //shim import PMREX, LiteCore //, Iterable


//Lucio Tato - 2014
//Litescript translation of:

///*
  //A JavaScript tokenizer / parser / beautifier / compressor.
  //https://github.com/mishoo/UglifyJS2

  //-------------------------------- (C) ---------------------------------

                           //Author: Mihai Bazon
                         //<mihai.bazon@gmail.com>
                       //http://mihai.bazon.net/blog

  //Distributed under the BSD license:

    //Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>
    //Parser based on parse-js (http://marijn.haverbeke.nl/parse-js/).

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

    //var KEYWORDS_s = 'break case catch const continue debugger default delete do else finally for function if in instanceof new return switch throw try typeof var void while with';
    //var KEYWORDS_ATOM_s = 'false null true'
    //var RESERVED_WORDS_s = 'abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized this throws transient volatile yield'
    //RESERVED_WORDS_s = "#{RESERVED_WORDS_s} #{KEYWORDS_ATOM} #{KEYWORDS}"

    //var KEYWORDS_BEFORE_EXPRESSION_s = 'return new delete throw else case'

    //var KEYWORDS = Utils.makePredicate(KEYWORDS_s);
    //var RESERVED_WORDS = Utils.makePredicate(RESERVED_WORDS_s);
    //var KEYWORDS_BEFORE_EXPRESSION = Utils.makePredicate(KEYWORDS_BEFORE_EXPRESSION_s);
    //var KEYWORDS_ATOM = Utils.makePredicate(KEYWORDS_ATOM_s);

    //var OPERATOR_CHARS = "+-*&%=<>!?|~^";

    //var RE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
    //var RE_OCT_NUMBER = /^0[0-7]+$/;
    //var RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i;

    //var OPERATORS = Utils.makePredicate([
        //"in",
        //"instanceof",
        //"typeof",
        //"new",
        //"void",
        //"delete",
        //"++",
        //"--",
        //"+",
        //"-",
        //"!",
        //"~",
        //"&",
        //"|",
        //"^",
        //"*",
        //"/",
        //"%",
        //">>",
        //"<<",
        //">>>",
        //"<",
        //">",
        //"<=",
        //">=",
        //"==",
        //"===",
        //"!=",
        //"!==",
        //"?",
        //"=",
        //"+=",
        //"-=",
        //"/=",
        //"*=",
        //"%=",
        //">>=",
        //"<<=",
        //">>>=",
        //"|=",
        //"^=",
        //"&=",
        //"&&",
        //"||"
        //])

    //var WHITESPACE_CHARS = " \u00a0\n\r\t\f\x0b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000";

    //var PUNC_BEFORE_EXPRESSION = "[{(,.;:";

    //var PUNC_CHARS = "[]{}(),;:";

    //var REGEXP_MODIFIERS = "gmsiy";

    //var FOUR_ZEROES = "0000";

    ///* -----[ Tokenizer ]----- 
    //*/

    // regexps adapted from http://xregexp.com/plugins/#unicode
    //namespace UNICODE 
        //properties 
            //letter= "A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0621-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971\u0972\u097B-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3D\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC\u0EDD\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8B\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10D0-\u10FA\u10FC\u1100-\u1159\u115F-\u11A2\u11A8-\u11F9\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u1676\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19A9\u19C1-\u19C7\u1A00-\u1A16\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u2094\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C6F\u2C71-\u2C7D\u2C80-\u2CE4\u2D00-\u2D25\u2D30-\u2D65\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31B7\u31F0-\u31FF\u3400\u4DB5\u4E00\u9FC3\uA000-\uA48C\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA65F\uA662-\uA66E\uA67F-\uA697\uA717-\uA71F\uA722-\uA788\uA78B\uA78C\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA90A-\uA925\uA930-\uA946\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAC00\uD7A3\uF900-\uFA2D\uFA30-\uFA6A\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC"
            //non_spacing_mark= "\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065E\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0900-\u0902\u093C\u0941-\u0948\u094D\u0951-\u0955\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1DC0-\u1DE6\u1DFD-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F\uA67C\uA67D\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26"
            //space_combining_mark= "\u0903\u093E-\u0940\u0949-\u094C\u094E\u0982\u0983\u09BE-\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062-\u1064\u1067-\u106D\u1083\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7\u17C8\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u19B0-\u19C0\u19C8\u19C9\u1A19-\u1A1B\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1C24-\u1C2B\u1C34\u1C35\u1CE1\u1CF2\uA823\uA824\uA827\uA880\uA881\uA8B4-\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD-\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC"
            //connector_punctuation= "_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F"

    //function is_letter(code) //utf-8
        //return (code >= 97 and code <= 122)
            //or (code >= 65 and code <= 90)
            //or (code >= 0xaa and PMREX.whileRanges(code, UNICODE.letter) )

    //function is_digit(code) 
        //return code >= 48 and code <= 57; //XXX: find out if "UnicodeDigit" means something else than 0..9

    //function is_alphanumeric_char(code) 
        //return is_digit(code) or is_letter(code)

    //function is_unicode_combining_mark(ch) 
        //if PMREX.whileRanges(ch,UNICODE.non_spacing_mark), return true;
        //if PMREX.whileRanges(ch,UNICODE.space_combining_mark), return true;

    //function is_unicode_connector_punctuation(ch) 
        //return PMREX.whileRanges(ch,UNICODE.connector_punctuation) 


    //function is_identifier(name:string) 
        //if name.charAt(0)>='0' and name.charAt(0)<='9', return false //starts with a number 
        //var ident = PMREX.whileRanges(name,"A-Za-z0-9\x7F-\xFF$_")
        //if ident isnt name, return false //more than those chars
        //if Utils.isPredicate(RESERVED_WORDS,name), return false
        //return true

    //function is_identifier_start(code) 
        //return code is 36 or code is 95 or is_letter(code)

    //function is_identifier_char(ch:string) 

        //var code = ch.charCodeAt(0);

        //if is_identifier_start(code) or is_digit(code), return true;

        //if code < 0xAA, return false; //a symbol: not $, nor _

        //return code  is  8204 // \u200c: zero-width non-joiner <ZWNJ>
            //or code  is  8205 // \u200d: zero-width joiner <ZWJ> (in my ECMA-262 PDF, this is also 200c)
            //or is_unicode_combining_mark(ch)
            //or is_unicode_connector_punctuation(ch)


    //function is_identifier_string(str)
        //return PMREX.whileRanges(str,"A-Za-z0-9\x7F-\xFF$_") is str

    //function parse_js_number(num:string) 

        //if num.slice(0,2) is '0x' 
            //return parseInt(num.substr(2), 16)

        //if num.slice(0,1) is '0' and num.length is 4 
            //if PMREX.whileRanges(num,"0-7") is num // (RE_OCT_NUMBER.test(num)) 
                //return parseInt(num.substr(1), 8)

        //return parseFloat(num);


    //class JS_Parse_Error extends Error

        //properties
            //line,col,pos
        ;

        //constructor new JS_Parse_Error(message, line, col, pos) 
        void Parser_JS_Parse_Error__init(DEFAULT_ARGUMENTS){
          // auto call super class __init
          Error__init(this,argc,arguments);
            
            // define named params
            var message, line, col, pos;
            message=line=col=pos=undefined;
            switch(argc){
              case 4:pos=arguments[3];
              case 3:col=arguments[2];
              case 2:line=arguments[1];
              case 1:message=arguments[0];
            }
            //---------
            //this.message = message;
            PROP(message_,this) = message;
            //this.line = line;
            PROP(line_,this) = line;
            //this.col = col;
            PROP(col_,this) = col;
            //this.pos = pos;
            PROP(pos_,this) = pos;
        }
            //this.stack = new Error().stack;


        //method toString
        any Parser_JS_Parse_Error_toString(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,Parser_JS_Parse_Error));
            //---------
            //return "#{this.message}  (line: #{this.line}, col: #{this.col}, pos: #{this.pos})" //\n\n" + this.stack;
            return _concatAny(8,PROP(message_,this)
               , any_LTR("  (line: ")
               , PROP(line_,this)
               , any_LTR(", col: ")
               , PROP(col_,this)
               , any_LTR(", pos: ")
               , PROP(pos_,this)
               , any_LTR(")")
           ); //\n\n" + this.stack;
        return undefined;
        }
        //-------------------------
        //NAMESPACE Parser_TKZ
        //-------------------------
        var Parser_TKZ_text, Parser_TKZ_filename, Parser_TKZ_textLen, Parser_TKZ_pos, Parser_TKZ_tokpos, Parser_TKZ_line, Parser_TKZ_tokline, Parser_TKZ_col, Parser_TKZ_tokcol, Parser_TKZ_newline_before, Parser_TKZ_regex_allowed, Parser_TKZ_comments_before, Parser_TKZ_html5_comments, Parser_TKZ_prev_was_dot;
        


    //function js_error(message, filename, line, col, pos) 
        //var err = new JS_Parse_Error(message, line, col, pos)
        //console.error err.toString()
        //throw err


    //function is_token(token, type, val) 
        //return token.type is type and (no val or token.value is val)

    //var EX_EOF = {};


    //public namespace TKZ 
        //properties 
            //text      :string
            //filename  :string
            //textLen   :number
            //pos             = 0,
            //tokpos          = 0,
            //line            = 1,
            //tokline         = 0,
            //col             = 0,
            //tokcol          = 0,
            //newline_before  = false,
            //regex_allowed   = false, //how to handle a slash
            //comments_before = []

            //html5_comments: boolean

            //prev_was_dot = false

            //chunk: string
            //moreChars: boolean


//tokenize returns a function next_token(forceRegexp:booleean) 
//returning the next token in the stream

        //method tokenize($TEXT:string, filename, html5_comments) returns function
        any Parser_TKZ_tokenize(DEFAULT_ARGUMENTS){
            
            // define named params
            var $TEXT, filename, html5_comments;
            $TEXT=filename=html5_comments=undefined;
            switch(argc){
              case 3:html5_comments=arguments[2];
              case 2:filename=arguments[1];
              case 1:$TEXT=arguments[0];
            }
            //---------

            //TKZ.text = $TEXT.replaceAll("\r\n", "\n").replaceAll("\uFEFF", '')
            Parser_TKZ_text = __call(replaceAll_,METHOD(replaceAll_,$TEXT)($TEXT,2,(any_arr){any_LTR("\r\n")
               , any_LTR("\n")
           }),2,(any_arr){any_LTR("\uFEFF")
              , any_EMPTY_STR
          });

            //TKZ.chunk = TKZ.text

            //TKZ.textLen = TKZ.text.length
            Parser_TKZ_textLen = any_number(_length(Parser_TKZ_text));
            //TKZ.filename = filename
            Parser_TKZ_filename = filename;
            //TKZ.html5_comments = html5_comments
            Parser_TKZ_html5_comments = html5_comments;

            //return TKZ.next_token // function next_token(forceRegexp:booleean) 
            return any_func(Parser_TKZ_next_token); // function next_token(forceRegexp:booleean)
        return undefined;
        }


        //method next(signal_eof, in_string) 
        any Parser_TKZ_next(DEFAULT_ARGUMENTS){
            
            // define named params
            var signal_eof, in_string;
            signal_eof=in_string=undefined;
            switch(argc){
              case 2:in_string=arguments[1];
              case 1:signal_eof=arguments[0];
            }
            //---------

            //var ch = TKZ.text.charAt(TKZ.pos++);
            var ch = __call(charAt_,Parser_TKZ_text,1,(any_arr){any_number(Parser_TKZ_pos.value.number++)
           })
           ;
            //if no ch and signal_eof 
            if (!_anyToBool(ch) && _anyToBool(signal_eof))  {
                    //throw EX_EOF
                    throw(Parser_EX_EOF);
            };

            //if ch is "\n"
            if (__is(ch,any_LTR("\n")))  {
                //TKZ.newline_before = TKZ.newline_before or not in_string
                var ___or12=undefined;
                Parser_TKZ_newline_before = (_anyToBool(___or12=Parser_TKZ_newline_before)? ___or12 : any_number(!(_anyToBool(in_string))));
                //++TKZ.line
                ++Parser_TKZ_line.value.number;
                //TKZ.col = 0
                Parser_TKZ_col = any_number(0);
            }
            //else
            
            else {
                //++TKZ.col
                ++Parser_TKZ_col.value.number;
            };

            //return ch
            return ch;
        return undefined;
        }

        //method peek() 
        any Parser_TKZ_peek(DEFAULT_ARGUMENTS){
            //return TKZ.text.charAt(TKZ.pos)
            return __call(charAt_,Parser_TKZ_text,1,(any_arr){Parser_TKZ_pos
           });
        return undefined;
        }

        //method forward(i) 
        any Parser_TKZ_forward(DEFAULT_ARGUMENTS){
            
            // define named params
            var i= argc? arguments[0] : undefined;
            //---------
            //while i-- > 0 
            while(i.value.number-- > 0){
                //TKZ.next()
                Parser_TKZ_next(undefined,0,NULL);
            };// end loop
            
        return undefined;
        }

        //method looking_at(str:string) 
        any Parser_TKZ_looking_at(DEFAULT_ARGUMENTS){
            
            // define named params
            var str= argc? arguments[0] : undefined;
            //---------
            //return TKZ.text.substr(TKZ.pos, str.length) is str
            return any_number(__is(__call(substr_,Parser_TKZ_text,2,(any_arr){Parser_TKZ_pos
               , any_number(_length(str))
           }),str));
        return undefined;
        }

        //method findByteIndex(what, signal_eof) 
        any Parser_TKZ_findByteIndex(DEFAULT_ARGUMENTS){
            
            // define named params
            var what, signal_eof;
            what=signal_eof=undefined;
            switch(argc){
              case 2:signal_eof=arguments[1];
              case 1:what=arguments[0];
            }
            //---------
            //var foundPos = TKZ.text.indexOf(what, TKZ.pos)
            var foundPos = __call(indexOf_,Parser_TKZ_text,2,(any_arr){what
               , Parser_TKZ_pos
           })
           ;
            //if (signal_eof and foundPos is -1), throw EX_EOF
            if ((_anyToBool(signal_eof) && __is(foundPos,any_number(-1)))) {throw(Parser_EX_EOF);};
            //return foundPos
            return foundPos;
        return undefined;
        }


        //method start_token() 
        any Parser_TKZ_start_token(DEFAULT_ARGUMENTS){
            //TKZ.tokline = TKZ.line;
            Parser_TKZ_tokline = Parser_TKZ_line;
            //TKZ.tokcol = TKZ.col;
            Parser_TKZ_tokcol = Parser_TKZ_col;
            //TKZ.tokpos = TKZ.pos; //"key" holds -codepoint- index of current position
            Parser_TKZ_tokpos = Parser_TKZ_pos; //"key" holds -codepoint- index of current position
        return undefined;
        }


        //method token(type, value, is_comment) 
        any Parser_TKZ_token(DEFAULT_ARGUMENTS){
            
            // define named params
            var type, value, is_comment;
            type=value=is_comment=undefined;
            switch(argc){
              case 3:is_comment=arguments[2];
              case 2:value=arguments[1];
              case 1:type=arguments[0];
            }
            //---------

//TKZ.regex_allowed is a semiglobal flag, to mark how to treat the *next* token if it is a /.
//if as a regexpLiteral or division oper

            //TKZ.regex_allowed = (type is "operator" and not Utils.isPredicate(UNARY_POSTFIX,value))  
                                var ___or14=undefined;
                                var ___or13=undefined;
            Parser_TKZ_regex_allowed = (_anyToBool(___or14=(_anyToBool(___or13=(any_number(__is(type,any_LTR("operator")) && !(_anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_UNARY_POSTFIX
               , value
           }))))))? ___or13 : (any_number(__is(type,any_LTR("keyword")) && _anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_KEYWORDS_BEFORE_EXPRESSION
              , value
          }))))))? ___or14 : (any_number(__is(type,any_LTR("punc")) && CALL1(indexOf_,Parser_PUNC_BEFORE_EXPRESSION,value).value.number>=0)));
                                //or (type is "keyword" and Utils.isPredicate(KEYWORDS_BEFORE_EXPRESSION,value))  
                                //or (type is "punc" and value in PUNC_BEFORE_EXPRESSION)

            //TKZ.prev_was_dot = (type  is  "punc" and value  is  ".")
            Parser_TKZ_prev_was_dot = (any_number(__is(type,any_LTR("punc")) && __is(value,any_LTR("."))));

            //var ret = 
                //type   : type,
                //value  : value,
                //line   : TKZ.tokline,
                //col    : TKZ.tokcol,
                //pos    : TKZ.tokpos,
                //endpos : TKZ.pos,
                //nlb    : TKZ.newline_before,
                //file   : TKZ.filename
                //comments_before: undefined
            var ret = new(Map,9,(any_arr){
                _newPair("type",type), 
                _newPair("value",value), 
                _newPair("line",Parser_TKZ_tokline), 
                _newPair("col",Parser_TKZ_tokcol), 
                _newPair("pos",Parser_TKZ_tokpos), 
                _newPair("endpos",Parser_TKZ_pos), 
                _newPair("nlb",Parser_TKZ_newline_before), 
                _newPair("file",Parser_TKZ_filename), 
                _newPair("comments_before",undefined)
                })
           ;

            //if (not is_comment) 
            if ((!(_anyToBool(is_comment))))  {

                //ret.comments_before = TKZ.comments_before
                PROP(comments_before_,ret) = Parser_TKZ_comments_before;

                // make note of any newlines in the comments that came before
                //for each comment:AST.Token in TKZ.comments_before
                {
                var iter=_newIterPos(); int __inx=0;
                for(int __inx=0; ITER_NEXT(Parser_TKZ_comments_before,iter); __inx++ ){
                  var comment=PROP(value_,iter), comment__name=PROP(key_,iter), comment__inx=any_number(__inx);
                
                    //if comment.nlb 
                    if (_anyToBool(PROP(nlb_,comment)))  {
                        //ret.nlb = true
                        PROP(nlb_,ret) = true;
                        //break
                        break;
                    };
                }};// end for each loop

                //TKZ.comments_before = [];
                Parser_TKZ_comments_before = new(Array,0,NULL);
            };

            //end if
            

            //TKZ.newline_before = false;
            Parser_TKZ_newline_before = false;

            //return new AST.Token(ret)
            return new(AST_Token,1,(any_arr){ret
           });
        return undefined;
        }


        //method skip_whitespace() 
        any Parser_TKZ_skip_whitespace(DEFAULT_ARGUMENTS){
            //var ch
            var ch = undefined
           ;
            //while TKZ.peek() into ch and ch in WHITESPACE_CHARS
            while(_anyToBool((ch=Parser_TKZ_peek(undefined,0,NULL))) && CALL1(indexOf_,Parser_WHITESPACE_CHARS,ch).value.number>=0){
                //TKZ.next
                Parser_TKZ_next(undefined,0,NULL);
            };// end loop
            
        return undefined;
        }

        ///*method read_while(pred) 
            //var ret = "", ch, i = 0
            //while (peek() into ch and pred(ch, i++))
                //ret &= next();
            //return ret;
        //};
        //*/

        //method parse_error(err) 
        any Parser_TKZ_parse_error(DEFAULT_ARGUMENTS){
            
            // define named params
            var err= argc? arguments[0] : undefined;
            //---------
            //js_error(err, TKZ.filename, TKZ.tokline, TKZ.tokcol, TKZ.tokpos);
            Parser_js_error(undefined,5,(any_arr){err
               , Parser_TKZ_filename
               , Parser_TKZ_tokline
               , Parser_TKZ_tokcol
               , Parser_TKZ_tokpos
           });
        return undefined;
        }


        //method read_num(prefix) returns number
        any Parser_TKZ_read_num(DEFAULT_ARGUMENTS){
            
            // define named params
            var prefix= argc? arguments[0] : undefined;
            //---------

            //var has_e = false, after_e = false, has_x = false, has_dot = prefix  is  ".";
            var has_e = false
               , after_e = false
               , has_x = false
               , has_dot = any_number(__is(prefix,any_LTR(".")))
           ;

            //var i=-1, start=TKZ.pos;
            var i = any_number(-1)
               , start = Parser_TKZ_pos
           ;
            //do 
            while(TRUE){

                //var ch:string = TKZ.peek()
                var ch = Parser_TKZ_peek(undefined,0,NULL)
               ;
                //var code = ch.charCodeAt(0)
                var code = METHOD(charCodeAt_,ch)(ch,1,(any_arr){any_number(0)
               })
               ;
                //i++
                i.value.number++;

                //var valid = true //default
                var valid = true
               ; //default

                //case code
                var _case2=code;
                  //when 120,88: // xX
                    if (__is(_case2,any_number(120))||__is(_case2,any_number(88))){
                        
                    //valid = has_x ? false : (true into has_x);
                    valid = _anyToBool(has_x) ? false : ((has_x=true));
                ;
                    }
                  //when 101,69: // eE
                    else if (__is(_case2,any_number(101))||__is(_case2,any_number(69))){
                        
                    //valid = has_x ? true : has_e ? false : (true into has_e into after_e);
                    valid = _anyToBool(has_x) ? true : _anyToBool(has_e) ? false : ((after_e=(has_e=true)));
                ;
                    }
                  //when 45: // -
                    else if (__is(_case2,any_number(45))){
                        
                    //valid = after_e or (i is 0 and not prefix);
                    var ___or15=undefined;
                    valid = (_anyToBool(___or15=after_e)? ___or15 : (any_number(__is(i,any_number(0)) && !(_anyToBool(prefix)))));
                ;
                    }
                  //when 43: // +
                    else if (__is(_case2,any_number(43))){
                        
                    //valid = after_e;
                    valid = after_e;
                ;
                    }
                else {
                //else
                    //after_e = false
                    after_e = false;
                    //if code is 46 // .
                    if (__is(code,any_number(46)))  { // .
                        //valid = (no has_dot and no has_x and no has_e) ? (true into has_dot) : false;
                        valid = (!_anyToBool(has_dot) && !_anyToBool(has_x) && !_anyToBool(has_e)) ? ((has_dot=true)) : false;
                    }
                    //else
                    
                    else {
                        //valid = is_alphanumeric_char(code)
                        valid = Parser_is_alphanumeric_char(undefined,1,(any_arr){code
                       });
                    };
                };

                //if not valid, break
                if (!(_anyToBool(valid))) {break;};
                //TKZ.next //consume char
                Parser_TKZ_next(undefined,0,NULL); //consume char
            };// end loop
            //loop

            //var num = TKZ.text.substr(start,i)
            var num = __call(substr_,Parser_TKZ_text,2,(any_arr){start
               , i
           })
           ;

            //if prefix 
            if (_anyToBool(prefix))  {
                //num = prefix & num
                num = _concatAny(2,prefix,num);
            };

            //var parsed = parse_js_number(num);
            var parsed = Parser_parse_js_number(undefined,1,(any_arr){num
           })
           ;
            //if not Number.isNaN(parsed)
            if (!(_anyToBool(Number_isNaN(undefined,1,(any_arr){parsed
           }))))  {
                //return TKZ.token("num", parsed)
                return Parser_TKZ_token(undefined,2,(any_arr){any_LTR("num")
                   , parsed
               });
            }
            //else 
            
            else {
                //TKZ.parse_error("Invalid syntax: " & num)
                Parser_TKZ_parse_error(undefined,1,(any_arr){_concatAny(2,any_LTR("Invalid syntax: "),num)
               });
            };
        return undefined;
        }


        //method read_escaped_char(in_string:boolean) 
        any Parser_TKZ_read_escaped_char(DEFAULT_ARGUMENTS){
            
            // define named params
            var in_string= argc? arguments[0] : undefined;
            //---------
            //var ch:string = TKZ.next(true, in_string);
            var ch = Parser_TKZ_next(undefined,2,(any_arr){true
               , in_string
           })
           ;
            //case ch.charCodeAt(0)
            var _case3=METHOD(charCodeAt_,ch)(ch,1,(any_arr){any_number(0)
           });
              //when 110 : return "\n"
                if (__is(_case3,any_number(110))){
                    return any_LTR("\n");
                }
              //when 114 : return "\r"
                else if (__is(_case3,any_number(114))){
                    return any_LTR("\r");
                }
              //when 116 : return "\t"
                else if (__is(_case3,any_number(116))){
                    return any_LTR("\t");
                }
              //when 98  : return "\b"
                else if (__is(_case3,any_number(98))){
                    return any_LTR("\b");
                }
              //when 118 : return "\x0b"; // \v : vert tab
                else if (__is(_case3,any_number(118))){
                    return any_LTR("\x0b");
                }
              //when 102 : return "\f";
                else if (__is(_case3,any_number(102))){
                    return any_LTR("\f");
                }
              //when 48  : return "\0";
                else if (__is(_case3,any_number(48))){
                    return any_LTR("\0");
                }
              //when 120 : return String.fromCharCode(TKZ.hex_bytes(2)); // \x
                else if (__is(_case3,any_number(120))){
                    return String_fromCharCode(undefined,1,(any_arr){Parser_TKZ_hex_bytes(undefined,1,(any_arr){any_number(2)
           })
           });
                }
              //when 117 : return String.fromCharCode(TKZ.hex_bytes(4)); // \u
                else if (__is(_case3,any_number(117))){
                    return String_fromCharCode(undefined,1,(any_arr){Parser_TKZ_hex_bytes(undefined,1,(any_arr){any_number(4)
           })
           });
                }
              //when 10  : return ""; // newline
                else if (__is(_case3,any_number(10))){
                    return any_EMPTY_STR;
                }
            else {
              //else
                 //return ch;
                 return ch;
            };
        return undefined;
        }

        //method hex_bytes(n) 
        any Parser_TKZ_hex_bytes(DEFAULT_ARGUMENTS){
            
            // define named params
            var n= argc? arguments[0] : undefined;
            //---------

            //var num = 0
            var num = any_number(0)
           ;

            //while n--
            while(n.value.number--){
                //var digit = parseInt(TKZ.next(true), 16)
                var digit = parseInt(undefined,2,(any_arr){Parser_TKZ_next(undefined,1,(any_arr){true
               })
                   , any_number(16)
               })
               ;

                //if Number.isNaN(digit)
                if (_anyToBool(Number_isNaN(undefined,1,(any_arr){digit
               })))  {
                    //TKZ.parse_error("Invalid hex-character pattern in string")
                    Parser_TKZ_parse_error(undefined,1,(any_arr){any_LTR("Invalid hex-character pattern in string")
                   });
                };

                //num = (num << 4) bitor digit
                num = any_number((int64_t)((int64_t)_anyToNumber(num) << (int64_t)4) | (int64_t)_anyToNumber(digit));
            };// end loop

            //return num;
            return num;
        return undefined;
        }


        //var read_string = with_eof_error("Unterminated string constant", method(){
        //method read_string
        any Parser_TKZ_read_string(DEFAULT_ARGUMENTS){

            //var quote = TKZ.next(), ret = ""
            var quote = Parser_TKZ_next(undefined,0,NULL)
               , ret = any_EMPTY_STR
           ;

            //do
            while(TRUE){

                //var ch = TKZ.next(true)
                var ch = Parser_TKZ_next(undefined,1,(any_arr){true
               })
               ;

                //if ch  is  quote, break
                if (__is(ch,quote)) {break;};

                //if ch  is  "\\"
                if (__is(ch,any_LTR("\\")))  {

                    // try to read OctalEscapeSequence (XXX: deprecated if "strict mode")
                    // https://github.com/mishoo/UglifyJS/issues/178
                    //var octal_len = 0, first = null;
                    var octal_len = any_number(0)
                       , first = null
                   ;

                    //var i=-1, start=TKZ.pos;
                    var i = any_number(-1)
                       , start = Parser_TKZ_pos
                   ;
                    //do 
                    while(TRUE){
                        //ch= TKZ.peek()
                        ch = Parser_TKZ_peek(undefined,0,NULL);
                        //i++
                        i.value.number++;
                        //var valid = true
                        var valid = true
                       ;

                        //if ch >= "0" and ch <= "7"
                        if (_anyToNumber(ch) >= '0' && _anyToNumber(ch) <= '7')  {
                            //if not first
                            if (!(_anyToBool(first)))  {
                                //first = ch
                                first = ch;
                                //valid = ++octal_len
                                valid = any_number(++octal_len.value.number);
                            }
                            //else if first <= "3" and octal_len <= 2 
                            
                            else if (_anyToNumber(first) <= '3' && _anyToNumber(octal_len) <= 2)  {
                                //valid = ++octal_len
                                valid = any_number(++octal_len.value.number);
                            }
                            //else if first >= "4" and octal_len <= 1 
                            
                            else if (_anyToNumber(first) >= '4' && _anyToNumber(octal_len) <= 1)  {
                                //valid = ++octal_len
                                valid = any_number(++octal_len.value.number);
                            };
                        }
                        //else
                        
                        else {
                            //valid = false
                            valid = false;
                        };

                        //if not valid, break
                        if (!(_anyToBool(valid))) {break;};
                        //TKZ.next //consume char
                        Parser_TKZ_next(undefined,0,NULL); //consume char
                    };// end loop
                    //loop

                    //ch=TKZ.text.substr(start,i)
                    ch = __call(substr_,Parser_TKZ_text,2,(any_arr){start
                       , i
                   });

                    //if (octal_len > 0) 
                    if ((_anyToNumber(octal_len) > 0))  {
                        //ch = String.fromCharCode(parseInt(ch, 8))
                        ch = String_fromCharCode(undefined,1,(any_arr){parseInt(undefined,2,(any_arr){ch
                           , any_number(8)
                       })
                       });
                    }
                    //else 
                    
                    else {
                        //ch = TKZ.read_escaped_char(true);
                        ch = Parser_TKZ_read_escaped_char(undefined,1,(any_arr){true
                       });
                    };
                };

                //end if "\\"
                

                //ret &= ch
                ret=_concatAny(2,ret,ch);
            };// end loop

            //loop

            //return TKZ.token("string", ret)
            return Parser_TKZ_token(undefined,2,(any_arr){any_LTR("string")
               , ret
           });
        return undefined;
        }


        //method skip_line_comment(type) 
        any Parser_TKZ_skip_line_comment(DEFAULT_ARGUMENTS){
            
            // define named params
            var type= argc? arguments[0] : undefined;
            //---------

            //need to save TKZ.regex_allowed flag because TKZ.token() resets it
            //var save_regex_allowed = TKZ.regex_allowed
            var save_regex_allowed = Parser_TKZ_regex_allowed
           ;

            //var i = TKZ.findByteIndex("\n"), ret;
            var i = Parser_TKZ_findByteIndex(undefined,1,(any_arr){any_LTR("\n")
           })
               , ret = undefined
           ;
            //if (i  is  -1) 
            if ((__is(i,any_number(-1))))  {
                //ret = TKZ.text.substr(TKZ.pos);
                ret = __call(substr_,Parser_TKZ_text,1,(any_arr){Parser_TKZ_pos
               });
                //TKZ.pos = TKZ.text.length; //move to EOF
                Parser_TKZ_pos = any_number(_length(Parser_TKZ_text)); //move to EOF
            }
            //else 
            
            else {
                //ret = TKZ.text.slice(TKZ.pos, i);
                ret = __call(slice_,Parser_TKZ_text,2,(any_arr){Parser_TKZ_pos
                   , i
               });
                //TKZ.pos = i
                Parser_TKZ_pos = i;
            };

            //TKZ.comments_before.push( TKZ.token(type, ret, true) );
            __call(push_,Parser_TKZ_comments_before,1,(any_arr){Parser_TKZ_token(undefined,3,(any_arr){type
               , ret
               , true
           })
           });

            //restore TKZ.regex_allowed flag 
            //TKZ.regex_allowed = save_regex_allowed
            Parser_TKZ_regex_allowed = save_regex_allowed;

            //return TKZ.next_token();
            return Parser_TKZ_next_token(undefined,0,NULL);
        return undefined;
        }


        //method skip_multiline_comment //= with_eof_error("Unterminated multiline comment", method(){
        any Parser_TKZ_skip_multiline_comment(DEFAULT_ARGUMENTS){

            //need to save TKZ.regex_allowed flag because TKZ.token() resets it
            //var save_regex_allowed = TKZ.regex_allowed
            var save_regex_allowed = Parser_TKZ_regex_allowed
           ;

            //var i = TKZ.findByteIndex("*/", true);
            var i = Parser_TKZ_findByteIndex(undefined,2,(any_arr){any_LTR("*/")
               , true
           })
           ;
            //var text:string = TKZ.text.slice(TKZ.pos, i);
            var text = __call(slice_,Parser_TKZ_text,2,(any_arr){Parser_TKZ_pos
               , i
           })
           ;
            //var a = text.split("\n"), n = a.length;
            var a = METHOD(split_,text)(text,1,(any_arr){any_LTR("\n")
           })
               , n = any_number(_length(a))
           ;
            // update stream position
            //TKZ.pos = i + 2
            Parser_TKZ_pos = any_number(_anyToNumber(i) + 2);

            //TKZ.line += n - 1;
            Parser_TKZ_line.value.number += _anyToNumber(n) - 1;
            //if n > 1 
            if (_anyToNumber(n) > 1)  {
                //TKZ.col = a[n - 1].length;
                Parser_TKZ_col = any_number(_length(ITEM(_anyToNumber(n) - 1,a)));
            }
            //else 
            
            else {
                //TKZ.col += a[n - 1].length;
                Parser_TKZ_col.value.number += _length(ITEM(_anyToNumber(n) - 1,a));
            };

            //TKZ.col += 2;
            Parser_TKZ_col.value.number += 2;
            //TKZ.newline_before = TKZ.newline_before or text.indexOf("\n") >= 0;
            var ___or16=undefined;
            Parser_TKZ_newline_before = (_anyToBool(___or16=Parser_TKZ_newline_before)? ___or16 : any_number(_anyToNumber(METHOD(indexOf_,text)(text,1,(any_arr){any_LTR("\n")
           })) >= 0));
            //var saveNLB = TKZ.newline_before
            var saveNLB = Parser_TKZ_newline_before
           ;

            //TKZ.comments_before.push(TKZ.token("comment2", text, true));
            __call(push_,Parser_TKZ_comments_before,1,(any_arr){Parser_TKZ_token(undefined,3,(any_arr){any_LTR("comment2")
               , text
               , true
           })
           });

            //restore TKZ.regex_allowed flag 
            //TKZ.regex_allowed = save_regex_allowed
            Parser_TKZ_regex_allowed = save_regex_allowed;
            //TKZ.newline_before = saveNLB
            Parser_TKZ_newline_before = saveNLB;

            //return TKZ.next_token();
            return Parser_TKZ_next_token(undefined,0,NULL);
        return undefined;
        }


//read a indentifier 

        //method read_name() 
        any Parser_TKZ_read_name(DEFAULT_ARGUMENTS){

            //var 
                //backslash = false, name = "", ch:string
                //escaped = false, hex:string
            var backslash = false
               , name = any_EMPTY_STR
               , ch = undefined
               , escaped = false
               , hex = undefined
           ;

            //while TKZ.peek() into ch isnt null
            while(!__is((ch=Parser_TKZ_peek(undefined,0,NULL)),null)){

                //if no backslash
                if (!_anyToBool(backslash))  {

                    //if ch  is  "\\" 
                    if (__is(ch,any_LTR("\\")))  {
                        //escaped = true
                        escaped = true;
                        //backslash = true 
                        backslash = true;
                        //TKZ.next()
                        Parser_TKZ_next(undefined,0,NULL);
                    }

                    //else if is_identifier_char(ch) 
                    
                    else if (_anyToBool(Parser_is_identifier_char(undefined,1,(any_arr){ch
                   })))  {
                        //name &= TKZ.next()
                        name=_concatAny(2,name,Parser_TKZ_next(undefined,0,NULL));
                    }

                    //else 
                    
                    else {
                        //break
                        break;
                    };
                }

                //else 
                
                else {
                    //if ch isnt "u", TKZ.parse_error("Expecting UnicodeEscapeSequence -- uXXXX");
                    if (!__is(ch,any_LTR("u"))) {Parser_TKZ_parse_error(undefined,1,(any_arr){any_LTR("Expecting UnicodeEscapeSequence -- uXXXX")
                   });};
                    //ch = TKZ.read_escaped_char();
                    ch = Parser_TKZ_read_escaped_char(undefined,0,NULL);
                    //if (not is_identifier_char(ch)), TKZ.parse_error("Unicode char: " & ch.charCodeAt(0) & " is not valid in identifier");
                    if ((!(_anyToBool(Parser_is_identifier_char(undefined,1,(any_arr){ch
                   }))))) {Parser_TKZ_parse_error(undefined,1,(any_arr){_concatAny(2,_concatAny(2,any_LTR("Unicode char: "),METHOD(charCodeAt_,ch)(ch,1,(any_arr){any_number(0)
                  })),any_LTR(" is not valid in identifier"))
                  });};
                    //name &= ch;
                    name=_concatAny(2,name,ch);
                    //backslash = false;
                    backslash = false;
                };
            };// end loop

            //end while
            

            //if escaped and Utils.isPredicate(KEYWORDS,name) 
            if (_anyToBool(escaped) && _anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_KEYWORDS
               , name
           })))  {
                //hex = name.charCodeAt(0).toString(16).toUpperCase();
                hex = __call(toUpperCase_,__call(toString_,METHOD(charCodeAt_,name)(name,1,(any_arr){any_number(0)
               }),1,(any_arr){any_number(16)
              }),0,NULL);
                //name = "\\u" & FOUR_ZEROES.substr(hex.length) & hex & name.slice(1);
                name = _concatAny(2,_concatAny(2,_concatAny(2,any_LTR("\\u"),METHOD(substr_,Parser_FOUR_ZEROES)(Parser_FOUR_ZEROES,1,(any_arr){any_number(_length(hex))
               })),hex),METHOD(slice_,name)(name,1,(any_arr){any_number(1)
              }));
            };

            //return name
            return name;
        return undefined;
        }



        //var read_regexp = with_eof_error("Unterminated regular expression", method(regexp){
        //method read_regexp
        any Parser_TKZ_read_regexp(DEFAULT_ARGUMENTS){

            //var prev_backslash = false, ch, in_class = false, regexp="";
            var prev_backslash = false
               , ch = undefined
               , in_class = false
               , regexp = any_EMPTY_STR
           ;

            //while TKZ.next(true) into ch
            while(_anyToBool((ch=Parser_TKZ_next(undefined,1,(any_arr){true
           })))){

                //if prev_backslash
                if (_anyToBool(prev_backslash))  {
                    //regexp &= "\\" & ch
                    regexp=_concatAny(2,regexp,_concatAny(2,any_LTR("\\"),ch));
                    //prev_backslash = false
                    prev_backslash = false;
                }

                //else if ch  is  "["
                
                else if (__is(ch,any_LTR("[")))  {
                    //in_class = true
                    in_class = true;
                    //regexp &= ch
                    regexp=_concatAny(2,regexp,ch);
                }

                //else if ch  is  "]" and in_class
                
                else if (__is(ch,any_LTR("]")) && _anyToBool(in_class))  {
                    //in_class = false
                    in_class = false;
                    //regexp &= ch
                    regexp=_concatAny(2,regexp,ch);
                }

                //else if ch  is  "/" and not in_class
                
                else if (__is(ch,any_LTR("/")) && !(_anyToBool(in_class)))  {
                    //break
                    break;
                }

                //else if ch  is  "\\"
                
                else if (__is(ch,any_LTR("\\")))  {
                    //prev_backslash = true
                    prev_backslash = true;
                }

                //else 
                
                else {
                    //regexp &= ch;
                    regexp=_concatAny(2,regexp,ch);
                };
            };// end loop

            //end while
            

            //var mods = TKZ.read_name();
            var mods = Parser_TKZ_read_name(undefined,0,NULL)
           ;

            //return TKZ.token("regexp",regexp) // {regexp:regexp, mods:mods}) 
            //NOTE: original-Uglify:
            //return TKZ.token("regexp", new RegExp(regexp, mods));
            return Parser_TKZ_token(undefined,2,(any_arr){any_LTR("regexp")
               , new(RegExp,2,(any_arr){regexp
                  , mods
              })
           });
        return undefined;
        }


        //method read_operator(prefix) 
        any Parser_TKZ_read_operator(DEFAULT_ARGUMENTS){
            
            // define named params
            var prefix= argc? arguments[0] : undefined;
            //---------

            //var operator= prefix or TKZ.next()
            var ___or17=undefined;
            var operator = (_anyToBool(___or17=prefix)? ___or17 : Parser_TKZ_next(undefined,0,NULL))
           ;

//read the bigger operator possible.

//Keep reading until it is not an operator. return last one which is

            //do while TKZ.peek() into var ch
            var ch=undefined;
            while(_anyToBool((ch=Parser_TKZ_peek(undefined,0,NULL)))){
                //if not Utils.isPredicate(OPERATORS,operator & ch)
                if (!(_anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_OPERATORS
                   , _concatAny(2,operator,ch)
               }))))  {
                    //break
                    break;
                };
                //operator &= ch
                operator=_concatAny(2,operator,ch);
                //TKZ.next //consume char
                Parser_TKZ_next(undefined,0,NULL); //consume char
            };// end loop
            //loop

            //return TKZ.token("operator", operator)
            return Parser_TKZ_token(undefined,2,(any_arr){any_LTR("operator")
               , operator
           });
        return undefined;
        }


        //method handle_slash() 
        any Parser_TKZ_handle_slash(DEFAULT_ARGUMENTS){

            //TKZ.next();
            Parser_TKZ_next(undefined,0,NULL);

            //case TKZ.peek()
            var _case4=Parser_TKZ_peek(undefined,0,NULL);
              //when "/":
                if (__is(_case4,any_LTR("/"))){
                    
                //TKZ.next();
                Parser_TKZ_next(undefined,0,NULL);
                //return TKZ.skip_line_comment("comment1");
                return Parser_TKZ_skip_line_comment(undefined,1,(any_arr){any_LTR("comment1")
               });
            ;
                }
              //when "*":
                else if (__is(_case4,any_LTR("*"))){
                    
                //TKZ.next();
                Parser_TKZ_next(undefined,0,NULL);
                //return TKZ.skip_multiline_comment();
                return Parser_TKZ_skip_multiline_comment(undefined,0,NULL);
            ;
                };

            //return TKZ.regex_allowed ? TKZ.read_regexp("") : TKZ.read_operator("/");
            return _anyToBool(Parser_TKZ_regex_allowed) ? Parser_TKZ_read_regexp(undefined,1,(any_arr){any_EMPTY_STR
           }) : Parser_TKZ_read_operator(undefined,1,(any_arr){any_LTR("/")
          });
        return undefined;
        }


        //method handle_dot() 
        any Parser_TKZ_handle_dot(DEFAULT_ARGUMENTS){

            //TKZ.next();
            Parser_TKZ_next(undefined,0,NULL);

            //return is_digit(TKZ.peek().charCodeAt(0))
            return _anyToBool(Parser_is_digit(undefined,1,(any_arr){__call(charCodeAt_,Parser_TKZ_peek(undefined,0,NULL),1,(any_arr){any_number(0)
           })
           })) ? Parser_TKZ_read_num(undefined,1,(any_arr){any_LTR(".")
          }) : Parser_TKZ_token(undefined,2,(any_arr){any_LTR("punc")
             , any_LTR(".")
         });
        return undefined;
        }
                //? TKZ.read_num(".")
                //: TKZ.token("punc", ".")


        //method read_word() 
        any Parser_TKZ_read_word(DEFAULT_ARGUMENTS){
            //var word = TKZ.read_name()
            var word = Parser_TKZ_read_name(undefined,0,NULL)
           ;
            //if TKZ.prev_was_dot, return TKZ.token("name", word)
            if (_anyToBool(Parser_TKZ_prev_was_dot)) {return Parser_TKZ_token(undefined,2,(any_arr){any_LTR("name")
               , word
           });};

            //return Utils.isPredicate(KEYWORDS_ATOM,word) ? TKZ.token("atom", word)
            return _anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_KEYWORDS_ATOM
               , word
           })) ? Parser_TKZ_token(undefined,2,(any_arr){any_LTR("atom")
              , word
          }) : !(_anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_KEYWORDS
             , word
         }))) ? Parser_TKZ_token(undefined,2,(any_arr){any_LTR("name")
            , word
        }) : _anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_OPERATORS
           , word
       })) ? Parser_TKZ_token(undefined,2,(any_arr){any_LTR("operator")
          , word
      }) : Parser_TKZ_token(undefined,2,(any_arr){any_LTR("keyword")
         , word
     });
        return undefined;
        }
                //: not Utils.isPredicate(KEYWORDS,word) ? TKZ.token("name", word)
                //: Utils.isPredicate(OPERATORS,word) ? TKZ.token("operator", word)
                //: TKZ.token("keyword", word);


        ///*method with_eof_error(eof_error, cont) {
            //return method(x) {
                //try {
                    //return cont(x);
                //} catch(ex) {
                    //if (ex  is = EX_EOF) parse_error(eof_error);
                    //else throw ex;
                //}
            //};
        //};
        //*/

        //method next_token(force_regexp) 
        any Parser_TKZ_next_token(DEFAULT_ARGUMENTS){
            
            // define named params
            var force_regexp= argc? arguments[0] : undefined;
            //---------

            //if force_regexp 
            if (_anyToBool(force_regexp))  {
                //return TKZ.read_regexp(force_regexp);
                return Parser_TKZ_read_regexp(undefined,1,(any_arr){force_regexp
               });
            };

            //TKZ.skip_whitespace();
            Parser_TKZ_skip_whitespace(undefined,0,NULL);
            //TKZ.start_token();
            Parser_TKZ_start_token(undefined,0,NULL);

            //if TKZ.html5_comments
            if (_anyToBool(Parser_TKZ_html5_comments))  {
                //if TKZ.looking_at("<!--")
                if (_anyToBool(Parser_TKZ_looking_at(undefined,1,(any_arr){any_LTR("<!--")
               })))  {
                    //TKZ.forward(4);
                    Parser_TKZ_forward(undefined,1,(any_arr){any_number(4)
                   });
                    //return TKZ.skip_line_comment("comment3");
                    return Parser_TKZ_skip_line_comment(undefined,1,(any_arr){any_LTR("comment3")
                   });
                };

                //if TKZ.looking_at("-->") and TKZ.newline_before 
                if (_anyToBool(Parser_TKZ_looking_at(undefined,1,(any_arr){any_LTR("-->")
               })) && _anyToBool(Parser_TKZ_newline_before))  {
                    //TKZ.forward(3);
                    Parser_TKZ_forward(undefined,1,(any_arr){any_number(3)
                   });
                    //return TKZ.skip_line_comment("comment4");
                    return Parser_TKZ_skip_line_comment(undefined,1,(any_arr){any_LTR("comment4")
                   });
                };
            };



            //var ch:string = TKZ.peek();
            var ch = Parser_TKZ_peek(undefined,0,NULL)
           ;
            //if no ch, return TKZ.token("eof");
            if (!_anyToBool(ch)) {return Parser_TKZ_token(undefined,1,(any_arr){any_LTR("eof")
           });};

            //var code = ch.charCodeAt(0)
            var code = METHOD(charCodeAt_,ch)(ch,1,(any_arr){any_number(0)
           })
           ;
            //case code
            var _case5=code;
                //when 34,39: return TKZ.read_string();
                if (__is(_case5,any_number(34))||__is(_case5,any_number(39))){
                    return Parser_TKZ_read_string(undefined,0,NULL);
                }
                //when 46: return TKZ.handle_dot();
                else if (__is(_case5,any_number(46))){
                    return Parser_TKZ_handle_dot(undefined,0,NULL);
                }
                //when 47: return TKZ.handle_slash();
                else if (__is(_case5,any_number(47))){
                    return Parser_TKZ_handle_slash(undefined,0,NULL);
                };

            //if is_digit(code), return TKZ.read_num()
            if (_anyToBool(Parser_is_digit(undefined,1,(any_arr){code
           }))) {return Parser_TKZ_read_num(undefined,0,NULL);};

            //if ch in PUNC_CHARS, return TKZ.token("punc", TKZ.next())
            if (CALL1(indexOf_,Parser_PUNC_CHARS,ch).value.number>=0) {return Parser_TKZ_token(undefined,2,(any_arr){any_LTR("punc")
               , Parser_TKZ_next(undefined,0,NULL)
           });};

            //if ch in OPERATOR_CHARS, return TKZ.read_operator()
            if (CALL1(indexOf_,Parser_OPERATOR_CHARS,ch).value.number>=0) {return Parser_TKZ_read_operator(undefined,0,NULL);};

            //if code is 92 or is_identifier_start(code), return TKZ.read_word()
            var ___or18=undefined;
            if (_anyToBool((_anyToBool(___or18=any_number(__is(code,any_number(92))))? ___or18 : Parser_is_identifier_start(undefined,1,(any_arr){code
           })))) {return Parser_TKZ_read_word(undefined,0,NULL);};

            //TKZ.parse_error("Unexpected character '#{ch}'")
            Parser_TKZ_parse_error(undefined,1,(any_arr){_concatAny(3,any_LTR("Unexpected character '")
               , ch
               , any_LTR("'")
           )
           });
        return undefined;
        }
        
        //------------------
        void Parser_TKZ__namespaceInit(void){
            Parser_TKZ_pos = any_number(0);
            Parser_TKZ_tokpos = any_number(0);
            Parser_TKZ_line = any_number(1);
            Parser_TKZ_tokline = any_number(0);
            Parser_TKZ_col = any_number(0);
            Parser_TKZ_tokcol = any_number(0);
            Parser_TKZ_newline_before = false;
            Parser_TKZ_regex_allowed = false;
            Parser_TKZ_comments_before = new(Array,0,NULL);
            Parser_TKZ_prev_was_dot = false;

        //end next_token / aka "input"       
        };
    

//--------------
    // Parser_PRSOptions
    any Parser_PRSOptions; //Class Parser_PRSOptions
    //auto Parser_PRSOptions__init
    void Parser_PRSOptions__init(any this, len_t argc, any* arguments){
        PROP(strict_,this)=false;
        PROP(filename_,this)=null;
        PROP(toplevel_,this)=null;
        PROP(expression_,this)=false;
        PROP(html5_comments_,this)=true;
    };
    
    //auto Parser_PRSOptions_newFromObject
    inline any Parser_PRSOptions_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(Parser_PRSOptions,argc,arguments);
    }

        ///*next_token.context = method(nc) {
            //if (nc) TKZ = nc;
            //return TKZ;
        //};
        //*/

    //end namespace TKZ

    ///* -----[ Parser (constants) ]----- */

    //var UNARY_PREFIX = Utils.makePredicate([
        //"typeof",
        //"void",
        //"delete",
        //"--",
        //"++",
        //"!",
        //"~",
        //"-",
        //"+"
    //])

    //var UNARY_POSTFIX = Utils.makePredicate([ "--", "++" ]);

    //var ASSIGNMENT = Utils.makePredicate([ "=", "+=", "-=", "/=", "*=", "%=", ">>=", "<<=", ">>>=", "|=", "^=", "&=" ]);

    ///*
    //var PRECEDENCE = (function(a, ret){
        //for (var i = 0; i < a.length; ++i) {
            //var b = a[i];
            //for (var j = 0; j < b.length; ++j) {
                //ret[b[j]] = i + 1;
            //}
        //}
        //return ret;
    //})(
        //[
            //["||"],
            //["&&"],
            //["|"],
            //["^"],
            //["&"],
            //["==", "===", "!=", "!=="],
            //["<", ">", "<=", ">=", "in", "instanceof"],
            //[">>", "<<", ">>>"],
            //["+", "-"],
            //["*", "/", "%"]
        //],
        //{}
    //);
    //*/
    //var PRECEDENCE =  //higher number is higher precedence

            //"||": 1
            //"&&": 2
            //"|" : 3
            //"^" : 4
            //"&" : 5

            //"==":6, "===":6, "!=":6, "!==":6

            //"<":7, ">":7, "<=":7, ">=":7, "in":7, "instanceof":7

            //">>":8, "<<":8, ">>>":8

            //"+":9, "-":9

            //"*":10, "/":10, "%":10


    //var STATEMENTS_WITH_LABELS = array_to_hash([ "for", "do", "while", "switch" ]);

    //var ATOMIC_START_TOKEN = "|atom|num|string|regexp|name|";

    ///* -----[ Parser ]----- 
    //*/

    //class PRSOptions
        //properties
            //strict         = false,
            //filename:string        = null,
            //toplevel:AST.Toplevel  = null,
            //expression     = false,
            //html5_comments = true
        ;
        //-------------------------
        //NAMESPACE Parser_PRS
        //-------------------------
        var Parser_PRS_input, Parser_PRS_token, Parser_PRS_prev, Parser_PRS_peeked, Parser_PRS_in_function, Parser_PRS_in_directives, Parser_PRS_in_loop, Parser_PRS_labels, Parser_PRS_options;
        


    //public namespace PRS 

        //properties
            //input  : Function //next_token
            //token         = null,
            //prev          = null,
            //peeked        = null,
            //in_function   = 0,
            //in_directives = true,
            //in_loop       = 0,
            //labels        = []
            //options: PRSOptions     

        //method parse($TEXT, options) 
        any Parser_PRS_parse(DEFAULT_ARGUMENTS){
            
            // define named params
            var $TEXT, options;
            $TEXT=options=undefined;
            switch(argc){
              case 2:options=arguments[1];
              case 1:$TEXT=arguments[0];
            }
            //---------

            //PRS.options = new PRSOptions
            Parser_PRS_options = new(Parser_PRSOptions,0,NULL);

            //for each property name,value in options
            {len_t __propCount=_length(options); any name=undefined; any value=undefined;
            for(int __propIndex=0 ; __propIndex < __propCount ; __propIndex++ ){
                NameValuePair_s _nvp = _unifiedGetNVPAtIndex(options, __propIndex);
                value= _nvp.value;name= _nvp.name;
            
                //PRS.options[name] = value
                ITEM(_anyToNumber(name),Parser_PRS_options) = value;
            }};// end for each property in options

            //PRS.input = ( typeof $TEXT is  "string" ? 
            Parser_PRS_input = (__is(_typeof($TEXT),any_LTR("string")) ? Parser_TKZ_tokenize(undefined,3,(any_arr){$TEXT
               , PROP(filename_,Parser_PRS_options)
               , PROP(html5_comments_,Parser_PRS_options)
           }) : $TEXT);
                            //TKZ.tokenize($TEXT, PRS.options.filename, PRS.options.html5_comments) 
                            //: $TEXT)

            //PRS.token = PRS.next();
            Parser_PRS_token = Parser_PRS_next(undefined,0,NULL);

            //if PRS.options.expression
            if (_anyToBool(PROP(expression_,Parser_PRS_options)))  {
                //return PRS.expression(true);
                return Parser_PRS_expression(undefined,1,(any_arr){true
               });
            };

            //var start = PRS.token;
            var start = Parser_PRS_token
           ;
            //var body:array = [];
            var body = new(Array,0,NULL)
           ;
            //while not PRS.isToken("eof")
            while(!(_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("eof")
           })))){
                //body.push PRS.statement()
                METHOD(push_,body)(body,1,(any_arr){Parser_PRS_statement(undefined,0,NULL)
               });
            };// end loop

            //var endpos = PRS.getPrev();
            var endpos = Parser_PRS_getPrev(undefined,0,NULL)
           ;

            //var toplevel:AST.Toplevel = PRS.options.toplevel
            var toplevel = PROP(toplevel_,Parser_PRS_options)
           ;

            //if (toplevel) 
            if ((_anyToBool(toplevel)))  {
                //toplevel.body = toplevel.body.concat(body);
                PROP(body_,toplevel) = __call(concat_,PROP(body_,toplevel),1,(any_arr){body
               });
                //toplevel.endpos = endpos;
                PROP(endpos_,toplevel) = endpos;
            }

            //else 
            
            else {
                //toplevel = new AST.Toplevel({ start: start, body: body, endpos: endpos })
                toplevel = new(AST_Toplevel,1,(any_arr){new(Map,3,(any_arr){
                _newPair("start",start), 
                _newPair("body",body), 
                _newPair("endpos",endpos)
                })
               });
            };

            //return toplevel;
            return toplevel;
        return undefined;
        }


        //method isToken(type, value) 
        any Parser_PRS_isToken(DEFAULT_ARGUMENTS){
            
            // define named params
            var type, value;
            type=value=undefined;
            switch(argc){
              case 2:value=arguments[1];
              case 1:type=arguments[0];
            }
            //---------
            //return is_token(PRS.token, type, value)
            return Parser_is_token(undefined,3,(any_arr){Parser_PRS_token
               , type
               , value
           });
        return undefined;
        }

        //method peek() returns string 
        any Parser_PRS_peek(DEFAULT_ARGUMENTS){
            //return PRS.peeked or (PRS.input.call(undefined) into PRS.peeked)
            var ___or19=undefined;
            return (_anyToBool(___or19=Parser_PRS_peeked)? ___or19 : ((Parser_PRS_peeked=__apply(Parser_PRS_input,undefined,0,NULL))));
        return undefined;
        }

        //method next() 
        any Parser_PRS_next(DEFAULT_ARGUMENTS){
            //PRS.prev = PRS.token
            Parser_PRS_prev = Parser_PRS_token;
            //if PRS.peeked
            if (_anyToBool(Parser_PRS_peeked))  {
                //PRS.token = PRS.peeked
                Parser_PRS_token = Parser_PRS_peeked;
                //PRS.peeked = null
                Parser_PRS_peeked = null;
            }
            //else 
            
            else {
                //PRS.token = PRS.input.call(undefined)
                Parser_PRS_token = __apply(Parser_PRS_input,undefined,0,NULL);
            };

            //PRS.in_directives = PRS.in_directives 
                var ___or20=undefined;
            Parser_PRS_in_directives = any_number(_anyToBool(Parser_PRS_in_directives) && (_anyToBool((_anyToBool(___or20=any_number(__is(PROP(type_,Parser_PRS_token),any_LTR("string"))))? ___or20 : Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(";")
           })))));
                //and ( PRS.token.type  is  "string"  or  PRS.isToken("punc", ";") )

            //return PRS.token
            return Parser_PRS_token;
        return undefined;
        }


        //method getPrev() 
        any Parser_PRS_getPrev(DEFAULT_ARGUMENTS){
            //return PRS.prev
            return Parser_PRS_prev;
        return undefined;
        }


        //method croak(msg, line, col, pos) 
        any Parser_PRS_croak(DEFAULT_ARGUMENTS){
            
            // define named params
            var msg, line, col, pos;
            msg=line=col=pos=undefined;
            switch(argc){
              case 4:pos=arguments[3];
              case 3:col=arguments[2];
              case 2:line=arguments[1];
              case 1:msg=arguments[0];
            }
            //---------
            //var ctx = PRS.input.context();
            //js_error(msg,
            Parser_js_error(undefined,5,(any_arr){msg
               , Parser_TKZ_filename
               , !__is(line,null) ? line : Parser_TKZ_tokline
               , !__is(col,null) ? col : Parser_TKZ_tokcol
               , !__is(pos,null) ? pos : Parser_TKZ_tokpos
           });
        return undefined;
        }
                     //TKZ.filename,
                     //line isnt null ? line : TKZ.tokline,
                     //col isnt null ? col : TKZ.tokcol,
                     //pos isnt null ? pos : TKZ.tokpos);


        //method token_error(token, msg) 
        any Parser_PRS_token_error(DEFAULT_ARGUMENTS){
            
            // define named params
            var token, msg;
            token=msg=undefined;
            switch(argc){
              case 2:msg=arguments[1];
              case 1:token=arguments[0];
            }
            //---------
            //PRS.croak(msg, token.line, token.col);
            Parser_PRS_croak(undefined,3,(any_arr){msg
               , PROP(line_,token)
               , PROP(col_,token)
           });
        return undefined;
        }


        //method unexpected(token) 
        any Parser_PRS_unexpected(DEFAULT_ARGUMENTS){
            
            // define named params
            var token= argc? arguments[0] : undefined;
            //---------
            //if no token, token = PRS.token;
            if (!_anyToBool(token)) {token = Parser_PRS_token;};
            //PRS.token_error(token, "Unexpected token: #{token.type} (#{token.value})");
            Parser_PRS_token_error(undefined,2,(any_arr){token
               , _concatAny(5,any_LTR("Unexpected token: ")
                  , PROP(type_,token)
                  , any_LTR(" (")
                  , PROP(value_,token)
                  , any_LTR(")")
              )
           });
        return undefined;
        }


        //method expect_token(type, val) 
        any Parser_PRS_expect_token(DEFAULT_ARGUMENTS){
            
            // define named params
            var type, val;
            type=val=undefined;
            switch(argc){
              case 2:val=arguments[1];
              case 1:type=arguments[0];
            }
            //---------
            //if PRS.isToken(type, val), return PRS.next()
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){type
               , val
           }))) {return Parser_PRS_next(undefined,0,NULL);};
            //PRS.token_error(PRS.token, "Unexpected token #{PRS.token.type} «#{PRS.token.value}», expected #{type} «#{val}»")
            Parser_PRS_token_error(undefined,2,(any_arr){Parser_PRS_token
               , _concatAny(9,any_LTR("Unexpected token ")
                  , PROP(type_,Parser_PRS_token)
                  , any_LTR(" «")
                  , PROP(value_,Parser_PRS_token)
                  , any_LTR("», expected ")
                  , type
                  , any_LTR(" «")
                  , val
                  , any_LTR("»")
              )
           });
        return undefined;
        }

        //method expect(punc) 
        any Parser_PRS_expect(DEFAULT_ARGUMENTS){
            
            // define named params
            var punc= argc? arguments[0] : undefined;
            //---------
            //return PRS.expect_token("punc", punc);
            return Parser_PRS_expect_token(undefined,2,(any_arr){any_LTR("punc")
               , punc
           });
        return undefined;
        }

        //method can_insert_semicolon() 
        any Parser_PRS_can_insert_semicolon(DEFAULT_ARGUMENTS){
            //return not PRS.options.strict 
                var ___or22=undefined;
                var ___or21=undefined;
            return any_number(!(_anyToBool(PROP(strict_,Parser_PRS_options))) && (_anyToBool((_anyToBool(___or22=(_anyToBool(___or21=PROP(nlb_,Parser_PRS_token))? ___or21 : Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("eof")
           })))? ___or22 : Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
              , any_LTR("}")
          })))));
        return undefined;
        }
                //and (PRS.token.nlb  or PRS.isToken("eof") or PRS.isToken("punc", "}") )


        //method semicolon() 
        any Parser_PRS_semicolon(DEFAULT_ARGUMENTS){

            //if PRS.isToken("punc", ";") 
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(";")
           })))  {
                //PRS.next()
                Parser_PRS_next(undefined,0,NULL);
            }

            //else if not PRS.can_insert_semicolon() 
            
            else if (!(_anyToBool(Parser_PRS_can_insert_semicolon(undefined,0,NULL))))  {
                //PRS.unexpected();
                Parser_PRS_unexpected(undefined,0,NULL);
            };
        return undefined;
        }


        //method parenthesised() 
        any Parser_PRS_parenthesised(DEFAULT_ARGUMENTS){

            //PRS.expect("(");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR("(")
           });
            //var exp = PRS.expression(true);
            var exp = Parser_PRS_expression(undefined,1,(any_arr){true
           })
           ;
            //PRS.expect(")");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR(")")
           });
            //return exp;
            return exp;
        return undefined;
        }


        //method handle_regexp() 
        any Parser_PRS_handle_regexp(DEFAULT_ARGUMENTS){
            //if PRS.isToken("operator", "/")  or  PRS.isToken("operator", "/=")
            var ___or23=undefined;
            if (_anyToBool((_anyToBool(___or23=Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("operator")
               , any_LTR("/")
           }))? ___or23 : Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("operator")
              , any_LTR("/=")
          }))))  {
                //PRS.peeked = null;
                Parser_PRS_peeked = null;
                //var v:string = PRS.token.value
                var v = PROP(value_,Parser_PRS_token)
               ;
                //PRS.token = PRS.input.call(v.substr(1)); // force regexp
                Parser_PRS_token = __apply(Parser_PRS_input,METHOD(substr_,v)(v,1,(any_arr){any_number(1)
               }),0,NULL); // force regexp
            };
        return undefined;
        }


        //method embed_tokens(parser_fn:function) 
        any Parser_PRS_embed_tokens(DEFAULT_ARGUMENTS){
            
            // define named params
            var parser_fn= argc? arguments[0] : undefined;
            //---------

//calls parser_fn, returns AST_node

            //var start = PRS.token;
            var start = Parser_PRS_token
           ;

            //var expr:AST.Node = parser_fn.call(undefined);
            var expr = __apply(parser_fn,undefined,0,NULL)
           ;

            //var endpos = PRS.getPrev();
            var endpos = Parser_PRS_getPrev(undefined,0,NULL)
           ;

            //expr.start = start;
            PROP(start_,expr) = start;
            //expr.endpos = endpos;
            PROP(endpos_,expr) = endpos;

            //return expr
            return expr;
        return undefined;
        }


        //method statement
        any Parser_PRS_statement(DEFAULT_ARGUMENTS){
            //return PRS.embed_tokens(PRS.statement_parser_fn)
            return Parser_PRS_embed_tokens(undefined,1,(any_arr){any_func(Parser_PRS_statement_parser_fn)
           });
        return undefined;
        }

        //method statement_parser_fn
        any Parser_PRS_statement_parser_fn(DEFAULT_ARGUMENTS){

            //var tmp;
            var tmp = undefined
           ;
            //PRS.handle_regexp();
            Parser_PRS_handle_regexp(undefined,0,NULL);

            //case PRS.token.type
            var _case6=PROP(type_,Parser_PRS_token);
              //when "string":
                if (__is(_case6,any_LTR("string"))){
                    
                //var dir = PRS.in_directives, stat:AST.SimpleStatement = PRS.simple_statement();
                var dir = Parser_PRS_in_directives
                   , stat = Parser_PRS_simple_statement(undefined,0,NULL)
               ;
                // XXXv2: decide how to fix directives
                //if (dir and stat.body instanceof AST.StringLiteral and not PRS.isToken("punc", ","))
                if ((_anyToBool(dir) && _instanceof(PROP(body_,stat),AST_StringLiteral) && !(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
                   , any_LTR(",")
               })))))  {
                    //return new AST.Directive({ value: stat.body.value });
                    return new(AST_Directive,1,(any_arr){new(Map,1,(any_arr){
                    _newPair("value",PROP(value_,PROP(body_,stat)))
                    })
                   });
                };
                //return stat;
                return stat;
            ;
                }
              //when 
                else if (__is(_case6,any_LTR("num"))||__is(_case6,any_LTR("regexp"))||__is(_case6,any_LTR("operator"))||__is(_case6,any_LTR("atom"))){
                    
                //"num"
                //"regexp"
                //"operator"
                //"atom":
                    //return PRS.simple_statement();
                    return Parser_PRS_simple_statement(undefined,0,NULL);
            ;
                }
              //when "name":
                else if (__is(_case6,any_LTR("name"))){
                    
                //return is_token(PRS.peek(), "punc", ":")
                return _anyToBool(Parser_is_token(undefined,3,(any_arr){Parser_PRS_peek(undefined,0,NULL)
                   , any_LTR("punc")
                   , any_LTR(":")
               })) ? Parser_PRS_labeled_statement(undefined,0,NULL) : Parser_PRS_simple_statement(undefined,0,NULL);
            ;
                }
              //when "punc":
                else if (__is(_case6,any_LTR("punc"))){
                    
                //case PRS.token.value
                var _case7=PROP(value_,Parser_PRS_token);
                  //when "{":
                    if (__is(_case7,any_LTR("{"))){
                        
                    //return new AST.BlockStatement({
                        //start : PRS.token,
                        //body  : PRS.block_(),
                        //endpos   : PRS.getPrev()
                    return new(AST_BlockStatement,1,(any_arr){new(Map,3,(any_arr){
                        _newPair("start",Parser_PRS_token), 
                        _newPair("body",Parser_PRS_block_(undefined,0,NULL)), 
                        _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                    })
                   });
                ;
                    }
                  //when "[","(":
                    else if (__is(_case7,any_LTR("["))||__is(_case7,any_LTR("("))){
                        
                    //return PRS.simple_statement();
                    return Parser_PRS_simple_statement(undefined,0,NULL);
                ;
                    }
                  //when ";":
                    else if (__is(_case7,any_LTR(";"))){
                        
                    //PRS.next();
                    Parser_PRS_next(undefined,0,NULL);
                    //return new AST.EmptyStatement();
                    return new(AST_EmptyStatement,0,NULL);
                ;
                    }
                else {

                  //else
                    //PRS.unexpected();
                    Parser_PRS_unexpected(undefined,0,NULL);
                };

                //end case punc
                
            ;
                }
              //when "keyword":
                else if (__is(_case6,any_LTR("keyword"))){
                    
                //tmp = PRS.token.value
                tmp = PROP(value_,Parser_PRS_token);
                //PRS.next()
                Parser_PRS_next(undefined,0,NULL);
                //case tmp
                var _case8=tmp;
                  //when "break":
                    if (__is(_case8,any_LTR("break"))){
                        
                    //return PRS.break_cont(AST.BreakStatement);
                    return Parser_PRS_break_cont(undefined,1,(any_arr){AST_BreakStatement
                   });
                ;
                    }
                  //when "continue":
                    else if (__is(_case8,any_LTR("continue"))){
                        
                    //return PRS.break_cont(AST.ContinueStatement);
                    return Parser_PRS_break_cont(undefined,1,(any_arr){AST_ContinueStatement
                   });
                ;
                    }
                  //when "debugger":
                    else if (__is(_case8,any_LTR("debugger"))){
                        
                    //PRS.semicolon();
                    Parser_PRS_semicolon(undefined,0,NULL);
                    //return new AST.Debugger();
                    return new(AST_Debugger,0,NULL);
                ;
                    }
                  //when "do":
                    else if (__is(_case8,any_LTR("do"))){
                        

                    //var theBody = PRS.in_loop_call(PRS.statement)
                    var theBody = Parser_PRS_in_loop_call(undefined,1,(any_arr){any_func(Parser_PRS_statement)
                   })
                   ;

                    //PRS.expect_token("keyword", "while") 
                    Parser_PRS_expect_token(undefined,2,(any_arr){any_LTR("keyword")
                       , any_LTR("while")
                   });
                    //var cond = PRS.parenthesised() 
                    var cond = Parser_PRS_parenthesised(undefined,0,NULL)
                   ;
                    //PRS.semicolon()
                    Parser_PRS_semicolon(undefined,0,NULL);

                    //return new AST.DoStatement({
                        //body      : theBody
                        //condition : cond
                    return new(AST_DoStatement,1,(any_arr){new(Map,2,(any_arr){
                        _newPair("body",theBody), 
                        _newPair("condition",cond)
                    })
                   });
                ;
                    }
                  //when "while":
                    else if (__is(_case8,any_LTR("while"))){
                        
                    //return new AST.WhileStatement({
                        //condition : PRS.parenthesised(),
                        //body      : PRS.in_loop_call(PRS.statement)
                    return new(AST_WhileStatement,1,(any_arr){new(Map,2,(any_arr){
                        _newPair("condition",Parser_PRS_parenthesised(undefined,0,NULL)), 
                        _newPair("body",Parser_PRS_in_loop_call(undefined,1,(any_arr){any_func(Parser_PRS_statement)
                       }))
                    })
                   });
                ;
                    }
                  //when "for":
                    else if (__is(_case8,any_LTR("for"))){
                        
                    //return PRS.for_();
                    return Parser_PRS_for_(undefined,0,NULL);
                ;
                    }
                  //when "function":
                    else if (__is(_case8,any_LTR("function"))){
                        
                    //return PRS.function_(AST.Defun);
                    return Parser_PRS_function_(undefined,1,(any_arr){AST_Defun
                   });
                ;
                    }
                  //when "if":
                    else if (__is(_case8,any_LTR("if"))){
                        
                    //return PRS.if_();
                    return Parser_PRS_if_(undefined,0,NULL);
                ;
                    }
                  //when "return":
                    else if (__is(_case8,any_LTR("return"))){
                        

                    //if PRS.in_function  is  0
                    if (__is(Parser_PRS_in_function,any_number(0)))  {
                        //PRS.croak("'return' outside of method");
                        Parser_PRS_croak(undefined,1,(any_arr){any_LTR("'return' outside of method")
                       });
                    };

                    //var value=null;
                    var value = null
                   ;
                    //if PRS.isToken("punc", ";")
                    if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
                       , any_LTR(";")
                   })))  {
                        //PRS.next
                        Parser_PRS_next(undefined,0,NULL);
                    }
                    //else if PRS.can_insert_semicolon()
                    
                    else if (_anyToBool(Parser_PRS_can_insert_semicolon(undefined,0,NULL)))  {
                        //do nothing
                        //do nothing
                        ;
                    }
                    //else
                    
                    else {
                        //value = PRS.expression(true)
                        value = Parser_PRS_expression(undefined,1,(any_arr){true
                       });
                        //PRS.semicolon()
                        Parser_PRS_semicolon(undefined,0,NULL);
                    };

                    //return new AST.ReturnStatement({
                        //value: value
                    return new(AST_ReturnStatement,1,(any_arr){new(Map,1,(any_arr){
                        _newPair("value",value)
                    })
                   });
                ;
                    }
                  //when "switch":
                    else if (__is(_case8,any_LTR("switch"))){
                        
                    //return new AST.Switch({
                        //expression : PRS.parenthesised(),
                        //body       : PRS.in_loop_call(PRS.switch_body_)
                    return new(AST_Switch,1,(any_arr){new(Map,2,(any_arr){
                        _newPair("expression",Parser_PRS_parenthesised(undefined,0,NULL)), 
                        _newPair("body",Parser_PRS_in_loop_call(undefined,1,(any_arr){any_func(Parser_PRS_switch_body_)
                       }))
                    })
                   });
                ;
                    }
                  //when "throw":
                    else if (__is(_case8,any_LTR("throw"))){
                        
                    //if (PRS.token.nlb)
                    if ((_anyToBool(PROP(nlb_,Parser_PRS_token))))  {
                        //PRS.croak("Illegal newline after 'throw'");
                        Parser_PRS_croak(undefined,1,(any_arr){any_LTR("Illegal newline after 'throw'")
                       });
                    };

                    //tmp = PRS.expression(true) 
                    tmp = Parser_PRS_expression(undefined,1,(any_arr){true
                   });
                    //PRS.semicolon()
                    Parser_PRS_semicolon(undefined,0,NULL);

                    //return new AST.ThrowStatement({
                        //value: tmp
                    return new(AST_ThrowStatement,1,(any_arr){new(Map,1,(any_arr){
                        _newPair("value",tmp)
                    })
                   });
                ;
                    }
                  //when "try":
                    else if (__is(_case8,any_LTR("try"))){
                        
                    //return PRS.try_();
                    return Parser_PRS_try_(undefined,0,NULL);
                ;
                    }
                  //when "var":
                    else if (__is(_case8,any_LTR("var"))){
                        
                    //tmp = PRS.var_()
                    tmp = Parser_PRS_var_(undefined,0,NULL);
                    //PRS.semicolon()
                    Parser_PRS_semicolon(undefined,0,NULL);
                    //return tmp
                    return tmp;
                ;
                    }
                  //when "const":
                    else if (__is(_case8,any_LTR("const"))){
                        
                    //tmp = PRS.const_()
                    tmp = Parser_PRS_const_(undefined,0,NULL);
                    //PRS.semicolon()
                    Parser_PRS_semicolon(undefined,0,NULL);
                    //return tmp;
                    return tmp;
                ;
                    }
                  //when "with":
                    else if (__is(_case8,any_LTR("with"))){
                        
                    //return new AST.WithStatement({
                        //expression : PRS.parenthesised(),
                        //body       : PRS.statement()
                    return new(AST_WithStatement,1,(any_arr){new(Map,2,(any_arr){
                        _newPair("expression",Parser_PRS_parenthesised(undefined,0,NULL)), 
                        _newPair("body",Parser_PRS_statement(undefined,0,NULL))
                    })
                   });
                ;
                    }
                else {
                    //});

                  //else
                    //PRS.unexpected();
                    Parser_PRS_unexpected(undefined,0,NULL);
                };
            ;
                };
        return undefined;
        }

        //end statement_parser


        //method labeled_statement() 
        any Parser_PRS_labeled_statement(DEFAULT_ARGUMENTS){
            //var label = PRS.as_symbol(AST.Label);
            var label = Parser_PRS_as_symbol(undefined,1,(any_arr){AST_Label
           })
           ;

            //var found
            var found = undefined
           ;
            //for each lab:AST.Label in PRS.labels
            {
            var iter=_newIterPos(); int __inx=0;
            for(int __inx=0; ITER_NEXT(Parser_PRS_labels,iter); __inx++ ){
              var lab=PROP(value_,iter), lab__name=PROP(key_,iter), lab__inx=any_number(__inx);
            
                //if lab.name is label.name
                if (__is(PROP(name_,lab),PROP(name_,label)))  {
                    //found = lab
                    found = lab;
                    //break
                    break;
                };
            }};// end for each loop

            //if found 
            if (_anyToBool(found))  {
                // ECMA-262, 12.12: An ECMAScript program is considered
                // syntactically incorrect if it contains a
                // LabelledStatement that is enclosed by a
                // LabelledStatement with the same Identifier as label.
                //PRS.croak("Label #{label.name} defined twice");
                Parser_PRS_croak(undefined,1,(any_arr){_concatAny(3,any_LTR("Label ")
                   , PROP(name_,label)
                   , any_LTR(" defined twice")
               )
               });
            };


            //PRS.expect(":");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR(":")
           });
            //PRS.labels.push(label);
            __call(push_,Parser_PRS_labels,1,(any_arr){label
           });
            //var stat = PRS.statement();
            var stat = Parser_PRS_statement(undefined,0,NULL)
           ;
            //PRS.labels.pop();
            __call(pop_,Parser_PRS_labels,0,NULL);
            //if stat isnt instanceof AST.IterationStatement 
            if (!(_instanceof(stat,AST_IterationStatement)))  {
                // check for `continue` that refers to this label.
                // those should be reported as syntax errors.
                // https://github.com/mishoo/UglifyJS2/issues/287
                //for each contStat:AST.ContinueStatement in label.references
                {
                var iter=_newIterPos(); int __inx=0;
                for(int __inx=0; ITER_NEXT(PROP(references_,label),iter); __inx++ ){
                  var contStat=PROP(value_,iter), contStat__name=PROP(key_,iter), contStat__inx=any_number(__inx);
                  
                    //where contStat instanceof AST.ContinueStatement
                    if(_instanceof(contStat,AST_ContinueStatement)){
                        //var tok = contStat.label.start;
                        var tok = PROP(start_,PROP(label_,contStat))
                       ;
                        //PRS.croak("Continue label `#{label.name}` refers to non-IterationStatement.",
                        Parser_PRS_croak(undefined,4,(any_arr){_concatAny(3,any_LTR("Continue label `")
                           , PROP(name_,label)
                           , any_LTR("` refers to non-IterationStatement.")
                       )
                           , PROP(line_,tok)
                           , PROP(col_,tok)
                           , PROP(pos_,tok)
                       });
                }}};// end for each loop
                
            };
                              //tok.line, tok.col, tok.pos);



            //return new AST.LabeledStatement({ body: stat, label: label });
            return new(AST_LabeledStatement,1,(any_arr){new(Map,2,(any_arr){
            _newPair("body",stat), 
            _newPair("label",label)
            })
           });
        return undefined;
        }


        //method simple_statement(tmp) 
        any Parser_PRS_simple_statement(DEFAULT_ARGUMENTS){
            
            // define named params
            var tmp= argc? arguments[0] : undefined;
            //---------
            //tmp = PRS.expression(true) 
            tmp = Parser_PRS_expression(undefined,1,(any_arr){true
           });
            //PRS.semicolon()
            Parser_PRS_semicolon(undefined,0,NULL);
            //return new AST.SimpleStatement({ body: tmp });
            return new(AST_SimpleStatement,1,(any_arr){new(Map,1,(any_arr){
            _newPair("body",tmp)
            })
           });
        return undefined;
        }


        //method break_cont(type:Function) 
        any Parser_PRS_break_cont(DEFAULT_ARGUMENTS){
            
            // define named params
            var type= argc? arguments[0] : undefined;
            //---------

            //var label = null, found
            var label = null
               , found = undefined
           ;

            //if not PRS.can_insert_semicolon()
            if (!(_anyToBool(Parser_PRS_can_insert_semicolon(undefined,0,NULL))))  {
                //label = PRS.as_symbol(AST.LabelRef, true)
                label = Parser_PRS_as_symbol(undefined,2,(any_arr){AST_LabelRef
                   , true
               });
            };

            //if (label isnt null) 
            if ((!__is(label,null)))  {

                //for each lab:AST.Label in PRS.labels
                {
                var iter=_newIterPos(); int __inx=0;
                for(int __inx=0; ITER_NEXT(Parser_PRS_labels,iter); __inx++ ){
                  var lab=PROP(value_,iter), lab__name=PROP(key_,iter), lab__inx=any_number(__inx);
                
                    //if lab.name is label.name
                    if (__is(PROP(name_,lab),PROP(name_,label)))  {
                        //found = lab
                        found = lab;
                        //break
                        break;
                    };
                }};// end for each loop

                //if not found
                if (!(_anyToBool(found)))  {
                    //PRS.croak("Undefined label #{label.name}");
                    Parser_PRS_croak(undefined,1,(any_arr){_concatAny(2,any_LTR("Undefined label ")
                       , PROP(name_,label)
                   )
                   });
                };

                //label.thedef = found;
                PROP(thedef_,label) = found;
            }

            //else if (PRS.in_loop  is  0)
            
            else if ((__is(Parser_PRS_in_loop,any_number(0))))  {
                //PRS.croak("#{type.name} not inside a loop or switch");
                Parser_PRS_croak(undefined,1,(any_arr){_concatAny(2,PROP(name_,type)
                   , any_LTR(" not inside a loop or switch")
               )
               });
            };

            //PRS.semicolon();
            Parser_PRS_semicolon(undefined,0,NULL);

            //var stat = new type({ label: label });
            var stat = new(type,1,(any_arr){new(Map,1,(any_arr){
            _newPair("label",label)
            })
           })
           ;
            //if found, found.references.push(stat);
            if (_anyToBool(found)) {__call(push_,PROP(references_,found),1,(any_arr){stat
           });};
            //return stat;
            return stat;
        return undefined;
        }


        //method for_() 
        any Parser_PRS_for_(DEFAULT_ARGUMENTS){
            //PRS.expect("(");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR("(")
           });
            //var init:AST.Node = null;
            var init = null
           ;

            //if not PRS.isToken("punc", ";")
            if (!(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(";")
           }))))  {

                //if PRS.isToken("keyword", "var")
                if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("keyword")
                   , any_LTR("var")
               })))  {
                    //PRS.next()
                    Parser_PRS_next(undefined,0,NULL);
                    //init = PRS.var_(true)
                    init = Parser_PRS_var_(undefined,1,(any_arr){true
                   });
                }
                //else
                
                else {
                    //init = PRS.expression(true, true);
                    init = Parser_PRS_expression(undefined,2,(any_arr){true
                       , true
                   });
                };

                //if PRS.isToken("operator", "in")
                if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("operator")
                   , any_LTR("in")
               })))  {
                    //if init instanceof AST.Var 
                    if (_instanceof(init,AST_Var))  {
                        //declare init:AST.Var 
                        
                        //if init.definitions.length>1
                        if (_length(PROP(definitions_,init)) > 1)  {
                            //PRS.croak("Only one variable declaration allowed in for..in loop")
                            Parser_PRS_croak(undefined,1,(any_arr){any_LTR("Only one variable declaration allowed in for..in loop")
                           });
                        };
                    };

                    //PRS.next();
                    Parser_PRS_next(undefined,0,NULL);
                    //return PRS.for_in(init);
                    return Parser_PRS_for_in(undefined,1,(any_arr){init
                   });
                };
            };


            //return PRS.regular_for(init);
            return Parser_PRS_regular_for(undefined,1,(any_arr){init
           });
        return undefined;
        }


        //method regular_for(init) 
        any Parser_PRS_regular_for(DEFAULT_ARGUMENTS){
            
            // define named params
            var init= argc? arguments[0] : undefined;
            //---------
            //PRS.expect(";");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR(";")
           });
            //var test = PRS.isToken("punc", ";") ? null : PRS.expression(true);
            var test = _anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(";")
           })) ? null : Parser_PRS_expression(undefined,1,(any_arr){true
          })
           ;
            //PRS.expect(";");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR(";")
           });
            //var step = PRS.isToken("punc", ")") ? null : PRS.expression(true);
            var step = _anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(")")
           })) ? null : Parser_PRS_expression(undefined,1,(any_arr){true
          })
           ;
            //PRS.expect(")");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR(")")
           });
            //return new AST.ForStatement({
                //init      : init,
                //condition : test,
                //step      : step,
                //body      : PRS.in_loop_call(PRS.statement)
            return new(AST_ForStatement,1,(any_arr){new(Map,4,(any_arr){
                _newPair("init",init), 
                _newPair("condition",test), 
                _newPair("step",step), 
                _newPair("body",Parser_PRS_in_loop_call(undefined,1,(any_arr){any_func(Parser_PRS_statement)
               }))
            })
           });
        return undefined;
        }
            //});


        //method for_in(init:AST.Var) 
        any Parser_PRS_for_in(DEFAULT_ARGUMENTS){
            
            // define named params
            var init= argc? arguments[0] : undefined;
            //---------
            //var lhs = init instanceof AST.Var ? init.definitions[0].name : null;
            var lhs = _instanceof(init,AST_Var) ? PROP(name_,ITEM(0,PROP(definitions_,init))) : null
           ;
            //var obj = PRS.expression(true);
            var obj = Parser_PRS_expression(undefined,1,(any_arr){true
           })
           ;
            //PRS.expect(")");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR(")")
           });
            //return new AST.ForIn({
                //init   : init,
                //name   : lhs,
                //object : obj,
                //body   : PRS.in_loop_call(PRS.statement)
            return new(AST_ForIn,1,(any_arr){new(Map,4,(any_arr){
                _newPair("init",init), 
                _newPair("name",lhs), 
                _newPair("object",obj), 
                _newPair("body",Parser_PRS_in_loop_call(undefined,1,(any_arr){any_func(Parser_PRS_statement)
               }))
            })
           });
        return undefined;
        }
            //});


        //method function_(ctor) 
        any Parser_PRS_function_(DEFAULT_ARGUMENTS){
            
            // define named params
            var ctor= argc? arguments[0] : undefined;
            //---------
            //var in_statement = ctor is AST.Defun;
            var in_statement = any_number(__is(ctor,AST_Defun))
           ;
            //var name = PRS.isToken("name") ? PRS.as_symbol(in_statement ? AST.SymbolDefun : AST.SymbolLambda) : null;
            var name = _anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("name")
           })) ? Parser_PRS_as_symbol(undefined,1,(any_arr){_anyToBool(in_statement) ? AST_SymbolDefun : AST_SymbolLambda
          }) : null
           ;
            //if (in_statement and not name)
            if ((_anyToBool(in_statement) && !(_anyToBool(name))))  {
                //PRS.unexpected();
                Parser_PRS_unexpected(undefined,0,NULL);
            };

            //PRS.expect("(");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR("(")
           });

//arguments

            //var a=[],first=true            
            var a = new(Array,0,NULL)
               , first = true
           ;
            //while not PRS.isToken("punc", ")")
            while(!(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(")")
           })))){
                //if first 
                if (_anyToBool(first))  {
                    //first = false 
                    first = false;
                }
                //else 
                
                else {
                    //PRS.expect(",")
                    Parser_PRS_expect(undefined,1,(any_arr){any_LTR(",")
                   });
                };

                //a.push PRS.as_symbol(AST.SymbolFunarg)
                METHOD(push_,a)(a,1,(any_arr){Parser_PRS_as_symbol(undefined,1,(any_arr){AST_SymbolFunarg
               })
               });
            };// end loop

            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);

//body

            //var 
                //inLoopFlag = PRS.in_loop 
                //labels = PRS.labels
            var inLoopFlag = Parser_PRS_in_loop
               , labels = Parser_PRS_labels
           ;

            //++PRS.in_function;
            ++Parser_PRS_in_function.value.number;
            //PRS.in_directives = true;
            Parser_PRS_in_directives = true;
            //PRS.in_loop = 0;
            Parser_PRS_in_loop = any_number(0);
            //PRS.labels = [];
            Parser_PRS_labels = new(Array,0,NULL);

            //var theBody = PRS.block_();
            var theBody = Parser_PRS_block_(undefined,0,NULL)
           ;

            //--PRS.in_function;
            --Parser_PRS_in_function.value.number;
            //PRS.in_loop = inLoopFlag;
            Parser_PRS_in_loop = inLoopFlag;
            //PRS.labels = labels;
            Parser_PRS_labels = labels;

            //return new ctor({
                //name: name,
                //argnames: a,
                //body: theBody
            return new(ctor,1,(any_arr){new(Map,3,(any_arr){
                _newPair("name",name), 
                _newPair("argnames",a), 
                _newPair("body",theBody)
            })
           });
        return undefined;
        }
            //});


        //method if_() 
        any Parser_PRS_if_(DEFAULT_ARGUMENTS){
            //var cond = PRS.parenthesised(), body = PRS.statement(), belse = null;
            var cond = Parser_PRS_parenthesised(undefined,0,NULL)
               , body = Parser_PRS_statement(undefined,0,NULL)
               , belse = null
           ;
            //if PRS.isToken("keyword", "else")
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("keyword")
               , any_LTR("else")
           })))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //belse = PRS.statement();
                belse = Parser_PRS_statement(undefined,0,NULL);
            };

            //return new AST.IfStatement({
                //condition   : cond,
                //body        : body,
                //alternative : belse
            return new(AST_IfStatement,1,(any_arr){new(Map,3,(any_arr){
                _newPair("condition",cond), 
                _newPair("body",body), 
                _newPair("alternative",belse)
            })
           });
        return undefined;
        }
            //});


        //method block_() 
        any Parser_PRS_block_(DEFAULT_ARGUMENTS){

            //PRS.expect("{");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR("{")
           });
            //var a = [];
            var a = new(Array,0,NULL)
           ;

            //while not PRS.isToken("punc", "}") 
            while(!(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR("}")
           })))){
                //if PRS.isToken("eof"), PRS.unexpected();
                if (_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("eof")
               }))) {Parser_PRS_unexpected(undefined,0,NULL);};
                //a.push PRS.statement()
                METHOD(push_,a)(a,1,(any_arr){Parser_PRS_statement(undefined,0,NULL)
               });
            };// end loop

            //PRS.next()
            Parser_PRS_next(undefined,0,NULL);
            //return a
            return a;
        return undefined;
        }


        //method switch_body_() 
        any Parser_PRS_switch_body_(DEFAULT_ARGUMENTS){

            //PRS.expect("{");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR("{")
           });
            //var a = [], cur:array = null, branch:AST.Token = null, tmp;
            var a = new(Array,0,NULL)
               , cur = null
               , branch = null
               , tmp = undefined
           ;

            //while not PRS.isToken("punc", "}") 
            while(!(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR("}")
           })))){

                //if PRS.isToken("eof"), PRS.unexpected();
                if (_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("eof")
               }))) {Parser_PRS_unexpected(undefined,0,NULL);};

                //if PRS.isToken("keyword", "when")
                if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("keyword")
                   , any_LTR("when")
               })))  {
                    //if branch, branch.endpos = PRS.getPrev();
                    if (_anyToBool(branch)) {PROP(endpos_,branch) = Parser_PRS_getPrev(undefined,0,NULL);};
                    //cur = [];
                    cur = new(Array,0,NULL);
                    //tmp = PRS.token 
                    tmp = Parser_PRS_token;
                    //PRS.next()
                    Parser_PRS_next(undefined,0,NULL);
                    //branch = new AST.Case({
                        //start      : tmp,
                        //expression : PRS.expression(true),
                        //body       : cur
                    branch = new(AST_Case,1,(any_arr){new(Map,3,(any_arr){
                        _newPair("start",tmp), 
                        _newPair("expression",Parser_PRS_expression(undefined,1,(any_arr){true
                       })), 
                        _newPair("body",cur)
                    })
                   });
                    //});
                    //a.push(branch);
                    METHOD(push_,a)(a,1,(any_arr){branch
                   });
                    //PRS.expect(":");
                    Parser_PRS_expect(undefined,1,(any_arr){any_LTR(":")
                   });
                }

                //else if PRS.isToken("keyword", "default")
                
                else if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("keyword")
                   , any_LTR("default")
               })))  {
                    //if branch, branch.endpos = PRS.getPrev();
                    if (_anyToBool(branch)) {PROP(endpos_,branch) = Parser_PRS_getPrev(undefined,0,NULL);};
                    //cur = [];
                    cur = new(Array,0,NULL);
                    //tmp = PRS.token 
                    tmp = Parser_PRS_token;
                    //PRS.next() 
                    Parser_PRS_next(undefined,0,NULL);
                    //PRS.expect(":")
                    Parser_PRS_expect(undefined,1,(any_arr){any_LTR(":")
                   });
                    //branch = new AST.Default({
                        //start : tmp,
                        //body  : cur
                    branch = new(AST_Default,1,(any_arr){new(Map,2,(any_arr){
                        _newPair("start",tmp), 
                        _newPair("body",cur)
                    })
                   });
                    //});
                    //a.push(branch);
                    METHOD(push_,a)(a,1,(any_arr){branch
                   });
                }

                //else 
                
                else {
                    //if not cur, PRS.unexpected()
                    if (!(_anyToBool(cur))) {Parser_PRS_unexpected(undefined,0,NULL);};
                    //cur.push PRS.statement()
                    METHOD(push_,cur)(cur,1,(any_arr){Parser_PRS_statement(undefined,0,NULL)
                   });
                };
            };// end loop


            //if branch, branch.endpos = PRS.getPrev()
            if (_anyToBool(branch)) {PROP(endpos_,branch) = Parser_PRS_getPrev(undefined,0,NULL);};

            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);

            //return a;
            return a;
        return undefined;
        }


        //method try_() 
        any Parser_PRS_try_(DEFAULT_ARGUMENTS){

            //var 
                //body = PRS.block_() 
                //bcatch = null 
                //bfinally = null
                //start
            var body = Parser_PRS_block_(undefined,0,NULL)
               , bcatch = null
               , bfinally = null
               , start = undefined
           ;

            //if PRS.isToken("keyword", "catch")
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("keyword")
               , any_LTR("catch")
           })))  {
                //start = PRS.token
                start = Parser_PRS_token;
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //PRS.expect("(");
                Parser_PRS_expect(undefined,1,(any_arr){any_LTR("(")
               });
                //var name = PRS.as_symbol(AST.SymbolCatch);
                var name = Parser_PRS_as_symbol(undefined,1,(any_arr){AST_SymbolCatch
               })
               ;
                //PRS.expect(")");
                Parser_PRS_expect(undefined,1,(any_arr){any_LTR(")")
               });
                //bcatch = new AST.Catch({
                    //start   : start,
                    //argname : name,
                    //body    : PRS.block_(),
                    //endpos  : PRS.getPrev()
                bcatch = new(AST_Catch,1,(any_arr){new(Map,4,(any_arr){
                    _newPair("start",start), 
                    _newPair("argname",name), 
                    _newPair("body",Parser_PRS_block_(undefined,0,NULL)), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               });
            };
                //});

            //if PRS.isToken("keyword", "finally")
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("keyword")
               , any_LTR("finally")
           })))  {
                //start = PRS.token
                start = Parser_PRS_token;
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //bfinally = new AST.Finally({
                    //start : start,
                    //body  : PRS.block_(),
                    //endpos: PRS.getPrev()
                bfinally = new(AST_Finally,1,(any_arr){new(Map,3,(any_arr){
                    _newPair("start",start), 
                    _newPair("body",Parser_PRS_block_(undefined,0,NULL)), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               });
            };
                //});

            //if no bcatch and no bfinally
            if (!_anyToBool(bcatch) && !_anyToBool(bfinally))  {
                //PRS.croak("Missing catch/finally blocks");
                Parser_PRS_croak(undefined,1,(any_arr){any_LTR("Missing catch/finally blocks")
               });
            };

            //return new AST.Try({
                //body     : body,
                //bcatch   : bcatch,
                //bfinally : bfinally
            return new(AST_Try,1,(any_arr){new(Map,3,(any_arr){
                _newPair("body",body), 
                _newPair("bcatch",bcatch), 
                _newPair("bfinally",bfinally)
            })
           });
        return undefined;
        }
            //});



        //method vardefs(no_in, in_const) 
        any Parser_PRS_vardefs(DEFAULT_ARGUMENTS){
            
            // define named params
            var no_in, in_const;
            no_in=in_const=undefined;
            switch(argc){
              case 2:in_const=arguments[1];
              case 1:no_in=arguments[0];
            }
            //---------
            //var a = [];
            var a = new(Array,0,NULL)
           ;
            //do
            while(TRUE){
                //var start = PRS.token;
                var start = Parser_PRS_token
               ;

                //var name = PRS.as_symbol( in_const? AST.SymbolConst : AST.SymbolVar);
                var name = Parser_PRS_as_symbol(undefined,1,(any_arr){_anyToBool(in_const) ? AST_SymbolConst : AST_SymbolVar
               })
               ;

                //var value = null
                var value = null
               ;
                //if PRS.isToken("operator", "=")
                if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("operator")
                   , any_LTR("=")
               })))  {
                    //PRS.next()
                    Parser_PRS_next(undefined,0,NULL);
                    //value = PRS.expression(false, no_in)
                    value = Parser_PRS_expression(undefined,2,(any_arr){false
                       , no_in
                   });
                };

                //a.push(new AST.VarDef({
                    //start : start,
                    //name  : name,
                    //value : value,
                    //endpos: PRS.getPrev()
                METHOD(push_,a)(a,1,(any_arr){new(AST_VarDef,1,(any_arr){new(Map,4,(any_arr){
                    _newPair("start",start), 
                    _newPair("name",name), 
                    _newPair("value",value), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               })
               });
                //}));

                //if no PRS.isToken("punc", ","), break
                if (!_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
                   , any_LTR(",")
               }))) {break;};
                //PRS.next()
                Parser_PRS_next(undefined,0,NULL);
            };// end loop
            //loop
            //return a;
            return a;
        return undefined;
        }


        //method var_ (no_in)
        any Parser_PRS_var_(DEFAULT_ARGUMENTS){
            
            // define named params
            var no_in= argc? arguments[0] : undefined;
            //---------
            //return new AST.Var({
                //start       : PRS.getPrev(),
                //definitions : PRS.vardefs(no_in, false),
                //endpos      : PRS.getPrev()
            return new(AST_Var,1,(any_arr){new(Map,3,(any_arr){
                _newPair("start",Parser_PRS_getPrev(undefined,0,NULL)), 
                _newPair("definitions",Parser_PRS_vardefs(undefined,2,(any_arr){no_in
                   , false
               })), 
                _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
            })
           });
        return undefined;
        }
            //});


        //method const_
        any Parser_PRS_const_(DEFAULT_ARGUMENTS){
            //return new AST.Const({
                //start       : PRS.getPrev(),
                //definitions : PRS.vardefs(false, true),
                //endpos      : PRS.getPrev()
            return new(AST_Const,1,(any_arr){new(Map,3,(any_arr){
                _newPair("start",Parser_PRS_getPrev(undefined,0,NULL)), 
                _newPair("definitions",Parser_PRS_vardefs(undefined,2,(any_arr){false
                   , true
               })), 
                _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
            })
           });
        return undefined;
        }
            //});


        //method new_ 
        any Parser_PRS_new_(DEFAULT_ARGUMENTS){
            //var start = PRS.token;
            var start = Parser_PRS_token
           ;
            //PRS.expect_token("operator", "new");
            Parser_PRS_expect_token(undefined,2,(any_arr){any_LTR("operator")
               , any_LTR("new")
           });
            //var newexp = PRS.expr_atom(false), args;
            var newexp = Parser_PRS_expr_atom(undefined,1,(any_arr){false
           })
               , args = undefined
           ;
            //if PRS.isToken("punc", "(")
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR("(")
           })))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //args = PRS.expr_list(")");
                args = Parser_PRS_expr_list(undefined,1,(any_arr){any_LTR(")")
               });
            }
            //else 
            
            else {
                //args = [];
                args = new(Array,0,NULL);
            };

            //return PRS.subscripts(new AST.New({
                //start      : start,
                //expression : newexp,
                //args       : args,
                //endpos     : PRS.getPrev()
            return Parser_PRS_subscripts(undefined,2,(any_arr){new(AST_New,1,(any_arr){new(Map,4,(any_arr){
                _newPair("start",start), 
                _newPair("expression",newexp), 
                _newPair("args",args), 
                _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
            })
           })
               , true
           });
        return undefined;
        }
            //}), true);


        //method as_atom_node() 
        any Parser_PRS_as_atom_node(DEFAULT_ARGUMENTS){
            //var tok = PRS.token, ret;
            var tok = Parser_PRS_token
               , ret = undefined
           ;

            //case tok.type
            var _case9=PROP(type_,tok);
              //when "name","keyword":
                if (__is(_case9,any_LTR("name"))||__is(_case9,any_LTR("keyword"))){
                    
                //ret = PRS._make_symbol(AST.SymbolRef);
                ret = Parser_PRS__make_symbol(undefined,1,(any_arr){AST_SymbolRef
               });
            ;
                }
              //when "num":
                else if (__is(_case9,any_LTR("num"))){
                    
                //ret = new AST.NumberLiteral({ start: tok, endpos: tok, value: tok.value });
                ret = new(AST_NumberLiteral,1,(any_arr){new(Map,3,(any_arr){
                _newPair("start",tok), 
                _newPair("endpos",tok), 
                _newPair("value",PROP(value_,tok))
                })
               });
            ;
                }
              //when "string":
                else if (__is(_case9,any_LTR("string"))){
                    
                //ret = new AST.StringLiteral({ start: tok, endpos: tok, value: tok.value });
                ret = new(AST_StringLiteral,1,(any_arr){new(Map,3,(any_arr){
                _newPair("start",tok), 
                _newPair("endpos",tok), 
                _newPair("value",PROP(value_,tok))
                })
               });
            ;
                }
              //when "regexp":
                else if (__is(_case9,any_LTR("regexp"))){
                    
                //ret = new AST.RegExpLiteral({ start: tok, endpos: tok, value: tok.value });
                ret = new(AST_RegExpLiteral,1,(any_arr){new(Map,3,(any_arr){
                _newPair("start",tok), 
                _newPair("endpos",tok), 
                _newPair("value",PROP(value_,tok))
                })
               });
            ;
                }
              //when "atom":
                else if (__is(_case9,any_LTR("atom"))){
                    

                //case tok.value
                var _case10=PROP(value_,tok);
                  //when "false":
                    if (__is(_case10,any_LTR("false"))){
                        
                    //ret = new AST.FalseAtom({ start: tok, endpos: tok });
                    ret = new(AST_FalseAtom,1,(any_arr){new(Map,2,(any_arr){
                    _newPair("start",tok), 
                    _newPair("endpos",tok)
                    })
                   });
                ;
                    }
                  //when "true":
                    else if (__is(_case10,any_LTR("true"))){
                        
                    //ret = new AST.TrueAtom({ start: tok, endpos: tok });
                    ret = new(AST_TrueAtom,1,(any_arr){new(Map,2,(any_arr){
                    _newPair("start",tok), 
                    _newPair("endpos",tok)
                    })
                   });
                ;
                    }
                  //when "null":
                    else if (__is(_case10,any_LTR("null"))){
                        
                    //ret = new AST.NullAtom({ start: tok, endpos: tok });
                    ret = new(AST_NullAtom,1,(any_arr){new(Map,2,(any_arr){
                    _newPair("start",tok), 
                    _newPair("endpos",tok)
                    })
                   });
                ;
                    };
            ;
                };

            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);
            //return ret;
            return ret;
        return undefined;
        }


        //method expr_atom(allow_calls) 
        any Parser_PRS_expr_atom(DEFAULT_ARGUMENTS){
            
            // define named params
            var allow_calls= argc? arguments[0] : undefined;
            //---------
            //if PRS.isToken("operator", "new")
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("operator")
               , any_LTR("new")
           })))  {
                //return PRS.new_();
                return Parser_PRS_new_(undefined,0,NULL);
            };

            //var start = PRS.token;
            var start = Parser_PRS_token
           ;
            //if PRS.isToken("punc")
            if (_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("punc")
           })))  {

                //case start.value
                var _case11=PROP(value_,start);
                  //when "(":
                    if (__is(_case11,any_LTR("("))){
                        
                    //PRS.next();
                    Parser_PRS_next(undefined,0,NULL);
                    //var ex= PRS.expression(true);
                    var ex = Parser_PRS_expression(undefined,1,(any_arr){true
                   })
                   ;
                    //ex.start = start;
                    PROP(start_,ex) = start;
                    //ex.endpos = PRS.token;
                    PROP(endpos_,ex) = Parser_PRS_token;
                    //PRS.expect(")");
                    Parser_PRS_expect(undefined,1,(any_arr){any_LTR(")")
                   });
                    //return PRS.subscripts(ex, allow_calls);
                    return Parser_PRS_subscripts(undefined,2,(any_arr){ex
                       , allow_calls
                   });
                ;
                    }
                  //when "[":
                    else if (__is(_case11,any_LTR("["))){
                        
                    //return PRS.subscripts(PRS.array_(), allow_calls);
                    return Parser_PRS_subscripts(undefined,2,(any_arr){Parser_PRS_array_(undefined,0,NULL)
                       , allow_calls
                   });
                ;
                    }
                  //when "{":
                    else if (__is(_case11,any_LTR("{"))){
                        
                    //return PRS.subscripts(PRS.object_(), allow_calls);
                    return Parser_PRS_subscripts(undefined,2,(any_arr){Parser_PRS_object_(undefined,0,NULL)
                       , allow_calls
                   });
                ;
                    };

                //PRS.unexpected();
                Parser_PRS_unexpected(undefined,0,NULL);
            };

            //if PRS.isToken("keyword", "function")
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("keyword")
               , any_LTR("function")
           })))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //var func:AST.FunctionExpression = PRS.function_(AST.FunctionExpression);
                var func = Parser_PRS_function_(undefined,1,(any_arr){AST_FunctionExpression
               })
               ;
                //func.start = start;
                PROP(start_,func) = start;
                //func.endpos = PRS.getPrev();
                PROP(endpos_,func) = Parser_PRS_getPrev(undefined,0,NULL);
                //return PRS.subscripts(func, allow_calls);
                return Parser_PRS_subscripts(undefined,2,(any_arr){func
                   , allow_calls
               });
            };

            //if "|#{PRS.token.type}|" in ATOMIC_START_TOKEN
            if (CALL1(indexOf_,Parser_ATOMIC_START_TOKEN,_concatAny(3,any_LTR("|")
               , PROP(type_,Parser_PRS_token)
               , any_LTR("|")
           )).value.number>=0)  {
                //return PRS.subscripts(PRS.as_atom_node(), allow_calls);
                return Parser_PRS_subscripts(undefined,2,(any_arr){Parser_PRS_as_atom_node(undefined,0,NULL)
                   , allow_calls
               });
            };

            //PRS.unexpected()
            Parser_PRS_unexpected(undefined,0,NULL);
        return undefined;
        }



        //method expr_list(closing, allow_trailing_comma, allow_empty) 
        any Parser_PRS_expr_list(DEFAULT_ARGUMENTS){
            
            // define named params
            var closing, allow_trailing_comma, allow_empty;
            closing=allow_trailing_comma=allow_empty=undefined;
            switch(argc){
              case 3:allow_empty=arguments[2];
              case 2:allow_trailing_comma=arguments[1];
              case 1:closing=arguments[0];
            }
            //---------
            //var first = true, a = [];
            var first = true
               , a = new(Array,0,NULL)
           ;

            //do while not PRS.isToken("punc", closing)
            while(!(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , closing
           })))){

                //if first 
                if (_anyToBool(first))  {
                    //first = false 
                    first = false;
                }
                //else 
                
                else {
                    //PRS.expect(",")
                    Parser_PRS_expect(undefined,1,(any_arr){any_LTR(",")
                   });
                };

                //if allow_trailing_comma and PRS.isToken("punc", closing), break
                if (_anyToBool(allow_trailing_comma) && _anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
                   , closing
               }))) {break;};

                //if PRS.isToken("punc", ",") and allow_empty
                if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
                   , any_LTR(",")
               })) && _anyToBool(allow_empty))  {
                    //a.push(new AST.Hole({ start: PRS.token, endpos: PRS.token }));
                    METHOD(push_,a)(a,1,(any_arr){new(AST_Hole,1,(any_arr){new(Map,2,(any_arr){
                    _newPair("start",Parser_PRS_token), 
                    _newPair("endpos",Parser_PRS_token)
                    })
                   })
                   });
                }

                //else 
                
                else {
                    //a.push(PRS.expression(false))
                    METHOD(push_,a)(a,1,(any_arr){Parser_PRS_expression(undefined,1,(any_arr){false
                   })
                   });
                };
            };// end loop

            //loop        

            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);
            //return a;
            return a;
        return undefined;
        }


        //method array_
        any Parser_PRS_array_(DEFAULT_ARGUMENTS){
            //return PRS.embed_tokens(PRS.array_parser)
            return Parser_PRS_embed_tokens(undefined,1,(any_arr){any_func(Parser_PRS_array_parser)
           });
        return undefined;
        }

        //method array_parser 
        any Parser_PRS_array_parser(DEFAULT_ARGUMENTS){
            //PRS.expect("[");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR("[")
           });
            //return new AST.ArrayLiteral({
                //elements: PRS.expr_list("]", not PRS.options.strict, true)
            return new(AST_ArrayLiteral,1,(any_arr){new(Map,1,(any_arr){
                _newPair("elements",Parser_PRS_expr_list(undefined,3,(any_arr){any_LTR("]")
                   , any_number(!(_anyToBool(PROP(strict_,Parser_PRS_options))))
                   , true
               }))
            })
           });
        return undefined;
        }
            //});


        //method object_ 
        any Parser_PRS_object_(DEFAULT_ARGUMENTS){
            //return PRS.embed_tokens(PRS.object_parser)
            return Parser_PRS_embed_tokens(undefined,1,(any_arr){any_func(Parser_PRS_object_parser)
           });
        return undefined;
        }

        //method object_parser
        any Parser_PRS_object_parser(DEFAULT_ARGUMENTS){
            //PRS.expect("{");
            Parser_PRS_expect(undefined,1,(any_arr){any_LTR("{")
           });
            //var first = true, a = [];
            var first = true
               , a = new(Array,0,NULL)
           ;

            //do while not PRS.isToken("punc", "}")
            while(!(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR("}")
           })))){

                //if (first) 
                if ((_anyToBool(first)))  {
                    //first = false 
                    first = false;
                }
                //else 
                
                else {
                    //PRS.expect(",")
                    Parser_PRS_expect(undefined,1,(any_arr){any_LTR(",")
                   });
                };

                //if not PRS.options.strict and PRS.isToken("punc", "}")
                if (!(_anyToBool(PROP(strict_,Parser_PRS_options))) && _anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
                   , any_LTR("}")
               })))  {
                    // allow trailing comma
                    //break;
                    break;
                };

                //var start = PRS.token;
                var start = Parser_PRS_token
               ;
                //var type = start.type;
                var type = PROP(type_,start)
               ;
                //var name = PRS.as_property_name();
                var name = Parser_PRS_as_property_name(undefined,0,NULL)
               ;

                //if type is "name" and not PRS.isToken("punc", ":")
                if (__is(type,any_LTR("name")) && !(_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
                   , any_LTR(":")
               }))))  {
                    //if name  is "get"
                    if (__is(name,any_LTR("get")))  {
                        //a.push(new AST.ObjectGetter({
                            //start : start,
                            //key   : PRS.as_atom_node(),
                            //value : PRS.function_(AST.Accessor),
                            //endpos: PRS.getPrev()
                        METHOD(push_,a)(a,1,(any_arr){new(AST_ObjectGetter,1,(any_arr){new(Map,4,(any_arr){
                            _newPair("start",start), 
                            _newPair("key",Parser_PRS_as_atom_node(undefined,0,NULL)), 
                            _newPair("value",Parser_PRS_function_(undefined,1,(any_arr){AST_Accessor
                           })), 
                            _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                        })
                       })
                       });
                        //}));
                        //continue;
                        continue;
                    };

                    //if name is "set"
                    if (__is(name,any_LTR("set")))  {
                        //a.push(new AST.ObjectSetter({
                            //start : start,
                            //key   : PRS.as_atom_node(),
                            //value : PRS.function_(AST.Accessor),
                            //endpos: PRS.getPrev()
                        METHOD(push_,a)(a,1,(any_arr){new(AST_ObjectSetter,1,(any_arr){new(Map,4,(any_arr){
                            _newPair("start",start), 
                            _newPair("key",Parser_PRS_as_atom_node(undefined,0,NULL)), 
                            _newPair("value",Parser_PRS_function_(undefined,1,(any_arr){AST_Accessor
                           })), 
                            _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                        })
                       })
                       });
                        //}));
                        //continue;
                        continue;
                    };
                };


                //PRS.expect(":");
                Parser_PRS_expect(undefined,1,(any_arr){any_LTR(":")
               });
                //a.push(new AST.ObjectKeyVal({
                    //start : start,
                    //key   : name,
                    //value : PRS.expression(false),
                    //endpos: PRS.getPrev()
                METHOD(push_,a)(a,1,(any_arr){new(AST_ObjectKeyVal,1,(any_arr){new(Map,4,(any_arr){
                    _newPair("start",start), 
                    _newPair("key",name), 
                    _newPair("value",Parser_PRS_expression(undefined,1,(any_arr){false
                   })), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               })
               });
            };// end loop
                //}));

            //loop

            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);
            //return new AST.ObjectLiteral({ props: a })
            return new(AST_ObjectLiteral,1,(any_arr){new(Map,1,(any_arr){
            _newPair("props",a)
            })
           });
        return undefined;
        }


        //method as_property_name() 
        any Parser_PRS_as_property_name(DEFAULT_ARGUMENTS){
            //var tmp = PRS.token;
            var tmp = Parser_PRS_token
           ;
            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);
            //case tmp.type
            var _case12=PROP(type_,tmp);
              //when 
                if (__is(_case12,any_LTR("num"))||__is(_case12,any_LTR("string"))||__is(_case12,any_LTR("name"))||__is(_case12,any_LTR("operator"))||__is(_case12,any_LTR("keyword"))||__is(_case12,any_LTR("atom"))){
                    
                //"num",
                //"string"
                //"name"
                //"operator"
                //"keyword"
                //"atom":
                    //return tmp.value;
                    return PROP(value_,tmp);
            ;
                }
            else {

              //else
                //PRS.unexpected();
                Parser_PRS_unexpected(undefined,0,NULL);
            };
        return undefined;
        }



        //method as_name() 
        any Parser_PRS_as_name(DEFAULT_ARGUMENTS){
            //var tmp = PRS.token;
            var tmp = Parser_PRS_token
           ;
            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);
            //case tmp.type
            var _case13=PROP(type_,tmp);
              //when "name", "operator", "keyword", "atom":
                if (__is(_case13,any_LTR("name"))||__is(_case13,any_LTR("operator"))||__is(_case13,any_LTR("keyword"))||__is(_case13,any_LTR("atom"))){
                    
                    //return tmp.value;
                    return PROP(value_,tmp);
            ;
                }
            else {
              //else
                //PRS.unexpected()
                Parser_PRS_unexpected(undefined,0,NULL);
            };
        return undefined;
        }

        //method _make_symbol(typeClass) 
        any Parser_PRS__make_symbol(DEFAULT_ARGUMENTS){
            
            // define named params
            var typeClass= argc? arguments[0] : undefined;
            //---------
            //var name = PRS.token.value;
            var name = PROP(value_,Parser_PRS_token)
           ;
            //typeClass = name  is  "this" ? AST.This : typeClass;
            typeClass = __is(name,any_LTR("this")) ? AST_This : typeClass;
            //return new typeClass({
                //name  : name.toString(),
                //start : PRS.token,
                //endpos: PRS.token
            return new(typeClass,1,(any_arr){new(Map,3,(any_arr){
                _newPair("name",METHOD(toString_,name)(name,0,NULL)), 
                _newPair("start",Parser_PRS_token), 
                _newPair("endpos",Parser_PRS_token)
            })
           });
        return undefined;
        }
            //});


        //method as_symbol(type, noerror) 
        any Parser_PRS_as_symbol(DEFAULT_ARGUMENTS){
            
            // define named params
            var type, noerror;
            type=noerror=undefined;
            switch(argc){
              case 2:noerror=arguments[1];
              case 1:type=arguments[0];
            }
            //---------
            //if not PRS.isToken("name")
            if (!(_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("name")
           }))))  {
                //if not noerror, PRS.croak("Name expected");
                if (!(_anyToBool(noerror))) {Parser_PRS_croak(undefined,1,(any_arr){any_LTR("Name expected")
               });};
                //return null
                return null;
            };

            //var sym = PRS._make_symbol(type);
            var sym = Parser_PRS__make_symbol(undefined,1,(any_arr){type
           })
           ;
            //PRS.next();
            Parser_PRS_next(undefined,0,NULL);
            //return sym;
            return sym;
        return undefined;
        }


        //method subscripts(expr:AST.Node, allow_calls) 
        any Parser_PRS_subscripts(DEFAULT_ARGUMENTS){
            
            // define named params
            var expr, allow_calls;
            expr=allow_calls=undefined;
            switch(argc){
              case 2:allow_calls=arguments[1];
              case 1:expr=arguments[0];
            }
            //---------
            //var start = expr.start;
            var start = PROP(start_,expr)
           ;
            //if (PRS.isToken("punc", ".")) 
            if ((_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(".")
           }))))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //return PRS.subscripts(new AST.Dot({
                    //start      : start,
                    //expression : expr,
                    //prop       : PRS.as_name(),
                    //endpos     : PRS.getPrev()
                return Parser_PRS_subscripts(undefined,2,(any_arr){new(AST_Dot,1,(any_arr){new(Map,4,(any_arr){
                    _newPair("start",start), 
                    _newPair("expression",expr), 
                    _newPair("prop",Parser_PRS_as_name(undefined,0,NULL)), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               })
                   , allow_calls
               });
            };
                //}), allow_calls);

            //if (PRS.isToken("punc", "[")) 
            if ((_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR("[")
           }))))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //var prop = PRS.expression(true);
                var prop = Parser_PRS_expression(undefined,1,(any_arr){true
               })
               ;
                //PRS.expect("]");
                Parser_PRS_expect(undefined,1,(any_arr){any_LTR("]")
               });
                //return PRS.subscripts(new AST.Sub({
                    //start      : start,
                    //expression : expr,
                    //prop       : prop,
                    //endpos     : PRS.getPrev()
                return Parser_PRS_subscripts(undefined,2,(any_arr){new(AST_Sub,1,(any_arr){new(Map,4,(any_arr){
                    _newPair("start",start), 
                    _newPair("expression",expr), 
                    _newPair("prop",prop), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               })
                   , allow_calls
               });
            };
                //}), allow_calls);

            //if (allow_calls and PRS.isToken("punc", "(")) 
            if ((_anyToBool(allow_calls) && _anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR("(")
           }))))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //return PRS.subscripts(new AST.CallStatement({
                    //start      : start,
                    //expression : expr,
                    //args       : PRS.expr_list(")"),
                    //endpos     : PRS.getPrev()
                return Parser_PRS_subscripts(undefined,2,(any_arr){new(AST_CallStatement,1,(any_arr){new(Map,4,(any_arr){
                    _newPair("start",start), 
                    _newPair("expression",expr), 
                    _newPair("args",Parser_PRS_expr_list(undefined,1,(any_arr){any_LTR(")")
                   })), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               })
                   , true
               });
            };
                //}), true);

            //return expr
            return expr;
        return undefined;
        }


        //method maybe_unary(allow_calls) 
        any Parser_PRS_maybe_unary(DEFAULT_ARGUMENTS){
            
            // define named params
            var allow_calls= argc? arguments[0] : undefined;
            //---------
            //var start = PRS.token;
            var start = Parser_PRS_token
           ;
            //if PRS.isToken("operator") and Utils.isPredicate(UNARY_PREFIX,start.value) 
            if (_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("operator")
           })) && _anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_UNARY_PREFIX
              , PROP(value_,start)
          })))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //PRS.handle_regexp();
                Parser_PRS_handle_regexp(undefined,0,NULL);
                //var ex:AST.Node = PRS.make_unary(AST.UnaryPrefix, start.value, PRS.maybe_unary(allow_calls));
                var ex = Parser_PRS_make_unary(undefined,3,(any_arr){AST_UnaryPrefix
                   , PROP(value_,start)
                   , Parser_PRS_maybe_unary(undefined,1,(any_arr){allow_calls
                  })
               })
               ;
                //ex.start = start;
                PROP(start_,ex) = start;
                //ex.endpos = PRS.getPrev();
                PROP(endpos_,ex) = Parser_PRS_getPrev(undefined,0,NULL);
                //return ex;
                return ex;
            };

            //var val:AST.Node = PRS.expr_atom(allow_calls);
            var val = Parser_PRS_expr_atom(undefined,1,(any_arr){allow_calls
           })
           ;

            //while PRS.isToken("operator") 
            while(_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("operator")
           })) && _anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_UNARY_POSTFIX
              , PROP(value_,Parser_PRS_token)
          })) && !(_anyToBool(PROP(nlb_,Parser_PRS_token)))){
                    //and Utils.isPredicate(UNARY_POSTFIX,PRS.token.value) 
                    //and not PRS.token.nlb

                //val = PRS.make_unary(AST.UnaryPostfix, PRS.token.value, val);
                val = Parser_PRS_make_unary(undefined,3,(any_arr){AST_UnaryPostfix
                   , PROP(value_,Parser_PRS_token)
                   , val
               });
                //val.start = start;
                PROP(start_,val) = start;
                //val.endpos = PRS.token;
                PROP(endpos_,val) = Parser_PRS_token;
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
            };// end loop

            //return val;
            return val;
        return undefined;
        }


        //method make_unary(ctor, op, expr) 
        any Parser_PRS_make_unary(DEFAULT_ARGUMENTS){
            
            // define named params
            var ctor, op, expr;
            ctor=op=expr=undefined;
            switch(argc){
              case 3:expr=arguments[2];
              case 2:op=arguments[1];
              case 1:ctor=arguments[0];
            }
            //---------
            //if ((op  is  "++"  or  op  is  "--") and not PRS.is_assignable(expr))
            var ___or24=undefined;
            if (((_anyToBool((_anyToBool(___or24=any_number(__is(op,any_LTR("++"))))? ___or24 : any_number(__is(op,any_LTR("--")))))) && !(_anyToBool(Parser_PRS_is_assignable(undefined,1,(any_arr){expr
           })))))  {
                //PRS.croak("Invalid use of #{op} operator");
                Parser_PRS_croak(undefined,1,(any_arr){_concatAny(3,any_LTR("Invalid use of ")
                   , op
                   , any_LTR(" operator")
               )
               });
            };
            //return new ctor({ operator: op, expression: expr });
            return new(ctor,1,(any_arr){new(Map,2,(any_arr){
            _newPair("operator",op), 
            _newPair("expression",expr)
            })
           });
        return undefined;
        }


        //method expr_op(left:AST.Node, min_prec, no_in) 
        any Parser_PRS_expr_op(DEFAULT_ARGUMENTS){
            
            // define named params
            var left, min_prec, no_in;
            left=min_prec=no_in=undefined;
            switch(argc){
              case 3:no_in=arguments[2];
              case 2:min_prec=arguments[1];
              case 1:left=arguments[0];
            }
            //---------

            //var op = PRS.isToken("operator") ? PRS.token.value : null;
            var op = _anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("operator")
           })) ? PROP(value_,Parser_PRS_token) : null
           ;
            //if (op  is  "in" and no_in), op = null;
            if ((__is(op,any_LTR("in")) && _anyToBool(no_in))) {op = null;};
            //var prec = op isnt null ? PRECEDENCE[op] : null;
            var prec = !__is(op,null) ? ITEM(_anyToNumber(op),Parser_PRECEDENCE) : null
           ;

            //if (prec isnt null and prec > min_prec) 
            if ((!__is(prec,null) && _anyToNumber(prec) > _anyToNumber(min_prec)))  {

                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);

                //var right:AST.Node = PRS.expr_op(PRS.maybe_unary(true), prec, no_in);
                var right = Parser_PRS_expr_op(undefined,3,(any_arr){Parser_PRS_maybe_unary(undefined,1,(any_arr){true
               })
                   , prec
                   , no_in
               })
               ;
                //return PRS.expr_op(new AST.Binary({
                    //start    : left.start,
                    //left     : left,
                    //operator : op,
                    //right    : right,
                    //endpos   : right.endpos
                return Parser_PRS_expr_op(undefined,3,(any_arr){new(AST_Binary,1,(any_arr){new(Map,5,(any_arr){
                    _newPair("start",PROP(start_,left)), 
                    _newPair("left",left), 
                    _newPair("operator",op), 
                    _newPair("right",right), 
                    _newPair("endpos",PROP(endpos_,right))
                })
               })
                   , min_prec
                   , no_in
               });
            };
                //}), min_prec, no_in);

            //return left;
            return left;
        return undefined;
        }


        //method expr_ops(no_in) 
        any Parser_PRS_expr_ops(DEFAULT_ARGUMENTS){
            
            // define named params
            var no_in= argc? arguments[0] : undefined;
            //---------
            //return PRS.expr_op(PRS.maybe_unary(true), 0, no_in);
            return Parser_PRS_expr_op(undefined,3,(any_arr){Parser_PRS_maybe_unary(undefined,1,(any_arr){true
           })
               , any_number(0)
               , no_in
           });
        return undefined;
        }


        //method maybe_conditional(no_in) 
        any Parser_PRS_maybe_conditional(DEFAULT_ARGUMENTS){
            
            // define named params
            var no_in= argc? arguments[0] : undefined;
            //---------
            //var start = PRS.token;
            var start = Parser_PRS_token
           ;
            //var expr = PRS.expr_ops(no_in);
            var expr = Parser_PRS_expr_ops(undefined,1,(any_arr){no_in
           })
           ;
            //if PRS.isToken("operator", "?")
            if (_anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("operator")
               , any_LTR("?")
           })))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //var yes = PRS.expression(false);
                var yes = Parser_PRS_expression(undefined,1,(any_arr){false
               })
               ;
                //PRS.expect(":");
                Parser_PRS_expect(undefined,1,(any_arr){any_LTR(":")
               });
                //return new AST.Conditional({
                    //start       : start,
                    //condition   : expr,
                    //consequent  : yes,
                    //alternative : PRS.expression(false, no_in),
                    //endpos      : PRS.getPrev()
                return new(AST_Conditional,1,(any_arr){new(Map,5,(any_arr){
                    _newPair("start",start), 
                    _newPair("condition",expr), 
                    _newPair("consequent",yes), 
                    _newPair("alternative",Parser_PRS_expression(undefined,2,(any_arr){false
                       , no_in
                   })), 
                    _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                })
               });
            };
                //});

            //return expr;
            return expr;
        return undefined;
        }


        //method is_assignable(expr) 
        any Parser_PRS_is_assignable(DEFAULT_ARGUMENTS){
            
            // define named params
            var expr= argc? arguments[0] : undefined;
            //---------
            //if no PRS.options.strict, return true;
            if (!_anyToBool(PROP(strict_,Parser_PRS_options))) {return true;};
            //if expr instanceof AST.This, return false;
            if (_instanceof(expr,AST_This)) {return false;};
            //return (expr instanceof AST.PropAccess  or  expr instanceof AST.Symbol);
            var ___or25=undefined;
            return ((_anyToBool(___or25=any_number(_instanceof(expr,AST_PropAccess)))? ___or25 : any_number(_instanceof(expr,AST_Symbol))));
        return undefined;
        }


        //method maybe_assign(no_in) 
        any Parser_PRS_maybe_assign(DEFAULT_ARGUMENTS){
            
            // define named params
            var no_in= argc? arguments[0] : undefined;
            //---------
            //var start = PRS.token;
            var start = Parser_PRS_token
           ;
            //var left = PRS.maybe_conditional(no_in), val = PRS.token.value;
            var left = Parser_PRS_maybe_conditional(undefined,1,(any_arr){no_in
           })
               , val = PROP(value_,Parser_PRS_token)
           ;
            //if PRS.isToken("operator") and Utils.isPredicate(ASSIGNMENT,val)
            if (_anyToBool(Parser_PRS_isToken(undefined,1,(any_arr){any_LTR("operator")
           })) && _anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_ASSIGNMENT
              , val
          })))  {
                //if PRS.is_assignable(left)
                if (_anyToBool(Parser_PRS_is_assignable(undefined,1,(any_arr){left
               })))  {
                    //PRS.next();
                    Parser_PRS_next(undefined,0,NULL);
                    //return new AST.Assign({
                        //start    : start,
                        //left     : left,
                        //operator : val,
                        //right    : PRS.maybe_assign(no_in),
                        //endpos   : PRS.getPrev()
                    return new(AST_Assign,1,(any_arr){new(Map,5,(any_arr){
                        _newPair("start",start), 
                        _newPair("left",left), 
                        _newPair("operator",val), 
                        _newPair("right",Parser_PRS_maybe_assign(undefined,1,(any_arr){no_in
                       })), 
                        _newPair("endpos",Parser_PRS_getPrev(undefined,0,NULL))
                    })
                   });
                };
                    //});

                //PRS.croak("Invalid assignment");
                Parser_PRS_croak(undefined,1,(any_arr){any_LTR("Invalid assignment")
               });
            };

            //return left;
            return left;
        return undefined;
        }


        //method expression(commas, no_in) returns AST.Seq
        any Parser_PRS_expression(DEFAULT_ARGUMENTS){
            
            // define named params
            var commas, no_in;
            commas=no_in=undefined;
            switch(argc){
              case 2:no_in=arguments[1];
              case 1:commas=arguments[0];
            }
            //---------
            //var start = PRS.token;
            var start = Parser_PRS_token
           ;
            //var expr = PRS.maybe_assign(no_in);
            var expr = Parser_PRS_maybe_assign(undefined,1,(any_arr){no_in
           })
           ;
            //if commas and PRS.isToken("punc", ",")
            if (_anyToBool(commas) && _anyToBool(Parser_PRS_isToken(undefined,2,(any_arr){any_LTR("punc")
               , any_LTR(",")
           })))  {
                //PRS.next();
                Parser_PRS_next(undefined,0,NULL);
                //return new AST.Seq({
                    //start  : start,
                    //car    : expr,
                    //cdr    : PRS.expression(true, no_in),
                    //endpos : PRS.peek()
                return new(AST_Seq,1,(any_arr){new(Map,4,(any_arr){
                    _newPair("start",start), 
                    _newPair("car",expr), 
                    _newPair("cdr",Parser_PRS_expression(undefined,2,(any_arr){true
                       , no_in
                   })), 
                    _newPair("endpos",Parser_PRS_peek(undefined,0,NULL))
                })
               });
            };
                //});

            //return expr;
            return expr;
        return undefined;
        }


        //method in_loop_call(cont_fn:Function) 
        any Parser_PRS_in_loop_call(DEFAULT_ARGUMENTS){
            
            // define named params
            var cont_fn= argc? arguments[0] : undefined;
            //---------
            //++PRS.in_loop;
            ++Parser_PRS_in_loop.value.number;
            //var ret = cont_fn.call(undefined);
            var ret = __apply(cont_fn,undefined,0,NULL)
           ;
            //--PRS.in_loop;
            --Parser_PRS_in_loop.value.number;
            //return ret;
            return ret;
        return undefined;
        }
        
        //------------------
        void Parser_PRS__namespaceInit(void){
            Parser_PRS_token = null;
            Parser_PRS_prev = null;
            Parser_PRS_peeked = null;
            Parser_PRS_in_function = any_number(0);
            Parser_PRS_in_directives = true;
            Parser_PRS_in_loop = any_number(0);
            Parser_PRS_labels = new(Array,0,NULL);
        };
    
    
    any Parser_is_letter(DEFAULT_ARGUMENTS){
        // define named params
        var code= argc? arguments[0] : undefined;
        //---------
            var ___or3=undefined;
            var ___or2=undefined;
        return (_anyToBool(___or3=(_anyToBool(___or2=(any_number(_anyToNumber(code) >= 97 && _anyToNumber(code) <= 122)))? ___or2 : (any_number(_anyToNumber(code) >= 65 && _anyToNumber(code) <= 90))))? ___or3 : (any_number(_anyToNumber(code) >= 0xaa && _anyToBool(PMREX_whileRanges(undefined,2,(any_arr){code
           , Parser_UNICODE_letter
       })))));
    return undefined;
    }
    any Parser_is_digit(DEFAULT_ARGUMENTS){
        // define named params
        var code= argc? arguments[0] : undefined;
        //---------
        return any_number(_anyToNumber(code) >= 48 && _anyToNumber(code) <= 57); //XXX: find out if "UnicodeDigit" means something else than 0..9
    return undefined;
    }
    any Parser_is_alphanumeric_char(DEFAULT_ARGUMENTS){
        // define named params
        var code= argc? arguments[0] : undefined;
        //---------
        var ___or4=undefined;
        return (_anyToBool(___or4=Parser_is_digit(undefined,1,(any_arr){code
       }))? ___or4 : Parser_is_letter(undefined,1,(any_arr){code
      }));
    return undefined;
    }
    any Parser_is_unicode_combining_mark(DEFAULT_ARGUMENTS){
        // define named params
        var ch= argc? arguments[0] : undefined;
        //---------
        if (_anyToBool(PMREX_whileRanges(undefined,2,(any_arr){ch
           , Parser_UNICODE_non_spacing_mark
       }))) {return true;};
        if (_anyToBool(PMREX_whileRanges(undefined,2,(any_arr){ch
           , Parser_UNICODE_space_combining_mark
       }))) {return true;};
    return undefined;
    }
    any Parser_is_unicode_connector_punctuation(DEFAULT_ARGUMENTS){
        // define named params
        var ch= argc? arguments[0] : undefined;
        //---------
        return PMREX_whileRanges(undefined,2,(any_arr){ch
           , Parser_UNICODE_connector_punctuation
       });
    return undefined;
    }
    any Parser_is_identifier(DEFAULT_ARGUMENTS){
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
        if (_anyToNumber(METHOD(charAt_,name)(name,1,(any_arr){any_number(0)
       })) >= '0' && _anyToNumber(METHOD(charAt_,name)(name,1,(any_arr){any_number(0)
      })) <= '9') {return false;};
        var ident = PMREX_whileRanges(undefined,2,(any_arr){name
           , any_LTR("A-Za-z0-9\x7F-\xFF$_")
       })
       ;
        if (!__is(ident,name)) {return false;};
        if (_anyToBool(Utils_isPredicate(undefined,2,(any_arr){Parser_RESERVED_WORDS
           , name
       }))) {return false;};
        return true;
    return undefined;
    }
    any Parser_is_identifier_start(DEFAULT_ARGUMENTS){
        // define named params
        var code= argc? arguments[0] : undefined;
        //---------
        var ___or6=undefined;
        var ___or5=undefined;
        return (_anyToBool(___or6=(_anyToBool(___or5=any_number(__is(code,any_number(36))))? ___or5 : any_number(__is(code,any_number(95)))))? ___or6 : Parser_is_letter(undefined,1,(any_arr){code
       }));
    return undefined;
    }
    any Parser_is_identifier_char(DEFAULT_ARGUMENTS){
        // define named params
        var ch= argc? arguments[0] : undefined;
        //---------
        var code = METHOD(charCodeAt_,ch)(ch,1,(any_arr){any_number(0)
       })
       ;
        var ___or7=undefined;
        if (_anyToBool((_anyToBool(___or7=Parser_is_identifier_start(undefined,1,(any_arr){code
       }))? ___or7 : Parser_is_digit(undefined,1,(any_arr){code
      })))) {return true;};
        if (_anyToNumber(code) < 0xAA) {return false;};
            var ___or10=undefined;
            var ___or9=undefined;
            var ___or8=undefined;
        return (_anyToBool(___or10=(_anyToBool(___or9=(_anyToBool(___or8=any_number(__is(code,any_number(8204))))? ___or8 : any_number(__is(code,any_number(8205)))))? ___or9 : Parser_is_unicode_combining_mark(undefined,1,(any_arr){ch
       })))? ___or10 : Parser_is_unicode_connector_punctuation(undefined,1,(any_arr){ch
      })); // \u200c: zero-width non-joiner <ZWNJ>
    return undefined;
    }
    any Parser_is_identifier_string(DEFAULT_ARGUMENTS){
        // define named params
        var str= argc? arguments[0] : undefined;
        //---------
        return any_number(__is(PMREX_whileRanges(undefined,2,(any_arr){str
           , any_LTR("A-Za-z0-9\x7F-\xFF$_")
       }),str));
    return undefined;
    }
    any Parser_parse_js_number(DEFAULT_ARGUMENTS){
        // define named params
        var num= argc? arguments[0] : undefined;
        //---------
        if (__is(METHOD(slice_,num)(num,2,(any_arr){any_number(0)
           , any_number(2)
       }),any_LTR("0x")))  {
            return parseInt(undefined,2,(any_arr){METHOD(substr_,num)(num,1,(any_arr){any_number(2)
           })
               , any_number(16)
           });
        };
        if (__is(METHOD(slice_,num)(num,2,(any_arr){any_number(0)
           , any_number(1)
       }),any_LTR("0")) && __is(any_number(_length(num)),any_number(4)))  {
            if (__is(PMREX_whileRanges(undefined,2,(any_arr){num
               , any_LTR("0-7")
           }),num))  { // (RE_OCT_NUMBER.test(num))
                return parseInt(undefined,2,(any_arr){METHOD(substr_,num)(num,1,(any_arr){any_number(1)
               })
                   , any_number(8)
               });
            };
        };
        return parseFloat(undefined,1,(any_arr){num
       });
    return undefined;
    }
    any Parser_js_error(DEFAULT_ARGUMENTS){
        // define named params
        var message, filename, line, col, pos;
        message=filename=line=col=pos=undefined;
        switch(argc){
          case 5:pos=arguments[4];
          case 4:col=arguments[3];
          case 3:line=arguments[2];
          case 2:filename=arguments[1];
          case 1:message=arguments[0];
        }
        //---------
        var err = new(Parser_JS_Parse_Error,4,(any_arr){message
           , line
           , col
           , pos
       })
       ;
        console_error(undefined,1,(any_arr){METHOD(toString_,err)(err,0,NULL)
       });
        throw(err);
    return undefined;
    }
    any Parser_is_token(DEFAULT_ARGUMENTS){
        // define named params
        var token, type, val;
        token=type=val=undefined;
        switch(argc){
          case 3:val=arguments[2];
          case 2:type=arguments[1];
          case 1:token=arguments[0];
        }
        //---------
        var ___or11=undefined;
        return any_number(__is(PROP(type_,token),type) && (_anyToBool((_anyToBool(___or11=any_number(!_anyToBool(val)))? ___or11 : any_number(__is(PROP(value_,token),val))))));
    return undefined;
    }
//------------------
void Parser__namespaceInit(void){
        Parser_JS_Parse_Error =_newClass("Parser_JS_Parse_Error", Parser_JS_Parse_Error__init, sizeof(struct Parser_JS_Parse_Error_s), Error);
        _declareMethods(Parser_JS_Parse_Error, Parser_JS_Parse_Error_METHODS);
        _declareProps(Parser_JS_Parse_Error, Parser_JS_Parse_Error_PROPS, sizeof Parser_JS_Parse_Error_PROPS);
    
        Parser_PRSOptions =_newClass("Parser_PRSOptions", Parser_PRSOptions__init, sizeof(struct Parser_PRSOptions_s), Object);
        _declareMethods(Parser_PRSOptions, Parser_PRSOptions_METHODS);
        _declareProps(Parser_PRSOptions, Parser_PRSOptions_PROPS, sizeof Parser_PRSOptions_PROPS);
    
    Parser_KEYWORDS_s = any_LTR("break case catch const continue debugger default delete do else finally for function if in instanceof new return switch throw try typeof var void while with");
    Parser_KEYWORDS_ATOM_s = any_LTR("false null true");
    Parser_RESERVED_WORDS_s = any_LTR("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized this throws transient volatile yield");
    Parser_RESERVED_WORDS_s = _concatAny(5,Parser_RESERVED_WORDS_s
       , any_LTR(" ")
       , Parser_KEYWORDS_ATOM
       , any_LTR(" ")
       , Parser_KEYWORDS
   );    Parser_KEYWORDS_BEFORE_EXPRESSION_s = any_LTR("return new delete throw else case");
    Parser_KEYWORDS = Utils_makePredicate(undefined,1,(any_arr){Parser_KEYWORDS_s
   });
    Parser_RESERVED_WORDS = Utils_makePredicate(undefined,1,(any_arr){Parser_RESERVED_WORDS_s
   });
    Parser_KEYWORDS_BEFORE_EXPRESSION = Utils_makePredicate(undefined,1,(any_arr){Parser_KEYWORDS_BEFORE_EXPRESSION_s
   });
    Parser_KEYWORDS_ATOM = Utils_makePredicate(undefined,1,(any_arr){Parser_KEYWORDS_ATOM_s
   });
    Parser_OPERATOR_CHARS = any_LTR("+-*&%=<>!?|~^");
    Parser_OPERATORS = Utils_makePredicate(undefined,1,(any_arr){new(Array,44,(any_arr){any_LTR("in"), any_LTR("instanceof"), any_LTR("typeof"), any_LTR("new"), any_LTR("void"), any_LTR("delete"), any_LTR("++"), any_LTR("--"), any_LTR("+"), any_LTR("-"), any_LTR("!"), any_LTR("~"), any_LTR("&"), any_LTR("|"), any_LTR("^"), any_LTR("*"), any_LTR("/"), any_LTR("%"), any_LTR(">>"), any_LTR("<<"), any_LTR(">>>"), any_LTR("<"), any_LTR(">"), any_LTR("<="), any_LTR(">="), any_LTR("=="), any_LTR("==="), any_LTR("!="), any_LTR("!=="), any_LTR("?"), any_LTR("="), any_LTR("+="), any_LTR("-="), any_LTR("/="), any_LTR("*="), any_LTR("%="), any_LTR(">>="), any_LTR("<<="), any_LTR(">>>="), any_LTR("|="), any_LTR("^="), any_LTR("&="), any_LTR("&&"), any_LTR("||")})
   });
    Parser_WHITESPACE_CHARS = any_LTR(" \u00a0\n\r\t\f\x0b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000");
    Parser_PUNC_BEFORE_EXPRESSION = any_LTR("[{(,.;:");
    Parser_PUNC_CHARS = any_LTR("[]{}(),;:");
    Parser_REGEXP_MODIFIERS = any_LTR("gmsiy");
    Parser_FOUR_ZEROES = any_LTR("0000");
    Parser_UNICODE__namespaceInit();
    Parser_EX_EOF = new(Map,0,NULL)
;
    Parser_TKZ__namespaceInit();
        Parser_UNARY_PREFIX = Utils_makePredicate(undefined,1,(any_arr){new(Array,9,(any_arr){any_LTR("typeof"), any_LTR("void"), any_LTR("delete"), any_LTR("--"), any_LTR("++"), any_LTR("!"), any_LTR("~"), any_LTR("-"), any_LTR("+")})
   });
    Parser_UNARY_POSTFIX = Utils_makePredicate(undefined,1,(any_arr){new(Array,2,(any_arr){any_LTR("--"), any_LTR("++")})
   });
    Parser_ASSIGNMENT = Utils_makePredicate(undefined,1,(any_arr){new(Array,12,(any_arr){any_LTR("="), any_LTR("+="), any_LTR("-="), any_LTR("/="), any_LTR("*="), any_LTR("%="), any_LTR(">>="), any_LTR("<<="), any_LTR(">>>="), any_LTR("|="), any_LTR("^="), any_LTR("&=")})
   });
    Parser_PRECEDENCE = new(Map,23,(any_arr){
            _newPair("||",any_number(1)), 
            _newPair("&&",any_number(2)), 
            _newPair("|",any_number(3)), 
            _newPair("^",any_number(4)), 
            _newPair("&",any_number(5)), 
            _newPair("==",any_number(6)), 
            _newPair("===",any_number(6)), 
            _newPair("!=",any_number(6)), 
            _newPair("!==",any_number(6)), 
            _newPair("<",any_number(7)), 
            _newPair(">",any_number(7)), 
            _newPair("<=",any_number(7)), 
            _newPair(">=",any_number(7)), 
            _newPair("in",any_number(7)), 
            _newPair("instanceof",any_number(7)), 
            _newPair(">>",any_number(8)), 
            _newPair("<<",any_number(8)), 
            _newPair(">>>",any_number(8)), 
            _newPair("+",any_number(9)), 
            _newPair("-",any_number(9)), 
            _newPair("*",any_number(10)), 
            _newPair("/",any_number(10)), 
            _newPair("%",any_number(10))
            })
;
    Parser_ATOMIC_START_TOKEN = any_LTR("|atom|num|string|regexp|name|");
    Parser_PRS__namespaceInit();
};


//-------------------------
void Parser__moduleInit(void){
    Parser__namespaceInit();
};
