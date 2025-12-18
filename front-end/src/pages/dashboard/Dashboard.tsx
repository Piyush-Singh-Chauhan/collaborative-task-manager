import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Dashboard
          </h2>

          <p className="text-gray-600">
            Welcome to your dashboard. Task stats will appear here.
          </p>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
