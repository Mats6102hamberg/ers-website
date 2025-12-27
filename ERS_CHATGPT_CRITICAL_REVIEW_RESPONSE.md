# 🎯 ERS - Svar på ChatGPTs Kritiska Genomlysning
## Nästa Nivå: Red Team-test → Certifiering

**Datum:** 22 december 2025  
**Författare:** Mats Hamberg + Claude (Cascade AI)  
**Syfte:** Implementera ChatGPTs rekommendationer och förbereda Red Team-test

---

## 📋 CHATGPTS BEDÖMNING - SAMMANFATTNING

### ✅ Genuint Starkt:
1. **Separationen STRICT/RESEARCH/ADVERSARIAL** - Policy-driven anonymisering (rätt arkitektur)
2. **RESEARCH mode = 100%/0%** - Extremt ovanligt resultat (design, inte tur)
3. **Adversarial Log Mode** - Förklarbart system (hemlig superkraft)

### ⚠️ Kvarvarande Risker:
1. **Longitudinell återidentifiering** - Flera dokument om samma individ
2. **Benign leakage via kombinationer** - Ovanlig diagnos + ålder + region
3. **Mänsklig feltolkning** - Korrekt anonymiserad text kan missbrukas

### 🎯 Rekommenderad Väg:
**Väg B (Red Team-test) → Väg A (Certifiering)**

---

## 🔧 IMPLEMENTATIONSPLAN - CHATGPTS REKOMMENDATIONER

### 1. Re-Identification Risk Score (RRS) - PRIORITET: KRITISK

**Syfte:** Beräkna risk för återidentifiering baserat på kombinationer av data

**Implementation:**
```python
class ReIdentificationRiskScore:
    """
    Beräknar risk för återidentifiering baserat på:
    - Antal unika attribut (ålder, diagnos, region, etc.)
    - Sällsynthet av kombinationer
    - Tidslinjer och relationer
    """
    
    def calculate_rrs(self, document: str, masked_entities: List[Entity]) -> int:
        risk_score = 0
        
        # 1. Räkna unika attribut
        unique_attributes = self._count_unique_attributes(masked_entities)
        risk_score += unique_attributes * 10
        
        # 2. Sällsynta diagnoser/tillstånd
        rare_conditions = self._detect_rare_conditions(document)
        risk_score += len(rare_conditions) * 50
        
        # 3. Geografisk specificitet
        geographic_specificity = self._calculate_geographic_specificity(document)
        risk_score += geographic_specificity * 20
        
        # 4. Tidslinjer och relationer
        temporal_patterns = self._detect_temporal_patterns(document)
        risk_score += len(temporal_patterns) * 15
        
        # 5. Familjerelationer
        family_relations = self._count_family_relations(masked_entities)
        risk_score += family_relations * 25
        
        return risk_score
    
    def _count_unique_attributes(self, entities: List[Entity]) -> int:
        """Räkna antal unika attribut som kan identifiera individ"""
        attributes = set()
        for entity in entities:
            if entity.type in ["AGE", "DIAGNOSIS", "OCCUPATION", "LOCATION"]:
                attributes.add(entity.value)
        return len(attributes)
    
    def _detect_rare_conditions(self, document: str) -> List[str]:
        """Identifiera sällsynta medicinska tillstånd"""
        rare_conditions = [
            "Huntingtons sjukdom",
            "ALS",
            "Creutzfeldt-Jakobs sjukdom",
            "Ehlers-Danlos syndrom",
            # etc.
        ]
        found = []
        for condition in rare_conditions:
            if condition.lower() in document.lower():
                found.append(condition)
        return found
    
    def _calculate_geographic_specificity(self, document: str) -> int:
        """Beräkna geografisk specificitet (0-10)"""
        # Ju mer specifik plats, desto högre risk
        # Exempel: "Stockholm" = 2, "Södermalm" = 5, "Götgatan 12" = 10
        specificity = 0
        # Implementation...
        return specificity
    
    def _detect_temporal_patterns(self, document: str) -> List[str]:
        """Identifiera tidslinjer (datum, åldrar, händelser)"""
        patterns = []
        # Regex för datum, åldrar, etc.
        # Implementation...
        return patterns
    
    def _count_family_relations(self, entities: List[Entity]) -> int:
        """Räkna antal familjerelationer"""
        relations = ["mor", "far", "syster", "bror", "son", "dotter", "make", "maka"]
        count = 0
        for entity in entities:
            if any(rel in entity.context.lower() for rel in relations):
                count += 1
        return count
```

