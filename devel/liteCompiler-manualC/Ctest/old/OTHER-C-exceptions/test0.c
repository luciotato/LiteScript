#include <stdio.h>
#include "exception-local.h"

#define DIVISION_BY_ZERO 1001

int divide (int a, int b) {
  if (b == 0) {
    throw (DIVISION_BY_ZERO);
  } else {
    return a/b;
  }
}

int main (int argc, char **argv)
{
  int i, j;

  try {
    printf ("%d\n", divide (100, 0));
  } except {
    on (DIVISION_BY_ZERO) {
      printf ("Caught up division by zero.\n");
	    exit (0);
    }
  }
  return 0;
}
