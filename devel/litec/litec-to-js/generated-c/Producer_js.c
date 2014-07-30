#include "Producer_js.h"
//-------------------------
//Module Producer_js
//-------------------------
#include "Producer_js.c.extra"
var Producer_js_NL;
var Producer_js_OPER_TRANSLATION_map;
any Producer_js_operTranslate(DEFAULT_ARGUMENTS); //forward declare
//Producer JS
//===========
//The `producer` module extends Grammar classes, adding a `produce()` method 
//to generate target code for the node.
//The compiler calls the `.produce()` method of the root 'Module' node 
//in order to return the compiled code for the entire tree.
//We extend the Grammar classes, so this module require the `Grammar` module.
    //import ASTBase, Grammar, Environment, UniqueID 
    
    //shim import Map
    
    
//JavaScript Producer Functions
//==============================
//### Append to class Grammar.Module ###
    
//#### method produce()
     any Grammar_Module_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Module));
        //---------
//if a 'export default' was declared, set the referenced namespace 
//as the new 'export default' (instead of 'module.exports')
        //.lexer.outCode.exportNamespace = 'module.exports'
        PROP(exportNamespace_,PROP(outCode_,PROP(lexer_,this))) = any_LTR("module.exports");
        ///*if .exportDefault instance of ASTBase
            //declare valid .exportDefault.name
            //.lexer.outCode.exportNamespace = .exportDefault.name
        //end if
        //*/
        //for each statement in .statements
        any _list65=PROP(statements_,this);
        { var statement=undefined;
        for(int statement__inx=0 ; statement__inx<_list65.value.arr->length ; statement__inx++){statement=ITEM(statement__inx,_list65);
        
            //statement.produce()
            METHOD(produce_,statement)(statement,0,NULL);
        }};// end for each in
        //.out NL
        METHOD(out_,this)(this,1,(any_arr){Producer_js_NL
        });
        ////add end of file comments
        //.outSourceLinesAsComment .lexer.infoLines.length
        METHOD(outSourceLinesAsComment_,this)(this,1,(any_arr){any_number(_length(PROP(infoLines_,PROP(lexer_,this))))
        });
//export 'export default' namespace, if it was set.
        //if not .lexer.outCode.browser
        if (!(_anyToBool(PROP(browser_,PROP(outCode_,PROP(lexer_,this))))))  {
            //if .exportsReplaced
            if (_anyToBool(PROP(exportsReplaced_,this)))  {
                //.out 'module.exports=',.exports.name,";",NL
                METHOD(out_,this)(this,4,(any_arr){any_LTR("module.exports=")
, PROP(name_,PROP(exports_,this))
, any_LTR(";")
, Producer_js_NL
                });
            };
        };
     return undefined;
     }
//### Append to class Grammar.Body ### and Module (derives from Body)
    
//A "Body" is an ordered list of statements.
//"Body"s lines have all the same indent, representing a scope.
//"Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.
      //method produce()
      any Grammar_Body_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Body));
        //---------
        //for each statement in .statements
        any _list66=PROP(statements_,this);
        { var statement=undefined;
        for(int statement__inx=0 ; statement__inx<_list66.value.arr->length ; statement__inx++){statement=ITEM(statement__inx,_list66);
        
          //statement.produce()
          METHOD(produce_,statement)(statement,0,NULL);
        }};// end for each in
        //.out NL
        METHOD(out_,this)(this,1,(any_arr){Producer_js_NL
        });
      return undefined;
      }
//-------------------------------------
//### append to class Grammar.Statement ###
    
//`Statement` objects call their specific statement node's `produce()` method
//after adding any comment lines preceding the statement
      //method produce()
      any Grammar_Statement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Statement));
        //---------
//add previous comment lines, in the same position as the source
        //.outSourceLinesAsComment
        METHOD(outSourceLinesAsComment_,this)(this,0,NULL);
//To enhance compiled code readability, add original Lite line as comment 
        //if .lexer.options.comments // and .lexer.outCode.lastOriginalCodeComment<.lineInx
        if (_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this)))))  { // and .lexer.outCode.lastOriginalCodeComment<.lineInx
               
            //var commentTo =  .lastSourceLineNum
            var commentTo = PROP(lastSourceLineNum_,this);
            //if .specific has property "body"
            if (_anyToBool((_anyToBool(__or1=(_anyToBool(__or2=(_anyToBool(__or3=(_anyToBool(__or4=any_number(_hasProperty(PROP(specific_,this),any_LTR("body"))))? __or4 : any_number(_instanceof(PROP(specific_,this),Grammar_IfStatement))))? __or3 : any_number(_instanceof(PROP(specific_,this),Grammar_WithStatement))))? __or2 : any_number(_instanceof(PROP(specific_,this),Grammar_ForStatement))))? __or1 : any_number(_instanceof(PROP(specific_,this),Grammar_CaseStatement)))))  {
                //or .specific is instance of Grammar.IfStatement
                //or .specific is instance of Grammar.WithStatement
                //or .specific is instance of Grammar.ForStatement
                //or .specific is instance of Grammar.CaseStatement
                    //commentTo =  .sourceLineNum
                    commentTo = PROP(sourceLineNum_,this);
            };
            //.outSourceLinesAsComment commentTo
            METHOD(outSourceLinesAsComment_,this)(this,1,(any_arr){commentTo
            });
            //.lexer.outCode.lastOriginalCodeComment = commentTo
            PROP(lastOriginalCodeComment_,PROP(outCode_,PROP(lexer_,this))) = commentTo;
        };
//Each statement in its own line
        //if .specific isnt instance of Grammar.SingleLineBody
        if (!(_instanceof(PROP(specific_,this),Grammar_SingleLineBody)))  {
            //.lexer.outCode.ensureNewLine
            __call(ensureNewLine_,PROP(outCode_,PROP(lexer_,this)),0,NULL);
        };
//if there are one or more 'into var x' in a expression in this statement, 
//declare vars before statement (exclude body of FunctionDeclaration)
        //this.callOnSubTree "declareIntoVar", Grammar.Body
        METHOD(callOnSubTree_,this)(this,2,(any_arr){any_LTR("declareIntoVar")
, Grammar_Body
        });
//call the specific statement (if,for,print,if,function,class,etc) .produce()
        //var mark = .lexer.outCode.markSourceMap(.indent)
        var mark = __call(markSourceMap_,PROP(outCode_,PROP(lexer_,this)),1,(any_arr){PROP(indent_,this)
        });
        //.out .specific
        METHOD(out_,this)(this,1,(any_arr){PROP(specific_,this)
        });
//add ";" after the statement
//then EOL comment (if it isnt a multiline statement)
//then NEWLINE
        //if not .specific.skipSemiColon
        if (!(_anyToBool(PROP(skipSemiColon_,PROP(specific_,this)))))  {
          //.addSourceMap mark
          METHOD(addSourceMap_,this)(this,1,(any_arr){mark
          });
          //.out ";"
          METHOD(out_,this)(this,1,(any_arr){any_LTR(";")
          });
          //if .specific hasnt property "body"
          if (!(_hasProperty(PROP(specific_,this),any_LTR("body"))))  {
            //.out .getEOLComment()
            METHOD(out_,this)(this,1,(any_arr){METHOD(getEOLComment_,this)(this,0,NULL)
            });
          };
        };
      return undefined;
      }
//called above, pre-declare vars from 'into var x' assignment-expression
    //append to class Grammar.Oper
    
      //method declareIntoVar()
      any Grammar_Oper_declareIntoVar(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_Oper));
          //---------
          //if .intoVar
          if (_anyToBool(PROP(intoVar_,this)))  {
              //.out "var ",.right,"=undefined;",NL
              METHOD(out_,this)(this,4,(any_arr){any_LTR("var ")
, PROP(right_,this)
, any_LTR("=undefined;")
, Producer_js_NL
              });
          };
      return undefined;
      }
//---------------------------------
//### append to class Grammar.ThrowStatement ###
    
      //method produce()
      any Grammar_ThrowStatement_produce(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_ThrowStatement));
          //---------
          //if .specifier is 'fail'
          if (__is(PROP(specifier_,this),any_LTR("fail")))  {
            //.out "throw new Error(", .expr,")"
            METHOD(out_,this)(this,3,(any_arr){any_LTR("throw new Error(")
, PROP(expr_,this)
, any_LTR(")")
            });
          }
          //else
          
          else {
            //.out "throw ", .expr
            METHOD(out_,this)(this,2,(any_arr){any_LTR("throw ")
, PROP(expr_,this)
            });
          };
      return undefined;
      }
//### Append to class Grammar.ReturnStatement ###
    
      //method produce()
      any Grammar_ReturnStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ReturnStatement));
        //---------
        //.out "return"
        METHOD(out_,this)(this,1,(any_arr){any_LTR("return")
        });
        //if .expr
        if (_anyToBool(PROP(expr_,this)))  {
          //.out " ",.expr
          METHOD(out_,this)(this,2,(any_arr){any_LTR(" ")
, PROP(expr_,this)
          });
        };
      return undefined;
      }
//### Append to class Grammar.FunctionCall ###
    
      //method produce() 
      any Grammar_FunctionCall_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionCall));
        //---------
        //.varRef.produce()
        __call(produce_,PROP(varRef_,this),0,NULL);
        //if .varRef.executes, return #if varRef already executes, () are not needed
        if (_anyToBool(PROP(executes_,PROP(varRef_,this)))) {return undefined;};
        
        //.out "()" #add (), so JS executes the function call
        METHOD(out_,this)(this,1,(any_arr){any_LTR("()")
        });// #add (), so JS executes the function call
      return undefined;
      }
//### append to class Grammar.Operand ###
    
//`Operand:
  //|NumberLiteral|StringLiteral|RegExpLiteral
  //|ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  //|VariableRef
//A `Operand` is the left or right part of a binary oper
//or the only Operand of a unary oper.
      //method produce()
      any Grammar_Operand_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Operand));
        //---------
        //.out .name, .accessors
        METHOD(out_,this)(this,2,(any_arr){PROP(name_,this)
, PROP(accessors_,this)
        });
      return undefined;
      }
      //#end Operand
//### append to class Grammar.UnaryOper ###
    
//`UnaryOper: ('-'|new|type of|not|no|bitnot) `
//A Unary Oper is an operator acting on a single operand.
//Unary Oper inherits from Oper, so both are `instance of Oper`
//Examples:
//1) `not`     *boolean negation*     `if not a is b`
//2) `-`       *numeric unary minus*  `-(4+3)`
//3) `new`     *instantiation*        `x = new classNumber[2]`
//4) `type of` *type name access*     `type of x is classNumber[2]` 
//5) `no`      *'falsey' check*       `if no options then options={}` 
//6) `bitnot`  *bit-unary-negation*   `a = bitnot xC0 + 5`
      //method produce() 
      any Grammar_UnaryOper_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_UnaryOper));
        //---------
        
        //var translated = operTranslate(.name)
        var translated = Producer_js_operTranslate(undefined,1,(any_arr){PROP(name_,this)
        });
        //var prepend,append
        var prepend = undefined, append = undefined;
//if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
//-(prettier generated code) do not add () for simple "falsey" variable check
        //if translated is "!" 
        if (__is(translated,any_LTR("!")))  {
            //if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
            if (!((__is(PROP(name_,this),any_LTR("no")) && _instanceof(PROP(name_,PROP(right_,this)),Grammar_VariableRef))))  {
                //prepend ="("
                prepend = any_LTR("(");
                //append=")"
                append = any_LTR(")");
            };
        }
//add a space if the unary operator is a word. Example `typeof`
        //else if translated.charAt(0)>='a' and translated.charAt(0)<='z'
        
        else if (_anyToNumber(METHOD(charAt_,translated)(translated,1,(any_arr){any_number(0)
        })) >= 'a' && _anyToNumber(METHOD(charAt_,translated)(translated,1,(any_arr){any_number(0)
        })) <= 'z')  {
            //translated &= " "
            translated=_concatAny(2,translated,any_LTR(" "));
        };
        //.out translated, prepend, .right, append
        METHOD(out_,this)(this,4,(any_arr){translated
, prepend
, PROP(right_,this)
, append
        });
      return undefined;
      }
//### append to class Grammar.Oper ###
    
      //method produce()
      any Grammar_Oper_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Oper));
        //---------
        //var oper = .name
        var oper = PROP(name_,this);
//default mechanism to handle 'negated' operand
        //var prepend,append
        var prepend = undefined, append = undefined;
        //if .negated # NEGATED
        if (_anyToBool(PROP(negated_,this)))  {// # NEGATED
//if NEGATED and the oper is `is` we convert it to 'isnt'.
//'isnt' will be translated to !==
            //if oper is 'is' # Negated is ---> !==
            if (__is(oper,any_LTR("is")))  {// # Negated is ---> !==
                //oper = '!=='
                oper = any_LTR("!==");
            }
//else -if NEGATED- we add `!( )` to the expression
            //else 
            
            else {
                //prepend ="!("
                prepend = any_LTR("!(");
                //append=")"
                append = any_LTR(")");
            };
        };
