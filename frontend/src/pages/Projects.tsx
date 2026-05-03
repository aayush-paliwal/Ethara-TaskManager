import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { FolderKanban, Plus, Users, LayoutList, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string;
  _count: { members: number; tasks: number };
}

export default function Projects() {
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setCreatedProjects(res.data.createdProjects || []);
      setMemberProjects(res.data.memberProjects || []);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created successfully!');
      setIsDialogOpen(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const renderProjectGrid = (projectList: Project[], emptyMessage: string) => {
    if (projectList.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg border-neutral-200 dark:border-neutral-800">
          <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mt-1">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectList.map((project, i) => (
          <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, duration: 0.2 }}>
            <Link to={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 h-10">
                    {project.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project._count.members} Members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LayoutList className="w-4 h-4" />
                      <span>{project._count.tasks} Tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground mt-1">Manage your team projects and view boards.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to start collaborating with your team.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="e.g., Q3 Marketing Campaign" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (Optional)</Label>
                <Input id="desc" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Projects I Created</h3>
            {renderProjectGrid(createdProjects, "You haven't created any projects yet.")}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Projects I've Joined</h3>
            {renderProjectGrid(memberProjects, "You haven't been added to any projects yet.")}
          </div>
        </div>
      )}
    </div>
  );
}
