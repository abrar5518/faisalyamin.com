import React from "react";

export default function Schema({ data }: { data: unknown }) {
  if (
    !data ||
    (typeof data === "object" &&
      !Array.isArray(data) &&
      Object.keys(data).length === 0)
  ) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
