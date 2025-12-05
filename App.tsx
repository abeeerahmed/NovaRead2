import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './contexts/DataContext';
import { UserRole, ReaderSettings, Novel, Chapter, Review, Comment, User } from './types';
import { sanitizeHTML } from './utils/security';
import RichTextEditor from './components/RichTextEditor';
import SEOHead from './components/SEOHead';
import JSONLDSchema from './components/JSONLDSchema';
import VoteButton from './components/VoteButton';
import SaveButton from './components/SaveButton';
import ReviewSection from './components/ReviewSection';
import CommentSection from './components/CommentSection';
import ProfilePage from './pages/ProfilePage';
import RankingsPage from './pages/RankingsPage';
import LibraryPage from './pages/LibraryPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// --- Components ---

export const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-dark-700 rounded ${className}`}></div>
);

export const ToastContainer = () => {
  const { notifications, dismissNotification } = useApp();
  
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
       {notifications.map(n => (
          <div 
             key={n.id} 
             onClick={() => dismissNotification(n.id)}
             className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm flex items-center gap-3 cursor-pointer pointer-events-auto transform transition-all duration-300 animate-slide-in-right ${
                n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-dark-800'
             }`}
          >
             <i className={`fa-solid ${n.type === 'success' ? 'fa-check' : n.type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle'}`}></i>
             {n.message}
          </div>
       ))}
    </div>
  );
};

export const Breadcrumbs = ({ items }: { items: { label: string, path?: string }[] }) => (
   <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto whitespace-nowrap">
      {items.map((item, idx) => (
         <div key={idx} className="flex items-center">
            {idx > 0 && <i className="fa-solid fa-chevron-right text-xs mx-2 opacity-50"></i>}
            {item.path ? (
               <Link to={item.path} className="hover:text-brand-500 transition-colors">{item.label}</Link>
            ) : (
               <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
            )}
         </div>
      ))}
   </nav>
);

export const ScrollToTop = () => {
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      const toggle = () => setVisible(window.scrollY > 300);
      window.addEventListener('scroll', toggle);
      return () => window.removeEventListener('scroll', toggle);
   }, []);

   const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

   if (!visible) return null;

   return (
      <button 
         onClick={scrollToTop}
         className="fixed bottom-6 right-6 z-40 bg-brand-600 text-white p-3 rounded-full shadow-xl hover:bg-brand-500 transition-all duration-300 animate-fade-in"
         aria-label="Scroll to top"
      >
         <i className="fa-solid fa-arrow-up"></i>
      </button>
   );
};

// --- Simple Router ---
export const Link = ({ to, children, className, onClick }: any) => {
  const handleClick = (e: any) => {
    e.preventDefault();
    if (onClick) onClick();
    window.location.hash = to;
  };
  return <a href={to} onClick={handleClick} className={className}>{children}</a>;
};

const useRouter = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [params, setParams] = useState<any>({});

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setRoute(hash);
      
      // Basic route matching
      if (hash.startsWith('#/novel/')) {
        setParams({ id: hash.split('/')[2] });
      } else if (hash.startsWith('#/read/')) {
        setParams({ id: hash.split('/')[2] });
      } else {
        setParams({});
      }
      window.scrollTo(0,0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return { route, params, navigate: (path: string) => window.location.hash = path };
};

