/* It is nice to see how stack gets popped automatically;) */

#include <stdio.h>

#include "exception-local.h"

int
main (int argc, char **argv)
{
  volatile int i;

  try
    {
      printf ("I set I to be the unity!\n");
      i = 1;
    }
  /* I mean popped just here. */

  exit (1 - i);
}