//Check for special cases: 
//1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
//example: `x in [1,2,3]` -> `[1,2,3].indexOf(x)>=0`
//example: `x not in [1,2,3]` -> `[1,2,3].indexOf(x)==-1`
//example: `char not in myString` -> `myString.indexOf(char)==-1`
//example (`arguments` pseudo-array): `'lite' not in arguments` -> `Array.prototype.slice.call(arguments).indexOf(char)==-1`
        //if .name is 'in'
        if (__is(PROP(name_,this),any_LTR("in")))  {
            //.out .right,".indexOf(",.left,")", .negated? "===-1" : ">=0"
            METHOD(out_,this)(this,5,(any_arr){PROP(right_,this)
, any_LTR(".indexOf(")
, PROP(left_,this)
, any_LTR(")")
, _anyToBool(PROP(negated_,this)) ? any_LTR("===-1") : any_LTR(">=0")
            });
        }
//fix when used on JS built-in array-like `arguments`
////            .lexer.outCode.currLine = .lexer.outCode.currLine.replace(/\barguments.indexOf\(/,'Array.prototype.slice.call(arguments).indexOf(')
//2) *'has property'* operator, requires swapping left and right operands and to use js: `in`
        //else if .name is 'has property'
        
        else if (__is(PROP(name_,this),any_LTR("has property")))  {
            //.out prepend, .right," in ",.left, append
            METHOD(out_,this)(this,5,(any_arr){prepend
, PROP(right_,this)
, any_LTR(" in ")
, PROP(left_,this)
, append
            });
        }
//3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use js: `=`
        //else if .name is 'into'
        
        else if (__is(PROP(name_,this),any_LTR("into")))  {
            //.out "(",.right,"=",.left,")"
            METHOD(out_,this)(this,5,(any_arr){any_LTR("(")
, PROP(right_,this)
, any_LTR("=")
, PROP(left_,this)
, any_LTR(")")
            });
        }
//4) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`
        //else if .name is 'like'
        
        else if (__is(PROP(name_,this),any_LTR("like")))  {
            //.out prepend,.right,".test(",.left,")",append
            METHOD(out_,this)(this,6,(any_arr){prepend
, PROP(right_,this)
, any_LTR(".test(")
, PROP(left_,this)
, any_LTR(")")
, append
            });
        }
//else we have a direct translatable operator. 
//We out: left,operator,right
        //else
        
        else {
            //.out prepend, .left, ' ', operTranslate(oper), ' ', .right , append
            METHOD(out_,this)(this,7,(any_arr){prepend
, PROP(left_,this)
, any_LTR(" ")
, Producer_js_operTranslate(undefined,1,(any_arr){oper
            })
, any_LTR(" ")
, PROP(right_,this)
, append
            });
        };
      return undefined;
      }
//### append to class Grammar.Expression ###
    
      //method produce(negated:boolean) 
      any Grammar_Expression_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Expression));
        //---------
        // define named params
        var negated= argc? arguments[0] : undefined;
        //---------
//Produce the expression body, negated if options={negated:true}
        //var prepend=""
        var prepend = any_EMPTY_STR;
        //var append=""
        var append = any_EMPTY_STR;
        //if negated
        if (_anyToBool(negated))  {
//(prettier generated code) Try to avoid unnecessary parens after '!' 
//for example: if the expression is a single variable, as in the 'falsey' check: 
//Example: `if no options.log then... ` --> `if (!options.log) {...` 
//we don't want: `if (!(options.log)) {...` 
          //if .operandCount is 1 
          if (__is(PROP(operandCount_,this),any_number(1)))  {
              //#no parens needed
              //prepend = "!"
              prepend = any_LTR("!");
          }
          //else
          
          else {
              //prepend = "!("
              prepend = any_LTR("!(");
              //append = ")"
              append = any_LTR(")");
          };
        };
          //#end if
        //#end if negated
//produce the expression body
        //.out prepend, .root, append
        METHOD(out_,this)(this,3,(any_arr){prepend
, PROP(root_,this)
, append
        });
      return undefined;
      }
//### append to class Grammar.VariableRef ###
    
//`VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`
//`VariableRef` is a Variable Reference. 
 //a VariableRef can include chained 'Accessors', which can:
 //*access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 //*assume the variable is a function and perform a function call :  `(`-> FunctionAccess
      //method produce() 
      any Grammar_VariableRef_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VariableRef));
        //---------
        //var preIfExported 
        var preIfExported = undefined;
//Prefix ++/--, varName, Accessors and postfix ++/--
        //if .name is 'arguments' //the only thing that can be done with "arguments" is "arguments.toArray()"
        if (__is(PROP(name_,this),any_LTR("arguments")))  { //the only thing that can be done with "arguments" is "arguments.toArray()"
            //.out 'Array.prototype.slice.call(arguments)' 
            METHOD(out_,this)(this,1,(any_arr){any_LTR("Array.prototype.slice.call(arguments)")
            });
            //return
            return undefined;
        };
        //if .name is 'onTimeout' //hack to call setTimeout with arguments in inverted order
        if (__is(PROP(name_,this),any_LTR("onTimeout")))  { //hack to call setTimeout with arguments in inverted order
            //if no .accessors or .accessors.length isnt 1 or .accessors[1].constructor isnt Grammar.FunctionAccess 
            if (_anyToBool((_anyToBool(__or5=(_anyToBool(__or6=any_number(!_anyToBool(PROP(accessors_,this))))? __or6 : any_number(!__is(any_number(_length(PROP(accessors_,this))),any_number(1)))))? __or5 : any_number(!__is(any_class(ITEM(1,PROP(accessors_,this)).class),Grammar_FunctionAccess)))))  {
                //.sayErr "expected onTimeout(milliseconds,function)"
                METHOD(sayErr_,this)(this,1,(any_arr){any_LTR("expected onTimeout(milliseconds,function)")
                });
            };
            //var fnAccess: Grammar.FunctionAccess = .accessors[1]
            var fnAccess = ITEM(1,PROP(accessors_,this));
            //if fnAccess.args.length isnt 2
            if (!__is(any_number(_length(PROP(args_,fnAccess))),any_number(2)))  {
                //.sayErr "expected two arguments: onTimeout(milliseconds,function)"
                METHOD(sayErr_,this)(this,1,(any_arr){any_LTR("expected two arguments: onTimeout(milliseconds,function)")
                });
            };
            //.out "setTimeout(", fnAccess.args[1],fnAccess.args[0],")" //call setTimeout, invert parameter order
            METHOD(out_,this)(this,4,(any_arr){any_LTR("setTimeout(")
, ITEM(1,PROP(args_,fnAccess))
, ITEM(0,PROP(args_,fnAccess))
, any_LTR(")")
            }); //call setTimeout, invert parameter order
        }
        //else 
        
        else {
            //var refNameDecl = .tryGetFromScope(.name)
            var refNameDecl = METHOD(tryGetFromScope_,this)(this,1,(any_arr){PROP(name_,this)
            });
            //if no refNameDecl
            if (!_anyToBool(refNameDecl))  {
                //.sayErr "cannot find '#{.name}' in scope"
                METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_LTR("cannot find '")
, PROP(name_,this)
, any_LTR("' in scope")
                )
                });
            }
            //else
            
            else {
                //if refNameDecl.isPublicVar
                if (_anyToBool(PROP(isPublicVar_,refNameDecl)))  {
                    //preIfExported='module.exports.'
                    preIfExported = any_LTR("module.exports.");
                };
            };
        };
//node.js module.exports is a leaky abstractions for exported
//objects other than functions (e.g: Arrays or objects).
//You MUST use always "module.export.varX" and not a local var.
//If you do: 
  //var arr=[];
  //module.export.arr = arr;
  //then use arr.push... arr.pop in the module code...
//It'll work fine until a module requirer does: 
  //var reqd=require('theModule');
  //reqd.arr = []
//At that point, module.export.arr will point to a different array than
//the internal module var "arr[]", so the module will stop working as intended.
        //.out .preIncDec, preIfExported, .name, .accessors, .postIncDec
        METHOD(out_,this)(this,5,(any_arr){PROP(preIncDec_,this)
, preIfExported
, PROP(name_,this)
, PROP(accessors_,this)
, PROP(postIncDec_,this)
        });
      return undefined;
      }
//### append to class Grammar.AssignmentStatement ###
    
      //method produce() 
      any Grammar_AssignmentStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_AssignmentStatement));
        //---------
        //.out .lvalue, ' ', operTranslate(.name), ' ', .rvalue
        METHOD(out_,this)(this,5,(any_arr){PROP(lvalue_,this)
, any_LTR(" ")
, Producer_js_operTranslate(undefined,1,(any_arr){PROP(name_,this)
        })
, any_LTR(" ")
, PROP(rvalue_,this)
        });
      return undefined;
      }
//-------
//### append to class Grammar.DefaultAssignment ###
    
      //method produce() 
      any Grammar_DefaultAssignment_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DefaultAssignment));
        //---------
        //.process(.assignment.lvalue, .assignment.rvalue)
        METHOD(process_,this)(this,2,(any_arr){PROP(lvalue_,PROP(assignment_,this))
, PROP(rvalue_,PROP(assignment_,this))
        });
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//#### helper Functions
      //#recursive duet 1
      //helper method process(name,value)
      any Grammar_DefaultAssignment_process(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_DefaultAssignment));
          //---------
          // define named params
          var name, value;
          name=value=undefined;
          switch(argc){
            case 2:value=arguments[1];
            case 1:name=arguments[0];
          }
          //---------
//if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'
//check if it's a ObjectLiteral (level indent)
          //if value instanceof Grammar.ObjectLiteral
          if (_instanceof(value,Grammar_ObjectLiteral))  {
            //.processItems name, value # recurse Grammar.ObjectLiteral
            METHOD(processItems_,this)(this,2,(any_arr){name
, value
            });// # recurse Grammar.ObjectLiteral
          }
//else, simple value (Expression)
          //else
          
          else {
            //.assignIfUndefined name, value # Expression
            METHOD(assignIfUndefined_,this)(this,2,(any_arr){name
, value
            });// # Expression
          };
      return undefined;
      }
      //#recursive duet 2
      //helper method processItems(main, objectLiteral) 
      any Grammar_DefaultAssignment_processItems(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_DefaultAssignment));
          //---------
          // define named params
          var main, objectLiteral;
          main=objectLiteral=undefined;
          switch(argc){
            case 2:objectLiteral=arguments[1];
            case 1:main=arguments[0];
          }
          //---------
          //.out "if(!",main,') ',main,"={};",NL
          METHOD(out_,this)(this,6,(any_arr){any_LTR("if(!")
, main
, any_LTR(") ")
, main
, any_LTR("={};")
, Producer_js_NL
          });
          //for each nameValue in objectLiteral.items
          any _list67=PROP(items_,objectLiteral);
          { var nameValue=undefined;
          for(int nameValue__inx=0 ; nameValue__inx<_list67.value.arr->length ; nameValue__inx++){nameValue=ITEM(nameValue__inx,_list67);
          
            //var itemFullName = [main,'.',nameValue.name]
            var itemFullName = new(Array,3,(any_arr){main, any_LTR("."), PROP(name_,nameValue)});
            //.process(itemFullName, nameValue.value)
            METHOD(process_,this)(this,2,(any_arr){itemFullName
, PROP(value_,nameValue)
    });
          }};// end for each in
          
      return undefined;
      }
    //#end helper recursive functions
//-----------
//## Accessors
//We just defer to JavaScript's built in `.` `[ ]` and `( )` accessors
//### append to class Grammar.PropertyAccess ##
    
      //method produce() 
      any Grammar_PropertyAccess_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PropertyAccess));
        //---------
        //if .name is 'initInstance' 
        if (__is(PROP(name_,this),any_LTR("initInstance")))  {
            //do nothing  // initInstance is the liteScript unified (C and JS) way to call Class instance Initializator function.
            //do nothing
            ; // initInstance is the liteScript unified (C and JS) way to call Class instance Initializator function.
        }
                        //// in JS, since Classes are Functions, JS uses the Class-Function as initializator function 
                        //// so we need to add nothing in case of 'initInstance' 
        //else
        
        else {
            //.out ".",.name
            METHOD(out_,this)(this,2,(any_arr){any_LTR(".")
, PROP(name_,this)
            });
        };
      return undefined;
      }
//### append to class Grammar.IndexAccess
    
      //method produce() 
      any Grammar_IndexAccess_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_IndexAccess));
        //---------
        //.out "[",.name,"]"
        METHOD(out_,this)(this,3,(any_arr){any_LTR("[")
, PROP(name_,this)
, any_LTR("]")
        });
      return undefined;
      }
//### append to class Grammar.FunctionArgument
    
      //method produce() 
      any Grammar_FunctionArgument_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionArgument));
        //---------
        //.out .expression
        METHOD(out_,this)(this,1,(any_arr){PROP(expression_,this)
        });
      return undefined;
      }
//### append to class Grammar.FunctionAccess
    
      //method produce() 
      any Grammar_FunctionAccess_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionAccess));
        //---------
        //.out "(",{CSL:.args},")"
        METHOD(out_,this)(this,3,(any_arr){any_LTR("(")
, new(Map,1,(any_arr){
        _newPair("CSL",PROP(args_,this))
        })
        
, any_LTR(")")
        });
      return undefined;
      }
