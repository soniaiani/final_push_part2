// Serviciu pentru gestionarea sistemului de badge-uri
import type { Post } from '../components/MainFeed';

// Interfață pentru un badge
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji sau icon
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'posts' | 'likes' | 'comments' | 'engagement' | 'milestone';
}

// Interfață pentru cerințele unui badge
export interface BadgeRequirement {
  badge: Badge;
  requirement: string; // Descrierea cerinței
  target: number; // Valoarea țintă
  current: number; // Valoarea curentă
  progress: number; // Procentaj (0-100)
  isEarned: boolean; // Dacă badge-ul a fost câștigat
}

// Interfață pentru statisticile utilizatorului
export interface UserStats {
  postsCreated: number;
  likesReceived: number;
  likesGiven: number;
  commentsMade: number;
  commentsReceived: number;
  daysActive: number;
  badges: string[]; // Array de badge IDs
}

// Definiții badge-uri
export const BADGE_DEFINITIONS: Record<string, Badge> = {
  // Badge-uri pentru postări
  FIRST_POST: {
    id: 'FIRST_POST',
    name: 'Prima Postare',
    description: 'Ai creat prima ta postare!',
    icon: '🎉',
    rarity: 'common',
    category: 'posts'
  },
  POST_MILESTONE_10: {
    id: 'POST_MILESTONE_10',
    name: 'Creator Activist',
    description: 'Ai creat 10 postări!',
    icon: '📝',
    rarity: 'rare',
    category: 'posts'
  },
  POST_MILESTONE_25: {
    id: 'POST_MILESTONE_25',
    name: 'Autor Prolific',
    description: 'Ai creat 25 de postări!',
    icon: '📚',
    rarity: 'epic',
    category: 'posts'
  },
  POST_MILESTONE_50: {
    id: 'POST_MILESTONE_50',
    name: 'Legendă Socială',
    description: 'Ai creat 50 de postări!',
    icon: '👑',
    rarity: 'legendary',
    category: 'posts'
  },
  
  // Badge-uri pentru like-uri primite
  FIRST_LIKE_RECEIVED: {
    id: 'FIRST_LIKE_RECEIVED',
    name: 'Primul Like',
    description: 'Ai primit primul like!',
    icon: '👍',
    rarity: 'common',
    category: 'likes'
  },
  LIKES_MILESTONE_10: {
    id: 'LIKES_MILESTONE_10',
    name: 'Apreciat',
    description: 'Ai primit 10 like-uri!',
    icon: '❤️',
    rarity: 'rare',
    category: 'likes'
  },
  LIKES_MILESTONE_50: {
    id: 'LIKES_MILESTONE_50',
    name: 'Popular',
    description: 'Ai primit 50 de like-uri!',
    icon: '💝',
    rarity: 'epic',
    category: 'likes'
  },
  LIKES_MILESTONE_100: {
    id: 'LIKES_MILESTONE_100',
    name: 'Superstar',
    description: 'Ai primit 100 de like-uri!',
    icon: '⭐',
    rarity: 'legendary',
    category: 'likes'
  },
  
  // Badge-uri pentru like-uri date
  FIRST_LIKE_GIVEN: {
    id: 'FIRST_LIKE_GIVEN',
    name: 'Primul Apreciat',
    description: 'Ai dat primul like!',
    icon: '🤝',
    rarity: 'common',
    category: 'likes'
  },
  LIKER_50: {
    id: 'LIKER_50',
    name: 'Generos',
    description: 'Ai dat 50 de like-uri!',
    icon: '💖',
    rarity: 'rare',
    category: 'likes'
  },
  
  // Badge-uri pentru comentarii
  FIRST_COMMENT: {
    id: 'FIRST_COMMENT',
    name: 'Primul Comentariu',
    description: 'Ai făcut primul comentariu!',
    icon: '💬',
    rarity: 'common',
    category: 'comments'
  },
  COMMENTER_10: {
    id: 'COMMENTER_10',
    name: 'Comunicativ',
    description: 'Ai făcut 10 comentarii!',
    icon: '🗣️',
    rarity: 'rare',
    category: 'comments'
  },
  COMMENTER_25: {
    id: 'COMMENTER_25',
    name: 'Social Butterfly',
    description: 'Ai făcut 25 de comentarii!',
    icon: '🦋',
    rarity: 'epic',
    category: 'comments'
  },
  
  // Badge-uri pentru engagement
  ENGAGEMENT_MASTER: {
    id: 'ENGAGEMENT_MASTER',
    name: 'Maestru al Interacțiunii',
    description: 'Ai primit peste 10 comentarii la postările tale!',
    icon: '🎯',
    rarity: 'epic',
    category: 'engagement'
  },
  VIRAL_POST: {
    id: 'VIRAL_POST',
    name: 'Post Viral',
    description: 'O postare a primit peste 20 de like-uri!',
    icon: '🔥',
    rarity: 'epic',
    category: 'engagement'
  },
  
  // Badge-uri milestone
  WEEK_ONE: {
    id: 'WEEK_ONE',
    name: 'Prima Săptămână',
    description: 'Ești activ de o săptămână!',
    icon: '📅',
    rarity: 'rare',
    category: 'milestone'
  },
  MONTH_ONE: {
    id: 'MONTH_ONE',
    name: 'Primul Luna',
    description: 'Ești activ de o lună!',
    icon: '🗓️',
    rarity: 'epic',
    category: 'milestone'
  }
};

