#include "Names.h"
//-------------------------
//Module Names
//-------------------------
#include "Names.c.extra"
//-------------------------
//NAMESPACE Names
//-------------------------
var Names_allNameDeclarations;
    //-----------------------
    // Class Names_Declaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Names_Declaration_METHODS = {
      { normalize_, Names_Declaration_normalize },
      { setMember_, Names_Declaration_setMember },
      { findOwnMember_, Names_Declaration_findOwnMember },
      { ownMember_, Names_Declaration_ownMember },
      { getMemberCount_, Names_Declaration_getMemberCount },
      { replaceForward_, Names_Declaration_replaceForward },
      { makePointTo_, Names_Declaration_makePointTo },
      { positionText_, Names_Declaration_positionText },
      { originalDeclarationPosition_, Names_Declaration_originalDeclarationPosition },
      { sayErr_, Names_Declaration_sayErr },
      { warn_, Names_Declaration_warn },
      { caseMismatch_, Names_Declaration_caseMismatch },
      { addMember_, Names_Declaration_addMember },
      { toString_, Names_Declaration_toString },
      { composedName_, Names_Declaration_composedName },
      { info_, Names_Declaration_info },
      { findMember_, Names_Declaration_findMember },
      { hasProto_, Names_Declaration_hasProto },
      { getMembersFromObjProperties_, Names_Declaration_getMembersFromObjProperties },
      { isInParents_, Names_Declaration_isInParents },
      { processConvertTypes_, Names_Declaration_processConvertTypes },
      { convertType_, Names_Declaration_convertType },
      { assignTypeFromValue_, Names_Declaration_assignTypeFromValue },
      { assignTypebyNameAffinity_, Names_Declaration_assignTypebyNameAffinity },
      { checkSuperChainProperties_, Names_Declaration_checkSuperChainProperties },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t Names_Declaration_PROPS[] = {
    name_
    , members_
    , nodeDeclared_
    , parent_
    , normalizeModeKeepFirstCase_
    , isScope_
    , nodeClass_
    , isPublicVar_
    , type_
    , itemType_
    , value_
    , isForward_
    , isDummy_
    , superDecl_
    };
    
any Names_fixSpecialNames(DEFAULT_ARGUMENTS); //forward declare
any Names_normalizeToLower(DEFAULT_ARGUMENTS); //forward declare
any Names_normalizeKeepFirst(DEFAULT_ARGUMENTS); //forward declare
any Names_isCapitalized(DEFAULT_ARGUMENTS); //forward declare
    //-----------------------
    // Class Names_NameDeclOptions: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Names_NameDeclOptions_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t Names_NameDeclOptions_PROPS[] = {
    normalizeModeKeepFirstCase_
    , pointsTo_
    , type_
    , itemType_
    , returnType_
    , value_
    , isForward_
    , isDummy_
    , informError_
    };
    
    

//--------------
    // Names_Declaration
    any Names_Declaration; //Class Names_Declaration
    
    //auto Names_Declaration_newFromObject
    inline any Names_Declaration_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(Names_Declaration,argc,arguments);
    }

//Dependencies
//------------

    //import ASTBase,Grammar,logger

    //shim import Map

//Module vars

    //public var allNameDeclarations: Declaration array = [] #array with all NameDeclarations created


//### public Class Declaration

//#### properties

        //name: string
        //members: Map string to Declaration
        //nodeDeclared: ASTBase
        //parent: Declaration

        //normalizeModeKeepFirstCase: boolean
        //isScope: boolean

        //nodeClass //VariableDecl(var&props)|MethodDeclaration|NamespaceDeclaration|ClassDeclaration
        //isPublicVar: boolean

        //type, itemType
        //value

        //isForward
        //isDummy
     ;


     //declare name affinity nameDecl
     

