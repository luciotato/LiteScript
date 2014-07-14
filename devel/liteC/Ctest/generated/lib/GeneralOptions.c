#include "GeneralOptions.h"
//-------------------------
//Module GeneralOptions
//-------------------------
   //-----------------------
   // Class GeneralOptions: static list of METHODS(verbs) and PROPS(things)
   //-----------------------
   
   static _methodInfoArr GeneralOptions_METHODS = {
     { toString_, GeneralOptions_toString },
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t GeneralOptions_PROPS[] = {
   verboseLevel_
    , warningLevel_
    , comments_
    , target_
    , debugEnabled_
    , skip_
    , nomap_
    , single_
    , compileIfNewer_
    , browser_
    , extraComments_
    , defines_
    , projectDir_
    , mainModuleName_
    , outDir_
    , storeMessages_
    , literalMap_
    , version_
    , now_
    };
   
var GeneralOptions_DEFAULT_TARGET;
   // GeneralOptions
   
   any GeneralOptions; //Class Object
   //auto GeneralOptions__init
   void GeneralOptions__init(any this, len_t argc, any* arguments){
     PROP(verboseLevel_,this)=any_number(1);
     PROP(warningLevel_,this)=any_number(1);
     PROP(comments_,this)=any_number(1);
     PROP(target_,this)=GeneralOptions_DEFAULT_TARGET;
     PROP(debugEnabled_,this)=undefined;
     PROP(skip_,this)=undefined;
     PROP(nomap_,this)=undefined;
     PROP(single_,this)=undefined;
     PROP(compileIfNewer_,this)=undefined;
     PROP(browser_,this)=undefined;
     PROP(extraComments_,this)=any_number(1);
     PROP(defines_,this)=_newArray(0,NULL);
     PROP(mainModuleName_,this)=any_str("unnamed");
     PROP(outDir_,this)=any_str("./out");
     PROP(storeMessages_,this)=false;
     PROP(now_,this)=new(Date,0,NULL);
   };

     // properties
     ;

     // method toString
     any GeneralOptions_toString(DEFAULT_ARGUMENTS){
           assert(_instanceof(this,GeneralOptions));
           //---------
           // return "outDir:#{.outDir}\nverbose:#{.verboseLevel}\ndefines:#{(.defines.join())}"
           return _concatAny(6,(any_arr){any_str("outDir:"), PROP(outDir_,this), any_str("\nverbose:"), PROP(verboseLevel_,this), any_str("\ndefines:"), ((CALL0(join_,PROP(defines_,this))))});
     return undefined;
     }


//-------------------------
void GeneralOptions__moduleInit(void){
GeneralOptions_DEFAULT_TARGET = any_str("c");
       GeneralOptions =_newClass("GeneralOptions", GeneralOptions__init, sizeof(struct GeneralOptions_s), Object.value.classINFOptr);
   
       _declareMethods(GeneralOptions, GeneralOptions_METHODS);
       _declareProps(GeneralOptions, GeneralOptions_PROPS, sizeof GeneralOptions_PROPS);
};