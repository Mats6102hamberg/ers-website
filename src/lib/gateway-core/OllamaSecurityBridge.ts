export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeout?: number;
}

export interface OllamaAnalysis {
  sensitiveEntities: Array<{
    type: string;
    value: string;
    confidence: number;
    context: string;
  }>;
  riskAssessment: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reasoning: string;
    recommendations: string[];
  };
  categories: string[];
}

export class OllamaSecurityBridge {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  async analyzeContent(content: string): Promise<OllamaAnalysis> {
    const prompt = this.buildSecurityPrompt(content);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseOllamaResponse(data.response);
    } catch (error) {
      console.error('Ollama Security Bridge error:', error);
      return this.getDefaultAnalysis();
    }
  }

  private buildSecurityPrompt(content: string): string {
    return `You are a security analyst specialized in identifying sensitive information in text.

Analyze the following content and identify:
1. Personal identifiable information (names, addresses, ID numbers)
2. Medical information (diagnoses, treatments, patient data)
3. Financial data (account numbers, credit cards, transactions)
4. Confidential business information
5. Any other sensitive data

Content to analyze:
"""
${content.substring(0, 2000)}
"""

Respond ONLY with valid JSON in this exact format:
{
  "sensitiveEntities": [
    {
      "type": "person_name|medical_info|financial|business_confidential|other",
      "value": "the actual sensitive text found",
      "confidence": 0.0-1.0,
      "context": "brief context where it was found"
    }
  ],
  "riskAssessment": {
    "overallRisk": "LOW|MEDIUM|HIGH|CRITICAL",
    "reasoning": "brief explanation of risk level",
    "recommendations": ["recommendation 1", "recommendation 2"]
  },
  "categories": ["category1", "category2"]
}`;
  }

  private parseOllamaResponse(response: string): OllamaAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sensitiveEntities: parsed.sensitiveEntities || [],
          riskAssessment: parsed.riskAssessment || {
            overallRisk: 'LOW',
            reasoning: 'No analysis available',
            recommendations: []
          },
          categories: parsed.categories || []
        };
      }
    } catch (error) {
      console.error('Failed to parse Ollama response:', error);
    }

    return this.getDefaultAnalysis();
  }

  private getDefaultAnalysis(): OllamaAnalysis {
    return {
      sensitiveEntities: [],
      riskAssessment: {
        overallRisk: 'LOW',
        reasoning: 'Analysis unavailable - using regex patterns only',
        recommendations: ['Enable Ollama for deeper analysis']
      },
      categories: []
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }
}

export function createOllamaBridge(config: OllamaConfig): OllamaSecurityBridge {
  return new OllamaSecurityBridge(config);
}
