// LUMERA AI – Mock Data Service

export type MetricTrend = 'up' | 'down' | 'stable';

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
  iconName: any; // using lucide icon names
  route: string;
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
};
