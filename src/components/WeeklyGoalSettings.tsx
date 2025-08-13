import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target } from "lucide-react";

export default function WeeklyGoalSettings() {
  const [weeklyGoal, setWeeklyGoal] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentGoal();
  }, [user]);

  const fetchCurrentGoal = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('weekly_study_goal_hours')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching goal:', error);
        return;
      }

      if (data) {
        setWeeklyGoal(data.weekly_study_goal_hours);
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    }
  };

  const saveGoal = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            weekly_study_goal_hours: weeklyGoal
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;

      toast({
        title: "Goal updated! 🎯",
        description: `Your weekly study goal is now ${weeklyGoal} hours.`
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to save your goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="bg-card">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Weekly Study Goal
        </DialogTitle>
        <DialogDescription>
          Set your weekly focus time goal to track your progress and stay motivated.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weeklyGoal">Weekly Goal (hours)</Label>
          <Input
            id="weeklyGoal"
            type="number"
            min="1"
            max="100"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 20)}
            placeholder="20"
          />
          <p className="text-sm text-muted-foreground">
            This goal will be used to track your progress on the dashboard and analytics pages.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button 
          variant="hero" 
          onClick={saveGoal}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Goal"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}