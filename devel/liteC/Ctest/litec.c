//Compiled by LiteScript compiler v0.8.1, source: /home/ltato/LiteScript/devel/source-v0.8/C/litec.lite.md
#include "litec.h"
// ## This is the command line interface to LiteScript-C Compiler

   // import path, fs, log
   #include "path.h"
   #include "fs.h"
   #include "log.h"
   // import OptionsParser,color
   #include "OptionsParser.h"
   #include "color.h"
   var VERSION;
   var usage;

   // class LiteC_Options
   
   
       //class _init fn
       void LiteC_Options__init(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==LiteC_Options_TYPEID);
           //---------
           // define named params
           var args= argc? arguments[0] : undefined;
           //---------
           ((LiteC_Options_ptr)this.value.ptr)->outDir = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->verbose = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->warning = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->comments = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->target = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->debug = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->skip = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->single = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->compileIfNewer = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->defines = undefined;
           ((LiteC_Options_ptr)this.value.ptr)->outDir = _resolve(path,1,(any_arr){
           __or(_value(args,1,(any_arr){
           any_str("o")
           }),any_str("."))
           }); //output dir
           ((LiteC_Options_ptr)this.value.ptr)->verbose = Number(NONE,1,(any_arr){
           __or(_value(args,2,(any_arr){
           any_str("v"), 
           any_str("verbose")
           }),any_number(0))
           });
           ((LiteC_Options_ptr)this.value.ptr)->warning = Number(NONE,1,(any_arr){
           __or(_value(args,2,(any_arr){
           any_str("w"), 
           any_str("warning")
           }),any_number(1))
           });
           ((LiteC_Options_ptr)this.value.ptr)->comments = Number(NONE,1,(any_arr){
           __or(_value(args,2,(any_arr){
           any_str("comment"), 
           any_str("comments")
           }),any_number(1))
           });
           ((LiteC_Options_ptr)this.value.ptr)->target = __or(_value(args,1,(any_arr){
           any_str("target")
           }),any_str("js")); //target
           ((LiteC_Options_ptr)this.value.ptr)->debug = _option(args,2,(any_arr){
           any_str("d"), 
           any_str("debug")
           });
           ((LiteC_Options_ptr)this.value.ptr)->skip = _option(args,2,(any_arr){
           any_str("noval"), 
           any_str("novalidation")
           }); // skip name validation
           ((LiteC_Options_ptr)this.value.ptr)->single = _option(args,2,(any_arr){
           any_str("s"), 
           any_str("single")
           }); // single file- do not follow require() calls
           ((LiteC_Options_ptr)this.value.ptr)->compileIfNewer = _option(args,2,(any_arr){
           any_str("ifn"), 
           any_str("ifnew")
           }); // single file, compile if source is newer
           ((LiteC_Options_ptr)this.value.ptr)->defines = _newArrayWith(0,NULL);
       };

       // method toString
       any LiteC_Options_toString(any this, len_t argc, any* arguments){
           
           
           // validate this type
           assert(this.type==LiteC_Options_TYPEID);
           //---------
           return any_concat(NONE,6,(any_arr){
           any_str("outDir:"), 
           ((LiteC_Options_ptr)this.value.ptr)->outDir, 
           any_str("\nverbose:"), 
           ((LiteC_Options_ptr)this.value.ptr)->verbose, 
           any_str("\ndefines:"), 
           (_join(((LiteC_Options_ptr)this.value.ptr)->defines,0,NULL))
           });
       }
       ;var a;

   // function initFunction()
   any  initFunction(any this, len_t argc, any* arguments){

// Get & process command line arguments

       var args = new(OptionsParser_TYPEID,1,(any_arr){
       ((process_ptr)process.value.ptr)->argv
       });
       ;

       var mainModuleName = undefined, compileAndRunOption = undefined, compileAndRunParams = undefined;
       ;

// Check for -help

       // if args.option('h','help')
       if (anyToBool(_option(args,2,(any_arr){
       any_str("h"), 
       any_str("help")
       })))  {
           console_log_(NONE,1,(any_arr){usage});
           _exit_(process,1,(any_arr){
           any_number(0)
           });
       };

// Check for -version

       // if args.option('vers','version')
       if (anyToBool(_option(args,2,(any_arr){
       any_str("vers"), 
       any_str("version")
       })))  {
           console_log_(NONE,1,(any_arr){VERSION});
           _exit_(process,1,(any_arr){
           any_number(0)
           });
       };

// Check for -run

       // if args.value('r','run') into mainModuleName
       if (anyToBool((mainModuleName=_value(args,2,(any_arr){
       any_str("r"), 
       any_str("run")
       }))))  {
           compileAndRunOption = any_TRUE;
           compileAndRunParams = _splice(((OptionsParser_ptr)args.value.ptr)->items,1,(any_arr){
           ((OptionsParser_ptr)args.value.ptr)->lastIndex
           });// #remove params after --run
       };

// get compiler version to --use

       var use = _value(args,2,(any_arr){
       any_str("u"), 
       any_str("use")
       });
       ;

// Check for other options

       var options = new(LiteC_Options_TYPEID,1,(any_arr){
       args
       });
       ;

       var compilerPath = // when use like /^v.*/ then '../../liteCompiler-#{use}'
           (RegExp_test(use,"/^v.*/")) ? (any_concat(NONE,2,(any_arr){
           any_str("../../liteCompiler-"), 
           use
           })) :
            // when no use then '.'
           (!anyToBool(use)) ? (any_str(".")) :
       /* else */ use;
       ;

       // while args.value('D') into var newDef
       var newDef=undefined;
       while(anyToBool((newDef=_value(args,1,(any_arr){
       any_str("D")
       })))){
           _push(((LiteC_Options_ptr)options.value.ptr)->defines,1,(any_arr){
           newDef
           });
       };// end loop

// load required version of LiteScript compiler

        // #declare global __dirname
        // #print "at: #{__dirname}, require '#{compilerPath}/Compiler.js'"

       var Compiler = undefined;
       ;
        // declare valid Compiler.compileProject
        // declare valid Compiler.compile

        // declare valid Compiler.version
        // declare valid Compiler.buildDate

//         if options.verbose, print 'LiteScript compiler version #{Compiler.version}  #{Compiler.buildDate}'
//         

// get mainModuleName

       // if no mainModuleName, mainModuleName = args.value('c',"compile")
       if (!anyToBool(mainModuleName)) {mainModuleName = _value(args,2,(any_arr){
       any_str("c"), 
       any_str("compile")
       });};

        //no args should be left
       // if args.items.length
       if (length(((OptionsParser_ptr)args.value.ptr)->items))  {
           console_log_(NONE,2,(any_arr){any_str("Invalid arguments:"), _join(((OptionsParser_ptr)args.value.ptr)->items,1,(any_arr){
           any_str(" ")
           })});
           console_log_(NONE,1,(any_arr){any_str("lite -h for help")});
           _exit_(process,1,(any_arr){
           any_number(2)
           });
       };

       // if no mainModuleName
       if (!anyToBool(mainModuleName))  {
           _error_(console,1,(any_arr){
           any_str("Missing -compile MainModule or -run filename.\nlite -h for help")
           });
           _exit_(process,1,(any_arr){
           any_number(2)
           });
       };

// show args

        //console.log(process.cwd());
       // if options.verbose>1
       if (anyToNumber(((LiteC_Options_ptr)options.value.ptr)->verbose) > 1)  {
           console_log_(NONE,1,(any_arr){any_concat(NONE,2,(any_arr){
           any_str("\n\ncompiler path: "), 
           compilerPath
           })});
           console_log_(NONE,1,(any_arr){any_concat(NONE,2,(any_arr){
           any_str("compiler options: \n"), 
           options
           })});
           console_log_(NONE,1,(any_arr){any_concat(NONE,2,(any_arr){
           any_str("cwd: "), 
           (_cwd(process,0,NULL))
           })});
           console_log_(NONE,1,(any_arr){any_concat(NONE,4,(any_arr){
           any_str("compile"), 
           (anyToBool(compileAndRunOption) ? any_str(" and run") : any_EMPTY_STR), 
           any_str(": "), 
           mainModuleName
           })});
           // if options.debug, print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.log",color.normal
           if (anyToBool(((LiteC_Options_ptr)options.value.ptr)->debug)) {console_log_(NONE,3,(any_arr){((color_ptr)color.value.ptr)->yellow, any_str("GENERATING COMPILER DEBUG AT out/debug.log"), ((color_ptr)color.value.ptr)->normal});};
       };


// launch project compilation

       // try
       try{

// if "compile and run", load & compile single file and run it

           // if compileAndRunOption
           if (anyToBool(compileAndRunOption))  {
               compileAndRun(NONE,4,(any_arr){
               compileAndRunParams, 
               Compiler, 
               mainModuleName, 
               options
               });
           }

// else, launch compile Project
           
           else {
               launchCompilation(NONE,3,(any_arr){
               Compiler, 
               mainModuleName, 
               options
               });
           };
       
       }catch(e){

            // declare valid e.extra.get
            // declare valid e.extra.has
           // if e.extra and e.extra.has("controled")
           if (anyToBool(((Error_ptr)e.value.ptr)->extra) && anyToBool(_has(((Error_ptr)e.value.ptr)->extra,1,(any_arr){
           any_str("controled")
           })))  {
               _error_(console,3,(any_arr){
               ((color_ptr)color.value.ptr)->red, 
               ((Error_ptr)e.value.ptr)->message, 
               ((color_ptr)color.value.ptr)->normal
               });
               _exit_(process,1,(any_arr){
               any_number(1)
               });
           }
           
           else if (anyToBool(((Error_ptr)e.value.ptr)->extra) && __is(_get(((Error_ptr)e.value.ptr)->extra,1,(any_arr){
           any_str("code")
           }),any_str("EISDIR")))  {
               _error_(console,1,(any_arr){
               any_concat(NONE,5,(any_arr){
               ((color_ptr)color.value.ptr)->red, 
               any_str("ERROR: \""), 
               mainModuleName, 
               any_str("\" is a directory"), 
               ((color_ptr)color.value.ptr)->normal
               })
               });
               _error_(console,1,(any_arr){
               any_str("Please specify a *file* as the main module to compile")
               });
               _exit_(process,1,(any_arr){
               any_number(2)
               });
           }
           
           else {
               _log_(console,1,(any_arr){
               any_str("UNCONTROLED ERROR:")
               });
               _log_(console,1,(any_arr){
               e
               });
               // throw e;
               throw(e);
           };
       };

       // end exception
       
   }
   ;

   // function launchCompilation( mainModuleName, options)
   any  launchCompilation(any this, len_t argc, any* arguments){
       // define named params
       var mainModuleName, options;
       mainModuleName=options=undefined;
       switch(argc){
         case 2:options=arguments[1];
         case 1:mainModuleName=arguments[0];
       }
       //---------

       //do nothing
       ;
   }
   ;
        //Compiler.compileProject(mainModuleName, options);

   // function compileAndRun(compileAndRunParams,mainModuleName,options)
   any  compileAndRun(any this, len_t argc, any* arguments){
       // define named params
       var compileAndRunParams, mainModuleName, options;
       compileAndRunParams=mainModuleName=options=undefined;
       switch(argc){
         case 3:options=arguments[2];
         case 2:mainModuleName=arguments[1];
         case 1:compileAndRunParams=arguments[0];
       }
       //---------

       // fail with 'NOT IMPLEMENTED for C code generation'
       throw(new(Error_TYPEID,1,(any_arr){any_str("NOT IMPLEMENTED for C code generation")}));;
   }
   ;
