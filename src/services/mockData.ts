// LUMERA AI – Mock Data Service

export type MetricTrend = 'up' | 'down' | 'stable';
export type RecommendationCategory = 'all' | 'hydration' | 'pore' | 'makeup' | 'routine';
export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface SkinMetric {
  label: string;
  labelEn: string;
  value: number;
  maxValue: number;
  unit: string;
  trend: MetricTrend;
  trendDelta: number;
}

export interface QuickAction {
  id: string;
  label: string;
  iconName: any;
  route: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: Exclude<RecommendationCategory, 'all'>;
  priority: RecommendationPriority;
  iconName: string;
  completedToday: boolean;
}

export const MockData = {
  currentUser: {
    id: 'usr_001',
    name: 'Elena',
    surname: 'Kovač',
    email: 'elena.kovac@lumera.ai',
    avatarUrl: null,
    tier: 'premium',
  },

  latestAnalysis: {
    id: 'analysis_042',
    overallScore: 84,
    analyzedAt: new Date('2026-05-07'),
    nextScanIn: 3,
    metrics: [
      {
        label: 'Nemlendirme',
        labelEn: 'Hydration',
        value: 78,
        maxValue: 100,
        unit: '%',
        trend: 'up' as MetricTrend,
        trendDelta: 4,
      },
      {
        label: 'Gözenek',
        labelEn: 'Pore Size',
        value: 62,
        maxValue: 100,
        unit: '%',
        trend: 'stable' as MetricTrend,
        trendDelta: 0,
      },
      {
        label: 'Elastikiyet',
        labelEn: 'Elasticity',
        value: 91,
        maxValue: 100,
        unit: '%',
        trend: 'up' as MetricTrend,
        trendDelta: 7,
      },
      {
        label: 'Ton Eşitliği',
        labelEn: 'Tone Even',
        value: 73,
        maxValue: 100,
        unit: '%',
        trend: 'down' as MetricTrend,
        trendDelta: -2,
      },
      {
        label: 'Parlaklık',
        labelEn: 'Radiance',
        value: 88,
        maxValue: 100,
        unit: '%',
        trend: 'up' as MetricTrend,
        trendDelta: 11,
      },
    ],
  },

  weeklyReport: {
    weekNumber: 19,
    startDate: new Date('2026-05-04'),
    endDate: new Date('2026-05-10'),
    scoreDelta: 4,
    summary:
      'Bu hafta en büyük gelişme parlaklık ve elastikiyette görüldü. Ton eşitsizliği hafif arttı, sabah rutininde C vitamini öneriliyor.',
    highlights: [
      'Parlaklık +11 puan arttı',
      'Elastikiyet tüm zamanların en yüksek değerinde',
      'Nemlendirme hedef skora yaklaşıyor',
    ],
    isReady: true,
  },

  quickActions: [
    { id: 'scan', label: 'Tara', iconName: 'ScanFace', route: '/scan' },
    { id: 'progress', label: 'İlerleme', iconName: 'TrendingUp', route: '/progress' },
    { id: 'routine', label: 'Rutin', iconName: 'CheckCircle2', route: '/routine' },
    { id: 'makeup', label: 'Makyaj', iconName: 'Brush', route: '/makeup' },
  ],

  recommendations: [
    {
      id: 'rec_001',
      title: 'C Vitamini Serumu Uygula',
      description: 'Sabah rutininde C vitamini serumu kullanmak ton eşitliğini ve parlaklığı artırır. Güneş kremi öncesi uygulanmalı.',
      category: 'hydration' as const,
      priority: 'high' as const,
      iconName: 'Droplets',
      completedToday: false,
    },
    {
      id: 'rec_002',
      title: 'Gözenek Sıkılaştırıcı Maske',
      description: 'Haftada 2 kez kil maskesi uygulamak gözenek görünümünü belirgin şekilde azaltır.',
      category: 'pore' as const,
      priority: 'medium' as const,
      iconName: 'Aperture',
      completedToday: true,
    },
    {
      id: 'rec_003',
      title: 'Hafif Fondöten Kullan',
      description: 'Mevcut cilt tipine göre nemlendirici içerikli, gözenek tıkamayan hafif bir fondöten tercih et.',
      category: 'makeup' as const,
      priority: 'medium' as const,
      iconName: 'Palette',
      completedToday: false,
    },
    {
      id: 'rec_004',
      title: 'Gece Rutini: Retinol',
      description: 'Haftada 2-3 kez düşük konsantrasyonlu retinol kullanımı elastikiyeti artırır ve ince çizgileri azaltır.',
      category: 'routine' as const,
      priority: 'high' as const,
      iconName: 'Moon',
      completedToday: false,
    },
    {
      id: 'rec_005',
      title: 'Hyalüronik Asit Nemlendirici',
      description: 'Günde 2 kez hiyalüronik asit bazlı nemlendirici, cilt bariyerini onarır ve su tutma kapasitesini artırır.',
      category: 'hydration' as const,
      priority: 'high' as const,
      iconName: 'Droplets',
      completedToday: true,
    },
    {
      id: 'rec_006',
      title: 'SPF 50+ Güneş Koruyucu',
      description: 'Her sabah, bulutlu havada bile SPF 50+ güneş koruyucu kullanmak cilt yaşlanmasını yavaşlatır.',
      category: 'routine' as const,
      priority: 'high' as const,
      iconName: 'Sun',
      completedToday: false,
    },
    {
      id: 'rec_007',
      title: 'Göz Çevresi Aydınlatıcı',
      description: 'Koyu halka ve şişlik için kafein içerikli göz kremi sabah akşam uygulanabilir.',
      category: 'makeup' as const,
      priority: 'low' as const,
      iconName: 'Eye',
      completedToday: false,
    },
    {
      id: 'rec_008',
      title: 'BHA ile Gözenek Temizliği',
      description: 'Salisilik asit içerikli tonik haftada 3 kez kullanarak gözeneklerin derinlemesine temizlenmesini sağla.',
      category: 'pore' as const,
      priority: 'high' as const,
      iconName: 'Aperture',
      completedToday: false,
    },
  ] as Recommendation[],
};
