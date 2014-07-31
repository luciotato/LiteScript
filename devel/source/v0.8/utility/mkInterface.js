//mkInterface - creates a name.interface.md from a "require(name)"
//Dependencies
//------------
////    import Map
    
//##Main
    //var moduleName = process.argv[2]
    var moduleName = process.argv[2];
    //if no moduleName
        //print """ 
            //usage: mkInterface name
            //where "name" is the name of a module to "require()"
            //a .interface.md file will be generated for the loaded module
        //"""
        //process.exit 1
    //var requiredModule = require(moduleName)
    var requiredModule = require(moduleName);
    //var mainOut = new Output
    var mainOut = new Output();
    
    //var foundClasses = [] //clear
    var foundClasses = []; //clear
    //var mainNameDecl = new NameDeclaration(moduleName, requiredModule)
    var mainNameDecl = new NameDeclaration(moduleName, requiredModule);
    //mainNameDecl.processMain mainOut
    //mainOut.printAll
//### class Output
    // constructor
    function Output(){ // default constructor
        //declare name affinity out
        //properties
            //text: string array = []
            //indentSpace = '    '
            //headers: string array = []
            //pendingHeaders
            this.text=[];
            this.indentSpace='    ';
            this.headers=[];
    };
        
        //method indent
        Output.prototype.indent = function(){
            //.indentSpace += '    '
            this.indentSpace += '    ';
        };
        //method deindent
        Output.prototype.deindent = function(){
            //.indentSpace = .indentSpace.slice(4)
            this.indentSpace = this.indentSpace.slice(4);
        };
        
        //method setHeader(s:string)
        Output.prototype.setHeader = function(s){
            //.headers.push .indentSpace + s
            this.headers.push(this.indentSpace + s);
            //.pendingHeaders = .headers.length
            this.pendingHeaders = this.headers.length;
        };
        //method clearHeader
        Output.prototype.clearHeader = function(){
            //.headers.pop
            this.headers.pop();
            //.pendingHeaders = .headers.length
            this.pendingHeaders = this.headers.length;
        };
        //method push(s:string)
        Output.prototype.push = function(s){
            //if s
            if (s) {
                //for inx=0 while inx<.pendingHeaders
                for( var inx=0; inx < this.pendingHeaders; inx++) {
                    //.text.push .headers[inx]
                    this.text.push(this.headers[inx]);
                    //.headers[inx]=undefined
                    this.headers[inx] = undefined;
                };// end for inx
                //end for
                
                //.pendingHeaders=0
                this.pendingHeaders = 0;
            };
            //.text.push .indentSpace + s
            this.text.push(this.indentSpace + s);
        };
        //method printAll
        Output.prototype.printAll = function(){
            //for each string in .text
            for( var string__inx=0,string ; string__inx<this.text.length ; string__inx++){string=this.text[string__inx];
            
                //print string
                console.log(string);
            };// end for each in this.text
            
        };
    // end class Output
//### class NameDeclaration
    // constructor
    function NameDeclaration(name, obj, parent){
        //properties
            //parent: NameDeclaration
            //name
            //type
            //params: string
            //members: map string to NameDeclaration
            //pointer
        //constructor new NameDeclaration(name, obj, parent)
            //.name = name
            this.name = name;
            //.pointer = obj
            this.pointer = obj;
            //.parent = parent
            this.parent = parent;
            //.type = typeof obj
            this.type = typeof obj;
            //if .type is 'function'
            if (this.type === 'function') {
                //var source= obj.toString()
                var source = obj.toString();
                //.params = source.slice(source.indexOf('('),source.indexOf('{'))
                this.params = source.slice(source.indexOf('('), source.indexOf('{'));
            };
            //declare valid obj.prototype
            
            //if .type is 'function' and obj.prototype and Object.getOwnPropertyNames(obj.prototype).length>4
            if (this.type === 'function' && obj.prototype && Object.getOwnPropertyNames(obj.prototype).length > 4) {
                //.type='class'
                this.type = 'class';
                //for each nameDecl in foundClasses
                for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<foundClasses.length ; nameDecl__inx++){nameDecl=foundClasses[nameDecl__inx];
                
                    //if nameDecl.name is this.name, return #do not duplicate
                    if (nameDecl.name === this.name) {return};
                };// end for each in foundClasses
                //foundClasses.push this
                foundClasses.push(this);
            };
        };
