import { Tool } from "../App";
import ToolCard from "./ToolCard";

type ToolListProps = {
  tools: Tool[];
};

export default function ToolList({ tools }: ToolListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[50vh]">
      {tools.length > 0 ? (
        tools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))
      ) : (
        <div className="col-span-full flex items-center justify-center">
          <p className="text-gray-500 text-lg">No results found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}