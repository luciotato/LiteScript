#include "SourceMap.h"
//-------------------------
//Module SourceMap
//-------------------------
#include "SourceMap.c.extra"
//-------------------------
//NAMESPACE SourceMap
//-------------------------
    //-----------------------
    // Class SourceMap: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr SourceMap_METHODS = {
      { add_, SourceMap_add },
      { sourceLocation_, SourceMap_sourceLocation },
      { generate_, SourceMap_generate },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t SourceMap_PROPS[] = {
    lines_
    };
    
    //-----------------------
    // Class SourceMap_Location: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr SourceMap_Location_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t SourceMap_Location_PROPS[] = {
    lin_
    , col_
    };
    
    //-----------------------
    // Class SourceMap_LineMap: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr SourceMap_LineMap_METHODS = {
      { add_, SourceMap_LineMap_add },
      { sourceLocation_, SourceMap_LineMap_sourceLocation },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t SourceMap_LineMap_PROPS[] = {
    line_
    , columns_
    };
    
var SourceMap_VLQ_SHIFT, SourceMap_VLQ_CONTINUATION_BIT, SourceMap_VLQ_VALUE_MASK;
any SourceMap_encodeVlq(DEFAULT_ARGUMENTS); //forward declare
var SourceMap_BASE64_CHARS;
any SourceMap_encodeBase64(DEFAULT_ARGUMENTS); //forward declare
    

//--------------
    // SourceMap
    any SourceMap; //Class SourceMap
    
    //auto SourceMap_newFromObject
    inline any SourceMap_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(SourceMap,argc,arguments);
    }
//# LiteScript SourceMap

//Source maps allow JavaScript runtimes to match running JavaScript back to
//the original source code that corresponds to it. This can be minified
//JavaScript, but in our case, we're concerned with mapping pretty-printed
//JavaScript back to CoffeeScript.

//In order to produce maps, we must keep track of positions (line number, column number)
//that originated every node in the syntax tree, and be able to generate a
//[map file](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit)
//— which is a compact, VLQ-encoded representation of the JSON serialization
//of this information — to write out alongside the generated JavaScript.

//This code was translated from CoffeScritp's sourcemap at
//https://github.com/jashkenas/coffee-script/blob/master/src/sourcemap.litcoffee

//### Changes: 
//- added class "Location:{lin,col}"
//- moved support encode functions from class methods to module functions

    //import logger

//### Public Class SourceMap

//Maps locations in a single generated JavaScript file back to locations in
//the original source file.

//This is intentionally agnostic towards how a source map might be represented on
//disk. Once the compiler is ready to produce a "v3"-style source map, we can walk
//through the arrays of line and column buffer to produce it.

      //properties 
          //lines: array
      ;

      //constructor
      void SourceMap__init(DEFAULT_ARGUMENTS){
          //.lines = []
          PROP(lines_,this) = new(Array,0,NULL);
      }

//Adds a mapping to this SourceMap.
//If `options.noReplace` is true, then if there is already a mapping 
//for the specified `line` and `column`, this will have no effect.

      //method add(sourceLine, sourceCol, line, column, noReplace) 
      any SourceMap_add(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,SourceMap));
          //---------
          // define named params
          var sourceLine, sourceCol, line, column, noReplace;
          sourceLine=sourceCol=line=column=noReplace=undefined;
          switch(argc){
            case 5:noReplace=arguments[4];
            case 4:column=arguments[3];
            case 3:line=arguments[2];
            case 2:sourceCol=arguments[1];
            case 1:sourceLine=arguments[0];
          }
          //---------

          //logger.debug "gen #{line},#{column} -> src #{sourceLine},#{sourceCol}"
          logger_debug(undefined,1,(any_arr){_concatAny(8,any_LTR("gen ")
          , line
          , any_LTR(",")
          , column
          , any_LTR(" -> src ")
          , sourceLine
          , any_LTR(",")
          , sourceCol
          )
          });

          //var lineMap = .lines.tryGet(line)
          var lineMap = __call(tryGet_,PROP(lines_,this),1,(any_arr){line
          })
          ;
          //if no lineMap //create
          if (!_anyToBool(lineMap))  { //create
              //lineMap = new LineMap(line) // create
              lineMap = new(SourceMap_LineMap,1,(any_arr){line
              }); // create
              //.lines.set line, lineMap //store at index (extend array if needed)
              __call(set_,PROP(lines_,this),2,(any_arr){line
              , lineMap
              }); //store at index (extend array if needed)
          };

          //lineMap.add column, new Location(sourceLine, sourceCol), noReplace
          METHOD(add_,lineMap)(lineMap,3,(any_arr){column
          , new(SourceMap_Location,2,(any_arr){sourceLine
          , sourceCol
          })
          , noReplace
          });
      return undefined;
      }

      //method sourceLocation(line, column)
      any SourceMap_sourceLocation(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,SourceMap));
          //---------
          // define named params
          var line, column;
          line=column=undefined;
          switch(argc){
            case 2:column=arguments[1];
            case 1:line=arguments[0];
          }
          //---------

