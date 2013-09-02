'use strict';

var crypto = require('crypto');

function hash (pass:string, salt:string)

    var h = crypto.createHash('sha512')
    h.update(pass)
    h.update(salt)
    return h.digest('base64')

end function

export function getUser (email, password)

    select * from soc_usua_01
        where socusua01_email = $email

    if no data.rows then throw 'invalid email'

    var newHash = hash(password, email)

    if data.socusua01_pass is newHash // ok email, pass
            return data;
    else
            throw 'invalid password'
    end if

end function

export function addUser (email, password)
    var newHash = hash(password, email)
    try
        insert into soc_usua_01
            (socusua01_email, socusua01_pass)
            values ($email, $newHash)
        return data.new_id ;

    catch(e)
        if e.message contains 'duplicated'
            throw 'email already used'
        else
            throw(e)
        end if

end function
