#include "UniqueID.h"
//-------------------------
//Module UniqueID
//-------------------------
var UniqueID_uniqueIds;
any UniqueID_set(DEFAULT_ARGUMENTS); //forward declare
any UniqueID_get(DEFAULT_ARGUMENTS); //forward declare
any UniqueID_getVarName(DEFAULT_ARGUMENTS); //forward declare
// ##module UniqueID

// ### dependencies

   // shim import Map

   // public function set(prefix, value)
   any UniqueID_set(DEFAULT_ARGUMENTS){// define named params
       var prefix, value;
       prefix=value=undefined;
       switch(argc){
         case 2:value=arguments[1];
         case 1:prefix=arguments[0];
       }
       //---------
// Generate unique numbers, starting at 1

       // uniqueIds.set prefix, value-1
       CALL2(set_,UniqueID_uniqueIds,prefix, any_number(_anyToNumber(value) - 1));
   return undefined;
   }

   // public function get(prefix) returns number
   any UniqueID_get(DEFAULT_ARGUMENTS){// define named params
       var prefix= argc? arguments[0] : undefined;
       //---------
// Generate unique numbers, starting at 1

       // var id = uniqueIds.get(prefix) or 0
       var id = __or(CALL1(get_,UniqueID_uniqueIds,prefix),any_number(0));

       // id += 1
       id.value.number += 1;

       // uniqueIds.set prefix, id
       CALL2(set_,UniqueID_uniqueIds,prefix, id);

       // return id
       return id;
   return undefined;
   }

   // public function getVarName(prefix) returns string
   any UniqueID_getVarName(DEFAULT_ARGUMENTS){// define named params
       var prefix= argc? arguments[0] : undefined;
       //---------
// Generate unique variable names

       // return '_#{prefix}#{get(prefix)}'
       return _concatAny(3,(any_arr){any_str("_"), prefix, (UniqueID_get(undefined,1,(any_arr){prefix}))});
   return undefined;
   }

//-------------------------
void UniqueID__moduleInit(void){
UniqueID_uniqueIds = new(Map,0,NULL);
};