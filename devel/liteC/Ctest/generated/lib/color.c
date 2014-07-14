#include "color.h"
//-------------------------
//Module color
//-------------------------
   //-------------------------
   //NAMESPACE color
   //-------------------------
       var color_normal, color_red, color_yellow, color_green;
   
   
   //------------------
   void color__namespaceInit(void){
       color_normal = any_str("\x1b[39;49m");
       color_red = any_str("\x1b[91m");
       color_yellow = any_str("\x1b[93m");
       color_green = any_str("\x1b[32m");
       // properties
       ;};


//-------------------------
void color__moduleInit(void){
    color__namespaceInit();
};