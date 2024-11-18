import React from "react";

type CategoryBadgesProps = {
  tools: { categories: string[] }[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
};

const CategoryBadges: React.FC<CategoryBadgesProps> = ({
  tools,
  selectedCategory,
  setSelectedCategory,
}) => {
  const allCategories = Array.from(
    new Set(tools.flatMap((tool) => tool.categories))
  ).sort();

  return (
    <div className="relative px-4 mt-4">
      {/* Scrollable container */}
      <div
        id="category-scroll"
        className="flex items-center overflow-x-auto space-x-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {allCategories.map((category) => (
          <button
            key={category}
            className={`whitespace-nowrap px-4 py-2 rounded-full border border-gray-300 text-sm ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-blue-100"
            }`}
            onClick={() =>
              setSelectedCategory(selectedCategory === category ? null : category)
            }
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBadges;