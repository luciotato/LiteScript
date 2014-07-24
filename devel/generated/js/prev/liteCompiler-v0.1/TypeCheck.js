var util, ASTBase, Grammar;
var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
/* Name Check 
   ========== 
   This module contains helper functions to manage variable and object property declaration, 
   in order to catch mistyped variable names and property names at compile time 
   (instead of having to debug a subtle bug at run time) 
   Any NameDeclaration node ca have a `.members={}` property 
   `.members={}` is a map to other `NameDeclaration`s which are valid members of this name. 
   Also, sume AST nodes can var a `.scope` 
   a 'scope' is a NameDeclaration whoose members are the declared vars in this scope. 
   Project's Main Module has the 'GLOBAL' scope 
   Only certain AST nodes have 'scopes', such as: 
   * Module, MethosDeclaration, FunctionDeclaration, ForStatement, DoLoopStatement 
   WhileUntilLoop, Catch/Exception 
   Variables in the scope 
   ---------------------- 
   Referenced vars must be found in the scope . You are required to explicitly declare your variables 
   so you're **unable** to create a global variable by mistake mistipying a name in an assignment. 
   The compiler will catch that as "undeclared variable". 
   Object properties access 
   ------------------------ 
   Object properties access are another source of subtle bugs in any medium to large javascript project. 
   The common problem is that, a mistyped property name results in the property not being found 
   in the object nor the prototype chain, and javascript in this case just returns "undefined" 
   and goes on. This causes hard to find subtle bugs. 
   Example: The following javascript code, **will probably need debugging.** 
   options = options || {}; 
   if (options.importantCodeDefaultTrue===undefined) options.importantCodeDefaultTrue=true; 
   if (options.anotherOptionDefaultZero===undefined) options.anotherOptionDefaultZero=0; 
   initFunction(options); 
   prepareDom(options); 
   if (options.importantCodesDefaultTrue) { moreInit(); subtleDomChanges(); } 
   The same LiteScript code, but the mistake **will be caught by the compiler** 
   The compiler will emit an error during compilation, -no debugging required-. 
   options = options or {} 
   if options.importantCodeDefaultTrue is undefined, options.importantCodeDefaultTrue=true 
   if options.anotherOptionDefaultZero is undefined, options.anotherOptionDefaultZero=0; 
   initFunction options 
   prepareDom options 
   if options.importantCodesDefaultTrue then moreInit(); subtleDomChanges() 
   In order to completely check property names, a full type system is neeeded. 
   LiteScript, based in js, *is not typed*, but you can add "type annotations" 
   to your variable declaration, in order to declare the list of valid members 
   to check at compile time. 
   If you don't want to include var types, You can also explicitily use a 
   `declare on myObj prop1,prop2` statement to dismiss the 'prop1 IS NOT A PROPERTY OF myObj' 
   compiler errors 
   Example: 
   ** 
    
   class ClassA 
    
   properties 
   classAProp1, classAProp2 
    
   method methodA 
   this.classAProp1 = 11 
   this.classAProp2 = 12 
    
   class ClassB 
    
   properties 
   classBProp1, classBProp2 
    
   method methodB 
   this.classBProp1 = 21 
    
   var instanceB = new ClassB // implicit type 
    
   instanceB.classBprop1 = 5 // <-- this **will be caught** as "case mismatch" since classBprop1 is defined as classBProp1 
    
   var bObj = instanceB // simple assignment, implicit type 
    
   bObj.classAProp1 = 5 // <-- this **will be caught** 
    
   var xObj = callToFn() // unknown type 
    
   xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj" 
    
   declare on xObj  // <-- this fixes it 
   classBProp1 
    
   xObj.classBProp1 = 5 // <-- this is OK now 
    
   var xObj:ClassB = callToFn() // type annotation, this also fixes it 
    
   bObj.classBProp1 = 5 // <-- this is ok 
    
   ** 
   ##The Function-Class members 
   A ClassDeclaration.name.members starts populated by: 
   `prototype`, `prototype.constructor`, `super` 
   In the class methods, the scope starts populated by the special var: `this` 
   `this` type is `ClassDeclaration.members.prototype` 
   --------------------------- 
   Dependencies: */