//-----------
//### Append to class ASTBase
    
//#### helper method lastLineOf(list:ASTBase array) 
     any ASTBase_lastLineOf(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var list= argc? arguments[0] : undefined;
        //---------
//More Helper methods, get max line of list
        //var lastLine = .sourceLineNum
        var lastLine = PROP(sourceLineNum_,this);
        //for each item in list
        any _list68=list;
        { var item=undefined;
        for(int item__inx=0 ; item__inx<_list68.value.arr->length ; item__inx++){item=ITEM(item__inx,_list68);
        
            //if item.sourceLineNum>lastLine 
            if (_anyToNumber(PROP(sourceLineNum_,item)) > _anyToNumber(lastLine))  {
              //lastLine = item.sourceLineNum
              lastLine = PROP(sourceLineNum_,item);
            };
        }};// end for each in
        //return lastLine
        return lastLine;
     return undefined;
     }
//#### method getOwnerPrefix() returns array
     any ASTBase_getOwnerPrefix(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//check if we're inside a ClassDeclaration or AppendToDeclaration.
//return prefix for item to be appended
        //var result=[]
        var result = new(Array,0,NULL);
        //var start = this
        var start = this;
        //while start and start.getParent(Grammar.ClassDeclaration) into var parent
        var parent=undefined;
        while(_anyToBool(start) && _anyToBool((parent=METHOD(getParent_,start)(start,1,(any_arr){Grammar_ClassDeclaration
        })))){
            //var ownerName, toPrototype
            var ownerName = undefined, toPrototype = undefined;
            //if parent instance of Grammar.AppendToDeclaration
            if (_instanceof(parent,Grammar_AppendToDeclaration))  {
                //#append to class prototype or object
                //declare parent:Grammar.AppendToDeclaration
                
                //toPrototype = not parent.toNamespace
                toPrototype = any_number(!(_anyToBool(PROP(toNamespace_,parent))));
                //ownerName = parent.varRef
                ownerName = PROP(varRef_,parent);
                //var refNameDecl  = parent.varRef.tryGetReference()
                var refNameDecl = __call(tryGetReference_,PROP(varRef_,parent),0,NULL);
                //if refNameDecl and refNameDecl.nodeDeclared instanceof Grammar.ClassDeclaration
                if (_anyToBool(refNameDecl) && _instanceof(PROP(nodeDeclared_,refNameDecl),Grammar_ClassDeclaration))  {
                    //start = refNameDecl.nodeDeclared
                    start = PROP(nodeDeclared_,refNameDecl);
                }
                //else
                
                else {
                    //start = undefined
                    start = undefined;
                };
            }
              
            //else if parent instance of Grammar.NamespaceDeclaration
            
            else if (_instanceof(parent,Grammar_NamespaceDeclaration))  {
                //toPrototype = false
                toPrototype = false;
                //ownerName = parent.name
                ownerName = PROP(name_,parent);
                //start = parent
                start = parent;
            }
            //else # in a ClassDeclaration
            
            else {
                //toPrototype = true
                toPrototype = true;
                //ownerName = parent.name
                ownerName = PROP(name_,parent);
                //start = parent
                start = parent;
            };
            //result.unshift ownerName, (toPrototype? ".prototype." else ".")
            METHOD(unshift_,result)(result,2,(any_arr){ownerName
, (_anyToBool(toPrototype) ? any_LTR(".prototype.") : any_LTR("."))
            });
        };// end loop
        //#loop
        //return result
        return result;
     return undefined;
     }
//---
//### Append to class Grammar.WithStatement ###
    
//`WithStatement: with VariableRef Body`
//The WithStatement simplifies calling several methods of the same object:
//Example:
//```    
//with frontDoor
    //.show
    //.open
    //.show
    //.close
    //.show
//```
//to js:
//```
//var with__1=frontDoor;
  //with__1.show;
  //with__1.open
  //with__1.show
  //with__1.close
  //with__1.show
//```
      //method produce() 
      any Grammar_WithStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_WithStatement));
        //---------
        //.out "var ",.name,'=',.varRef,";"
        METHOD(out_,this)(this,5,(any_arr){any_LTR("var ")
, PROP(name_,this)
, any_LTR("=")
, PROP(varRef_,this)
, any_LTR(";")
        });
        //.out .body
        METHOD(out_,this)(this,1,(any_arr){PROP(body_,this)
        });
      return undefined;
      }
//---
//### Append to class Grammar.PropertiesDeclaration ###
    
//'var' followed by a list of comma separated: var names and optional assignment
      //method produce(prefix) 
      any Grammar_PropertiesDeclaration_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PropertiesDeclaration));
        //---------
        // define named params
        var prefix= argc? arguments[0] : undefined;
        //---------
        //.outSourceLinesAsComment .lastLineOf(.list)
        METHOD(outSourceLinesAsComment_,this)(this,1,(any_arr){METHOD(lastLineOf_,this)(this,1,(any_arr){PROP(list_,this)
        })
        });
        //if no prefix, prefix = .getOwnerPrefix()
        if (!_anyToBool(prefix)) {prefix = METHOD(getOwnerPrefix_,this)(this,0,NULL);};
        //for each varDecl in .list
        any _list69=PROP(list_,this);
        { var varDecl=undefined;
        for(int varDecl__inx=0 ; varDecl__inx<_list69.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list69);
        
          //if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
          if (_anyToBool(PROP(assignedValue_,varDecl)))  {// #is not valid to assign to .prototype. - creates subtle errors later
            //if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
            if (_instanceof(prefix,Array) && _anyToBool(ITEM(1,prefix)) && !__is(ITEM(1,prefix),any_LTR("."))) {METHOD(throwError_,this)(this,1,(any_arr){any_LTR("cannot assign values to instance properties in \"Append to\"")
            });};
            //.out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,";",NL
            METHOD(out_,this)(this,7,(any_arr){any_LTR("    ")
, prefix
, PROP(name_,varDecl)
, any_LTR("=")
, PROP(assignedValue_,varDecl)
, any_LTR(";")
, Producer_js_NL
            });
          };
        }};// end for each in
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//### Append to class Grammar.VarStatement ###
    
//'var' followed by a list of comma separated: var names and optional assignment
      //method produce() 
      any Grammar_VarStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VarStatement));
        //---------
        //declare valid .compilerVar
        
        //declare valid .export
        
        //if .keyword is 'let' and .compilerVar('ES6')
        if (__is(PROP(keyword_,this),any_LTR("let")) && _anyToBool(METHOD(compilerVar_,this)(this,1,(any_arr){any_LTR("ES6")
        })))  {
          //.out 'let '
          METHOD(out_,this)(this,1,(any_arr){any_LTR("let ")
          });
        }
        //else
        
        else {
          //.out 'var '
          METHOD(out_,this)(this,1,(any_arr){any_LTR("var ")
          });
        };
//Now, after 'var' or 'let' out one or more comma separated VariableDecl 
  
        //.out {CSL:.list, freeForm:.list.length>2}
        METHOD(out_,this)(this,1,(any_arr){new(Map,2,(any_arr){
        _newPair("CSL",PROP(list_,this)), 
        _newPair("freeForm",any_number(_length(PROP(list_,this)) > 2))
        })
        
        });
//If 'var' was adjectivated 'export', add all vars to exportNamespace
        //if not .lexer.outCode.browser
        if (!(_anyToBool(PROP(browser_,PROP(outCode_,PROP(lexer_,this))))))  {
            //if .hasAdjective('export')
            if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_LTR("export")
            })))  {
                //.out ";", NL,{COMMENT:'export'},NL
                METHOD(out_,this)(this,4,(any_arr){any_LTR(";")
, Producer_js_NL
, new(Map,1,(any_arr){
                _newPair("COMMENT",any_LTR("export"))
                })
                
, Producer_js_NL
                });
                //for each varDecl in .list
                any _list70=PROP(list_,this);
                { var varDecl=undefined;
                for(int varDecl__inx=0 ; varDecl__inx<_list70.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list70);
                
                    //.out 'module.exports.',varDecl.name,' = ', varDecl.name, ";", NL
                    METHOD(out_,this)(this,6,(any_arr){any_LTR("module.exports.")
, PROP(name_,varDecl)
, any_LTR(" = ")
, PROP(name_,varDecl)
, any_LTR(";")
, Producer_js_NL
                    });
                }};// end for each in
                //.skipSemiColon = true
                PROP(skipSemiColon_,this) = true;
            };
        };
      return undefined;
      }
//### Append to class Grammar.ImportStatementItem ###
    
      //method produce() 
      any Grammar_ImportStatementItem_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ImportStatementItem));
        //---------
        //.out "var ",.name," = require('", .getNodeJSRequireFileRef(),"');", NL
        METHOD(out_,this)(this,6,(any_arr){any_LTR("var ")
, PROP(name_,this)
, any_LTR(" = require('")
, METHOD(getNodeJSRequireFileRef_,this)(this,0,NULL)
, any_LTR("');")
, Producer_js_NL
        });
      return undefined;
      }
      //method getNodeJSRequireFileRef() 
      any Grammar_ImportStatementItem_getNodeJSRequireFileRef(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ImportStatementItem));
        //---------
        
//node.js require() require "./" to denote a local module to load.
//it does like bash does for executable files. A name  without ./ means "look in $PATH".
//this is not the most intuitive choice.
        //if .importedModule.fileInfo.importInfo.globalImport 
        if (_anyToBool(PROP(globalImport_,PROP(importInfo_,PROP(fileInfo_,PROP(importedModule_,this))))))  {
            //return .name // for node, no './' means "look in node_modules, and up, then global paths"
            return PROP(name_,this); // for node, no './' means "look in node_modules, and up, then global paths"
        };
        //var thisModule = .getParent(Grammar.Module)
        var thisModule = METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module
        });
//get the required file path, relative to the location of this module (as nodejs's require() requires)
        //if no .importedModule.fileInfo.outRelFilename
        if (!_anyToBool(PROP(outRelFilename_,PROP(fileInfo_,PROP(importedModule_,this)))))  {
            //print JSON.stringify(.importedModule.fileInfo)
            print(1,(any_arr){JSON_stringify(undefined,1,(any_arr){PROP(fileInfo_,PROP(importedModule_,this))
            })});
            //print thisModule.fileInfo.dir
            print(1,(any_arr){PROP(dir_,PROP(fileInfo_,thisModule))});
        };
        //var fn = Environment.relativeFrom(Environment.getDir(thisModule.fileInfo.outRelFilename)
        var fn = Environment_relativeFrom(undefined,2,(any_arr){Environment_getDir(undefined,1,(any_arr){PROP(outRelFilename_,PROP(fileInfo_,thisModule))
        })
, PROP(outRelFilename_,PROP(fileInfo_,PROP(importedModule_,this)))
        });
                                            //,.importedModule.fileInfo.outRelFilename);
        
//check for 'import x from 'path/file';
        //if .importParameter and fn.charAt(0) is '/' //has `from 'path/file'` AND  is an absolute path 
        if (_anyToBool(PROP(importParameter_,this)) && __is(METHOD(charAt_,fn)(fn,1,(any_arr){any_number(0)
        }),any_LTR("/")))  { //has `from 'path/file'` AND  is an absolute path
            //return fn
            return fn;
        };
//else, a simple 'import x'
        //return "./#{fn}"; // node.js require() require "./" to denote a local module to load                
        return _concatAny(2,any_LTR("./")
, fn
        ); // node.js require() require "./" to denote a local module to load
      return undefined;
      }
//### Append to class Grammar.ImportStatement ###
    
//'import' followed by a list of comma separated: var names and optional assignment
      //method produce() 
      any Grammar_ImportStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ImportStatement));
        //---------
        //.out .list //see:Grammar.ImportStatementItem
        METHOD(out_,this)(this,1,(any_arr){PROP(list_,this)
        }); //see:Grammar.ImportStatementItem
        //.skipSemiColon = true //each item is `var x=require('x');`
        PROP(skipSemiColon_,this) = true; //each item is `var x=require('x');`
      return undefined;
      }
//### Append to class Grammar.VariableDecl ###
    
//variable name and optionally assign a value
      //method produce() 
      any Grammar_VariableDecl_produce(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_VariableDecl));
          //---------
//It's a `var` keyword or we're declaring function parameters.
//In any case starts with the variable name
      
          //.out .name
          METHOD(out_,this)(this,1,(any_arr){PROP(name_,this)
          });
          //declare valid .keyword
          
//If this VariableDecl come from a 'var' statement, we force assignment (to avoid subtle bugs,
//in LiteScript, 'var' declaration assigns 'undefined')
          //if .parent instanceof Grammar.VarStatement 
          if (_instanceof(PROP(parent_,this),Grammar_VarStatement))  {
              //.out ' = ',.assignedValue or 'undefined'
              METHOD(out_,this)(this,2,(any_arr){any_LTR(" = ")
, (_anyToBool(__or7=PROP(assignedValue_,this))? __or7 : any_LTR("undefined"))
              });
          }
