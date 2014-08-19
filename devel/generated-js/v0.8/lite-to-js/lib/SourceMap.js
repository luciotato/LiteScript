
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
    var logger = require('./logger.js');

    //    public class SourceMap
    // constructor
    function SourceMap(){
      //properties
          //lines: array
          //.lines = []
          this.lines = [];
      };
      // ---------------------------
      SourceMap.prototype.add = function(sourceLine, sourceCol, line, column, noReplace){

          //logger.debug "gen #{line},#{column} -> src #{sourceLine},#{sourceCol}"
          logger.debug("gen " + line + "," + column + " -> src " + sourceLine + "," + sourceCol);

          //var lineMap = .lines.tryGet(line)
          var lineMap = this.lines.tryGet(line);
          //if no lineMap //create
          if (!lineMap) {
          
              //lineMap = new LineMap(line) // create
              lineMap = new LineMap(line);
              //.lines.set line, lineMap //store at index (extend array if needed)
              this.lines.set(line, lineMap);
          };

          //lineMap.add column, new Location(sourceLine, sourceCol), noReplace
          lineMap.add(column, new Location(sourceLine, sourceCol), noReplace);
      }// ---------------------------
      SourceMap.prototype.sourceLocation = function(line, column){

//Look up the original position of a given
//`line` and `column` in the generated code.

//Search for the closest line, when found, return closest column location

          //for lin=line, while lin>=0, lin--
          for( var lin=line; lin >= 0; lin--) {
              //if .lines[line] into var lineMap, return lineMap.sourceLocation(column)
              var lineMap=undefined;
              if ((lineMap=this.lines[line])) {return lineMap.sourceLocation(column)};
          };// end for lin
          
      }// ---------------------------
      SourceMap.prototype.generate = function(generatedFile, sourceFiles){

        //default options =
        //  generatedFile: ''
        //  sourceRoot   : ''
        //  sourceFiles  : ['']
        //  inline: undefined

        //var sourceRoot = ''
        var sourceRoot = '';
        //if no sourceFiles, sourceFiles=['']
        if (!sourceFiles) {sourceFiles = ['']};

        //var
          //writingline       = 0
          //lastGenColumn     = 0
          //lastSourceLine    = 0
          //lastSourceColumn  = 0
          //needComma         = false
          //encoded:array     = []


        //#for each line in the generated
        //for each lineInx,lineMap in .lines where lineMap
        var 
            writingline = 0
            , lastGenColumn = 0
            , lastSourceLine = 0
            , lastSourceColumn = 0
            , needComma = false
            , encoded = []
        ;


        //#for each line in the generated
        //for each lineInx,lineMap in .lines where lineMap
        for( var lineInx=0,lineMap ; lineInx<this.lines.length ; lineInx++){lineMap=this.lines[lineInx];
          if(lineMap){

          //for each column,SourceLoc in lineMap.columns where SourceLoc
          for( var column=0,SourceLoc ; column<lineMap.columns.length ; column++){SourceLoc=lineMap.columns[column];
            if(SourceLoc){

            //logger.debug "line:#{lineMap.line} ->", SourceLoc.lin
            logger.debug("line:" + lineMap.line + " ->", SourceLoc.lin);
            //logger.debug "column:#{column}", SourceLoc.col
            logger.debug("column:" + column, SourceLoc.col);
            //logger.debug "writingline #{writingline} lineMap.line #{lineMap.line}"
            logger.debug("writingline " + writingline + " lineMap.line " + lineMap.line);

//advance to LineMap.line

            //if writingline < lineMap.line
            if (writingline < lineMap.line) {
            
                //lastGenColumn = 0
                lastGenColumn = 0;
                //needComma = false
                needComma = false;
                //while writingline < lineMap.line
                while(writingline < lineMap.line){
                    //encoded.push ";"
                    encoded.push(";");
                    //writingline++
                    writingline++;
                };// end loop
                
            };

//Write a comma if we've already written a segment on this line.

            //if needComma
            if (needComma) {
            
              //encoded.push ","
              encoded.push(",");
              //needComma = false
              needComma = false;
            };

//Write the next segment. Segments can be 1, 4, or 5 values.  If just one, then it
//is a generated column which doesn't match anything in the source code.

//The starting column in the generated source, relative to any previous recorded
//column for the current line:

            //encoded.push encodeVlq(column - lastGenColumn)
            encoded.push(encodeVlq(column - lastGenColumn));
            //lastGenColumn = column
            lastGenColumn = column;

//The index into the list of sources:

            //encoded.push encodeVlq(0)
            encoded.push(encodeVlq(0));

//The starting line in the original source, relative to the previous source line.

            //encoded.push encodeVlq(SourceLoc.lin - lastSourceLine)
            encoded.push(encodeVlq(SourceLoc.lin - lastSourceLine));
            //lastSourceLine = SourceLoc.lin
            lastSourceLine = SourceLoc.lin;

//The starting column in the original source, relative to the previous column.

            //encoded.push encodeVlq(SourceLoc.col - lastSourceColumn)
            encoded.push(encodeVlq(SourceLoc.col - lastSourceColumn));
            //lastSourceColumn = SourceLoc.col
            lastSourceColumn = SourceLoc.col;
            //needComma = true
            needComma = true;
          }};// end for each in lineMap.columns

          //end for

        //end for
          
        }};// end for each in this.lines

        //end for

//Produce the canonical JSON object format for a "v3" source map.

        //var v3 =
        

//Produce the canonical JSON object format for a "v3" source map.

        //var v3 =
          //version:    3
          //file:       generatedFile
          //sourceRoot: sourceRoot
          //sources:    sourceFiles
          //names:      []
          //mappings:   encoded.join("")

        //declare valid v3.sourcesContent
        //if options.inline, v3.sourcesContent = [code]

        //return JSON.stringify(v3, null, 2)
        var v3 = {
            version: 3
            , file: generatedFile
            , sourceRoot: sourceRoot
            , sources: sourceFiles
            , names: []
            , mappings: encoded.join("")
          };

        //declare valid v3.sourcesContent
        //if options.inline, v3.sourcesContent = [code]

        //return JSON.stringify(v3, null, 2)
        return JSON.stringify(v3, null, 2);
      }
    // end class SourceMap


