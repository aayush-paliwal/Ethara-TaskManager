import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, AlertCircle, CalendarDays, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string | null;
  project: { id: string; name: string };
  creator: { id: string; name: string };
}

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/tasks/my');
      setTasks(res.data.tasks);
    } catch (error) {
      console.error('Failed to fetch my tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status', error);
      fetchMyTasks();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'DONE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-neutral-200 text-neutral-600';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
        <p className="text-muted-foreground mt-2">View all your assigned tasks across projects.</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : tasks.length === 0 ? (
        <div className="mt-12 text-center py-24 px-4 border-2 border-dashed rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
            <CheckSquare className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">You don't have any tasks assigned to you right now. Take a break or check your projects to see what's coming up.</p>
        </div>
      ) : (
        <div className="grid gap-4 mt-8">
          <AnimatePresence>
            {tasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-neutral-950 p-5 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[8px]">
                        {task.creator.name.charAt(0).toUpperCase()}
                      </div>
                      Created by {task.creator.name}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-lg leading-tight mb-1 truncate">{task.title}</h4>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <Link to={`/projects/${task.project.id}`} className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium px-2 py-1 bg-neutral-100 dark:bg-neutral-900 rounded-md">
                      Project: {task.project.name}
                    </Link>
                    
                    <div className="flex items-center gap-1.5">
                      {task.priority === 'HIGH' && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}
                      {task.priority === 'MEDIUM' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      {task.priority === 'LOW' && <AlertCircle className="w-3.5 h-3.5 text-blue-500" />}
                      <span className="uppercase font-medium">{task.priority}</span>
                    </div>

                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 hidden sm:flex">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-3 shrink-0">
                  <Select onValueChange={(val) => updateTaskStatus(task.id, val)} defaultValue={task.status}>
                    <SelectTrigger className="h-9 w-[130px] font-medium text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