//else, this VariableDecl come from function parameters decl, 
//if it has AssginedValue, we out assignment if ES6 is available. 
//(ES6 implements 'default' for parameters, so `function myFunc(a=3)` is valid in ES6)
          //else
          
          else {
            //if .assignedValue and .lexer.project.compilerVar('ES6')
            if (_anyToBool(PROP(assignedValue_,this)) && _anyToBool(__call(compilerVar_,PROP(project_,PROP(lexer_,this)),1,(any_arr){any_LTR("ES6")
            })))  {
                //.out ' = ',.assignedValue
                METHOD(out_,this)(this,2,(any_arr){any_LTR(" = ")
, PROP(assignedValue_,this)
                });
            };
          };
      return undefined;
      }
    //#end VariableDecl
//### Append to class Grammar.SingleLineBody ###
    
      //method produce()
      any Grammar_SingleLineBody_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_SingleLineBody));
        //---------
        //var bare=[]
        var bare = new(Array,0,NULL);
        //for each statement in .statements
        any _list71=PROP(statements_,this);
        { var statement=undefined;
        for(int statement__inx=0 ; statement__inx<_list71.value.arr->length ; statement__inx++){statement=ITEM(statement__inx,_list71);
        
            //bare.push statement.specific
            METHOD(push_,bare)(bare,1,(any_arr){PROP(specific_,statement)
            });
        }};// end for each in
        //.out {CSL:bare, separator:","}
        METHOD(out_,this)(this,1,(any_arr){new(Map,2,(any_arr){
        _newPair("CSL",bare), 
        _newPair("separator",any_LTR(","))
        })
        
        });
      return undefined;
      }
//### Append to class Grammar.IfStatement ###
    
      //method produce() 
      any Grammar_IfStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_IfStatement));
        //---------
        //declare valid .elseStatement.produce
        
        //if .body instanceof Grammar.SingleLineBody
        if (_instanceof(PROP(body_,this),Grammar_SingleLineBody))  {
            //.out "if (", .conditional,") {",.body,"}"
            METHOD(out_,this)(this,5,(any_arr){any_LTR("if (")
, PROP(conditional_,this)
, any_LTR(") {")
, PROP(body_,this)
, any_LTR("}")
            });
        }
        //else
        
        else {
            //.out "if (", .conditional, ") {", .getEOLComment()
            METHOD(out_,this)(this,4,(any_arr){any_LTR("if (")
, PROP(conditional_,this)
, any_LTR(") {")
, METHOD(getEOLComment_,this)(this,0,NULL)
            });
            //.out  .body, "}"
            METHOD(out_,this)(this,2,(any_arr){PROP(body_,this)
, any_LTR("}")
            });
        };
        //if .elseStatement
        if (_anyToBool(PROP(elseStatement_,this)))  {
            //.outSourceLinesAsComment 
            METHOD(outSourceLinesAsComment_,this)(this,0,NULL);
            //.elseStatement.produce()
            __call(produce_,PROP(elseStatement_,this),0,NULL);
        };
      return undefined;
      }
//### Append to class Grammar.ElseIfStatement ###
    
      //method produce() 
      any Grammar_ElseIfStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ElseIfStatement));
        //---------
        //.out NL,"else ", .nextIf
        METHOD(out_,this)(this,3,(any_arr){Producer_js_NL
, any_LTR("else ")
, PROP(nextIf_,this)
        });
      return undefined;
      }
//### Append to class Grammar.ElseStatement ###
    
      //method produce()
      any Grammar_ElseStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ElseStatement));
        //---------
        //.out NL,"else {", .body, "}"
        METHOD(out_,this)(this,4,(any_arr){Producer_js_NL
, any_LTR("else {")
, PROP(body_,this)
, any_LTR("}")
        });
      return undefined;
      }
//### Append to class Grammar.ForStatement ###
    
//There are 3 variants of `ForStatement` in LiteScript
      //method produce() 
      any Grammar_ForStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForStatement));
        //---------
        //.variant.produce()
        __call(produce_,PROP(variant_,this),0,NULL);
//Since al 3 cases are closed with '}; //comment', we skip statement semicolon
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//Pre-For code. If required, store the iterable in a temp var.
//(prettier generated code) 
//Only do it if the iterable is a complex expression, if it can have side-effects or it's a literal.
//We create a temp var to assign the iterable expression to
    //Append to class Grammar.Expression
    
      //method prepareTempVar() returns string
      any Grammar_Expression_prepareTempVar(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Expression));
        //---------
        //declare .root.name: Grammar.VariableRef
        
        //if .operandCount>1 or .root.name.hasSideEffects or .root.name instanceof Grammar.Literal
        if (_anyToBool((_anyToBool(__or8=(_anyToBool(__or9=any_number(_anyToNumber(PROP(operandCount_,this)) > 1))? __or9 : PROP(hasSideEffects_,PROP(name_,PROP(root_,this)))))? __or8 : any_number(_instanceof(PROP(name_,PROP(root_,this)),Grammar_Literal)))))  {
            //var tempVarIterable = UniqueID.getVarName('list')  #unique temp iterable var name
            var tempVarIterable = UniqueID_getVarName(undefined,1,(any_arr){any_LTR("list")
            });// #unique temp iterable var name
            //.out "var ",tempVarIterable,"=",this,";",NL
            METHOD(out_,this)(this,6,(any_arr){any_LTR("var ")
, tempVarIterable
, any_LTR("=")
, this
, any_LTR(";")
, Producer_js_NL
            });
            //return tempVarIterable
            return tempVarIterable;
        };
        //return this
        return this;
      return undefined;
      }
//### Append to class Grammar.ForEachProperty
    
//### Variant 1) 'for each property' to loop over *object property names* 
//`ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`
      //method produce() 
      any Grammar_ForEachProperty_produce(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_ForEachProperty));
          //---------
          //var iterable = .iterable.prepareTempVar()
          var iterable = __call(prepareTempVar_,PROP(iterable_,this),0,NULL);
          //if .mainVar
          if (_anyToBool(PROP(mainVar_,this)))  {
            //.out "var ", .mainVar.name,"=undefined;",NL
            METHOD(out_,this)(this,4,(any_arr){any_LTR("var ")
, PROP(name_,PROP(mainVar_,this))
, any_LTR("=undefined;")
, Producer_js_NL
            });
          };
          //var index=.indexVar or UniqueID.getVarName('inx');
          var index = (_anyToBool(__or10=PROP(indexVar_,this))? __or10 : UniqueID_getVarName(undefined,1,(any_arr){any_LTR("inx")
          }));
          //.out "for ( var ", index, " in ", iterable, ")"
          METHOD(out_,this)(this,5,(any_arr){any_LTR("for ( var ")
, index
, any_LTR(" in ")
, iterable
, any_LTR(")")
          });
          //.out "if (",iterable,".hasOwnProperty(",index,"))"
          METHOD(out_,this)(this,5,(any_arr){any_LTR("if (")
, iterable
, any_LTR(".hasOwnProperty(")
, index
, any_LTR("))")
          });
          //.body.out "{", .mainVar.name,"=",iterable,"[",index,"];",NL
          __call(out_,PROP(body_,this),8,(any_arr){any_LTR("{")
, PROP(name_,PROP(mainVar_,this))
, any_LTR("=")
, iterable
, any_LTR("[")
, index
, any_LTR("];")
, Producer_js_NL
          });
          //.out .where
          METHOD(out_,this)(this,1,(any_arr){PROP(where_,this)
          });
          //.body.out "{", .body, "}",NL
          __call(out_,PROP(body_,this),4,(any_arr){any_LTR("{")
, PROP(body_,this)
, any_LTR("}")
, Producer_js_NL
          });
          //.body.out NL, "}"
          __call(out_,PROP(body_,this),2,(any_arr){Producer_js_NL
, any_LTR("}")
          });
          //.out {COMMENT:"end for each property"},NL
          METHOD(out_,this)(this,2,(any_arr){new(Map,1,(any_arr){
          _newPair("COMMENT",any_LTR("end for each property"))
          })
          
, Producer_js_NL
          });
      return undefined;
      }
//### Append to class Grammar.ForEachInArray
    
//### Variant 2) 'for each index' to loop over *Array indexes and items*
//`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`
      //method produce()
      any Grammar_ForEachInArray_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachInArray));
        //---------
        //var iterable = .iterable.prepareTempVar()
        var iterable = __call(prepareTempVar_,PROP(iterable_,this),0,NULL);
        //if .isMap //new syntax "for each in map xx"
        if (_anyToBool(PROP(isMap_,this)))  { //new syntax "for each in map xx"
            //return .produceInMap(iterable)
            return METHOD(produceInMap_,this)(this,1,(any_arr){iterable
            });
        };
//Create a default index var name if none was provided
        //var indexVarName, startValue
        var indexVarName = undefined, startValue = undefined;
        //if no .indexVar
        if (!_anyToBool(PROP(indexVar_,this)))  {
            //indexVarName = .mainVar.name & '__inx'  #default index var name
            indexVarName = _concatAny(2,PROP(name_,PROP(mainVar_,this)),any_LTR("__inx"));// #default index var name
            //startValue = "0"
            startValue = any_LTR("0");
        }
        //else
        
        else {
            //indexVarName = .indexVar.name
            indexVarName = PROP(name_,PROP(indexVar_,this));
            //startValue = .indexVar.assignedValue or "0"
            startValue = (_anyToBool(__or11=PROP(assignedValue_,PROP(indexVar_,this)))? __or11 : any_LTR("0"));
        };
        //.out "for( var "
        METHOD(out_,this)(this,14,(any_arr){any_LTR("for( var ")
, indexVarName
, any_LTR("=")
, startValue
, any_LTR(",")
, PROP(name_,PROP(mainVar_,this))
, any_LTR(" ; ")
, indexVarName
, any_LTR("<")
, iterable
, any_LTR(".length")
, any_LTR(" ; ")
, indexVarName
, any_LTR("++){")
        });
                //, indexVarName,"=",startValue,",",.mainVar.name
                //," ; ",indexVarName,"<",iterable,".length"
                //," ; ",indexVarName,"++){"
        //.body.out .mainVar.name,"=",iterable,"[",indexVarName,"];",NL
        __call(out_,PROP(body_,this),7,(any_arr){PROP(name_,PROP(mainVar_,this))
, any_LTR("=")
, iterable
, any_LTR("[")
, indexVarName
, any_LTR("];")
, Producer_js_NL
        });
        //if .where 
        if (_anyToBool(PROP(where_,this)))  {
          //.out '  ',.where,"{",.body,"}"
          METHOD(out_,this)(this,5,(any_arr){any_LTR("  ")
, PROP(where_,this)
, any_LTR("{")
, PROP(body_,this)
, any_LTR("}")
          });
        }
        //else 
        
        else {
          //.out .body
          METHOD(out_,this)(this,1,(any_arr){PROP(body_,this)
          });
        };
        //.out "};",{COMMENT:["end for each in ",.iterable]},NL
        METHOD(out_,this)(this,3,(any_arr){any_LTR("};")
, new(Map,1,(any_arr){
        _newPair("COMMENT",new(Array,2,(any_arr){any_LTR("end for each in "), PROP(iterable_,this)}))
        })
        
, Producer_js_NL
        });
      return undefined;
      }
//method: produceInMap
//When Map is implemented using js "Object"
      //method produceInMap(iterable)
      any Grammar_ForEachInArray_produceInMap(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_ForEachInArray));
          //---------
          // define named params
          var iterable= argc? arguments[0] : undefined;
          //---------
          //var indexVarName:string
          var indexVarName = undefined;
          //if no .indexVar
          if (!_anyToBool(PROP(indexVar_,this)))  {
            //indexVarName = .mainVar.name & '__propName'
            indexVarName = _concatAny(2,PROP(name_,PROP(mainVar_,this)),any_LTR("__propName"));
          }
          //else
          
          else {
            //indexVarName = .indexVar.name
            indexVarName = PROP(name_,PROP(indexVar_,this));
          };
          //.out "var ", .mainVar.name,"=undefined;",NL
          METHOD(out_,this)(this,4,(any_arr){any_LTR("var ")
, PROP(name_,PROP(mainVar_,this))
, any_LTR("=undefined;")
, Producer_js_NL
          });
          //.out 'if(!',iterable,'.dict) throw(new Error("for each in map: not a Map, no .dict property"));',NL
          METHOD(out_,this)(this,4,(any_arr){any_LTR("if(!")
, iterable
, any_LTR(".dict) throw(new Error(\"for each in map: not a Map, no .dict property\"));")
, Producer_js_NL
          });
          //.out "for ( var ", indexVarName, " in ", iterable, ".dict)"
          METHOD(out_,this)(this,5,(any_arr){any_LTR("for ( var ")
, indexVarName
, any_LTR(" in ")
, iterable
, any_LTR(".dict)")
          });
          //.out " if (",iterable,".dict.hasOwnProperty(",indexVarName,"))"
          METHOD(out_,this)(this,5,(any_arr){any_LTR(" if (")
, iterable
, any_LTR(".dict.hasOwnProperty(")
, indexVarName
, any_LTR("))")
          });
          //if .mainVar
          if (_anyToBool(PROP(mainVar_,this)))  {
              //.body.out "{", .mainVar.name,"=",iterable,".dict[",indexVarName,"];",NL
              __call(out_,PROP(body_,this),8,(any_arr){any_LTR("{")
, PROP(name_,PROP(mainVar_,this))
, any_LTR("=")
, iterable
, any_LTR(".dict[")
, indexVarName
, any_LTR("];")
, Producer_js_NL
              });
          };
          //.out .where
          METHOD(out_,this)(this,1,(any_arr){PROP(where_,this)
          });
          //.body.out "{", .body, "}",NL
          __call(out_,PROP(body_,this),4,(any_arr){any_LTR("{")
, PROP(body_,this)
, any_LTR("}")
, Producer_js_NL
          });
          //if .mainVar
          if (_anyToBool(PROP(mainVar_,this)))  {
            //.body.out NL, "}"
            __call(out_,PROP(body_,this),2,(any_arr){Producer_js_NL
, any_LTR("}")
            });
          };
          //.out {COMMENT:"end for each property"},NL
          METHOD(out_,this)(this,2,(any_arr){new(Map,1,(any_arr){
          _newPair("COMMENT",any_LTR("end for each property"))
          })
          
, Producer_js_NL
          });
      return undefined;
      }