//-------------------------------
int main(int argc, char** argv) {
   __init_core_support(argc,argv); //see _dispatcher.c
   VERSION = any_str("0.8.1");
   usage = any_concat(NONE,3,(any_arr){
   any_str("\nLiteScript-C v"), 
   VERSION, 
   any_str("\n\nUsage:\n        litec -compile mainModule.lite.md [options]\n\nThis command will compile mainModule.lite.md\n\noptions are:\n-c, -compile     compile project, mainModule & all dependent files\n-o dir           output dir. Default is \'.\'\n-v, -verbose     verbose level, default is 0 (0-3)\n-w, -warning     warning level, default is 1 (0-1)\n-comments        comment level on generated files, default is 1 (0-2)\n-version         print LiteScript version & exit\n\nAdvanced options:\n-s,  -single     compile single file. do not follow import/require() calls\n-ifn, -ifnew     compile only if source is newer\n-noval           skip property name validation\n-D FOO -D BAR    Defines preprocessor names (#ifdef FOO/#ifndef BAR)\n-u, -use vX.Y.Z  select LiteScript Compiler Version to use (devel)\n-d, -debug       enable full compiler debug log file at \'out/debug.log\'\n")
   });
   _message(log_,1,(any_arr){
   any_str("starting")
   });a = _newArrayWith(3,(any_arr){any_str("1"), any_str("2"), any_str("3")});
   _apply_function(_message,log_,a);
   initFunction(NONE,0,NULL);
   // end main function
   
}//end main function

//# sourceMappingURL=litec.c.map