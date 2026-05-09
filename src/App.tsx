import './index.css'; // Ensure this is imported either here or in main.tsx

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Spreadsheet Engine
        </h1>
        <p className="text-gray-600">
          Tailwind is successfully configured and running.
        </p>
      </div>
    </div>
  );
}

export default App;