//---------
        //method processMain(out, comment)
        NameDeclaration.prototype.processMain = function(out, comment){
                //.getMembersFromObjProperties
                this.getMembersFromObjProperties();
                //if .type isnt 'class'
                if (this.type !== 'class') {
                    //out.indentSpace = '    '
                    out.indentSpace = '    ';
                    //out.push ""
                    out.push("");
                    //out.push 'namespace '+.toString()
                    out.push('namespace ' + this.toString());
                    //.pushMethodsAndProperties out
                    this.pushMethodsAndProperties(out);
                };
                ////while found classes
                //while foundClasses.length
                while(foundClasses.length){
                    //var nameDecl = foundClasses.shift()
                    var nameDecl = foundClasses.shift();
                    //nameDecl.processClass out
                    nameDecl.processClass(out);
                };// end loop
                
        };
        //method processClass(out, comment)
        NameDeclaration.prototype.processClass = function(out, comment){
                //.getMembersFromObjProperties
                this.getMembersFromObjProperties();
                //out.indentSpace = '    '
                out.indentSpace = '    ';
                //out.push ""
                out.push("");
                //out.push ""
                out.push("");
                //out.push 'public '+.type+' '+.name
                out.push('public ' + this.type + ' ' + this.name);
                //// constructor
                //if .params 
                if (this.params) {
                    //out.indent
                    out.indent();
                    //out.push 'constructor new '+.name+' '+.params
                    out.push('constructor new ' + this.name + ' ' + this.params);
                    //out.deindent
                    out.deindent();
                };
                //// out props from prototype
                //var ptrNameDecl = .members.get("_prototype")
                var ptrNameDecl = this.members.get("_prototype");
                //ptrNameDecl.pushMethodsAndProperties out
                ptrNameDecl.pushMethodsAndProperties(out);
                ////now as namespace 
                //.processAppendToNamespace out
                this.processAppendToNamespace(out);
        };
        //method processAppendToNamespace(out)
        NameDeclaration.prototype.processAppendToNamespace = function(out){
                //out.indentSpace = '    '
                out.indentSpace = '    ';
                //out.setHeader ""
                out.setHeader("");
                //out.setHeader 'append to namespace '+.name
                out.setHeader('append to namespace ' + this.name);
                //.pushMethodsAndProperties out
                this.pushMethodsAndProperties(out);
                //out.clearHeader
                out.clearHeader();
                //out.clearHeader
                out.clearHeader();
        };
        //method pushMethodsAndProperties(out, comment)
        NameDeclaration.prototype.pushMethodsAndProperties = function(out, comment){
                ////properties 
                //out.indent
                out.indent();
                //out.setHeader 'properties'
                out.setHeader('properties');
                //out.indent
                out.indent();
                //for each key,nameDecl in map .members
                var nameDecl=undefined;
                if(!this.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                for ( var key in this.members.dict) if (this.members.dict.hasOwnProperty(key)){nameDecl=this.members.dict[key];
                if(nameDecl.type !== 'function' && nameDecl.type !== 'class' && nameDecl.name !== 'prototype'){
                    //where nameDecl.type isnt 'function' 
                        //and nameDecl.type isnt 'class'
                        //and nameDecl.name isnt 'prototype'
                        
                        //nameDecl.pushMembers out
                        nameDecl.pushMembers(out);
                        }
                        
                        }// end for each property
                        ////out.push indent+'#{protoypeMember.name}:#{protoypeMember.type}'
                //out.clearHeader
                out.clearHeader();
                //out.deindent
                out.deindent();
                ////out.setHeader ""
                ////out.setHeader "//methods"
                //out.setHeader ""
                out.setHeader("");
                
                //for each key,methodNameDecl in map .members
                var methodNameDecl=undefined;
                if(!this.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                for ( var key in this.members.dict) if (this.members.dict.hasOwnProperty(key)){methodNameDecl=this.members.dict[key];
                if(methodNameDecl.type === 'function'){
                    //where methodNameDecl.type is 'function'
                        //out.push "method #{methodNameDecl.name}#{methodNameDecl.params or ''}"
                        out.push("method " + methodNameDecl.name + (methodNameDecl.params || ''));
                        }
                        
                        }// end for each property
                
                //out.clearHeader
                out.clearHeader();
                ////out.clearHeader
                ////out.clearHeader
                ////out.push ""
                //out.deindent
                out.deindent();
        };
        //declare name affinity nameDecl
        
        //helper method pushMembers(out) #recursive
        NameDeclaration.prototype.pushMembers = function(out){// #recursive
//recursively writes a object declaration
            //if .name not like /^[a-zA-Z$_]+$/, return # exclude strange/private names
            if (!(/^[a-zA-Z$_]+$/.test(this.name))) {return};
            //if .type is 'object' and .members
            if (this.type === 'object' && this.members) {
                //out.setHeader '#{.name}:'
                out.setHeader('' + this.name + ':');
                //for each key,nameDecl in map .members
                var nameDecl=undefined;
                if(!this.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                for ( var key in this.members.dict) if (this.members.dict.hasOwnProperty(key)){nameDecl=this.members.dict[key];
                    {
                    //out.indent
                    out.indent();
                    //nameDecl.pushMembers out
                    nameDecl.pushMembers(out);
                    //out.deindent
                    out.deindent();
                    }
                    
                    }// end for each property
                //out.clearHeader
                out.clearHeader();
            }
            else if (this.type === 'class') {
            
            //else if .type is 'class'
                //do nothing
                null;
            }
            else {
                ////out.push '#{.name}:#{"function"}#{.params or ""} #CLASS'
            //else                
                //out.push '#{.name}:#{.type}#{.params or ""}'
                out.push('' + this.name + ':' + this.type + (this.params || ""));
            };
            //end if
            
        };
//----
        //helper method getMembersFromObjProperties() returns array #Recursive
        NameDeclaration.prototype.getMembersFromObjProperties = function(){// #Recursive
//Recursively converts a obj properties in NameDeclarations.
//it's used when a pure.js module is imported by 'require'
//to convert required 'exports' to LiteScript compiler usable NameDeclarations
//Also to load the global scope with built-in objects
            //if .pointer instanceof Object //or obj is Object.prototype
            if (this.pointer instanceof Object) { //or obj is Object.prototype
              //for each prop in Object.getOwnPropertyNames(.pointer) #even not enumerables
              var _list1=Object.getOwnPropertyNames(this.pointer);
              for( var prop__inx=0,prop ; prop__inx<_list1.length ; prop__inx++){prop=_list1[prop__inx];
                if(prop !== '__proto__' && prop !== 'super_' && prop !== 'constructor' && !((typeof this.pointer === 'function' && ['caller', 'arguments', 'length', 'name'].indexOf(prop)>=0))){
                //where prop isnt '__proto__' # exclude __proto__ 
                    //and prop isnt 'super_' # exclude 
                    //and prop isnt 'constructor' # exclude 
                    //# and exclude 'function' core props
                    //and not (typeof .pointer is 'function' and prop in ['caller','arguments','length','name'])
                    //var value = .pointer[prop]
                    var value = this.pointer[prop];
                    ////create
                    //var newMember = new NameDeclaration(prop,value,this)
                    var newMember = new NameDeclaration(prop, value, this);
                    ////print newMember.toString()
                    //if no .members, .members = new Map
                    if (!this.members) {this.members = new Map()};
                    //.members.set NameDeclaration.normalize(prop), newMember
                    this.members.set(NameDeclaration.normalize(prop), newMember);
                    //if newMember.type isnt 'class'
                    if (newMember.type !== 'class') {
                        //if value instanceof Object 
                        if (value instanceof Object && !(this.isInParents(value)) && this.countDepth() < 2) {
                            //and not .isInParents(value)
                            //and .countDepth()<2
                            //newMember.getMembersFromObjProperties #recursive
                            newMember.getMembersFromObjProperties();// #recursive
                        };
                    };
              }};// end for each in Object.getOwnPropertyNames(this.pointer)
              
            };
        };
        //end method
        
        //helper method countDepth()
        NameDeclaration.prototype.countDepth = function(){
            //var result = 0        
            var result = 0;
            //var nameDecl = this.parent
            var nameDecl = this.parent;
            //while nameDecl
            while(nameDecl){
              //result++
              result++;
              //nameDecl = nameDecl.parent
              nameDecl = nameDecl.parent;
            };// end loop
            //return result
            return result;
        };
        //helper method isInParents(value)
        NameDeclaration.prototype.isInParents = function(value){
//return true if a property name is in the parent chain.
//Used to avoid recursing circular properties
        
            //var nameDecl = this.parent
            var nameDecl = this.parent;
            //while nameDecl
            while(nameDecl){
              //if nameDecl.pointer is value,return true
              if (nameDecl.pointer === value) {return true};
              //nameDecl = nameDecl.parent
              nameDecl = nameDecl.parent;
            };// end loop
            
        };
        //end helper method
        
        //helper method toString
        NameDeclaration.prototype.toString = function(){
            //var result=.name 
            var result = this.name;
            //var a=.parent
            var a = this.parent;
            //while a
            while(a){
                //result=a.name+'.'+result
                result = a.name + '.' + result;
                //a=a.parent
                a = a.parent;
            };// end loop
            //return "#{result}"
            return '' + result;
        };
    // end class NameDeclaration
    //Append to namespace NameDeclaration
    
        //method normalize(name)
        NameDeclaration.normalize = function(name){
            //return "_"+name;
            return "_" + name;
        };
//### helper class Map
    // constructor
    function Map(){
        //properties
            //dict:Object
            //size
        //method clear()
            //.dict= new Object
            //.size=0
        //constructor new Map
            //.clear
            this.clear();
        };
        Map.prototype.clear = function(){
            this.dict = new Object();
            this.size = 0;
        };
            
//To keep compatibility with ES6, we have a special "Map.fromObject()"
//used to create a Map from a Literal Object. 
//We can't use default Map constructor, since ES6 Map constructor is: new Map([iterator])
        //method fromObject(object)
        Map.prototype.fromObject = function(object){
            //.dict = object
            this.dict = object;
            //.size = Object.keys(.dict).length
            this.size = Object.keys(this.dict).length;
            //return this
            return this;
        };
        //method set(key:string, value)
        Map.prototype.set = function(key, value){
            //if no .dict.hasOwnProperty(key), .size++
            if (!this.dict.hasOwnProperty(key)) {this.size++};
            //.dict[key]=value
            this.dict[key] = value;
        };
        //method setProperty(name:string, value) //use Map|Object interchangeably
        Map.prototype.setProperty = function(name, value){ //use Map|Object interchangeably
            //.dict[name] = value
            this.dict[name] = value;
        };
        //method delete(key:string)
        Map.prototype.delete = function(key){
            //if .dict.hasOwnProperty(key), .size--
            if (this.dict.hasOwnProperty(key)) {this.size--};
            //delete .dict[key]
            delete this.dict[key];
        };
        //method get(key:string)
        Map.prototype.get = function(key){
            //return .dict[key]
            return this.dict[key];
        };
        //method tryGetProperty(key:string) //use Map|Object interchangeably
        Map.prototype.tryGetProperty = function(key){ //use Map|Object interchangeably
            //return .dict[key]
            return this.dict[key];
        };
        //method has(key:string)
        Map.prototype.has = function(key){
            //return .dict has property key
            return key in this.dict;
        };
        //method hasProperty(key:string) //use Map|Object interchangeably
        Map.prototype.hasProperty = function(key){ //use Map|Object interchangeably
            //return .dict has property key
            return key in this.dict;
        };
        //method hasOwnProperty(key:string) //use Map|Object interchangeably
        Map.prototype.hasOwnProperty = function(key){ //use Map|Object interchangeably
            //return .dict has property key
            return key in this.dict;
        };
        //method keys() returns array
        Map.prototype.keys = function(){
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        };
        //method getObjectKeys() returns array  //use Map|Object interchangeably
        Map.prototype.getObjectKeys = function(){ //use Map|Object interchangeably
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        };
        //method forEach(callb)
        Map.prototype.forEach = function(callb){
            //for each property propName,value in .dict
            var value=undefined;
            for ( var propName in this.dict)if (this.dict.hasOwnProperty(propName)){value=this.dict[propName];
                {
                //callb(propName,value)
                callb(propName, value);
                }
                
                }// end for each property
            
        };
    // end class Map
// --------------------
// Module code
// --------------------
    if (!moduleName) {
        console.log("            usage: mkInterface name\n\n            where \"name\" is the name of a module to \"require()\"\n\n            a .interface.md file will be generated for the loaded module\n");
        process.exit(1);
    };
    mainNameDecl.processMain(mainOut);
    mainOut.printAll();
// end of module
