import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";
import { UserStatistics } from "@/components/gamification/UserStatistics";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { useAchievements } from "@/hooks/useAchievements";
import { 
  User, 
  MapPin, 
  Clock, 
  Settings, 
  LogOut,
  Camera,
  Edit,
  Trophy,
  Award,
  TrendingUp
} from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const { achievements, userStats, loading } = useAchievements();

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="gradient-hero text-white px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {profile?.full_name || user?.email?.split('@')[0] || 'Travel Explorer'}
              </h1>
              <p className="text-white/80 text-sm mb-2">
                {user?.email}
              </p>
              <EditProfileDialog profile={profile} onUpdate={fetchProfile} />
            </div>
          </div>

          {/* Quick Stats */}
          {userStats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.total_trips || 0}</div>
                <div className="text-white/70 text-sm">Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{(userStats.total_distance || 0).toFixed(1)} km</div>
                <div className="text-white/70 text-sm">Distance</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-white/70 text-sm">Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">0 km</div>
                <div className="text-white/70 text-sm">Distance</div>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 px-4 py-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Badges
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {userStats && !loading ? (
                <UserStatistics 
                  stats={userStats} 
                  achievements={achievements}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Complete your first trip to see your travel statistics!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              {loading ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Loading achievements...</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Unlocked Achievements */}
                  {achievements.filter(a => a.is_unlocked).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">Unlocked Achievements</h3>
                      <div className="grid gap-3">
                        {achievements
                          .filter(a => a.is_unlocked)
                          .map(achievement => (
                            <AchievementBadge
                              key={achievement.id}
                              achievement={achievement}
                              userProgress={achievement.progress}
                              isUnlocked={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Achievements */}
                  {achievements.filter(a => !a.is_unlocked).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">In Progress</h3>
                      <div className="grid gap-3">
                        {achievements
                          .filter(a => !a.is_unlocked)
                          .map(achievement => (
                            <AchievementBadge
                              key={achievement.id}
                              achievement={achievement}
                              userProgress={achievement.progress}
                              isUnlocked={false}
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {achievements.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Start traveling to unlock achievements!</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievement Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['trips', 'distance', 'social', 'photos', 'favorites', 'special'].map(category => {
                    const categoryAchievements = achievements.filter(a => a.category === category);
                    const unlockedCount = categoryAchievements.filter(a => a.is_unlocked).length;
                    
                    return (
                      <div key={category} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{category}</div>
                          <div className="text-sm text-muted-foreground">
                            {unlockedCount} of {categoryAchievements.length} unlocked
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {categoryAchievements.length > 0 
                            ? Math.round((unlockedCount / categoryAchievements.length) * 100)
                            : 0}%
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Settings & Actions */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = "/settings"}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings & Preferences
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;