//#### constructor new Declaration(name, options:NameDeclOptions, node:ASTBase)
     void Names_Declaration__init(DEFAULT_ARGUMENTS){
      
      // define named params
      var name, options, node;
      name=options=node=undefined;
      switch(argc){
        case 3:node=arguments[2];
        case 2:options=arguments[1];
        case 1:name=arguments[0];
      }
      //---------

      //.name = name.toString()
      PROP(name_,this) = METHOD(toString_,name)(name,0,NULL);

      //.members = new Map // string to Declaration //contained Declarations
      PROP(members_,this) = new(Map,0,NULL); // string to Declaration //contained Declarations

      //.nodeDeclared = node
      PROP(nodeDeclared_,this) = node;

      //if node 
      if (_anyToBool(node))  {
          //.nodeClass = node.constructor
          PROP(nodeClass_,this) = any_class(node.class);
          //if .nodeClass is Grammar.Module //module as namespace declaration
          if (__is(PROP(nodeClass_,this),Grammar_Module))  { //module as namespace declaration
              //.nodeClass = Grammar.NamespaceDeclaration //treat as a namespace
              PROP(nodeClass_,this) = Grammar_NamespaceDeclaration; //treat as a namespace
          };
      };

      //if options 
      if (_anyToBool(options))  {
          //if options.normalizeModeKeepFirstCase, .normalizeModeKeepFirstCase=true
          if (_anyToBool(PROP(normalizeModeKeepFirstCase_,options))) {PROP(normalizeModeKeepFirstCase_,this) = true;};

//if it 'points' to another namedecl, it uses other nameDecl's '.members={}'
//effectively working as a pointer

          //if options.pointsTo 
          if (_anyToBool(PROP(pointsTo_,options)))  {
              //.members = options.pointsTo.members
              PROP(members_,this) = PROP(members_,PROP(pointsTo_,options));
          }
          //else 
          
          else {
            //if options.type, .setMember('**proto**',options.type)
            if (_anyToBool(PROP(type_,options))) {METHOD(setMember_,this)(this,2,(any_arr){any_LTR("**proto**")
            , PROP(type_,options)
            });};
            //if options.itemType, .setMember('**item type**',options.itemType)
            if (_anyToBool(PROP(itemType_,options))) {METHOD(setMember_,this)(this,2,(any_arr){any_LTR("**item type**")
            , PROP(itemType_,options)
            });};
            //if options.returnType, .setMember('**return type**',options.returnType)
            if (_anyToBool(PROP(returnType_,options))) {METHOD(setMember_,this)(this,2,(any_arr){any_LTR("**return type**")
            , PROP(returnType_,options)
            });};
            //if options.value, .setMember('**value**',options.value)
            if (_anyToBool(PROP(value_,options))) {METHOD(setMember_,this)(this,2,(any_arr){any_LTR("**value**")
          , PROP(value_,options)
          });};
          };

          //if options.isForward, .isForward = true
          if (_anyToBool(PROP(isForward_,options))) {PROP(isForward_,this) = true;};
          //if options.isDummy, .isDummy = true
          if (_anyToBool(PROP(isDummy_,options))) {PROP(isDummy_,this) = true;};
      };

//keep a list of all NameDeclarations

      //allNameDeclarations.push this
      METHOD(push_,Names_allNameDeclarations)(Names_allNameDeclarations,1,(any_arr){this
      });
     }

//#### Helper method normalize(name)
     any Names_Declaration_normalize(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
        //if .normalizeModeKeepFirstCase 
        if (_anyToBool(PROP(normalizeModeKeepFirstCase_,this)))  {
            //return normalizeKeepFirst(name)
            return Names_normalizeKeepFirst(undefined,1,(any_arr){name
            });
        }
        //else
        
        else {
            //return normalizeToLower(name)
            return Names_normalizeToLower(undefined,1,(any_arr){name
            });
        };
     return undefined;
     }


//#### Helper method setMember(name,value)
     any Names_Declaration_setMember(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var name, value;
        name=value=undefined;
        switch(argc){
          case 2:value=arguments[1];
          case 1:name=arguments[0];
        }
        //---------
//force set a member

        //if name is '**proto**'
        if (__is(name,any_LTR("**proto**")))  {
            //# walk all the **proto** chain to avoid circular references
            //var nameDecl = value
            var nameDecl = value
            ;
            //do 
            do{
                //if nameDecl isnt instance of Declaration, break #a nameDecl with a string yet to be de-reference
                if (!(_instanceof(nameDecl,Names_Declaration))) {break;};
                //if nameDecl is this, return #circular ref, abort setting 
                if (__is(nameDecl,this)) {return undefined;};
            } while (_anyToBool((nameDecl=__call(get_,PROP(members_,nameDecl),1,(any_arr){name
            }))));// end loop
            
        };
            //loop while nameDecl.members.get(name) into nameDecl #next in chain

        //end if #avoid circular references
        

        //#set member
        //.members.set .normalize(name), value
        __call(set_,PROP(members_,this),2,(any_arr){METHOD(normalize_,this)(this,1,(any_arr){name
        })
        , value
        });
     return undefined;
     }