util = require("./util");
ASTBase = require("./ASTBase");
Grammar = require('./Grammar');

/* /! 
    
   declare Environment 
   declare on Environment 
   isBuiltIn,isBuiltInProperty 
    
   declare debug,log 
   declare on log 
   error,warning,message 
    
   !/ 
   -------------------------------- 
   **getRootNode** method moves up in the AST up to the node holding the global scope ("root"). 
   "root" node has parent = Project */
ASTBase.prototype.getRootNode = function () {
  var node;
  node = this;
  while (node.parent instanceof ASTBase) {
    node = node.parent; /* move up */
  }
  return node;
}

/* -------------------------------- 
   **globalVar** gets a var from global scope */
ASTBase.prototype.globalVar = function (name) {
  var nameDecl;
  nameDecl = this.getRootNode().findInScope(name);
  if (!(nameDecl)) {
    throw new Error(("no '" + name + "' in global scope"));
  }
  return nameDecl;
}

/* ------------------------------------------------------------------------ 
   **createGlobalVar** helper method to use declare a global var. 
   *return*: Always return a NameDeclaration, found or dummy-created. */
ASTBase.prototype.createGlobalVar = function (name, options) {
  var root, nameDecl;
  /* /! 
      
     declare root:ASTBase 
     !/ */
  root = this.getRootNode();
  nameDecl = root.findInScope(name);
  if (!(nameDecl)) {
    nameDecl = this.declareName(name, options);
    root.addToScope(nameDecl);
  }
  return nameDecl;
}

/* ----------------------- 
   *Helper method *createScope()* 
   initializes an empty scope in this node */
ASTBase.prototype.createScope = function () {
  /* /! 
      
     declare valid me.scope 
     !/ */
  if (!(this.scope)) {
    this.scope = this.declareName(("" + (this.name || this.constructor.name) + " Scope"));
    this.scope.isScope = true;
  }
  return this.scope;
}

/* ###a helper method createFunctionScope() */
ASTBase.prototype.createFunctionScope = function (typeForThis) {
  /* Functions (methods and constructors also), have a 'scope'. 
     It captures al vars declared in its body. 
     We now create function's scope and add the special var 'this'. 
     The 'type' of 'this' is normally a class prototype, 
     which contains other methods and properties from the class. 
     We also add 'arguments.length' */
  this.createScope();
  this.scope.addMember('arguments').addMember('length');
  this.scope.addMember('this', {type: typeForThis});
}

/* Note: since ALL functions have 'this' in scope, when you create 
   a class inside a function, or a function inside a function, you'll have TWO different 
   'this' "in scope". One in the inner scope, shadowing other in the outer scope. 
   This is technically a scope 'name duplication', but it's allowed fot 'this' & 'arguments' 
   ----------------------- 
   a Helper method *caseMismatch(found, text)* 
   If the found item has a different case than the name we're adding */
Grammar.ASTBase.prototype.caseMismatch = function (found, text) {
  if (found.name !== text) { /* if there is a case mismatch */
    if (this.lexer) {
      this.lexer.sayErr(("CASE MISMATCH: '" + text + "'/'" + (found.name) + "'"));
    } else {
      log.error(("(built-in declaration) CASE MISMATCH: '" + text + "'/'" + (found.name) + "'"));
    }
    log.error(found.originalDeclarationText()); /* add original declaration line info */
    return true;
  }
}

/* ----------------------- 
   a Helper method *handleForward(nameDecl)* 
   if the previously defined found item was a forward declaration, we add the forward 
   "childs" to this declaration and replace the forward declaration with this declaration */
Grammar.NameDeclaration.prototype.handleForward = function (nameDecl) {
  /* /! 
      
     declare on nameDecl 
     members,type,itemType 
     !/ */
  if (this.isForward) {
    /* add fwd members, type & itemType 
       for member in Object.keys(me.members) 
       nameDecl.addMember(member,{ignoreDuplicates:true}) */
    if (Object.keys(nameDecl.members).length === 0) {
      nameDecl.members = this.members;
    }
    if (this.type) {
      nameDecl.type = this.type;
    }
    if (this.itemType) {
      nameDecl.itemType = this.itemType;
    }
    return true;
  }
}

