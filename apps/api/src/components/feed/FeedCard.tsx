import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

interface FeedCardProps {
  author: string;
  relationship: string;
  timestamp: string;
  content: string;
  likes: number;
  comments: number;
  image?: string;
}

export function FeedCard({ 
  author, 
  relationship, 
  timestamp, 
  content, 
  likes, 
  comments,
  image 
}: FeedCardProps) {
  return (
    <article className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-secondary-foreground">
              {author.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-foreground">{author}</h3>
            <p className="text-muted-foreground">{relationship} · {timestamp}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-foreground">{content}</p>
      </div>
      
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={image} alt="" className="w-full h-auto" />
        </div>
      )}
      
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground transition-colors">
          <Heart className="w-5 h-5" />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{comments}</span>
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}
