#include "LiteC-core.h"
#include "_dispatcher.h"
void LiteC__init(){
    LiteC_registerCoreClasses();
    if (CLASSES_ARRAY.length!=6) fatal("CHECK USER_CLASSES_START_ID on LiteC compiler");
    __registerClass("TestClass", Object__CLASS, TestClass__init, sizeof(struct TestClass));
};
// method dispatchers
       void* indexOf(void*_ptr this,str searched, int fromIndex){
           switch(((Object)this)->class){
             case TestClass__CLASS:
                return TestClass__indexOf(this,searched,fromIndex);
       
           };
       };
       
       void* sliceJoin(void*_ptr this,int start, int endPos){
           switch(((Object)this)->class){
             case TestClass__CLASS:
                return TestClass__sliceJoin(this,start,endPos);
       
           };
       };
       