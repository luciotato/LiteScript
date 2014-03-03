//Compiled by LiteScript compiler v0.4.0, source: /home/ltato/LiteScript/source-v0.5.0/SourceMap.lite.md
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
//- removed stored generated column and line, since they're the array indexes
//- added class "Location:{lin,col}"
//- moved support encode functions from class methods to module functions


   //import log
   var log = require('./log');
   var debug = log.debug;


   //public default class SourceMap
   //constructor
   function SourceMap(){
         this.lines = [];
     };

//Maps locations in a single generated JavaScript file back to locations in
//the original source file.

//This is intentionally agnostic towards how a source map might be represented on
//disk. Once the compiler is ready to produce a "v3"-style source map, we can walk
//through the arrays of line and column buffer to produce it.

      //properties
          //lines: array

//Adds a mapping to this SourceMap.
//If `options.noReplace` is true, then if there is already a mapping
//for the specified `line` and `column`, this will have no effect.

     //method add(sourceLine, sourceCol, line, column, options = {})
     SourceMap.prototype.add = function(sourceLine, sourceCol, line, column, options){if(options===undefined) options={};


         var lineMap = this.lines[line] || ((this.lines[line]=new LineMap()));

         lineMap.add(column, new Location(sourceLine, sourceCol), options);
     };


     //method sourceLocation(line, column)
     SourceMap.prototype.sourceLocation = function(line, column){

//Look up the original position of a given
//`line` and `column` in the generated code.

//Search for the closest line, when found, return closest column location

         //for lin=line, while lin>=0, lin--
         for( var lin=line; lin >= 0; 
             lin--) {
             //if .lines[line] into var lineMap, return lineMap.sourceLocation(column)
             var lineMap=undefined;
             if ((lineMap=this.lines[line])) {
                 return lineMap.sourceLocation(column)};
         }; // end for lin
         
     };

//V3 SourceMap Generation
//-----------------------

//Builds up a V3 source map, returning the generated JSON as a string.
//`options.sourceRoot` may be used to specify the sourceRoot written to the source
//map.  Also, `options.sourceFiles` and `options.generatedFile` may be passed to
//set "sources" and "file", respectively.

     //method generate(options, code = null)
     SourceMap.prototype.generate = function(options, code){if(code===undefined) code=null;


       //default options =
       if(!options) options={};
       if(options.generatedFile===undefined) options.generatedFile='';
       if(options.sourceRoot===undefined) options.sourceRoot='';
       if(options.sourceFiles===undefined) options.sourceFiles=[''];
       // options.inline: undefined

       var 
       writingline = 0, 
       lastColumn = 0, 
       lastSourceLine = 0, 
       lastSourceColumn = 0, 
       needComma = false, 
       buffer = ""
       ;


       //for each lineNumber,lineMap in .lines where lineMap
       for( var lineNumber=0,lineMap ; lineNumber<this.lines.length ; lineNumber++){lineMap=this.lines[lineNumber];
       if(lineMap){

         debug("line:", lineNumber);

         //for each column,sourceLocation in lineMap.columns where sourceLocation
         for( var column=0,sourceLocation ; column<lineMap.columns.length ; column++){sourceLocation=lineMap.columns[column];
         if(sourceLocation){


           debug("column:", column, "->", sourceLocation.lin, sourceLocation.col);

           //while writingline < lineNumber
           while(writingline < lineNumber){

               lastColumn = 0;
               needComma = false;
               buffer += ";";
               writingline++;
           };//end loop

//Write a comma if we've already written a segment on this line.

           //if needComma
           if (needComma) {
             buffer += ",";
             needComma = false;
           };

//Write the next segment. Segments can be 1, 4, or 5 values.  If just one, then it
//is a generated column which doesn't match anything in the source code.

//The starting column in the generated source, relative to any previous recorded
//column for the current line:

           buffer += encodeVlq(column - lastColumn);
           lastColumn = column;

//The index into the list of sources:

           buffer += encodeVlq(0);

//The starting line in the original source, relative to the previous source line.

           buffer += encodeVlq(sourceLocation.lin - lastSourceLine);
           lastSourceLine = sourceLocation.lin;

//The starting column in the original source, relative to the previous column.

           buffer += encodeVlq(sourceLocation.col - lastSourceColumn);
           lastSourceColumn = sourceLocation.col;
           needComma = true;
         }}; // end for each in lineMap.columns

         //end for
         
       }}; // end for each in this.lines

       //end for

//Produce the canonical JSON object format for a "v3" source map.

       var v3 = {
         version: 3, 
         file: options.generatedFile, 
         sourceRoot: options.sourceRoot, 
         sources: options.sourceFiles, 
         names: [], 
         mappings: buffer
         };

        //declare valid v3.sourcesContent
       //if options.inline, v3.sourcesContent = [code]
       if (options.inline) {
           v3.sourcesContent = [code]};

       return JSON.stringify(v3, null, 2);
     };
   //end class SourceMap


