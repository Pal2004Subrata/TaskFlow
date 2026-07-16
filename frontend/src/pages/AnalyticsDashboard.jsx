import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { ArrowLeft, TrendingUp, CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const PRIORITY_COLORS = { 'Low': '#10b981', 'Medium': '#3b82f6', 'High': '#f59e0b', 'Critical': '#ef4444' };

const AnalyticsDashboard = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/analytics/${id}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center p-10">Failed to load analytics.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to={`/workspace/${id}`} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Advanced Analytics
          </h1>
        </div>
      </div>

      {/* Productivity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Completion Rate" value={`${data.productivity.completionRate}%`} icon={<CheckCircle className="text-emerald-500" />} />
        <Card title="Productivity Score" value={data.productivity.productivityScore} icon={<TrendingUp className="text-indigo-500" />} />
        <Card title="Pending Tasks" value={data.productivity.pendingTasks} icon={<Clock className="text-amber-500" />} />
        <Card title="Overdue Tasks" value={data.productivity.overdueTasks} icon={<AlertTriangle className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Task Distribution (Pie Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-800 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.taskDistribution} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {data.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Completion Trends (Line Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-800 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Completion Trends (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.completionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="_id" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-800 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Team Leaderboard & Workload</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium text-center">Completed</th>
                  <th className="pb-3 font-medium text-center">Overdue</th>
                  <th className="pb-3 font-medium">Workload (Total)</th>
                </tr>
              </thead>
              <tbody>
                {data.teamPerformance.map((member, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </td>
                    <td className="py-4 text-center text-emerald-500 font-semibold">{member.completedTasks}</td>
                    <td className="py-4 text-center text-rose-500 font-semibold">{member.overdueTasks}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, member.totalTasks * 10)}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{member.totalTasks}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-800 backdrop-blur-xl max-h-[400px] overflow-y-auto"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500"/> Activity Feed</h3>
          <div className="space-y-4">
            {data.activityTimeline.map((log) => (
              <div key={log._id} className="flex gap-3 text-sm">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                <div>
                  <p className="text-slate-800 dark:text-slate-200">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{log.user?.name || 'System'}</span> 
                    {' '}{log.action.replace('_', ' ').toLowerCase()}
                    {log.task?.title ? ` - ${log.task.title}` : ''}
                  </p>
                  <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {data.activityTimeline.length === 0 && (
              <p className="text-slate-500 text-sm italic">No recent activity.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-lg shadow-slate-200/30 dark:shadow-none flex items-center gap-4"
  >
    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </motion.div>
);

export default AnalyticsDashboard;
