"use client";

import { Plus, Trash2 } from "lucide-react";

export type AdminFaqItem = {
  question: string;
  answer: string;
};

type FaqEditorProps = {
  value: AdminFaqItem[];
  onChange: (items: AdminFaqItem[]) => void;
  title?: string;
  hint?: string;
};

function blankFaq(): AdminFaqItem {
  return { question: "", answer: "" };
}

export function cleanFaqItems(items: AdminFaqItem[]) {
  return items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
}

export default function FaqEditor({
  value,
  onChange,
  title = "FAQs",
  hint = "Add SEO-friendly questions and answers for this page.",
}: FaqEditorProps) {
  const items = value.length ? value : [blankFaq()];

  function updateItem(index: number, patch: Partial<AdminFaqItem>) {
    onChange(items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    const next = items.filter((_, idx) => idx !== index);
    onChange(next.length ? next : [blankFaq()]);
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-neutral-500">{hint}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, blankFaq()])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add more
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-neutral-700">FAQ {index + 1}</p>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                aria-label={`Remove FAQ ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-neutral-700">Question</label>
              <input
                value={item.question}
                onChange={(e) => updateItem(index, { question: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                placeholder="What is your delivery time?"
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-neutral-700">Answer</label>
              <textarea
                value={item.answer}
                onChange={(e) => updateItem(index, { answer: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                rows={3}
                placeholder="Write a clear answer customers can understand."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
