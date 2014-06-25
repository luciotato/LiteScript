//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/Map.lite.md
// Map string to object shim

   // export default class Map
   // constructor
   function Map(){
        // properties
            // map_members:Object = new Object
           this.map_members=new Object();
   };

       // method set(key:string, value)
       Map.prototype.set = function(key, value){
           this.map_members[key] = value;
       };

       // method get(key:string)
       Map.prototype.get = function(key){
           return this.map_members[key];
       };

       // method has(key:string)
       Map.prototype.has = function(key){
           return key in this.map_members;
       };

       // method forEach(callb)
       Map.prototype.forEach = function(callb){
           // for each own property propName,value in .map_members
           var value=undefined;
           for ( var propName in this.map_members)if (this.map_members.hasOwnProperty(propName)){value=this.map_members[propName];
               {
               callb(propName, value);
               }
               
               }// end for each property
           
       };

       // method clear()
       Map.prototype.clear = function(){
           this.map_members = new Object();
       };
   // end class Map

module.exports=Map;