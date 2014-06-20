//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/liteC/test-Core2.lite.md
#include "test-Core2.h"
// test Core2

   
   
    // global declare Core2

   // function testCore2
   any  testCore2(any this, any arguments){
   // validate param types
   assert(arguments.constructor==Array);
   //---------

       any c = any_number(0);

       print(inRange(undefined,(any){Array,3,.value.item=(any_arr){any_number(1), c, any_number(10)}}));

       any a = new(TestClass,(any){Array,1,.value.item=(any_arr){any_str("murcielago")}});

       print(indexOf(a,(any){Array,1,.value.item=(any_arr){any_str("e")}}));

       print(indexOf(a,(any){Array,1,.value.item=(any_arr){any_str("lago")}}));

       print(sliceJoin(a,(any){Array,2,.value.item=(any_arr){any_number(2), any_number(3)}}));

       print(sliceJoin(a,(any){Array,1,.value.item=(any_arr){any_number(-4)}}));
   }
   ;


//# sourceMappingURL=test-Core2.c.map