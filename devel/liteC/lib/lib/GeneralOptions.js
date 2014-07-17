//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/lib/GeneralOptions.lite.md

   // class GeneralOptions
   // constructor
   function GeneralOptions(){ // default constructor
      // properties
            // verboseLevel = 1
            // warningLevel = 1
            // comments = 1
            // target = DEFAULT_TARGET
            // debugEnabled = undefined
            // skip = undefined
            // nomap = undefined
            // single = undefined
            // compileIfNewer = undefined
            // browser =undefined
            // extraComments =1
            // defines: array of string = []

            // projectDir:string
            // mainModuleName:string = 'unnamed'
            // outDir = './out'

            // storeMessages: boolean = false
            // literalMap: boolean // produce "new Map()" on "{}"" instead of a js object
            // activated with: 'lexer options literal map', required to make C-production of ls-code

            // version: string

            // now: Date = new Date()
         this.verboseLevel=1;
         this.warningLevel=1;
         this.comments=1;
         this.target=DEFAULT_TARGET;
         this.debugEnabled=undefined;
         this.skip=undefined;
         this.nomap=undefined;
         this.single=undefined;
         this.compileIfNewer=undefined;
         this.browser=undefined;
         this.extraComments=1;
         this.defines=[];
         this.mainModuleName='unnamed';
         this.outDir='./out';
         this.storeMessages=false;
         this.now=new Date();
   };

     // method toString
     GeneralOptions.prototype.toString = function(){
           return "outDir:" + this.outDir + "\nverbose:" + this.verboseLevel + "\ndefines:" + ((this.defines.join()));
     };
   // end class GeneralOptions

// module vars

    //ifdef PROD_C
   var DEFAULT_TARGET = "c";
    //else
    //var DEFAULT_TARGET="js"
    //end if


module.exports=GeneralOptions;