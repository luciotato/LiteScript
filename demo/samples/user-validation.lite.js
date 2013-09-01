'use strict';

var crypto = require('crypto');

function hash (pass:string, salt:string)

    var h = crypto.createHash('sha512')
    h.update(pass)
    h.update(salt)
    return h.digest('base64')
    
end function

export function getUser (email, password, callback) 

    select socusua01_ID, socusua01_pass
        from soc_usua_01 
        where socusua01_email = $email 
        
    when done:
    
        if no data.rows then 
            callback(null) //invalid email
            return
        
        
        var newHash = hash(password, email)
        
        if data.socusua01_pass is newHash // ok email, pass

            callback( data.socusua01_ID ); //return user ID
            
        else 
        
            callback(null) // invalid pass
        
        end if
    
end function

export function addUser (email, password, callback) 

    var newHash = hash(password, email)


    try
    
        insert into soc_usua_01
            (socusua01_email, socusua01_pass) 
            values ($email, $newHash)
            
        when done: 

            callback( null, data.new_id );

    catch(e)
    
        if e.message contains 'duplicated'
        
            callback ( e, 'email already used')
            
        else
            
            callback ( e, 'error')
            
        end if
        
end function