//#### Helper method findOwnMember(name) returns Declaration
     any Names_Declaration_findOwnMember(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
//this method looks for 'name' in Declaration members

        //return .members.get(.normalize(name))
        return __call(get_,PROP(members_,this),1,(any_arr){METHOD(normalize_,this)(this,1,(any_arr){name
        })
        });
     return undefined;
     }

//#### Helper method ownMember(name) returns Declaration
     any Names_Declaration_ownMember(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
//this method looks for a specific member, throws if not found

        //if no .findOwnMember(name) into var result
        var result=undefined;
        if (!(_anyToBool((result=METHOD(findOwnMember_,this)(this,1,(any_arr){name
        })))))  {
          //.sayErr "No member named '#{name}' on #{.info()}"
          METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(4,any_LTR("No member named '")
          , name
          , any_LTR("' on ")
          , (METHOD(info_,this)(this,0,NULL))
          )
          });
        };

        //return result
        return result;
     return undefined;
     }

//#### Helper method getMemberCount 
     any Names_Declaration_getMemberCount(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        //return .members.size
        return PROP(size_,PROP(members_,this));
     return undefined;
     }

//#### Helper method replaceForward ( realNameDecl: Declaration )
     any Names_Declaration_replaceForward(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var realNameDecl= argc? arguments[0] : undefined;
        //---------
//This method is called on a 'forward' Declaration
//when the real declaration is found.
//We mix in all members from realNameDecl to this declaration 
//and maybe remove the forward flag.

        //declare on realNameDecl
          //members
        

//mix in found namedecl here

        //for each key,member in map realNameDecl.members
        any _list33=PROP(members_,realNameDecl);
        {NameValuePair_ptr __nvp=NULL; //name:value pair
        int64_t __len=MAPSIZE(_list33); //how many pairs
        var key=undefined; //key
        var member=undefined; //value
        for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
          __nvp = MAPITEM( __inx,_list33);
          key= __nvp->name;
          member= __nvp->value;
        
          //declare member:Declaration
          
          //member.parent = this
          PROP(parent_,member) = this;
          //.members.set key,member
          __call(set_,PROP(members_,this),2,(any_arr){key
          , member
          });
        }};// end for each in map

        //.isForward = realNameDecl.isForward
        PROP(isForward_,this) = PROP(isForward_,realNameDecl);

        //if realNameDecl.nodeDeclared
        if (_anyToBool(PROP(nodeDeclared_,realNameDecl)))  {
          //.nodeDeclared = realNameDecl.nodeDeclared
          PROP(nodeDeclared_,this) = PROP(nodeDeclared_,realNameDecl);
        };

        //return true
        return true;
     return undefined;
     }

//#### helper method makePointTo(nameDecl:Declaration)
     any Names_Declaration_makePointTo(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var nameDecl= argc? arguments[0] : undefined;
        //---------

        //if nameDecl isnt instance of Declaration, fail with "makePointTo: not a Declaration"
        if (!(_instanceof(nameDecl,Names_Declaration))) {throw(new(Error,1,(any_arr){any_LTR("makePointTo: not a Declaration")}));;};

        //# remove existing members from nameDeclarations[]
        //.isForward = false
        PROP(isForward_,this) = false;
        //for each memberDecl in map .members
        any _list34=PROP(members_,this);
        {NameValuePair_ptr __nvp=NULL; //name:value pair
        int64_t __len=MAPSIZE(_list34); //how many pairs
        var memberDecl=undefined; //value
        for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
          __nvp = MAPITEM( __inx,_list34);
          memberDecl= __nvp->value;
        
          //allNameDeclarations.remove memberDecl
          METHOD(remove_,Names_allNameDeclarations)(Names_allNameDeclarations,1,(any_arr){memberDecl
          });
        }};// end for each in map

        //#save a copy of this.members pointer
        //var thisMembers = this.members
        var thisMembers = PROP(members_,this)
        ;

        //#"point to" means share "members" object 
        //this.members = nameDecl.members
        PROP(members_,this) = PROP(members_,nameDecl);
        //since we get the members, we must also respect the same normalization mode
        //this.normalizeModeKeepFirstCase = nameDecl.normalizeModeKeepFirstCase
        PROP(normalizeModeKeepFirstCase_,this) = PROP(normalizeModeKeepFirstCase_,nameDecl);
        //this.nodeClass = nameDecl.nodeClass //and other data
        PROP(nodeClass_,this) = PROP(nodeClass_,nameDecl); //and other data
        //this.isPublicVar = nameDecl.isPublicVar
        PROP(isPublicVar_,this) = PROP(isPublicVar_,nameDecl);

        //#other nameDecl pointing here are redirected
        //for each other in allNameDeclarations
        any _list35=Names_allNameDeclarations;
        { var other=undefined;
        for(int other__inx=0 ; other__inx<_list35.value.arr->length ; other__inx++){other=ITEM(other__inx,_list35);
        
            //if other.members is thisMembers
            if (__is(PROP(members_,other),thisMembers))  {
                //other.members = nameDecl.members
                PROP(members_,other) = PROP(members_,nameDecl);
            };
        }};// end for each in
        
     return undefined;
     }