//Look up the original position of a given 
//`line` and `column` in the generated code.

//Search for the closest line, when found, return closest column location

          //for lin=line, while lin>=0, lin--
          for(int64_t lin=_anyToNumber(line); lin >= 0; lin--){
              //if .lines[line] into var lineMap, return lineMap.sourceLocation(column)
              var lineMap=undefined;
              if (_anyToBool((lineMap=ITEM(_anyToNumber(line),PROP(lines_,this))))) {return METHOD(sourceLocation_,lineMap)(lineMap,1,(any_arr){column
              });};
          };// end for lin
          
      return undefined;
      }

//V3 SourceMap Generation
//-----------------------

//Builds up a V3 source map, returning the generated JSON as a string.
//`options.sourceRoot` may be used to specify the sourceRoot written to the source
//map.  Also, `options.sourceFiles` and `options.generatedFile` may be passed to
//set "sources" and "file", respectively.

      //method generate(generatedFile:string, sourceFiles:array) 
      any SourceMap_generate(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,SourceMap));
        //---------
        // define named params
        var generatedFile, sourceFiles;
        generatedFile=sourceFiles=undefined;
        switch(argc){
          case 2:sourceFiles=arguments[1];
          case 1:generatedFile=arguments[0];
        }
        //---------

        //default options = 
        //  generatedFile: ''
        //  sourceRoot   : ''
        //  sourceFiles  : ['']
        //  inline: undefined

        //var sourceRoot = ''
        var sourceRoot = any_EMPTY_STR
        ;
        //if no sourceFiles, sourceFiles=['']
        if (!_anyToBool(sourceFiles)) {sourceFiles = new(Array,1,(any_arr){any_EMPTY_STR});};

        //var
          //writingline       = 0
          //lastGenColumn     = 0
          //lastSourceLine    = 0
          //lastSourceColumn  = 0
          //needComma         = false
          //encoded:array     = []
        var writingline = any_number(0)
        , lastGenColumn = any_number(0)
        , lastSourceLine = any_number(0)
        , lastSourceColumn = any_number(0)
        , needComma = false
        , encoded = new(Array,0,NULL)
        ;


        //#for each line in the generated 
        //for each lineInx,lineMap in .lines where lineMap
        any _list21=PROP(lines_,this);
        { var lineMap=undefined;
        for(int lineInx=0 ; lineInx<_list21.value.arr->length ; lineInx++){lineMap=ITEM(lineInx,_list21);
          
        //for each lineInx,lineMap in .lines where lineMap
        if(_anyToBool(lineMap)){

          //for each column,SourceLoc in lineMap.columns where SourceLoc
          any _list22=PROP(columns_,lineMap);
          { var SourceLoc=undefined;
          for(int column=0 ; column<_list22.value.arr->length ; column++){SourceLoc=ITEM(column,_list22);
            
          //for each column,SourceLoc in lineMap.columns where SourceLoc
          if(_anyToBool(SourceLoc)){

            //logger.debug "line:#{lineMap.line} ->", SourceLoc.lin
            logger_debug(undefined,2,(any_arr){_concatAny(3,any_LTR("line:")
            , PROP(line_,lineMap)
            , any_LTR(" ->")
            )
            , PROP(lin_,SourceLoc)
            });
            //logger.debug "column:#{column}", SourceLoc.col
            logger_debug(undefined,2,(any_arr){_concatAny(2,any_LTR("column:")
            , any_number(column)
            )
            , PROP(col_,SourceLoc)
            });
            //logger.debug "writingline #{writingline} lineMap.line #{lineMap.line}"
            logger_debug(undefined,1,(any_arr){_concatAny(4,any_LTR("writingline ")
            , writingline
            , any_LTR(" lineMap.line ")
            , PROP(line_,lineMap)
            )
            });

//advance to LineMap.line

            //if writingline < lineMap.line
            if (_anyToNumber(writingline) < _anyToNumber(PROP(line_,lineMap)))  {
                //lastGenColumn = 0
                lastGenColumn = any_number(0);
                //needComma = false
                needComma = false;
                //while writingline < lineMap.line
                while(_anyToNumber(writingline) < _anyToNumber(PROP(line_,lineMap))){
                    //encoded.push ";"
                    METHOD(push_,encoded)(encoded,1,(any_arr){any_LTR(";")
                    });
                    //writingline++
                    writingline.value.number++;
                };// end loop
                
            };

//Write a comma if we've already written a segment on this line.

            //if needComma
            if (_anyToBool(needComma))  {
              //encoded.push ","
              METHOD(push_,encoded)(encoded,1,(any_arr){any_LTR(",")
              });
              //needComma = false
              needComma = false;
            };

//Write the next segment. Segments can be 1, 4, or 5 values.  If just one, then it
//is a generated column which doesn't match anything in the source code.

//The starting column in the generated source, relative to any previous recorded
//column for the current line:

            //encoded.push encodeVlq(column - lastGenColumn)
            METHOD(push_,encoded)(encoded,1,(any_arr){SourceMap_encodeVlq(undefined,1,(any_arr){any_number(column - _anyToNumber(lastGenColumn))
            })
            });
            //lastGenColumn = column
            lastGenColumn = any_number(column);

//The index into the list of sources:

            //encoded.push encodeVlq(0)
            METHOD(push_,encoded)(encoded,1,(any_arr){SourceMap_encodeVlq(undefined,1,(any_arr){any_number(0)
            })
            });

//The starting line in the original source, relative to the previous source line.

            //encoded.push encodeVlq(SourceLoc.lin - lastSourceLine)
            METHOD(push_,encoded)(encoded,1,(any_arr){SourceMap_encodeVlq(undefined,1,(any_arr){any_number(_anyToNumber(PROP(lin_,SourceLoc)) - _anyToNumber(lastSourceLine))
            })
            });
            //lastSourceLine = SourceLoc.lin
            lastSourceLine = PROP(lin_,SourceLoc);

//The starting column in the original source, relative to the previous column.

            //encoded.push encodeVlq(SourceLoc.col - lastSourceColumn)
            METHOD(push_,encoded)(encoded,1,(any_arr){SourceMap_encodeVlq(undefined,1,(any_arr){any_number(_anyToNumber(PROP(col_,SourceLoc)) - _anyToNumber(lastSourceColumn))
            })
            });
            //lastSourceColumn = SourceLoc.col
            lastSourceColumn = PROP(col_,SourceLoc);
            //needComma = true
            needComma = true;
          }}};// end for each in

          //end for
          
        }}};// end for each in

        //end for
        

