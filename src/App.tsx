import { useEffect, useState } from "react";
import ToolList from "./components/ToolList";
import FilterBar from "./components/FilterBar";
import SortControl from "./components/SortControl";
import InactiveProjectsButton from "./components/InactiveProjectsButton";
import StatsModal from "./components/StatsModal";
import PromoBanner from "./components/PromoBanner";
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
      <PromoBanner />
      <div className="max-w-8xl mx-auto p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-3xl font-bold text-center">CloudSec Tools</h1>
          <a
            href="https://github.com/nojanath/cloudsectools"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.49 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.61.07-.61 1 .07 1.53 1.04 1.53 1.04.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.04-2.69-.1-.26-.45-1.28.1-2.67 0 0 .84-.27 2.75 1.03a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.41.1 2.67.65.7 1.04 1.6 1.04 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.69.92.69 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.16.59.67.49A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
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
