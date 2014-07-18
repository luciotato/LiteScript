#include "test.h"
//-------------------------
//Module test
//-------------------------
any test_inRange(DEFAULT_ARGUMENTS); //forward declare
    //-----------------------
    // Class test_TestClass: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr test_TestClass_METHODS = {
      { indexOf_, test_TestClass_indexOf },
      { sliceJoin_, test_TestClass_sliceJoin },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t test_TestClass_PROPS[] = {
    myArr_
    };
    
    

//--------------
    // test_TestClass
    any test_TestClass; //Class test_TestClass

        //properties
            //myArr: string array
        ;

        //constructor new TestClass(initValue:array)
        void test_TestClass__init(DEFAULT_ARGUMENTS){
            
            // define named params
            var initValue= argc? arguments[0] : undefined;
            //---------
            //.myArr = initValue
            PROP(myArr_,this) = initValue;
        }

        //method indexOf(searched:string, fromIndex:number=0) returns number
        any test_TestClass_indexOf(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,test_TestClass));
            //---------
            // define named params
            var searched, fromIndex;
            searched=fromIndex=undefined;
            switch(argc){
              case 2:fromIndex=arguments[1];
              case 1:searched=arguments[0];
            }
            //---------

            //for n=fromIndex while n<.myArr.length
            for(int64_t n=_anyToNumber(fromIndex); n < _length(PROP(myArr_,this)); n++) {
                //if .myArr[n] is searched, return n;
                if (__is(ITEM(n,PROP(myArr_,this)),searched)) {return any_number(n);};
            };// end for n
            //return -1
            return any_number(-1);
        return undefined;
        }

        //method sliceJoin(start, endPos) returns string
        any test_TestClass_sliceJoin(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,test_TestClass));
            //---------
            // define named params
            var start, endPos;
            start=endPos=undefined;
            switch(argc){
              case 2:endPos=arguments[1];
              case 1:start=arguments[0];
            }
            //---------

            //var len = .myArr.length
            var len = any_number(_length(PROP(myArr_,this)));

            //default endPos = len+1
            _default(&endPos,any_number(_anyToNumber(len) + 1));

            //start = inRange( 0, start<0?len+start:start , len-1)
            start = test_inRange(undefined,3,(any_arr){any_number(0), _anyToNumber(start) < 0 ? any_number(_anyToNumber(len) + _anyToNumber(start)) : start, any_number(_anyToNumber(len) - 1)});

            //endPos = inRange( 0, endPos<0?len+endPos:endPos , len-1)
            endPos = test_inRange(undefined,3,(any_arr){any_number(0), _anyToNumber(endPos) < 0 ? any_number(_anyToNumber(len) + _anyToNumber(endPos)) : endPos, any_number(_anyToNumber(len) - 1)});

            //if start>=endPos, return ''
            if (_anyToNumber(start) >= _anyToNumber(endPos)) {return any_EMPTY_STR;};

            //var result:string = ""
            var result = any_EMPTY_STR;
            //for n=start to endPos 
            int64_t _end1=_anyToNumber(endPos);
            for(int64_t n=_anyToNumber(start); n<=_end1; n++) {
                //result = "#{result}#{.myArr[n]} ";
                result = _concatAny(3,(any_arr){result, ITEM(n,PROP(myArr_,this)), any_str(" ")});
            };// end for n

            //return result
            return result;
        return undefined;
        }
// Test

    //public function inRange(min, value, max) returns number
    any test_inRange(DEFAULT_ARGUMENTS){
        // define named params
        var min, value, max;
        min=value=max=undefined;
        switch(argc){
          case 3:max=arguments[2];
          case 2:value=arguments[1];
          case 1:min=arguments[0];
        }
        //---------
        //return case 
        return // when value<min then min
                (_anyToNumber(value) < _anyToNumber(min)) ? (min) :
                // when value>max then max
                (_anyToNumber(value) > _anyToNumber(max)) ? (max) :
        /* else */ value;
    return undefined;
    }

//-------------------------
void test__moduleInit(void){
        test_TestClass =_newClass("test_TestClass", test_TestClass__init, sizeof(struct test_TestClass_s), Object.value.classINFOptr);
        _declareMethods(test_TestClass, test_TestClass_METHODS);
        _declareProps(test_TestClass, test_TestClass_PROPS, sizeof test_TestClass_PROPS);
    
};