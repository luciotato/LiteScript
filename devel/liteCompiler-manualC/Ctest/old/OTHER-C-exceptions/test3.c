/* No fitting ONs. */

#include <stdio.h>

#include "exception-local.h"

int
main (int argc, char **argv)
{
  try 
    {
      throw (1);
    }
  except
    {
      on (0)
	{
	  printf ("This shouldn't happen\n");
	}
    }
  exit (0);
}
