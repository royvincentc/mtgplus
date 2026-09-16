import React, { useState } from 'react';
import { 
  Trophy, 
  MessageSquare, 
  Sparkles, 
  Heart, 
  Send, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  commander?: string;
  likes: number;
  liked?: boolean;
}

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Roy Codiñera';

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Spike_EDH',
      avatar: 'S',
      time: '2 hours ago',
      content: 'Just brewed a new bracket 4 Krenko list with 0 infinite combos. The token velocity is insane! Anyone want to test tonight?',
      commander: 'Krenko, Mob Boss',
      likes: 14
    },
    {
      id: '2',
      author: 'DragonMaster99',
      avatar: 'D',
      time: '5 hours ago',
      content: 'Turn 3 Ur-Dragon drop thanks to Sol Ring + Arcane Signet into Dragon Arch! Best Commander game I had this week.',
      commander: 'The Ur-Dragon',
      likes: 29
    },
    {
      id: '3',
      author: 'DinoPower',
      avatar: 'G',
      time: 'Yesterday',
      content: 'Gishath connected for 7 and pulled Zacama AND Etali! The entire table scooped immediately lol.',
      commander: "Gishath, Sun's Avatar",
      likes: 42
    }
  ]);

  const [newPostText, setNewPostText] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: userName,
      avatar: userName.charAt(0).toUpperCase(),
      time: 'Just now',
      content: newPostText.trim(),
      likes: 0
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        };
      }
      return p;
    }));
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#0a0805] text-[#f5f0e6] relative p-4 sm:p-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#c5a059]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#2d2417] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#c5a059] text-xs">―✦</span>
              <span className="text-[11px] font-bold text-[#a09380] uppercase tracking-[0.25em]">Global Social</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#f5f0e6] tracking-tight">
              Community Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#8c806f] mt-1">
              Discuss deck brews, share game recaps, and find playgroups.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Social Feed */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Create Post Box */}
            <form 
              onSubmit={handleCreatePost}
              className="bg-[#120f0b] border border-[#2d2417] rounded-3xl p-5 shadow-xl backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#e5c158] to-[#9a7328] flex items-center justify-center text-black font-black text-xs shrink-0 shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <textarea
                  rows={3}
                  value={newPostText}
                  onChange={e => setNewPostText(e.target.value)}
                  placeholder="Share a combo, game story, or look for players..."
                  className="flex-1 bg-[#0a0806] border border-[#3d3222] focus:border-[#c5a059] rounded-2xl p-3 text-xs text-[#f5f0e6] placeholder-[#5a5042] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#251d13]">
                <span className="text-[11px] text-[#756755]">Post to the Commander Zone community</span>
                <button
                  type="submit"
                  disabled={!newPostText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </div>
            </form>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="bg-[#120f0b] border border-[#2d2417] hover:border-[#c5a059]/40 rounded-3xl p-5 shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#261e14] border border-[#c5a059]/40 flex items-center justify-center text-[#e5c158] font-black text-xs">
                        {post.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {post.author}
                          <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                        </h4>
                        <span className="text-[10px] text-[#756755]">{post.time}</span>
                      </div>
                    </div>

                    {post.commander && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#292014] text-[#f3d37a] border border-[#c5a059]/30">
                        {post.commander}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#ded5c7] leading-relaxed mb-4">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 pt-3 border-t border-[#251d13] text-xs text-[#8c806f]">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.liked ? 'text-red-500 font-bold' : 'hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </button>
                    <button 
                      onClick={() => alert('Reply feature')}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Community Leaderboard & Hot Commanders */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Leaderboard Card */}
            <div className="bg-[#120f0b] border border-[#2d2417] rounded-3xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2d2417]">
                <Trophy className="w-5 h-5 text-[#c5a059]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Top Planeswalkers
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Roy Codiñera', winrate: '74%', games: 112 },
                  { rank: 2, name: 'KrenkoKing', winrate: '68%', games: 94 },
                  { rank: 3, name: 'UrDragonLord', winrate: '65%', games: 88 },
                  { rank: 4, name: 'AtraxaPro', winrate: '61%', games: 79 },
                ].map(user => (
                  <div key={user.rank} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0806] border border-[#251d13]">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        user.rank === 1 ? 'bg-[#c5a059] text-black' : 'bg-[#292014] text-[#a09380]'
                      }`}>
                        {user.rank}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{user.name}</h4>
                        <span className="text-[10px] text-[#756755]">{user.games} matches</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400">{user.winrate} WR</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Discord / Guild Link */}
            <div className="bg-gradient-to-br from-[#261e14] to-[#14100b] border border-[#c5a059]/40 rounded-3xl p-5 shadow-xl text-center">
              <Sparkles className="w-8 h-8 text-[#e5c158] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Join the Commander Discord</h4>
              <p className="text-xs text-[#a09380] mt-1 mb-4">
                Find voice pods, organize tournaments, and share decklists.
              </p>
              <button 
                onClick={() => alert('Official Commander Zone Discord community: discord.gg/commanderzone')}
                className="w-full py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider transition-all"
              >
                Join Server
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
