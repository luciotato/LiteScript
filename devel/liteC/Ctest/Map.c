//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/Map.lite.md
#include "Map.h"
// Map string to object shim

   // export default class Map
   
   
   //auto Map__init
   any Map__init(any this, len_t argc, any* arguments){
           ((Map_ptr)this.value.ptr)->map_members = new(Object_TYPEID,0,NULL);
   };

       // method set(key:string, value)
       any Map_set(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==Map_TYPEID);
           //---------
           // define named params
           var key, value;
           key=value=undefined;
           switch(argc){
             case 2:value=arguments[1];
             case 1:key=arguments[0];
           }
           //---------
           ((Map_ptr)this.value.ptr)->map_members.value.arr->item[(len_t)anyToNumber(key)] = value;
       }
       ;

       // method get(key:string)
       any Map_get(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==Map_TYPEID);
           //---------
           // define named params
           var key= argc? arguments[0] : undefined;
           //---------
           return ((Map_ptr)this.value.ptr)->map_members.value.arr->item[(len_t)anyToNumber(key)];
       }
       ;

       // method has(key:string)
       any Map_has(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==Map_TYPEID);
           //---------
           // define named params
           var key= argc? arguments[0] : undefined;
           //---------
           return any_number(indexOf(key,1,(any_arr){((Map_ptr)this.value.ptr)->map_members}).value.number>=0);
       }
       ;

        //method forEach(callb)
        //    for each own property propName,value in .map_members
        //        callb(propName,value)

       // method clear()
       any Map_clear(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==Map_TYPEID);
           //---------
           ((Map_ptr)this.value.ptr)->map_members = new(Object_TYPEID,0,NULL);
       }
       ;

//# sourceMappingURL=Map.c.map