/**
 * Obține statisticile utilizatorului din localStorage
 */
export function getUserStats(username: string): UserStats {
  try {
    const stored = localStorage.getItem(`userStats_${username}`);
    if (stored) {
      return JSON.parse(stored) as UserStats;
    }
  } catch (error) {
    console.error('Eroare la citirea statisticilor:', error);
  }
  
  // Returnează statistici default
  return {
    postsCreated: 0,
    likesReceived: 0,
    likesGiven: 0,
    commentsMade: 0,
    commentsReceived: 0,
    daysActive: 0,
    badges: []
  };
}

/**
 * Salvează statisticile utilizatorului în localStorage
 */
export function saveUserStats(username: string, stats: UserStats): void {
  try {
    localStorage.setItem(`userStats_${username}`, JSON.stringify(stats));
  } catch (error) {
    console.error('Eroare la salvarea statisticilor:', error);
  }
}

/**
 * Obține badge-urile utilizatorului
 */
export function getUserBadges(username: string): Badge[] {
  const stats = getUserStats(username);
  return stats.badges
    .map(badgeId => BADGE_DEFINITIONS[badgeId])
    .filter((badge): badge is Badge => badge !== undefined);
}

/**
 * Verifică și acordă badge-uri pe baza statisticilor
 */
export function checkAndAwardBadges(
  username: string,
  stats: UserStats,
  posts?: Post[]
): Badge[] {
  const newBadges: Badge[] = [];
  const existingBadgeIds = new Set(stats.badges);
  
  // Verifică badge-uri pentru postări create
  if (stats.postsCreated >= 1 && !existingBadgeIds.has('FIRST_POST')) {
    newBadges.push(BADGE_DEFINITIONS.FIRST_POST);
    stats.badges.push('FIRST_POST');
    existingBadgeIds.add('FIRST_POST');
  }
  if (stats.postsCreated >= 10 && !existingBadgeIds.has('POST_MILESTONE_10')) {
    newBadges.push(BADGE_DEFINITIONS.POST_MILESTONE_10);
    stats.badges.push('POST_MILESTONE_10');
    existingBadgeIds.add('POST_MILESTONE_10');
  }
  if (stats.postsCreated >= 25 && !existingBadgeIds.has('POST_MILESTONE_25')) {
    newBadges.push(BADGE_DEFINITIONS.POST_MILESTONE_25);
    stats.badges.push('POST_MILESTONE_25');
    existingBadgeIds.add('POST_MILESTONE_25');
  }
  if (stats.postsCreated >= 50 && !existingBadgeIds.has('POST_MILESTONE_50')) {
    newBadges.push(BADGE_DEFINITIONS.POST_MILESTONE_50);
    stats.badges.push('POST_MILESTONE_50');
    existingBadgeIds.add('POST_MILESTONE_50');
  }
  
  // Verifică badge-uri pentru like-uri primite
  if (stats.likesReceived >= 1 && !existingBadgeIds.has('FIRST_LIKE_RECEIVED')) {
    newBadges.push(BADGE_DEFINITIONS.FIRST_LIKE_RECEIVED);
    stats.badges.push('FIRST_LIKE_RECEIVED');
    existingBadgeIds.add('FIRST_LIKE_RECEIVED');
  }
  if (stats.likesReceived >= 10 && !existingBadgeIds.has('LIKES_MILESTONE_10')) {
    newBadges.push(BADGE_DEFINITIONS.LIKES_MILESTONE_10);
    stats.badges.push('LIKES_MILESTONE_10');
    existingBadgeIds.add('LIKES_MILESTONE_10');
  }
  if (stats.likesReceived >= 50 && !existingBadgeIds.has('LIKES_MILESTONE_50')) {
    newBadges.push(BADGE_DEFINITIONS.LIKES_MILESTONE_50);
    stats.badges.push('LIKES_MILESTONE_50');
    existingBadgeIds.add('LIKES_MILESTONE_50');
  }
  if (stats.likesReceived >= 100 && !existingBadgeIds.has('LIKES_MILESTONE_100')) {
    newBadges.push(BADGE_DEFINITIONS.LIKES_MILESTONE_100);
    stats.badges.push('LIKES_MILESTONE_100');
    existingBadgeIds.add('LIKES_MILESTONE_100');
  }
  
  // Verifică badge-uri pentru like-uri date
  if (stats.likesGiven >= 1 && !existingBadgeIds.has('FIRST_LIKE_GIVEN')) {
    newBadges.push(BADGE_DEFINITIONS.FIRST_LIKE_GIVEN);
    stats.badges.push('FIRST_LIKE_GIVEN');
    existingBadgeIds.add('FIRST_LIKE_GIVEN');
  }
  if (stats.likesGiven >= 50 && !existingBadgeIds.has('LIKER_50')) {
    newBadges.push(BADGE_DEFINITIONS.LIKER_50);
    stats.badges.push('LIKER_50');
    existingBadgeIds.add('LIKER_50');
  }
  
  // Verifică badge-uri pentru comentarii
  if (stats.commentsMade >= 1 && !existingBadgeIds.has('FIRST_COMMENT')) {
    newBadges.push(BADGE_DEFINITIONS.FIRST_COMMENT);
    stats.badges.push('FIRST_COMMENT');
    existingBadgeIds.add('FIRST_COMMENT');
  }
  if (stats.commentsMade >= 10 && !existingBadgeIds.has('COMMENTER_10')) {
    newBadges.push(BADGE_DEFINITIONS.COMMENTER_10);
    stats.badges.push('COMMENTER_10');
    existingBadgeIds.add('COMMENTER_10');
  }
  if (stats.commentsMade >= 25 && !existingBadgeIds.has('COMMENTER_25')) {
    newBadges.push(BADGE_DEFINITIONS.COMMENTER_25);
    stats.badges.push('COMMENTER_25');
    existingBadgeIds.add('COMMENTER_25');
  }
  
  // Verifică badge-uri pentru engagement
  if (stats.commentsReceived >= 10 && !existingBadgeIds.has('ENGAGEMENT_MASTER')) {
    newBadges.push(BADGE_DEFINITIONS.ENGAGEMENT_MASTER);
    stats.badges.push('ENGAGEMENT_MASTER');
    existingBadgeIds.add('ENGAGEMENT_MASTER');
  }
  
  // Verifică badge-uri pentru postări virale (dacă avem acces la postări)
  if (posts) {
    const hasViralPost = posts.some(post => post.likes >= 20 && post.author === username);
    if (hasViralPost && !existingBadgeIds.has('VIRAL_POST')) {
      newBadges.push(BADGE_DEFINITIONS.VIRAL_POST);
      stats.badges.push('VIRAL_POST');
      existingBadgeIds.add('VIRAL_POST');
    }
  }
  
  return newBadges;
}

