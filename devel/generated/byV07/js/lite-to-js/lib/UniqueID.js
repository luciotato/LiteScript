//Compiled by LiteScript compiler v0.7.9, source: /home/ltato/LiteScript/devel/source/v0.8/lib/UniqueID.lite.md
// ##module UniqueID

// ### dependencies

   // shim import Map
   var Map = require('./Map.js');

// ### Support Module Var:

   var uniqueIds = new Map();

   // public function set(prefix, value)
   function set(prefix, value){
// Generate unique numbers, starting at 1

       uniqueIds.set(prefix, value - 1);
   };
   // export
   module.exports.set=set;

   // public function get(prefix) returns number
   function get(prefix){
// Generate unique numbers, starting at 1

       var id = uniqueIds.get(prefix) || 0;

       id += 1;

       uniqueIds.set(prefix, id);

       return id;
   };
   // export
   module.exports.get=get;

   // public function getVarName(prefix) returns string
   function getVarName(prefix){
// Generate unique variable names

       return '_' + prefix + (get(prefix));
   };
   // export
   module.exports.getVarName=getVarName;


//# sourceMappingURL=UniqueID.js.map