/* ----------------------- 
   a Helper method *normalize(text, options)* */
function normalize(text, options) {
  var result;
  /* /! 
      
     declare on options 
     inScope 
     !/ */
  result;
  if (options && options.inScope) {
    /* for vars, we allow "token" and "Token" to be in the same scope */
    result = text.slice(0, 1) + text.slice(1).toLowerCase();
  } else {
    /* for properties, we do not */
    result = text.toLowerCase();
  }
  if ((k$indexof.call(['__proto__', 'undefined', 'null', 'false', 'true'], result) >= 0)) { /* not good names */
    result = '|' + result + '|';
  }
  return result;
}

/* ----------------------- 
   a Helper method *addMember* 
   Adds passed NameDeclaration to .members[] or scope.members[] 
   Reports duplicated. 
   return: NameDeclaration */
ASTBase.prototype.addMember = function (nameDecl, options) {
  var dest, normalized, found;
  /* /! 
      
     declare on nameDecl 
     name,positionText 
      
     declare valid me.members 
     declare valid options.ignoreDuplicates 
      
     declare dest:Grammar.NameDeclaration 
     declare found:Grammar.NameDeclaration 
      
     !/ */
  if (!(options)) {
    options = {};
  }
  if (typeof nameDecl === 'string') {
    nameDecl = this.declareName(nameDecl, options);
  } else if (nameDecl instanceof Grammar.VariableDecl) {
    nameDecl = nameDecl.name;
  }
  if (!(nameDecl.name)) {
    debugger;
  }
  debug(("addMember: '" + (nameDecl.name) + "' to '" + (this.name) + "'")); /* [#{me.constructor.name}] name: */
  dest = this;
  if (!(this.members)) {
    throw new Error(("no .members in [" + (this.constructor.name) + "]"));
  }
  normalized = normalize(nameDecl.name, options);
  if (dest.members.hasOwnProperty(normalized)) {
    found = dest.members[normalized];
  }
  if (!(found)) {
    /* add it!. When a prop is added as a member, the parent changes. 
       so nameDeclt.toString() return the correct composition */
    dest.members[normalized] = nameDecl;
    if (!(options.keepParent)) {
      nameDecl.parent = dest;
    }
    return nameDecl;
  }
  /* else, found. 
     If the found item has a different case than the name we're adding, emit error & return */
  if (this.caseMismatch(found, nameDecl.name)) {
    return nameDecl;
  }
  /* if the previously defined found item was a forward declaration, we add the forward 
     "childs" to this declaration and replace the forward declaration with this declaration */
  if (found.handleForward(nameDecl)) {
    /* replace */
    dest.members[normalized] = nameDecl;
    /* When a prop is added as a member, the parent changes. 
       so nameDeclt.toString() return the correct composition */
    if (!(options.keepParent)) {
      nameDecl.parent = dest;
    }
  } else if (!(options.ignoreDuplicates)) {
    /* else, if it wasnt a forward declaration, then is a duplicated error */
    log.error(("" + (nameDecl.positionText()) + ". DUPLICATED property name: '" + (nameDecl.name) + "'"));
    log.error(found.originalDeclarationText()); /* add extra information line */
  }
  return nameDecl;
}

/* ----------------------- 
   a Helper method *addMembers(arr, options)* 
   Adds each element in passed list of VarDecl to this node.scope 
   Throws if duplicated. */
ASTBase.prototype.addMembers = function (list, options) {
  var item, ki$1, kobj$1;
  kobj$1 = list;
  for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
    item = kobj$1[ki$1];
    this.addMember(item, options);
  }
}

/* ------------------------------------------------------------------------ 
   **getScopeNode** method return the next 'scoped' node in the hierarchy. 
   It looks up until found a instance with .scope 
   -Note: automatically redirects scope for instances of AppendToDeclaration */
ASTBase.prototype.getScopeNode = function () {
  var node;
  /* Start at this node */
  node = this;
  /* /! 
      
     declare on node 
     scope 
     !/ */
  while (node) {
    if (node.scope) {
      return node; /* found a node with scope */
    }
    node = node.parent; /* move up */
  }
  /* loop */
  return null;
}

