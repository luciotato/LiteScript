# Lite-Core

add "Iterable" interface, make map, array, string, Object "iterable"

        method movePreStart returns any (IterableBookMark) //moves to pre-first element (index -1, BOF)


        var bm = array.movePreStart
        while bm.next() into bm
            print bm.getCurrent()

        for(nvp=arr->item;len--;item++)
            print *item

        for(movefirst;not EOF;advance)
            print actual

        movePreStart
        while actual=advance())
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

        for each codepoint in s

        typedef struct {any bookmark, int64t_t index, any key, any value} inxNV_t;

        for(inxNV_t inxNV,_newIterator(s,&inxNV); _iteratorNext(&inxNV);)
            print inxNV.index,inxNV.key,inxNV.value

        _newIterator(inxNV_t* i, any iterable){
            i->original = iterable;
            case Iterable
                when String, Array, Map
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
                when String
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
        method moveNext // returns true if there's a next item to move to, else false

        method getCurrent //return currentItem

        method getBookmark
        method moveToBookmark

replace "for each in map X" implementation to use iterable interface to map

Note: JS/MDN seems to implement the "EOF" signal for iterators by throwwing a "StopIteration" Exception.
Not a good use of exceptions IMHO.

##Also utf-8 Strings cant be handled as arrays since elemetn size isnt fixed
Strings will benefit from a "iterable" interface


