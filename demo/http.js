function httpGet(url, callback){
    
    if (typeof callback != 'function') 
        throw('2nd parameter should be callback fn(err,data)');

    //me comunico con el node.js server que sirvio esta pagina
    var xmlhttp = create_HttpRequest();
    xmlhttp.data_callback = callback; //guardo el callback(err,data) que me manda el user
    xmlhttp.onload = Local_OnLoad; //default, es la fn que sigue
    xmlhttp.onerror = Local_OnError;
    //xmlhttp.setRequestHeader('content-type', 'applicattion/json');
    xmlhttp.open('GET', url, true);
    xmlhttp.send(); 
}

function Local_OnLoad() {
    //var stat=document.getElementById('status');
    //if (stat) stat.textContent='ready:'+this.readyState;
    if (this.readyState === 4) {
        //if (stat) stat.textContent='status:'+this.status;
        if (this.status!=200) {
            var errMsg = 'Err '+ this.status+': '+this.statusText;
            var stat=document.getElementById('status');
            if (stat) stat.textContent=errMsg;
            this.data_callback(new Error(errMsg), this.responseText);
        }
        else {
            this.data_callback(null, this.responseText);
        }
    }
}

function Local_OnError(e) { 
   this.data_callback(new Error('Server not responding'));
}

function create_HttpRequest() {
    var ref = null;
    if (window.XMLHttpRequest) {
        ref = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // Older IE.
        ref = new ActiveXObject("MSXML2.XMLHTTP.3.0");
    }
    if(!ref) throw {status:505,responseText:'Failure to create XMLHttpRequest'};
    return ref;
}