/* ----------------------- 
   a Helper method *addToScope* 
   Adds passed NameDeclaration to scope.members[] 
   Reports duplicated. 
   return: NameDeclaration */
ASTBase.prototype.addToScope = function (nameDecl, options) {
  var normalized, scope, found;
  /* if not me.lexer 
     fail with 'addToScope, me.lexer is empty' 
     /! 
      
     declare scope:Grammar.NameDeclaration 
     declare found:Grammar.NameDeclaration 
      
     declare on options 
     ignoreDuplicates 
     declare on nameDecl 
     name,positionText 
     !/ */
  if (typeof nameDecl === 'string') {
    nameDecl = this.declareName(nameDecl, options);
  } else if (nameDecl instanceof Grammar.VariableDecl) {
    nameDecl = nameDecl.name;
  }
  normalized = normalize(nameDecl.name, {inScope: true});
  scope = this.getScopeNode().scope;
  nameDecl.parent = scope; /* oarent is now scope where it is added */
  debug(("addToScope: '" + (nameDecl.name) + "' to '" + (scope.name) + "'")); /* [#{me.constructor.name}] name: */
  if (!(options)) {
    options = {};
  }
  found = this.findInScope(nameDecl.name);
  if (!(found)) {
    /* add it to the scope */
    scope.members[normalized] = nameDecl;
    return nameDecl;
  }
  /* else, found in the scope. 
     If the found item has a different case than the name we're adding, emit error & return */
  if (this.caseMismatch(found, nameDecl.name)) {
    return nameDecl;
  }
  /* if the previously defined found item was a forward declaration, we add the forward 
     "childs" to this declaration and replace the forward declaration with this declaration */
  if (found.handleForward(nameDecl)) {
    /* replace */
    scope.members[normalized] = nameDecl;
  } else if (!(options.ignoreDuplicates)) {
    /* else, if it wasnt a forward declaration, then is a duplicated error */
    log.error(("" + (nameDecl.positionText()) + ". DUPLICATED name in scope: '" + (nameDecl.name) + "'"));
    log.error(found.originalDeclarationText()); /* add extra information line */
  }
  return nameDecl;
}

/* ----------------------- 
   a Helper method *addVarsToScope(arr,options)* 
   Adds each element in passed list of VarDecl to this node.scope 
   Throws if duplicated. */
ASTBase.prototype.addVarsToScope = function (list, options) {
  var item, ki$2, kobj$2;
  kobj$2 = list;
  for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
    item = kobj$2[ki$2];
    this.addToScope(item, options);
  }
}

/* ----------------------- 
   a Helper method: *NameDeclaration.ownMember(nameDecl)*, this method looks fo 
   the NameDeclaration between its members */
Grammar.NameDeclaration.prototype.ownMember = function (nameDecl) {
  var normalized;
  /* /! 
      
     declare mainClassPrototype:Grammar.NameDeclaration 
     !/ */
  if (!(this.members)) {
    debugger;
    this.throwError(("No me.members on " + (this.constructor.name) + ", adding " + nameDecl + "."));
  }
  if (typeof nameDecl === 'string') {
    nameDecl = this.declareName(nameDecl);
  }
  normalized = normalize(nameDecl.name);
  if (this.members.hasOwnProperty(normalized)) {
    return this.members[normalized];
  }
}

/* ----------------------- 
   a Helper method: *ASTBase.findInScope(name)*, this method looks for the original place 
   where a name was defined (function,method,var) 
   Returns the NameDeclaration node from the original scope 
   It's used to validate variable references to be previously declared names */
