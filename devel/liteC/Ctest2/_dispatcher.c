#include "LiteC-core.h"
#include "_dispatcher.h"
void LiteC__init(){
    LiteC_registerCoreClasses();
    if (CLASSES_ARRAY.length!=6) fatal("CHECK USER_CLASSES_START_ID on LiteC compiler");
    __registerClass("TestClass", UNDEFINED, TestClass__init, sizeof(struct TestClass_s));
};
// method dispatchers
       any indexOf(any this, any arguments){
           switch(this.constructor){
             case TestClass:
                return TestClass_indexOf(this,arguments);
           };
       };
       
       any sliceJoin(any this, any arguments){
           switch(this.constructor){
             case TestClass:
                return TestClass_sliceJoin(this,arguments);
           };
       };
       