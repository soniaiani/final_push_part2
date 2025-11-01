import React, { useState, useEffect } from 'react';
import { User, changePassword } from '../services/authServices';
import {
  getUserBadges,
  getBadgesByCategory,
  getAllBadgeRequirements,
  getBadgeRequirementsByCategory,
  Badge,
  BadgeRequirement
} from '../services/badgeService';

// URL-ul initial al avatarului - ADJUTAT 'export'
export const INITIAL_AVATAR_URL = 'https://via.placeholder.com/150/007AFF/FFFFFF?text=U'; 

// Interfață pentru o Postare
interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  authorAvatarUrl?: string;
  likes: number;
  isLiked: boolean;
  comments: any[];
}

interface ProfileProps {
  viewedUser?: User; // Utilizatorul al carui profil este vizualizat (opțional)
}

const Profile: React.FC<ProfileProps> = ({ viewedUser }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'edit' | 'password' | 'badges'>('details');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(INITIAL_AVATAR_URL);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [badgesByCategory, setBadgesByCategory] = useState<Record<string, Badge[]>>({});
  const [badgeRequirements, setBadgeRequirements] = useState<BadgeRequirement[]>([]);
  const [badgeRequirementsByCategory, setBadgeRequirementsByCategory] = useState<Record<string, BadgeRequirement[]>>({});
  const [showBadgeGuide, setShowBadgeGuide] = useState(false); // Toggle între badge-uri câștigate și ghid complet
  const isViewingOwnProfile = !viewedUser; // Dacă nu e specificat un viewedUser, înseamnă că vizualizează propriul profil
  
  // State pentru schimbarea parolei
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Functie pentru incarcarea postarilor utilizatorului
  const loadUserPosts = () => {
    try {
      if (!user) return;
      
      const stored = localStorage.getItem('feedPosts');
      let allPosts: Post[] = [];
      
      // Postari initiale (hardcodate in MainFeed)
      const initialPosts: Post[] = [
        {
          id: 1,
          author: 'Andrei Guinea',
          content: 'Sybau.',
          timestamp: 'Acum 5 minute',
          imageUrl: undefined,
          authorAvatarUrl: 'https://picsum.photos/50/50?random=10',
          likes: 5,
          isLiked: false,
          comments: []
        },
        {
          id: 2,
          author: 'Delia Farcas',
          content: 'Sesiunea de training React Native a fost super productivă azi! Ne vedem săptămâna viitoare pentru partea a II-a.',
          timestamp: 'Acum 1 oră',
          authorAvatarUrl: INITIAL_AVATAR_URL,
          likes: 12,
          isLiked: true,
          comments: []
        }
      ];
      
      // Incarca postari din localStorage
      if (stored) {
        try {
          allPosts = JSON.parse(stored) as Post[];
        } catch (e) {
          console.error('Eroare la parsarea postărilor:', e);
        }
      }
      
      // Combina postarile initiale cu cele din localStorage
      const combinedPosts = [...initialPosts, ...allPosts];
      
      // Filtreaza postarile dupa numele utilizatorului
      const filtered = combinedPosts.filter(post => post.author === user.name);
      
      // Elimina duplicatele (daca exista) si sorteaza dupa ID descrescator
      const uniquePosts = filtered.filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      );
      uniquePosts.sort((a, b) => b.id - a.id);
      
      setUserPosts(uniquePosts);
    } catch (error) {
      console.error('Eroare la încărcarea postărilor:', error);
    }
  };

  // Citeste datele utilizatorului din localStorage cand componenta se incarca
  useEffect(() => {
    // Dacă este specificat un viewedUser, folosește-l; altfel încarcă utilizatorul curent
    if (viewedUser) {
      setUser(viewedUser);
      const initials = viewedUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
      const avatarUrl = `https://via.placeholder.com/150/007AFF/FFFFFF?text=${initials}`;
      setCurrentAvatarUrl(avatarUrl);
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData) as User;
          setUser(parsedUser);
          // Genereaza avatar placeholder bazat pe initiale
          const initials = parsedUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
          
          // CORECTIA SINTAXEI: Folosim backticks (`)
          const avatarUrl = `https://via.placeholder.com/150/007AFF/FFFFFF?text=${initials}`;
          
          setCurrentAvatarUrl(avatarUrl);
        } catch (error) {
          console.error('Eroare la citirea datelor utilizatorului:', error);
        }
      }
    }
  }, [viewedUser]);

  // Incarca postarile si badge-urile cand user-ul este disponibil
  useEffect(() => {
    if (user) {
      loadUserPosts();
      loadUserBadges();
    }
    
    // Asculta la schimbari in localStorage pentru postari (pentru ferestre diferite)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'feedPosts' && user) {
        loadUserPosts();
        loadUserBadges();
      }
      if (e.key && e.key.startsWith('userStats_') && user) {
        loadUserBadges();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Asculta la schimbari locale (pentru aceeasi fereastra) - custom event
    const handleCustomStorageChange = () => {
      if (user) {
        loadUserPosts();
        loadUserBadges();
      }
    };
    window.addEventListener('feedPostsUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('feedPostsUpdated', handleCustomStorageChange);
    };
  }, [user]);

  // Functie pentru incarcarea badge-urilor utilizatorului
  const loadUserBadges = () => {
    if (!user) return;
    const badges = getUserBadges(user.username);
    setUserBadges(badges);
    setBadgesByCategory(getBadgesByCategory(user.username));
    
    // Încarcă postările pentru a calcula progresul badge-urilor
    try {
      const stored = localStorage.getItem('feedPosts');
      let allPosts: Post[] = [];
      
      // Postari initiale (hardcodate in MainFeed)
      const initialPosts: Post[] = [
        {
          id: 1,
          author: 'Andrei Guinea',
          content: 'Sybau.',
          timestamp: 'Acum 5 minute',
          imageUrl: undefined,
          authorAvatarUrl: 'https://picsum.photos/50/50?random=10',
          likes: 5,
          isLiked: false,
          comments: []
        },
        {
          id: 2,
          author: 'Delia Farcas',
          content: 'Sesiunea de training React Native a fost super productivă azi! Ne vedem săptămâna viitoare pentru partea a II-a.',
          timestamp: 'Acum 1 oră',
          authorAvatarUrl: INITIAL_AVATAR_URL,
          likes: 12,
          isLiked: true,
          comments: []
        }
      ];
      
      if (stored) {
        try {
          allPosts = JSON.parse(stored) as Post[];
        } catch (e) {
          console.error('Eroare la parsarea postărilor:', e);
        }
      }
      
      const combinedPosts = [...initialPosts, ...allPosts];
      const requirements = getAllBadgeRequirements(user.username, combinedPosts);
      setBadgeRequirements(requirements);
      setBadgeRequirementsByCategory(getBadgeRequirementsByCategory(user.username, combinedPosts));
    } catch (error) {
      console.error('Eroare la încărcarea cerințelor badge-urilor:', error);
      const requirements = getAllBadgeRequirements(user.username);
      setBadgeRequirements(requirements);
      setBadgeRequirementsByCategory(getBadgeRequirementsByCategory(user.username));
    }
  };

  // Functie pentru gestionarea schimbarii pozei de profil
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    
    if (file) {
      if (file.size > 2000000) { 
          setUploadError('Fisierul este prea mare (Max 2MB).');
          return;
      }

      const newLocalUrl = URL.createObjectURL(file);
      setCurrentAvatarUrl(newLocalUrl);
      
      uploadAvatarToServer(file);
    }
  };
  
  // Functie async pentru a simula trimiterea fisierului catre server
  const uploadAvatarToServer = async (file: File) => {
      setIsUploading(true);
      try {
          // Simulare de asteptare si succes
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          
          alert('Poza de profil a fost incarcata cu succes in baza de date (Simulare)!');
      } catch (error) {
          setUploadError('Eroare de retea. Nu s-a putut contacta serverul.');
      } finally {
          setIsUploading(false);
      }
  };

  // Functie pentru gestionarea schimbarii parolei
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangingPassword(true);

    try {
      if (!user) {
        setPasswordError('Nu exista utilizator autentificat.');
        return;
      }

      const result = await changePassword(
        user.username,
        oldPassword,
        newPassword,
        confirmPassword
      );

      if (result.success) {
        setPasswordSuccess(result.message || 'Parola a fost schimbata cu succes!');
        // Curata formularul
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message || 'A aparut o eroare la schimbarea parolei.');
      }
    } catch (error) {
      setPasswordError('A aparut o eroare neasteptata.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Daca nu exista date despre utilizator, afiseaza un mesaj
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <p className="text-gray-600">Nu exista date despre utilizator. Te rugam sa te loghezi.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalii Personale</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard title="Email" value={user.email} />
                <DetailCard title="Departament" value={user.department || 'N/A'} />
                <DetailCard title="Manager" value={user.manager || 'N/A'} />
                <DetailCard title="Locatie" value={user.location} />
                <DetailCard title="Pozitie" value={user.jobTitle} />
              </div>
              {user.description && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900 uppercase mb-2">Descriere</h3>
                  <p className="text-blue-800">{user.description}</p>
                </div>
              )}
            </div>

            {/* Sectiunea de Postari */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Postările Mele</h2>
              {userPosts.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-gray-500">Nu ai postat încă nimic.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <UserPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'activity':
        // Activitatea este disponibila doar pentru propriul profil
        if (!isViewingOwnProfile) {
          return (
            <div className="space-y-4">
              <p className="text-gray-500">Nu ai acces la activitatea acestui utilizator.</p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Jurnal de Activitate Recenta</h2>
            <ActivityItem description="A schimbat parola." timestamp="Acum 2 zile" />
            <ActivityItem description="A actualizat detaliile de contact." timestamp="2025-10-30" />
          </div>
        );
      case 'edit':
        // Editarea este disponibila doar pentru propriul profil
        if (!isViewingOwnProfile) {
          return (
            <div className="space-y-4">
              <p className="text-gray-500">Nu poți edita profilul altui utilizator.</p>
            </div>
          );
        }
        return (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-xl font-semibold text-gray-800">Schimbare Poza de Profil</h2>
            <div className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                
                {/* Avatarul curent */}
                <img 
                    className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover mb-4" 
                    src={currentAvatarUrl} 
                    alt="Avatar curent" 
                />
                
                <p className="text-gray-600 mb-4">
                    {isUploading ? 'Se incarca...' : 'Incarca o poza noua (PNG, JPG).'}
                </p>
                
                {uploadError && <p className="text-red-500 text-sm mb-2">{uploadError}</p>}
                
                {/* Input de tip fisier ascuns, asociat cu label-ul */}
                <input 
                    type="file" 
                    id="avatar-upload"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarChange}
                    className="hidden" 
                    disabled={isUploading}
                />
                
                <label 
                    htmlFor="avatar-upload"
                    className={`cursor-pointer px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-lg ${
                        isUploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isUploading ? 'Procesare...' : 'Alege o imagine noua'}
                </label>

                <p className="text-sm text-gray-400 mt-4">
                    Poza va fi salvata in baza de date MySQL (prin backend) dupa incarcare.
                </p>
            </div>
          </div>
        );
      case 'badges':
        return (
          <div className="space-y-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {showBadgeGuide ? 'Ghid Badge-uri' : 'Badge-uri Câștigate'}
                </h2>
                {!showBadgeGuide && (
                  <p className="text-gray-600">
                    Ai câștigat <span className="font-bold text-indigo-600">{userBadges.length}</span> badge-uri!
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowBadgeGuide(!showBadgeGuide)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
              >
                {showBadgeGuide ? 'Vezi Badge-uri Câștigate' : 'Vezi Toate Badge-urile'}
              </button>
            </div>

            {showBadgeGuide ? (
              // Vizualizare completă - toate badge-urile cu cerințe și progres
              <div className="space-y-8">
                {Object.entries(badgeRequirementsByCategory).map(([category, requirements]) => {
                  if (requirements.length === 0) return null;
                  
                  const categoryNames: Record<string, string> = {
                    posts: '📝 Postări',
                    likes: '❤️ Like-uri',
                    comments: '💬 Comentarii',
                    engagement: '🎯 Engagement',
                    milestone: '📅 Milestone'
                  };

                  return (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        {categoryNames[category] || category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requirements.map((req) => (
                          <BadgeRequirementCard key={req.badge.id} requirement={req} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Vizualizare doar badge-uri câștigate
              userBadges.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
                  <div className="text-6xl mb-4">🎖️</div>
                  <p className="text-gray-500 text-lg">Nu ai câștigat încă badge-uri.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Postează, apreciază și comentează pentru a câștiga badge-uri!
                  </p>
                  <button
                    onClick={() => setShowBadgeGuide(true)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                  >
                    Vezi Cum Să Câștigi Badge-uri
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(badgesByCategory).map(([category, badges]) => {
                    if (badges.length === 0) return null;
                    
                    const categoryNames: Record<string, string> = {
                      posts: '📝 Postări',
                      likes: '❤️ Like-uri',
                      comments: '💬 Comentarii',
                      engagement: '🎯 Engagement',
                      milestone: '📅 Milestone'
                    };

                    return (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                          {categoryNames[category] || category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {badges.map((badge) => (
                            <BadgeCard key={badge.id} badge={badge} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        );
      case 'password':
        // Schimbarea parolei este disponibila doar pentru propriul profil
        if (!isViewingOwnProfile) {
          return (
            <div className="space-y-4">
              <p className="text-gray-500">Nu poți schimba parola altui utilizator.</p>
            </div>
          );
        }
        return (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-xl font-semibold text-gray-800">Schimbare Parola</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Parola veche */}
              <div>
                <label
                  htmlFor="old-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parola Curenta
                </label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Introduceti parola curenta"
                  disabled={isChangingPassword}
                  autoComplete="current-password"
                />
              </div>

              {/* Parola noua */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parola Noua
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Introduceti parola noua (min. 6 caractere)"
                  disabled={isChangingPassword}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirmare parola noua */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmare Parola Noua
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirmati parola noua"
                  disabled={isChangingPassword}
                  autoComplete="new-password"
                />
              </div>

              {/* Mesaje de eroare si succes */}
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-md p-3">
                  {passwordSuccess}
                </div>
              )}

              {/* Buton de submit */}
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-lg ${
                  isChangingPassword
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isChangingPassword ? 'Se schimba parola...' : 'Schimba Parola'}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Parola noua trebuie sa aiba minim 6 caractere si sa fie diferita de parola curenta.
              </p>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header de Profil (Vizual Frumos) */}
        <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row items-center space-x-6">
            <img 
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" 
              src={currentAvatarUrl} 
              alt="Avatar" 
            />
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold">{user.name}</h1>
              <p className="text-blue-200 text-lg mt-1">{user.jobTitle}</p>
              {userBadges.length > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-lg">🎖️</span>
                  <span className="text-blue-100 text-sm font-semibold">
                    {userBadges.length} {userBadges.length === 1 ? 'badge' : 'badge-uri'} câștigate
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meniul de Tab-uri - doar pentru propriul profil */}
        {isViewingOwnProfile && (
          <div className="bg-white border-b border-gray-200">
            <div className="flex justify-start space-x-4 px-8">
              <TabButton label="Detalii Profil" tab="details" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton label="Badge-uri" tab="badges" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton label="Activitate" tab="activity" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton label="Editeaza Avatar" tab="edit" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton label="Schimbare Parola" tab="password" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        )}
        
        {/* Pentru profilul altuia, doar tab-ul de detalii si badge-uri */}
        {!isViewingOwnProfile && (
          <div className="bg-white border-b border-gray-200">
            <div className="flex justify-start space-x-4 px-8">
              <TabButton label="Detalii Profil" tab="details" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton label="Badge-uri" tab="badges" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        )}

        {/* Continutul Sectiunilor */}
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Componenta Auxiliara pentru Cardul de Detaliu
const DetailCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase">{title}</h4>
        <p className="text-gray-800 font-medium mt-1">{value}</p>
    </div>
);

// Componenta Auxiliara pentru Postarea Utilizatorului
const UserPostCard: React.FC<{ post: Post }> = ({ post }) => {
  const initials = post.author
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-3">
        {post.authorAvatarUrl ? (
          <img 
            src={post.authorAvatarUrl} 
            alt={post.author}
            className="w-8 h-8 rounded-full object-cover mr-2"
          />
        ) : (
          <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-2 text-sm">
            {initials}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{post.author}</p>
          <span className="text-xs text-gray-500">{post.timestamp}</span>
        </div>
      </div>
      <p className="text-gray-800 mb-3">{post.content}</p>
      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt="Post media" 
          className="rounded-lg w-full h-auto object-cover max-h-64 mt-2"
        />
      )}
      <div className="flex items-center text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
        {post.likes > 0 && <span className="mr-4">👍 {post.likes}</span>}
        {post.comments.length > 0 && <span>💬 {post.comments.length}</span>}
      </div>
    </div>
  );
};

// Componenta Auxiliara pentru Elementul de Activitate
const ActivityItem: React.FC<{ description: string; timestamp: string }> = ({ description, timestamp }) => (
    <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-gray-700">{description}</p>
        <span className="text-sm text-gray-500">{timestamp}</span>
    </div>
);

// Componenta Auxiliara pentru Butonul de Tab
const TabButton: React.FC<{ label: string; tab: string; activeTab: string; setActiveTab: (tab: any) => void }> = ({ label, tab, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`py-3 px-1 transition-colors duration-200 ${
            activeTab === tab
                ? 'border-b-3 border-indigo-600 text-indigo-600 font-semibold border-b-2'
                : 'text-gray-500 hover:text-indigo-600'
        }`}
    >
        {label}
    </button>
);

// Componenta pentru afișarea unui badge
const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
  const rarityColors: Record<string, string> = {
    common: 'bg-gray-100 border-gray-300 text-gray-800',
    rare: 'bg-blue-100 border-blue-300 text-blue-800',
    epic: 'bg-purple-100 border-purple-300 text-purple-800',
    legendary: 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400 text-yellow-900'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${rarityColors[badge.rarity]} shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-center space-x-3">
        <div className="text-4xl">{badge.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-lg">{badge.name}</div>
          <div className="text-sm opacity-90 mt-1">{badge.description}</div>
          <div className="mt-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              badge.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-900' :
              badge.rarity === 'epic' ? 'bg-purple-200 text-purple-900' :
              badge.rarity === 'rare' ? 'bg-blue-200 text-blue-900' :
              'bg-gray-200 text-gray-900'
            }`}>
              {badge.rarity.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componenta pentru afișarea unui badge cu cerințe și progres
const BadgeRequirementCard: React.FC<{ requirement: BadgeRequirement }> = ({ requirement }) => {
  const { badge, requirement: reqText, current, target, progress, isEarned } = requirement;
  
  const rarityColors: Record<string, string> = {
    common: isEarned 
      ? 'bg-gray-100 border-gray-300 text-gray-800' 
      : 'bg-gray-50 border-gray-200 text-gray-600 opacity-75',
    rare: isEarned 
      ? 'bg-blue-100 border-blue-300 text-blue-800' 
      : 'bg-blue-50 border-blue-200 text-blue-600 opacity-75',
    epic: isEarned 
      ? 'bg-purple-100 border-purple-300 text-purple-800' 
      : 'bg-purple-50 border-purple-200 text-purple-600 opacity-75',
    legendary: isEarned 
      ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400 text-yellow-900' 
      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-600 opacity-75'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${rarityColors[badge.rarity]} shadow-md hover:shadow-lg transition-shadow relative`}>
      {isEarned && (
        <div className="absolute top-2 right-2">
          <span className="text-2xl">✓</span>
        </div>
      )}
      <div className="flex items-start space-x-3">
        <div className={`text-4xl ${isEarned ? '' : 'grayscale opacity-50'}`}>{badge.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-lg flex items-center space-x-2">
            <span>{badge.name}</span>
            {isEarned && <span className="text-green-600">✓</span>}
          </div>
          <div className="text-sm opacity-90 mt-1 mb-3">
            <p className="font-semibold">{reqText}</p>
          </div>
          
          {!isEarned && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progres: {current} / {target}</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress === 100 ? 'bg-green-500' :
                    progress >= 50 ? 'bg-blue-500' :
                    progress > 0 ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {isEarned && (
            <div className="mt-2 text-xs text-green-700 font-semibold">
              ✓ Badge câștigat!
            </div>
          )}
          
          <div className="mt-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              badge.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-900' :
              badge.rarity === 'epic' ? 'bg-purple-200 text-purple-900' :
              badge.rarity === 'rare' ? 'bg-blue-200 text-blue-900' :
              'bg-gray-200 text-gray-900'
            }`}>
              {badge.rarity.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;