
import { CreatePost } from './CreatePost'
import { FeedCard } from './FeedCard'

const mockPosts = [
  {
    id: 1,
    author: 'Sarah Johnson',
    relationship: 'Sister',
    timestamp: '2h ago',
    content: 'Had the most wonderful day at the park with the kids! The weather was perfect and they loved the new playground. ☀️',
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    author: 'Michael Smith',
    relationship: 'Brother',
    timestamp: '5h ago',
    content: 'Congratulations to Emma on her graduation! We\'re all so proud of you! 🎓',
    likes: 48,
    comments: 12,
  },
  {
    id: 3,
    author: 'Linda Martinez',
    relationship: 'Mother',
    timestamp: '1d ago',
    content: 'Sunday family dinner was amazing! Thank you everyone for coming. Let\'s do this again next month!',
    likes: 35,
    comments: 8,
  },
  {
    id: 4,
    author: 'David Chen',
    relationship: 'Cousin',
    timestamp: '2d ago',
    content: 'Throwback to our family vacation last summer. Missing those beach days! 🏖️',
    likes: 42,
    comments: 15,
  },
]

const Feed = () => {
  return (
    <main className="flex-1 max-w-2xl mx-auto p-6">
      <CreatePost />
      
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <FeedCard key={post.id} {...post} />
        ))}
      </div>
    </main>
  )
}

Feed.displayName = "Feed"
export default Feed
