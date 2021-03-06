import React, { useState } from "react";
import useSWR from "swr";
import { Document } from "../index";
import { useDocumentURL } from "../hooks";
import { DocumentForm, DocumentOutData } from "./form";

import "./edit.scss";
import Link from "next/link";

export default function DocumentEdit() {
  // const location = useLocation();
  const documentURL = useDocumentURL();
  const fetchURL = `/_document?${new URLSearchParams({
    url: documentURL,
  }).toString()}`;
  const { data, error } = useSWR(fetchURL, async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} on ${url}`);
    }
    return await response.json();
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState<Error | null>(null);
  async function handleSave(data: DocumentOutData, didSlugChange: boolean) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/_document?url=${encodeURIComponent(documentURL)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        setSavingError(new Error(`${response.status} on ${response.url}`));
        return;
      }
      if (didSlugChange) {
        // Hack! We do a full-page transition so that the search index refreshes itself
        window.location.href =
          location.pathname.split("_edit")[0] + "_edit/" + data.metadata.slug;
      }
    } catch (err) {
      setSavingError(err);
    }
    setIsSaving(false);
  }

  return (
    <div className="document-edit">
      <h2>
        Edit view
        <Link href={documentURL}>
          <a className="close">close</a>
        </Link>
      </h2>

      {!data && !error && <p>Loading source data...</p>}
      {error && (
        <div className="attention">
          <h3>Error loading source</h3>
          <code>{error.toString()}</code>
        </div>
      )}
      {data && (
        <DocumentForm
          doc={data}
          {...{ isSaving, savingError }}
          onSave={handleSave}
        />
      )}
      {/*<Document />*/}
    </div>
  );
}
