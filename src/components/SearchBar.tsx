export default function SearchBar({
    searchQuery,
    setSearchQuery,
  }: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  }) {
    return (
      <input
        type="text"
        placeholder="Search tools..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full borde border-gray-300 rounded-md p-2 bg-white text-black mt-4"
      />
    );
  }