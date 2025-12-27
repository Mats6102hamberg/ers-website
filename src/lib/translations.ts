export type Language = 'sv' | 'no';

export const translations = {
  sv: {
    // Header
    title: 'Enterprise Research Shield',
    subtitle: 'Live säkerhetsövervakning för Norge-mötet',
    exportButton: 'Exportera Audit-logg (CSV)',
    autoRefresh: 'Auto-refresh (10s)',
    
    // Time ranges
    lastHour: 'Senaste timmen',
    lastDay: 'Senaste dygnet',
    lastWeek: 'Senaste veckan',
    lastMonth: 'Senaste månaden',
    
    // Metrics
    totalScans: 'Totala skanningar',
    blocked: 'Blockerade',
    avgRisk: 'Genomsnittlig risk',
    status: 'Status',
    active: 'Aktiv',
    systemOperational: 'System operativt',
    perHour: 'per timme',
    blockRate: 'blockerat',
    riskScore: 'Risk score',
    
    // Chart
    riskTrend: 'Risk Trend - Senaste 7 dagarna',
    criticalBlocked: 'CRITICAL: Blockerade emails',
    highSanitized: 'HIGH: Saniterade emails',
    
    // Profiles
    profiles: 'Profiler',
    scans: 'skanningar',
    risk: 'Risk',
    
    // Alerts
    recentAlerts: 'Senaste varningar',
    noAlerts: 'Inga varningar ännu',
    to: 'Till',
    
    // Top findings
    topFindings: 'Högsta riskfynd',
    time: 'Tid',
    profile: 'Profil',
    findings: 'Fynd',
    pattern: 'Mönster',
    
    // Footer
    norwegianPatterns: 'Norge-specifika mönster aktiva: Fødselsnummer, Saksnummer, NAV-beslut',
    ollamaBridge: 'Ollama Security Bridge',
    enabled: 'Aktiverad',
    disabled: 'Inaktiverad',
    
    // Security levels
    low: 'Låg',
    medium: 'Måttlig',
    high: 'Hög',
    critical: 'Kritisk',
    
    // Patterns
    personnummer: 'Personnummer',
    bankAccount: 'Kontonummer',
    caseNumber: 'Ärendenummer'
  },
  no: {
    // Header
    title: 'Enterprise Research Shield',
    subtitle: 'Live sikkerhetsovervåking for Norge-møtet',
    exportButton: 'Eksporter Audit-logg (CSV)',
    autoRefresh: 'Auto-oppdatering (10s)',
    
    // Time ranges
    lastHour: 'Siste timen',
    lastDay: 'Siste døgnet',
    lastWeek: 'Siste uken',
    lastMonth: 'Siste måneden',
    
    // Metrics
    totalScans: 'Totale skanninger',
    blocked: 'Blokkerte',
    avgRisk: 'Gjennomsnittlig risiko',
    status: 'Status',
    active: 'Aktiv',
    systemOperational: 'System operativt',
    perHour: 'per time',
    blockRate: 'blokkert',
    riskScore: 'Risiko-score',
    
    // Chart
    riskTrend: 'Risiko-trend - Siste 7 dagene',
    criticalBlocked: 'KRITISK: Blokkerte e-poster',
    highSanitized: 'HØY: Sanerte e-poster',
    
    // Profiles
    profiles: 'Profiler',
    scans: 'skanninger',
    risk: 'Risiko',
    
    // Alerts
    recentAlerts: 'Siste varsler',
    noAlerts: 'Ingen varsler ennå',
    to: 'Til',
    
    // Top findings
    topFindings: 'Høyeste risikofunn',
    time: 'Tid',
    profile: 'Profil',
    findings: 'Funn',
    pattern: 'Mønster',
    
    // Footer
    norwegianPatterns: 'Norge-spesifikke mønstre aktive: Fødselsnummer, Saksnummer, NAV-vedtak',
    ollamaBridge: 'Ollama Security Bridge',
    enabled: 'Aktivert',
    disabled: 'Deaktivert',
    
    // Security levels
    low: 'Lav',
    medium: 'Moderat',
    high: 'Høy',
    critical: 'Kritisk',
    
    // Patterns
    personnummer: 'Fødselsnummer',
    bankAccount: 'Kontonummer',
    caseNumber: 'Saksnummer'
  }
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
