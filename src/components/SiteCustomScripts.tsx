"use client";

import { useEffect } from "react";
import { sanitizeCustomScriptHtml } from "@/lib/trackingSettings";

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
    const cleanHeadHtml = sanitizeCustomScriptHtml(headHtml);
    const cleanBodyStartHtml = sanitizeCustomScriptHtml(bodyStartHtml);
    const cleanBodyEndHtml = sanitizeCustomScriptHtml(bodyEndHtml);
    const appendedNodes = [
      ...(cleanHeadHtml ? appendHtml(document.head, cleanHeadHtml) : []),
      ...(cleanBodyStartHtml ? appendHtml(document.body, cleanBodyStartHtml, true) : []),
      ...(cleanBodyEndHtml ? appendHtml(document.body, cleanBodyEndHtml) : []),
    ];

    return () => {
      for (const node of appendedNodes) {
        node.parentNode?.removeChild(node);
      }
    };
  }, [headHtml, bodyStartHtml, bodyEndHtml]);

  return null;
}
