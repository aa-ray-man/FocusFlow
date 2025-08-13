import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, RotateCcw, Volume2, VolumeX, BookOpen, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WeeklyGoalSettings from "@/components/WeeklyGoalSettings";

interface TimerSettings {
  workDuration: number;
  breakDuration: number;
}

const motivationalQuotes = [
  "Focus is not about doing one thing. It's about not doing thousands of other things.",
  "The successful warrior is the average person with laser-like focus.",
  "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
  "It is during our darkest moments that we must focus to see the light.",
  "The art of being wise is knowing what to overlook."
];

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5
  });
  const [subject, setSubject] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentQuote] = useState(() => 
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    // Create a beep sound that repeats 5 times
    const createBeepSound = () => {
      const playBeep = (beepNumber: number) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Schedule next beep if not the last one
        if (beepNumber < 5) {
          setTimeout(() => playBeep(beepNumber + 1), 500);
        }
      };
      
      playBeep(1);
    };

    // Store the function for later use
    (audioRef as any).current = { play: createBeepSound };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    // Play notification sound
    if (soundEnabled && audioRef.current) {
      try {
        audioRef.current.play();
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }

    if (!isBreak && user) {
      // Save work session
      try {
        const { error } = await supabase
          .from('pomodoro_sessions')
          .insert({
            user_id: user.id,
            subject: subject || 'Untitled Session',
            duration_minutes: settings.workDuration,
            session_type: 'work'
          });

        if (error) throw error;
        
        toast({
          title: "Work session completed! 🎉",
          description: `Great job! Time for a ${settings.breakDuration}-minute break.`
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    // Switch between work and break
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(settings.workDuration * 60);
      toast({
        title: "Break finished!",
        description: "Ready for another focus session?"
      });
    } else {
      setIsBreak(true);
      setTimeLeft(settings.breakDuration * 60);
      toast({
        title: "Work session complete!",
        description: "Time for a well-deserved break."
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(settings.workDuration * 60);
  };

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    if (!isActive) {
      setTimeLeft(isBreak ? newSettings.breakDuration * 60 : newSettings.workDuration * 60);
    }
    setIsSettingsOpen(false);
    toast({
      title: "Settings updated",
      description: "Timer settings have been saved."
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((settings.breakDuration * 60 - timeLeft) / (settings.breakDuration * 60)) * 100
    : ((settings.workDuration * 60 - timeLeft) / (settings.workDuration * 60)) * 100;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pomodoro Timer</h1>
        <p className="text-muted-foreground">Stay focused with time-boxed work sessions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Timer Card */}
        <Card className="bg-gradient-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isBreak ? "Break Time" : "Focus Session"}
            </CardTitle>
            <CardDescription>
              {isBreak ? "Relax and recharge" : "Stay focused on your task"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Circular Timer */}
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={isBreak ? "text-green-500" : "text-primary"}
                    style={{
                      transition: isActive ? 'stroke-dashoffset 1s linear' : 'none'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold font-mono">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {isBreak ? "Break" : "Focus"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant="hero"
                size="lg"
                onClick={toggleTimer}
                className="w-24"
              >
                {isActive ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={resetTimer}
                className="w-24"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>

            {/* Subject Input */}
            {!isBreak && (
              <div className="space-y-2">
                <Label htmlFor="subject">What are you working on?</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Math homework, reading, etc."
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings & Quote Card */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">Play sound when timer completes</p>
                </div>
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Customize Timer Duration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>Timer Settings</DialogTitle>
                      <DialogDescription>
                        Customize your work and break durations
                      </DialogDescription>
                    </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                      <Input
                        id="workDuration"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.workDuration}
                        onChange={(e) => setSettings({
                          ...settings,
                          workDuration: parseInt(e.target.value) || 25
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                      <Input
                        id="breakDuration"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.breakDuration}
                        onChange={(e) => setSettings({
                          ...settings,
                          breakDuration: parseInt(e.target.value) || 5
                        })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="hero" onClick={() => updateSettings(settings)}>
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Weekly Study Goal
                  </Button>
                </DialogTrigger>
                <WeeklyGoalSettings />
              </Dialog>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Work: {settings.workDuration} min</p>
                <p>Break: {settings.breakDuration} min</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Daily Motivation</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-sm italic text-muted-foreground border-l-4 border-primary/30 pl-4">
                "{currentQuote}"
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}