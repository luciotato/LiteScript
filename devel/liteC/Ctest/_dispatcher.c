#include "LiteC-core.h"
#include "_dispatcher.h"
void LiteC__init(){
    LiteC_registerCoreClasses();
    __registerClass(TestClass,"TestClass", UNDEFINED, TestClass__init, sizeof(struct TestClass_s));
};
// method dispatchers
any indexOf(any this, any arguments){
    switch(this.constructor){
      case TestClass:
         return TestClass_indexOf(this,arguments);
      case String:
         return String_indexOf(this,arguments);
      case Array:
         return Array_indexOf(this,arguments);
      default:
         _throw_noMethod(this.constructor,"indexOf");
    };
};
any sliceJoin(any this, any arguments){
    switch(this.constructor){
      case TestClass:
         return TestClass_sliceJoin(this,arguments);
      default:
         _throw_noMethod(this.constructor,"sliceJoin");
    };
};
any toString(any this, any arguments){
    switch(this.constructor){
      case Error:
         return Error_toString(this,arguments);
      case String:
         return String_toString(this,arguments);
      case Array:
         return Array_toString(this,arguments);
      default:
         _throw_noMethod(this.constructor,"toString");
    };
};
any concat(any this, any arguments){
    switch(this.constructor){
      case String:
         return String_concat(this,arguments);
      case Array:
         return Array_concat(this,arguments);
      default:
         _throw_noMethod(this.constructor,"concat");
    };
};
any slice(any this, any arguments){
    switch(this.constructor){
      case String:
         return String_slice(this,arguments);
      case Array:
         return Array_slice(this,arguments);
      default:
         _throw_noMethod(this.constructor,"slice");
    };
};
any split(any this, any arguments){
    switch(this.constructor){
      case String:
         return String_split(this,arguments);
      default:
         _throw_noMethod(this.constructor,"split");
    };
};
any push(any this, any arguments){
    switch(this.constructor){
      case Array:
         return Array_push(this,arguments);
      default:
         _throw_noMethod(this.constructor,"push");
    };
};