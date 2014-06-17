//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/liteC/test-Core2.lite.md
#include "test-Core2.h"
// test Core2

   
    // global declare Core2

   // function test
   void test(){

       int c = 0;

       printf("%d",inRange(1, c, 10));

       void a = new TestClass(mkString("murcielago"));

       printf("%d",indexOf(a,mkString("e")));

       printf("%d",indexOf(a,mkString("lago")));

       printf("%s",toString(sliceJoin(a,2, 3)));

       printf("%s",toString(sliceJoin(a,-4)));
   };


//# sourceMappingURL=test-Core2.c.map