//#### helper method positionText 
     any Names_Declaration_positionText(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------

        //if .nodeDeclared
        if (_anyToBool(PROP(nodeDeclared_,this)))  {
            //return .nodeDeclared.positionText()
            return __call(positionText_,PROP(nodeDeclared_,this),0,NULL);
        }
        //else
        
        else {
          //return "(compiler-defined)"
          return any_LTR("(compiler-defined)");
        };
     return undefined;
     }


//#### helper method originalDeclarationPosition 
     any Names_Declaration_originalDeclarationPosition(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        //return "#{.positionText()} for reference: original declaration of '#{.name}'"
        return _concatAny(4,(METHOD(positionText_,this)(this,0,NULL))
        , any_LTR(" for reference: original declaration of '")
        , PROP(name_,this)
        , any_LTR("'")
        );
     return undefined;
     }


//#### helper method sayErr(msg) 
     any Names_Declaration_sayErr(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
        //logger.error "#{.positionText()} #{.info()} #{msg}"
        logger_error(undefined,1,(any_arr){_concatAny(5,(METHOD(positionText_,this)(this,0,NULL))
        , any_LTR(" ")
        , (METHOD(info_,this)(this,0,NULL))
        , any_LTR(" ")
        , msg
        )
        });
     return undefined;
     }

//#### helper method warn(msg) 
     any Names_Declaration_warn(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
        //logger.warning "#{.positionText()} #{.info()} #{msg}"
        logger_warning(undefined,1,(any_arr){_concatAny(5,(METHOD(positionText_,this)(this,0,NULL))
        , any_LTR(" ")
        , (METHOD(info_,this)(this,0,NULL))
        , any_LTR(" ")
        , msg
        )
        });
     return undefined;
     }

//#### helper method caseMismatch(text, actualNode:ASTBase) 
     any Names_Declaration_caseMismatch(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var text, actualNode;
        text=actualNode=undefined;
        switch(argc){
          case 2:actualNode=arguments[1];
          case 1:text=arguments[0];
        }
        //---------
//If this item has a different case than the name we're adding, emit error

        //if .name isnt text # if there is a case mismatch
        if (!__is(PROP(name_,this),text))  {// # if there is a case mismatch

            //logger.error "#{actualNode? actualNode.positionText():.positionText()} CASE MISMATCH: '#{text}'/'#{.name}'"
            logger_error(undefined,1,(any_arr){_concatAny(6,(_anyToBool(actualNode) ? METHOD(positionText_,actualNode)(actualNode,0,NULL) : METHOD(positionText_,this)(this,0,NULL))
            , any_LTR(" CASE MISMATCH: '")
            , text
            , any_LTR("'/'")
            , PROP(name_,this)
            , any_LTR("'")
            )
            });
            //logger.error .originalDeclarationPosition() #add original declaration line info
            logger_error(undefined,1,(any_arr){METHOD(originalDeclarationPosition_,this)(this,0,NULL)
            });// #add original declaration line info
            //return true
            return true;
        };
     return undefined;
     }

