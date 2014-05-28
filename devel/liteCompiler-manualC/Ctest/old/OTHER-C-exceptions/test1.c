/* One RAISE inside one TRY. */

#include <stdio.h>

#include "exception-local.h"

int
main (int argc, char **argv)
{
  int i, j;

  try
    {
      i = 100;
      j = 200;
      if (i / j == 0)
	{
	  throw (0);
	}
    }
  except
    {
      on (0)
	{
	  printf ("Exception handled. OK.\n");
	  exit (0);
	}
    }

  exit (1);
}
