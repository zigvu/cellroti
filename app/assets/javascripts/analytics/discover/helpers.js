/*------------------------------------------------
  Helpers
  Note:
  Since this page has no namespace, unless called from several namespaces,
  do not place functions here.
  ------------------------------------------------*/

  // return true if same date within a second
  function isSameDate(d1, d2){
    return (Math.abs(d1.getTime() - d2.getTime()) < 1000);
  }

//------------------------------------------------