//#### helper method addMember(nameDecl:Declaration, options:NameDeclOptions, nodeDeclared) returns Declaration
     any Names_Declaration_addMember(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var nameDecl, options, nodeDeclared;
        nameDecl=options=nodeDeclared=undefined;
        switch(argc){
          case 3:nodeDeclared=arguments[2];
          case 2:options=arguments[1];
          case 1:nameDecl=arguments[0];
        }
        //---------
//Adds passed Declaration to .members
//Reports duplicated.
//returns: Identifier

//convert to Declaration

        //if nameDecl isnt instance of Declaration
        if (!(_instanceof(nameDecl,Names_Declaration)))  {
            //nameDecl = new Declaration(nameDecl, options, nodeDeclared or .nodeDeclared)
            nameDecl = new(Names_Declaration,3,(any_arr){nameDecl
            , options
            , (_anyToBool(__or1=nodeDeclared)? __or1 : PROP(nodeDeclared_,this))
            });
        };

        //logger.debug "addMember: '#{nameDecl.name}' to '#{.name}'" #[#{.constructor.name}] name:
        logger_debug(undefined,1,(any_arr){_concatAny(5,any_LTR("addMember: '")
        , PROP(name_,nameDecl)
        , any_LTR("' to '")
        , PROP(name_,this)
        , any_LTR("'")
        )
        });// #[#{.constructor.name}] name:

        //if no .members
        if (!_anyToBool(PROP(members_,this)))  {
          //fail with "no .members in [#{.constructor.name}]"
          throw(new(Error,1,(any_arr){_concatAny(3,any_LTR("no .members in [")
          , PROP(name_,any_class(this.class))
          , any_LTR("]")
          )}));;
        };

        //var normalized = .normalize(nameDecl.name) 
        var normalized = METHOD(normalize_,this)(this,1,(any_arr){PROP(name_,nameDecl)
        })
        ;

        //if not .members.get(normalized) into var found:Declaration
        var found=undefined;
        if (!(_anyToBool((found=__call(get_,PROP(members_,this),1,(any_arr){normalized
        })))))  {
            //.members.set normalized, nameDecl
            __call(set_,PROP(members_,this),2,(any_arr){normalized
            , nameDecl
            });
            //nameDecl.parent = this
            PROP(parent_,nameDecl) = this;
            //return nameDecl
            return nameDecl;
        };

//else, found.

//If the found item has a different case than the name we're adding, emit error & return

        //if found.caseMismatch(nameDecl.name, nodeDeclared or nameDecl.nodeDeclared)
        if (_anyToBool(METHOD(caseMismatch_,found)(found,2,(any_arr){PROP(name_,nameDecl)
        , (_anyToBool(__or2=nodeDeclared)? __or2 : PROP(nodeDeclared_,nameDecl))
        })))  {
            //return nameDecl
            return nameDecl;

//if replaceSameName option set, replace found item with new item

            //.members.set normalized, nameDecl
            __call(set_,PROP(members_,this),2,(any_arr){normalized
            , nameDecl
            });
        }

//else, if the previously defined found item was a "forward" declaration, we add the nameDecl 
//"childs" to pre-existent found declaration and remove the forward flag

        //else if found.isForward
        
        else if (_anyToBool(PROP(isForward_,found)))  {
            //found.replaceForward nameDecl
            METHOD(replaceForward_,found)(found,1,(any_arr){nameDecl
            });
            //return found
            return found;
        }

//else, if it wasnt a forward declaration, then is a duplicated error

        //else 
        
        else {
            //logger.error "#{nameDecl.positionText()}. DUPLICATED name: '#{nameDecl.name}'"
            logger_error(undefined,1,(any_arr){_concatAny(4,(METHOD(positionText_,nameDecl)(nameDecl,0,NULL))
            , any_LTR(". DUPLICATED name: '")
            , PROP(name_,nameDecl)
            , any_LTR("'")
            )
            });
            //logger.error "adding member '#{nameDecl.name}' to '#{.name}'"
            logger_error(undefined,1,(any_arr){_concatAny(5,any_LTR("adding member '")
            , PROP(name_,nameDecl)
            , any_LTR("' to '")
            , PROP(name_,this)
            , any_LTR("'")
            )
            });
            //logger.error found.originalDeclarationPosition() #add extra information line
            logger_error(undefined,1,(any_arr){METHOD(originalDeclarationPosition_,found)(found,0,NULL)
            });// #add extra information line
        };

        //return nameDecl
        return nameDecl;
     return undefined;
     }


