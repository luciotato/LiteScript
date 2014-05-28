/* Nesting catchers. */

#include <stdio.h>

#include "exception-local.h"

int
main (int argc, char **argv)
{
  try
    {
      try
	{
	  try
	    {
	      throw (0);
	    }
	  catch
	    on (0)
	      printf ("0 catched. OK.\n");

	  throw (1);
	}
      catch
	{
	  on (1)
	    printf ("1 catched. OK.\n");
	}

      throw (2);
    }
  catch
    {
      on (2)
	printf ("2 catched. OK.\n");
    }

  throw (3);
	   
  exit (0);
}
