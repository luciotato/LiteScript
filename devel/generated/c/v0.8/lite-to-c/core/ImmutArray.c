/** Immutable Arays - ImmutArrray
 * core support for Lite-to-c compiled code
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
 */

/** ALPHA */
#ifdef ALPHA_CODE
#include "LiteC-core.h"

    void _ImmutArray_realloc(any* arr, uint64_t newLen64){
        if (newLen64>=UINT32_MAX) fatal("Array too large");
        size_t newLen=newLen64, newSize,actualAllocd,byLenAllocd;
        newSize = newLen*sizeof(any);

        actualAllocd = arr->res * MEMUNIT;
        byLenAllocd = arr->len*sizeof(any);
        if byLenAllocd>actualAllocd { //large array, GT 262,144 items.
            actualAllocd = byLenAllocd;
        }
        //else{ //normal array, LT UINT32_MAX*MEMUNIT bytes, LT 262,144 items.

        arr->len = newLen;

        //realloc if required or of we're freeing at least 64kb
        if (actualAllocd < newSize || actualAllocd-newSize >= 64*1024){
            if (newSize>=(MAX_UINT16-1)*MEMUNIT) {// large array, max-out .res
                arr->res =MAX_UINT16;
                //re-alloc exactly newSize
            }
            else { //normal array
                newSize = ((newSize/MEMUNIT)+1)*MEMUNIT; //realloc in blocks of MEMUNIT
                arr->res = newSize/MEMUNIT;
            }
            //realloc
            arr->value.ptr = mem_realloc(arr->value.ptr, newSize);
        }
    }

#endif