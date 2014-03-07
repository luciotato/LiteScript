//Compiled by LiteScript compiler v0.6.3, source: /home/ltato/LiteScript/devel/source-v0.6/Validate.lite.md
   var log = require('./log');
   var debug = log.debug;
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var NameDeclaration = require('./NameDeclaration');
   var Environment = require('./Environment');
   var project = undefined;
   var globalScope = undefined;
   var nameAffinity = undefined;
   function validate(){
       NameDeclaration.allOfThem = [];
       nameAffinity = new NameDeclaration('Name Affinity');
       nameAffinity.addMember('err', 'Error');
       log.message("- Process Declarations");
       walkAllNodesCalling('declare');
       log.message("- Declare By Assignment");
       walkAllNodesCalling('declareByAssignment');
       
       log.message("- Connecting Imported");
       for ( var fname in project.moduleCache)if (project.moduleCache.hasOwnProperty(fname)){
         var moduleNode = project.moduleCache[fname];
         for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];
         
           if (node.importedModule) {
             var parent = undefined;
             var reference = undefined;
             
             
             if (node instanceof Grammar.ImportStatementItem) {
                 
                 reference = node.nameDecl;
                 if (node.getParent(Grammar.CompilerStatement)) {
                     var nameDecl=undefined;
                     for ( var key in node.importedModule.exports.members)if (node.importedModule.exports.members.hasOwnProperty(key)){nameDecl=node.importedModule.exports.members[key];
                         {
                         project.root.addToScope(nameDecl);
                         }
                         
                         }
                     node.importedModule.exports.members = {};
                     reference = undefined;
                 };
             }
             else {
                 parent = node.parent;
                 if (parent instanceof Grammar.Operand) {
                    parent = node.parent.parent.parent;
                 };
                 if (parent instanceof Grammar.AssignmentStatement) {
                   reference = parent.lvalue.tryGetReference({informError: true});
                 }
                 else if (parent instanceof Grammar.VariableDecl) {
                   reference = parent.nameDecl;
                 };
             };
             
             if (reference) {
               reference.makePointTo(node.importedModule.exports);
             };
           };
         };
         
         }
       
       log.message("- Processing Append-To");
       walkAllNodesCalling('processAppendTo');
       log.message("- Converting Types");
       var totalConverted = 0;
       while(totalConverted < NameDeclaration.allOfThem.length){
           var converted = 0;
           for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<NameDeclaration.allOfThem.length ; nameDecl__inx++){nameDecl=NameDeclaration.allOfThem[nameDecl__inx];
           if(!(nameDecl.converted)){
               if (nameDecl.processConvertTypes()) {
                   converted++};
           }};
           if (!converted) {
               break};
           totalConverted += converted;
           debug("converted:" + converted + ", totalConverted:" + totalConverted);
       };
       if (totalConverted < NameDeclaration.allOfThem.length) {
         for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<NameDeclaration.allOfThem.length ; nameDecl__inx++){nameDecl=NameDeclaration.allOfThem[nameDecl__inx];
         
           var type = nameDecl.findOwnMember('**proto**');
           if (type && !(type instanceof NameDeclaration)) {
               nameDecl.sayErr("undeclared type: '" + (type.toString()) + "'");
               if (type instanceof ASTBase) {
                   log.error(type.positionText(), "for reference: type declaration position");
               };
           };
         };
         
       };
       log.message("- Evaluating Assignments");
       walkAllNodesCalling('evaluateAssignments');
       log.message("- Validating Property Access");
       walkAllNodesCalling('validatePropertyAccess');
       for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<NameDeclaration.allOfThem.length ; nameDecl__inx++){nameDecl=NameDeclaration.allOfThem[nameDecl__inx];
       
           if (nameDecl.isForward && !(nameDecl.isDummy)) {
               nameDecl.warn("forward declared, but never found");
               var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration);
               if (container) {
                 
                 
                 if (container.varRef) {
                     log.warning("" + (container.positionText()) + " more info: '" + nameDecl.name + "' of '" + (container.varRef.toString()) + "'")};
               };
           };
       };
       
   };
   
   module.exports.validate=validate;
   
   function walkAllNodesCalling(methodName){
       for ( var filename in project.moduleCache)if (project.moduleCache.hasOwnProperty(filename)){
           var moduleNode = project.moduleCache[filename];
           moduleNode.callOnSubTree(methodName);
           }
       
       
   };
   
   module.exports.walkAllNodesCalling=walkAllNodesCalling;
   function createGlobalScope(aProject){
       project = aProject;
       
       
       globalScope = project.root.createScope();
       project.globalScope = globalScope;
       var objProto = addBuiltInObject('Object');
       
       objProto.members.constructor.addMember('name');
       var stringProto = addBuiltInObject('String');
       objProto.members["tostring"].setMember('**return type**', stringProto);
       addBuiltInObject('Function');
       addBuiltInObject('Boolean');
       addBuiltInObject('Array');
       addBuiltInObject('Number');
       addBuiltInObject('Date');
       addBuiltInObject('RegExp');
       addBuiltInObject('JSON');
       addBuiltInObject('Error').addMember('stack');
       addBuiltInObject('Math');
       globalScope.addMember('true', {value: true});
       globalScope.addMember('false', {value: false});
       globalScope.addMember('on', {value: true});
       globalScope.addMember('off', {value: false});
       globalScope.addMember('undefined', {value: undefined});
       globalScope.addMember('null', {value: null});
       
       if (project.options.browser) {
         null;
       }
       else {
         globalScope.addMember('global', {type: globalScope});
         globalScope.addMember('require');
         globalScope.addMember('setTimeout');
         addBuiltInObject('process');
       };
   };
   
   module.exports.createGlobalScope=createGlobalScope;
   function tryGetGlobalPrototype(name){
     var normalized = NameDeclaration.normalizeVarName(name);
     var nameDecl = globalScope.members[normalized];
     if (nameDecl) {
       
       return nameDecl.members.prototype;
     };
   };
   function globalPrototype(name){
     if (name instanceof NameDeclaration) {
         return name};
     var normalized = NameDeclaration.normalizeVarName(name);
     var nameDecl = globalScope.members[normalized];
     if (!nameDecl) {
       throw new Error("no '" + name + "' in global scope");
     };
     
     if (!nameDecl.members.prototype) {
       throw new Error("global scope '" + name + "' has no .members.prototype");
     };
     return nameDecl.members.prototype;
   };
   function addBuiltInObject(name, node){
     var nameDecl = new NameDeclaration(name, {isBuiltIn: true}, node);
     var normalized = NameDeclaration.normalizeVarName(name);
     globalScope.members[normalized] = nameDecl;
     nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));
     
     if (nameDecl.members.prototype) {
       nameDecl.setMember('**return type**', nameDecl.members.prototype);
       return nameDecl.members.prototype;
     };
     return nameDecl;
   };
   
    NameDeclaration.prototype.findMember = function(name){
       var actual = this;
       var count = 0;
       while(actual instanceof NameDeclaration){
           var result=undefined;
           if ((result=actual.findOwnMember(name))) {
              return result;
           };
           var nextInChain = actual.findOwnMember('**proto**');
           if (!nextInChain && actual !== globalPrototype('Object')) {
             nextInChain = globalPrototype('Object');
           };
           actual = nextInChain;
           if (count++ > 50) {
               this.warn("circular type reference");
               return;
           };
       };
       
    };
    NameDeclaration.prototype.getMembersFromObjProperties = function(obj){
       var newMember = undefined;
       if (obj instanceof Object || obj === Object.prototype) {
           var _list3=Object.getOwnPropertyNames(obj);
           for( var prop__inx=0,prop ; prop__inx<_list3.length ; prop__inx++){prop=_list3[prop__inx];
           if(prop !== '__proto__'){
                   var type = Grammar.autoCapitalizeCoreClasses(typeof obj[prop]);
                   type = tryGetGlobalPrototype(type);
                   if (type === this) {
                       type = undefined};
                   newMember = this.addMember(prop, {type: type});
                   
                   if (prop !== 'constructor') {
                       if (prop === 'prototype' || (typeof obj[prop] === 'function' && obj[prop].hasOwnProperty('prototype') && !(this.isInParents(prop))) || (typeof obj[prop] === 'object' && !(this.isInParents(prop)))) {
                             newMember.getMembersFromObjProperties(obj[prop]);
                             if (prop === 'super_') {
                                 var superProtopNameDecl=undefined;
                                 if ((superProtopNameDecl=newMember.findOwnMember('prototype'))) {
                                   var protopNameDecl = this.findOwnMember('prototype') || this.addMember('prototype');
                                   protopNameDecl.setMember('**proto**', superProtopNameDecl);
                                 };
                             };
                       };
                   };
           }};
           
       };
    };
    NameDeclaration.prototype.isInParents = function(name){
       var nameDecl = this.parent;
       name = NameDeclaration.normalizePropName(name);
       while(nameDecl){
         if (nameDecl.members.hasOwnProperty(name)) {
             return true};
         nameDecl = nameDecl.parent;
       };
       
    };
    NameDeclaration.prototype.processConvertTypes = function(){
       this.convertType('**return type**');
       this.convertType('**item type**');
       var converted = undefined;
       if (this.findOwnMember('**proto**')) {
         converted = this.convertType('**proto**');
       }
       else {
         converted = this.assignTypebyNameAffinity();
       };
       if (converted) {
           this.converted = true};
       return converted;
    };
    NameDeclaration.prototype.convertType = function(internalName){
       var type=undefined;
       if (!((type=this.findOwnMember(internalName)))) {
           return};
       if (type instanceof NameDeclaration) {
           return;
       };
       if (type instanceof Grammar.VariableRef) {
           
           var classFN=undefined;
           if ((classFN=type.tryGetReference())) {
             if (!classFN.members['prototype']) {
               this.sayErr("TYPE: '" + type + "' has no prototype");
               return;
             };
             type = classFN.members['prototype'];
           };
       }
       else if (typeof type === 'string') {
           if (!this.nodeDeclared) {
             type = globalPrototype(type);
           }
           else {
             type = this.nodeDeclared.findInScope(type);
             
             type = type.members.prototype || type;
           };
       }
       else {
         
         this.sayErr("INTERNAL ERROR: UNRECOGNIZED TYPE on " + internalName + ": '" + type + "' [" + type.constructor.name + "] typeof is '" + (typeof type) + "'");
         return;
       };
       if (type) {
           this.setMember(internalName, type)};
       return type;
    };
    NameDeclaration.prototype.assignTypeFromValue = function(value){
     
     var valueNameDecl = value.getResultType();
     if (valueNameDecl instanceof NameDeclaration && ["undefined", "null"].indexOf(valueNameDecl.name)===-1) {
         this.setMember('**proto**', valueNameDecl);
     };
    };
    NameDeclaration.prototype.assignTypebyNameAffinity = function(){
       if (this.nodeDeclared && !(String.isCapitalized(this.name))) {
           if (!(this.findOwnMember('**proto**'))) {
               var normalized = NameDeclaration.normalizePropName(this.name);
               var possibleClassRef = nameAffinity.members[normalized];
               if (!(possibleClassRef) && normalized.length >= 6) {
                   for ( var affinityName in nameAffinity.members)if (nameAffinity.members.hasOwnProperty(affinityName)){
                       if (normalized.endsWith(affinityName)) {
                           possibleClassRef = nameAffinity.members[affinityName];
                           break;
                       };
                       }
                   
                   
               };
               
               if (possibleClassRef && possibleClassRef.nodeDeclared && possibleClassRef.nodeDeclared.nameDecl.members.prototype) {
                   this.setMember('**proto**', possibleClassRef.nodeDeclared.nameDecl.members.prototype);
                   return true;
               };
               if (normalized === 'err') {
                   this.setMember('**proto**', tryGetGlobalPrototype('Error'));
                   return true;
               };
           };
       };
    };
   
    ASTBase.prototype.declareName = function(name, options){
       return new NameDeclaration(name, options, this);
    };
    ASTBase.prototype.addMemberTo = function(nameDecl, memberName, options){
       return nameDecl.addMember(memberName, options, this);
    };
    ASTBase.prototype.tryGetMember = function(nameDecl, name, options){
       if(!options) options={};
       
       var found = nameDecl.findMember(name);
       if (found && name.slice(0, 2) !== '**') {
         found.caseMismatch(name, this);
       }
       else {
         if (options.informError) {
             log.warning("" + (this.positionText()) + ". No member named '" + name + "' on " + (nameDecl.info()))};
         if (options.isForward) {
             found = this.addMemberTo(nameDecl, name, options)};
       };
       return found;
    };
    ASTBase.prototype.getScopeNode = function(){
       var node = this;
       
       while(node){
         if (node.scope) {
           return node;
         };
         node = node.parent;
       };
       return null;
    };
    ASTBase.prototype.findInScope = function(name){
       var normalized = undefined;
       normalized = NameDeclaration.normalizeVarName(name);
       var node = this;
       
       while(node){
         if (node.scope) {
           if (node.scope.members.hasOwnProperty(normalized)) {
             return node.scope.members[normalized];
           };
         };
         node = node.parent;
       };
       
    };
    ASTBase.prototype.tryGetFromScope = function(name, options){
       if (name instanceof NameDeclaration) {
           return name};
       if(!options) options={};
       
       var found=undefined;
       if ((found=this.findInScope(name))) {
           if (found.caseMismatch(name, this)) {
             return found;
           };
       }
       else if (['true', 'false', 'undefined', 'null', 'NaN', 'Infinity'].indexOf(name)>=0) {
           found = this.getRootNode().addToScope(name);
       }
       else if (Environment.isBuiltInObject(name)) {
           found = addBuiltInObject(name, this);
       }
       else {
           if (options.informError) {
               this.sayErr("UNDECLARED NAME: '" + name + "'");
           };
           if (options.isForward) {
               found = this.addToScope(name, options);
               if (options.isDummy && String.isCapitalized(name)) {
                   this.addMemberTo(found, 'prototype', options);
               };
           };
       };
       return found;
    };
    ASTBase.prototype.addToScope = function(item, options){
       if (!item) {
           return};
       var scope = this.getScopeNode().scope;
       if (!options) {
         options = {};
       };
       
       var name = typeof item === 'string' ? item : item.name;
       debug("addToScope: '" + name + "' to '" + scope.name + "'");
       var found=undefined;
       if ((found=this.findInScope(name))) {
           if (found.caseMismatch(name, this)) {
             null;
           }
           else if (found.isForward) {
             found.isForward = false;
             found.nodeDeclared = this;
             if (item instanceof NameDeclaration) {
               found.replaceForward(item);
             };
           }
           else {
             this.sayErr("DUPLICATED name in scope: '" + name + "'");
             log.error(found.originalDeclarationPosition());
           };
           return found;
       };
       var nameDecl = undefined;
       if (item instanceof NameDeclaration) {
         nameDecl = item;
       }
       else {
         nameDecl = this.declareName(name, options);
       };
       var normalized = NameDeclaration.normalizeVarName(name);
       scope.members[normalized] = nameDecl;
       return nameDecl;
    };
    ASTBase.prototype.addToExport = function(exportedNameDecl, asDefault){
     var parentModule = this.getParent(Grammar.Module);
     var options = {
         scopeCase: undefined
         };
     var isInterface = parentModule.lexer.interfaceMode;
     if (isInterface) {
         options.scopeCase = true};
     if (asDefault && !(isInterface)) {
         parentModule.exports.makePointTo(exportedNameDecl);
     }
     else {
       var saveParent = exportedNameDecl.parent;
       parentModule.exports.addMember(exportedNameDecl, options);
       exportedNameDecl.parent = saveParent;
     };
    };
    ASTBase.prototype.createScope = function(){
       
       if (!this.scope) {
         this.scope = this.declareName("" + (this.name || this.constructor.name) + " Scope");
         this.scope.isScope = true;
       };
       return this.scope;
    };
    ASTBase.prototype.createFunctionScope = function(scopeThisProto){
       var scope = this.createScope();
       this.addMemberTo(scope, 'arguments').addMember('length');
       var varThis = this.addMemberTo(scope, 'this', {type: scopeThisProto});
    };
    ASTBase.prototype.tryGetOwnerDecl = function(options){
       if(!options) options={};
       
       var toNamespace = undefined, classRef = undefined;
       var ownerDecl = undefined;
       
       var parent = this.getParent(Grammar.ClassDeclaration);
       if (!parent) {
         this.throwError("'" + this.specifier + "' declaration outside 'class/append to' declaration. Check indent");
       };
       if (parent instanceof Grammar.AppendToDeclaration) {
           
           toNamespace = parent.toNamespace;
           classRef = parent.varRef;
           
           if (!((ownerDecl=classRef.tryGetReference()))) {
             if (options.informError) {
                 this.sayErr("Append to: '" + classRef + "'. Reference is not fully declared")};
             return;
           };
       }
       else {
           if (!((ownerDecl=parent.nameDecl))) {
                this.sayErr("Unexpected. Class has no nameDecl");
           };
           classRef = ownerDecl;
           
           toNamespace = this.toNamespace;
       };
       
       if (toNamespace) {
           null;
       }
       else {
         
         if (!((ownerDecl=ownerDecl.members.prototype))) {
             if (options.informError) {
                 this.sayErr("Class '" + classRef + "' has no .prototype")};
             return;
         };
       };
       return ownerDecl;
    };
   
     
     Grammar.VariableDecl.prototype.createNameDeclaration = function(options){
       if(!options) options={};
       if(options.type===undefined) options.type=this.type;
       if(options.itemType===undefined) options.itemType=this.itemType;
       if(options.value===undefined) options.value=this.assignedValue;
       return this.declareName(this.name, options);
     };
     Grammar.VariableDecl.prototype.declareInScope = function(){
         this.nameDecl = this.addToScope(this.createNameDeclaration());
     };
     Grammar.VariableDecl.prototype.getTypeFromAssignedValue = function(){
         if (this.nameDecl && this.assignedValue) {
             var type=undefined;
             if (!((type=this.nameDecl.findOwnMember('**proto**')))) {
                 var result=undefined;
                 if ((result=this.assignedValue.getResultType())) {
                     this.nameDecl.setMember('**proto**', result);
                 };
             };
         };
     };
   
    Grammar.VarStatement.prototype.declare = function(){
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
           varDecl.declareInScope();
           if (this.export) {
               this.addToExport(varDecl.nameDecl, this.default)};
       };
       
    };
    Grammar.VarStatement.prototype.evaluateAssignments = function(){
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
           varDecl.getTypeFromAssignedValue();
       };
       
    };
   
     
     Grammar.WithStatement.prototype.declare = function(){
        this.nameDecl = this.addToScope(this.declareName(this.name));
     };
     Grammar.WithStatement.prototype.evaluateAssignments = function(){
       this.nameDecl.assignTypeFromValue(this.varRef);
     };
   
     
     Grammar.ImportStatementItem.prototype.declare = function(){
       if (!this.getParent(Grammar.CompilerStatement)) {
           this.nameDecl = this.addToScope(this.name);
       };
     };
   
    
    Grammar.ClassDeclaration.prototype.declare = function(){
       if (this instanceof Grammar.AppendToDeclaration) {
           return};
       this.nameDecl = this.addToScope(this.name, {type: globalPrototype('Function')});
       var namespaceDeclaration=undefined;
       if ((namespaceDeclaration=this.getParent(Grammar.NamespaceDeclaration))) {
           namespaceDeclaration.nameDecl.addMember(this.nameDecl);
       }
       else {
           if (this.export) {
               this.addToExport(this.nameDecl, this.default)};
       };
       var prtypeNameDecl = this.nameDecl.findOwnMember('prototype') || this.addMemberTo(this.nameDecl, 'prototype');
       if (this.varRefSuper) {
           prtypeNameDecl.setMember('**proto**', this.varRefSuper)};
       prtypeNameDecl.addMember('constructor', {pointsTo: this.nameDecl});
       this.nameDecl.setMember('**return type**', prtypeNameDecl);
       if (!(nameAffinity.findOwnMember(this.name))) {
           this.addMemberTo(nameAffinity, this.name);
       };
    };
   
    
    Grammar.ObjectLiteral.prototype.declare = function(){
     
     this.nameDecl = this.parent.nameDecl || this.declareName(ASTBase.getUniqueVarName('*ObjectLiteral*'));
    };
    Grammar.ObjectLiteral.prototype.getResultType = function(){
     return this.nameDecl;
    };
   
    
    Grammar.NameValuePair.prototype.declare = function(){
     
     this.nameDecl = this.addMemberTo(this.parent.nameDecl, this.name);
     if (this.type && this.type instanceof NameDeclaration && ["undefined", "null"].indexOf(this.type.name)===-1) {
         this.nameDecl.setMember('**proto**', this.type);
     }
     else if (this.value) {
         this.nameDecl.assignTypeFromValue(this.value);
     };
    };
   
    
    Grammar.FunctionDeclaration.prototype.declare = function(){
     var owner = undefined;
     if (this.constructor === Grammar.FunctionDeclaration) {
         if (this.name) {
           this.nameDecl = this.addToScope(this.name, {type: 'Function'});
           if (this.export) {
               this.addToExport(this.nameDecl, this.default)};
         };
         var nameValuePair = this.getParent(Grammar.NameValuePair);
         if (nameValuePair) {
             
             owner = nameValuePair.parent.nameDecl;
         }
         else {
           owner = globalScope;
         };
     }
     else {
         owner = this.tryGetOwnerDecl();
         if (owner && this.name) {
             this.addMethodToOwner(owner);
         };
     };
     
     this.createReturnType();
     this.createFunctionScope(owner);
     if (this.paramsDeclarations) {
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.paramsDeclarations.length ; varDecl__inx++){varDecl=this.paramsDeclarations[varDecl__inx];
       
         varDecl.declareInScope();
       };
       
     };
    };
    Grammar.FunctionDeclaration.prototype.processAppendTo = function(){
     if (this.constructor !== Grammar.MethodDeclaration || this.declared) {
         return};
     var owner = this.tryGetOwnerDecl({informError: true});
     if (owner) {
         this.addMethodToOwner(owner);
         
         this.scope.members.this.setMember('**proto**', owner);
         this.createReturnType();
     };
    };
    Grammar.FunctionDeclaration.prototype.addMethodToOwner = function(owner){
     var actual = owner.findOwnMember(this.name);
     if (actual && this.shim) {
       return;
     };
     if (!this.nameDecl) {
         this.nameDecl = this.declareName(this.name, {type: globalPrototype('Function')})};
     this.declared = true;
     this.addMemberTo(owner, this.nameDecl);
    };
    Grammar.FunctionDeclaration.prototype.createReturnType = function(){
     if (!this.nameDecl) {
         return};
     if (this.itemType) {
         var composedName = this.itemType.toString() + ' Array';
         var intermediateNameDecl = globalScope.members[composedName] || globalScope.addMember(composedName, {type: globalPrototype('Array')});
         intermediateNameDecl.setMember("**item type**", this.itemType);
         this.nameDecl.setMember('**return type**', intermediateNameDecl);
     }
     else {
         if (this.type) {
             this.nameDecl.setMember('**return type**', this.type)};
     };
    };
   
    
    Grammar.PropertiesDeclaration.prototype.declare = function(options){
       var owner=undefined;
       if ((owner=this.tryGetOwnerDecl(options))) {
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           
               varDecl.nameDecl = varDecl.addMemberTo(owner, varDecl.name, {type: varDecl.type, itemType: varDecl.itemType});
           };
           this.declared = true;
       };
    };
    Grammar.PropertiesDeclaration.prototype.processAppendTo = function(){
       if (!(this.declared)) {
           this.declare({informError: true})};
    };
    Grammar.PropertiesDeclaration.prototype.evaluateAssignments = function(){
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
           varDecl.getTypeFromAssignedValue();
       };
       
    };
   
    Grammar.ForStatement.prototype.declare = function(){
       
       
       
       this.createScope();
       if (this.variant.indexVar) {
           this.variant.indexVar.declareInScope()};
       if (this.variant.mainVar) {
           if (this.variant.iterable) {
               if(this.variant.mainVar.type===undefined) this.variant.mainVar.type=this.variant.iterable.itemType;
           };
           this.variant.mainVar.declareInScope();
       };
    };
    Grammar.ForStatement.prototype.evaluateAssignments = function(){
       
       if (this.variant instanceof Grammar.ForEachInArray) {
           if (!this.variant.mainVar.nameDecl.findOwnMember('**proto**')) {
               var iterableType = this.variant.iterable.getResultType();
               var itemType=undefined;
               if (iterableType && (itemType=iterableType.findOwnMember('**item type**'))) {
                   this.variant.mainVar.nameDecl.setMember('**proto**', itemType);
               };
           };
       }
       else if (this.variant instanceof Grammar.ForEachProperty) {
           this.variant.indexVar.nameDecl.setMember('**proto**', globalPrototype('String'));
       };
    };
    Grammar.ForStatement.prototype.validatePropertyAccess = function(){
       if (this.variant instanceof Grammar.ForEachInArray) {
           
           var iterableType = this.variant.iterable.getResultType();
           if (!iterableType) {
             null;
           }
           else if (!iterableType.findMember('length')) {
             this.sayErr("ForEachInArray: no .length property declared in '" + this.variant.iterable + "' type:'" + (iterableType.toString()) + "'");
             log.error(iterableType.originalDeclarationPosition());
           };
       };
    };
   
     Grammar.ExceptionBlock.prototype.declare = function(){
       this.createScope();
       this.addToScope(this.catchVar, {type: globalPrototype('Error')});
     };
   
    Grammar.NamespaceDeclaration.prototype.declare = function(){
       if (!this.varRef.accessors) {
           this.nameDecl = this.addToScope(this.declareName(this.varRef.name));
       }
       else {
           var lastAccessor = this.varRef.accessors.pop;
           var reference=undefined;
           if ((reference=this.varRef.tryGetReference({informError: true}))) {
               this.nameDecl = this.addMemberTo(reference, lastAccessor.name);
           };
           this.varRef.accessors.push(lastAccessor);
       };
       if (this.export && this.nameDecl) {
           this.addToExport(this.nameDecl, this.default)};
       this.createScope();
    };
   
    Grammar.VariableRef.prototype.validatePropertyAccess = function(){
       if (this.parent instanceof Grammar.DeclareStatement) {
           return};
       var actualVar = this.tryGetFromScope(this.name, {informError: true, isForward: true, isDummy: true});
       if (!actualVar || !this.accessors) {
           return};
       for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
       
           
           if (ac instanceof Grammar.PropertyAccess) {
             actualVar = this.tryGetMember(actualVar, ac.name, {informError: true});
           }
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = actualVar.findMember('**item type**');
           }
           else if (ac instanceof Grammar.FunctionAccess) {
               actualVar = actualVar.findMember('**return type**');
           };
           if (actualVar instanceof Grammar.VariableRef) {
               
               actualVar = actualVar.tryGetReference({informError: true, isForward: true, isDummy: true});
           };
           if (!actualVar) {
               break};
       };
       
       return actualVar;
    };
    Grammar.VariableRef.prototype.tryGetReference = function(options){
       if(!options) options={};
       
       var actualVar = this.tryGetFromScope(this.name, options);
       if (!actualVar) {
           return};
       if (!this.accessors) {
           return actualVar};
       var partial = this.name;
       for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
       
           
           if (ac instanceof Grammar.PropertyAccess) {
               actualVar = this.tryGetMember(actualVar, ac.name, options);
           }
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = this.tryGetMember(actualVar, '**item type**');
           }
           else if (ac instanceof Grammar.FunctionAccess) {
               actualVar = this.tryGetMember(actualVar, '**return type**');
           };
           if (!(actualVar instanceof NameDeclaration)) {
             actualVar = undefined;
             break;
           }
           else {
             partial += ac.toString();
           };
       };
       
       if (!actualVar && options.informError) {
           this.sayErr("'" + this + "'. Reference can not be analyzed further than '" + partial + "'");
       };
       return actualVar;
    };
    Grammar.VariableRef.prototype.getResultType = function(){
     return this.tryGetReference();
    };
   
    Grammar.AssignmentStatement.prototype.declareByAssignment = function(){
       var varRef = this.lvalue;
       var keywordFound = undefined;
       if (varRef.name === 'exports') {
           keywordFound = varRef.name;
       };
       if (!varRef.accessors) {
         if (keywordFound) {
             this.sayErr("'exports = x', does not work. You need to do: 'module.exports = x'");
         };
         return;
       };
       var actualVar = this.findInScope(varRef.name);
       if (!actualVar) {
           return};
       var createName = undefined;
       for( var index=0,ac ; index<varRef.accessors.length ; index++){ac=varRef.accessors[index];
       
           
           if (ac instanceof Grammar.PropertyAccess) {
             if (keywordFound && index === varRef.accessors.length - 1) {
                 createName = ac.name;
                 break;
             };
             if (['exports', 'prototype'].indexOf(ac.name)>=0) {
               keywordFound = ac.name;
             };
             actualVar = actualVar.findMember(ac.name);
             if (!actualVar) {
                 break};
           }
           else {
             return;
           };
       };
       
       if (keywordFound && actualVar) {
           if (createName) {
             actualVar = this.addMemberTo(actualVar, createName);
           };
           var content = this.rvalue.getResultType({informError: true});
           if (content instanceof NameDeclaration) {
               actualVar.makePointTo(content);
           };
       };
    };
    Grammar.AssignmentStatement.prototype.evaluateAssignments = function(){
     var reference = this.lvalue.tryGetReference();
     if (!(reference instanceof NameDeclaration)) {
         return};
     if (reference.findOwnMember('**proto**')) {
         return};
     reference.assignTypeFromValue(this.rvalue);
    };
   
    Grammar.Expression.prototype.getResultType = function(){
       
       return this.root.getResultType();
    };
   
    Grammar.Oper.prototype.declare = function(){
       if (this.intoVar) {
           var varRef = this.right.name;
           if (!(varRef instanceof Grammar.VariableRef)) {
               this.throwError("Expected 'variable name' after 'into var'");
           };
           if (varRef.accessors) {
               this.throwError("Expected 'simple variable name' after 'into var'");
           };
           this.addToScope(this.declareName(varRef.name, {type: varRef.type}));
       };
    };
    Grammar.Oper.prototype.evaluateAssignments = function(){
     if (this.name === 'into') {
         if (this.right.name instanceof Grammar.VariableRef) {
             
             var nameDecl = this.right.name.tryGetReference();
             if (!(nameDecl instanceof NameDeclaration)) {
                 return};
             if (nameDecl.findOwnMember('**proto**')) {
                 return};
             nameDecl.assignTypeFromValue(this.left);
         };
     };
    };
    Grammar.Oper.prototype.getResultType = function(){
       
       if (this.name === 'new') {
           return this.right.getResultType();
       };
    };
   
    Grammar.Operand.prototype.getResultType = function(){
       
       
       
       if (this.name instanceof Grammar.ObjectLiteral) {
           return this.name.getResultType();
       }
       else if (this.name instanceof Grammar.Literal) {
           return globalPrototype(this.name.type);
       }
       else if (this.name instanceof Grammar.VariableRef) {
           return this.name.tryGetReference();
       };
    };
   
    Grammar.DeclareStatement.prototype.declare = function(){
     if (this.specifier === 'on') {
         var reference = this.tryGetFromScope(this.name, {isForward: true});
         if (String.isCapitalized(reference.name)) {
             
             if (!reference.members.prototype) {
                 reference.addMember('prototype');
             };
             reference = reference.members.prototype;
         };
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
         
             this.addMemberTo(reference, varDecl.createNameDeclaration());
         };
         
     }
     else {
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
         
           varDecl.nameDecl = varDecl.createNameDeclaration();
           if (this.global || this.specifier === 'global') {
               
               project.root.addToScope(varDecl.nameDecl);
           };
           if (this.specifier === 'affinity') {
               var classDecl = this.getParent(Grammar.ClassDeclaration);
               if (!classDecl) {
                   this.sayErr("'declare name affinity' must be included in a class declaration");
                   return;
               };
               varDecl.nameDecl.nodeDeclared = classDecl;
               nameAffinity.addMember(varDecl.nameDecl);
           }
           else if (this.specifier === 'forward') {
               null;
           };
         };
         
     };
    };
    Grammar.DeclareStatement.prototype.validatePropertyAccess = function(){
     if (this.specifier === 'types') {
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
         
             var mainVar=undefined;
             if ((mainVar=this.tryGetFromScope(varDecl.name, {informError: true}))) {
                 var declaredType=undefined;
                 if ((declaredType=varDecl.nameDecl.findOwnMember('**proto**'))) {
                     mainVar.setMember('**proto**', declaredType);
                 };
             };
         };
         
     }
     else if (this.specifier === 'valid') {
         var actualVar = this.tryGetFromScope(this.varRef.name, {informError: true});
         for( var ac__inx=0,ac ; ac__inx<this.varRef.accessors.length ; ac__inx++){ac=this.varRef.accessors[ac__inx];
         
           
           if (!(ac instanceof Grammar.PropertyAccess)) {
               break};
           if (ac.name === 'prototype') {
               actualVar = actualVar.findOwnMember(ac.name) || this.addMemberTo(actualVar, ac.name);
           }
           else {
               actualVar = actualVar.findMember(ac.name) || this.addMemberTo(actualVar, ac.name);
           };
           if (this.type) {
               actualVar.setMember('**proto**', this.type);
               actualVar.processConvertTypes();
           };
         };
         
     };
    };
