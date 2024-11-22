type InactiveProjectsButtonProps = {
    showOldTools: boolean;
    setShowOldTools: React.Dispatch<React.SetStateAction<boolean>>;
  };
  
  export default function InactiveProjectsButton({
    showOldTools,
    setShowOldTools,
  }: InactiveProjectsButtonProps) {
    return (
      <button
        onClick={() => setShowOldTools(!showOldTools)}
        className="block py-2.5 px-0 w-auto text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-400 rounded-none"
      >
        {showOldTools ? "Hide Inactive Projects" : "Show Inactive Projects"}
      </button>
    );
  }