ASTBase.prototype.findInScope = function (name) {
  var parts, mainVar, n, normalized, node;
  /* /! 
      
     declare on name 
     indexOf,split 
     declare mainVar:Grammar.NameDeclaration 
     declare parts:array 
     !/ */
  normalized;
  /* First we handle multi-item names, as: String.prototype.split */
  if (name.indexOf('.') >= 0) {
    parts = name.split('.');
    mainVar = this.findInScope(parts[0]);
    if (!(mainVar)) {
      return null;
    }
    n = 1;
    while (n < parts.length) {
      normalized = normalize(parts[n]);
      if (mainVar.members.hasOwnProperty(normalized)) {
        mainVar = mainVar.members[normalized];
      } else {
        return null;
      }
    }
    /* loop */
    return mainVar;
  }
  /* end if */
  normalized = normalize(name, {inScope: true});
  /* Start at this node */
  node = this;
  /* /! 
      
     declare valid node.scope.members.hasOwnProperty 
     declare valid node.parent 
      
     !/ 
     Look for the declaration in this scope */
  while (node) {
    if (node.scope) {
      if (node.scope.members.hasOwnProperty(normalized)) {
        return node.scope.members[normalized];
      }
    }
    /* move up in scopes */
    node = node.parent;
  }
  /* loop */
  return null;
}

/* ----------------------- 
   a Helper method: *ASTBase.getDeclaration(name)*, this method looks for the original declaration 
   in the scope. if the declaration is not found, an error is emmited and a -pseudo- var is created 
   in the scope in order to continue compilation 
   Check if the name is declared. Retrieve the original declaration */
ASTBase.prototype.getDeclaration = function (name) {
  var found;
  /* /! 
      
     declare found:Grammar.NameDeclaration 
     !/ */
  found = this.findInScope(name);
  if (found) {
    /* Declaration found, we check the upper/lower case to be consistent 
       If the found item has a different case than the name we're adding, emit error */
    if (this.caseMismatch(found, name)) {
      /* create a dummy to continue compilation */
      found = this.getScopeNode().addToScope(name + '-*CASE MISMATCH*-', {isForward: true});
    }
  } else if ((k$indexof.call(['true', 'false', 'undefined', 'null', 'NaN', 'Infinity'], name) >= 0)) {
    /* end if 
       if declaration not found, check if it's a built-in value like 'true' */
    found = this.getRootNode().addToScope(name, {inScope: true});
  }
   else if (Environment.isBuiltInObject(name)) {
    /* else, check if it's a built-in "object", so we declare it in the global scope */
    found = this.addBuiltInObject(name);
  }
   else {
    /* if it is not, inform error, Create var to avoid repeated errors */
    this.lexer.sayErr(("UNDECLARED NAME: '" + name + "'"));
    found = this.getScopeNode().addToScope(name, {isForward: true});
    if (String.isCapitalized(name)) {
      found.addMember('prototype', {isForward: true});
    }
  }
  /* end if - check declared variables */
  return found;
}

/* ----------------------------- 
   a Helper method *getValidProperty* */
ASTBase.prototype.getValidProperty = function (ownerVar, nameDecl) {
  var found, checkType;
  /* /! 
      
     declare on ownerVar 
     name,members,type 
     ownMember 
      
     declare found:Grammar.NameDeclaration 
     declare checkType:Grammar.NameDeclaration 
      
     !/ */
  if (!(ownerVar)) {
    debugger;
  }
  if (!(ownerVar.members)) {
    debugger;
  }
  /* Check if it is declared directly in ownerVar */
  found = ownerVar.ownMember(nameDecl);
  /* Check if it is part of the type chain */
  if (!(found)) {
    checkType = ownerVar.type;
    if (!(checkType)) {
      checkType = this.globalVar('Object').members.prototype;
    }
    while (checkType) {
      if (!(checkType.ownMember)) {
        debugger;
      }
      found = checkType.ownMember(nameDecl);
      if (found) {
        break;
      }
      checkType = checkType.type;
    }
  }
  /* if not found, assume a mistyped property name. Report as warning 
     but create the property as a member of ownerVar. Let's trust the programmer. 
     The property exists. */
  if (!(found)) {
    this.lexer.warn(("'" + (ownerVar.name) + "." + (nameDecl.name) + "' UNDECLARED PROPERTY"));
    ownerVar.addMember(nameDecl);
    return nameDecl;
  }
  /* else, check for upper/lower case 
     It means `z.total` and `z.totaL` is caught as error at compile time. 
     If the found item has a different case than the name we're adding, emit error & return */
  this.caseMismatch(found, nameDecl.name);
  return found;
}

