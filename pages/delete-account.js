import React, { useEffect, useState } from 'react';
import { extractScrptTag } from "@/services/utility.service";

export default function DeleteAccount() {
  const [htmlData, setHtmlData] = useState('');


  useEffect(() => {
    fetch(`/delete-account.html`)
      .then((response) => response.text())
      .then((data) => {
        setHtmlData(data);
        extractScrptTag(data);
      })
      .catch((error) => {
      });
  }, []);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: htmlData }} />
    </>
  );
}
