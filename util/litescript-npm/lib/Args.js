   //constructor
    function Args(argv){
     //     properties
        //lastIndex

       var arr = argv.slice(2); //remove 'node lite' from command line arguments
        //declare valid arr.__proto__
       arr.__proto__ = Args.prototype; //convert arr:Array into arr:Args:Array
       return arr; //return as created object
    };
   // Args (extends|super is) Array
   Args.prototype.__proto__ = Array.prototype;

    //method option(short,argName)
    Args.prototype.option = function(short, argName){

       //if .getPos(short,argName) into var pos >= 0
       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           this.splice(pos, 1);
           return true;
       };

       return false;
    };

    //method value(short,argName) returns string
    Args.prototype.value = function(short, argName){

       //if .getPos(short,argName) into var pos >= 0
       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           var value = this[pos + 1];
           this.splice(pos, 2);
           return value;
       };

       return undefined;
    };

    //helper method getPos(short,argName)
    Args.prototype.getPos = function(short, argName){

       this.lastIndex = this.search(['-' + short, '--' + short, '--' + argName, '-' + argName]);
       return this.lastIndex;
    };

    //helper method search(list:array)
    Args.prototype.search = function(list){
       //for each item in list
       for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
       
           var result = this.indexOf(item);
           //if result >=0, return result
           if (result >= 0) {
               return result};
       }; // end for each in list
       return -1;
    };
   //end class Args




module.exports=Args;

//Compiled by LiteScript compiler v0.6.0, source: /home/ltato/LiteScript/util/src/Args.lite.md
//# sourceMappingURL=Args.js.map