/* ------------------------------------------------------------------------ 
   **checkExportsAssignment** 
   Alternative (node.js) syntax support 
   Control: Recognize: 
   `exports.name = x` 
   `module.exports.name = x` 
   `module.exports = x` 
   as alternative to declare 'x' `public` */
ASTBase.prototype.checkExportsAssignment = function (varRef, expr) {
  var rNameDecl, mainVarName, acc, exportedName, item, index, ki$3, kobj$3, isModuleExports, parentModule;
  /* Analyze rValue. what are we assigning? 
     we need a NameDeclaration 
     /! 
      
     declare valid expr.root.name.referencedName 
     declare valid varRef.varName.name 
     declare valid varRef.accessors.list 
      
     declare parentModule:Grammar.Module 
     declare valid parentModule.exports 
      
     declare rNameDecl:Grammar.NameDeclaration 
     !/ */
  rNameDecl;
  if (expr instanceof Grammar.Expression) {
    if (expr.root.name instanceof Grammar.ObjectLiteral || expr.root.name instanceof Grammar.FreeObjectLiteral) {
      rNameDecl = expr.root.name;
    } else if (expr.root.name instanceof Grammar.VariableRef) {
      rNameDecl = expr.root.name.referencedName;
    }
  }
  if (!(rNameDecl)) {
    return;
  }
  /* Analyze lValue. what are we assigning to? */
  if (varRef instanceof Grammar.VariableRef) {
    mainVarName = varRef.varName.name;
    acc = [];
    exportedName = undefined;
    if (varRef.accessors) {
      kobj$3 = varRef.accessors.list;
      for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
        item = kobj$3[ki$3];
        index = ki$3;
        if (item instanceof Grammar.PropertyAccess) {
          acc[index] = item.name;
        }
      }
    }
    isModuleExports = mainVarName === 'module' && acc[0] && acc[0].name === 'exports'; /* module.exports */
    if (isModuleExports && acc[1]) { /* module.exports.x = expr... */
      /* replace by 'exports.x = expr...' */
      mainVarName = 'exports';
      acc[0] = acc[1];
    }
    if (mainVarName === 'exports' && acc[0]) { /* exports.x = expr... */
      /* keep name, replace everything else */
      acc[0].members = rNameDecl.members;
      acc[0].type = rNameDecl.type;
      acc[0].itemType = rNameDecl.type;
      this.addToExport(acc[0]);
    } else if (isModuleExports && acc.length === 1) {
      /* module.exports = x // REPLACE module.exports */
      parentModule = this.getParent(Grammar.Module);
      parentModule.exports = rNameDecl;
    }
  }
}

/* ------------------------------------------------------------------------ 
   **helper addNameValueItemsAsMembers** */
Grammar.NameDeclaration.prototype.addNameValueItemsAsMembers = function (expr) {
  var items, nameValue, newMember, ki$4, kobj$4;
  /* convert a parsed ObjectLiteral into a tree o valid members names 
     used in autoAssignType */
  items;
  if (expr instanceof Grammar.ObjectLiteral) {
    items = expr.items;
  } else if (expr.root.name instanceof Grammar.ObjectLiteral) {
    items = expr.root.name.items;
  }
   else {
    return;
  }
  if (items.length) {
    this.members = {};
    kobj$4 = items;
    for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
      nameValue = kobj$4[ki$4];
      newMember = this.addMember(nameValue.name);
      newMember.addNameValueItemsAsMembers(nameValue.value); /* recursive */
    }
  }
}

/* ------------------------------------------------------------------------ 
   **autoAssignType** 
   Recognize `x = literal` and assigns x's type 
   Examples: 
   `var LineTypes = {CODE:0, COMMENT:1, BLANK:2}` 
   Here the Expression->ObjectLiteral members are passed to 'LineTypes' NameDeclaration 
   so CODE, COMMENT and BLANK are valid members of 'LineTypes' 
   `var lexer = new Lexer()` 
   Here 'lexer' should be assigned type 'Lexer' */