**Tröskelvärden:**
```python
RRS_THRESHOLDS = {
    "LOW": 0-100,      # Grön - låg risk
    "MEDIUM": 101-200, # Gul - medel risk
    "HIGH": 201-300,   # Orange - hög risk
    "CRITICAL": 301+   # Röd - kritisk risk
}

# Automatisk trigger för Adversarial Mode
if rrs >= 200:
    mode = ERSMode.ADVERSARIAL
    log_audit_trail = True
```

---

### 2. Session-level Identity Salt - PRIORITET: HÖG

**Syfte:** Förhindra longitudinell återidentifiering genom att ge samma individ olika placeholders mellan körningar

**Problem:**
```
Dokument 1: "Patienten [NAMN MASKERAT] har diabetes"
Dokument 2: "Patienten [NAMN MASKERAT] har högt blodtryck"

→ Om samma placeholder används kan man koppla ihop dokumenten!
```

**Lösning:**
```python
class IdentitySaltManager:
    """
    Hanterar session-baserade salts för att förhindra longitudinell återidentifiering
    """
    
    def __init__(self):
        self.session_salt = self._generate_session_salt()
        self.identity_map = {}  # Mappar verkligt ID → saltad placeholder
    
    def _generate_session_salt(self) -> str:
        """Generera unikt salt för denna session"""
        return secrets.token_hex(16)
    
    def get_placeholder(self, entity_value: str, entity_type: str) -> str:
        """
        Returnera konsistent placeholder inom session,
        men olika mellan sessioner
        """
        # Skapa hash av entity + session salt
        hash_input = f"{entity_value}:{self.session_salt}"
        hash_value = hashlib.sha256(hash_input.encode()).hexdigest()[:8]
        
        # Returnera placeholder med hash
        return f"[{entity_type} {hash_value}]"
    
    def reset_session(self):
        """Återställ session (ny salt)"""
        self.session_salt = self._generate_session_salt()
        self.identity_map = {}
```

**Resultat:**
```
Session 1:
Dokument 1: "Patienten [NAMN a3f8b2c1] har diabetes"
Dokument 2: "Patienten [NAMN a3f8b2c1] har högt blodtryck"

Session 2 (ny salt):
Dokument 1: "Patienten [NAMN 7d9e4f2a] har diabetes"
Dokument 2: "Patienten [NAMN 7d9e4f2a] har högt blodtryck"

→ Samma individ får olika placeholders mellan sessioner!
```

**Alternativ: Tidsbegränsad konsistens**
```python
class TimeLimitedIdentitySalt:
    """
    Konsistent placeholder inom tidsfönster (t.ex. 24h),
    sedan ny salt
    """
    
    def __init__(self, time_window_hours: int = 24):
        self.time_window = timedelta(hours=time_window_hours)
        self.salt_created_at = datetime.now()
        self.session_salt = self._generate_session_salt()
    
    def get_placeholder(self, entity_value: str, entity_type: str) -> str:
        # Kontrollera om tidsfönster har passerat
        if datetime.now() - self.salt_created_at > self.time_window:
            self._rotate_salt()
        
        # Returnera placeholder med aktuell salt
        return self._create_placeholder(entity_value, entity_type)
    
    def _rotate_salt(self):
        """Rotera salt efter tidsfönster"""
        self.session_salt = self._generate_session_salt()
        self.salt_created_at = datetime.now()
```

---

### 3. Watermark/Metadata - PRIORITET: MEDEL

**Syfte:** Skydda juridiskt mot missbruk av anonymiserad text

