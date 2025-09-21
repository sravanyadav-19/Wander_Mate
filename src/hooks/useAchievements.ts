import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value?: number;
  badge_color: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  is_unlocked: boolean;
  achievement: Achievement;
}

interface UserStats {
  total_distance: number;
  total_trips: number;
  places_visited: number;
  countries_visited: number;
  longest_trip_distance: number;
  total_trip_duration: number;
  favorite_travel_mode?: string;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all achievements
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category, requirement_value');

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Fetch user's achievements and stats
  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      // Fetch user achievements
      const { data: userAchievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (achievementsError) throw achievementsError;

      // Fetch user statistics
      const { data: statsData, error: statsError } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      setUserAchievements(userAchievementsData || []);
      setUserStats(statsData || null);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  // Check for new achievements
  const checkAchievements = async (stats: UserStats) => {
    if (!user || !achievements.length) return;

    try {
      const newlyUnlocked: string[] = [];

      for (const achievement of achievements) {
        // Check if user already has this achievement
        const existingAchievement = userAchievements.find(
          ua => ua.achievement_id === achievement.id
        );

        if (existingAchievement?.is_unlocked) continue;

        let shouldUnlock = false;
        let currentProgress = 0;

        // Check achievement conditions
        switch (achievement.requirement_type) {
          case 'trips_count':
            currentProgress = stats.total_trips;
            shouldUnlock = stats.total_trips >= (achievement.requirement_value || 0);
            break;
          case 'distance':
            currentProgress = stats.total_distance;
            shouldUnlock = stats.total_distance >= (achievement.requirement_value || 0);
            break;
          case 'places_visited':
            currentProgress = stats.places_visited;
            shouldUnlock = stats.places_visited >= (achievement.requirement_value || 0);
            break;
          // Add more conditions as needed
        }

        // Update or insert achievement progress
        const { error } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: user.id,
            achievement_id: achievement.id,
            progress: currentProgress,
            is_unlocked: shouldUnlock
          }, {
            onConflict: 'user_id,achievement_id'
          });

        if (error) throw error;

        if (shouldUnlock && !existingAchievement?.is_unlocked) {
          newlyUnlocked.push(achievement.name);
        }
      }

      // Show notifications for newly unlocked achievements
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(achievementName => {
          toast.success(`🏆 Achievement Unlocked: ${achievementName}!`);
        });
        
        // Refresh user achievements
        fetchUserProgress();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchAchievements(), fetchUserProgress()]);
      setLoading(false);
    };

    initializeData();
  }, [user]);

  // Check achievements when stats change
  useEffect(() => {
    if (userStats && achievements.length > 0) {
      checkAchievements(userStats);
    }
  }, [userStats, achievements]);

  // Get combined achievement data
  const getCombinedAchievements = () => {
    return achievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievement_id === achievement.id
      );

      return {
        ...achievement,
        earned_at: userAchievement?.earned_at,
        progress: userAchievement?.progress || 0,
        is_unlocked: userAchievement?.is_unlocked || false
      };
    });
  };

  return {
    achievements: getCombinedAchievements(),
    userStats,
    loading,
    refetch: () => {
      fetchAchievements();
      fetchUserProgress();
    },
    checkAchievements
  };
};