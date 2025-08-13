import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Timer, TrendingUp, Calendar, CheckCircle, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    habits,
    todayCompletions,
    totalHabits,
    completedTodayCount,
    todayFocusTime,
    weeklyFocusTime,
    weeklyProgress,
    weeklyGoalHours,
    studyStreak,
    refetchCompletions,
  } = useDashboardData();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const existingCompletion = todayCompletions.find(
      c => c.habit_id === habitId
    );

    try {
      if (existingCompletion) {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_at', today);

        if (error) throw error;
        toast({ title: "Success", description: "Habit unchecked" });
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

      refetchCompletions?.();
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Ready to make today productive, {user?.email?.split('@')[0]}?
          </p>
        </div>
        <Button variant="hero" onClick={() => navigate('/pomodoro')}>Start Studying</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Target className="h-4 w-4 text-mint" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyStreak} days</div>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Timer className="h-4 w-4 text-lavender" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(todayFocusTime)}</div>
            <p className="text-xs text-muted-foreground">Today's focus time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <TrendingUp className="h-4 w-4 text-peach" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyProgress}%</div>
            <p className="text-xs text-muted-foreground">{formatTime(weeklyFocusTime)}/{weeklyGoalHours}h this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits</CardTitle>
            <Calendar className="h-4 w-4 text-mint" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTodayCount}/{totalHabits}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Today's Habits</CardTitle>
            <CardDescription>Keep your momentum going</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {habits.length > 0 ? (
              habits.slice(0, 5).map((habit) => {
                const isCompleted = todayCompletions.some(completion => completion.habit_id === habit.id);
                return (
                  <div 
                    key={habit.id} 
                    className="flex items-center justify-between p-3 bg-accent/10 rounded-lg cursor-pointer hover:bg-accent/20 transition-colors"
                    onClick={() => toggleHabitCompletion(habit.id)}
                  >
                    <span className={isCompleted ? "line-through text-muted-foreground" : ""}>{habit.title}</span>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-mint" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No habits yet</p>
                <Button variant="outline" className="mt-2" onClick={() => navigate('/habits')}>
                  Create your first habit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your most important tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/pomodoro')}>
              <Timer className="mr-2 h-4 w-4" />
              Start 25-min Focus Session
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/habits')}>
              <Target className="mr-2 h-4 w-4" />
              Manage Habits
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/analytics')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}