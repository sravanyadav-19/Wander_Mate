import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Clock, 
  Route, 
  Trophy,
  TrendingUp,
  Calendar
} from "lucide-react";

interface UserStats {
  total_distance: number;
  total_trips: number;
  places_visited: number;
  countries_visited: number;
  longest_trip_distance: number;
  total_trip_duration: number;
  favorite_travel_mode?: string;
}

interface UserStatisticsProps {
  stats: UserStats;
  achievements: Array<{
    name: string;
    is_unlocked: boolean;
  }>;
}

export const UserStatistics = ({ stats, achievements }: UserStatisticsProps) => {
  const unlockedAchievements = achievements.filter(a => a.is_unlocked).length;
  const totalAchievements = achievements.length;
  const achievementPercentage = totalAchievements > 0 
    ? (unlockedAchievements / totalAchievements) * 100 
    : 0;

  const formatDistance = (km: number) => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(1)}k km`;
    }
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const statCards = [
    {
      title: "Total Distance",
      value: formatDistance(stats.total_distance || 0),
      icon: Route,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Total Trips",
      value: stats.total_trips || 0,
      icon: MapPin,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Travel Time",
      value: formatDuration(stats.total_trip_duration || 0),
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Achievements",
      value: `${unlockedAchievements}/${totalAchievements}`,
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover-scale">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="font-bold text-lg">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-primary" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unlocked</span>
            <span className="font-medium">{unlockedAchievements} of {totalAchievements}</span>
          </div>
          <Progress value={achievementPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Travel Records */}
      {(stats.longest_trip_distance > 0 || stats.places_visited > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-accent" />
              Travel Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.longest_trip_distance > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Longest Trip</span>
                <span className="font-medium">{formatDistance(stats.longest_trip_distance)}</span>
              </div>
            )}
            {stats.places_visited > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Places Visited</span>
                <span className="font-medium">{stats.places_visited}</span>
              </div>
            )}
            {stats.countries_visited > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Countries Visited</span>
                <span className="font-medium">{stats.countries_visited}</span>
              </div>
            )}
            {stats.favorite_travel_mode && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Favorite Mode</span>
                <span className="font-medium">{stats.favorite_travel_mode}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};