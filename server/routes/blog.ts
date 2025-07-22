import { Router } from 'express';
import { z } from 'zod';
import { aiContentGenerator } from '../services/ai-content-generator';
import { db } from '../db';
import { blogPosts } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Generate blog post
router.post('/generate', async (req, res) => {
  try {
    const generateSchema = z.object({
      projectId: z.number(),
      practiceArea: z.string(),
      targetKeywords: z.array(z.string()),
      tone: z.enum(['professional', 'friendly', 'authoritative']),
      length: z.enum(['short', 'medium', 'long']),
      includeLocalSEO: z.boolean(),
      state: z.string().optional(),
      city: z.string().optional(),
    });

    const config = generateSchema.parse(req.body);
    
    // Generate content using AI
    const generatedContent = await aiContentGenerator.generateBlogPost(config);
    
    // Save to database
    const [blogPost] = await db.insert(blogPosts).values({
      projectId: config.projectId,
      title: generatedContent.title,
      slug: generatedContent.slug,
      content: generatedContent.content,
      excerpt: generatedContent.excerpt,
      category: generatedContent.category,
      keywords: generatedContent.keywords,
      metaDescription: generatedContent.metaDescription,
      readTime: generatedContent.readTime,
      status: 'draft',
    }).returning();

    res.json(blogPost);
  } catch (error) {
    console.error('Error generating blog post:', error);
    res.status(500).json({ 
      message: 'Failed to generate blog post', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get blog posts for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.projectId, projectId))
      .orderBy(blogPosts.createdAt);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Update blog post
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateSchema = z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      publishedAt: z.string().optional(),
    });

    const updates = updateSchema.parse(req.body);
    
    const [updated] = await db
      .update(blogPosts)
      .set({
        ...updates,
        updatedAt: new Date(),
        publishedAt: updates.publishedAt ? new Date(updates.publishedAt) : undefined,
      })
      .where(eq(blogPosts.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blog post' });
  }
});

// Delete blog post
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

export default router;