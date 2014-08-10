#include "Test3.h"
//-------------------------
//Module Test3
//-------------------------
//-------------------------
//NAMESPACE Test3
//-------------------------
var Test3_parseFn;
var Test3_file;
var Test3_outPath;
var Test3_toplevel;
var Test3_code;
var Test3_sortedResult;

    //print "LiteScript-translated Uglify version - with Iterable"

    //ifdef TARGET_C
    //print "standalone native exe"
    //else
    //print "generated-js code"
    //endif

    //print "cwd:", process.cwd()

    //import fs, TestOut


    //import ParserWithIterable

//------------------
void Test3__namespaceInit(void){
    print(1,(any_arr){any_LTR("LiteScript-translated Uglify version - with Iterable")});
    print(1,(any_arr){any_LTR("standalone native exe")});
    print(2,(any_arr){any_LTR("cwd:"), process_cwd(undefined,0,NULL)});    Test3_parseFn = any_func(ParserWithIterable_PRS_parse);
    Test3_file = any_LTR("jquery-1.11.1.js");
    Test3_outPath = any_LTR("out/lite");
    //var parseFn=ParserWithIterable.PRS.parse

    //var file = "jquery-1.11.1.js"

    //var outPath = "out/lite"

    //console.time('all')
    console_time(undefined,1,(any_arr){any_LTR("all")
   });    Test3_toplevel = null;
    Test3_code = fs_readFileSync(undefined,2,(any_arr){Test3_file
       , any_LTR("utf8")
   });

    //var toplevel = null;
    //var code = fs.readFileSync(file, "utf8")

    //console.time 'parse'
    console_time(undefined,1,(any_arr){any_LTR("parse")
   });

    //toplevel = parseFn.call(undefined, code, {
                             //filename: file
    Test3_toplevel = __apply(Test3_parseFn,undefined,2,(any_arr){Test3_code
       , new(Map,1,(any_arr){
                             _newPair("filename",Test3_file)
    })
   });
                             //});

    //console.timeEnd('parse');
    console_timeEnd(undefined,1,(any_arr){any_LTR("parse")
   });

   /*

   Test3_sortedResult = TestOut_mkSorted(undefined,2,(any_arr){any_LTR("toplevel")
      , Test3_toplevel
  });

    //var result:string = JSON.stringify(toplevel,null,2)

    //var sortedResult = TestOut.mkSorted("toplevel", toplevel)

     *     //print sortedResult.length
    print(1,(any_arr){any_number(_length(Test3_sortedResult))});

    //TestOut.saveFiles outPath, sortedResult
    TestOut_saveFiles(undefined,2,(any_arr){Test3_outPath
       , Test3_sortedResult
   });

    //console.timeEnd 'all'
    console_timeEnd(undefined,1,(any_arr){any_LTR("all")
   });
     */
};


//-------------------------
void Test3__moduleInit(void){
    Test3__namespaceInit();
};
