//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/NameDeclaration.lite.md
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var log = require('./log');
   var debug = log.debug;
   
    function NameDeclaration(name, options, node){
     this.name = name;
     this.members = {};
     this.nodeDeclared = node;
     
     if (options) {
       if (options.pointsTo) {
           this.members = options.pointsTo.members;
       }
       else {
         if (options.type) {
             this.setMember('**proto**', options.type)};
         if (options.itemType) {
             this.setMember('**item type**', options.itemType)};
         if (options.hasOwnProperty('value')) {
             this.setMember('**value**', options.value)};
       };
       if (options.isForward) {
           this.isForward = true};
       if (options.isDummy) {
           this.isDummy = true};
     };
     NameDeclaration.allOfThem.push(this);
    };
   
    
    NameDeclaration.prototype.setMember = function(name, nameDecl){
       if (name === '**proto**') {
         if (nameDecl === this) {
             return};
       };
       this.members[normalizePropName(name)] = nameDecl;
    };
    NameDeclaration.prototype.findOwnMember = function(name){
       var normalized = normalizePropName(name);
       if (this.members.hasOwnProperty(normalized)) {
         return this.members[normalized];
       };
    };
    NameDeclaration.prototype.ownMember = function(name){
       var normalized = normalizePropName(name);
       if (this.members.hasOwnProperty(normalized)) {
         return this.members[normalized];
       };
       this.sayErr("No member named '" + name + "' on " + (this.info()));
    };
    NameDeclaration.prototype.replaceForward = function(realNameDecl){
       
       var _list2=Object.keys(realNameDecl.members);
       for( var member__inx=0,member ; member__inx<_list2.length ; member__inx++){member=_list2[member__inx];
       
         this.addMember(member, {replaceSameName: true});
       };
       this.isForward = realNameDecl.isForward;
       if (realNameDecl.nodeDeclared) {
         this.nodeDeclared = realNameDecl.nodeDeclared;
       };
       return true;
    };
    NameDeclaration.prototype.makePointTo = function(nameDecl){
       if (!(nameDecl instanceof NameDeclaration)) {
           throw new Error("makePointTo: not a NameDeclaration")};
       this.isForward = false;
       for ( var name in this.members){
         var memberDecl = this.members[name];
         NameDeclaration.allOfThem.remove(memberDecl);
         }
       
       var thisMembers = this.members;
       this.members = nameDecl.members;
       for( var other__inx=0,other ; other__inx<NameDeclaration.allOfThem.length ; other__inx++){other=NameDeclaration.allOfThem[other__inx];
       
           if (other.members === thisMembers) {
               other.members = nameDecl.members;
           };
       };
       
    };
    NameDeclaration.prototype.positionText = function(){
       if (this.nodeDeclared) {
           return this.nodeDeclared.positionText();
       }
       else {
         return "(compiler-defined)";
       };
    };
    NameDeclaration.prototype.originalDeclarationPosition = function(){
       return "" + (this.positionText()) + " for reference: original declaration of '" + this.name + "'";
    };
    NameDeclaration.prototype.sayErr = function(msg){
       log.error("" + (this.positionText()) + " " + (this.info()) + " " + msg);
    };
    NameDeclaration.prototype.warn = function(msg){
       log.warning("" + (this.positionText()) + " " + (this.info()) + " " + msg);
    };
    NameDeclaration.prototype.caseMismatch = function(text, actualNode){
       if (this.name !== text) {
           log.error("" + (actualNode ? actualNode.positionText() : this.positionText()) + " CASE MISMATCH: '" + text + "'/'" + this.name + "'");
           log.error(this.originalDeclarationPosition());
           return true;
       };
    };
    NameDeclaration.prototype.addMember = function(nameDecl, options, nodeDeclared){
       
       
       
       if (!((nameDecl instanceof NameDeclaration))) {
         nameDecl = new NameDeclaration(nameDecl, options, nodeDeclared || this.nodeDeclared);
       };
       if(!options) options={};
       
       debug("addMember: '" + nameDecl.name + "' to '" + this.name + "'");
       var dest = this;
       if (!this.members) {
         throw new Error("no .members in [" + this.constructor.name + "]");
       };
       var normalized = options.scopeCase ? normalizeVarName(nameDecl.name) : normalizePropName(nameDecl.name);
       if (dest.members.hasOwnProperty(normalized)) {
         var found = dest.members[normalized];
       };
       if (!(found)) {
         dest.members[normalized] = nameDecl;
         nameDecl.parent = dest;
         return nameDecl;
       };
       if (found.caseMismatch(nameDecl.name, nodeDeclared || nameDecl.nodeDeclared)) {
           return nameDecl;
           dest.members[normalized] = nameDecl;
       }
       else if (found.isForward) {
           found.replaceForward(nameDecl);
           return found;
       }
       else {
           log.error("" + (nameDecl.positionText()) + ". DUPLICATED property name: '" + nameDecl.name + "'");
           log.error(found.originalDeclarationPosition());
           if (!nameDecl.nodeDeclared) {
               console.trace()};
       };
       return nameDecl;
    };
    NameDeclaration.prototype.toString = function(){
       return this.name;
    };
    NameDeclaration.prototype.composedName = function(){
       var name = this.name;
       if (this.parent && ['prototype', 'Project Root Scope'].indexOf(this.parent.name)===-1) {
         name = this.parent.name + '.' + name;
       };
       return name;
    };
    NameDeclaration.prototype.info = function(){
       var type = "";
       var nameDecltype = this.findOwnMember('**proto**');
       if (nameDecltype instanceof NameDeclaration) {
         type = nameDecltype.name;
         if (nameDecltype.parent && nameDecltype.parent.name !== "Project Root Scope") {
             if (type === 'prototype') {
                 type = nameDecltype.parent.name;
             }
             else {
                 type = "" + nameDecltype.parent.name + "." + type;
             };
             
         };
       }
       else {
         type = 'Object';
       };
       return "'" + (this.composedName()) + ":" + type + "'";
    };
   NameDeclaration
   
         NameDeclaration.allOfThem=[];
     
   function fixSpecialNames(text){
     if (['__proto__', 'NaN', 'Infinity', 'undefined', 'null', 'false', 'true'].indexOf(text)>=0) {
       return '|' + text + '|';
     }
     else {
       return text;
     };
   };
   
   NameDeclaration.fixSpecialNames=fixSpecialNames;
   function normalizePropName(text){
     if (text[0] === "'" || text[0] === '"') {
         return text;
     };
     return fixSpecialNames(text.toLowerCase());
   };
   
   NameDeclaration.normalizePropName=normalizePropName;
   function normalizeVarName(text){
     return fixSpecialNames(text.slice(0, 1) + text.slice(1).toLowerCase());
   };
   
   NameDeclaration.normalizeVarName=normalizeVarName;
module.exports=NameDeclaration;