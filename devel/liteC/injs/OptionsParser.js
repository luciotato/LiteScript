//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/C/OptionsParser.lite.md

   // public default class OptionsParser
   // constructor
    function OptionsParser(argv){
     //      properties
        // lastIndex
        // items: Array of string
       // if argv.length and argv[0] is 'node', argv=argv.slice(1) //remove 'node' if calling as a script
       if (argv.length && argv[0] === 'node') {argv = argv.slice(1);};
       this.items = argv.slice(1); //remove this script/exe 'litec.out' from command line arguments
    };

    // method option(shortOption,argName)
    OptionsParser.prototype.option = function(shortOption, argName){

       // if .getPos(shortOption,argName) into var pos >= 0
       var pos=undefined;
       if ((pos=this.getPos(shortOption, argName)) >= 0) {
           this.items.splice(pos, 1);
           return true;
       };

       return false;
    };

    // method value(shortOption,argName) returns string
    OptionsParser.prototype.value = function(shortOption, argName){

       // if .getPos(shortOption,argName) into var pos >= 0
       var pos=undefined;
       if ((pos=this.getPos(shortOption, argName)) >= 0) {
           var value = this.items[pos + 1];
           this.items.splice(pos, 2);
           return value;
       };

       return undefined;
    };

    // helper method getPos(shortOption,argName)
    OptionsParser.prototype.getPos = function(shortOption, argName){

       this.lastIndex = this.search(['-' + shortOption, '--' + shortOption, '--' + argName, '-' + argName]);
       return this.lastIndex;
    };

    // helper method search(list:array)
    OptionsParser.prototype.search = function(list){
       // for each item in list
       for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
           var result = this.items.indexOf(item);
           // if result >=0, return result
           if (result >= 0) {return result;};
       };// end for each in list
       return -1;
    };
   // end class OptionsParser



module.exports=OptionsParser;
//# sourceMappingURL=OptionsParser.js.map