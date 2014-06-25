#ifndef FSC_H
#define FSC_H

    #include "any.h"

    extern any fsc_stat(any this, len_t argc, any* arguments);

    extern any fsc_readfile(any this, len_t argc, any* arguments);

    extern any fsc_writefile(any this, len_t argc, any* arguments);

#endif
