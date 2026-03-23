import { ProblemCategory } from "@/src/types/problem";

interface CategorySidebarProps {
  selectedCategory: ProblemCategory;
  onSelectCategory: (category: ProblemCategory) => void;
}

const categories: { key: ProblemCategory; label: string }[] = [
  { key: "M1", label: "M1. 소프트웨어 개발" },
  { key: "M2", label: "M2. 데이터 관리" },
  { key: "M3", label: "M3. 시스템 아키텍처와 정보보안" },
  { key: "M4", label: "M4. IT 비즈니스" },
  { key: "M5", label: "M5. IT비즈니스와 윤리" },
  { key: "M6", label: "M6. TC와 PM" },
  { key: "M7", label: "M7. 통합역량" },
];

export default function CategorySidebar({
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="w-full rounded-2xl border bg-white p-4 shadow">
      <h2 className="mb-4 text-2xl font-bold">문항 목록</h2>

      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => onSelectCategory(category.key)}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left font-semibold transition ${
              selectedCategory === category.key
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center border text-xl font-bold">
              +
            </span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
