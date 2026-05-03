import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';


interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee: { id: string; name: string } | null;
  dueDate: string | null;
}

interface ProjectDetails {
  id: string;
  name: string;
  members: { role: string; user: { id: string; name: string } }[];
}

export default function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', assigneeId: 'unassigned' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  const user = useAuthStore(state => state.user);
  
  const isAdmin = project?.members.find(m => m.user.id === user?.id)?.role === 'ADMIN';

  const fetchBoardData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks?projectId=${projectId}`)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (error) {
      console.error('Failed to fetch board data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...newTask,
        projectId,
        assigneeId: newTask.assigneeId === 'unassigned' ? undefined : newTask.assigneeId,
      });
      toast.success('Task created successfully!');
      setIsTaskDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assigneeId: 'unassigned' });
      fetchBoardData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/members`, { email: newMemberEmail });
      toast.success('Member added successfully!');
      setIsMemberDialogOpen(false);
      setNewMemberEmail('');
      fetchBoardData();
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status', error);
      fetchBoardData(); // Revert on failure
    }
  };

  const updateTaskAssignee = async (taskId: string, newAssigneeId: string) => {
    try {
      const actualAssigneeId = newAssigneeId === 'unassigned' ? null : newAssigneeId;
      const newAssignee = newAssigneeId === 'unassigned' ? null : project?.members.find(m => m.user.id === newAssigneeId)?.user || null;
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, assignee: newAssignee as any } : t));
      await api.patch(`/tasks/${taskId}`, { assigneeId: actualAssigneeId });
    } catch (error) {
      console.error('Failed to update assignee', error);
      fetchBoardData();
    }
  };

  const renderColumn = (status: string, title: string, colorClass: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
            {title}
          </h3>
          <span className="text-sm font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
          <AnimatePresence>
            {columnTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-950 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm leading-snug mb-2">{task.title}</h4>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Select disabled={!isAdmin && task.assignee?.id !== user?.id} onValueChange={(val) => updateTaskStatus(task.id, val)} defaultValue={task.status}>
                      <SelectTrigger className="h-6 px-2 text-xs w-[100px]">
                        <SelectValue placeholder="Move" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {task.priority === 'HIGH' && <AlertCircle className="w-3 h-3 text-destructive" />}
                    {task.priority === 'MEDIUM' && <AlertCircle className="w-3 h-3 text-amber-500" />}
                    {task.priority === 'LOW' && <AlertCircle className="w-3 h-3 text-blue-500" />}
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{task.priority}</span>
                  </div>
                  
                  {isAdmin ? (
                    <Select onValueChange={(val) => updateTaskAssignee(task.id, val)} defaultValue={task.assignee?.id || "unassigned"}>
                      <SelectTrigger className="h-6 border-none bg-transparent shadow-none p-0 focus:ring-0 w-auto justify-end">
                        {task.assignee ? (
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]" title={task.assignee.name}>
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-dashed border-neutral-300 flex items-center justify-center text-[10px] text-muted-foreground" title="Unassigned">+</div>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {project?.members.map(m => (
                          <SelectItem key={m.user.id} value={m.user.id}>{m.user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    task.assignee && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]" title={task.assignee.name}>
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (!project) return <div className="p-8 text-center text-destructive">Project not found or access denied.</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center -space-x-2">
              {project.members.map((m, i) => (
                <div key={m.user.id} className="w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center font-bold text-xs" title={m.user.name}>
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            
            {isAdmin && (
              <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>Invite a user to this project by their email address.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddMember} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">User Email</Label>
                      <Input id="email" type="email" required value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Invite User</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {isAdmin && (
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className='cursor-pointer'>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input id="title" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select onValueChange={v => setNewTask({...newTask, priority: v})} defaultValue={newTask.priority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select onValueChange={v => setNewTask({...newTask, assigneeId: v})} defaultValue={newTask.assigneeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {project.members.map(m => (
                          <SelectItem key={m.user.id} value={m.user.id}>{m.user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 pb-4">
        {renderColumn('TODO', 'To Do', 'bg-neutral-400')}
        {renderColumn('IN_PROGRESS', 'In Progress', 'bg-amber-400')}
        {renderColumn('DONE', 'Done', 'bg-green-500')}
      </div>
    </div>
  );
}
