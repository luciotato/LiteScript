
    //class ControlledError extends Error
    // constructor
    function ControlledError(msg){// default constructor: call super.constructor
        Error.prototype.constructor.apply(this,arguments)
        //properties 
            //soft: boolean


//Sadly, the Error Class in javascript is not easily subclassed. 
//Seems to be that function Error(), returns a "new" Error in most cases 
//(instead of initializing "this")

//http://stackoverflow.com/questions/8802845/inheriting-from-the-error-object-where-is-the-message-property

        //#we only need this ***hack*** to subclass Error on the javascript-based compiler

        ////ifdef TARGET_JS

        //constructor new ControlledError(msg)
            //declare valid Error.apply 
            
            //declare valid this.__proto__.__proto__
            
            //.__proto__.__proto__ = Error.apply(null,arguments)
            this.__proto__.__proto__ = Error.apply(null, Array.prototype.slice.call(arguments));
        };
    // ControlledError (extends|proto is) Error
    ControlledError.prototype.__proto__ = Error.prototype;
    
    // end class ControlledError

//Note: we're setting the class.prototype.__proto__

//There will be only one instance of ControlledError with useful info.


        ////endif


module.exports=ControlledError;
