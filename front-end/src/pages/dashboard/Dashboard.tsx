import { useState } from "react";
import useSWR from "swr";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { taskApi } from "../../api/task.api";
import { NavLink } from "react-router-dom";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  
  // SWR fetchers
  const dashboardFetcher = () => taskApi.getDashboardData();
  const tasksFetcher = () => taskApi.getAllTasks();

  // Use SWR for data fetching
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useSWR(
    "dashboard",
    dashboardFetcher
  );
  
  const { data: allTasks, error: tasksError, isLoading: tasksLoading } = useSWR(
    "tasks",
    tasksFetcher
  );

  // Compute recent tasks from SWR data
  const recentTasks = allTasks
    ? [...allTasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  const loading = dashboardLoading || tasksLoading;
  const error = dashboardError || tasksError;

  // Calculate completion rate
  const completionRate = dashboardData?.totalTask
    ? Math.round(
        ((dashboardData.statusCounts.find(s => s._id === "Completed")?.count || 0) /
          dashboardData.totalTask) *
          100
      )
    : 0;

  // Get completed tasks count
  const completedTasks = dashboardData?.statusCounts.find(s => s._id === "Completed")?.count || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64">
            <Sidebar />
          </div>
          <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            
            <div className="animate-pulse space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-5 md:p-6">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              
              {/* Charts and Recent Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 md:p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 md:p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64">
            <Sidebar />
          </div>
          <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error loading dashboard</h3>
                <p className="text-red-700 mb-4">{error.message || error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="flex flex-col md:flex-row">
        <div className="md:w-64">
          <Sidebar />
        </div>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {/* Total Tasks Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 transition-transform hover:scale-[1.02]">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalTask || 0}</p>
                </div>
              </div>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 transition-transform hover:scale-[1.02]">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                </div>
              </div>
            </div>

            {/* Overdue Tasks Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 transition-transform hover:scale-[1.02]">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData?.overdueTasks || 0}</p>
                </div>
              </div>
            </div>

            {/* Completion Rate Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 transition-transform hover:scale-[1.02]">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Recent Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Tasks by Status Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Tasks by Status</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setTimeRange("week")}
                    className={`px-3 py-1 text-xs rounded-full ${timeRange === "week" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setTimeRange("month")}
                    className={`px-3 py-1 text-xs rounded-full ${timeRange === "month" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setTimeRange("year")}
                    className={`px-3 py-1 text-xs rounded-full ${timeRange === "year" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {dashboardData?.statusCounts.map((status) => (
                  <div key={status._id} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-lg font-semibold text-gray-800">{status.count}</div>
                    <div className="text-sm text-gray-600 mt-1">{status._id}</div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${dashboardData?.totalTask ? (status.count / dashboardData.totalTask) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent Tasks</h2>
                <NavLink to="/tasks">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All
                  </button>
                </NavLink>
              </div>
              
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <p className="text-gray-600">No recent tasks</p>
                  <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Create your first task
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task._id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{task.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {task.status}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