ASTBase.prototype.autoAssignType = function (nameDecl, expr) {
  var varRef, member, ki$5, kobj$5, accessors, baseVar, inx, refType, onNewType, ac;
  /* /! 
      
     declare valid expr.operandCount 
     declare valid expr.root.name.name.members 
     declare valid expr.root.name.type 
     declare valid expr.root.right.name 
      
     declare valid nameDecl.type 
     declare valid nameDecl.members 
     declare valid nameDecl.itemType 
      
     declare varRef:Grammar.VariableRef 
     declare valid varRef.accessors.list 
      
     declare baseVar:Grammar.NameDeclaration 
     declare valid baseVar.returnType 
      
     declare ac 
     declare valid ac.name.itemType 
     !/ */
  if (expr.operandCount === 1) {
    if (expr.root.name instanceof Grammar.ObjectLiteral) {
      nameDecl.addNameValueItemsAsMembers(expr); /* set members from the ObjectLiteral */
    } else if (expr.root.name instanceof Grammar.Literal) {
      nameDecl.type = expr.root.name.type;
    }
     else {
      /* next assignments, only if the has no type defined */
      if (nameDecl.type === undefined || nameDecl.type === this.globalVar('Object').members.prototype) {
        varRef;
        if (expr.root.name === 'new') {
          varRef = expr.root.right.name;
        } else {
          varRef = expr.root.name; /* possible x = require('xxx') */
          if (varRef.returnType) {
            kobj$5 = Object.keys(varRef.returnType.members);
            for (ki$5 = 0; ki$5 < kobj$5.length; ki$5++) {
              member = kobj$5[ki$5];
              nameDecl.addMember(varRef.returnType.members[member]);
            }
            return; /* done */
          }
        }
        if (varRef instanceof Grammar.VariableRef) {
          /* Anlyze accessors to get: 
             * refType: class-prototype to use to auto-assign lvalue type when assingning var to var 
             * onNewType: class-prototype to use to auto-assign lvalue type when calling 'new' 
             Expression   | refType          | onNewType     | Notes 
             -------------|------------------|---------------|------- 
             b.c.x        | x.type           | x.prototype 
             b.c(ff)      | null             | c.prototype 
             b[ff]        | b.itemType       | null | if b[ff] is a constructror, we dont know which specific one 
             b[ff](x)     | null             | null | (idem) 
             b[ff].x      | x.type           | x.prototype | (if b itemType known) 
             b[ff].x[5].r | r.type           | r.prototype | (if b and x itemType known) 
             b[ff].x(5)   | null             | x.prototype | (if b itemType known) 
             b(ff).x(5)   | null             | null        | (because b(ff) is a previous fn.call with result type unk) 
             b[ff].x(b)   | null             | x.prototype 
             b[ff].x      | x.type           | x.prototype 
             b[ff].Xclass | Xclass.typye     | Xclass.prototype  | (if b itemType known) 
             analyze accessors */
          accessors = [];
          if (varRef.accessors) {
            accessors = varRef.accessors.list;
          }
          baseVar = varRef.varName;
          refType;
          onNewType;
          inx = 0;
          while (true) {
            refType = baseVar.type;
            onNewType = baseVar.members.prototype;
            if (inx === accessors.length) {
              break;
            }
            ac = accessors[inx];
            inx += 1;
            if (ac instanceof Grammar.PropertyAccess) {
              baseVar = ac.name;
            } else if (ac instanceof Grammar.IndexAccess) {
              baseVar = ac.name.itemType;
            }
             else if (ac instanceof Grammar.FunctionAccess) {
              refType = undefined;
              baseVar = baseVar.returnType;
            }
            if (!(baseVar)) {
              break;
            }
          }
          /* loop */
          if (expr.root.name === 'new') {
            /* if we know the expression type */
            if (onNewType) {
              nameDecl.type = onNewType; /* set type to class prototype */
            }
          } else if (refType) {
            /* else if assignment from other var */
            nameDecl.type = refType;
          }
        }
      }
    }
  }
}

/* endif 
   -------------------------------------------------------- 
   ##**scopeEvaluateAssignment** 
   a. Recognize `exports.name = x` as alternative to declaring x `public` 
   b. Recognize `name = require('name')` as alternative to `import name` 
   c. Recognize `x = constant/simple value` and assign x's type or "constant" name */
