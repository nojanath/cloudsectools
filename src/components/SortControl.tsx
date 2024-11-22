import { Tool } from "../App";

type SortControlProps = {
  sortKey: keyof Tool | "";
  setSortKey: (key: keyof Tool | "") => void;
};

export default function SortControl({ sortKey, setSortKey }: SortControlProps) {
  return (
    <form className="max-w-sm relative">
      <label htmlFor="sort_by_select" className="sr-only">
        Sort By
      </label>
      <div className="relative">
        <select
          id="sort_by_select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as keyof Tool | "")}
          className="block py-2.5 pl-3 pr-10 w-auto text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-400 peer"
          style={{
            WebkitAppearance: "none", // Ensures no native dropdown on Safari
            MozAppearance: "none", // Ensures no native dropdown on Firefox
            appearance: "none", // Ensures no native dropdown on modern browsers
          }}
        >
          <option value="" disabled>
            Sort By
          </option>
          <option value="stars">GitHub Stars</option>
          <option value="last_commit">Last Update</option>
          <option value="name">Name</option>
        </select>
      </div>
    </form>
  );
}