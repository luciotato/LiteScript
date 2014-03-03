//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/SourceMap.lite.md
   var log = require('./log');
   var debug = log.debug;
   
     function SourceMap(){
         this.lines = [];
     };
   
     SourceMap.prototype.add = function(sourceLine, sourceCol, line, column, options){if(options===undefined) options={};
         var lineMap = this.lines[line] || ((this.lines[line]=new LineMap()));
         lineMap.add(column, new Location(sourceLine, sourceCol), options);
     };
     SourceMap.prototype.sourceLocation = function(line, column){
         for( var lin=line; lin >= 0; 
             lin--) {
             var lineMap=undefined;
             if ((lineMap=this.lines[line])) {
                 return lineMap.sourceLocation(column)};
         };
         
     };
     SourceMap.prototype.generate = function(options, code){if(code===undefined) code=null;
       if(!options) options={};
       if(options.generatedFile===undefined) options.generatedFile='';
       if(options.sourceRoot===undefined) options.sourceRoot='';
       if(options.sourceFiles===undefined) options.sourceFiles=[''];
       
       var 
       writingline = 0, 
       lastColumn = 0, 
       lastSourceLine = 0, 
       lastSourceColumn = 0, 
       needComma = false, 
       buffer = ""
       ;
       for( var lineNumber=0,lineMap ; lineNumber<this.lines.length ; lineNumber++){lineMap=this.lines[lineNumber];
       if(lineMap){
         debug("line:", lineNumber);
         for( var column=0,sourceLocation ; column<lineMap.columns.length ; column++){sourceLocation=lineMap.columns[column];
         if(sourceLocation){
           debug("column:", column, "->", sourceLocation.lin, sourceLocation.col);
           while(writingline < lineNumber){
               lastColumn = 0;
               needComma = false;
               buffer += ";";
               writingline++;
           };
           if (needComma) {
             buffer += ",";
             needComma = false;
           };
           buffer += encodeVlq(column - lastColumn);
           lastColumn = column;
           buffer += encodeVlq(0);
           buffer += encodeVlq(sourceLocation.lin - lastSourceLine);
           lastSourceLine = sourceLocation.lin;
           buffer += encodeVlq(sourceLocation.col - lastSourceColumn);
           lastSourceColumn = sourceLocation.col;
           needComma = true;
         }};
         
       }};
       
       var v3 = {
         version: 3, 
         file: options.generatedFile, 
         sourceRoot: options.sourceRoot, 
         sources: options.sourceFiles, 
         names: [], 
         mappings: buffer
         };
       
       if (options.inline) {
           v3.sourcesContent = [code]};
       return JSON.stringify(v3, null, 2);
     };
   SourceMap
   
     function Location(lin, col){
       this.lin = lin;
       this.col = col;
     };
   
   
   SourceMap.Location = Location;
   Location
   
     function LineMap(){
       this.columns = [];
     };
   
     LineMap.prototype.add = function(column, source, options){if(options===undefined) options={};
       if(!options) options={};
       
       if (options.noReplace && this.columns[column]) {
           return};
       this.columns[column] = source;
     };
     LineMap.prototype.sourceLocation = function(column){
       for( var col=column; col >= 0; 
           col--) {
           var foundLocation=undefined;
           if ((foundLocation=this.columns[col])) {
               return foundLocation};
       };
       
     };
   LineMap
   var 
   VLQ_SHIFT = 5, 
   VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT, 
   VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1
   ;
   function encodeVlq(value){
       var answer = '';
       var signBit = value < 0 ? 1 : 0;
       var valueToEncode = (Math.abs(value) << 1) + signBit;
       while(valueToEncode || !answer){
         var nextChunk = valueToEncode & VLQ_VALUE_MASK;
         valueToEncode = valueToEncode >> VLQ_SHIFT;
         if (valueToEncode) {
             nextChunk = nextChunk | VLQ_CONTINUATION_BIT};
         answer += encodeBase64(nextChunk);
       };
       return answer;
   };
   
   SourceMap.encodeVlq=encodeVlq;
   var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
   function encodeBase64(value){
     var encoded=undefined;
     if (!((encoded=BASE64_CHARS[value]))) {
         throw new Error("Cannot Base64 encode value: " + value);
     };
     return encoded;
   };
module.exports=SourceMap;