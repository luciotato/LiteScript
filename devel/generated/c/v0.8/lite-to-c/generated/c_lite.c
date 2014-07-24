#include "c_lite.h"
//-------------------------
//Module c_lite
//-------------------------
#include "c_lite.c.extra"
var c_lite_VERSION, c_lite_BUILD_DATE;
var c_lite_usage;
var c_lite_args;
var c_lite_mainModuleName, c_lite_compileAndRunOption, c_lite_compileAndRunParams;
var c_lite_options;
any c_lite_startCompilation(DEFAULT_ARGUMENTS); //forward declare
//##Lite-c
//This is the command line interface to LiteScript Compiler,
//when it is generated as C-code standalone executable 

    ////lexer options literal map 
    ////call new Map() to create literal objects 
    //// `{name:value}` => `new Map().fromObject({name:value})` 

    //global import fs, path
    

    //import color, ControlledError
    
    //import OptionsParser  
    

    //import GeneralOptions, Compiler, ASTBase
    

    ////lexer options literal map

    //var 
        //VERSION = '0.8.1'
        //BUILD_DATE = '__TIMESTAMP__'

//## module vars

    //var usage = """
    
    //LiteScript-C v#{VERSION} #{BUILD_DATE}
    
    //Usage: litec main.lite.md [options]
    
    //options are:
    //-o dir           output dir. Default is './out'
    //-v, -verbose     verbose level, default is 0 (0-3)
    //-w, -warning     warning level, default is 1 (0-1)
    //-comments        comment level on generated files, default is 1 (0-2)
    //-version         print LiteScript version & exit

    //Advanced options:
    //-D FOO -D BAR    Defines preprocessor names (#ifdef FOO/#ifndef BAR)
    //-d, -debug       enable full compiler debug log file at 'out/debug.logger'
    
    //"""

//Get & parse command line arguments

    //print JSON.stringify(process.argv)

    //var args = new OptionsParser(process.argv)

    //var 
        //mainModuleName
        //compileAndRunOption:boolean
        //compileAndRunParams:array

//Check for -help

    //if args.option('h','help') 
        //print usage
        //process.exit 0

//Check for -version

    //if args.option('vers','version') 
        //print VERSION
        //process.exit 0

//Check for -run

    //if args.valueFor('r','run') into mainModuleName
        //compileAndRunOption = true
        //compileAndRunParams = args.items.splice(args.lastIndex) #remove params after --run


//Check for other options

    //var options = new GeneralOptions()

    //with options

        //.outDir  = path.resolve(args.valueFor('o') or './out') //output dir
        //.verboseLevel = parseInt(args.valueFor('v',"verbose") or 0) 
        //.warningLevel = parseInt(args.valueFor('w',"warning") or 1)
        //.comments= parseInt(args.valueFor('comment',"comments") or 1) 
        //.debugEnabled = args.option('d',"debug") 
        //.defines = []


    ////var compilerPath = use and use.charAt(0) is 'v'? '../../liteCompiler-#{use}' : '.'

    //while args.valueFor('D') into var newDef
        //options.defines.push newDef

//get mainModuleName

    //if no args.items.length
        //console.error "Missing file.lite.md to compile\nlite -h for help"
        //process.exit 

    ////only main module name should be left
    //if args.items.length>1
        //print "Invalid arguments:", args.items.join(' ')
        //print "lite -h for help"
        //process.exit 2
        
    //mainModuleName = args.items[0]

//show args

    ////console.log(process.cwd());
    //if options.verboseLevel > 1
        //print """
            //compiler version: #{Compiler.version} #{Compiler.buildDate}
            //compiler options: \n#{options}
            //cwd: #{process.cwd()}
            //compile: #{mainModuleName}
            //"""

        //if options.debugEnabled 
            //print color.yellow,"GENERATING COMPILER DEBUG AT out/debug.logger",color.normal

//launch project compilation

    //startCompilation

    //function startCompilation
    any c_lite_startCompilation(DEFAULT_ARGUMENTS){ try{

        //Compiler.compileProject(mainModuleName, options);
        Compiler_compileProject(undefined,2,(any_arr){c_lite_mainModuleName, c_lite_options});

//Compile Exception handler

        //exception err
        
        }catch(err){

            //if err instance of ControlledError
            if (_instanceof(err,ControlledError))  {
                //console.error color.red, err.message, color.normal
                console_error(undefined,3,(any_arr){color_red, PROP(message_,err), color_normal});
                //process.exit 1
                process_exit(undefined,1,(any_arr){any_number(1)});
            }
            
            //else if err.code is 'EISDIR'
            
            else if (__is(PROP(code_,err),any_str("EISDIR")))  {
                //console.error '#{color.red}ERROR: "#{mainModuleName}" is a directory#{color.normal}'
                console_error(undefined,1,(any_arr){_concatAny(5,color_red, any_str("ERROR: \""), c_lite_mainModuleName, any_str("\" is a directory"), color_normal)});
                //console.error 'Please specify a *file* as the main module to compile'
                console_error(undefined,1,(any_arr){any_str("Please specify a *file* as the main module to compile")});
                //process.exit 2
                process_exit(undefined,1,(any_arr){any_number(2)});
            }
            
            //else 
            
            else {
                //console.error 'UNCONTROLLED ERROR:'
                console_error(undefined,1,(any_arr){any_str("UNCONTROLLED ERROR:")});
                //console.error err
                console_error(undefined,1,(any_arr){err});
                //console.error err.stack
                console_error(undefined,1,(any_arr){PROP(stack_,err)});
                //process.exit 3
                process_exit(undefined,1,(any_arr){any_number(3)});
            };
        };
    return undefined;
    }

