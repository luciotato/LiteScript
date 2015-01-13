    
    export only namespace dns
    
        properties
            NODATA  //="ENODATA"
            FORMERR //="EFORMERR"
            SERVFAIL //"ESERVFAIL"
            NOTFOUND //"ENOTFOUND"
            NOTIMP //"ENOTIMP"
            REFUSED //"EREFUSED"
            BADQUERY //"EBADQUERY"
            ADNAME //"EADNAME"
            BADFAMILY //"EBADFAMILY"
            BADRESP //"EBADRESP"
            CONNREFUSED //"ECONNREFUSED"
            TIMEOUT //"ETIMEOUT"
            EOF //"EOF"
            FILE //"EFILE"
            NOMEM //"ENOMEM"
            DESTRUCTION //"EDESTRUCTION"
            BADSTR //"EBADSTR"
            BADFLAGS //"EBADFLAGS"
            NONAME //"ENONAME"
            BADHINTS //"EBADHINTS"
            NOTINITIALIZED //"ENOTINITIALIZED"
            LOADIPHLPAPI //"ELOADIPHLPAPI"
            ADDRGETNETWORKPARAMS //"EADDRGETNETWORKPARAMS"
            CANCELLED //"ECANCELLED"
        
        method lookup(domain, family, callback) 
        method resolve4(name, callback) 
        method resolve6(name, callback) 
        method resolveCname(name, callback) 
        method resolveMx(name, callback) 
        method resolveNs(name, callback) 
        method resolveTxt(name, callback) 
        method resolveSrv(name, callback) 
        method resolveNaptr(name, callback) 
        method reverse(name, callback) 
        method resolve(domain, type_, callback_) 
        method getServers
        method setServers(servers) 
