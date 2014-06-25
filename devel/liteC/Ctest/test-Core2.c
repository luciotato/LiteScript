//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/liteC/test-Core2.lite.md
#include "test-Core2.h"
// test Core2

   // import Core2
   #include "Core2.h"

   // import log from '../source-v0.8/log'
   #include "../source-v0.8/log.h"
//-------------------------------
int main(int argc, char** argv) {
    __init_core_support(); //see _dispatcher.c
    any arguments = _newArrayFromCharPtrPtr(argc,argv);

   any c = any_number(0);

   print(inRange(Core2,(any){Array,3,.value.item=(any_arr){any_number(1), c, any_number(10)}}));

   any a = any_str("murcielago");

   print((any){Array,3,.value.item=(any_arr){indexOf(a,(any){Array,1,.value.item=(any_arr){any_str("e")}}), indexOf(a,(any){Array,1,.value.item=(any_arr){any_str("lago")}}), slice(a,(any){Array,2,.value.item=(any_arr){any_number(3), any_number(6)}})}});

   any b = TestClass(new,(any){Array,1,.value.item=(any_arr){(any){Array,7,.value.item=(any_arr){any_number(0), any_number(1), any_number(2), any_number(3), any_number(4), any_number(5), any_number(6)}}}});
   print(any_concat((any){MISSING},(any){Array,3,.value.item=(any_arr){any_str("["), (join(((TestClass_ptr)b.value.ptr)->myArr,(any){Array,1,.value.item=(any_arr){any_str(", ")}})), any_str("]")}}));
   print((any){Array,2,.value.item=(any_arr){any_str("b.sliceJoin(2,3)"), sliceJoin(b,(any){Array,2,.value.item=(any_arr){any_number(2), any_number(3)}})}});
   print((any){Array,2,.value.item=(any_arr){any_str("b.sliceJoin(-4)"), sliceJoin(b,(any){Array,1,.value.item=(any_arr){any_number(-4)}})}});

   b = TestClass(new,(any){Array,1,.value.item=(any_arr){(any){Array,0,.value.item=(any_arr){}}}});
   print(any_concat((any){MISSING},(any){Array,3,.value.item=(any_arr){any_str("["), (join(((TestClass_ptr)b.value.ptr)->myArr,(any){Array,1,.value.item=(any_arr){any_str(", ")}})), any_str("]")}}));
   print((any){Array,2,.value.item=(any_arr){any_str("b.sliceJoin(2,3)"), sliceJoin(b,(any){Array,2,.value.item=(any_arr){any_number(2), any_number(3)}})}});
   print((any){Array,2,.value.item=(any_arr){any_str("b.sliceJoin(-4)"), sliceJoin(b,(any){Array,1,.value.item=(any_arr){any_number(-4)}})}});
}//end main function


//# sourceMappingURL=test-Core2.c.map