//#### helper method toString() 
     any Names_Declaration_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        //#note: parent may point to a different node than the original declaration, if makePointTo() was used
        //return .name
        return PROP(name_,this);
     return undefined;
     }

//#### helper method composedName() 
     any Names_Declaration_composedName(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        //var name = .name
        var name = PROP(name_,this)
        ;
        //if .parent and .parent.name isnt 'prototype' and not .parent.name.endsWith('Scope]')
        if (_anyToBool(PROP(parent_,this)) && !__is(PROP(name_,PROP(parent_,this)),any_LTR("prototype")) && !(_anyToBool(__call(endsWith_,PROP(name_,PROP(parent_,this)),1,(any_arr){any_LTR("Scope]")
        }))))  {
          //name = "#{.parent.name}.#{name}"
          name = _concatAny(3,PROP(name_,PROP(parent_,this))
          , any_LTR(".")
          , name
          );
        };
        //return name
        return name;
     return undefined;
     }

//#### helper method info() 
     any Names_Declaration_info(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------

        //var type = ""
        var type = any_EMPTY_STR
        ;

        //if .nodeClass is Grammar.ClassDeclaration
        if (__is(PROP(nodeClass_,this),Grammar_ClassDeclaration))  {
            //type = 'Class'
            type = any_LTR("Class");
        }

        //else
        
        else {
            //var nameDecltype = .findOwnMember('**proto**')
            var nameDecltype = METHOD(findOwnMember_,this)(this,1,(any_arr){any_LTR("**proto**")
            })
            ;
            //if nameDecltype instanceof Declaration
            if (_instanceof(nameDecltype,Names_Declaration))  {
                //type = nameDecltype.name
                type = PROP(name_,nameDecltype);
                //if nameDecltype.parent and nameDecltype.parent.name isnt "Project Root Scope" 
                if (_anyToBool(PROP(parent_,nameDecltype)) && !__is(PROP(name_,PROP(parent_,nameDecltype)),any_LTR("Project Root Scope")))  {
                    //if type is 'prototype'
                    if (__is(type,any_LTR("prototype")))  {
                        //type = nameDecltype.parent.name
                        type = PROP(name_,PROP(parent_,nameDecltype));
                    }
                    //else
                    
                    else {
                        //type = "#{nameDecltype.parent.name}.#{type}"
                        type = _concatAny(3,PROP(name_,PROP(parent_,nameDecltype))
                        , any_LTR(".")
                        , type
                        );
                    };
                    //end if 
                    
                };

                //if no type and .nodeClass is Grammar.ImportStatement, type="import"
                if (!_anyToBool(type) && __is(PROP(nodeClass_,this),Grammar_ImportStatement)) {type = any_LTR("import");};
            }

            //else
            
            else {
                //if .nodeDeclared and .nodeDeclared.type, type=.nodeDeclared.type
                if (_anyToBool(PROP(nodeDeclared_,this)) && _anyToBool(PROP(type_,PROP(nodeDeclared_,this)))) {type = PROP(type_,PROP(nodeDeclared_,this));};
            };
        };
        //end if
        

        //if type, type=":#{type}" //prepend :
        if (_anyToBool(type)) {type = _concatAny(2,any_LTR(":")
        , type
        );};

        //return "'#{.composedName()}#{type}'"
        return _concatAny(4,any_LTR("'")
        , (METHOD(composedName_,this)(this,0,NULL))
        , type
        , any_LTR("'")
        );
     return undefined;
     }
    

//--------------
    // Names_NameDeclOptions
    any Names_NameDeclOptions; //Class Names_NameDeclOptions
    //auto Names_NameDeclOptions__init
    void Names_NameDeclOptions__init(any this, len_t argc, any* arguments){
    };
    
    //auto Names_NameDeclOptions_newFromObject
    inline any Names_NameDeclOptions_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(Names_NameDeclOptions,argc,arguments);
    }


//#Module helper functions 
//exported as members of export default class Declaration

//### helper function fixSpecialNames(text:string)

      //if text in ['__proto__','NaN','Infinity','undefined','null','false','true','constructor'] # not good names
        //return '|#{text}|'
      //else
        //return text

//### helper function normalizeToLower(text:string) returns string
//we do not allow two names differing only in upper/lower case letters

      //if text.charAt(0) is "'" or text.charAt(0) is '"' #Except for quoted names
          //return text

      //return fixSpecialNames(text.toLowerCase())

