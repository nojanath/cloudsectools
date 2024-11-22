import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Tool } from "../App";
import { AiOutlineClose } from "react-icons/ai";

// Register required elements for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

type StatsModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  tools: Tool[];
};

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Go: "#00ADD8",
  "C++": "#00599C",
  Rust: "#DEA584",
  Java: "#F89820",
  TypeScript: "#3178C6",
  PHP: "#8892BF",
  HTML: "#E34F26",
  CSS: "#264DE4",
  Shell: "#89E051",
  Ruby: "#701516",
  Unknown: "#BDC3C7",
};

const StatsModal = ({ isOpen, onRequestClose, tools }: StatsModalProps) => {
  if (!isOpen) return null;

  const languageCounts = tools.reduce((acc: Record<string, number>, tool) => {
    if (tool.language) {
      acc[tool.language] = (acc[tool.language] || 0) + 1;
    } else {
      acc["Unknown"] = (acc["Unknown"] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedLanguages = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const othersCount = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(10)
    .reduce((acc, [, count]) => acc + count, 0);

  const languageLabels = [...sortedLanguages.map(([lang]) => lang), "Others"];
  const languageData = [
    ...sortedLanguages.map(([, count]) => count),
    othersCount,
  ];

  const languageBackgroundColor = languageLabels.map(
    (lang, index) => LANGUAGE_COLORS[lang] || `hsl(${index * 36}, 70%, 50%)`
  );

  const languageChartData = {
    labels: languageLabels.map(
      (lang, index) =>
        `${lang} - ${
          index === languageLabels.length - 1
            ? othersCount
            : sortedLanguages[index][1]
        }`
    ),
    datasets: [
      {
        data: languageData,
        backgroundColor: languageBackgroundColor,
        hoverBackgroundColor: languageBackgroundColor,
      },
    ],
  };

  const totalTools = tools.length;

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
      onClick={onRequestClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full transition-colors duration-200"
          onClick={onRequestClose}
          aria-label="Close"
        >
          <AiOutlineClose size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6">Tool Statistics</h2>

        <div className="mt-12">
          <h3 className="text-lg font-bold mb-4">Total Tool Count: {totalTools}</h3>
        </div>

        <div className="mb-12">
          <h3 className="text-lg font-bold mb-2">Languages</h3>
          <div className="w-full flex justify-center">
            <Pie data={languageChartData} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsModal;