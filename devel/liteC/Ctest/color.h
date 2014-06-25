#ifndef COLOR_C_H
#define COLOR_C_H
#include "_dispatcher.h"
   
   //-------------------
   //.namespace color
   extern any color; //color is a singleton
   void color__init_singleton();
   //-------------------
   #define color_TYPEID 39
   typedef struct color_s * color_ptr;
   typedef struct color_s {
       any normal, red, yellow, green;} color_s;
   
   extern void color__init(any this, len_t argc, any* arguments);
#endif