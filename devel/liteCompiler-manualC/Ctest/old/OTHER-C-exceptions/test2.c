
/* A few separate TRY blocks with THROWs in them.
   And also one THROW outside. */

#include <stdio.h>

#include "exception-local.h"

int
main (int argc, char **argv)
{
  try
    {
      throw (0);
    }
  except
    {
      on (0)
	{
	  printf ("Exception 1 handled. OK.\n");
	}
    }

  try
    {
      throw (1);
    }
  except
    {
      on (1)
	{
	  printf ("Exception 2 handled. OK.\n");
	}
    }

  throw (2);
  exit (0);
}
