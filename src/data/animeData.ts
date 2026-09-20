export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string; // e.g. "24 dk"
  thumbnail: string;
  videoUrl: string; // HTML5 video source
  releaseDate: string;
  description: string;
}

export interface Comment {
  id: string;
  userName: string;
  avatar: string;
  date: string;
  text: string;
  likes: number;
  isSpoiler?: boolean;
}

export interface Anime {
  id: string;
  title: string;
  japaneseTitle: string;
  coverImage: string;
  bannerImage: string;
  rating: number; // e.g. 8.9
  episodesCount: number;
  status: 'Devam Ediyor' | 'Tamamlandı';
  year: number;
  season: 'İlkbahar' | 'Yaz' | 'Sonbahar' | 'Kış';
  studio: string;
  genres: string[];
  description: string;
  featured?: boolean;
  episodes: Episode[];
  comments: Comment[];
}

export interface WatchHistoryItem {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  animeTitle: string;
  animeCover: string;
  progressSeconds: number;
  totalSeconds: number;
  lastWatchedAt: number; // timestamp
}

// Royalty-free HD video sources for live streaming demo
const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
];

export const ANIMES: Anime[] = [
  {
    id: 'solo-leveling',
    title: 'Solo Leveling (Ore dake Level Up na Ken)',
    japaneseTitle: '俺だけレベルアップな件',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
    rating: 8.9,
    episodesCount: 12,
    status: 'Devam Ediyor',
    year: 2024,
    season: 'Kış',
    studio: 'A-1 Pictures',
    genres: ['Aksiyon', 'Fantezi', 'Macera', 'Süper Güç'],
    description: 'On altı yıl önce "Kapı" adı verilen ve dünyamız ile başka bir boyutu birbirine bağlayan bir geçit belirdi. Dünyada "Avcı" adı verilen özel yetenekli insanlar türedi. En zayıf E-Rütbeli avcı Sung Jin-Woo, ölümcül bir zindanda gizemli bir görev tamamladıktan sonra yalnız başına seviye atlayabilme yeteneği kazanır.',
    featured: true,
    comments: [
      {
        id: 'c1',
        userName: 'GölgeAvcısı99',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GölgeAvcısı99',
        date: '2 saat önce',
        text: 'Çizimler ve savaş sahneleri tek kelimeyle muazzam! Jin-Woo\'nun gelişimi harika işlenmiş.',
        likes: 42
      },
      {
        id: 'c2',
        userName: 'AnimeOtaku_TR',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnimeOtaku_TR',
        date: '1 gün önce',
        text: 'Manhwa okuyucusu olarak uyarlamayı çok beğendim. Müzikler de Hiroyuki Sawano imzalı olunca ayrı bir hava katmış.',
        likes: 28,
        isSpoiler: false
      }
    ],
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: `solo-leveling-ep-${i + 1}`,
      number: i + 1,
      title: i === 0 ? 'Bölüm 1: Alışkın Olduğum Bir Şey' : i === 1 ? 'Bölüm 2: Bir Başka Zindan' : i === 2 ? 'Bölüm 3: Bu Bir Görev mi?' : `Bölüm ${i + 1}: Gölge Yükseliyor`,
      duration: '23 dk',
      thumbnail: `https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop`,
      videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
      releaseDate: `${i + 1} Ocak 2024`,
      description: `Sung Jin-Woo ve ekibinin tehlikeli zindandaki heyecan dolu mücadelesi devam ediyor.`
    }))
  },
  {
    id: 'jujutsu-kaisen-s2',
    title: 'Jujutsu Kaisen 2. Sezon',
    japaneseTitle: '呪術廻戦',
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    rating: 9.1,
    episodesCount: 23,
    status: 'Tamamlandı',
    year: 2023,
    season: 'Yaz',
    studio: 'MAPPA',
    genres: ['Aksiyon', 'Fantezi', 'Doğaüstü', 'Okul'],
    description: 'Satoru Gojo ve Suguru Geto\'nun lise yıllarındaki geçmiş görevleri (Göz Alıcı Geçmiş Arkı) ve Cadılar Bayramı gecesinde Shibuya\'da patlak veren büyük felaket (Shibuya Incident Arkı).',
    featured: true,
    comments: [
      {
        id: 'c3',
        userName: 'GojoFan_34',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GojoFan_34',
        date: '3 gün önce',
        text: 'Shibuya arkı animasyon tarihinde bir dönüm noktasıdır!',
        likes: 115
      }
    ],
    episodes: Array.from({ length: 23 }, (_, i) => ({
      id: `jujutsu-kaisen-s2-ep-${i + 1}`,
      number: i + 1,
      title: `Bölüm ${i + 1}: ${i < 5 ? 'Gizli Envanter / Geçmiş' : 'Shibuya Olayı'}`,
      duration: '24 dk',
      thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[(i + 1) % SAMPLE_VIDEOS.length],
      releaseDate: `${i + 1} Temmuz 2023`,
      description: 'Lanolin ve büyülü enerjiler arasındaki kıyasıya savaş Shibuya sokaklarında alevleniyor.'
    }))
  },
  {
    id: 'demon-slayer-hashira',
    title: 'Demon Slayer: Kimetsu no Yaiba - Hashira Eğitimi',
    japaneseTitle: '鬼滅の刃 柱稽古編',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    rating: 8.7,
    episodesCount: 8,
    status: 'Tamamlandı',
    year: 2024,
    season: 'İlkbahar',
    studio: 'ufotable',
    genres: ['Aksiyon', 'Tarihi', 'Doğaüstü', 'Şounen'],
    description: 'Muzan Kibutsuji ile nihai savaşa hazırlanan İblis Keser Birliği, Hashira\'lar (Sütunlar) önderliğinde zorlu bir antrenman kampına girer. Tanjiro ve arkadaşları güçlerini sınırların ötesine taşımalıdır.',
    featured: false,
    comments: [
      {
        id: 'c4',
        userName: 'Tanjiro_TR',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tanjiro_TR',
        date: '5 gün önce',
        text: 'Ufotable yine döktürmüş, renk paleti ve efektler büyüleyici.',
        likes: 67
      }
    ],
    episodes: Array.from({ length: 8 }, (_, i) => ({
      id: `demon-slayer-ep-${i + 1}`,
      number: i + 1,
      title: `Bölüm ${i + 1}: Hashira Antrenmanı Başlıyor`,
      duration: '24 dk',
      thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[(i + 2) % SAMPLE_VIDEOS.length],
      releaseDate: `${i + 12} Mayıs 2024`,
      description: 'Sütunların her biri genç iblis avcılarını sınırlarına kadar zorluyor.'
    }))
  },
  {
    id: 'frieren',
    title: 'Frieren: Beyond Journey\'s End (Sousou no Frieren)',
    japaneseTitle: '葬送のフリーレン',
    coverImage: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
    rating: 9.3,
    episodesCount: 28,
    status: 'Tamamlandı',
    year: 2023,
    season: 'Sonbahar',
    studio: 'Madhouse',
    genres: ['Macera', 'Dram', 'Fantezi'],
    description: 'İblis Kralı yendikten sonra kahraman grubu dağılır. Elf büyücü Frieren binlerce yıl yaşayabildiği için insani duyguları ve zamanın kıymetini arkadaşlarının vefatından sonra anlamaya başlar.',
    featured: true,
    comments: [
      {
        id: 'c5',
        userName: 'FrierenFan',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=FrierenFan',
        date: '1 hafta önce',
        text: 'Şu ana kadar izlediğim en huzur verici ve aynı zamanda derin anime.',
        likes: 204
      }
    ],
    episodes: Array.from({ length: 28 }, (_, i) => ({
      id: `frieren-ep-${i + 1}`,
      number: i + 1,
      title: `Bölüm ${i + 1}: Yolculuğun Sonu ve Başlangıcı`,
      duration: '24 dk',
      thumbnail: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=400&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[(i + 3) % SAMPLE_VIDEOS.length],
      releaseDate: `${i + 1} Eylül 2023`,
      description: 'Frieren, insanları ve büyü sanatını yeniden keşfetmek üzere seyahatine devam eder.'
    }))
  },
  {
    id: 'attack-on-titan-final',
    title: 'Attack on Titan: The Final Season',
    japaneseTitle: '進撃の巨人',
    coverImage: 'https://images.unsplash.com/photo-1569705460033-cfaa4b368e6a?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
    rating: 9.0,
    episodesCount: 30,
    status: 'Tamamlandı',
    year: 2023,
    season: 'Sonbahar',
    studio: 'MAPPA',
    genres: ['Aksiyon', 'Gizem', 'Dram', 'Siyasi'],
    description: 'Eren Jaeger\'in başlattığı "Gürleme" (Rumbling) dünyayı yok etme tehdidi taşırken, eski dostları ve düşmanları insanlığın son umudu olmak için birleşir.',
    featured: false,
    comments: [
      {
        id: 'c6',
        userName: 'ErenYeager_TR',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ErenYeager_TR',
        date: '2 hafta önce',
        text: 'Tarihin en efsanevi serilerinden biri şanına yakışır bitti.',
        likes: 310
      }
    ],
    episodes: Array.from({ length: 30 }, (_, i) => ({
      id: `aot-ep-${i + 1}`,
      number: i + 1,
      title: `Bölüm ${i + 1}: Okyanusun Ötesi`,
      duration: '24 dk',
      thumbnail: 'https://images.unsplash.com/photo-1569705460033-cfaa4b368e6a?q=80&w=400&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[(i + 4) % SAMPLE_VIDEOS.length],
      releaseDate: `2023`,
      description: 'Sur arkasındaki gerçekler ve insanlığın özgürlük savaşı.'
    }))
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
    rating: 8.6,
    episodesCount: 12,
    status: 'Tamamlandı',
    year: 2022,
    season: 'Sonbahar',
    studio: 'MAPPA',
    genres: ['Aksiyon', 'Korku', 'Doğaüstü', 'Komedi'],
    description: 'Babısının borçları yüzünden şeytan avcılığı yapan Denji, Testere Şeytanı Pochita ile birleşerek "Chainsaw Man" olarak yeniden doğar ve Resmi Şeytan Avcıları\'na katılır.',
    featured: false,
    comments: [
      {
        id: 'c7',
        userName: 'PochitaLover',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PochitaLover',
        date: '1 ay önce',
        text: 'Makima\'nın seslendirmesi ve müziği harika.',
        likes: 55
      }
    ],
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: `csm-ep-${i + 1}`,
      number: i + 1,
      title: `Bölüm ${i + 1}: Dog & Chainsaw`,
      duration: '24 dk',
      thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
      releaseDate: `2022`,
      description: 'Denji\'nin ilginç ve kanlı macerası.'
    }))
  }
];

export const GENRES = [
  'Tümü',
  'Aksiyon',
  'Fantezi',
  'Macera',
  'Doğaüstü',
  'Şounen',
  'Dram',
  'Korku',
  'Gizem',
  'Okul'
];
