#LiteScript Iterables without generators

replace "for each in map X" implementation to use iterable interface to map

Note: JS/MDN seems to implement the "EOF" signal for iterators by throwing a "StopIteration" Exception.

##Also utf-8 Strings cannot be handled as arrays since element size isnt fixed
utf-8 Strings will benefit from a "iterable" interface


## ES6 Implementation

    ES6 implements iterables by using generators. You have several concepts:

    a) The "Iterable" *interface* consisting of a method "@@iterator()" 
    returning a function which in turns returns a object 
    which supports the "iterator" interface. 
    (ES6 core classes @@iterator() returns a *generator*)

    b) The "Iterator" *interface* consisting of a method "next" returning the next object in the sequence. 
    (*generators* support the *Iterator* interface, they have a method "next()")

    So basically generators API is designed to conform the *Iterable* and *Iterator* interfaces.

### To make your own class *iterable* in ES6 you need to:

    a) add a method to YourClass which returns a object with a method next(). So you will need to:
    
    a.1) create *another* class, YourClassIterator with a method next(). Store internal state inside
    YourClassIterable or make method next() a generator. 
    method next() should return a *object* with two properties {done:false,value:[next object in sequence]}

    a.2) add a method @@iterator to YourClass, returning new YourClassIterator()
        

## LiteScript Implementation

    LiteScript simplifies iterable to a core class *Iterable.Position* (a cursor) 
    and single interface *iterable*

    a) The *Iterable.Position* core class, is a simple object with no methods, abstracting the position inside
    a iterable sequence.

        class Iterable.Position
            properties 
                index=-1            // numeric 0..n , -1=>BOF
                len=undefined       // string byteLength | array.length | map.size
                key=undefined       
                value=undefined     
                extra=undefined     

    b) The *Iterable* "interface" consisting of a method "iterableNext(pos:Iterable.Position)", advancing
    pos to the next item in the sequence and returning false if there is no more items.

### To make your own class *iterable* in LiteScript you need to:

    a) add to YourClass a `method iterableNext(pos:Iterable.Position)` returning the next item in the sequence
    
    b) nothing more. just a)    


### Examples: core classes *iterable* implementation in LiteScript:

        append to class Object
            method iterableNext(iter:Iterable.Position)

                if (iter.index==-1) //initialization
                    iter.extra=Object.keys(this)
                    iter.len = extra.length

                if ++iter.index >= iter.len, return false

                iter.key=iter.extra[iter.index]
                iter.value=this.getProperty(iter.key)
                return true

        append to class Array
            method iterableNext(iter:Iterable.Position)

                if (iter.index==-1) //initialization
                    iter.len = this.length

                if ++iter.index >= iter.len, return false

                iter.key=iter.index
                iter.value=this[iter.index]
                return true

        append to class Map
            method iterableNext(iter:Iterable.Position) 
            // for the naive implementation of Map with a simple array of Name:Value pairs

                if (iter.index==-1) //initialization
                    iter.len = this.array.length

                if ++iter.index >= iter.len, return false

                iter.key=this.array[iter.index].key
                iter.value=this.array[iter.index].value
                return true

        append to class String
            method iterableNext(iter:Iterable.Position) 

                if (iter.index==-1) //initialization
                    iter.len = this.length

                if ++iter.index >= iter.len, return false

                iter.key=iter.index
                iter.value=this.substr(iter.index,1)
                return true


# OLD NOTES- Iterables Study

add "Iterable" interface, make map, array, string, Object "iterable"

        method movePreStart returns any (IterableBookMark) //moves to pre-first element (index -1, BOF)

###possible syntaxes

        var bm = array.movePreStart
        while bm.next() into bm
            print bm.getCurrent()

        for(nvp=arr->item;len--;item++)
            print *item

        for(movefirst();not EOF();advance)
            print actual

        movePreStart
        while getNext() into actual
            print actual

        var iterator=array.movePreStart()
        while iterator.next()
            print iterator.current()

        var iterator=array.movePreStart()
        while iterator.next()
            inx = iterator.getInx()
            key = iterator.getKey()
            value = iterator.getValue()
            print inx,key,value

        var iterator=new Cursor(array)
        while iterator.next() into item
            print item.index,item.key,item.value

###for each in

        for each codepoint in s

#### => C

        typedef struct Iterable.Position 
                {int64t_t index, int64t_t len, any key, any value, any extra} 
            Iterable_Position_s;

        for(Iterable_Position_s __i,_newIterator(s,&inxNV); _iteratorNext(&inxNV);)
            print inxNV.index,inxNV.key,inxNV.value

        _newIterator(inxNV_t* i, any iterable){
            i->original = iterable;
            case Iterable
                when String, Array, Map:
                    i->bookmark=iterable; //BOF
                    i->index=-1; //BOF
                    i->key=undefined;
                    i->value=undefined;
                else
                    iterator=iterable->newIterator()
                    i->bookmark=iterator->bookmark;
                    i->index=(int64_t)iterator->index.value.number; 
                    i->key=iterator...
                    i->value=iterator...
        }

        int _iteratorNext(inxNV_t* i){
            case i->original.class
                when String:
                    if (i->index++==0){ //first
                        if(*(i->bookmark.value.str)==0) return NULL; //empty str
                        i->key.value.number=0;
                        i->value=undefined;
                        return;
                    }
                    // "key" stores byte index into string
                    if (i->key.value.number >= i->original.byteLen){ //reached end of slice
                        return NULL;
                    }
                    while(iscodepointPart(++(i->bookmark.value.str)); //advance while part of the codepoint
                    i->key.value.number = i->bookmark.value.str - i->original.value.str; //calc new byteindex
                    return TRUE; //

                else
                    result.bookmark==iterable.newIterator();
                    result.index=(int64_t)iterator.index.value.number; //BOF
                    result.key=iterator...
                    result.value=iterator...
            return result
        }

    interface iterable
        method movePreStart //moves to pre-first element (index -1, BOF)
        method iterableNext // returns true if there's a next item to move to, else false

        method getCurrent //return currentItem

        method getBookmark
        method moveToBookmark


###for each in

        for each codepoint in somethingIterable
            print codepoint

#### => js

        var list1=somethingIterable;
        var codepoint=undefined;
        for(var _item1={index=-1}; list1.iterableNext(_item1);){
            codepoint = _item1.value;
            print codepoint
        }

        class Iterable.Position
            properties 
                index=-1
                key=undefined
                value=undefined
                extra=undefined

        append to class Object
            method iterableNext(iter:Iterable.Position)
                if (iter.index==-1) {
                    //initialization
                    extra=Object.keys(this);
                }
                iter.index++
                if (index>=extra.length) return false;
                iter.key=iter.extra[index]
                iter.value=this[iter.key]
                return true

        append to class Array
            method iterableNext(iter:Iterable.Position)
                iter.index++
                if iter.index>=this.length, return false;
                iter.key=iter.index
                iter.value=this[iter.index]
                return true

        append to class Map
            method iterableNext(iter:Iterable.Position) //when implemented as a simple array
                iter.index++
                if iter.index>=this.length, return false;
                iter.key=this.array[iter.index].key
                iter.value=this.array[iter.index].value
                return true

        append to class String
            method iterableNext(iter:Iterable.Position) //when implemented as a simple array
                iter.index++
                if iter.index>=this.length, return false;
                iter.key=iter.index
                iter.value=this.substr(iter.index,1)
                return true

#note KEEP for each in array / for each in map / for each in Object

    to code specific/faster loops if you need the tiny-extra performance