//Produce the canonical JSON object format for a "v3" source map.

        //var v3 =
          //version:    3
          //file:       generatedFile
          //sourceRoot: sourceRoot
          //sources:    sourceFiles
          //names:      []
          //mappings:   encoded.join("")
        var v3 = new(Map,6,(any_arr){
          _newPair("version",any_number(3)), 
          _newPair("file",generatedFile), 
          _newPair("sourceRoot",sourceRoot), 
          _newPair("sources",sourceFiles), 
          _newPair("names",new(Array,0,NULL)), 
          _newPair("mappings",METHOD(join_,encoded)(encoded,1,(any_arr){any_EMPTY_STR
          }))
          })

        ;

        //declare valid v3.sourcesContent
        //if options.inline, v3.sourcesContent = [code] 

        //return JSON.stringify(v3, null, 2)
        return JSON_stringify(undefined,3,(any_arr){v3
        , null
        , any_number(2)
        });
      return undefined;
      }
    

//--------------
    // SourceMap_Location
    any SourceMap_Location; //Class SourceMap_Location
    
    //auto SourceMap_Location_newFromObject
    inline any SourceMap_Location_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(SourceMap_Location,argc,arguments);
    }


//## Helper Classes

    //helper class Location
      //properties lin,col
      ;
      //constructor(lin,col)
      void SourceMap_Location__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var lin, col;
        lin=col=undefined;
        switch(argc){
          case 2:col=arguments[1];
          case 1:lin=arguments[0];
        }
        //---------
        //.lin=lin
        PROP(lin_,this) = lin;
        //.col=col
        PROP(col_,this) = col;
      }
    

