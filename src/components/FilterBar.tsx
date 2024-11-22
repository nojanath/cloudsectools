type FilterBarProps = {
  filterLanguage: string;
  setFilterLanguage: (language: string) => void;
  availableLanguages: string[];
};

export default function FilterBar({
  filterLanguage,
  setFilterLanguage,
  availableLanguages,
}: FilterBarProps) {
  const sortedLanguages = [...availableLanguages].sort((a, b) => a.localeCompare(b));

  return (
    <form className="max-w-sm">
      <label htmlFor="language_select" className="sr-only">
        Programming Language
      </label>
      <select
        id="language_select"
        value={filterLanguage}
        onChange={(e) => setFilterLanguage(e.target.value)}
        className="block py-2.5 pr-10 px-0 w-auto text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-400 peer"
      >
        <option value="">All Languages</option>
        {sortedLanguages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
    </form>
  );
}