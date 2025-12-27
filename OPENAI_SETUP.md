# OpenAI Integration Setup Guide

## Migration from Ollama to OpenAI

The system has been upgraded to use **OpenAI's gpt-4o-mini** model with automatic fallback to local keyword analysis for older hardware support.

## Architecture: Cloud-First with Local Fallback

```
┌─────────────────────────────────────────────┐
│  1. Try OpenAI API (gpt-4o-mini)            │
│     └─ 10 second timeout                    │
│     └─ Hardened JSON validation             │
│                                              │
│  2. On ANY failure:                         │
│     ✗ Network timeout                       │
│     ✗ Invalid API key                       │
│     ✗ Rate limit exceeded                   │
│     ✗ Malformed response                    │
│                                              │
│  3. Automatic Fallback:                     │
│     → Local Keyword Analysis                │
│     → Pattern matching for:                 │
│        • SQL injection                      │
│        • PII (personnummer, fødselsnummer)  │
│        • Malicious keywords                 │
│                                              │
│  4. Always Returns Valid Result ✓           │
└─────────────────────────────────────────────┘
```

## Environment Variables

### Required
```bash
# Enable AI analysis (set to 'true' to activate)
NEXT_PUBLIC_AI_ENABLED=true

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your-key-here
```

### Optional
```bash
# Override default models (default: gpt-4o-mini)
OPENAI_RISK_MODEL=gpt-4o-mini
OPENAI_ANALYSIS_MODEL=gpt-4o-mini
```

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key (starts with `sk-proj-...`)

### 2. Update `.env.local`
```bash
# AI Analysis Configuration
NEXT_PUBLIC_AI_ENABLED=true
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Optional: Override models
# OPENAI_RISK_MODEL=gpt-4o-mini
# OPENAI_ANALYSIS_MODEL=gpt-4o-mini
```

### 3. Remove Old Ollama Variables (Optional)
You can safely remove these old variables:
```bash
# ❌ No longer needed
# NEXT_PUBLIC_OLLAMA_ENABLED=true
# OLLAMA_URL=http://localhost:11434
# OLLAMA_RISK_MODEL=qwen2.5:7b
# OLLAMA_ANALYSIS_MODEL=llama3.1:8b
```

## Fallback Behavior

### When OpenAI is Available
```
🌐 OpenAI Analysis → ✅ Cloud-based threat detection
```

### When OpenAI is Unavailable
```
❌ OpenAI fails (timeout/error)
↓
⚠️ Automatic fallback to keyword analysis
↓
✅ Local pattern matching continues
```

**The system NEVER crashes** - it always returns a valid security analysis.

## Testing

### Test OpenAI Connection
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

Expected: `200 OK` with JSON response

### Test Fallback (Simulate OpenAI Failure)
```bash
# Temporarily set invalid API key
OPENAI_API_KEY=invalid

# System should:
# 1. Try OpenAI → Fail
# 2. Log: "❌ OpenAI Analysis failed"
# 3. Log: "⚠️ Falling back to local keyword analysis"
# 4. Return valid SecurityAnalysis with [Local Fallback] prefix
```

## API Response Structure (Unchanged)

The response structure remains **100% compatible** with the original Ollama version:

```typescript
interface SecurityAnalysis {
  isThreat: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'SQL_INJECTION' | 'PII_LEAK' | 'MALICIOUS_CONTENT' | 'SAFE';
  reason: string;
}
```

## Cost Estimation

**gpt-4o-mini pricing** (as of 2024):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Example**: 1000 security scans/day with ~500 tokens each
- Cost: ~$0.30/day ($9/month)

**Fallback**: Zero cost (runs locally)

## Security Features

### OpenAI Mode
✅ Advanced AI threat detection
✅ Context-aware analysis
✅ Multi-model council consensus
✅ 10-second timeout protection
✅ Hardened JSON validation

### Fallback Mode
✅ Pattern-based detection
✅ Zero external dependencies
✅ No API key required
✅ Works offline
✅ Zero cost

## Monitoring

Check logs for AI usage:
```bash
# OpenAI success
🌐 Attempting OpenAI analysis with gpt-4o-mini
✅ OpenAI analysis successful

# Fallback triggered
❌ OpenAI Analysis failed: [error details]
⚠️ Falling back to local keyword analysis
```

## Rollback to Ollama

If you need to revert to the old Ollama system:

```bash
# Restore backup
cp src/lib/ai-analyzer-ollama-backup.ts src/lib/ai-analyzer.ts

# Update environment variables
NEXT_PUBLIC_OLLAMA_ENABLED=true
OLLAMA_URL=http://localhost:11434
```

## Support

For issues:
1. Check API key is valid
2. Verify `NEXT_PUBLIC_AI_ENABLED=true`
3. Check console logs for error messages
4. System will automatically use fallback if OpenAI fails

## Files Modified

- `src/lib/ai-analyzer.ts` - Rewritten for OpenAI
- `src/app/api/security/ai-analyze/route.ts` - Updated env vars
- `src/app/api/security/scan/route.ts` - Updated env vars
- `src/lib/gateway-core/ContentScanner.ts` - Updated env vars
- `src/app/security-dashboard/page.tsx` - Updated UI labels

**Backup**: `src/lib/ai-analyzer-ollama-backup.ts`
