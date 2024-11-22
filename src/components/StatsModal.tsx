import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

type Tool = {
  language: string;
  last_commit: string;
};

type StatsModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  tools: Tool[];
};

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onRequestClose, tools }) => {
  // Calculate language stats
  const languageStats = tools.reduce((acc: Record<string, number>, tool) => {
    acc[tool.language] = (acc[tool.language] || 0) + 1;
    return acc;
  }, {});

  const sortedLanguages = Object.entries(languageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate age stats
  const today = new Date();
  const ageStats = {
    "New (within 1 year)": 0,
    "1-3 years old": 0,
    "3-5 years old": 0,
    "5+ years old": 0,
  };

  tools.forEach((tool) => {
    const lastCommitDate = new Date(tool.last_commit);
    const ageInYears = (today.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (ageInYears <= 1) ageStats["New (within 1 year)"]++;
    else if (ageInYears <= 3) ageStats["1-3 years old"]++;
    else if (ageInYears <= 5) ageStats["3-5 years old"]++;
    else ageStats["5+ years old"]++;
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Tool Stats"
      className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <h2 className="text-2xl font-bold mb-4">Tool Stats</h2>

      {/* Language Stats */}
      <h3 className="text-lg font-semibold mb-2">Top Languages</h3>
      <ul className="mb-4">
        {sortedLanguages.map(([language, count]) => (
          <li key={language} className="text-gray-700">
            {language}: {count} tools
          </li>
        ))}
      </ul>

      {/* Age Stats */}
      <h3 className="text-lg font-semibold mb-2">Tool Age</h3>
      <ul>
        {Object.entries(ageStats).map(([ageRange, count]) => (
          <li key={ageRange} className="text-gray-700">
            {ageRange}: {count} tools
          </li>
        ))}
      </ul>

      {/* Close Button */}
      <button
        onClick={onRequestClose}
        className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
      >
        Close
      </button>
    </Modal>
  );
};

export default StatsModal;