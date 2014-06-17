//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/liteC/test-Core2.lite.md

#include "test-Core2.h"

// Core2


    // global declare CoreC, Core2

   // function test
   void test(){

       printf("%d",inRange(1, 0, 10));;

       String2 a = new String2("murcielago");

       printf("%d",a->call->indexOf(a,'e'));;


       printf("%d",call(a,_indexOf('e'));;

       printf("%d",a->call->indexOf(a,'lago'));;

       printf("%d",String2__CLASS->indexOf(a,'lago'));;


       String2 temp = a->call->slice(2, 3);
       printf("%s",temp->call->toString(temp));;
       //printf("%s",a->call->slice(2, 3)->call->toString(??));;

       call((String2)call(a,_slice,2,3),_toString);

       printf("%s",temp->call->toString(temp));;

       printf("",a->call->slice(-4));;
   };

   void* call(Object instance,methodInx,...)
       Object->class->methods[methodInx](Object,)