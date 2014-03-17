//Compiled by LiteScript compiler v0.6.3, source: /home/ltato/LiteScript/devel/source-v0.6/Args.lite.md
   
    function Args(argv){
       var arr = argv.slice(2);
       
       arr.__proto__ = Args.prototype;
       return arr;
    };
   Args.prototype.__proto__ = Array.prototype;
   
    Args.prototype.option = function(short, argName){
       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           this.splice(pos, 1);
           return true;
       };
       return false;
    };
    Args.prototype.value = function(short, argName){
       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           var value = this[pos + 1];
           this.splice(pos, 2);
           return value;
       };
       return undefined;
    };
    Args.prototype.getPos = function(short, argName){
       this.lastIndex = this.search(['-' + short, '--' + short, '--' + argName, '-' + argName]);
       return this.lastIndex;
    };
    Args.prototype.search = function(list){
       for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
       
           var result = this.indexOf(item);
           if (result >= 0) {
               return result};
       };
       return -1;
    };
   Args

module.exports=Args;