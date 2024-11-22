import { useEffect, useState } from "react";
import ToolList from "./components/ToolList";
import FilterBar from "./components/FilterBar";
import SortControl from "./components/SortControl";
import InactiveProjectsButton from "./components/InactiveProjectsButton";
import StatsModal from "./components/StatsModal";
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
  const [showOldTools, setShowOldTools] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Open Source CloudSec Tools";
  }, []);

  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const filteredTools = toolsData
    .filter((tool) => {
      // Filter for search query
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
      // Filter for language
      if (filterLanguage) {
        return tool.language === filterLanguage;
      }
      return true;
    })
    .filter((tool) => {
      // Filter for last updated more than 3 years ago
      if (!showOldTools) {
        return new Date(tool.last_commit) >= threeYearsAgo;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "stars") {
        return b.stars - a.stars;
      }
      if (sortKey === "last_commit") {
        return (
          new Date(b.last_commit).getTime() - new Date(a.last_commit).getTime()
        );
      }
      return 0;
    });

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col text-gray-900">
      <div className="max-w-8xl mx-auto p-4 flex-grow flex flex-col">
        <h1 className="text-3xl font-bold text-center mb-6">
          Open Source CloudSec Tools
        </h1>

        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-3/4 mx-auto mb-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <SortControl sortKey={sortKey} setSortKey={setSortKey} />
          <FilterBar
            filterLanguage={filterLanguage}
            setFilterLanguage={setFilterLanguage}
            availableLanguages={Array.from(
              new Set(toolsData.map((tool) => tool.language).filter(Boolean))
            )}
          />
          {/* Stats Link */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="block py-2.5 px-0 w-auto text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-400 rounded-none"
          >
            Stats
          </button>
          <div className="flex justify-center w-auto sm:w-auto">
            <InactiveProjectsButton
              showOldTools={showOldTools}
              setShowOldTools={setShowOldTools}
            />
          </div>
        </div>

        <div className="flex-grow flex flex-col">
          {filteredTools.length > 0 ? (
            <ToolList tools={filteredTools} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <p className="text-gray-500 text-lg">
                No results found. Try adjusting your search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Component */}
      <StatsModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        tools={toolsData}
      />
    </div>
  );
}