**Implementation:**
```python
class ERSWatermark:
    """
    Lägger till watermark och metadata till anonymiserade dokument
    """
    
    def add_watermark(self, document: str, metadata: dict) -> str:
        """
        Lägger till watermark i början och slutet av dokument
        """
        header = self._create_header(metadata)
        footer = self._create_footer(metadata)
        
        return f"{header}\n\n{document}\n\n{footer}"
    
    def _create_header(self, metadata: dict) -> str:
        return f"""
╔══════════════════════════════════════════════════════════════════╗
║  ANONYMISERAT DOKUMENT - ERS (Enterprise Research Shield)       ║
║                                                                  ║
║  Datum: {metadata['timestamp']}                                 ║
║  Läge: {metadata['mode']}                                       ║
║  RRS: {metadata['rrs']} ({metadata['rrs_level']})               ║
║  Maskerade entiteter: {metadata['masked_count']}                ║
║                                                                  ║
║  ⚠️  VARNING:                                                    ║
║  Detta dokument är anonymiserat för forskningsändamål.          ║
║  Ej avsett för kliniska beslut eller juridiska åtgärder.        ║
║  Återidentifiering är förbjuden enligt GDPR Art. 32.            ║
╚══════════════════════════════════════════════════════════════════╝
"""
    
    def _create_footer(self, metadata: dict) -> str:
        return f"""
╔══════════════════════════════════════════════════════════════════╗
║  AUDIT TRAIL                                                     ║
║                                                                  ║
║  Dokument-ID: {metadata['document_id']}                         ║
║  Session-ID: {metadata['session_id']}                           ║
║  Analytikern: {metadata['analytikern_version']}                 ║
║  Vakten: {metadata['vakten_version']}                           ║
║  Konsensus: {metadata['consensus_type']}                        ║
║                                                                  ║
║  För granskning: se audit_trail/{metadata['document_id']}.json  ║
╚══════════════════════════════════════════════════════════════════╝
"""
```

**Metadata-struktur:**
```json
{
  "document_id": "uuid-123",
  "session_id": "session-456",
  "timestamp": "2025-12-22T14:07:00Z",
  "mode": "RESEARCH",
  "rrs": 185,
  "rrs_level": "MEDIUM",
  "masked_count": 12,
  "analytikern_version": "llama-3.1:8b",
  "vakten_version": "qwen-2.5:7b",
  "consensus_type": "UNANIMOUS_THREAT",
  "audit_trail_path": "audit_trail/uuid-123.json"
}
```

---

### 4. Standardpolicy (ChatGPTs Rekommendation) - PRIORITET: KRITISK

**Default-konfiguration:**
```python
ERS_DEFAULT_CONFIG = {
    "mode": "RESEARCH",  # Default mode
    "auto_adversarial_threshold": 200,  # RRS ≥ 200 → Adversarial Mode
    "session_salt_enabled": True,
    "session_salt_rotation_hours": 24,
    "watermark_enabled": True,
    "strict_mode_requires_manual_approval": True,  # Förhindra oavsiktlig STRICT
}
```

**STRICT mode-varning:**
```python
def enable_strict_mode(user_confirmation: bool = False):
    """
    STRICT mode kräver manuell bekräftelse
    """
    if not user_confirmation:
        raise ValueError(
            "STRICT mode är information-förstörande och kräver manuell bekräftelse.\n"
            "Detta läge maskerar facktermer, lagrum och geografiska referenser.\n"
            "Använd endast för extremt känsliga miljöer (militär, underrättelsetjänst).\n"
            "För medicinska/juridiska dokument: använd RESEARCH mode."
        )
    
    return ERSMode.STRICT
```

---

## 🧪 RED TEAM-TEST (VÄG B) - FÖRBEREDELSE

**Syfte:** Hitta systemets absoluta gräns genom extrema edge-cases

### Testfall - Korsspråk & Kodväxling

**Testfall 1: Svensk-Norsk Kodväxling**
```
Patienten Per Strand (född 1985) bor i Oslo men jobbar i Stockholm.
Han har "blodsukkersykdom" (diabetes) och tar Metformin.
Modern, Kari Fjell, bor i Bergen og er frisk.
```

**Fällor:**
- Kodväxling mellan svenska och norska
- Medicinsk term på norska ("blodsukkersykdom")
- Stadsnamn som efternamn (Strand, Fjell)

---

**Testfall 2: Metaforer & Indirekta Citat**
```
"Han är som en björn på våren", sa läkaren om patienten.
Björn själv beskrev det som "att leva i en skog utan utväg".
Modern, som heter Skog, instämde: "Det är precis så det känns."
```