//--------------
    // SourceMap_LineMap
    any SourceMap_LineMap; //Class SourceMap_LineMap
    
    //auto SourceMap_LineMap_newFromObject
    inline any SourceMap_LineMap_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(SourceMap_LineMap,argc,arguments);
    }

//### LineMap

//A **LineMap** object keeps track of information about original line and column
//positions for a single line of output JavaScript code.
//**SourceMaps** are implemented in terms of **LineMaps**.

    //class LineMap
      //properties 
        //line
        //columns: Location array
      ;

      //constructor(line)
      void SourceMap_LineMap__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var line= argc? arguments[0] : undefined;
        //---------
        //.line = line
        PROP(line_,this) = line;
        //.columns = []
        PROP(columns_,this) = new(Array,0,NULL);
      }

      //method add(column, source:Location, noReplace)
      any SourceMap_LineMap_add(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,SourceMap_LineMap));
        //---------
        // define named params
        var column, source, noReplace;
        column=source=noReplace=undefined;
        switch(argc){
          case 3:noReplace=arguments[2];
          case 2:source=arguments[1];
          case 1:column=arguments[0];
        }
        //---------

        //var colInfo= .columns.tryGet(column)
        var colInfo = __call(tryGet_,PROP(columns_,this),1,(any_arr){column
        })
        ;
        //if colInfo and noReplace, return 
        if (_anyToBool(colInfo) && _anyToBool(noReplace)) {return undefined;};

        //.columns.set column,source
        __call(set_,PROP(columns_,this),2,(any_arr){column
        , source
        });
      return undefined;
      }

      //method sourceLocation(column)
      any SourceMap_LineMap_sourceLocation(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,SourceMap_LineMap));
        //---------
        // define named params
        var column= argc? arguments[0] : undefined;
        //---------

//returns closest source location, for a js column in this line

        //for col=column, while col>=0, col--
        for(int64_t col=_anyToNumber(column); col >= 0; col--){
            //if .columns.tryGet(col) into var foundLocation, return foundLocation
            var foundLocation=undefined;
            if (_anyToBool((foundLocation=__call(tryGet_,PROP(columns_,this),1,(any_arr){any_number(col)
            })))) {return foundLocation;};
        };// end for col
        
      return undefined;
      }
    


//#Helper module functions

//Base64 VLQ Encoding
//-------------------