//-------------------------
void c_lite__moduleInit(void){
    c_lite_VERSION = any_str("0.8.1");
    c_lite_BUILD_DATE = any_str("2014-07-23T22:10:20.252Z");
    c_lite_usage = _concatAny(5,any_str("\n    LiteScript-C v"), c_lite_VERSION, any_str(" "), c_lite_BUILD_DATE, any_str("\n\n    Usage: litec main.lite.md [options]\n\n    options are:\n    -o dir           output dir. Default is './out'\n    -v, -verbose     verbose level, default is 0 (0-3)\n    -w, -warning     warning level, default is 1 (0-1)\n    -comments        comment level on generated files, default is 1 (0-2)\n    -version         print LiteScript version & exit\n\n    Advanced options:\n    -D FOO -D BAR    Defines preprocessor names (#ifdef FOO/#ifndef BAR)\n    -d, -debug       enable full compiler debug log file at 'out/debug.logger'\n"));
    c_lite_args = new(OptionsParser,1,(any_arr){process_argv});
    c_lite_options = new(GeneralOptions,0,NULL);
    print(1,(any_arr){JSON_stringify(undefined,1,(any_arr){process_argv})});
    if (_anyToBool(METHOD(option_,c_lite_args)(c_lite_args,2,(any_arr){any_str("h"), any_str("help")})))  {
        print(1,(any_arr){c_lite_usage});
        process_exit(undefined,1,(any_arr){any_number(0)});
    };
    if (_anyToBool(METHOD(option_,c_lite_args)(c_lite_args,2,(any_arr){any_str("vers"), any_str("version")})))  {
        print(1,(any_arr){c_lite_VERSION});
        process_exit(undefined,1,(any_arr){any_number(0)});
    };
    if (_anyToBool((c_lite_mainModuleName=METHOD(valueFor_,c_lite_args)(c_lite_args,2,(any_arr){any_str("r"), any_str("run")}))))  {
        c_lite_compileAndRunOption = true;
        c_lite_compileAndRunParams = __call(splice_,PROP(items_,c_lite_args),1,(any_arr){PROP(lastIndex_,c_lite_args)});// #remove params after --run
    };
    var c_lite__with1=c_lite_options;
        PROP(outDir_,c_lite__with1) = path_resolve(undefined,1,(any_arr){(_anyToBool(__or1=METHOD(valueFor_,c_lite_args)(c_lite_args,1,(any_arr){any_str("o")}))? __or1 : any_str("./out"))}); //output dir
        PROP(verboseLevel_,c_lite__with1) = parseInt(undefined,1,(any_arr){(_anyToBool(__or2=METHOD(valueFor_,c_lite_args)(c_lite_args,2,(any_arr){any_str("v"), any_str("verbose")}))? __or2 : any_number(0))});
        PROP(warningLevel_,c_lite__with1) = parseInt(undefined,1,(any_arr){(_anyToBool(__or3=METHOD(valueFor_,c_lite_args)(c_lite_args,2,(any_arr){any_str("w"), any_str("warning")}))? __or3 : any_number(1))});
        PROP(comments_,c_lite__with1) = parseInt(undefined,1,(any_arr){(_anyToBool(__or4=METHOD(valueFor_,c_lite_args)(c_lite_args,2,(any_arr){any_str("comment"), any_str("comments")}))? __or4 : any_number(1))});
        PROP(debugEnabled_,c_lite__with1) = METHOD(option_,c_lite_args)(c_lite_args,2,(any_arr){any_str("d"), any_str("debug")});
        PROP(defines_,c_lite__with1) = new(Array,0,NULL);
    ;
    var c_lite_newDef=undefined;
    while(_anyToBool((c_lite_newDef=METHOD(valueFor_,c_lite_args)(c_lite_args,1,(any_arr){any_str("D")})))){
        __call(push_,PROP(defines_,c_lite_options),1,(any_arr){c_lite_newDef});
    };// end loop
    if (!_length(PROP(items_,c_lite_args)))  {
        console_error(undefined,1,(any_arr){any_str("Missing file.lite.md to compile\nlite -h for help")});
        process_exit(undefined,0,NULL);
    };
    if (_length(PROP(items_,c_lite_args)) > 1)  {
        print(2,(any_arr){any_str("Invalid arguments:"), __call(join_,PROP(items_,c_lite_args),1,(any_arr){any_str(" ")})});
        print(1,(any_arr){any_str("lite -h for help")});
        process_exit(undefined,1,(any_arr){any_number(2)});
    };
    c_lite_mainModuleName = ITEM(0,PROP(items_,c_lite_args));
    if (_anyToNumber(PROP(verboseLevel_,c_lite_options)) > 1)  {
        print(1,(any_arr){_concatAny(10,any_str("compiler version: "), Compiler_version, any_str(" "), Compiler_buildDate, any_str("\ncompiler options: \n"), c_lite_options, any_str("\ncwd: "), process_cwd(undefined,0,NULL), any_str("\ncompile: "), c_lite_mainModuleName)});
        if (_anyToBool(PROP(debugEnabled_,c_lite_options)))  {
            print(3,(any_arr){color_yellow, any_str("GENERATING COMPILER DEBUG AT out/debug.logger"), color_normal});
        };
    };
    c_lite_startCompilation(undefined,0,NULL);
};
