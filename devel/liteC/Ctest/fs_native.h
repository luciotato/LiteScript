#ifndef FSC_H
#define FSC_H

    #include "any.h"

    extern any fsc_stat(any this, len_t argc, any* arguments);

    extern any fsc_readFile(any this, len_t argc, any* arguments);

    extern any fsc_writeFile(any this, len_t argc, any* arguments);

#endif