//### helper function normalizeKeepFirst(text:string) returns String
//Normalization for vars means: 1st char untouched, rest to to lower case.

//By keeping 1st char untouched, we allow "token" and "Token" to co-exists in the same scope.
//'token', by name affinity, will default to type:'Token'

      //return fixSpecialNames( "#{text.slice(0,1)}#{text.slice(1).toLowerCase()}" )

//### helper function isCapitalized(text:string) returns boolean 

      //if text and text.charAt(0) is text.charAt(0).toUpperCase()  and 
          //( text.length is 1 or text.charAt(1) is text.charAt(1).toLowerCase()) 
              //return true

      //return false


//### export class NameDeclOptions
        //properties

            //normalizeModeKeepFirstCase: boolean

            //pointsTo : Declaration
            //type, itemType, returnType 
            //value, isForward, isDummy

            //informError: boolean
        ;
    
    
    any Names_fixSpecialNames(DEFAULT_ARGUMENTS){
      // define named params
      var text= argc? arguments[0] : undefined;
      //---------
      if (__in(text,8,(any_arr){any_LTR("__proto__"), any_LTR("NaN"), any_LTR("Infinity"), any_LTR("undefined"), any_LTR("null"), any_LTR("false"), any_LTR("true"), any_LTR("constructor")}))  {// # not good names
        return _concatAny(3,any_LTR("|")
        , text
        , any_LTR("|")
        );
      }
      //else
      
      else {
        return text;
      };
    return undefined;
    }
    any Names_normalizeToLower(DEFAULT_ARGUMENTS){
      // define named params
      var text= argc? arguments[0] : undefined;
      //---------
      if (_anyToBool((_anyToBool(__or3=any_number(__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(0)
      }),any_LTR("'"))))? __or3 : any_number(__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(0)
      }),any_LTR("\""))))))  {// #Except for quoted names
          return text;
      };
      return Names_fixSpecialNames(undefined,1,(any_arr){METHOD(toLowerCase_,text)(text,0,NULL)
      });
    return undefined;
    }
    any Names_normalizeKeepFirst(DEFAULT_ARGUMENTS){
      // define named params
      var text= argc? arguments[0] : undefined;
      //---------
      return Names_fixSpecialNames(undefined,1,(any_arr){_concatAny(2,(METHOD(slice_,text)(text,2,(any_arr){any_number(0)
      , any_number(1)
      }))
      , (__call(toLowerCase_,METHOD(slice_,text)(text,1,(any_arr){any_number(1)
      }),0,NULL))
      )
      });
    return undefined;
    }
    any Names_isCapitalized(DEFAULT_ARGUMENTS){
      // define named params
      var text= argc? arguments[0] : undefined;
      //---------
      if (_anyToBool(text) && __is(METHOD(charAt_,text)(text,1,(any_arr){any_number(0)
      }),__call(toUpperCase_,METHOD(charAt_,text)(text,1,(any_arr){any_number(0)
      }),0,NULL)) && (_anyToBool((_anyToBool(__or4=any_number(__is(any_number(_length(text)),any_number(1))))? __or4 : any_number(__is(METHOD(charAt_,text)(text,1,(any_arr){any_number(1)
          }),__call(toLowerCase_,METHOD(charAt_,text)(text,1,(any_arr){any_number(1)
          }),0,NULL)))))))  {
              return true;
      };
      return false;
    return undefined;
    }
//------------------
void Names__namespaceInit(void){
        Names_Declaration =_newClass("Names_Declaration", Names_Declaration__init, sizeof(struct Names_Declaration_s), Object);
        _declareMethods(Names_Declaration, Names_Declaration_METHODS);
        _declareProps(Names_Declaration, Names_Declaration_PROPS, sizeof Names_Declaration_PROPS);
    
        Names_NameDeclOptions =_newClass("Names_NameDeclOptions", Names_NameDeclOptions__init, sizeof(struct Names_NameDeclOptions_s), Object);
        _declareMethods(Names_NameDeclOptions, Names_NameDeclOptions_METHODS);
        _declareProps(Names_NameDeclOptions, Names_NameDeclOptions_PROPS, sizeof Names_NameDeclOptions_PROPS);
    
    Names_allNameDeclarations = new(Array,0,NULL);
};


//-------------------------
void Names__moduleInit(void){
    Names__namespaceInit();
};
