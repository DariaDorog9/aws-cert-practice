"use client";

import { useEffect, useMemo, useState } from "react";
import { Question } from "@/types";

interface QuestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  questionStatusMap: Record<number, "correct" | "wrong">;
  currentIndex: number;
  onJumpToQuestion: (index: number) => void;
}

export function QuestionDrawer({
  isOpen,
  onClose,
  questions,
  questionStatusMap,
  currentIndex,
  onJumpToQuestion,
}: QuestionDrawerProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const groupedQuestions = useMemo(() => {
    const groups: { category: string; items: { question: Question; index: number }[] }[] = [];
    const categoryMap = new Map<string, { question: Question; index: number }[]>();

    questions.forEach((q, index) => {
      const cat = q.category || "Uncategorized";
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push({ question: q, index });
    });

    categoryMap.forEach((items, category) => {
      groups.push({ category, items });
    });

    groups.sort((a, b) => a.category.localeCompare(b.category));
    return groups;
  }, [questions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-sm overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-aws-dark px-4 py-3 text-white">
          <h2 className="font-semibold">All Questions</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {groupedQuestions.map((group) => {
          const isCollapsed = collapsedCategories.has(group.category);
          const correctInGroup = group.items.filter(
            ({ question: q }) => questionStatusMap[q.id] === "correct"
          ).length;
          const wrongInGroup = group.items.filter(
            ({ question: q }) => questionStatusMap[q.id] === "wrong"
          ).length;
          const answeredInGroup = correctInGroup + wrongInGroup;
          return (
            <div key={group.category}>
              <button
                onClick={() => toggleCategory(group.category)}
                className="sticky top-[52px] z-[5] flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {group.category}
                  </span>
                  {answeredInGroup > 0 && (
                    <span className="mt-0.5 text-[11px] text-gray-400">
                      <span className="text-correct">{correctInGroup}</span>
                      {" / "}
                      <span className="text-incorrect">{wrongInGroup}</span>
                      {" / "}
                      {group.items.length}
                    </span>
                  )}
                  {answeredInGroup === 0 && (
                    <span className="mt-0.5 text-[11px] text-gray-400">
                      {group.items.length} questions
                    </span>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {!isCollapsed && (
                <ul className="divide-y divide-gray-100">
                  {group.items.map(({ question: q, index }) => {
                    const status = questionStatusMap[q.id];
                    const isCurrent = index === currentIndex;
                    const truncated =
                      q.question.length > 80
                        ? q.question.slice(0, 80) + "..."
                        : q.question;

                    return (
                      <li key={q.id}>
                        <button
                          onClick={() => {
                            onJumpToQuestion(index);
                            onClose();
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                            isCurrent ? "bg-blue-50" : ""
                          }`}
                        >
                          <span className="mt-0.5 flex-shrink-0">
                            {status === "correct" && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-correct">
                                &#10003;
                              </span>
                            )}
                            {status === "wrong" && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-incorrect">
                                &#10007;
                              </span>
                            )}
                            {!status && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                                &#8226;
                              </span>
                            )}
                          </span>
                          <span
                            className={`text-sm ${
                              isCurrent
                                ? "font-medium text-aws-dark"
                                : "text-gray-700"
                            }`}
                          >
                            {truncated}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