/**
 * Actualizează statisticile utilizatorului pe baza postărilor
 */
export function updateStatsFromPosts(username: string, posts: Post[]): UserStats {
  const stats = getUserStats(username);
  
  // Resetăm statisticile și le recalculăm din postări
  stats.postsCreated = posts.filter(p => p.author === username).length;
  
  // Calculează like-uri primite (din postările utilizatorului)
  stats.likesReceived = posts
    .filter(p => p.author === username)
    .reduce((sum, post) => sum + post.likes, 0);
  
  // Calculează comentarii primite (din postările utilizatorului)
  stats.commentsReceived = posts
    .filter(p => p.author === username)
    .reduce((sum, post) => sum + post.comments.length, 0);
  
  // Calculează comentarii făcute (din comentariile la toate postările)
  stats.commentsMade = posts
    .reduce((sum, post) => {
      return sum + post.comments.filter(c => c.author === username).length;
    }, 0);
  
  return stats;
}

/**
 * Incrementează contorul de like-uri date
 */
export function incrementLikesGiven(username: string): void {
  const stats = getUserStats(username);
  stats.likesGiven += 1;
  saveUserStats(username, stats);
}

/**
 * Obține numărul total de badge-uri pentru un utilizator
 */
export function getTotalBadgeCount(username: string): number {
  const stats = getUserStats(username);
  return stats.badges.length;
}