ASTBase.prototype.scopeEvaluateAssignment = function (statement, nameDecl, rvalue) {
  /* a. Recognize `exports.name = x` as alternative to declaring x `public` */
  if (statement instanceof Grammar.VariableRef) {
    this.checkExportsAssignment(statement, rvalue);
  }
  /* b. Recognize `name.x.y = require('name')` as alternative to `import name` 
     first: check if expr.root.name is a VariableRef as in: `name.x.y = require('xx')` 
     c. Recognize `x = constant/simple value` and assign x's type or "constant" name */
  if (nameDecl) {
    this.autoAssignType(nameDecl, rvalue);
  }
}

/* ---------------- 
   ##a helper method toExportArray() - Recursive 
   converts .members[] to 
   simpler arrays for JSON.stringify & cache */
ASTBase.prototype.toExportArray = function () {
  var result, prop, item, members, arrItem, ki$6, kobj$6;
  /* /! 
      
     declare valid me.members 
     declare item:Grammar.NameDeclaration 
     declare valid item.type.fullName 
     declare valid item.itemType.fullName 
      
     !/ 
     FIX WITH for each own property */
  if (this.members) {
    result = [];
    /* FIX with for each property */
    kobj$6 = Object.keys(this.members);
    for (ki$6 = 0; ki$6 < kobj$6.length; ki$6++) {
      prop = kobj$6[ki$6];
      item = this.members[prop];
      members = item.toExportArray(); /* recursive */
      /* FIX with Ternary */
      arrItem = {name: item.name};
      /* /! 
          
         declare valid arrItem.members 
         declare valid arrItem.type 
         declare valid arrItem.itemType 
         declare valid arrItem.value 
         !/ */
      if (members.length) {
        arrItem.members = members;
      }
      if (item.hasOwnProperty('type') && item.type) {
        arrItem.type = item.type.toString();
      }
      if (item.hasOwnProperty('itemType') && item.itemType) {
        arrItem.itemType = item.itemType.toString();
      }
      if (item.hasOwnProperty('value')) {
        arrItem.value = item.value;
      }
      result.push(arrItem);
    }
  }
  return result;
}

/* ---------------- 
   ##a helper method importMembersFromArray(exportObj) - Recursive 
   Inverse of helper method toExportObject() 
   converts exported object, back to NameDeclarations and .members[] */
ASTBase.prototype.importMembersFromArray = function (exportedArr) {
  var item, nameDecl, ki$7, kobj$7;
  /* /! 
      
     declare item:Grammar.NameDeclaration 
     declare nameDecl:Grammar.NameDeclaration 
     !/ */
  kobj$7 = exportedArr;
  for (ki$7 = 0; ki$7 < kobj$7.length; ki$7++) {
    item = kobj$7[ki$7];
    nameDecl = this.declareName(item.name || '(unnamed)');
    if (item.hasOwnProperty('type')) {
      nameDecl.type = item.type;
    }
    if (item.hasOwnProperty('value')) {
      nameDecl.value = item.value;
    }
    this.addMember(nameDecl);
    if (item.members) {
      nameDecl.importMembersFromArray(item.members); /* recursive */
    }
  }
}

/* ---------------- 
   ##a helper method toText() 
   converts NameDeclaration .members[] to 
   simpler arrays for JSON.stringify & cache */
ASTBase.prototype.toText = function () {
  var decls, prop, ki$8, kobj$8, value;
  /* /! 
      
     declare valid me.members 
     declare valid me.value 
      
     !/ */
  decls = [];
  /* FIX WITH for each own property */
  kobj$8 = Object.keys(this.members);
  for (ki$8 = 0; ki$8 < kobj$8.length; ki$8++) {
    prop = kobj$8[ki$8];
    decls.push(this.members[prop].toText()); /* recursive */
  }
  value;
  if (decls.length === 0) {
    if (typeof this.value === 'string') {
      value = ("'" + (this.value) + "'");
    } else {
      value = this.value;
    }
  } else {
    value = ("[" + (decls.join(', ')) + "]");
  }
  return ("" + (this.name) + ": " + value);
}

