export default function App() {
  return (
    <div style={{ backgroundColor: '#F5F2EB', color: '#2C302E' }} className="flex min-h-screen flex-col items-center justify-center p-6">
      <div style={{ borderColor: '#C3B091' }} className="text-center bg-white p-10 rounded-2xl shadow-xl border max-w-md">
        <h1 style={{ color: '#17342a' }} className="text-4xl font-bold tracking-tight mb-4">
          Resume Auto-Updater
        </h1>
        <p style={{ color: '#4a4e4b', opacity: 0.8 }} className="text-base mb-6">
          Frontend scaffold initialized with custom theme.
        </p>
        <button 
          style={{ backgroundColor: '#8A9A86' }} 
          className="px-6 py-3 rounded-xl text-white font-medium shadow-md transition-all duration-200 hover:opacity-90 cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}