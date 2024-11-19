import { useEffect, useState } from "react";
import ToolList from "./components/ToolList";
import FilterBar from "./components/FilterBar";
import SortControl from "./components/SortControl";
import toolsData from "./data/tools.json";

export type Tool = {
  name: string;
  repo: string;
  stars: number;
  last_commit: string;
  language: string;
  install_options: string[];
  description: string;
  tags: string[];
  categories: string[];
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [sortKey, setSortKey] = useState<"" | keyof Tool>("");

  useEffect(() => {
    document.title = "Open Source Cloud Security Tools";
  }, []); // Runs only once on component mount

  const filteredTools = toolsData
    .filter((tool) => {
      if (searchQuery) {
        return (
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
      return true;
    })
    .filter((tool) => {
      if (filterLanguage) {
        return tool.language === filterLanguage;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "stars") {
        return b.stars - a.stars;
      }
      if (sortKey === "last_commit") {
        return new Date(b.last_commit).getTime() - new Date(a.last_commit).getTime();
      }
      return 0;
    });

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col text-gray-900">
      <div className="max-w-8xl mx-auto p-4 flex-grow flex flex-col">
        <h1 className="text-3xl font-bold text-center mb-6">Open Source Cloud Security Tools</h1>

        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
          <SortControl sortKey={sortKey} setSortKey={setSortKey} />
          <FilterBar
            filterLanguage={filterLanguage}
            setFilterLanguage={setFilterLanguage}
            availableLanguages={Array.from(
              new Set(toolsData.map((tool) => tool.language).filter(Boolean))
            )}
          />
        </div>

        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Category Selection */}
        {/* <div className="flex flex-wrap gap-2 mb-6">
          {Array.from(
            new Set(toolsData.flatMap((tool) => tool.categories))
          ).map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category ? null : category
                )
              }
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div> */}

        <div className="flex-grow flex flex-col">
          {filteredTools.length > 0 ? (
            <ToolList tools={filteredTools} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <p className="text-gray-500 text-lg">No results found. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