//### Append to class Grammar.ForIndexNumeric
    
//### Variant 3) 'for index=...' to create *numeric loops* 
//`ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`
//Examples: `for n=0 while n<10`, `for n=0 to 9`
//Handle by using a js/C standard for(;;){} loop
      //method produce()
      any Grammar_ForIndexNumeric_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForIndexNumeric));
        //---------
        //var isToDownTo: boolean
        var isToDownTo = undefined;
        //var endTempVarName
        var endTempVarName = undefined;
        //if .conditionPrefix in['to','down']
        if (__in(PROP(conditionPrefix_,this),2,(any_arr){any_LTR("to"), any_LTR("down")}))  {
            
            //isToDownTo= true
            isToDownTo = true;
//store endExpression in a temp var. 
//For loops "to/down to" evaluate end expresion only once
            //endTempVarName = UniqueID.getVarName('end')
            endTempVarName = UniqueID_getVarName(undefined,1,(any_arr){any_LTR("end")
            });
            //.out "var ",endTempVarName,"=",.endExpression,";",NL
            METHOD(out_,this)(this,6,(any_arr){any_LTR("var ")
, endTempVarName
, any_LTR("=")
, PROP(endExpression_,this)
, any_LTR(";")
, Producer_js_NL
            });
        };
        //end if
        
        //.out "for( var ",.indexVar.name, "=", .indexVar.assignedValue or "0", "; "
        METHOD(out_,this)(this,5,(any_arr){any_LTR("for( var ")
, PROP(name_,PROP(indexVar_,this))
, any_LTR("=")
, (_anyToBool(__or12=PROP(assignedValue_,PROP(indexVar_,this)))? __or12 : any_LTR("0"))
, any_LTR("; ")
        });
        //if isToDownTo
        if (_anyToBool(isToDownTo))  {
            //#'for n=0 to 10' -> for(n=0;n<=10;n++)
            //#'for n=10 down to 0' -> for(n=10;n>=0;n--)
            //.out .indexVar.name, .conditionPrefix is 'to'? "<=" else ">=", endTempVarName
            METHOD(out_,this)(this,3,(any_arr){PROP(name_,PROP(indexVar_,this))
, __is(PROP(conditionPrefix_,this),any_LTR("to")) ? any_LTR("<=") : any_LTR(">=")
, endTempVarName
            });
        }
        //else # is while|until
        
        else {
//while|until conditions are evaluated on each loop.
//Produce the condition, negated if the prefix is 'until'.
            //#for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            //#for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
            //.endExpression.produce( negated = .conditionPrefix is 'until' )
            __call(produce_,PROP(endExpression_,this),1,(any_arr){any_number(__is(PROP(conditionPrefix_,this),any_LTR("until")))
        });
        };
        //.out "; "
        METHOD(out_,this)(this,1,(any_arr){any_LTR("; ")
        });
//if no increment specified, the default is indexVar++
        //if .increment
        if (_anyToBool(PROP(increment_,this)))  {
            //.out .increment //statements separated by ","
            METHOD(out_,this)(this,1,(any_arr){PROP(increment_,this)
            }); //statements separated by ","
        }
        //else
        
        else {
            ////default index++ (to) or index-- (down to)
            //.out .indexVar.name, .conditionPrefix is 'down'? '--' else '++'
            METHOD(out_,this)(this,2,(any_arr){PROP(name_,PROP(indexVar_,this))
, __is(PROP(conditionPrefix_,this),any_LTR("down")) ? any_LTR("--") : any_LTR("++")
            });
        };
        //.out ") "
        METHOD(out_,this)(this,1,(any_arr){any_LTR(") ")
        });
        //.out "{", .body, "};",{COMMENT:"end for #{.indexVar.name}"}, NL
        METHOD(out_,this)(this,5,(any_arr){any_LTR("{")
, PROP(body_,this)
, any_LTR("};")
, new(Map,1,(any_arr){
        _newPair("COMMENT",_concatAny(2,any_LTR("end for ")
, PROP(name_,PROP(indexVar_,this))
        ))
        })
        
, Producer_js_NL
        });
      return undefined;
      }
//### Append to class Grammar.ForWhereFilter
    
//### Helper for where filter
//`ForWhereFilter: [where Expression]`
      //method produce()
      any Grammar_ForWhereFilter_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForWhereFilter));
        //---------
        //.out 'if(',.filterExpression,')'
        METHOD(out_,this)(this,3,(any_arr){any_LTR("if(")
, PROP(filterExpression_,this)
, any_LTR(")")
        });
      return undefined;
      }
//### Append to class Grammar.DeleteStatement
    
//`DeleteStatement: delete VariableRef`
      //method produce()
      any Grammar_DeleteStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DeleteStatement));
        //---------
        //.out 'delete ',.varRef
        METHOD(out_,this)(this,2,(any_arr){any_LTR("delete ")
, PROP(varRef_,this)
        });
      return undefined;
      }
//### Append to class Grammar.WhileUntilExpression ###
    
      //method produce(askFor:string, negated:boolean) 
      any Grammar_WhileUntilExpression_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_WhileUntilExpression));
        //---------
        // define named params
        var askFor, negated;
        askFor=negated=undefined;
        switch(argc){
          case 2:negated=arguments[1];
          case 1:askFor=arguments[0];
        }
        //---------
//If the parent ask for a 'while' condition, but this is a 'until' condition,
//or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.
        //if askFor and .name isnt askFor
        if (_anyToBool(askFor) && !__is(PROP(name_,this),askFor))  {
            //negated = true
            negated = true;
        };
//*askFor* is used when the source code was, for example,
//`do until Expression` and we need to code: `while(!(Expression))` 
//or the code was `loop while Expression` and we need to code: `if (!(Expression)) break` 
//when you have a `until` condition, you need to negate the expression 
//to produce a `while` condition. (`while NOT x` is equivalent to `until x`)
        //.expr.produce negated
        __call(produce_,PROP(expr_,this),1,(any_arr){negated
        });
      return undefined;
      }
//### Append to class Grammar.DoLoop ###
    
      //method produce() 
      any Grammar_DoLoop_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DoLoop));
        //---------
//Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
//is used by both symbols.
        //if .postWhileUntilExpression 
        if (_anyToBool(PROP(postWhileUntilExpression_,this)))  {
//if we have a post-condition, for example: `do ... loop while x>0`, 
            //.out "do{", .getEOLComment()
            METHOD(out_,this)(this,2,(any_arr){any_LTR("do{")
, METHOD(getEOLComment_,this)(this,0,NULL)
            });
            //.out .body
            METHOD(out_,this)(this,1,(any_arr){PROP(body_,this)
            });
            //.out "} while ("
            METHOD(out_,this)(this,1,(any_arr){any_LTR("} while (")
            });
            //.postWhileUntilExpression.produce(askFor='while')
            __call(produce_,PROP(postWhileUntilExpression_,this),1,(any_arr){any_LTR("while")
            });
            //.out ")"
            METHOD(out_,this)(this,1,(any_arr){any_LTR(")")
            });
        }
//else, optional pre-condition:
  
        //else
        
        else {
            //.out 'while('
            METHOD(out_,this)(this,1,(any_arr){any_LTR("while(")
            });
            //if .preWhileUntilExpression
            if (_anyToBool(PROP(preWhileUntilExpression_,this)))  {
              //.preWhileUntilExpression.produce(askFor='while')
              __call(produce_,PROP(preWhileUntilExpression_,this),1,(any_arr){any_LTR("while")
            });
            }
            //else 
            
            else {
              //.out 'true'
              METHOD(out_,this)(this,1,(any_arr){any_LTR("true")
              });
            };
            //.out '){', .body , "}"
            METHOD(out_,this)(this,3,(any_arr){any_LTR("){")
, PROP(body_,this)
, any_LTR("}")
            });
        };
        //end if
        
        //.out ";",{COMMENT:"end loop"},NL
        METHOD(out_,this)(this,3,(any_arr){any_LTR(";")
, new(Map,1,(any_arr){
        _newPair("COMMENT",any_LTR("end loop"))
        })
        
, Producer_js_NL
        });
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//### Append to class Grammar.LoopControlStatement ###
    
//This is a very simple produce() to allow us to use the `break` and `continue` keywords.
  
      //method produce() 
      any Grammar_LoopControlStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_LoopControlStatement));
        //---------
//validate usage inside a for/while
        //var nodeASTBase = this.parent
        var nodeASTBase = PROP(parent_,this);
        //do
        while(TRUE){
            //if nodeASTBase is instanceof Grammar.FunctionDeclaration
            if (_instanceof(nodeASTBase,Grammar_FunctionDeclaration))  {
                ////if we reach function header
                //.sayErr '"{.control}" outside a for|while|do loop'
                METHOD(sayErr_,this)(this,1,(any_arr){any_LTR("\"{.control}\" outside a for|while|do loop")
                });
                //break
                break;
            }
            //else if nodeASTBase is instanceof Grammar.ForStatement
            
            else if (_anyToBool((_anyToBool(__or13=any_number(_instanceof(nodeASTBase,Grammar_ForStatement)))? __or13 : any_number(_instanceof(nodeASTBase,Grammar_DoLoop)))))  {
                //or nodeASTBase is instanceof Grammar.DoLoop
                    //break //ok, break/continue used inside a loop
                    break; //ok, break/continue used inside a loop
            };
            //end if
            
            //nodeASTBase = nodeASTBase.parent
            nodeASTBase = PROP(parent_,nodeASTBase);
        };// end loop
        //loop
        //.out .control
        METHOD(out_,this)(this,1,(any_arr){PROP(control_,this)
        });
      return undefined;
      }
//### Append to class Grammar.DoNothingStatement ###
    
      //method produce()
      any Grammar_DoNothingStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DoNothingStatement));
        //---------
        //.out "null"
        METHOD(out_,this)(this,1,(any_arr){any_LTR("null")
        });
      return undefined;
      }
//### Append to class Grammar.ParenExpression ###
    
//A `ParenExpression` is just a normal expression surrounded by parentheses.
      //method produce() 
      any Grammar_ParenExpression_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ParenExpression));
        //---------
        //.out "(",.expr,")"
        METHOD(out_,this)(this,3,(any_arr){any_LTR("(")
, PROP(expr_,this)
, any_LTR(")")
        });
      return undefined;
      }
//### Append to class Grammar.ArrayLiteral ###
    
//A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.
      //method produce() 
      any Grammar_ArrayLiteral_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ArrayLiteral));
        //---------
        //.out "[",{CSL:.items},"]"
        METHOD(out_,this)(this,3,(any_arr){any_LTR("[")
, new(Map,1,(any_arr){
        _newPair("CSL",PROP(items_,this))
        })
        
, any_LTR("]")
        });
      return undefined;
      }
//### Append to class Grammar.NameValuePair ###
    
//A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through 
      //method produce() 
      any Grammar_NameValuePair_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_NameValuePair));
        //---------
        //.out .name,": ",.value
        METHOD(out_,this)(this,3,(any_arr){PROP(name_,this)
, any_LTR(": ")
, PROP(value_,this)
        });
      return undefined;
      }
//### Append to class Grammar.ObjectLiteral ### also FreeObjectLiteral
    
//A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
//JavaScript supports this syntax, so we just pass it through. 
//A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
//(one NameValuePair per line, indented, comma is optional)
      //method produce()
      any Grammar_ObjectLiteral_produce(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_ObjectLiteral));
          //---------
          //if .parent.constructor is Grammar.Operand
          if (__is(any_class(PROP(parent_,this).class),Grammar_Operand))  {
              //if .parent.parent.isMap //expression has isMap set
              if (_anyToBool(PROP(isMap_,PROP(parent_,PROP(parent_,this)))))  { //expression has isMap set
                  //.isMap = true
                  PROP(isMap_,this) = true;
              };
          };
          //if .isMap, .out 'new Map().fromObject('
          if (_anyToBool(PROP(isMap_,this))) {METHOD(out_,this)(this,1,(any_arr){any_LTR("new Map().fromObject(")
          });};
          //.out '{',{CSL:.items, freeForm:.constructor is Grammar.FreeObjectLiteral },'}'
          METHOD(out_,this)(this,3,(any_arr){any_LTR("{")
, new(Map,2,(any_arr){
          _newPair("CSL",PROP(items_,this)), 
          _newPair("freeForm",any_number(__is(any_class(this.class),Grammar_FreeObjectLiteral)))
          })
          
, any_LTR("}")
          });
          //if .isMap, .out ')'
          if (_anyToBool(PROP(isMap_,this))) {METHOD(out_,this)(this,1,(any_arr){any_LTR(")")
          });};
      return undefined;
      }
