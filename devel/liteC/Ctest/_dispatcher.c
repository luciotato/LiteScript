#include "_dispatcher.h"
// methods
static str _ADD_VERBS[] = { //string name for each distinct method name
    "sliceJoin"
};
// propery names
static str _ADD_THINGS[] = { //string name for each distinct property name
    "myArr"
};



//-------------------------------
int main(int argc, char** argv) {
    LiteC_init(argc,argv);
    LiteC_addMethodSymbols( 1, _ADD_VERBS);
    LiteC_addPropSymbols( 1, _ADD_THINGS);


    test__moduleInit();
}
// end main