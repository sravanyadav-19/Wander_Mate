import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  MapPin,
  Compass,
  Mountain,
  Crown,
  Footprints,
  Building,
  Car,
  Globe,
  Share,
  Camera,
  Heart,
  Zap
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value?: number;
  badge_color: string;
  earned_at?: string;
  progress?: number;
  is_unlocked?: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  userProgress?: number;
  isUnlocked?: boolean;
}

const iconMap = {
  Trophy,
  MapPin,
  Compass,
  Mountain,
  Crown,
  Footprints,
  Building,
  Car,
  Globe,
  Share,
  Camera,
  Heart,
  Zap
};

const colorMap = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground", 
  accent: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive text-destructive-foreground"
};

export const AchievementBadge = ({ 
  achievement, 
  userProgress = 0, 
  isUnlocked = false 
}: AchievementBadgeProps) => {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  const progressPercentage = achievement.requirement_value 
    ? Math.min((userProgress / achievement.requirement_value) * 100, 100)
    : isUnlocked ? 100 : 0;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover-scale ${
      isUnlocked ? 'shadow-glow' : 'opacity-60'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full ${
            isUnlocked 
              ? colorMap[achievement.badge_color as keyof typeof colorMap] 
              : 'bg-muted text-muted-foreground'
          }`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
              {achievement.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {achievement.description}
            </p>
          </div>
          {isUnlocked && (
            <Badge variant="secondary" className="text-xs">
              Unlocked
            </Badge>
          )}
        </div>
        
        {achievement.requirement_value && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{userProgress}/{achievement.requirement_value}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        {achievement.earned_at && (
          <p className="text-xs text-muted-foreground mt-2">
            Earned on {new Date(achievement.earned_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" />
      )}
    </Card>
  );
};