#ifndef TEST_C__H
#define TEST_C__H
#include "_dispatcher.h"
//-------------------------
//Module test
//-------------------------
extern void test__moduleInit(void);
extern any test_inRange(DEFAULT_ARGUMENTS);
    

//--------------
    // test_TestClass
    any test_TestClass; //Class test_TestClass
    typedef struct test_TestClass_s * test_TestClass_ptr;
    typedef struct test_TestClass_s {
        //TestClass
        any myArr;
    
    } test_TestClass_s;
    
    extern void test_TestClass__init(DEFAULT_ARGUMENTS);
    extern any test_TestClass_indexOf(DEFAULT_ARGUMENTS);
    extern any test_TestClass_sliceJoin(DEFAULT_ARGUMENTS);
#endif