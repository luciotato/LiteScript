/**
  * --------------------------------
 * LiteScript lang - gtihub.com/luciotato/LiteScript
 * Copyright (c) 2014 Lucio M. Tato
 * --------------------------------
 * This file is part of LiteScript.
 * LiteScript is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation version 3.
 * LiteScript is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details. You should have received a copy of the
 * GNU Affero General Public License along with LiteScript.  If not, see <http://www.gnu.org/licenses/>.
 *
 * LiteC Core, core support for Lite-to-c compiled code
 *
 * -------
 * KeyTree
 * -------
 * Store a Map key:string -> index:len_t
 * in x n-ary trees, where x is distinct(key.length) and n=0..2^32
 *
 * Limits: 2^32 max number of keys
 *
 * level:0 is a keyTreeRoot, an Array_s with a pointer to a n-ary Tree for each distinct key.length
 * level:1-n are SortedBranchs, with chunks up to 8 bytes of the key, sorted,
 * holding a value which is:
 * - if key.length is longer than 8 bytes, a "next" pointer to a next level SortedBranch
 * - if key.length is less than or equal 8 bytes, a "index:len_t" -> value associated with the key
 *
 * This structure is optimized for small keys 1..32 bytes in length, and each key
 * varying in size. Worst case is large keys, all same length.
 *
 * Example: assume 200 keys, all 24 bytes length:
 * let's assume 10 distinct values for each 8 bytes of key
 *   root:0 - ptr Array x size - 12+ 8*24  = 204 bytes in size (mostly space for key.lengths < 24)
 *   level:1 -sortedBranch- 24+ 10*8 +10*8 = 184 bytes in size - split keys in 10 groups
 *   level:2 -sortedBranch- 10 units - 24+ 10*8 +10*8 = 1840 bytes in size - each group has 10 items
 *   level:3 -sortedBranch- 100 units - 24+ 2*8 +2*8 = 5600 bytes in size - each with 2 keys, 200 keys covered
 *
 */

    #include "LiteC-core.h"

    void _initKeyTreeRootStruct(Array_s * arr, len_t maxLen){
        _initArrayStruct(arr,sizeof(KeyTreeSortedBranch_s),32);
    }

    void _initKeyTreeSortedBranch(KeyTreeSortedBranch_ptr thisBranch, len_t keyLen){

            thisBranch->keyLenHere = keyLen;

            #define initialSpace 32

            //keys sorted array
            _initArrayStruct(&thisBranch->keys,sizeof(uint64_t),initialSpace);

            //parallel values array: ptr or len_t index
            uint16_t sizeOfValues = keyLen>8? sizeof(KeyTreeSortedBranch_ptr) : sizeof(len_t);
            _initArrayStruct(&thisBranch->values,sizeOfValues,initialSpace);

            #undef initialSpace
    }

    KeyTreeSortedBranch_ptr _newKeyTreeSortedBranch(len_t keyLenHere){
        KeyTreeSortedBranch_ptr b = mem_alloc(sizeof(KeyTreeSortedBranch_s));
        _initKeyTreeSortedBranch(b,keyLenHere);
        return b;
    }

    /**
     * returns "index" found or -1
     *
     * @param keyTree: KeyTreeSizesBranch_ptr
     * @param what 0:ADD 1:FIND 2:REMOVE
     * @param key:any
     * @param index:len_t (when what=ADD)
     * @return
     */
    int64_t _KeyTree_do(Array_ptr keyTreeRoot, byte what, any key, len_t valueIndex){

        /* what=
        SET_KEY=0, //set value or insert if not found, return found, or value set
        FIND_OR_INSERT=1, //insert if not found - return found, or value inserted
        FIND_KEY=2, // return found or -1
        REMOVE_KEY=3 // return found or -1
         */

        assert(key.class==String_inx);
        assert(key.len > 0 );

        len_t kpartStart=0;
        int kpartCount=key.len; //key char count

        //get 1st sorted branch based on keylen-1, len=1 => inx:0
        len_t treeIndex = kpartCount-1;
        if (treeIndex>=keyTreeRoot->length){ // all existent keys are smaller
            if (what>=FIND_KEY) return -1; //key not found
            //else what:ADD_KEY or SET_KEY, extend to cover this key.length
            _array_realloc(keyTreeRoot, treeIndex+4);
            // set this key.length as max if required
            keyTreeRoot->length = treeIndex+1;
        }

        //get tree to use based on keylen
        //KeyTreeSortedBranch_ptr thisBranch = ARR_ITEM_PTR(KeyTreeSortedBranch_s,treeIndex,keyTreeRoot);
        //define ARR_ITEM_PTR(TYPE,index,arrPtr) ((TYPE*)((arrPtr)->base.bytePtr+(index*(arrPtr)->itemSize)))
        KeyTreeSortedBranch_ptr thisBranch = (KeyTreeSortedBranch_s*)(keyTreeRoot->base.bytePtr + treeIndex*sizeof(KeyTreeSortedBranch_s));

        while(kpartCount){ //process the key in 8 bytes chunks

            //if branch not initialized => not found
            if (!thisBranch->keys.allocd) {
                if (what>=FIND_KEY) return -1; //not found
                //init branch if adding
                _initKeyTreeSortedBranch(thisBranch,kpartCount);
            }

            //how many btes will process (tops 8)
            byte cpcount= kpartCount>8? 8: kpartCount;
            assert(cpcount);

            // move up to 8 chars of the key to "composed"
            uint64_t composed=0;
            memcpy(&composed, key.value.str+kpartStart, cpcount);

            /*register str keyStart = key.value.str+kpartStart;
            switch(cpcount){
                case 1:
                    composed = *keyStart;
                    break;
                case 2:
                    composed = *(uint16_t*)keyStart;
                    break;
                case 4:
                    composed = *(uint32_t*)keyStart;
                    break;
                case 8:
                    composed = *(uint64_t*)keyStart;
                    break;
                default:
                    memcpy(((char*)(&composed))+(8-cpcount), keyStart, cpcount);
            }
             */

            //uint64_t assert_control;
            //assert( memcpy(&assert_control, key.value.str+kpartStart, cpcount));
            //assert( assert_control==composed);


            //prepare binary search
            uint64_t* keys = (uint64_t*)thisBranch->keys.base.bytePtr;
            len_t keyCount=thisBranch->keys.length;
            int64_t foundInx=-1;
            int64_t insertAt=0;

            if (keyCount) { // if there are keys
                //do binary search
                int64_t startInx = 0;
                int64_t endInx = keyCount-1; //point to last item
                int64_t key, middle;
                while(startInx<=endInx){
                    key = keys[middle=(startInx+endInx)/2];
                    if (composed==key){
                        foundInx=middle;
                        break;
                    }
                    else if(composed>key) { // GT keys[middle]
                        startInx=insertAt=middle+1;
                    }
                    else { // LT keys[middle]
                        endInx=(insertAt=middle)-1;
                    }
                }
            }

            if(foundInx>=0){ // FOUND match

                if (kpartCount>8) {
                    // key is longer, continue processing next branch
                    assert(thisBranch->values.itemSize=sizeof(void*));
                    thisBranch = ARR_ITEM(KeyTreeSortedBranch_ptr,foundInx,&thisBranch->values);
                    assert(thisBranch);
                }
                else { // Found, is a LEAFS BRANCH

                    assert(thisBranch->values.itemSize=sizeof(len_t));
                    len_t* foundLocation = ARR_ITEM_PTR(len_t,foundInx,&thisBranch->values);
                    len_t foundValue= *foundLocation;

                    switch(what){
                        case SET_KEY:
                            // replace value
                            *foundLocation = valueIndex;
                            break;
                        case REMOVE_KEY:
                            // remove key
                            _array_splice(&thisBranch->keys,foundInx,1,0,NULL);
                            // remove value
                            _array_splice(&thisBranch->values,foundInx,1,0,NULL);
                            break;
                    }

                    return foundValue; //return found value
                }

            }
            else {
                //not found
                if (what>=FIND_KEY) return -1;

                //else, what==SET_KEY|FIND_OR_INSERT, insert key at shouldBeAt position
                _array_splice(&thisBranch->keys,insertAt,0,1,&composed);
                assert(thisBranch->keys.length<100);

                //set value:  next_ptr|indexValue
                assert(insertAt <= thisBranch->values.length );
                if (kpartCount>8) {
                    // set next branch, continue processing key
                    KeyTreeSortedBranch_ptr newBranch = _newKeyTreeSortedBranch(kpartCount-8);
                    // add value(ptr)
                    assert(thisBranch->values.itemSize=sizeof(KeyTreeSortedBranch_ptr));
                    _array_splice(&thisBranch->values,insertAt,0,1,&newBranch);
                    thisBranch = newBranch; //continue there
                }
                else{
                    //end of key, value is valueIndex
                    // add valueIndex
                    assert(thisBranch->values.itemSize=sizeof(len_t));
                    _array_splice(&thisBranch->values,insertAt,0,1,&valueIndex);
                    return valueIndex; //return value added
                }

            }

            //process next chunk
            kpartStart += cpcount;
            kpartCount -= cpcount;

            assert(kpartCount);
        }

        //code should never reach here
        fatal("bug@keyTree");
    }