//### Append to class Grammar.FunctionDeclaration ###
    
//`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`
//`FunctionDeclaration`s are function definitions. 
//`export` prefix causes the function to be included in `module.exports`
//`generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)
     //method produce(prefix:array)
     any Grammar_FunctionDeclaration_produce(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_FunctionDeclaration));
      //---------
      // define named params
      var prefix= argc? arguments[0] : undefined;
      //---------
      //var isConstructor = this instance of Grammar.ConstructorDeclaration
      var isConstructor = any_number(_instanceof(this,Grammar_ConstructorDeclaration));
      ////Generators are implemented in ES6 with the "function*" keyword (note the asterisk)
      //var generatorMark = .hasAdjective("generator") and .lexer.project.compilerVar('ES6')? "*" else ""
      var generatorMark = _anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_LTR("generator")
      })) && _anyToBool(__call(compilerVar_,PROP(project_,PROP(lexer_,this)),1,(any_arr){any_LTR("ES6")
      })) ? any_LTR("*") : any_EMPTY_STR;
      //if this instance of Grammar.MethodDeclaration
      if (_instanceof(this,Grammar_MethodDeclaration))  {
          //#get owner where this method belongs to
          //if no prefix
          if (!_anyToBool(prefix))  {
              //if no .getOwnerPrefix() into prefix 
              if (!(_anyToBool((prefix=METHOD(getOwnerPrefix_,this)(this,0,NULL)))))  {
                  //fail with 'method "#{.name}" Cannot determine owner object'
                  throw(new(Error,1,(any_arr){_concatAny(3,any_LTR("method \"")
, PROP(name_,this)
, any_LTR("\" Cannot determine owner object")
                  )}));;
              };
          };
          //#if shim, check before define
          //if .hasAdjective("shim"), .out "if (!",prefix,.name,")",NL
          if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_LTR("shim")
          }))) {METHOD(out_,this)(this,5,(any_arr){any_LTR("if (!")
, prefix
, PROP(name_,this)
, any_LTR(")")
, Producer_js_NL
          });};
          //if .definePropItems #we should code Object.defineProperty
          if (_anyToBool(PROP(definePropItems_,this)))  {// #we should code Object.defineProperty
              //if prefix[1].slice(-1) is '.', prefix[1] = prefix[1].slice(0,-1) #remove extra dot
              if (__is(__call(slice_,ITEM(1,prefix),1,(any_arr){any_number(-1)
              }),any_LTR("."))) {ITEM(1,prefix) = __call(slice_,ITEM(1,prefix),2,(any_arr){any_number(0)
, any_number(-1)
              });};
              //.out "Object.defineProperty(",NL,
              METHOD(out_,this)(this,7,(any_arr){any_LTR("Object.defineProperty(")
, Producer_js_NL
, prefix
, any_LTR(",'")
, PROP(name_,this)
, any_LTR("',{value:function")
, generatorMark
              });
          }
                    //prefix, ",'",.name,"',{value:function",generatorMark
          //else
          
          else {
              //.out prefix,.name," = function",generatorMark
              METHOD(out_,this)(this,4,(any_arr){prefix
, PROP(name_,this)
, any_LTR(" = function")
, generatorMark
              });
          };
      }
//else, it is a simple function
      //else 
      
      else {
          //.out "function ",.name, generatorMark
          METHOD(out_,this)(this,3,(any_arr){any_LTR("function ")
, PROP(name_,this)
, generatorMark
          });
      };
//if 'nice', produce default nice body, and then the generator header for real body
      //var isNice = .hasAdjective("nice") and not (isConstructor or .hasAdjective("shim") or .definePropItems or .hasAdjective("generator"))
      var isNice = any_number(_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_LTR("nice")
      })) && !((_anyToBool((_anyToBool(__or14=(_anyToBool(__or15=(_anyToBool(__or16=isConstructor)? __or16 : METHOD(hasAdjective_,this)(this,1,(any_arr){any_LTR("shim")
      })))? __or15 : PROP(definePropItems_,this)))? __or14 : METHOD(hasAdjective_,this)(this,1,(any_arr){any_LTR("generator")
      }))))));
      //if isNice
      if (_anyToBool(isNice))  {
          //var argsArray:array = .paramsDeclarations or []
          var argsArray = (_anyToBool(__or17=PROP(paramsDeclarations_,this))? __or17 : new(Array,0,NULL));
          //argsArray.push "__callback"
          METHOD(push_,argsArray)(argsArray,1,(any_arr){any_LTR("__callback")
          });
          //.out "(", {CSL:argsArray},"){", .getEOLComment(),NL
          METHOD(out_,this)(this,5,(any_arr){any_LTR("(")
, new(Map,1,(any_arr){
          _newPair("CSL",argsArray)
          })
          
, any_LTR("){")
, METHOD(getEOLComment_,this)(this,0,NULL)
, Producer_js_NL
          });
          //.out '  nicegen(this, ',prefix,.name,"_generator, arguments);",NL
          METHOD(out_,this)(this,5,(any_arr){any_LTR("  nicegen(this, ")
, prefix
, PROP(name_,this)
, any_LTR("_generator, arguments);")
, Producer_js_NL
          });
          //.out "};",NL
          METHOD(out_,this)(this,2,(any_arr){any_LTR("};")
, Producer_js_NL
          });
          //.out "function* ",prefix,.name,"_generator"
          METHOD(out_,this)(this,4,(any_arr){any_LTR("function* ")
, prefix
, PROP(name_,this)
, any_LTR("_generator")
          });
      };
      //end if
      
//Produce function parameters declaration
       
      //.out "(", {CSL:.paramsDeclarations}, "){", .getEOLComment()
      METHOD(out_,this)(this,4,(any_arr){any_LTR("(")
, new(Map,1,(any_arr){
      _newPair("CSL",PROP(paramsDeclarations_,this))
      })
      
, any_LTR("){")
, METHOD(getEOLComment_,this)(this,0,NULL)
      });
//now produce function body
      //.produceBody
      METHOD(produceBody_,this)(this,0,NULL);
//if we were coding .definePropItems , close Object.defineProperty
      //if .definePropItems 
      if (_anyToBool(PROP(definePropItems_,this)))  {
          //for each definePropItem in .definePropItems 
          any _list72=PROP(definePropItems_,this);
          { var definePropItem=undefined;
          for(int definePropItem__inx=0 ; definePropItem__inx<_list72.value.arr->length ; definePropItem__inx++){definePropItem=ITEM(definePropItem__inx,_list72);
          
            //.out NL,",",definePropItem.name,":", definePropItem.negated? 'false':'true'
            METHOD(out_,this)(this,5,(any_arr){Producer_js_NL
, any_LTR(",")
, PROP(name_,definePropItem)
, any_LTR(":")
, _anyToBool(PROP(negated_,definePropItem)) ? any_LTR("false") : any_LTR("true")
            });
          }};// end for each in
          //end for
          
          //.out NL,"})"
          METHOD(out_,this)(this,2,(any_arr){Producer_js_NL
, any_LTR("})")
          });
      };
//If the function was adjectivated 'export', add to module.exports
      //.produceExport .name
      METHOD(produceExport_,this)(this,1,(any_arr){PROP(name_,this)
      });
     return undefined;
     }
//#### method produceBody()
     any Grammar_FunctionDeclaration_produceBody(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_FunctionDeclaration));
      //---------
//if the function has a exception block, insert 'try{'
      //if no .body or no .body.statements //interface function?
      if (_anyToBool((_anyToBool(__or18=any_number(!_anyToBool(PROP(body_,this))))? __or18 : any_number(!_anyToBool(PROP(statements_,PROP(body_,this)))))))  { //interface function?
            //.throwError 'function #{.name} from #{.lexer.filename} has no body'
            METHOD(throwError_,this)(this,1,(any_arr){_concatAny(5,any_LTR("function ")
, PROP(name_,this)
, any_LTR(" from ")
, PROP(filename_,PROP(lexer_,this))
, any_LTR(" has no body")
            )
            });
      };
//if one-line-function, code now: Example: function square(x) = x*x
      //if .body instance of Grammar.Expression
      if (_instanceof(PROP(body_,this),Grammar_Expression))  {
          //.out "return ", .body
          METHOD(out_,this)(this,2,(any_arr){any_LTR("return ")
, PROP(body_,this)
          });
      }
      //else
      
      else {
//if it has a "catch" or "exception", insert 'try{'
          //for each statement in .body.statements
          any _list73=PROP(statements_,PROP(body_,this));
          { var statement=undefined;
          for(int statement__inx=0 ; statement__inx<_list73.value.arr->length ; statement__inx++){statement=ITEM(statement__inx,_list73);
          
            //if statement.specific instance of Grammar.ExceptionBlock
            if (_instanceof(PROP(specific_,statement),Grammar_ExceptionBlock))  {
                //.out " try{",NL
                METHOD(out_,this)(this,2,(any_arr){any_LTR(" try{")
, Producer_js_NL
                });
                //break
                break;
            };
          }};// end for each in
//if params defaults where included, we assign default values to arguments 
//(if ES6 enabled, they were included abobve in ParamsDeclarations production )
          //if .paramsDeclarations and not .lexer.project.compilerVar('ES6')
          if (_anyToBool(PROP(paramsDeclarations_,this)) && !(_anyToBool(__call(compilerVar_,PROP(project_,PROP(lexer_,this)),1,(any_arr){any_LTR("ES6")
          }))))  {
              //for each paramDecl in .paramsDeclarations
              any _list74=PROP(paramsDeclarations_,this);
              { var paramDecl=undefined;
              for(int paramDecl__inx=0 ; paramDecl__inx<_list74.value.arr->length ; paramDecl__inx++){paramDecl=ITEM(paramDecl__inx,_list74);
              
                //if paramDecl.assignedValue 
                if (_anyToBool(PROP(assignedValue_,paramDecl)))  {
                    //.body.assignIfUndefined paramDecl.name, paramDecl.assignedValue
                    __call(assignIfUndefined_,PROP(body_,this),2,(any_arr){PROP(name_,paramDecl)
, PROP(assignedValue_,paramDecl)
                    });
                };
              }};// end for each in
              
          };
              //#end for
          //#end if
          //.body.produce()
          __call(produce_,PROP(body_,this),0,NULL);
      };
      //end if one-line-function
      
//close the function, add source map for function default "return undefined" execution point
      //.out "}"
      METHOD(out_,this)(this,1,(any_arr){any_LTR("}")
      });
      ////ifdef PROD_JS // if compile-to-js
      //if .lexer.outCode.sourceMap
      if (_anyToBool(PROP(sourceMap_,PROP(outCode_,PROP(lexer_,this)))))  {
          //.lexer.outCode.sourceMap.add ( .EndFnLineNum, 0, .lexer.outCode.lineNum-1, 0)
          __call(add_,PROP(sourceMap_,PROP(outCode_,PROP(lexer_,this))),4,(any_arr){PROP(EndFnLineNum_,this)
, any_number(0)
, any_number(_anyToNumber(PROP(lineNum_,PROP(outCode_,PROP(lexer_,this)))) - 1)
, any_number(0)
    });
      };
     return undefined;
     }
      ////endif
//--------------------
//### Append to class Grammar.PrintStatement ###
    
//`print` is an alias for console.log
      //method produce()
      any Grammar_PrintStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PrintStatement));
        //---------
        //.out "console.log(",{"CSL":.args},")"
        METHOD(out_,this)(this,3,(any_arr){any_LTR("console.log(")
, new(Map,1,(any_arr){
        _newPair("CSL",PROP(args_,this))
        })
        
, any_LTR(")")
        });
      return undefined;
      }
//--------------------
//### Append to class Grammar.EndStatement ###
    
//Marks the end of a block. It's just a comment for javascript
      //method produce()
      any Grammar_EndStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_EndStatement));
        //---------
        //declare valid .lexer.outCode.lastOriginalCodeComment
        
        //declare valid .lexer.infoLines
        
        //if .lexer.outCode.lastOriginalCodeComment<.lineInx
        if (_anyToNumber(PROP(lastOriginalCodeComment_,PROP(outCode_,PROP(lexer_,this)))) < _anyToNumber(PROP(lineInx_,this)))  {
          //.out {COMMENT: .lexer.infoLines[.lineInx].text}
          METHOD(out_,this)(this,1,(any_arr){new(Map,1,(any_arr){
          _newPair("COMMENT",PROP(text_,ITEM(_anyToNumber(PROP(lineInx_,this)),PROP(infoLines_,PROP(lexer_,this)))))
          })
          
          });
        };
        
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//--------------------
//### Append to class Grammar.CompilerStatement ###
    
      //method produce()
      any Grammar_CompilerStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_CompilerStatement));
        //---------
//out this line as comment 
        //.outSourceLineAsComment .sourceLineNum
        METHOD(outSourceLineAsComment_,this)(this,1,(any_arr){PROP(sourceLineNum_,this)
        });
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//--------------------
//### Append to class Grammar.DeclareStatement ###
    
//Out as comments
      //method produce()
      any Grammar_DeclareStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DeclareStatement));
        //---------
        //.outSourceLinesAsComment .sourceLineNum, .names? .lastLineOf(.names) : .sourceLineNum
        METHOD(outSourceLinesAsComment_,this)(this,2,(any_arr){PROP(sourceLineNum_,this)
, _anyToBool(PROP(names_,this)) ? METHOD(lastLineOf_,this)(this,1,(any_arr){PROP(names_,this)
        }) : PROP(sourceLineNum_,this)
        });
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//----------------------------
//### Append to class Grammar.ClassDeclaration ###
    
//Classes contain a code block with properties and methods definitions.
      //method produce()
      any Grammar_ClassDeclaration_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ClassDeclaration));
        //---------
        //.out {COMMENT:"constructor"},NL
        METHOD(out_,this)(this,2,(any_arr){new(Map,1,(any_arr){
        _newPair("COMMENT",any_LTR("constructor"))
        })
        
, Producer_js_NL
        });
      
//First, since in JS we have a object-class-function-constructor all-in-one
//we need to get the class constructor, and separate other class items.
        //var theConstructorDeclaration = null
        var theConstructorDeclaration = null;
        //var theMethods = []
        var theMethods = new(Array,0,NULL);
        //var theProperties = []
        var theProperties = new(Array,0,NULL);
        //if .body
        if (_anyToBool(PROP(body_,this)))  {
          //for each index,item in .body.statements
          any _list75=PROP(statements_,PROP(body_,this));
          { var item=undefined;
          for(int index=0 ; index<_list75.value.arr->length ; index++){item=ITEM(index,_list75);
          
            //if item.specific instanceof Grammar.ConstructorDeclaration 
            if (_instanceof(PROP(specific_,item),Grammar_ConstructorDeclaration))  {
              //if theConstructorDeclaration # what? more than one?
              if (_anyToBool(theConstructorDeclaration))  {// # what? more than one?
                //.throwError('Two constructors declared for class #{.name}')
                METHOD(throwError_,this)(this,1,(any_arr){_concatAny(2,any_LTR("Two constructors declared for class ")
, PROP(name_,this)
                )
              });
              };
              //theConstructorDeclaration = item.specific
              theConstructorDeclaration = PROP(specific_,item);
            }
            //else if item.specific instanceof Grammar.PropertiesDeclaration
            
            else if (_instanceof(PROP(specific_,item),Grammar_PropertiesDeclaration))  {
              //theProperties.push item.specific
              METHOD(push_,theProperties)(theProperties,1,(any_arr){PROP(specific_,item)
              });
            }
            //else 
            
            else {
              //theMethods.push item
              METHOD(push_,theMethods)(theMethods,1,(any_arr){item
              });
            };
          }};// end for each in
          
        };
        //#end if body
        //var prefix = .getOwnerPrefix()
        var prefix = METHOD(getOwnerPrefix_,this)(this,0,NULL);
//js: function-constructor-class-namespace-object (All-in-one)
        //.out "function ",.name
        METHOD(out_,this)(this,2,(any_arr){any_LTR("function ")
, PROP(name_,this)
        });
        //if theConstructorDeclaration //there was a constructor body, add specified params
        if (_anyToBool(theConstructorDeclaration))  { //there was a constructor body, add specified params
            //.out "(", {CSL:theConstructorDeclaration.paramsDeclarations}, "){", .getEOLComment()
            METHOD(out_,this)(this,4,(any_arr){any_LTR("(")
, new(Map,1,(any_arr){
            _newPair("CSL",PROP(paramsDeclarations_,theConstructorDeclaration))
            })
            
, any_LTR("){")
, METHOD(getEOLComment_,this)(this,0,NULL)
            });
        }
        //else
        
        else {
            //.out "(){ // default constructor",NL
            METHOD(out_,this)(this,2,(any_arr){any_LTR("(){ // default constructor")
, Producer_js_NL
            });
        };
//call super-class __init
        //if .varRefSuper
        if (_anyToBool(PROP(varRefSuper_,this)))  {
            //.out {COMMENT:["default constructor: call super.constructor"]}
            METHOD(out_,this)(this,1,(any_arr){new(Map,1,(any_arr){
            _newPair("COMMENT",new(Array,1,(any_arr){any_LTR("default constructor: call super.constructor")}))
            })
            
            });
            //.out NL,"    ",.varRefSuper,".prototype.constructor.apply(this,arguments)",NL
            METHOD(out_,this)(this,5,(any_arr){Producer_js_NL
, any_LTR("    ")
, PROP(varRefSuper_,this)
, any_LTR(".prototype.constructor.apply(this,arguments)")
, Producer_js_NL
            });
        };
//initialize own properties
        //for each propDecl in theProperties
        any _list76=theProperties;
        { var propDecl=undefined;
        for(int propDecl__inx=0 ; propDecl__inx<_list76.value.arr->length ; propDecl__inx++){propDecl=ITEM(propDecl__inx,_list76);
        
            //propDecl.produce('this.') //property assignments
            METHOD(produce_,propDecl)(propDecl,1,(any_arr){any_LTR("this.")
        }); //property assignments
        }};// end for each in
        
        //if theConstructorDeclaration //there was a body
        if (_anyToBool(theConstructorDeclaration))  { //there was a body
            //theConstructorDeclaration.produceBody
            METHOD(produceBody_,theConstructorDeclaration)(theConstructorDeclaration,0,NULL);
            //.out ";",NL
            METHOD(out_,this)(this,2,(any_arr){any_LTR(";")
, Producer_js_NL
            });
        }
        //else
        
        else {
            //.out "};",NL
            METHOD(out_,this)(this,2,(any_arr){any_LTR("};")
, Producer_js_NL
            });
        };
//if the class is inside a namespace...
        //if prefix and prefix.length 
        if (_anyToBool(prefix) && _length(prefix))  {
            //.out prefix,.name,"=",.name,";",NL //set declared fn-Class as method of owner-namespace
            METHOD(out_,this)(this,6,(any_arr){prefix
, PROP(name_,this)
, any_LTR("=")
, PROP(name_,this)
, any_LTR(";")
, Producer_js_NL
            }); //set declared fn-Class as method of owner-namespace
        };
//Set super-class if we have one indicated
        //if .varRefSuper
        if (_anyToBool(PROP(varRefSuper_,this)))  {
          //.out {COMMENT:[.name,' (extends|proto is) ',.varRefSuper,NL]}
          METHOD(out_,this)(this,1,(any_arr){new(Map,1,(any_arr){
          _newPair("COMMENT",new(Array,4,(any_arr){PROP(name_,this), any_LTR(" (extends|proto is) "), PROP(varRefSuper_,this), Producer_js_NL}))
          })
          
          });
          //.out .name,'.prototype.__proto__ = ', .varRefSuper,'.prototype;',NL 
          METHOD(out_,this)(this,5,(any_arr){PROP(name_,this)
, any_LTR(".prototype.__proto__ = ")
, PROP(varRefSuper_,this)
, any_LTR(".prototype;")
, Producer_js_NL
          });
        };
//now out methods, meaning: create properties in the object-function-class prototype
        //for each itemMethodDeclaration in theMethods
        any _list77=theMethods;
        { var itemMethodDeclaration=undefined;
        for(int itemMethodDeclaration__inx=0 ; itemMethodDeclaration__inx<_list77.value.arr->length ; itemMethodDeclaration__inx++){itemMethodDeclaration=ITEM(itemMethodDeclaration__inx,_list77);
        
            //itemMethodDeclaration.produce undefined, prefix
            METHOD(produce_,itemMethodDeclaration)(itemMethodDeclaration,2,(any_arr){undefined
, prefix
            });
        }};// end for each in
//If the class was adjectivated 'export', add to module.exports
        //.produceExport .name
        METHOD(produceExport_,this)(this,1,(any_arr){PROP(name_,this)
        });
        //.out NL,{COMMENT:"end class "},.name,NL
        METHOD(out_,this)(this,4,(any_arr){Producer_js_NL
, new(Map,1,(any_arr){
        _newPair("COMMENT",any_LTR("end class "))
        })
        
, PROP(name_,this)
, Producer_js_NL
        });
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//### Append to class Grammar.AppendToDeclaration ###
    
//Any class|object can have properties or methods appended at any time. 
//Append-to body contains properties and methods definitions.
      //method produce() 
      any Grammar_AppendToDeclaration_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_AppendToDeclaration));
        //---------
        //.out .body
        METHOD(out_,this)(this,1,(any_arr){PROP(body_,this)
        });
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
      return undefined;
      }
//### Append to class Grammar.NamespaceDeclaration ###
    
//Any class|object can have properties or methods appended at any time. 
//Append-to body contains properties and methods definitions.
      //method produce() 
      any Grammar_NamespaceDeclaration_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_NamespaceDeclaration));
        //---------
        //.out 'var ',.name,'={};'
        METHOD(out_,this)(this,3,(any_arr){any_LTR("var ")
, PROP(name_,this)
, any_LTR("={};")
        });
        //.out .body
        METHOD(out_,this)(this,1,(any_arr){PROP(body_,this)
        });
        //.skipSemiColon = true
        PROP(skipSemiColon_,this) = true;
        //.produceExport .name
        METHOD(produceExport_,this)(this,1,(any_arr){PROP(name_,this)
        });
      return undefined;
      }
//### Append to class Grammar.TryCatch ###
    
      //method produce() 
      any Grammar_TryCatch_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_TryCatch));
        //---------
        //.out "try{", .body, .exceptionBlock
        METHOD(out_,this)(this,3,(any_arr){any_LTR("try{")
, PROP(body_,this)
, PROP(exceptionBlock_,this)
        });
      return undefined;
      }
//### Append to class Grammar.ExceptionBlock ###
    
      //method produce() 
      any Grammar_ExceptionBlock_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ExceptionBlock));
        //---------
        //.out NL,"}catch(",.catchVar,"){", .body, "}"
        METHOD(out_,this)(this,6,(any_arr){Producer_js_NL
, any_LTR("}catch(")
, PROP(catchVar_,this)
, any_LTR("){")
, PROP(body_,this)
, any_LTR("}")
        });
        //if .finallyBody
        if (_anyToBool(PROP(finallyBody_,this)))  {
          //.out NL,"finally{", .finallyBody, "}"
          METHOD(out_,this)(this,4,(any_arr){Producer_js_NL
, any_LTR("finally{")
, PROP(finallyBody_,this)
, any_LTR("}")
          });
        };
      return undefined;
      }
//### Append to class Grammar.CaseStatement ###
    
//##### method produce()
      any Grammar_CaseStatement_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_CaseStatement));
        //---------
//if we have a varRef, is a case over a value
        //if .isInstanceof
        if (_anyToBool(PROP(isInstanceof_,this)))  {
            //return .produceInstanceOfLoop
            return PROP(produceInstanceOfLoop_,this);
        };
        //for each index,whenSection in .cases
        any _list78=PROP(cases_,this);
        { var whenSection=undefined;
        for(int index=0 ; index<_list78.value.arr->length ; index++){whenSection=ITEM(index,_list78);
        
            //.outSourceLineAsComment whenSection.sourceLineNum
            METHOD(outSourceLineAsComment_,this)(this,1,(any_arr){PROP(sourceLineNum_,whenSection)
            });
            //.out index>0? 'else ' : '' 
            METHOD(out_,this)(this,1,(any_arr){index > 0 ? any_LTR("else ") : any_EMPTY_STR
            });
            //if .varRef
            if (_anyToBool(PROP(varRef_,this)))  {
                ////case foo...
                //.out 'if (', {pre:['(',.varRef,'=='], CSL:whenSection.expressions, post:')', separator:'||'}
                METHOD(out_,this)(this,2,(any_arr){any_LTR("if (")
, new(Map,4,(any_arr){
                _newPair("pre",new(Array,3,(any_arr){any_LTR("("), PROP(varRef_,this), any_LTR("==")})), 
                _newPair("CSL",PROP(expressions_,whenSection)), 
                _newPair("post",any_LTR(")")), 
                _newPair("separator",any_LTR("||"))
                })
                
                });
            }
            //else
            
            else {
                ////case when TRUE
                //.out 'if (', {pre:['('], CSL:whenSection.expressions, post:')', separator:'||'}
                METHOD(out_,this)(this,2,(any_arr){any_LTR("if (")
, new(Map,4,(any_arr){
                _newPair("pre",new(Array,1,(any_arr){any_LTR("(")})), 
                _newPair("CSL",PROP(expressions_,whenSection)), 
                _newPair("post",any_LTR(")")), 
                _newPair("separator",any_LTR("||"))
                })
                
                });
            };
                
            //.out '){',
            METHOD(out_,this)(this,4,(any_arr){any_LTR("){")
, PROP(body_,whenSection)
, Producer_js_NL
, any_LTR("}")
            });
        }};// end for each in
                //whenSection.body, NL,
                //'}'
