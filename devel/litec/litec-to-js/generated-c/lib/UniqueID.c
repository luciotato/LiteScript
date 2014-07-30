#include "UniqueID.h"
//-------------------------
//Module UniqueID
//-------------------------
#include "UniqueID.c.extra"
var UniqueID_uniqueIds;
any UniqueID_set(DEFAULT_ARGUMENTS); //forward declare
any UniqueID_get(DEFAULT_ARGUMENTS); //forward declare
any UniqueID_getVarName(DEFAULT_ARGUMENTS); //forward declare
//##module UniqueID
//### dependencies
    //shim import Map
    
//### Support Module Var:
    //var uniqueIds = new Map
//### public function set(prefix, value)
    any UniqueID_set(DEFAULT_ARGUMENTS){
        // define named params
        var prefix, value;
        prefix=value=undefined;
        switch(argc){
          case 2:value=arguments[1];
          case 1:prefix=arguments[0];
        }
        //---------
//Generate unique numbers, starting at 1
        //uniqueIds.set prefix, value-1
        METHOD(set_,UniqueID_uniqueIds)(UniqueID_uniqueIds,2,(any_arr){prefix
, any_number(_anyToNumber(value) - 1)
        });
    return undefined;
    }
//### public function get(prefix) returns number
    any UniqueID_get(DEFAULT_ARGUMENTS){
        // define named params
        var prefix= argc? arguments[0] : undefined;
        //---------
//Generate unique numbers, starting at 1
        //var id = uniqueIds.get(prefix) or 0
        var id = (_anyToBool(__or1=METHOD(get_,UniqueID_uniqueIds)(UniqueID_uniqueIds,1,(any_arr){prefix
        }))? __or1 : any_number(0));
        //id += 1
        id.value.number += 1;
        //uniqueIds.set prefix, id
        METHOD(set_,UniqueID_uniqueIds)(UniqueID_uniqueIds,2,(any_arr){prefix
, id
        });
        //return id
        return id;
    return undefined;
    }
//### public function getVarName(prefix) returns string
    any UniqueID_getVarName(DEFAULT_ARGUMENTS){
        // define named params
        var prefix= argc? arguments[0] : undefined;
        //---------
//Generate unique variable names
        //return '_#{prefix}#{get(prefix)}'
        return _concatAny(3,any_LTR("_")
, prefix
, (UniqueID_get(undefined,1,(any_arr){prefix
        }))
        );
    return undefined;
    }

//-------------------------
void UniqueID__moduleInit(void){
    UniqueID_uniqueIds = new(Map,0,NULL);
};
