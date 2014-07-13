function a() {
    console.log('function',this.constructor.name, this.value, Object.keys(this));
}

o = { value:1}

function Cla(v){
    this.value = v;
}

Cla.prototype.method=function(){console.log('method:',this.constructor.name, this.value, Object.keys(this));}

Cla.prototype.m2=function(){
        console.log('method2 a()');
        a();
        console.log('method2 a.call(this)');
        a.call(this);
    }

var c = new Cla(10);

var j = new Cla(5);


a();
c.method();
c.m2();

console.log(c>j);
console.log(c<j);
