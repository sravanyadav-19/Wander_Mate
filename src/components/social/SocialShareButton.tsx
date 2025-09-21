import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Share,
  Share2, 
  Copy,
  MessageCircle,
  Mail,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface SocialShareData {
  title: string;
  text: string;
  url?: string;
  image?: string;
}

interface SocialShareButtonProps {
  data: SocialShareData;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export const SocialShareButton = ({ 
  data, 
  variant = "outline", 
  size = "default",
  className = "",
  showLabel = true
}: SocialShareButtonProps) => {
  
  const canShare = typeof navigator !== 'undefined' && navigator.share;
  
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || window.location.href
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error("Failed to share");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = data.url || window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error('Error copying:', error);
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${data.title}\n\n${data.text}\n\n${data.url || window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(`${data.text}\n\nCheck it out: ${data.url || window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`${data.title}\n\n${data.text}`);
    const url = encodeURIComponent(data.url || window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(data.url || window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const exportData = () => {
    const shareContent = {
      ...data,
      sharedAt: new Date().toISOString(),
      url: data.url || window.location.href
    };
    
    const blob = new Blob([JSON.stringify(shareContent, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wandermate-share-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Share data exported!");
  };

  // If native sharing is available, show simple share button
  if (canShare) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleNativeShare}
      >
        <Share className="h-4 w-4" />
        {showLabel && <span className="ml-2">Share</span>}
      </Button>
    );
  }

  // Otherwise show dropdown with sharing options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4" />
          {showLabel && <span className="ml-2">Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitter}>
          <Share className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebook}>
          <Share className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
