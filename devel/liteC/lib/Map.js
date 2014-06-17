//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/Map.lite.md
// Map string to object shim

   // export default class Map
   // constructor
   function Map(){
        // properties
            // members:Object = new Object
           this.members=new Object();
   };

       // method set(key:string, value)
       Map.prototype.set = function(key, value){
           this.members[key] = value;
       };

       // method get(key:string)
       Map.prototype.get = function(key){
           return this.members[key];
       };

       // method has(key:string)
       Map.prototype.has = function(key){
           return key in this.members;
       };

       // method forEach(callb)
       Map.prototype.forEach = function(callb){
           // for each own property propName,value in .members
           var value=undefined;
           for ( var propName in this.members)if (this.members.hasOwnProperty(propName)){value=this.members[propName];
               {
               callb(propName, value);
               }
               
               }// end for each property
           
       };
   // end class Map


module.exports=Map;