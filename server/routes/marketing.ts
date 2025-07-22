import { Router } from 'express';
import { z } from 'zod';
import { aiContentGenerator } from '../services/ai-content-generator';
import { db } from '../db';
import { marketingCampaigns } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Create marketing campaign
router.post('/campaigns', async (req, res) => {
  try {
    const campaignSchema = z.object({
      projectId: z.number(),
      name: z.string(),
      type: z.enum(['email', 'social', 'blog', 'ad']),
      config: z.object({
        platform: z.string().optional(),
        schedule: z.string().optional(),
        targetAudience: z.string().optional(),
        budget: z.number().optional(),
      }),
    });

    const data = campaignSchema.parse(req.body);
    
    const [campaign] = await db.insert(marketingCampaigns).values({
      ...data,
      status: 'active',
    }).returning();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create campaign' });
  }
});

// Generate social media post
router.post('/social/generate', async (req, res) => {
  try {
    const socialSchema = z.object({
      topic: z.string(),
      platform: z.enum(['facebook', 'instagram', 'linkedin', 'twitter']),
      includeHashtags: z.boolean().optional(),
    });

    const { topic, platform, includeHashtags = true } = socialSchema.parse(req.body);
    
    const post = await aiContentGenerator.generateSocialMediaPost(topic, platform, includeHashtags);
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate social media post' });
  }
});

// Generate email campaign
router.post('/email/generate', async (req, res) => {
  try {
    const emailSchema = z.object({
      campaignType: z.enum(['welcome', 'newsletter', 'case-update', 'follow-up']),
      practiceArea: z.string(),
      personalData: z.object({
        name: z.string().optional(),
        caseType: z.string().optional(),
      }).optional(),
    });

    const data = emailSchema.parse(req.body);
    
    const email = await aiContentGenerator.generateEmailCampaign(
      data.campaignType,
      data.practiceArea,
      data.personalData
    );
    
    res.json(email);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate email campaign' });
  }
});

// Generate lead magnet
router.post('/lead-magnet/generate', async (req, res) => {
  try {
    const leadMagnetSchema = z.object({
      magnetType: z.enum(['guide', 'checklist', 'ebook', 'infographic']),
      topic: z.string(),
      targetAudience: z.string(),
    });

    const { magnetType, topic, targetAudience } = leadMagnetSchema.parse(req.body);
    
    const leadMagnet = await aiContentGenerator.generateLeadMagnet(
      magnetType,
      topic,
      targetAudience
    );
    
    res.json(leadMagnet);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate lead magnet' });
  }
});

// Get campaigns for project
router.get('/campaigns/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const campaigns = await db
      .select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.projectId, projectId));
    
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

// Update campaign
router.patch('/campaigns/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateSchema = z.object({
      status: z.enum(['active', 'paused', 'completed']).optional(),
      metrics: z.any().optional(),
    });

    const updates = updateSchema.parse(req.body);
    
    const [updated] = await db
      .update(marketingCampaigns)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(marketingCampaigns.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update campaign' });
  }
});

export default router;