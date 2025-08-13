import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalyticsData = () => {
  const { user } = useAuth();

  // Fetch weekly habit completions
  const { data: weeklyHabits } = useQuery({
    queryKey: ['analytics-weekly-habits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('habit_completions')
        .select('completed_at, habit_id')
        .eq('user_id', user.id)
        .gte('completed_at', weekStart.toISOString().split('T')[0]);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch weekly pomodoro sessions
  const { data: weeklyPomodoros } = useQuery({
    queryKey: ['analytics-weekly-pomodoros', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('completed_at, duration_minutes, session_type')
        .eq('user_id', user.id)
        .gte('completed_at', weekStart.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch habit streaks data
  const { data: habitStreaks } = useQuery({
    queryKey: ['analytics-habit-streaks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (habitsError) throw habitsError;
      
      const habitStreaksData = await Promise.all(
        (habits || []).map(async (habit) => {
          const { data: completions, error } = await supabase
            .from('habit_completions')
            .select('completed_at')
            .eq('user_id', user.id)
            .eq('habit_id', habit.id)
            .order('completed_at', { ascending: false });
          
          if (error) return { ...habit, streak: 0 };
          
          // Calculate streak
          let streak = 0;
          let currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);
          
          const sortedDates = (completions || [])
            .map(c => c.completed_at)
            .sort()
            .reverse();
          
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
          
          return { ...habit, streak };
        })
      );
      
      return habitStreaksData;
    },
    enabled: !!user?.id,
  });

  // Process weekly data for charts
  const weeklyOverview = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHabits = weeklyHabits?.filter(h => h.completed_at === dateStr).length || 0;
      const dayPomodoros = weeklyPomodoros?.filter(p => p.completed_at.startsWith(dateStr)).length || 0;
      
      return {
        day,
        date: dateStr,
        habits: dayHabits,
        pomodoros: dayPomodoros,
        focusTime: weeklyPomodoros
          ?.filter(p => p.completed_at.startsWith(dateStr))
          ?.reduce((total, session) => total + session.duration_minutes, 0) || 0
      };
    });
  })();

  return {
    weeklyOverview,
    habitStreaks: habitStreaks || [],
    totalWeeklyHabits: weeklyHabits?.length || 0,
    totalWeeklyPomodoros: weeklyPomodoros?.length || 0,
    totalWeeklyFocusTime: weeklyPomodoros?.reduce((total, session) => total + session.duration_minutes, 0) || 0,
  };
};