"use client";

import { useEffect } from "react";

function enhanceRichTextTables(root: ParentNode = document) {
  const tables = root.querySelectorAll<HTMLTableElement>(".rt-content table");

  tables.forEach((table) => {
    if (table.closest(".rt-table-scroll")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "rt-table-scroll";

    const hint = document.createElement("p");
    hint.className = "rt-table-hint";
    hint.textContent = "Swipe to see more ->";

    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    wrapper.appendChild(hint);
  });
}

export default function RichTextTableEnhancer() {
  useEffect(() => {
    enhanceRichTextTables();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;

          if (node.matches(".rt-content") || node.querySelector(".rt-content table")) {
            enhanceRichTextTables(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <span hidden data-rt-table-enhancer="" />;
}
