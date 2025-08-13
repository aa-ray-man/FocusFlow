import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, CheckCircle2, Trash2, Edit, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Health' | 'Sleep';
  goal_frequency: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string;
}

const categoryColors = {
  Academic: "bg-primary/20 text-primary border-primary/30",
  Health: "bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400",
  Sleep: "bg-purple-500/20 text-purple-700 border-purple-500/30 dark:text-purple-400"
};

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Academic" as 'Academic' | 'Health' | 'Sleep',
    goal_frequency: 1
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchCompletions();
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits((data || []) as Habit[]);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch habits",
        variant: "destructive"
      });
    }
  };

  const fetchCompletions = async () => {
    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (editingHabit) {
        const { error } = await supabase
          .from('habits')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            goal_frequency: formData.goal_frequency
          })
          .eq('id', editingHabit.id);

        if (error) throw error;
        toast({ title: "Success", description: "Habit updated successfully" });
      } else {
        const { error } = await supabase
          .from('habits')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            goal_frequency: formData.goal_frequency
          });

        if (error) throw error;
        toast({ title: "Success", description: "Habit created successfully" });
      }

      fetchHabits();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving habit:', error);
      toast({
        title: "Error",
        description: "Failed to save habit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Academic" as 'Academic' | 'Health' | 'Sleep',
      goal_frequency: 1
    });
    setEditingHabit(null);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description,
      category: habit.category,
      goal_frequency: habit.goal_frequency
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId);

      if (error) throw error;
      
      fetchHabits();
      toast({ title: "Success", description: "Habit deleted successfully" });
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive"
      });
    }
  };

  const toggleCompletion = async (habitId: string) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const existingCompletion = completions.find(
      c => c.habit_id === habitId && c.completed_at === today
    );

    try {
      if (existingCompletion) {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existingCompletion.id);

        if (error) throw error;
        toast({ title: "Success", description: "Completion removed" });
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            user_id: user.id,
            habit_id: habitId,
            completed_at: today
          });

        if (error) throw error;
        toast({ title: "Success", description: "Habit completed! 🎉" });
      }

      fetchCompletions();
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast({
        title: "Error",
        description: "Failed to update completion",
        variant: "destructive"
      });
    }
  };

  const calculateStreak = (habitId: string) => {
    const habitCompletions = completions
      .filter(c => c.habit_id === habitId)
      .map(c => new Date(c.completed_at))
      .sort((a, b) => b.getTime() - a.getTime());

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < habitCompletions.length; i++) {
      const completionDate = new Date(habitCompletions[i]);
      completionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (completionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const isCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return completions.some(c => c.habit_id === habitId && c.completed_at === today);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">Build consistent habits to achieve your goals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>
                {editingHabit ? "Edit Habit" : "Create New Habit"}
              </DialogTitle>
              <DialogDescription>
                {editingHabit ? "Update your habit details" : "Add a new habit to track"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Read for 30 minutes"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Daily reading to improve knowledge and focus"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Sleep">Sleep</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal_frequency">Daily Goal</Label>
                <Input
                  id="goal_frequency"
                  type="number"
                  min="1"
                  value={formData.goal_frequency}
                  onChange={(e) => setFormData({ ...formData, goal_frequency: parseInt(e.target.value) })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} variant="hero">
                  {loading ? "Saving..." : editingHabit ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const streak = calculateStreak(habit.id);
          const completedToday = isCompletedToday(habit.id);
          const progress = completedToday ? 100 : 0;

          return (
            <Card key={habit.id} className="bg-gradient-card border-border hover:shadow-soft transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{habit.title}</CardTitle>
                    <Badge className={categoryColors[habit.category]}>
                      {habit.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(habit)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(habit.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {habit.description && (
                  <p className="text-sm text-muted-foreground">{habit.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm">{habit.goal_frequency}x daily</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Today's Progress</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <Button
                  variant={completedToday ? "mint" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => toggleCompletion(habit.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {completedToday ? "Completed Today" : "Mark Complete"}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {habits.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3 bg-gradient-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building positive habits by creating your first habit tracker
              </p>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}