/**
 * Obține badge-urile grupate pe categorie
 */
export function getBadgesByCategory(username: string): Record<string, Badge[]> {
  const badges = getUserBadges(username);
  const grouped: Record<string, Badge[]> = {
    posts: [],
    likes: [],
    comments: [],
    engagement: [],
    milestone: []
  };
  
  badges.forEach(badge => {
    if (grouped[badge.category]) {
      grouped[badge.category].push(badge);
    }
  });
  
  return grouped;
}

/**
 * Obține toate badge-urile disponibile cu cerințele și progresul
 */
export function getAllBadgeRequirements(username: string, posts?: Post[]): BadgeRequirement[] {
  const stats = getUserStats(username);
  const earnedBadgeIds = new Set(stats.badges);
  const requirements: BadgeRequirement[] = [];
  
  // Helper pentru a calcula progresul
  const calculateProgress = (current: number, target: number): number => {
    if (target === 0) return current > 0 ? 100 : 0;
    return Math.min(100, Math.round((current / target) * 100));
  };
  
  // Helper pentru a crea un BadgeRequirement
  const createRequirement = (
    badgeId: string,
    requirement: string,
    current: number,
    target: number
  ): BadgeRequirement => {
    const badge = BADGE_DEFINITIONS[badgeId];
    if (!badge) return null as any;
    
    return {
      badge,
      requirement,
      current,
      target,
      progress: calculateProgress(current, target),
      isEarned: earnedBadgeIds.has(badgeId)
    };
  };
  
  // Badge-uri pentru postări
  requirements.push(createRequirement('FIRST_POST', 'Creează 1 postare', stats.postsCreated, 1));
  requirements.push(createRequirement('POST_MILESTONE_10', 'Creează 10 postări', stats.postsCreated, 10));
  requirements.push(createRequirement('POST_MILESTONE_25', 'Creează 25 de postări', stats.postsCreated, 25));
  requirements.push(createRequirement('POST_MILESTONE_50', 'Creează 50 de postări', stats.postsCreated, 50));
  
  // Badge-uri pentru like-uri primite
  requirements.push(createRequirement('FIRST_LIKE_RECEIVED', 'Primește 1 like', stats.likesReceived, 1));
  requirements.push(createRequirement('LIKES_MILESTONE_10', 'Primește 10 like-uri', stats.likesReceived, 10));
  requirements.push(createRequirement('LIKES_MILESTONE_50', 'Primește 50 de like-uri', stats.likesReceived, 50));
  requirements.push(createRequirement('LIKES_MILESTONE_100', 'Primește 100 de like-uri', stats.likesReceived, 100));
  
  // Badge-uri pentru like-uri date
  requirements.push(createRequirement('FIRST_LIKE_GIVEN', 'Dă 1 like', stats.likesGiven, 1));
  requirements.push(createRequirement('LIKER_50', 'Dă 50 de like-uri', stats.likesGiven, 50));
  
  // Badge-uri pentru comentarii
  requirements.push(createRequirement('FIRST_COMMENT', 'Fă 1 comentariu', stats.commentsMade, 1));
  requirements.push(createRequirement('COMMENTER_10', 'Fă 10 comentarii', stats.commentsMade, 10));
  requirements.push(createRequirement('COMMENTER_25', 'Fă 25 de comentarii', stats.commentsMade, 25));
  
  // Badge-uri pentru engagement
  requirements.push(createRequirement('ENGAGEMENT_MASTER', 'Primește 10 comentarii la postările tale', stats.commentsReceived, 10));
  
  // Badge-ul pentru post viral (necesită verificare specială)
  if (posts) {
    const hasViralPost = posts.some(post => post.likes >= 20 && post.author === username);
    const maxLikes = posts
      .filter(p => p.author === username)
      .reduce((max, post) => Math.max(max, post.likes), 0);
    
    const viralBadge = BADGE_DEFINITIONS.VIRAL_POST;
    requirements.push({
      badge: viralBadge,
      requirement: 'O postare ta să primească 20 de like-uri',
      current: maxLikes,
      target: 20,
      progress: calculateProgress(maxLikes, 20),
      isEarned: earnedBadgeIds.has('VIRAL_POST') || hasViralPost
    });
  } else {
    const viralBadge = BADGE_DEFINITIONS.VIRAL_POST;
    requirements.push({
      badge: viralBadge,
      requirement: 'O postare ta să primească 20 de like-uri',
      current: 0,
      target: 20,
      progress: 0,
      isEarned: earnedBadgeIds.has('VIRAL_POST')
    });
  }
  
  // Badge-uri milestone (pentru moment nu avem tracking pentru daysActive)
  // Le putem marca ca "în dezvoltare" sau le putem exclude
  const weekBadge = BADGE_DEFINITIONS.WEEK_ONE;
  requirements.push({
    badge: weekBadge,
    requirement: 'Fii activ pe platformă pentru o săptămână',
    current: stats.daysActive,
    target: 7,
    progress: calculateProgress(stats.daysActive, 7),
    isEarned: earnedBadgeIds.has('WEEK_ONE')
  });
  
  const monthBadge = BADGE_DEFINITIONS.MONTH_ONE;
  requirements.push({
    badge: monthBadge,
    requirement: 'Fii activ pe platformă pentru o lună',
    current: stats.daysActive,
    target: 30,
    progress: calculateProgress(stats.daysActive, 30),
    isEarned: earnedBadgeIds.has('MONTH_ONE')
  });
  
  return requirements.filter(r => r !== null);
}

/**
 * Obține cerințele badge-urilor grupate pe categorie
 */
export function getBadgeRequirementsByCategory(
  username: string,
  posts?: Post[]
): Record<string, BadgeRequirement[]> {
  const requirements = getAllBadgeRequirements(username, posts);
  const grouped: Record<string, BadgeRequirement[]> = {
    posts: [],
    likes: [],
    comments: [],
    engagement: [],
    milestone: []
  };
  
  requirements.forEach(req => {
    if (grouped[req.badge.category]) {
      grouped[req.badge.category].push(req);
    }
  });
  
  return grouped;
}

