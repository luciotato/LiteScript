//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/OptionsParser.lite.md
#include "OptionsParser.h"

   // public default class OptionsParser
   
   
    //class _init fn
    void OptionsParser__init(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==OptionsParser_TYPEID);
       //---------
       // define named params
       var argv= argc? arguments[0] : undefined;
       //---------
       ((OptionsParser_ptr)this.value.ptr)->lastIndex = undefined;
       ((OptionsParser_ptr)this.value.ptr)->items = undefined;
       // if argv.length and argv[0] is 'node', argv=argv.slice(1) //remove 'node' if calling as a script
       if (length(argv) && __is(argv.value.arr->item[(len_t)0],any_str("node"))) {argv = _slice(argv,1,(any_arr){
       any_number(1)
       });};
       ((OptionsParser_ptr)this.value.ptr)->items = _slice(argv,1,(any_arr){
       any_number(1)
       }); //remove this script/exe 'litec.out' from command line arguments
    };

    // method option(shortOption,argName)
    any OptionsParser_option(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==OptionsParser_TYPEID);
       //---------
       // define named params
       var shortOption, argName;
       shortOption=argName=undefined;
       switch(argc){
         case 2:argName=arguments[1];
         case 1:shortOption=arguments[0];
       }
       //---------

       // if .getPos(shortOption,argName) into var pos >= 0
       var pos=undefined;
       if (anyToNumber((pos=_getPos(this,2,(any_arr){
       shortOption, 
       argName
       }))) >= 0)  {
           _splice(((OptionsParser_ptr)this.value.ptr)->items,2,(any_arr){
           pos, 
           any_number(1)
           });
           return any_TRUE;
       };

       return any_FALSE;
    }
    ;

    // method value(shortOption,argName) returns string
    any OptionsParser_value(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==OptionsParser_TYPEID);
       //---------
       // define named params
       var shortOption, argName;
       shortOption=argName=undefined;
       switch(argc){
         case 2:argName=arguments[1];
         case 1:shortOption=arguments[0];
       }
       //---------

       // if .getPos(shortOption,argName) into var pos >= 0
       var pos=undefined;
       if (anyToNumber((pos=_getPos(this,2,(any_arr){
       shortOption, 
       argName
       }))) >= 0)  {
           var value = ((OptionsParser_ptr)this.value.ptr)->items.value.arr->item[(len_t)anyToNumber(pos) + 1];
           ;
           _splice(((OptionsParser_ptr)this.value.ptr)->items,2,(any_arr){
           pos, 
           any_number(2)
           });
           return value;
       };

       return undefined;
    }
    ;

    // helper method getPos(shortOption,argName)
    any OptionsParser_getPos(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==OptionsParser_TYPEID);
       //---------
       // define named params
       var shortOption, argName;
       shortOption=argName=undefined;
       switch(argc){
         case 2:argName=arguments[1];
         case 1:shortOption=arguments[0];
       }
       //---------

       ((OptionsParser_ptr)this.value.ptr)->lastIndex = _search(this,1,(any_arr){
       _newArrayWith(4,(any_arr){any_concat(NONE,2,(any_arr){
       any_str("-"), 
       shortOption
       }), any_concat(NONE,2,(any_arr){
       any_str("--"), 
       shortOption
       }), any_concat(NONE,2,(any_arr){
       any_str("--"), 
       argName
       }), any_concat(NONE,2,(any_arr){
       any_str("-"), 
       argName
       })})
       });
       return ((OptionsParser_ptr)this.value.ptr)->lastIndex;
    }
    ;

    // helper method search(list:array)
    any OptionsParser_search(any this, len_t argc, any* arguments){
       
       
       // validate this type
       assert(this.type==OptionsParser_TYPEID);
       //---------
       // define named params
       var list= argc? arguments[0] : undefined;
       //---------
       // for each item in list
       any item=undefined;
       for(int item__inx=0 ; item__inx<list.value.arr->length ; item__inx++){item=list.value.arr->item[item__inx];
           var result = _indexOf(((OptionsParser_ptr)this.value.ptr)->items,1,(any_arr){
           item
           });
           ;
           // if result >=0, return result
           if (anyToNumber(result) >= 0) {return result;};
       };// end for each in list
       return any_number(-1);
    }
    ;



//# sourceMappingURL=OptionsParser.c.map