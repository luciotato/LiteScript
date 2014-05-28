struct refCounts{
    int * items;
    int length;
    int avail;
    int used;
} refCounts;

int const refCounts_BLOCK=1024;

int refCounts_push(int value){
    if (refCounts.length>=refCounts.avail){
        refCounts.avail+=refCounts_BLOCK;
        refCounts.items = realloc(refCounts.items, sizeof(int)*refCounts.avail);
        if (refCounts.items==NULL) fatal ("refCounts virtual memory exhausted");
    };

    //Store
    refCounts.items[refCounts.length]=value;
    refCounts.used++;
    return refCounts.length++; //returns index

}

int refCounts_get(int n){
    if (n<0 || n>=refCounts.length) fatal("refCounts array out of bounds");
    return refCounts.items[n];
}

void refCounts_set(int n, int value){
    if (n<0 || n>=refCounts.length) fatal("refCounts array out of bounds");
    refCounts.items[n]= value;
}

//objects
struct objects{
    void * items;
    int length;
    int avail;
    int used;
} objects;

int const objects_BLOCK=1024;

Object objects_get(int n){
    if (n<0 || n>=objects.length) fatal("objects array out of bounds");
    return objects.items[n];
}

int objects_push(Object value){

    if (objects.length>=objects.avail){
        objects.avail+=objects_BLOCK;
        objects.items = realloc(objects.items, sizeof(Object)*objects.avail);
        if (objects.items==NULL) fatal ("virtual memory exhausted");
    };

    //Store
    objects.items[objects.length]=value;
    objects.used++;
    return objects.length++; //returns index
};

handle Object_create(int length, handle proto){

    Object obj=malloc(sizeof(var)*length);
    obj[_Object_length]=length;
    obj[_Object__proto__]=proto;

    objects_push(obj);
    return refCounts_push(1); //returns index/handle
}
