"use client";

import { Problem } from "@/src/types/problem";

interface AnswerInputProps {
  problem: Problem;
  value: string;
  onChange: (value: string) => void;
  gradingResult?: "correct" | "wrong" | null;
}

export default function AnswerInput({
  problem,
  value,
  onChange,
  gradingResult = null,
}: AnswerInputProps) {
  const resultStyle =
    gradingResult === "correct"
      ? "border-green-400 bg-green-50"
      : gradingResult === "wrong"
        ? "border-red-400 bg-red-50"
        : "border-gray-300 bg-white";

  if (problem.type === "multiple") {
    return (
      <div className="flex flex-col gap-3">
        {problem.choices?.map((choice, index) => {
          const choiceNumber = String(index + 1);
          const isSelected = value === choiceNumber;

          const choiceStyle = isSelected
            ? gradingResult === "correct"
              ? "border-green-500 bg-green-100"
              : gradingResult === "wrong"
                ? "border-red-500 bg-red-100"
                : "border-blue-500 bg-blue-100"
            : "border-gray-400 bg-gray-100 hover:bg-gray-200";

          return (
            <label
              key={`${problem.id}-${index}`}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-gray-900 transition ${choiceStyle}`}
            >
              <input
                type="radio"
                name={`problem-${problem.id}`}
                value={choiceNumber}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4"
              />
              <span className="font-medium text-gray-900">
                {index + 1}. {choice}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  if (problem.type === "short") {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="답을 입력하세요"
        className={`w-full rounded-lg text-gray-900 border p-3 outline-none transition ${resultStyle}`}
      />
    );
  }

  if (problem.type === "essay") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="서술형 답안을 입력하세요"
        rows={8}
        className={`w-full rounded-lg text-gray-900 border p-3 outline-none transition ${resultStyle}`}
      />
    );
  }

  if (problem.type === "code") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="코드를 입력하세요"
        rows={14}
        className={`w-full rounded-lg text-gray-900 border p-3 font-mono outline-none transition ${resultStyle}`}
      />
    );
  }

  return null;
}
