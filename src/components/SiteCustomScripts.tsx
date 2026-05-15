"use client";

import { useEffect } from "react";

type SiteCustomScriptsProps = {
  headHtml?: string | null;
  bodyStartHtml?: string | null;
  bodyEndHtml?: string | null;
};

function appendHtml(target: HTMLElement, html: string, atStart = false) {
  const template = document.createElement("template");
  template.innerHTML = html;

  const appended: Node[] = [];
  const nodes = Array.from(template.content.childNodes);
  const insertBeforeNode = atStart ? target.firstChild : null;

  for (const node of nodes) {
    let nextNode = node;

    if (node.nodeName.toLowerCase() === "script") {
      const sourceScript = node as HTMLScriptElement;
      const script = document.createElement("script");

      for (const attr of Array.from(sourceScript.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }

      script.text = sourceScript.text;
      nextNode = script;
    }

    if (atStart) {
      target.insertBefore(nextNode, insertBeforeNode);
    } else {
      target.appendChild(nextNode);
    }

    appended.push(nextNode);
  }

  return appended;
}

export default function SiteCustomScripts({
  headHtml,
  bodyStartHtml,
  bodyEndHtml,
}: SiteCustomScriptsProps) {
  useEffect(() => {
    const appendedNodes = [
      ...(headHtml?.trim() ? appendHtml(document.head, headHtml.trim()) : []),
      ...(bodyStartHtml?.trim() ? appendHtml(document.body, bodyStartHtml.trim(), true) : []),
      ...(bodyEndHtml?.trim() ? appendHtml(document.body, bodyEndHtml.trim()) : []),
    ];

    return () => {
      for (const node of appendedNodes) {
        node.parentNode?.removeChild(node);
      }
    };
  }, [headHtml, bodyStartHtml, bodyEndHtml]);

  return null;
}
