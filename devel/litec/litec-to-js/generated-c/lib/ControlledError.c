#include "ControlledError.h"
//-------------------------
//Module ControlledError
//-------------------------
#include "ControlledError.c.extra"
//-------------------------
//NAMESPACE ControlledError
//-------------------------
    //-----------------------
    // Class ControlledError: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr ControlledError_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t ControlledError_PROPS[] = {
    soft_
    };
    
    

//--------------
    // ControlledError
    any ControlledError; //Class ControlledError extends Error
    
    //auto ControlledError__init
    void ControlledError__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Error__init(this,argc,arguments);
    };
    
    //auto ControlledError_newFromObject
    inline any ControlledError_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(ControlledError,argc,arguments);
    }

    //class ControlledError extends Error
        //properties 
            //soft: boolean
        ;
//------------------
void ControlledError__namespaceInit(void){
        ControlledError =_newClass("ControlledError", ControlledError__init, sizeof(struct ControlledError_s), Error);
        _declareMethods(ControlledError, ControlledError_METHODS);
        _declareProps(ControlledError, ControlledError_PROPS, sizeof ControlledError_PROPS);
    
};


//-------------------------
void ControlledError__moduleInit(void){
    ControlledError__namespaceInit();
};