// --- Navbar ---
const Navbar = () => {
  const { user, logout, theme, toggleTheme, novels } = useApp();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navigate } = useRouter();
  const [suggestions, setSuggestions] = useState<Novel[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
     if (search.trim().length > 1) {
        const q = search.toLowerCase();
        const matches = novels.filter(n => n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q)).slice(0, 5);
        setSuggestions(matches);
        setShowSuggestions(true);
     } else {
        setSuggestions([]);
        setShowSuggestions(false);
     }
  }, [search, novels]);

  const handleSearch = (e: any) => {
    e.preventDefault();
    setMobileOpen(false);
    setShowSuggestions(false);
    navigate(`#/browse?q=${search}`);
  };

  return (
    <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-brand-600 text-white px-4 py-2 rounded font-bold">Skip to content</a>
    <nav className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 sticky top-0 z-50 shadow-sm dark:shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Hamburger */}
          <button 
             onClick={() => setMobileOpen(true)} 
             className="md:hidden text-gray-500 hover:text-brand-500 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
             aria-label="Open menu"
          >
             <i className="fa-solid fa-bars text-xl"></i>
          </button>

          <Link to="#/" className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 tracking-tight group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded">
            <span className="text-brand-500 text-3xl group-hover:rotate-12 transition-transform"><i className="fa-solid fa-book-open-reader"></i></span> 
            <span className="hidden sm:inline">NovaRead</span>
          </Link>
          
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="#/" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1">Home</Link>
            <Link to="#/browse" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1">Browse</Link>
            <Link to="#/rankings" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1">Rankings</Link>
            {user && <Link to="#/library" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1">Library</Link>}
            {user?.role === UserRole.ADMIN && (
              <Link to="#/admin" className="text-amber-600 dark:text-amber-500 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-2 py-1">Admin</Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-5">
          <button 
             onClick={toggleTheme} 
             className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 dark:text-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
             aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          >
             {theme === 'dark' ? <i className="fa-solid fa-sun text-yellow-400"></i> : <i className="fa-solid fa-moon text-dark-700"></i>}
          </button>

          <div className="hidden lg:block relative group">
            <form onSubmit={handleSearch}>
               <label htmlFor="desktop-search" className="sr-only">Search</label>
               <input 
                 id="desktop-search"
                 type="text" 
                 placeholder="Search novels..." 
                 className="bg-gray-100 dark:bg-dark-800 text-sm text-gray-900 dark:text-white pl-4 pr-10 py-2 rounded-full border border-transparent dark:border-dark-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-48 focus:w-64 transition-all duration-300"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                 onFocus={() => search.length > 1 && setShowSuggestions(true)}
                 autoComplete="off"
               />
               <button type="submit" className="absolute right-3 top-2.5 text-gray-500 group-hover:text-brand-500 transition-colors duration-200" aria-label="Search">
                 <i className="fa-solid fa-search"></i>
               </button>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
               <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 overflow-hidden z-50">
                  {suggestions.map(s => (
                     <Link 
                        key={s.id} 
                        to={`#/novel/${s.id}`} 
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 text-sm border-b border-gray-100 dark:border-dark-700 last:border-0"
                     >
                        <div className="font-bold text-gray-900 dark:text-white truncate">{s.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{s.author}</div>
                     </Link>
                  ))}
               </div>
            )}
          </div>

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 md:gap-3 text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-full px-1">
                <span className="hidden md:inline text-sm font-bold">{user.username}</span>
                <img src={user.avatarUrl} className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-dark-700 object-cover" alt="User" />
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                <div className="p-2">
                  <Link to="#/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors duration-200">
                     <i className="fa-regular fa-user w-5 text-center"></i> Profile
                  </Link>
                  <Link to="#/library" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors duration-200">
                     <i className="fa-regular fa-bookmark w-5 text-center"></i> My Library
                  </Link>
                  <div className="h-px bg-gray-200 dark:bg-dark-700 my-1"></div>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors duration-200 text-left">
                     <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="#/login" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white font-bold text-sm hidden sm:block transition-colors duration-200 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-500">Log In</Link>
              <Link to="#/register" className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 md:px-5 md:py-2 rounded-full text-sm font-bold shadow-lg shadow-brand-500/30 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* Mobile Drawer */}
    {mobileOpen && (
      <div className="fixed inset-0 z-[60] flex">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
         <div className="relative bg-white dark:bg-dark-900 w-3/4 max-w-xs h-full shadow-2xl flex flex-col p-6 animate-slide-in-left transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
               <span className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2"><i className="fa-solid fa-book-open-reader text-brand-500"></i> NovaRead</span>
               <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl p-2" aria-label="Close menu"><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <form onSubmit={handleSearch} className="mb-8">
               <div className="relative">
                  <input type="text" placeholder="Search..." className="w-full bg-gray-100 dark:bg-dark-800 p-3 rounded-lg pl-10 text-gray-900 dark:text-white outline-none focus:ring-2 ring-brand-500 transition-colors duration-200" value={search} onChange={e => setSearch(e.target.value)} />
                  <i className="fa-solid fa-search absolute left-3 top-3.5 text-gray-400"></i>
               </div>
            </form>

            <div className="space-y-4 flex-1 overflow-y-auto">
               <Link to="#/" onClick={() => setMobileOpen(false)} className="block text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-brand-500">Home</Link>
               <Link to="#/browse" onClick={() => setMobileOpen(false)} className="block text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-brand-500">Browse</Link>
               <Link to="#/rankings" onClick={() => setMobileOpen(false)} className="block text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-brand-500">Rankings</Link>
               {user && <Link to="#/library" onClick={() => setMobileOpen(false)} className="block text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-brand-500">My Library</Link>}
               {user?.role === UserRole.ADMIN && <Link to="#/admin" onClick={() => setMobileOpen(false)} className="block text-lg font-bold text-amber-500">Admin Panel</Link>}
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-dark-800">
               {user ? (
                  <div className="flex items-center gap-3 mb-4">
                     <img src={user.avatarUrl} className="w-10 h-10 rounded-full" alt="av" />
                     <div>
                        <div className="font-bold text-gray-900 dark:text-white">{user.username}</div>
                        <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-red-500 font-medium">Sign Out</button>
                     </div>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 gap-3">
                     <Link to="#/login" onClick={() => setMobileOpen(false)} className="text-center py-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-white font-bold">Log In</Link>
                     <Link to="#/register" onClick={() => setMobileOpen(false)} className="text-center py-2 rounded-lg bg-brand-600 text-white font-bold">Sign Up</Link>
                  </div>
               )}
            </div>
         </div>
      </div>
    )}
    </>
  );
};

// --- Inline Pages ---
// ... HomePage, NovelPage, ReaderPage, AuthPage ...
// I will reuse the previous implementations for these.
// Due to size, I am focusing on the AdminPanel implementation requested.

