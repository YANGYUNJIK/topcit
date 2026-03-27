import { useEffect, useState } from "react";
import { Problem, ProblemCategory } from "@/src/types/problem";

interface CategorySidebarProps {
  selectedCategory: ProblemCategory | null;
  expandedCategory: ProblemCategory | null;
  onSelectCategory: (category: ProblemCategory) => void;
  onToggleCategory: (category: ProblemCategory) => void;
  problems: Problem[];
  currentIndex: number;
  onSelectProblem: (index: number) => void;
}

const categories: { key: ProblemCategory; label: string }[] = [
  { key: "M1", label: "M1. 소프트웨어 개발" },
  { key: "M2", label: "M2. 데이터 관리" },
  { key: "M3", label: "M3. 아키텍처와 정보보안" },
  { key: "M4", label: "M4. IT 비즈니스" },
  { key: "M5", label: "M5. IT비즈니스와 윤리" },
  { key: "M6", label: "M6. TC와 PM" },
  { key: "M7", label: "M7. 통합역량" },
];

const getProblemTypeLabel = (type: Problem["type"]) => {
  switch (type) {
    case "multiple":
      return "객관식";
    case "short":
      return "단답형";
    case "essay":
      return "서술형";
    case "code":
      return "소스코드";
    case "uml":
      return "다이어그램";
    default:
      return "";
  }
};

// 🔥 핵심: 20개 묶음
const CHUNK_SIZE = 20;

const chunkProblems = (problems: Problem[]) => {
  const chunks = [];

  for (let i = 0; i < problems.length; i += CHUNK_SIZE) {
    chunks.push({
      start: i + 1,
      end: Math.min(i + CHUNK_SIZE, problems.length),
      items: problems.slice(i, i + CHUNK_SIZE),
      startIndex: i,
    });
  }

  return chunks;
};

export default function CategorySidebar({
  selectedCategory,
  expandedCategory,
  onSelectCategory,
  onToggleCategory,
  problems,
  currentIndex,
  onSelectProblem,
}: CategorySidebarProps) {
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number | null>(
    null,
  );

  // 🔥 카테고리 바뀌면 초기화
  useEffect(() => {
    setSelectedChunkIndex(null);
  }, [expandedCategory, selectedCategory]);

  const groupedProblems = chunkProblems(problems);

  return (
    <aside className="rounded-2xl border bg-white p-4 text-gray-700 shadow">
      <div className="mb-10">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="text-2xl font-bold text-gray-900 hover:text-blue-600"
        >
          TOPCIT 에센스
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.key;
          const isExpanded = expandedCategory === category.key;

          return (
            <div
              key={category.key}
              className={`overflow-hidden rounded-xl border ${
                isSelected ? "border-blue-500" : "border-gray-300"
              }`}
            >
              <div
                className={`flex items-center gap-3 p-3 ${
                  isSelected
                    ? "bg-blue-50 text-blue-700"
                    : "bg-white text-gray-700"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(category.key);
                    onToggleCategory(category.key);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-md border text-xl font-bold"
                >
                  {isExpanded ? "-" : "+"}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCategory(category.key)}
                  className="flex-1 text-left text-lg font-semibold"
                >
                  {category.label}
                </button>
              </div>

              {/* 🔥 여기부터 핵심 변경 */}
              {isExpanded && isSelected && problems.length > 0 && (
                <div className="border-t bg-gray-50 p-3 space-y-3">
                  {/* 👉 묶음 버튼 */}
                  <div className="grid grid-cols-2 gap-2">
                    {groupedProblems.map((group, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedChunkIndex(index)}
                        className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-100"
                      >
                        {group.start} ~ {group.end}
                      </button>
                    ))}
                  </div>

                  {/* 👉 선택된 묶음 */}
                  {selectedChunkIndex !== null && (
                    <div className="max-h-72 overflow-y-auto rounded-lg border bg-white p-2">
                      {groupedProblems[selectedChunkIndex].items.map(
                        (problem, i) => {
                          const actualIndex =
                            groupedProblems[selectedChunkIndex].startIndex + i;

                          const isCurrent = actualIndex === currentIndex;

                          return (
                            <button
                              key={problem.id}
                              onClick={() => onSelectProblem(actualIndex)}
                              className={`mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 ${
                                isCurrent
                                  ? "border-blue-500 bg-blue-100 text-blue-700"
                                  : "border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-semibold">
                                {actualIndex + 1}번
                              </span>

                              <span className="text-xs font-semibold text-gray-600">
                                {getProblemTypeLabel(problem.type)}
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
