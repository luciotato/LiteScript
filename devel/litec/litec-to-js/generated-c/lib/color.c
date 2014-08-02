#include "color.h"
//-------------------------
//Module color
//-------------------------
#include "color.c.extra"

    //public namespace color
    //-------------------------
        //NAMESPACE color
        //-------------------------
        var color_normal, color_red, color_yellow, color_green;
        
        
        //------------------
        void color__namespaceInit(void){
            color_normal = any_LTR("\x1b[39;49m");
            color_red = any_LTR("\x1b[91m");
            color_yellow = any_LTR("\x1b[93m");
            color_green = any_LTR("\x1b[32m");
        };
    ;

//-------------------------
void color__moduleInit(void){
    color__namespaceInit();
};
