import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboardData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch habits and their completions
  const { data: habits } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch today's habit completions
  const { data: todayCompletions } = useQuery({
    queryKey: ['habit-completions-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_at', today);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch today's pomodoro sessions
  const { data: todayPomodoros } = useQuery({
    queryKey: ['pomodoro-sessions-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', today + 'T00:00:00Z')
        .lt('completed_at', today + 'T23:59:59Z');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch weekly pomodoro sessions for goal calculation
  const { data: weeklyPomodoros } = useQuery({
    queryKey: ['pomodoro-sessions-week', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', weekStart.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate study streak (consecutive days with habit completions or pomodoro sessions)
  const { data: studyStreak } = useQuery({
    queryKey: ['study-streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('pomodoro_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      if (completionsError || sessionsError) return 0;
      
      // Combine and get unique dates
      const allDates = new Set([
        ...(completions || []).map(c => c.completed_at.split('T')[0]),
        ...(sessions || []).map(s => s.completed_at.split('T')[0])
      ]);
      
      const sortedDates = Array.from(allDates).sort().reverse();
      
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - streak);
        
        if (date.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    },
    enabled: !!user?.id,
  });

  // Fetch user settings for weekly goal
  const { data: userSettings } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('weekly_study_goal_hours')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const totalHabits = habits?.length || 0;
  const completedTodayCount = todayCompletions?.length || 0;
  const todayFocusTime = todayPomodoros?.reduce((total, session) => total + session.duration_minutes, 0) || 0;
  const weeklyFocusTime = weeklyPomodoros?.reduce((total, session) => total + session.duration_minutes, 0) || 0;
  const weeklyGoalHours = userSettings?.weekly_study_goal_hours || 20; // Default to 20 if not set
  const weeklyProgress = weeklyGoalHours > 0 ? Math.round((weeklyFocusTime / 60 / weeklyGoalHours) * 100) : 0;

  const refetchCompletions = () => {
    queryClient.invalidateQueries({ queryKey: ['habit-completions-today', user?.id] });
  };

  return {
    habits: habits || [],
    todayCompletions: todayCompletions || [],
    totalHabits,
    completedTodayCount,
    todayFocusTime,
    weeklyFocusTime,
    weeklyProgress,
    weeklyGoalHours,
    studyStreak: studyStreak || 0,
    refetchCompletions,
  };
};