//## Helper Classes

    //helper class Location
    // constructor
    function Location(lin, col){
      //properties lin,col
        //.lin=lin
        this.lin = lin;
        //.col=col
        this.col = col;
      };
    
    // end class Location

//### LineMap

//A **LineMap** object keeps track of information about original line and column
//positions for a single line of output JavaScript code.
//**SourceMaps** are implemented in terms of **LineMaps**.

    //class LineMap
    // constructor
    function LineMap(line){
      //properties
        //line
        //columns: Location array
        //.line = line
        this.line = line;
        //.columns = []
        this.columns = [];
      };
      // ---------------------------
      LineMap.prototype.add = function(column, source, noReplace){

        //var colInfo= .columns.tryGet(column)
        var colInfo = this.columns.tryGet(column);
        //if colInfo and noReplace, return
        if (colInfo && noReplace) {return};

        //.columns.set column,source
        this.columns.set(column, source);
      }// ---------------------------
      LineMap.prototype.sourceLocation = function(column){

//returns closest source location, for a js column in this line

        //for col=column, while col>=0, col--
        for( var col=column; col >= 0; col--) {
            //if .columns.tryGet(col) into var foundLocation, return foundLocation
            var foundLocation=undefined;
            if ((foundLocation=this.columns.tryGet(col))) {return foundLocation};
        };// end for col
        
      }
    // end class LineMap


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
    var 
        VLQ_SHIFT = 5
        , VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT
        , VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1
    ;

    //helper function encodeVlq(value)
    // ---------------------------
    function encodeVlq(value){

        //var answer = ''
        var answer = '';

        //# Least significant bit represents the sign.
        //var signBit = value < 0 ? 1 else 0
        var signBit = value < 0 ? 1 : 0;

        //# The next bits are the actual value.
        //var valueToEncode = ( (value<0? -value:value) << 1) + signBit
        var valueToEncode = ((value < 0 ? -value : value) << 1) + signBit;

        //# Make sure we encode at least one character, even if valueToEncode is 0.
        //while valueToEncode or no answer
        while(valueToEncode || !answer){
          //var nextChunk = valueToEncode bitand VLQ_VALUE_MASK
          var nextChunk = valueToEncode & VLQ_VALUE_MASK;
          //valueToEncode = valueToEncode >> VLQ_SHIFT
          valueToEncode = valueToEncode >> VLQ_SHIFT;
          //if valueToEncode, nextChunk = nextChunk bitor VLQ_CONTINUATION_BIT
          if (valueToEncode) {nextChunk = nextChunk | VLQ_CONTINUATION_BIT};
          //answer &= encodeBase64(nextChunk)
          answer += encodeBase64(nextChunk);
        };// end loop

        //return answer
        return answer;
    };


//Regular Base64 Encoding
//-----------------------

    //var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    //helper function encodeBase64(value)
    // ---------------------------
    function encodeBase64(value){
      //if no BASE64_CHARS.charAt(value) into var encoded
      var encoded=undefined;
      if (!((encoded=BASE64_CHARS.charAt(value)))) {
      
          //fail with "Cannot Base64 encode value: #{value}"
          throw new Error("Cannot Base64 encode value: " + value);
      };
      //return encoded
      return encoded;
    };module.exports=SourceMap;
