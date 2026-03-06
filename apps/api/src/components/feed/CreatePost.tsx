import { Image, Smile, Calendar } from 'lucide-react'

export function CreatePost() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-secondary-foreground">J</span>
        </div>
        <textarea
          placeholder="Share a family moment..."
          className="flex-1 bg-input-background rounded-lg px-4 py-3 resize-none border-0 focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-accent text-accent-foreground transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-accent text-accent-foreground transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-accent text-accent-foreground transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
        
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          Post
        </button>
      </div>
    </div>
  )
}