//else body
        //if .elseBody, .out NL,'else {',.elseBody,'}'
        if (_anyToBool(PROP(elseBody_,this))) {METHOD(out_,this)(this,4,(any_arr){Producer_js_NL
, any_LTR("else {")
, PROP(elseBody_,this)
, any_LTR("}")
        });};
      return undefined;
      }
//##### method produceInstanceOfLoop
      any Grammar_CaseStatement_produceInstanceOfLoop(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_CaseStatement));
        //---------
        //var tmpVar=UniqueID.getVarName('class')
        var tmpVar = UniqueID_getVarName(undefined,1,(any_arr){any_LTR("class")
        });
        //.out "Class_ptr ",tmpVar," = ",.varRef,".class;",NL,
        METHOD(out_,this)(this,10,(any_arr){any_LTR("Class_ptr ")
, tmpVar
, any_LTR(" = ")
, PROP(varRef_,this)
, any_LTR(".class;")
, Producer_js_NL
, any_LTR("while(")
, tmpVar
, any_LTR("){")
, Producer_js_NL
        });
            //"while(",tmpVar,"){",NL
        //for each index,whenSection in .cases
        any _list79=PROP(cases_,this);
        { var whenSection=undefined;
        for(int index=0 ; index<_list79.value.arr->length ; index++){whenSection=ITEM(index,_list79);
        
            //.outSourceLineAsComment whenSection.sourceLineNum
            METHOD(outSourceLineAsComment_,this)(this,1,(any_arr){PROP(sourceLineNum_,whenSection)
            });
            //whenSection.out index>0? 'else ' : '' ,
            METHOD(out_,whenSection)(whenSection,9,(any_arr){index > 0 ? any_LTR("else ") : any_EMPTY_STR
, any_LTR("if (")
, new(Map,4,(any_arr){
                _newPair("pre",new(Array,3,(any_arr){any_LTR("("), PROP(varRef_,this), any_LTR(".class==")})), 
                _newPair("CSL",PROP(expressions_,whenSection)), 
                _newPair("post",any_LTR(")")), 
                _newPair("separator",any_LTR("||"))
                })
            
, any_LTR("){")
, PROP(body_,whenSection)
, Producer_js_NL
, any_LTR("break;")
, Producer_js_NL
, any_LTR("}")
            });
        }};// end for each in
                //'if (', {pre:['(',.varRef,'.class=='], CSL:whenSection.expressions, post:')', separator:'||'},
                //'){',
                //whenSection.body, NL,
                //'break;',NL, //exit while super loop
                //'}'
        //end for
        
        //.out tmpVar,'=',tmpVar,'.super;',NL //move to super
        METHOD(out_,this)(this,5,(any_arr){tmpVar
, any_LTR("=")
, tmpVar
, any_LTR(".super;")
, Producer_js_NL
        }); //move to super
        //.out '}',NL //close while loooking for super
        METHOD(out_,this)(this,2,(any_arr){any_LTR("}")
, Producer_js_NL
        }); //close while loooking for super
//else body
        //if .elseBody, .out NL,'if(!tmpVar) {',.elseBody,'}'
        if (_anyToBool(PROP(elseBody_,this))) {METHOD(out_,this)(this,4,(any_arr){Producer_js_NL
, any_LTR("if(!tmpVar) {")
, PROP(elseBody_,this)
, any_LTR("}")
        });};
      return undefined;
      }
//### Append to class Grammar.YieldExpression ###
    
      //method produce()
      any Grammar_YieldExpression_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_YieldExpression));
        //---------
//Check location
      
        //if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration 
        var functionDeclaration=undefined;
        if (_anyToBool((_anyToBool(__or19=any_number(!(_anyToBool((functionDeclaration=METHOD(getParent_,this)(this,1,(any_arr){Grammar_FunctionDeclaration
        }))))))? __or19 : any_number(!_anyToBool(METHOD(hasAdjective_,functionDeclaration)(functionDeclaration,1,(any_arr){any_LTR("nice")
            }))))))  {
            //or no functionDeclaration.hasAdjective("nice")
                //.throwError '"yield" can only be used inside a "nice function/method"'
                METHOD(throwError_,this)(this,1,(any_arr){any_LTR("\"yield\" can only be used inside a \"nice function/method\"")
                });
        };
        //var yieldArr=[]
        var yieldArr = new(Array,0,NULL);
        //var varRef = .fnCall.varRef
        var varRef = PROP(varRef_,PROP(fnCall_,this));
        ////from .varRef calculate object owner and method name 
        //var thisValue=['null']
        var thisValue = new(Array,1,(any_arr){any_LTR("null")});
        //var fnName = varRef.name #default if no accessors 
        var fnName = PROP(name_,varRef);// #default if no accessors
        //if varRef.accessors
        if (_anyToBool(PROP(accessors_,varRef)))  {
            //var inx=varRef.accessors.length-1
            var inx = any_number(_length(PROP(accessors_,varRef)) - 1);
            //if varRef.accessors[inx] instance of Grammar.FunctionAccess
            if (_instanceof(ITEM(_anyToNumber(inx),PROP(accessors_,varRef)),Grammar_FunctionAccess))  {
                //var functionAccess = varRef.accessors[inx]
                var functionAccess = ITEM(_anyToNumber(inx),PROP(accessors_,varRef));
                //yieldArr = functionAccess.args
                yieldArr = PROP(args_,functionAccess);
                //inx--
                inx.value.number--;
            };
            //if inx>=0 
            if (_anyToNumber(inx) >= 0)  {
                //if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
                if (!(_instanceof(ITEM(_anyToNumber(inx),PROP(accessors_,varRef)),Grammar_PropertyAccess)))  {
                    //.throwError 'yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.'
                    METHOD(throwError_,this)(this,1,(any_arr){any_LTR("yield needs a clear method name. Example: \"yield until obj.method(10)\". redefine yield parameter.")
                    });
                };
                //fnName = "'#{varRef.accessors[inx].name}'"
                fnName = _concatAny(3,any_LTR("'")
, (PROP(name_,ITEM(_anyToNumber(inx),PROP(accessors_,varRef))))
, any_LTR("'")
                );
                //thisValue = [varRef.name]
                thisValue = new(Array,1,(any_arr){PROP(name_,varRef)});
                //thisValue.push varRef.accessors.slice(0,inx)
                METHOD(push_,thisValue)(thisValue,1,(any_arr){__call(slice_,PROP(accessors_,varRef),2,(any_arr){any_number(0)
, inx
                })
                });
            };
        };
        //if .specifier is 'until'
        if (__is(PROP(specifier_,this),any_LTR("until")))  {
            //yieldArr.unshift fnName
            METHOD(unshift_,yieldArr)(yieldArr,1,(any_arr){fnName
            });
            //yieldArr.unshift thisValue
            METHOD(unshift_,yieldArr)(yieldArr,1,(any_arr){thisValue
            });
        }
        //else #parallel map
        
        else {
            //yieldArr.push "'map'",.arrExpression, thisValue, fnName
            METHOD(push_,yieldArr)(yieldArr,4,(any_arr){any_LTR("'map'")
, PROP(arrExpression_,this)
, thisValue
, fnName
            });
        };
        //.out "yield [ ",{CSL:yieldArr}," ]"
        METHOD(out_,this)(this,3,(any_arr){any_LTR("yield [ ")
, new(Map,1,(any_arr){
        _newPair("CSL",yieldArr)
        })
        
, any_LTR(" ]")
        });
      return undefined;
      }
//# Helper functions 
//Utility 
//-------
    //var NL = '\n' # New Line constant
//Operator Mapping
//================
//Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents.
    //var OPER_TRANSLATION_map = map
      //'no':           '!'
      //'not':          '!'
      //'unary -':      '-'
      //'unary +':      '+'
      //'&':            '+'  //string concat
      //'&=':           '+='  //string concat
      //'bitand':       '&'
      //'bitor':        '|'
      //'bitxor':       '^'
      //'bitnot':       '~'
      //'type of':      'typeof'
      //'instance of':  'instanceof'
      //'is':           '==='
      //'isnt':         '!=='
      //'<>':           '!=='
      //'and':          '&&'
      //'but':          '&&'
      //'or':           '||'
      //'has property': 'in'
    //function operTranslate(name:string)
    any Producer_js_operTranslate(DEFAULT_ARGUMENTS){
      // define named params
      var name= argc? arguments[0] : undefined;
      //---------
      //return OPER_TRANSLATION_map.get(name) or name
      return (_anyToBool(__or20=METHOD(get_,Producer_js_OPER_TRANSLATION_map)(Producer_js_OPER_TRANSLATION_map,1,(any_arr){name
      }))? __or20 : name);
    return undefined;
    }
//---------------------------------
//### Append to class ASTBase
    
//Helper methods and properties, valid for all nodes
//#### properties skipSemiColon 
     ;
//#### helper method assignIfUndefined(name, value: Grammar.Expression) 
     any ASTBase_assignIfUndefined(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,ASTBase));
          //---------
          // define named params
          var name, value;
          name=value=undefined;
          switch(argc){
            case 2:value=arguments[1];
            case 1:name=arguments[0];
          }
          //---------
          
          //declare valid value.root.name.name
          
          //#do nothing if value is 'undefined'
    
          //#Expression->Operand->VariableRef->name
          //var varRef:Grammar.VariableRef = value.root.name
          var varRef = PROP(name_,PROP(root_,value));
          //if varRef.constructor is Grammar.VariableRef
          if (__is(any_class(varRef.class),Grammar_VariableRef))  {
              //if varRef.name is 'undefined' 
              if (__is(PROP(name_,varRef),any_LTR("undefined")))  {
                  //.out {COMMENT:name},": undefined",NL
                  METHOD(out_,this)(this,3,(any_arr){new(Map,1,(any_arr){
                  _newPair("COMMENT",name)
                  })
                  
, any_LTR(": undefined")
, Producer_js_NL
                  });
                  //return
                  return undefined;
              };
          };
          //.out "if(",name,'===undefined) ',name,"=",value,";",NL
          METHOD(out_,this)(this,8,(any_arr){any_LTR("if(")
, name
, any_LTR("===undefined) ")
, name
, any_LTR("=")
, value
, any_LTR(";")
, Producer_js_NL
          });
     return undefined;
     }
//#### helper method produceExport(name:string)
     any ASTBase_produceExport(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
//"module.export" not valid for browser modules
        //if .lexer.options.browser, return
        if (_anyToBool(PROP(browser_,PROP(options_,PROP(lexer_,this))))) {return undefined;};
//if the class/namespace has the same name as the file, it's the export object
        
        //var moduleNode:Grammar.Module = .getParent(Grammar.Module)
        var moduleNode = METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module
        });
        //if moduleNode.fileInfo.base is .name  
        if (__is(PROP(base_,PROP(fileInfo_,moduleNode)),PROP(name_,this)))  {
            //do nothing //is the default export
            //do nothing
            ; //is the default export
        }
        //else if .hasAdjective("export") 
        
        else if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_LTR("export")
        })))  {
            //.out NL,{COMMENT:'export'},NL
            METHOD(out_,this)(this,3,(any_arr){Producer_js_NL
, new(Map,1,(any_arr){
            _newPair("COMMENT",any_LTR("export"))
            })
            
, Producer_js_NL
            });
            //.out 'module.exports.',name,' = ', name,";",NL
            METHOD(out_,this)(this,6,(any_arr){any_LTR("module.exports.")
, name
, any_LTR(" = ")
, name
, any_LTR(";")
, Producer_js_NL
            });
            //.skipSemiColon = true
            PROP(skipSemiColon_,this) = true;
        };
     return undefined;
     }


//-------------------------
void Producer_js__moduleInit(void){
    Producer_js_NL = any_LTR("\n");
    Producer_js_OPER_TRANSLATION_map = new(Map,19,(any_arr){
      _newPair("no",any_LTR("!")), 
      _newPair("not",any_LTR("!")), 
      _newPair("unary -",any_LTR("-")), 
      _newPair("unary +",any_LTR("+")), 
      _newPair("&",any_LTR("+")), 
      _newPair("&=",any_LTR("+=")), 
      _newPair("bitand",any_LTR("&")), 
      _newPair("bitor",any_LTR("|")), 
      _newPair("bitxor",any_LTR("^")), 
      _newPair("bitnot",any_LTR("~")), 
      _newPair("type of",any_LTR("typeof")), 
      _newPair("instance of",any_LTR("instanceof")), 
      _newPair("is",any_LTR("===")), 
      _newPair("isnt",any_LTR("!==")), 
      _newPair("<>",any_LTR("!==")), 
      _newPair("and",any_LTR("&&")), 
      _newPair("but",any_LTR("&&")), 
      _newPair("or",any_LTR("||")), 
      _newPair("has property",any_LTR("in"))
      })
;
};
