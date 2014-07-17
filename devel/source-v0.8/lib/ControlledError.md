
    class ControlledError extends Error
        properties 
            soft: boolean


Sadly, the Error Class in javascript is not easily subclassed. 
Seems to be that function Error(), returns a "new" Error in most cases 
(instead of initializing "this")

http://stackoverflow.com/questions/8802845/inheriting-from-the-error-object-where-is-the-message-property

        #we only need this hack to subclass Error on the javascript-based compiler

        #ifdef TARGET_JS

        constructor new ControlledError(msg)
            declare valid Error.apply 
            .__proto__.__proto__ = Error.apply(null,arguments)

Note: we're setting the class.prototype.__proto__

There will be only one instance of ControlledError with useful info.


        #endif 
