#include "OptionsParser.h"
//-------------------------
//Module OptionsParser
//-------------------------
   //-----------------------
   // Class OptionsParser: static list of METHODS(verbs) and PROPS(things)
   //-----------------------
   
   static _methodInfoArr OptionsParser_METHODS = {
     { option_, OptionsParser_option },
     { valueFor_, OptionsParser_valueFor },
     { getPos_, OptionsParser_getPos },
     { search_, OptionsParser_search },
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t OptionsParser_PROPS[] = {
   lastIndex_
    , items_
    };
   
   // OptionsParser
   
   any OptionsParser; //Class Object
// parse command line parameters

    // properties
    ;

    // constructor (argv:array)
    void OptionsParser__init(DEFAULT_ARGUMENTS){
       // define named params
       var argv= argc? arguments[0] : undefined;
       //---------

       // if argv.length and argv[0] is 'node'
       if (_length(argv) && __is(ITEM(0,argv),any_str("node")))  {
               // argv=argv.slice(1) //remove 'node' if calling as a script
               argv = CALL1(slice_,argv,any_number(1)); //remove 'node' if calling as a script
       };

       // .items = argv.slice(1) //remove this script/exe 'litec.out' from command line arguments
       PROP(items_,this) = CALL1(slice_,argv,any_number(1)); //remove this script/exe 'litec.out' from command line arguments
    }

    // method option(shortOption,argName)
    any OptionsParser_option(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,OptionsParser));
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
       if (_anyToNumber((pos=CALL2(getPos_,this,shortOption, argName))) >= 0)  {
           // .items.splice(pos,1)
           CALL2(splice_,PROP(items_,this),pos, any_number(1));
           // return true
           return true;
       };

       // return false
       return false;
    return undefined;
    }

    // method valueFor(shortOption,argName) returns string
    any OptionsParser_valueFor(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,OptionsParser));
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
       if (_anyToNumber((pos=CALL2(getPos_,this,shortOption, argName))) >= 0)  {
           // var value = .items[pos+1]
           var value = ITEM(_anyToNumber(pos) + 1,PROP(items_,this));
           // .items.splice(pos,2)
           CALL2(splice_,PROP(items_,this),pos, any_number(2));
           // return value
           return value;
       };

       // return undefined
       return undefined;
    return undefined;
    }

    // helper method getPos(shortOption,argName)
    any OptionsParser_getPos(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,OptionsParser));
       //---------
       // define named params
       var shortOption, argName;
       shortOption=argName=undefined;
       switch(argc){
         case 2:argName=arguments[1];
         case 1:shortOption=arguments[0];
       }
       //---------

       // .lastIndex = .search(['-#{shortOption}','--#{shortOption}','--#{argName}','-#{argName}'])
       PROP(lastIndex_,this) = CALL1(search_,this,_newArray(4,(any_arr){_concatAny(2,(any_arr){any_str("-"), shortOption}), _concatAny(2,(any_arr){any_str("--"), shortOption}), _concatAny(2,(any_arr){any_str("--"), argName}), _concatAny(2,(any_arr){any_str("-"), argName})}));
       // return .lastIndex
       return PROP(lastIndex_,this);
    return undefined;
    }

    // helper method search(list:array)
    any OptionsParser_search(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,OptionsParser));
       //---------
       // define named params
       var list= argc? arguments[0] : undefined;
       //---------
       // for each item in list
       any _list4=list;
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list4.value.arr->length ; item__inx++){item=ITEM(item__inx,_list4);
           // var result = .items.indexOf(item)
           var result = CALL1(indexOf_,PROP(items_,this),item);
           // if result >=0, return result
           if (_anyToNumber(result) >= 0) {return result;};
       }};// end for each in list
       // return -1
       return any_number(-1);
    return undefined;
    }


//-------------------------
void OptionsParser__moduleInit(void){
       OptionsParser =_newClass("OptionsParser", OptionsParser__init, sizeof(struct OptionsParser_s), Object.value.classINFOptr);
   
       _declareMethods(OptionsParser, OptionsParser_METHODS);
       _declareProps(OptionsParser, OptionsParser_PROPS, sizeof OptionsParser_PROPS);
};