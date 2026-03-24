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
    default:
      return "";
  }
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
  return (
    <aside className="rounded-2xl border bg-white p-4 text-gray-700 shadow">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900">TOPCIT 에센스</h2>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.key;
          const isExpanded = expandedCategory === category.key;

          return (
            <div
              key={category.key}
              className={`overflow-hidden rounded-xl border transition ${
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-current text-xl font-bold transition hover:bg-white/70"
                >
                  {isExpanded ? "-" : "+"}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCategory(category.key)}
                  className="flex-1 text-left text-lg font-semibold transition hover:opacity-80"
                >
                  {category.label}
                </button>
              </div>

              {isExpanded && isSelected && problems.length > 0 && (
                <div className="border-t bg-gray-50 p-3">
                  <div className="flex flex-col gap-2">
                    {problems.map((problem, index) => {
                      const isCurrent = index === currentIndex;

                      return (
                        <button
                          key={problem.id}
                          type="button"
                          onClick={() => onSelectProblem(index)}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                            isCurrent
                              ? "border-blue-500 bg-blue-100 text-blue-700"
                              : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-semibold">{index + 1}번</span>

                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${
                              isCurrent
                                ? "bg-blue-200 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getProblemTypeLabel(problem.type)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