const AdminPanel = () => {
   const { 
     user, novels, getAllUsers, updateUserRole, deleteUser, banUser,
     addNovel, updateNovel, deleteNovel,
     addChapter, fetchNovelDetails, updateChapter, deleteChapter
   } = useApp();
   const [activeTab, setActiveTab] = useState<'users' | 'novels' | 'chapters'>('users');
   
   // Users State
   const [users, setUsers] = useState<User[]>([]);
   const [filterUser, setFilterUser] = useState('');
   
   // Novels State
   const [editingNovel, setEditingNovel] = useState<Partial<Novel> | null>(null);
   const [isNovelModalOpen, setIsNovelModalOpen] = useState(false);

   // Chapters State
   const [selectedNovelId, setSelectedNovelId] = useState<string>('');
   const [chapters, setChapters] = useState<Chapter[]>([]);
   const [editingChapter, setEditingChapter] = useState<Partial<Chapter> | null>(null);
   const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);

   // Init Data
   useEffect(() => {
     if (activeTab === 'users') {
        getAllUsers().then(setUsers);
     }
     if (activeTab === 'chapters' && selectedNovelId) {
        fetchNovelDetails(selectedNovelId).then(res => {
           if(res) setChapters(res.chapters);
        });
     }
   }, [activeTab, selectedNovelId]);

   if (user?.role !== UserRole.ADMIN) return <div className="p-20 text-center text-red-500 font-bold">Access Denied</div>;

   // --- User Handlers ---
   const filteredUsers = users.filter(u => u.username.toLowerCase().includes(filterUser.toLowerCase()) || u.email.toLowerCase().includes(filterUser.toLowerCase()));
   
   const handleBanUser = async (id: string) => {
      if(confirm('Are you sure you want to ban/unban this user?')) {
         await banUser(id);
         getAllUsers().then(setUsers);
      }
   }

   const handleDeleteUser = async (id: string) => {
      if(confirm('Delete this user? This cannot be undone.')) {
         await deleteUser(id);
         getAllUsers().then(setUsers);
      }
   }

   const handleRoleChange = async (id: string, currentRole: UserRole) => {
      const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
      if(confirm(`Change role to ${newRole}?`)) {
         await updateUserRole(id, newRole);
         getAllUsers().then(setUsers);
      }
   }

   // --- Novel Handlers ---
   const handleSaveNovel = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingNovel) return;
      
      const data = {
         ...editingNovel,
         genres: typeof editingNovel.genres === 'string' ? (editingNovel.genres as string).split(',').map((g: string) => g.trim()) : editingNovel.genres,
         tags: typeof editingNovel.tags === 'string' ? (editingNovel.tags as string).split(',').map((t: string) => t.trim()) : editingNovel.tags
      };

      if (editingNovel.id) {
         await updateNovel(editingNovel.id, data);
      } else {
         await addNovel(data);
      }
      setIsNovelModalOpen(false);
      setEditingNovel(null);
   };

   const handleDeleteNovel = async (id: string) => {
      if(confirm('Delete novel? All chapters will be lost.')) {
         await deleteNovel(id);
      }
   }

   // --- Chapter Handlers ---
   const handleSaveChapter = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingChapter || !selectedNovelId) return;
      
      const data = { ...editingChapter, novelId: selectedNovelId };
      
      if (editingChapter.id) {
         await updateChapter(editingChapter.id, data);
      } else {
         await addChapter(data);
      }
      
      // Refresh
      fetchNovelDetails(selectedNovelId).then(res => {
         if(res) setChapters(res.chapters);
      });
      setIsChapterModalOpen(false);
      setEditingChapter(null);
   };

   const handleDeleteChapter = async (id: string) => {
      if(confirm('Delete chapter?')) {
         await deleteChapter(id);
         fetchNovelDetails(selectedNovelId).then(res => {
            if(res) setChapters(res.chapters);
         });
      }
   }

   return (
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
         <SEOHead title="Admin Dashboard" />
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
            <div className="bg-white dark:bg-dark-800 p-1 rounded-lg border border-gray-200 dark:border-dark-700 flex shadow-sm">
               {['users', 'novels', 'chapters'].map((t: any) => (
                  <button 
                     key={t} 
                     onClick={() => setActiveTab(t)}
                     className={`px-4 py-2 rounded-md font-bold capitalize transition ${activeTab === t ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                     {t}
                  </button>
               ))}
            </div>
         </div>

         {/* --- USERS TAB --- */}
         {activeTab === 'users' && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
               <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex gap-4">
                  <input 
                     className="bg-gray-100 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded px-3 py-2 text-sm w-64 outline-none focus:border-brand-500 text-gray-900 dark:text-white" 
                     placeholder="Search users..." 
                     value={filterUser} 
                     onChange={e => setFilterUser(e.target.value)} 
                  />
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                     <thead className="bg-gray-50 dark:bg-dark-900 text-xs uppercase font-bold text-gray-500">
                        <tr>
                           <th className="px-6 py-3">User</th>
                           <th className="px-6 py-3">Role</th>
                           <th className="px-6 py-3">Joined</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                        {filteredUsers.map(u => (
                           <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                 <img src={u.avatarUrl} className="w-8 h-8 rounded-full" alt="av" />
                                 <div>
                                    <div>{u.username}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <button 
                                    onClick={() => handleRoleChange(u.id, u.role)}
                                    className={`px-2 py-1 rounded text-xs font-bold border ${u.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                 >
                                    {u.role}
                                 </button>
                              </td>
                              <td className="px-6 py-4">{new Date(u.joinedAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                 {u.isBanned ? <span className="text-red-500 font-bold">Banned</span> : <span className="text-green-500">Active</span>}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                 <button onClick={() => handleBanUser(u.id)} className="text-gray-500 hover:text-red-500" title="Ban/Unban"><i className="fa-solid fa-gavel"></i></button>
                                 <button onClick={() => handleDeleteUser(u.id)} className="text-gray-500 hover:text-red-500" title="Delete"><i className="fa-solid fa-trash"></i></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- NOVELS TAB --- */}
         {activeTab === 'novels' && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
               <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white">All Novels</h3>
                  <button 
                     onClick={() => { setEditingNovel({}); setIsNovelModalOpen(true); }}
                     className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded font-bold text-sm shadow-lg shadow-brand-600/20"
                  >
                     + Add Novel
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                     <thead className="bg-gray-50 dark:bg-dark-900 text-xs uppercase font-bold text-gray-500">
                        <tr>
                           <th className="px-6 py-3">Title</th>
                           <th className="px-6 py-3">Author</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3">Stats</th>
                           <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                        {novels.map(n => (
                           <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                              <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{n.title}</td>
                              <td className="px-6 py-4">{n.author}</td>
                              <td className="px-6 py-4"><span className="bg-gray-100 dark:bg-dark-900 px-2 py-1 rounded text-xs border border-gray-200 dark:border-dark-600">{n.status}</span></td>
                              <td className="px-6 py-4 text-xs">
                                 <div>Views: {n.views}</div>
                                 <div>Rating: {n.rating}</div>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                 <button onClick={() => { setEditingNovel(n); setIsNovelModalOpen(true); }} className="text-brand-500 hover:text-brand-600"><i className="fa-solid fa-pen"></i></button>
                                 <button onClick={() => handleDeleteNovel(n.id)} className="text-red-500 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- CHAPTERS TAB --- */}
         {activeTab === 'chapters' && (
            <div className="space-y-6">
               <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-gray-200 dark:border-dark-700 flex items-center gap-4">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Select Novel:</label>
                  <select 
                     className="bg-gray-100 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded px-3 py-2 text-sm flex-1 max-w-md outline-none focus:border-brand-500 text-gray-900 dark:text-white"
                     value={selectedNovelId}
                     onChange={e => setSelectedNovelId(e.target.value)}
                  >
                     <option value="">-- Choose a Novel --</option>
                     {novels.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                  </select>
               </div>

               {selectedNovelId && (
                  <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden animate-fade-in">
                     <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Chapters</h3>
                        <button 
                           onClick={() => { setEditingChapter({ chapterNumber: chapters.length + 1 }); setIsChapterModalOpen(true); }}
                           className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded font-bold text-sm shadow-lg shadow-brand-600/20"
                        >
                           + Add Chapter
                        </button>
                     </div>
                     <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-dark-900 text-xs uppercase font-bold text-gray-500">
                           <tr>
                              <th className="px-6 py-3">#</th>
                              <th className="px-6 py-3">Title</th>
                              <th className="px-6 py-3">Release Date</th>
                              <th className="px-6 py-3 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                           {chapters.length === 0 ? (
                              <tr><td colSpan={4} className="text-center py-8 text-gray-500">No chapters found.</td></tr>
                           ) : (
                              chapters.map(c => (
                                 <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                    <td className="px-6 py-4 font-bold">{c.chapterNumber}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white">{c.title}</td>
                                    <td className="px-6 py-4">{new Date(c.releaseDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                       <button onClick={() => { setEditingChapter(c); setIsChapterModalOpen(true); }} className="text-brand-500 hover:text-brand-600"><i className="fa-solid fa-pen"></i></button>
                                       <button onClick={() => handleDeleteChapter(c.id)} className="text-red-500 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         )}

         {/* --- MODALS --- */}
         
         {/* Novel Modal */}
         {isNovelModalOpen && editingNovel && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingNovel.id ? 'Edit Novel' : 'New Novel'}</h3>
                     <button onClick={() => setIsNovelModalOpen(false)}><i className="fa-solid fa-xmark text-xl text-gray-500"></i></button>
                  </div>
                  <form onSubmit={handleSaveNovel} className="p-6 space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Title</label>
                           <input required className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={editingNovel.title || ''} onChange={e => setEditingNovel({...editingNovel, title: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Author</label>
                           <input required className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={editingNovel.author || ''} onChange={e => setEditingNovel({...editingNovel, author: e.target.value})} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Cover URL</label>
                        <input className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={editingNovel.coverUrl || ''} onChange={e => setEditingNovel({...editingNovel, coverUrl: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Synopsis</label>
                        <textarea required rows={4} className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={editingNovel.synopsis || ''} onChange={e => setEditingNovel({...editingNovel, synopsis: e.target.value})} />
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Genres (comma separated)</label>
                           <input className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={Array.isArray(editingNovel.genres) ? editingNovel.genres.join(', ') : editingNovel.genres || ''} onChange={e => setEditingNovel({...editingNovel, genres: e.target.value as any})} placeholder="Action, Fantasy..." />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Tags (comma separated)</label>
                           <input className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={Array.isArray(editingNovel.tags) ? editingNovel.tags.join(', ') : editingNovel.tags || ''} onChange={e => setEditingNovel({...editingNovel, tags: e.target.value as any})} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                        <select className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={editingNovel.status || 'Ongoing'} onChange={e => setEditingNovel({...editingNovel, status: e.target.value as any})}>
                           <option value="Ongoing">Ongoing</option>
                           <option value="Completed">Completed</option>
                           <option value="Hiatus">Hiatus</option>
                        </select>
                     </div>
                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                        <button type="button" onClick={() => setIsNovelModalOpen(false)} className="px-4 py-2 rounded text-gray-500 font-bold">Cancel</button>
                        <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded font-bold shadow-lg">Save Novel</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Chapter Modal */}
         {isChapterModalOpen && editingChapter && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center flex-shrink-0">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingChapter.id ? 'Edit Chapter' : 'New Chapter'}</h3>
                     <button onClick={() => setIsChapterModalOpen(false)}><i className="fa-solid fa-xmark text-xl text-gray-500"></i></button>
                  </div>
                  <form onSubmit={handleSaveChapter} className="flex-1 flex flex-col p-6 space-y-4">
                     <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                           <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Chapter #</label>
                           <input type="number" required className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={editingChapter.chapterNumber || ''} onChange={e => setEditingChapter({...editingChapter, chapterNumber: parseInt(e.target.value)})} />
                        </div>
                        <div className="md:col-span-3">
                           <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Title</label>
                           <input required className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-dark-600 rounded p-2 text-gray-900 dark:text-white outline-none focus:border-brand-500" value={editingChapter.title || ''} onChange={e => setEditingChapter({...editingChapter, title: e.target.value})} />
                        </div>
                     </div>
                     <div className="flex-1 min-h-[400px] flex flex-col">
                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Content</label>
                        <RichTextEditor 
                           value={editingChapter.content || ''} 
                           onChange={html => setEditingChapter({...editingChapter, content: html})} 
                           placeholder="Write chapter content here..." 
                        />
                     </div>
                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700 flex-shrink-0">
                        <button type="button" onClick={() => setIsChapterModalOpen(false)} className="px-4 py-2 rounded text-gray-500 font-bold">Cancel</button>
                        <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded font-bold shadow-lg">Save Chapter</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

// ... HomePage, NovelPage, ReaderPage, AuthPage components ...
// Assuming they are defined here as in the previous implementation. 
// I am including them here implicitly by returning the App component structure.
// NOTE: In a real file, I would include the full content of these components.
// For the purpose of this update, I will output the FULL file content including the new AdminPanel.

const HomePage = () => {
  const { latestNovels, popularNovels, isLoadingData, user, novels } = useApp();

  if (isLoadingData) return (
     <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="bg-gray-200 dark:bg-dark-800 rounded-2xl h-96 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
           {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                 <Skeleton className="aspect-[2/3] w-full" />
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-3 w-1/2" />
              </div>
           ))}
        </div>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 md:space-y-16">
      <SEOHead title="Home" />
      <JSONLDSchema type="WebSite" data={{}} />
      
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-xl transition-colors duration-300">
         <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/40 z-10 dark:from-dark-900 dark:via-dark-900/90"></div>
         {popularNovels[0] && (
            <div className="relative z-20 flex flex-col md:flex-row items-center p-6 md:p-12 gap-8">
               <div className="md:w-1/2 space-y-4 md:space-y-6 text-center md:text-left">
                  <span className="inline-block bg-brand-500/20 text-brand-400 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Top Pick</span>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{popularNovels[0].title}</h1>
                  <p className="text-gray-300 leading-relaxed line-clamp-3 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: sanitizeHTML(popularNovels[0].synopsis.substring(0, 200)) }}></p>
                  <div className="flex gap-4 justify-center md:justify-start">
                     <Link to={`#/novel/${popularNovels[0].id}`} className="bg-brand-600 text-white px-6 md:px-8 py-3 rounded-lg font-bold hover:bg-brand-500 transition shadow-lg shadow-brand-600/30">Read Now</Link>
                     <Link to="#/browse" className="bg-white/10 backdrop-blur text-white px-6 md:px-8 py-3 rounded-lg font-bold hover:bg-white/20 transition">Browse All</Link>
                  </div>
               </div>
               <div className="md:w-1/2 flex justify-center">
                  <img src={popularNovels[0].coverUrl} className="w-40 md:w-64 rounded-lg shadow-2xl transform md:rotate-3 hover:rotate-0 transition duration-500" alt="Cover" />
               </div>
            </div>
         )}
      </section>

      {/* Continue Reading - Improved UX */}
      {user && user.readingHistory.length > 0 && (
         <section>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><i className="fa-solid fa-clock-rotate-left text-brand-500"></i> Continue Reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {user.readingHistory.slice(0, 3).map((h, i) => {
                  const novel = novels.find(n => n.id === h.novelId);
                  if (!novel) return null;
                  return (
                     <div key={i} className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                        <img src={novel.coverUrl} className="w-16 h-24 object-cover rounded shadow" alt={novel.title} />
                        <div className="flex-1 min-w-0">
                           <div className="font-bold text-gray-900 dark:text-white truncate">{novel.title}</div>
                           <div className="text-sm text-gray-500 mb-2">Chapter {h.chapterNumber}</div>
                           <Link to={`#/read/${h.chapterId}`} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-full font-bold hover:bg-brand-500">Resume Reading</Link>
                        </div>
                     </div>
                  );
               })}
            </div>
         </section>
      )}

      {/* Trending */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
          <Link to="#/rankings" className="text-brand-500 text-sm font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1">View Rankings</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {popularNovels.slice(1, 4).map((novel, idx) => (
            <div key={novel.id} className="bg-white dark:bg-dark-800 rounded-xl p-4 flex gap-4 border border-gray-200 dark:border-dark-700 hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="text-4xl font-black text-gray-200 dark:text-dark-700 select-none transition-colors duration-300">0{idx+2}</div>
              <img src={novel.coverUrl} className="w-20 h-28 object-cover rounded shadow-md group-hover:scale-105 transition duration-300" alt="cover" />
              <div className="flex-1 min-w-0">
                 <Link to={`#/novel/${novel.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 line-clamp-1 mb-1 transition-colors duration-200 block">{novel.title}</Link>
                 <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 dark:bg-dark-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">{novel.genres[0]}</span>
                    <span className="flex items-center gap-1"><i className="fa-solid fa-star text-yellow-500"></i> {novel.rating}</span>
                 </div>
                 <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{novel.author}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest */}
      <section>
        <div className="flex justify-between items-end mb-6">
           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
           <Link to="#/browse?sortBy=latest" className="text-brand-500 text-sm font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-1">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {latestNovels.map(novel => (
            <div key={novel.id} className="group">
              <div className="aspect-[2/3] rounded-lg overflow-hidden mb-3 relative shadow-md bg-gray-200 dark:bg-dark-800 transition-colors duration-300">
                <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" loading="lazy" />
                <div className="absolute top-2 left-2">
                   <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">UP</span>
                </div>
                <Link to={`#/novel/${novel.id}`} className="absolute inset-0 z-10"></Link>
              </div>
              <Link to={`#/novel/${novel.id}`} className="block text-gray-900 dark:text-white font-bold hover:text-brand-600 dark:hover:text-brand-400 line-clamp-1 mb-1 transition-colors duration-200">{novel.title}</Link>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ch. {novel.latestChapterNumber} • {new Date(novel.updatedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const NovelPage = ({ id }: { id: string }) => {
  const { fetchNovelDetails, user, novels } = useApp();
  const [data, setData] = useState<{ novel: Novel, chapters: Chapter[], reviews: Review[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchNovelDetails(id).then(res => {
      if (res) setData(res);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) return (
     <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <i className="fa-regular fa-face-frown text-6xl text-gray-300 dark:text-dark-700 mb-4 transition-colors duration-300"></i>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Novel Not Found</h2>
        <p className="text-gray-500 mb-6">The novel you are looking for does not exist or has been removed.</p>
        <Link to="#/" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-500 transition">Back Home</Link>
     </div>
  );

  if (!data) return (
     <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
           <Skeleton className="w-full md:w-72 h-96 rounded-xl" />
           <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
           </div>
        </div>
     </div>
  );
  
  const { novel, chapters, reviews } = data;
  const readingHistory = user?.readingHistory?.find(h => h.novelId === novel.id);
  const activeReaders = Math.floor(Math.random() * 50) + 10;
  const relatedNovels = novels.filter(n => n.id !== novel.id && n.genres.some(g => novel.genres.includes(g))).slice(0, 4);

  const handleShare = () => {
     navigator.clipboard.writeText(window.location.href);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{label: 'Home', path: '#/'}, {label: 'Library', path: '#/browse'}, {label: novel.title}]} />
      <SEOHead title={novel.title} description={novel.synopsis} image={novel.coverUrl} type="book" />
      <JSONLDSchema type="Breadcrumb" data={{ items: [{ name: "Home", url: window.location.origin }, { name: "Library", url: `${window.location.origin}/#/browse` }, { name: novel.title, url: window.location.href }] }} />
      <JSONLDSchema type="Book" data={novel} />

      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 md:p-10 border border-gray-200 dark:border-dark-700 shadow-xl mb-8 flex flex-col md:flex-row gap-8 md:gap-12 transition-colors duration-300">
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mb-6 ring-1 ring-black/5 dark:ring-white/10 mx-auto md:mx-0 max-w-[200px] md:max-w-none">
            <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3">
             <SaveButton novelId={novel.id} savedCount={novel.saves} />
             <VoteButton novelId={novel.id} dailyVotes={novel.dailyVotes} />
             <div className="flex gap-2">
                <button onClick={handleShare} className="flex-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 py-2 rounded font-bold text-sm hover:bg-gray-200 dark:hover:bg-dark-600 transition">
                   <i className={`fa-solid ${copied ? 'fa-check text-green-500' : 'fa-share-nodes'}`}></i> {copied ? 'Copied' : 'Share'}
                </button>
             </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4 justify-center md:justify-start">
             {novel.genres.map(g => (
                <Link key={g} to={`#/browse?genre=${encodeURIComponent(g)}`} className="bg-brand-50 dark:bg-brand-900/50 hover:bg-brand-100 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors duration-200">
                  {g}
                </Link>
             ))}
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${novel.status === 'Ongoing' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'} transition-colors duration-200`}>{novel.status}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight text-center md:text-left text-balance">{novel.title}</h1>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-200 dark:border-dark-700 pb-6 transition-colors duration-300">
            <span className="flex items-center gap-2"><i className="fa-regular fa-user"></i> {novel.author}</span>
            <span className="flex items-center gap-2"><i className="fa-regular fa-eye"></i> {novel.views.toLocaleString()} Views</span>
            <span className="flex items-center gap-2 text-yellow-500"><i className="fa-solid fa-star"></i> {novel.rating} <span className="text-gray-500 dark:text-gray-500">({novel.ratingCount})</span></span>
            <span className="flex items-center gap-2 text-green-500 font-medium animate-pulse"><i className="fa-solid fa-users-viewfinder"></i> {activeReaders} reading now</span>
          </div>

          <div className="mb-8">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Synopsis</h3>
             <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base prose dark:prose-invert max-w-none transition-colors duration-300" dangerouslySetInnerHTML={{__html: sanitizeHTML(novel.synopsis)}}></div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {novel.tags.map(tag => (
              <Link key={tag} to={`#/browse?tag=${encodeURIComponent(tag)}`} className="bg-gray-100 dark:bg-dark-900 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-dark-700 transition-colors duration-200">#{tag}</Link>
            ))}
          </div>

          {readingHistory ? (
             <div className="bg-brand-50 dark:bg-brand-600/10 border border-brand-200 dark:border-brand-500/30 p-5 rounded-xl flex items-center justify-between transition-colors duration-300">
                <div>
                   <div className="text-brand-600 dark:text-brand-400 text-xs font-bold uppercase mb-1">Continue Reading</div>
                   <div className="text-gray-900 dark:text-white font-bold">Chapter {readingHistory.chapterNumber}</div>
                </div>
                <Link to={`#/read/${readingHistory.chapterId}`} className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-brand-600/20 active:scale-95 transition-all">Resume</Link>
             </div>
          ) : (
             chapters.length > 0 && (
                <div className="text-center md:text-left">
                   <Link to={`#/read/${chapters[0].id}`} className="inline-block bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-brand-600/20 active:scale-95 transition-all">Start Reading</Link>
                </div>
             )
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><i className="fa-solid fa-list-ul text-brand-500"></i> Chapters</h3>
            <div className="grid md:grid-cols-2 gap-3 bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 max-h-[600px] overflow-y-auto custom-scrollbar transition-colors duration-300">
               {chapters.map(chapter => (
                 <Link 
                   key={chapter.id} 
                   to={`#/read/${chapter.id}`}
                   className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-900 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-800 hover:border-brand-300 dark:hover:border-brand-500/30 group transition-all duration-200"
                 >
                   <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white font-medium truncate pr-2">
                     <span className="text-brand-500 mr-2 opacity-70 group-hover:opacity-100">#{chapter.chapterNumber}</span>
                     {chapter.title}
                   </span>
                   <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(chapter.releaseDate).toLocaleDateString()}</span>
                 </Link>
               ))}
            </div>
            <ReviewSection novelId={novel.id} reviews={reviews} user={user} />
         </div>
         
         <div className="space-y-8">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 transition-colors duration-300">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4">About Author</h3>
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 text-xl font-bold">{novel.author[0]}</div>
                  <div>
                     <div className="text-gray-900 dark:text-white font-bold">{novel.author}</div>
                     <div className="text-xs text-gray-500">Author</div>
                  </div>
               </div>
               <button className="w-full text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 py-2 rounded font-bold text-sm hover:bg-brand-50 dark:hover:bg-brand-900/30 transition">Follow Author</button>
            </div>

            {relatedNovels.length > 0 && (
               <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 transition-colors duration-300">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">You might also like</h3>
                  <div className="space-y-4">
                     {relatedNovels.map(n => (
                        <Link key={n.id} to={`#/novel/${n.id}`} className="flex gap-3 hover:bg-gray-50 dark:hover:bg-dark-700 p-2 rounded -mx-2 transition">
                           <img src={n.coverUrl} className="w-12 h-16 object-cover rounded shadow" alt={n.title} />
                           <div>
                              <div className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{n.title}</div>
                              <div className="text-xs text-gray-500 mb-1">{n.genres[0]}</div>
                              <div className="text-xs text-yellow-500"><i className="fa-solid fa-star"></i> {n.rating}</div>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const ReaderPage = ({ id }: { id: string }) => {
  const { fetchChapter, fetchNovelDetails, updateProgress, user, theme } = useApp();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18, lineHeight: 1.8, paragraphSpacing: 24, textAlign: 'left', fontFamily: 'sans', theme: theme === 'dark' ? 'dark' : 'light', maxWidth: 800
  });
  const [showSettings, setShowSettings] = useState(false);
  const [prevChap, setPrevChap] = useState<string | null>(null);
  const [nextChap, setNextChap] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);

  // Sync initial reader theme with app theme
  useEffect(() => {
     setSettings(s => ({ ...s, theme: theme === 'dark' ? 'dark' : 'light' }));
  }, [theme]);

  const loadData = async () => {
    const cData = await fetchChapter(id);
    if (cData) {
      setChapter(cData.chapter);
      setComments(cData.comments);
      const n = await fetchNovelDetails(cData.chapter.novelId);
      if (n) {
         setNovel(n.novel);
         const idx = n.chapters.findIndex(ch => ch.id === cData.chapter.id);
         setPrevChap(idx > 0 ? n.chapters[idx - 1].id : null);
         setNextChap(idx < n.chapters.length - 1 ? n.chapters[idx + 1].id : null);
      }
    }
  };

  useEffect(() => { loadData(); window.scrollTo(0,0); }, [id]);

  useEffect(() => {
     const handleScroll = () => {
        if (!chapter || !novel) return;
        const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const pct = (window.scrollY / h) * 100;
        setScrollPct(pct);
        if (pct > 20 && user) { 
           updateProgress({
              novelId: novel.id, chapterId: chapter.id, chapterNumber: chapter.chapterNumber,
              lastReadAt: new Date().toISOString(), scrollPercentage: pct
           });
        }
     };
     window.addEventListener('scroll', handleScroll);
     return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter, novel, user]);

  if (!chapter || !novel) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  const themeClasses = { dark: 'bg-dark-900 text-gray-300', light: 'bg-gray-50 text-gray-900', sepia: 'bg-[#f4ecd8] text-[#5b4636]' };

  return (
    <div className={`min-h-screen ${themeClasses[settings.theme]} transition-colors duration-300 relative`}>
      <SEOHead title={`${chapter.title} - ${novel.title}`} description={`Read ${chapter.title} online.`} type="article" />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-brand-500 z-[60]" style={{width: `${scrollPct}%`}}></div>

      {/* Reader Navbar */}
      <div className={`fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40 transition-colors duration-300 ${settings.theme === 'dark' ? 'bg-dark-900/95 border-b border-dark-800' : 'bg-white/95 border-b border-gray-200'} backdrop-blur shadow-sm`}>
        <Link to={`#/novel/${chapter.novelId}`} className="text-sm font-bold hover:text-brand-500 flex items-center gap-2"><i className="fa-solid fa-chevron-left"></i> {novel.title}</Link>
        <div className="flex items-center gap-6">
           <span className="text-xs opacity-60 font-mono hidden sm:inline">Chapter {chapter.chapterNumber}</span>
           <button onClick={() => setShowSettings(!showSettings)} className="text-lg opacity-70 hover:opacity-100 p-2"><i className="fa-solid fa-font"></i></button>
        </div>
      </div>

      {/* Floating Prev/Next Buttons */}
      <div className="hidden lg:flex fixed top-1/2 left-4 z-30 transform -translate-y-1/2">
         {prevChap && <Link to={`#/read/${prevChap}`} className="w-12 h-12 flex items-center justify-center bg-gray-200/50 dark:bg-dark-800/50 hover:bg-brand-600 hover:text-white rounded-full transition shadow-lg backdrop-blur" title="Previous Chapter"><i className="fa-solid fa-chevron-left"></i></Link>}
      </div>
      <div className="hidden lg:flex fixed top-1/2 right-4 z-30 transform -translate-y-1/2">
         {nextChap && <Link to={`#/read/${nextChap}`} className="w-12 h-12 flex items-center justify-center bg-gray-200/50 dark:bg-dark-800/50 hover:bg-brand-600 hover:text-white rounded-full transition shadow-lg backdrop-blur" title="Next Chapter"><i className="fa-solid fa-chevron-right"></i></Link>}
      </div>

      {/* Settings Drawer */}
      {showSettings && (
         <div className="fixed top-14 right-4 w-72 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-2xl p-5 z-50 text-gray-900 dark:text-gray-200 animate-fade-in-down transition-colors duration-300">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Reader Settings</h4>
            <div className="space-y-4">
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                     <button onClick={() => setSettings({...settings, theme: 'light'})} className={`py-2 bg-gray-100 text-gray-900 rounded border-2 ${settings.theme === 'light' ? 'border-brand-500' : 'border-transparent'}`}><i className="fa-solid fa-sun"></i></button>
                     <button onClick={() => setSettings({...settings, theme: 'sepia'})} className={`py-2 bg-[#f4ecd8] text-[#5b4636] rounded border-2 ${settings.theme === 'sepia' ? 'border-brand-500' : 'border-transparent'}`}><i className="fa-solid fa-mug-hot"></i></button>
                     <button onClick={() => setSettings({...settings, theme: 'dark'})} className={`py-2 bg-dark-900 text-gray-100 rounded border-2 ${settings.theme === 'dark' ? 'border-brand-500' : 'border-transparent'}`}><i className="fa-solid fa-moon"></i></button>
                  </div>
               </div>
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Font Size ({settings.fontSize}px)</label>
                  <div className="flex gap-2 mb-2">
                     <button onClick={() => setSettings({...settings, fontSize: 16})} className="flex-1 py-1 bg-gray-100 dark:bg-dark-700 rounded text-xs">Small</button>
                     <button onClick={() => setSettings({...settings, fontSize: 18})} className="flex-1 py-1 bg-gray-100 dark:bg-dark-700 rounded text-sm">Medium</button>
                     <button onClick={() => setSettings({...settings, fontSize: 22})} className="flex-1 py-1 bg-gray-100 dark:bg-dark-700 rounded text-base">Large</button>
                  </div>
                  <input type="range" min="14" max="28" value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: parseInt(e.target.value)})} className="w-full accent-brand-500 h-1 bg-gray-300 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer" />
               </div>
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => setSettings({...settings, fontFamily: 'sans'})} className={`py-1 text-sm rounded border ${settings.fontFamily === 'sans' ? 'bg-brand-600 border-brand-500 text-white' : 'border-gray-300 dark:border-dark-600'}`}>Sans</button>
                     <button onClick={() => setSettings({...settings, fontFamily: 'serif'})} className={`py-1 text-sm rounded border font-serif ${settings.fontFamily === 'serif' ? 'bg-brand-600 border-brand-500 text-white' : 'border-gray-300 dark:border-dark-600'}`}>Serif</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Content */}
      <div className="pt-24 pb-32 px-4 mx-auto transition-all" style={{ maxWidth: `${settings.maxWidth}px` }}>
         <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">{chapter.title}</h1>
         
         <div 
            className={`prose ${settings.theme === 'dark' ? 'prose-invert' : ''} max-w-none select-none reader-content`}
            style={{ 
               fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight,
               fontFamily: settings.fontFamily === 'serif' ? 'Merriweather, serif' : 'Inter, sans-serif',
               textAlign: settings.textAlign, marginBottom: `${settings.paragraphSpacing}px`
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(chapter.content) }}
         ></div>

         <div className="flex justify-between items-center mt-16 pt-8 border-t border-opacity-20 border-gray-500">
            {prevChap ? <Link to={`#/read/${prevChap}`} className="px-6 py-3 bg-gray-200 dark:bg-dark-700 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 text-gray-900 dark:text-white rounded-lg font-bold transition flex items-center gap-2"><i className="fa-solid fa-arrow-left"></i> Prev</Link> : <div></div>}
            {nextChap ? <Link to={`#/read/${nextChap}`} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold transition flex items-center gap-2">Next <i className="fa-solid fa-arrow-right"></i></Link> : 
               <Link to={`#/novel/${novel.id}`} className="px-6 py-3 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-900 dark:text-white rounded-lg font-bold">Finish</Link>
            }
         </div>

         <div className="mt-10">
           {/* Reusing comment section but making sure it adapts to reader settings if needed, or keeping standard app theme */}
           <div className={`p-4 rounded-xl ${settings.theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'} transition-colors duration-300`}>
              <CommentSection chapterId={chapter.id} comments={comments} user={user} />
           </div>
         </div>
      </div>
    </div>
  );
};

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const { login, register } = useApp();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password, form.remember);
      else await register(form.username, form.email, form.password);
      navigate('#/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SEOHead title={mode === 'login' ? 'Login' : 'Register'} />
      <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl border border-gray-200 dark:border-dark-700 w-full max-w-md shadow-2xl transition-colors duration-300">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{mode === 'login' ? 'Welcome Back' : 'Join NovaRead'}</h2>
           <p className="text-gray-500 text-sm">Enter your details to continue</p>
        </div>
        {error && <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-500/20 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
               <i className="fa-regular fa-user absolute left-3 top-3.5 text-gray-400"></i>
               <input className="w-full bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-dark-700 p-3 pl-10 rounded-lg focus:border-brand-500 outline-none transition-colors duration-200" placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
          )}
          <div className="relative">
             <i className="fa-regular fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
             <input className="w-full bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-dark-700 p-3 pl-10 rounded-lg focus:border-brand-500 outline-none transition-colors duration-200" placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="relative">
             <i className="fa-solid fa-lock absolute left-3 top-3.5 text-gray-400"></i>
             <input className="w-full bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white border border-gray-300 dark:border-dark-700 p-3 pl-10 rounded-lg focus:border-brand-500 outline-none transition-colors duration-200" placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          
          {mode === 'login' && (
             <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                   <input type="checkbox" className="accent-brand-500" checked={form.remember} onChange={e => setForm({...form, remember: e.target.checked})} />
                   Remember Me
                </label>
                <Link to="#/forgot-password" className="text-brand-500 hover:underline">Forgot Password?</Link>
             </div>
          )}

          <button disabled={loading} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold p-3 rounded-lg transition transform hover:-translate-y-0.5 shadow-lg shadow-brand-600/20 mt-2">
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
           {mode === 'login' ? "New to NovaRead? " : "Already have an account? "}
           <Link to={mode === 'login' ? '#/register' : '#/login'} className="text-brand-500 hover:underline font-bold">
             {mode === 'login' ? 'Create Account' : 'Log In'}
           </Link>
        </p>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { route, params } = useRouter();
  const { isLoadingAuth } = useApp();

  if (isLoadingAuth) return <div className="h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-white"><i className="fa-solid fa-book-open-reader fa-bounce text-4xl text-brand-500"></i></div>;

  const getPage = () => {
    switch (true) {
      case route.startsWith('#/novel/'): return <NovelPage id={params.id} />;
      case route.startsWith('#/read/'): return <ReaderPage id={params.id} />;
      case route.startsWith('#/browse'): return <SearchResultsPage />;
      case route.startsWith('#/library'): return <LibraryPage />;
      case route === '#/rankings': return <RankingsPage />;
      case route === '#/login': return <AuthPage mode="login" />;
      case route === '#/register': return <AuthPage mode="register" />;
      case route === '#/forgot-password': return <ForgotPasswordPage />;
      case route === '#/admin': return <AdminPanel />;
      case route === '#/profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  return (
    <div id="main-content" className="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-300">
      <ToastContainer />
      <ScrollToTop />
      {!route.startsWith('#/read/') && <Navbar />}
      {getPage()}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;