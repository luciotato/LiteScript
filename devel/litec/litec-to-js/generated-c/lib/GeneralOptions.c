#include "GeneralOptions.h"
//-------------------------
//Module GeneralOptions
//-------------------------
#include "GeneralOptions.c.extra"
//-------------------------
//NAMESPACE GeneralOptions
//-------------------------
    //-----------------------
    // Class GeneralOptions: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr GeneralOptions_METHODS = {
      { toString_, GeneralOptions_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t GeneralOptions_PROPS[] = {
    verboseLevel_
    , warningLevel_
    , comments_
    , target_
    , debugEnabled_
    , perf_
    , skip_
    , generateSourceMap_
    , single_
    , compileIfNewer_
    , browser_
    , defines_
    , es6_
    , projectDir_
    , mainModuleName_
    , outDir_
    , storeMessages_
    , literalMap_
    , version_
    , now_
    };
    
    

//--------------
    // GeneralOptions
    any GeneralOptions; //Class GeneralOptions
    //auto GeneralOptions__init
    void GeneralOptions__init(any this, len_t argc, any* arguments){
      PROP(verboseLevel_,this)=any_number(1);
      PROP(warningLevel_,this)=any_number(1);
      PROP(comments_,this)=any_number(1);
      PROP(target_,this)=any_LTR("js");
      PROP(debugEnabled_,this)=undefined;
      PROP(perf_,this)=any_number(0);
      PROP(skip_,this)=undefined;
      PROP(generateSourceMap_,this)=true;
      PROP(single_,this)=undefined;
      PROP(compileIfNewer_,this)=undefined;
      PROP(browser_,this)=undefined;
      PROP(defines_,this)=new(Array,0,NULL);
      PROP(mainModuleName_,this)=any_LTR("unnamed");
      PROP(outDir_,this)=any_LTR("./out");
      PROP(storeMessages_,this)=false;
      PROP(now_,this)=new(Date,0,NULL);
    };
    
    //auto GeneralOptions_newFromObject
    inline any GeneralOptions_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(GeneralOptions,argc,arguments);
    }
//### class GeneralOptions
      //properties
            //verboseLevel = 1
            //warningLevel = 1
            //comments = 1
            ////ifdef PROD_C
            ////target ="c"
            ////else
            //target ="js"
            ////end if
            //debugEnabled = undefined
            //perf=0 // performace counters 0..2
            //skip = undefined
            //generateSourceMap = true //default is to generate sourcemaps
            //single = undefined
            //compileIfNewer = undefined //compile only if source is newer
            //browser =undefined //compile js for browser environment (instead of node.js env.)
            //defines: array of string = []
            //es6: boolean //compile to js-EcmaScript6
            //projectDir:string 
            //mainModuleName:string = 'unnamed'
            //outDir = './out'
            //storeMessages: boolean = false
            //literalMap: string // produce "new Class().fromObject({})" on "{}"" instead of a js object
            //// activate with: 'lexer options object literal is Foo'. A class is required to produce C-code 
            //version: string
            //now: Date = new Date()
      ;
      //method toString
      any GeneralOptions_toString(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,GeneralOptions));
            //---------
            //return """
            return _concatAny(6,
        any_LTR("outDir:"), 
        PROP(outDir_,this), 
        any_LTR("\nverbose:"), 
        PROP(verboseLevel_,this), 
        any_LTR("\ndefines:"), 
        ((__call(join_,PROP(defines_,this),0,NULL)))
);
      return undefined;
      }
//------------------
void GeneralOptions__namespaceInit(void){
        GeneralOptions =_newClass("GeneralOptions", GeneralOptions__init, sizeof(struct GeneralOptions_s), Object);
        _declareMethods(GeneralOptions, GeneralOptions_METHODS);
        _declareProps(GeneralOptions, GeneralOptions_PROPS, sizeof GeneralOptions_PROPS);
    
};


//-------------------------
void GeneralOptions__moduleInit(void){
    GeneralOptions__namespaceInit();
};
