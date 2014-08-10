/*
 * File:   String_charCodeAt.c
 * Author: ltato
 *
 * Created on Aug 4, 2014, 2:00:07 AM
 */

#include <stdio.h>
#include <stdlib.h>
#include "LiteC-core.h"

/*
 * Simple C Test Suite
 */


float showString(any list){
    int codepointlen = utf8len(list);
    float total=0;
    for(int n=0;n<codepointlen;n++){
        any result = String_charCodeAt(list, 1, (any_arr){any_number(n)});
        printf("0x%x %d\n",(uint32_t)result.value.number, (uint32_t)result.value.number);
        //print(1,&result);
        total+=result.value.number;
    }
    return total;
}

void testString_charCodeAt() {
    any this;
    len_t argc;
    any* arguments;

    var list = any_LTR("01234ABCDabcd \u0200\u041a\u043b\u0443\u0431\u0F31\uFEB0\U000AAAAA");

    char aschar[2];
    aschar[1]=0;
    printf("----------\n");
    for(int n=0;n<list.len;n++){
        aschar[0]=list.value.str[n];
        printf("%s %x %d\n",aschar,(byte)list.value.str[n], (byte)list.value.str[n]);
    }
    printf("----------\n");

    float expected = 773890;
    float total=showString(list);
    if (total!=expected) {
        printf("%%TEST_FAILED%% time=0 testname=testString_charCodeAt (String_charCodeAt) message=result is %f expected %f\n"
                 ,total,expected);
    }
}

void testString_fromCharCode() {
    any this;
    len_t argc;
    any* arguments;

    var list_expected = any_LTR("AB01\u0200\u041a\u043b\u0443\u0431\u0F31");

    var list = String_fromCharCode(undefined,12,(any_arr){
        any_number('A')
        ,any_number('B')
        ,any_number(48)
        ,any_number(49)
        ,any_number(0x0200)
        ,any_number(0x041a)
        ,any_number(0x043b)
        ,any_number(0x0443)
        ,any_number(0x0431)
        ,any_number(0x0F31)
        ,any_number(0xABCD) // 43981 binary, 1010 1011 1100 1101
        ,any_number(699050) // 0xAAAAA = 1010 1010 1010 1010 1010 (20 bits)
        //
    });

    char aschar[2];
    aschar[1]=0;
    printf("----------\n");
    for(int n=0;n<list.len;n++){
        aschar[0]=list.value.str[n];
        printf("%s %x %d\n",aschar,(byte)list.value.str[n], (byte)list.value.str[n]);
    }
    printf("----------\n");

    float expected = 751957;
    float total=showString(list);
    if (total!=expected) {
        printf("%%TEST_FAILED%% time=0 testname=testString_fromCharCode (String_fromCharCode) message=result is %f expected %f\n"
                 ,total,expected);
    }
}

int main(int argc, char** argv) {

    LiteC_init( 0, argc,argv);

    printf("%%SUITE_STARTING%% String_charCodeAt\n");
    printf("%%SUITE_STARTED%%\n");

    printf("%%TEST_STARTED%%  testString_charCodeAt (String_charCodeAt)\n");
    testString_charCodeAt();
    printf("%%TEST_FINISHED%% time=0 testString_charCodeAt (String_charCodeAt)\n");

    printf("%%TEST_STARTED%%  testString_fromCharCode (String_fromCharCode)\n");
    testString_fromCharCode();
    printf("%%TEST_FINISHED%% time=0 testString_fromCharCode (String_fromCharCode)\n");

    printf("%%SUITE_FINISHED%% time=0\n");

    LiteC_finish();
    return (EXIT_SUCCESS);
}