**Fällor:**
- Metafor ("som en björn") vs namn (Björn)
- Indirekt citat ("att leva i en skog") vs efternamn (Skog)
- Dubbel betydelse (skog = substantiv + efternamn)

---

**Testfall 3: Kryptiska Personnummer**
```
"Jag föddes 85-03-14", sa patienten.
"Min bror är född samma år, men 54:an istället för 32:an."
Legitimationen visar siffrorna 8503145432 utan bindestreck.
```

**Fällor:**
- Personnummer i talspråk ("85-03-14")
- Kontrollsiffra som relativ referens ("54:an istället för 32:an")
- Personnummer utan bindestreck (8503145432)

---

**Testfall 4: Multilingual Medical Terms**
```
Patient has "hjärtsvikt" (heart failure) and takes "blodtrycksmedicin".
Diagnosis: "Insufficientia cordis" (Latin).
Norwegian term: "hjertesvikt".
```

**Fällor:**
- Tre språk (svenska, engelska, latin, norska)
- Samma diagnos på olika språk
- Facktermer som MÅSTE bevaras

---

**Testfall 5: Temporal Re-identification**
```
Dokument 1 (2024-01-15):
"Patienten diagnostiserades med bröstcancer i januari 2024."

Dokument 2 (2024-06-20):
"Patienten har nu genomgått 6 månaders kemoterapi."

Dokument 3 (2024-12-15):
"Patienten är nu cancerfri efter 1 års behandling."
```

**Fällor:**
- Tidslinje som kan koppla ihop dokument
- Samma patient i tre dokument
- Longitudinell återidentifiering

---

### Red Team-test Metodik

**Steg 1: Skapa 20 extrema testfall**
- 5 korsspråk/kodväxling
- 5 metaforer/indirekta citat
- 5 kryptiska personnummer
- 5 temporal re-identification

**Steg 2: Kör genom alla tre lägen**
- STRICT mode
- RESEARCH mode
- ADVERSARIAL mode

**Steg 3: Dokumentera resultat**
- Precision (% korrekt maskerade)
- Recall (% identifierade PII)
- Falskt positiva (% felaktigt maskerade facktermer)
- RRS-distribution

**Steg 4: Identifiera gränser**
- Var bryter systemet?
- Vilka edge-cases hanteras inte?
- Hur kan vi förbättra?

---

## 📊 IMPLEMENTATIONSORDNING

### Fas 1: Kritiska Förbättringar (Vecka 1)
1. ✅ Implementera RRS (Re-Identification Risk Score)
2. ✅ Implementera Session-level Identity Salt
3. ✅ Implementera Watermark/Metadata
4. ✅ Sätt RESEARCH mode som default

### Fas 2: Red Team-test (Vecka 2-3)
1. ✅ Skapa 20 extrema testfall
2. ✅ Kör genom alla tre lägen
3. ✅ Dokumentera resultat
4. ✅ Identifiera gränser

### Fas 3: Certifieringsförberedelse (Vecka 4)
1. ✅ Formell anonymiseringspolicy
2. ✅ Riskmodell (RRS-dokumentation)
3. ✅ ISO/upphandlingstexter
4. ✅ Juridisk granskning

---

## 🎯 SVAR TILL CHATGPT

**Vald väg:** **Väg B (Red Team-test) → Väg A (Certifiering)**

**Motivering:**
- Ett system som överlever hårdaste tänkbara tester blir lätt att certifiera
- Red Team-test identifierar absoluta gränser
- Certifiering blir enklare med bevisad robusthet

**Nästa steg:**
1. Implementera RRS, Session-level Identity Salt, Watermark (Fas 1)
2. Skapa 20 extrema Red Team-testfall (Fas 2)
3. Dokumentera resultat och förbered certifiering (Fas 3)

**Tidsplan:** 4 veckor till produktionsklar version med certifieringsunderlag

---

**Status:** ✅ PLAN KLAR - REDO FÖR IMPLEMENTATION

**Fil skapad:** ERS_CHATGPT_CRITICAL_REVIEW_RESPONSE.md  
**Plats:** /Users/admin/CascadeProjects/agent-memory-vault/