//Note that SourceMap VLQ encoding is "backwards".  MIDI-style VLQ encoding puts
//the most-significant-bit (MSB) from the original value into the MSB of the VLQ
//encoded value (see [Wikipedia](http://en.wikipedia.org/wiki/File:Uintvar_coding.svg)).
//SourceMap VLQ does things the other way around, with the least significat four
//bits of the original value encoded into the first byte of the VLQ encoded value.

    //var 
      //VLQ_SHIFT            = 5
      //VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT             # 0010 0000
      //VLQ_VALUE_MASK       = VLQ_CONTINUATION_BIT - 1   # 0001 1111

    //helper function encodeVlq(value) 
    any SourceMap_encodeVlq(DEFAULT_ARGUMENTS){
        // define named params
        var value= argc? arguments[0] : undefined;
        //---------

        //var answer = ''
        var answer = any_EMPTY_STR
        ;

        //# Least significant bit represents the sign.
        //var signBit = value < 0 ? 1 else 0
        var signBit = _anyToNumber(value) < 0 ? any_number(1) : any_number(0)
        ;

        //# The next bits are the actual value.
        //var valueToEncode = ( (value<0? -value:value) << 1) + signBit
        var valueToEncode = any_number(((int64_t)(_anyToNumber(value) < 0 ? -_anyToNumber(value) : _anyToNumber(value)) << (int64_t)1) + _anyToNumber(signBit))
        ;

        //# Make sure we encode at least one character, even if valueToEncode is 0.
        //while valueToEncode or no answer
        while(_anyToBool((_anyToBool(__or1=valueToEncode)? __or1 : any_number(!_anyToBool(answer))))){
          //var nextChunk = valueToEncode bitand VLQ_VALUE_MASK
          var nextChunk = any_number((int64_t)_anyToNumber(valueToEncode) & (int64_t)_anyToNumber(SourceMap_VLQ_VALUE_MASK))
          ;
          //valueToEncode = valueToEncode >> VLQ_SHIFT
          valueToEncode = any_number((int64_t)_anyToNumber(valueToEncode) >> (int64_t)_anyToNumber(SourceMap_VLQ_SHIFT));
          //if valueToEncode, nextChunk = nextChunk bitor VLQ_CONTINUATION_BIT 
          if (_anyToBool(valueToEncode)) {nextChunk = any_number((int64_t)_anyToNumber(nextChunk) | (int64_t)_anyToNumber(SourceMap_VLQ_CONTINUATION_BIT));};
          //answer &= encodeBase64(nextChunk)
          answer=_concatAny(2,answer,SourceMap_encodeBase64(undefined,1,(any_arr){nextChunk
          }));
        };// end loop

        //return answer
        return answer;
    return undefined;
    }


//Regular Base64 Encoding
//-----------------------

    //var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    //helper function encodeBase64(value) 
    any SourceMap_encodeBase64(DEFAULT_ARGUMENTS){
      // define named params
      var value= argc? arguments[0] : undefined;
      //---------
      //if no BASE64_CHARS.charAt(value) into var encoded
      var encoded=undefined;
      if (!(_anyToBool((encoded=METHOD(charAt_,SourceMap_BASE64_CHARS)(SourceMap_BASE64_CHARS,1,(any_arr){value
      })))))  {
          //fail with "Cannot Base64 encode value: #{value}"
          throw(new(Error,1,(any_arr){_concatAny(2,any_LTR("Cannot Base64 encode value: ")
          , value
          )}));;
      };
      //return encoded
      return encoded;
    return undefined;
    }
//------------------
void SourceMap__namespaceInit(void){
        SourceMap =_newClass("SourceMap", SourceMap__init, sizeof(struct SourceMap_s), Object);
        _declareMethods(SourceMap, SourceMap_METHODS);
        _declareProps(SourceMap, SourceMap_PROPS, sizeof SourceMap_PROPS);
    
        SourceMap_Location =_newClass("SourceMap_Location", SourceMap_Location__init, sizeof(struct SourceMap_Location_s), Object);
        _declareMethods(SourceMap_Location, SourceMap_Location_METHODS);
        _declareProps(SourceMap_Location, SourceMap_Location_PROPS, sizeof SourceMap_Location_PROPS);
    
        SourceMap_LineMap =_newClass("SourceMap_LineMap", SourceMap_LineMap__init, sizeof(struct SourceMap_LineMap_s), Object);
        _declareMethods(SourceMap_LineMap, SourceMap_LineMap_METHODS);
        _declareProps(SourceMap_LineMap, SourceMap_LineMap_PROPS, sizeof SourceMap_LineMap_PROPS);
    
    SourceMap_VLQ_SHIFT = any_number(5);
    SourceMap_VLQ_CONTINUATION_BIT = any_number((int64_t)1 << (int64_t)_anyToNumber(SourceMap_VLQ_SHIFT));
    SourceMap_VLQ_VALUE_MASK = any_number(_anyToNumber(SourceMap_VLQ_CONTINUATION_BIT) - 1);
    SourceMap_BASE64_CHARS = any_LTR("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
};


//-------------------------
void SourceMap__moduleInit(void){
    SourceMap__namespaceInit();
};
