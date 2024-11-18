export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="bg-white text-black min-h-screen flex flex-col items-center">
        <header className="bg-gray-800 text-white px-4 py-4 w-full">
          <h1 className="text-3xl font-bold text-center">Cloud Security Tools</h1>
        </header>
        <main className="w-full max-w-8xl px-4 py-8">{children}</main>
      </div>
    );
  }
