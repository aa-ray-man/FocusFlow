import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Target, Clock, TrendingUp } from "lucide-react";

export default function Analytics() {
  const {
    weeklyOverview,
    habitStreaks,
    totalWeeklyHabits,
    totalWeeklyPomodoros,
    totalWeeklyFocusTime,
  } = useAnalyticsData();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Understand your productivity patterns and celebrate your progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Habits</CardTitle>
            <Target className="h-4 w-4 text-mint" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeeklyHabits}</div>
            <p className="text-xs text-muted-foreground">Completed this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Sessions</CardTitle>
            <Clock className="h-4 w-4 text-lavender" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeeklyPomodoros}</div>
            <p className="text-xs text-muted-foreground">Pomodoro sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-peach" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalWeeklyFocusTime)}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Your daily productivity this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyOverview}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-mint">Habits: {payload[0]?.value}</p>
                            <p className="text-lavender">Pomodoros: {payload[1]?.value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="habits" fill="hsl(var(--mint))" radius={4} />
                  <Bar dataKey="pomodoros" fill="hsl(var(--lavender))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle>Habit Streaks</CardTitle>
            <CardDescription>Your current consistency streaks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habitStreaks.length > 0 ? (
                habitStreaks.slice(0, 5).map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <span className="font-medium">{habit.title}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold">{habit.streak} days</div>
                      <div className="text-xs text-muted-foreground">Current streak</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No habit data available</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete some habits to see streaks</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>
            Personalized tips based on your productivity patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {totalWeeklyFocusTime > 0 ? (
              <>
                <div className="p-3 bg-mint/10 rounded-lg">
                  <p className="text-sm">
                    🎯 Great work! You've completed {formatTime(totalWeeklyFocusTime)} of focused work this week.
                  </p>
                </div>
                {totalWeeklyPomodoros > 5 && (
                  <div className="p-3 bg-lavender/10 rounded-lg">
                    <p className="text-sm">
                      🔥 You're on fire! {totalWeeklyPomodoros} pomodoro sessions show excellent focus habits.
                    </p>
                  </div>
                )}
                {habitStreaks.some(h => h.streak > 3) && (
                  <div className="p-3 bg-peach/10 rounded-lg">
                    <p className="text-sm">
                      ⭐ Building strong habits! You have streaks of {Math.max(...habitStreaks.map(h => h.streak))} days.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Start tracking your productivity by completing habits and pomodoro sessions to see personalized insights here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}