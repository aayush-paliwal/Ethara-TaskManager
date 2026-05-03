import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, ListTodo, FolderKanban, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface Metrics {
  totalTasks: number;
  myTasksCount: number;
  overdueTasksCount: number;
  tasksByStatus: { status: string; count: number }[];
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard');
        setMetrics(res.data.metrics);
      } catch (error) {
        console.error('Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  const inProgressCount = metrics?.tasksByStatus.find(s => s.status === 'IN_PROGRESS')?.count || 0;
  const doneCount = metrics?.tasksByStatus.find(s => s.status === 'DONE')?.count || 0;

  const stats = [
    { title: 'Total Tasks', value: metrics?.totalTasks || 0, icon: FolderKanban, color: 'text-blue-500' },
    { title: 'My Tasks', value: metrics?.myTasksCount || 0, icon: CheckSquare, color: 'text-primary' },
    { title: 'In Progress', value: inProgressCount, icon: ListTodo, color: 'text-amber-500' },
    { title: 'Completed', value: doneCount, icon: CheckSquare, color: 'text-green-500' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1">Here is a summary of your tasks and projects.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {metrics && metrics.overdueTasksCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Clock className="h-5 w-5 text-destructive mr-2" />
              <CardTitle className="text-destructive">Attention Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-destructive">
                You have {metrics.overdueTasksCount} overdue tasks that require immediate attention.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
