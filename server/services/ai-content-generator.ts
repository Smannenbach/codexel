import OpenAI from 'openai';
import { db } from '../db';

export interface BlogPostConfig {
  projectId: number;
  practiceArea: string;
  targetKeywords: string[];
  tone: 'professional' | 'friendly' | 'authoritative';
  length: 'short' | 'medium' | 'long';
  includeLocalSEO: boolean;
  state?: string;
  city?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  excerpt: string;
  category: string;
  readTime: number;
}

export class AIContentGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  private readonly seoKeywords = {
    personalInjury: [
      'personal injury lawyer',
      'car accident attorney',
      'slip and fall lawyer',
      'medical malpractice attorney',
      'wrongful death lawyer',
      'injury compensation',
      'accident claim',
      'legal representation',
      'free consultation',
      'no win no fee'
    ],
    localModifiers: [
      'near me',
      'best',
      'top rated',
      'experienced',
      'affordable',
      '24/7',
      'emergency',
      'free case evaluation'
    ]
  };

  private readonly contentTemplates = {
    personalInjury: [
      'What to Do After a Car Accident in {city}',
      'Understanding Your Rights: {state} Personal Injury Laws',
      'How Much is My {practiceArea} Case Worth?',
      'Common Mistakes That Can Hurt Your {practiceArea} Claim',
      '{number} Signs You Need a {practiceArea} Lawyer',
      'The True Cost of {practiceArea} in {state}',
      'How to Choose the Right {practiceArea} Attorney in {city}',
      'What Evidence Do I Need for My {practiceArea} Case?',
      '{state} Statute of Limitations for {practiceArea} Claims',
      'Why Insurance Companies Are Not Your Friend After an Accident'
    ],
    caseStudies: [
      'How We Won: ${amount} Settlement for {practiceArea} Client',
      'Client Success Story: From Accident to Recovery',
      'Case Study: Fighting Insurance Companies and Winning',
      'Justice Served: {practiceArea} Victory in {city} Court'
    ]
  };

  async generateBlogPost(config: BlogPostConfig): Promise<GeneratedContent> {
    const { practiceArea, targetKeywords, tone, length, includeLocalSEO, state, city } = config;
    
    // Build SEO-optimized prompt
    const seoKeywords = this.buildSEOKeywords(practiceArea, targetKeywords, state, city);
    const title = this.generateTitle(practiceArea, state, city);
    
    const prompt = `
Write a ${length === 'long' ? '1500-2000' : length === 'medium' ? '800-1200' : '400-600'} word blog post for a personal injury law firm.

Title: ${title}
Practice Area: ${practiceArea}
Tone: ${tone}
Location: ${city ? `${city}, ` : ''}${state || 'USA'}

SEO Requirements:
- Primary Keywords: ${seoKeywords.primary.join(', ')}
- Secondary Keywords: ${seoKeywords.secondary.join(', ')}
- Include these keywords naturally throughout the content
- Use headers (H2, H3) to structure content
- Include a clear call-to-action

Content Structure:
1. Engaging introduction that addresses reader pain points
2. Main content with practical advice and legal insights
3. Local information if applicable (laws, courts, statistics)
4. Clear next steps for readers
5. Strong call-to-action to contact the firm

Write in a ${tone} tone that builds trust and demonstrates expertise without using legal jargon.
Format the response in Markdown.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert legal content writer specializing in personal injury law SEO content.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '';
    
    // Extract meta description
    const metaDescription = await this.generateMetaDescription(title, content);
    
    // Calculate read time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    // Generate slug
    const slug = this.generateSlug(title);
    
    // Extract excerpt
    const excerpt = this.extractExcerpt(content);
    
    return {
      title,
      content,
      metaDescription,
      keywords: [...seoKeywords.primary, ...seoKeywords.secondary],
      slug,
      excerpt,
      category: practiceArea,
      readTime
    };
  }

  async generateSocialMediaPost(
    topic: string, 
    platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter',
    includeHashtags: boolean = true
  ): Promise<{ content: string; hashtags: string[]; imagePrompt?: string }> {
    const platformSpecs = {
      facebook: { maxLength: 500, tone: 'conversational', includeImage: true },
      instagram: { maxLength: 300, tone: 'visual', includeImage: true },
      linkedin: { maxLength: 600, tone: 'professional', includeImage: false },
      twitter: { maxLength: 280, tone: 'concise', includeImage: false }
    };

    const spec = platformSpecs[platform];
    
    const prompt = `
Create a ${platform} post for a personal injury law firm about: ${topic}

Requirements:
- Maximum ${spec.maxLength} characters
- Tone: ${spec.tone}
- Include a clear call-to-action
- ${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
- Make it engaging and shareable
- Focus on helping potential clients

${spec.includeImage ? 'Also suggest an image concept for the post.' : ''}
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a social media expert for law firms.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    });

    const result = response.choices[0].message.content || '';
    
    // Extract hashtags
    const hashtags = includeHashtags ? this.extractHashtags(result) : [];
    
    // Extract image prompt if needed
    let imagePrompt;
    if (spec.includeImage) {
      imagePrompt = this.extractImagePrompt(result);
    }
    
    return {
      content: result.replace(/#\w+/g, '').trim(), // Remove hashtags from content
      hashtags,
      imagePrompt
    };
  }

  async generateEmailCampaign(
    campaignType: 'welcome' | 'newsletter' | 'case-update' | 'follow-up',
    practiceArea: string,
    personalData?: { name?: string; caseType?: string }
  ): Promise<{ subject: string; preheader: string; body: string }> {
    const templates = {
      welcome: 'Welcome email for new client inquiry',
      newsletter: 'Monthly newsletter with legal tips and firm updates',
      'case-update': 'Case progress update email',
      'follow-up': 'Follow-up email for consultation no-show or inquiry'
    };

    const prompt = `
Create a ${campaignType} email for a personal injury law firm.

Context:
- Practice Area: ${practiceArea}
- Email Type: ${templates[campaignType]}
${personalData ? `- Client Name: ${personalData.name || 'valued client'}` : ''}
${personalData?.caseType ? `- Case Type: ${personalData.caseType}` : ''}

Requirements:
1. Subject line (50 characters max, high open rate)
2. Preheader text (90 characters max)
3. Email body with:
   - Personal greeting
   - Main content
   - Clear CTA
   - Professional signature

Tone: Professional yet caring, building trust
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are an email marketing expert for law firms.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '';
    
    // Parse the response
    const lines = content.split('\n');
    const subject = lines.find((l: string) => l.includes('Subject:'))?.replace('Subject:', '').trim() || '';
    const preheader = lines.find((l: string) => l.includes('Preheader:'))?.replace('Preheader:', '').trim() || '';
    const bodyStart = lines.findIndex((l: string) => l.includes('Body:')) + 1;
    const body = lines.slice(bodyStart).join('\n').trim();
    
    return { subject, preheader, body };
  }

  async generateLeadMagnet(
    magnetType: 'guide' | 'checklist' | 'ebook' | 'infographic',
    topic: string,
    targetAudience: string
  ): Promise<{ title: string; outline: string[]; content: string }> {
    const prompt = `
Create a ${magnetType} outline and content for a personal injury law firm.

Topic: ${topic}
Target Audience: ${targetAudience}
Type: ${magnetType}

Requirements:
1. Compelling title that promises value
2. Detailed outline with main sections
3. Introduction paragraph
4. Key content points for each section
5. Strong call-to-action at the end

Focus on providing genuine value while positioning the firm as experts.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a content strategist specializing in legal lead magnets.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const result = response.choices[0].message.content || '';
    
    // Parse the response
    const title = this.extractTitle(result);
    const outline = this.extractOutline(result);
    
    return { title, outline, content: result };
  }

  private buildSEOKeywords(
    practiceArea: string, 
    customKeywords: string[], 
    state?: string, 
    city?: string
  ) {
    const primary = [...this.seoKeywords.personalInjury];
    const secondary = [...customKeywords];
    
    if (state) {
      primary.push(`${state} personal injury lawyer`);
      secondary.push(`${state} accident attorney`);
    }
    
    if (city) {
      primary.push(`${city} personal injury lawyer`);
      secondary.push(`best personal injury lawyer in ${city}`);
    }
    
    return { primary, secondary };
  }

  private generateTitle(practiceArea: string, state?: string, city?: string): string {
    const templates = [...this.contentTemplates.personalInjury];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template
      .replace('{practiceArea}', practiceArea)
      .replace('{state}', state || 'Your State')
      .replace('{city}', city || 'Your City')
      .replace('{number}', String(3 + Math.floor(Math.random() * 7)));
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private extractExcerpt(content: string): string {
    const firstParagraph = content.split('\n\n')[0];
    return firstParagraph.substring(0, 160) + '...';
  }

  private async generateMetaDescription(title: string, content: string): Promise<string> {
    const prompt = `Create a compelling meta description (155 characters max) for this blog post:
Title: ${title}
Content preview: ${content.substring(0, 500)}

Make it engaging and include a call-to-action.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 100
    });

    return response.choices[0].message.content || '';
  }

  private extractHashtags(content: string): string[] {
    const matches = content.match(/#\w+/g) || [];
    return matches.map(tag => tag.substring(1));
  }

  private extractImagePrompt(content: string): string {
    const imageMatch = content.match(/Image:(.*?)(?:\n|$)/i);
    return imageMatch ? imageMatch[1].trim() : 'Professional legal office setting';
  }

  private extractTitle(content: string): string {
    const titleMatch = content.match(/Title:(.*?)(?:\n|$)/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  private extractOutline(content: string): string[] {
    const outlineMatch = content.match(/Outline:(.*?)(?=\n\n|$)/is);
    if (!outlineMatch) return [];
    
    return outlineMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-*]\s*/, '').trim());
  }
}

export const aiContentGenerator = new AIContentGenerator();