//## Helper Classes

   //public helper class Location
   //constructor
   function Location(lin, col){
       this.lin = lin;
       this.col = col;
     };
      //properties lin,col
   
   //export
   SourceMap.Location = Location;
   //end class Location

//### LineMap

//A **LineMap** object keeps track of information about original line and column
//positions for a single line of output JavaScript code.
//**SourceMaps** are implemented in terms of **LineMaps**.

   //class LineMap
   //constructor
   function LineMap(){
       this.columns = [];
     };
      //properties
        //columns: Location array

     //method add(column, source:Location, options={})
     LineMap.prototype.add = function(column, source, options){if(options===undefined) options={};


       //default options =
       if(!options) options={};
       // options.noReplace: undefined

       //if options.noReplace and .columns[column], return
       if (options.noReplace && this.columns[column]) {
           return};

       this.columns[column] = source;
     };

     //method sourceLocation(column)
     LineMap.prototype.sourceLocation = function(column){

//returns closest source location, for a js column in this line

       //for col=column, while col>=0, col--
       for( var col=column; col >= 0; 
           col--) {
           //if .columns[col] into var foundLocation, return foundLocation
           var foundLocation=undefined;
           if ((foundLocation=this.columns[col])) {
               return foundLocation};
       }; // end for col
       
     };
   //end class LineMap


//#Helper module functions

//Base64 VLQ Encoding
//-------------------

//Note that SourceMap VLQ encoding is "backwards".  MIDI-style VLQ encoding puts
//the most-significant-bit (MSB) from the original value into the MSB of the VLQ
//encoded value (see [Wikipedia](http://en.wikipedia.org/wiki/File:Uintvar_coding.svg)).
//SourceMap VLQ does things the other way around, with the least significat four
//bits of the original value encoded into the first byte of the VLQ encoded value.

   var 
   VLQ_SHIFT = 5, 
   VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT, 
   VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1
   ;

   //public helper function encodeVlq(value)
   function encodeVlq(value){

       var answer = '';

        //# Least significant bit represents the sign.
       var signBit = value < 0 ? 1 : 0;

        //# The next bits are the actual value.
       var valueToEncode = (Math.abs(value) << 1) + signBit;

        //# Make sure we encode at least one character, even if valueToEncode is 0.
       //while valueToEncode or no answer
       while(valueToEncode || !answer){
         var nextChunk = valueToEncode & VLQ_VALUE_MASK;
         valueToEncode = valueToEncode >> VLQ_SHIFT;
         //if valueToEncode, nextChunk = nextChunk|VLQ_CONTINUATION_BIT
         if (valueToEncode) {
             nextChunk = nextChunk | VLQ_CONTINUATION_BIT};
         answer += encodeBase64(nextChunk);
       };//end loop

       return answer;
   };
   //export
   SourceMap.encodeVlq=encodeVlq;


//Regular Base64 Encoding
//-----------------------

   var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

   //helper function encodeBase64(value)
   function encodeBase64(value){
     //if no BASE64_CHARS[value] into var encoded
     var encoded=undefined;
     if (!((encoded=BASE64_CHARS[value]))) {
         //fail with "Cannot Base64 encode value: #{value}"
         throw new Error("Cannot Base64 encode value: " + value);
     };
     return encoded;
   };

module.exports=SourceMap;
