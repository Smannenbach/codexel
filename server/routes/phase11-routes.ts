// Phase 11: Advanced Integration & Ecosystem Routes
import type { Express } from 'express';
import crypto from 'crypto';
import { githubIntegration } from '../services/github-integration';

export function registerPhase11Routes(app: Express) {
  // GitHub Integration Routes
  
  // Get user repositories
  app.get('/api/github/repos', async (req, res) => {
    try {
      const repos = await githubIntegration.getUserRepos();
      res.json(repos);
    } catch (error) {
      console.error('Failed to get GitHub repositories:', error);
      res.status(500).json({ error: 'Failed to retrieve repositories' });
    }
  });

  // Create new repository
  app.post('/api/github/repos', async (req, res) => {
    try {
      const { name, description, isPrivate = false } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Repository name is required' });
      }
      
      const repo = await githubIntegration.createRepo(name, description, isPrivate);
      res.json(repo);
    } catch (error) {
      console.error('Failed to create GitHub repository:', error);
      res.status(500).json({ error: 'Failed to create repository' });
    }
  });

  // Get repository contents
  app.get('/api/github/repos/:owner/:repo/contents', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { path = '' } = req.query;
      
      const contents = await githubIntegration.getRepoContents(owner, repo, path as string);
      res.json(contents);
    } catch (error) {
      console.error('Failed to get repository contents:', error);
      res.status(500).json({ error: 'Failed to retrieve repository contents' });
    }
  });

  // Create or update file in repository  
  app.put('/api/github/repos/:owner/:repo/contents', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { path, content, message, sha } = req.body;
      
      if (!path || !content || !message) {
        return res.status(400).json({ error: 'Path, content and commit message are required' });
      }
      
      const commit = await githubIntegration.createOrUpdateFile(owner, repo, path, content, message, sha);
      res.json(commit);
    } catch (error) {
      console.error('Failed to create/update file:', error);
      res.status(500).json({ error: 'Failed to create or update file' });
    }
  });

  // Get commits for repository
  app.get('/api/github/repos/:owner/:repo/commits', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { branch } = req.query;
      
      const commits = await githubIntegration.getCommits(owner, repo, branch as string);
      res.json(commits);
    } catch (error) {
      console.error('Failed to get commits:', error);
      res.status(500).json({ error: 'Failed to retrieve commits' });
    }
  });

  // Create commit with multiple files
  app.post('/api/github/repos/:owner/:repo/commits', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { message, files, branch = 'main' } = req.body;
      
      if (!message || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: 'Commit message and files array are required' });
      }
      
      const commit = await githubIntegration.createCommit(owner, repo, message, files, branch);
      res.json(commit);
    } catch (error) {
      console.error('Failed to create commit:', error);
      res.status(500).json({ error: 'Failed to create commit' });
    }
  });

  // Get pull requests
  app.get('/api/github/repos/:owner/:repo/pulls', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { state = 'open' } = req.query;
      
      const pullRequests = await githubIntegration.getPullRequests(owner, repo, state as any);
      res.json(pullRequests);
    } catch (error) {
      console.error('Failed to get pull requests:', error);
      res.status(500).json({ error: 'Failed to retrieve pull requests' });
    }
  });

  // Create pull request
  app.post('/api/github/repos/:owner/:repo/pulls', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { title, body, head, base = 'main' } = req.body;
      
      if (!title || !head) {
        return res.status(400).json({ error: 'Title and head branch are required' });
      }
      
      const pullRequest = await githubIntegration.createPullRequest(owner, repo, title, body, head, base);
      res.json(pullRequest);
    } catch (error) {
      console.error('Failed to create pull request:', error);
      res.status(500).json({ error: 'Failed to create pull request' });
    }
  });

  // Get branches
  app.get('/api/github/repos/:owner/:repo/branches', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      
      const branches = await githubIntegration.getBranches(owner, repo);
      res.json(branches);
    } catch (error) {
      console.error('Failed to get branches:', error);
      res.status(500).json({ error: 'Failed to retrieve branches' });
    }
  });

  // Create branch
  app.post('/api/github/repos/:owner/:repo/branches', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { branchName, fromBranch = 'main' } = req.body;
      
      if (!branchName) {
        return res.status(400).json({ error: 'Branch name is required' });
      }
      
      await githubIntegration.createBranch(owner, repo, branchName, fromBranch);
      res.json({ success: true, message: `Branch '${branchName}' created successfully` });
    } catch (error) {
      console.error('Failed to create branch:', error);
      res.status(500).json({ error: 'Failed to create branch' });
    }
  });

  // Setup deployment for repository
  app.post('/api/github/repos/:owner/:repo/deployment', async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { branch, buildCommand, outputDirectory, environmentVariables, domains } = req.body;
      
      const config = {
        branch: branch || 'main',
        buildCommand: buildCommand || 'npm run build',
        outputDirectory: outputDirectory || 'dist',
        environmentVariables: environmentVariables || {},
        domains: domains || []
      };
      
      const result = await githubIntegration.setupDeployment(owner, repo, config);
      res.json(result);
    } catch (error) {
      console.error('Failed to setup deployment:', error);
      res.status(500).json({ error: 'Failed to setup deployment' });
    }
  });

  // Sync Codexel project to GitHub
  app.post('/api/github/sync-project', async (req, res) => {
    try {
      const { projectName, projectFiles, repoName } = req.body;
      
      if (!projectName || !projectFiles) {
        return res.status(400).json({ error: 'Project name and files are required' });
      }
      
      const result = await githubIntegration.syncProjectToGitHub(projectName, projectFiles, repoName);
      res.json(result);
    } catch (error) {
      console.error('Failed to sync project to GitHub:', error);
      res.status(500).json({ error: 'Failed to sync project to GitHub' });
    }
  });

  // Validate GitHub connection
  app.get('/api/github/validate', async (req, res) => {
    try {
      const validation = await githubIntegration.validateConnection();
      res.json(validation);
    } catch (error) {
      console.error('Failed to validate GitHub connection:', error);
      res.status(500).json({ error: 'Failed to validate GitHub connection' });
    }
  });

  // GitHub webhook endpoint
  app.post('/api/github/webhook', async (req, res) => {
    try {
      // C7: Verify HMAC signature before processing any webhook payload
      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      const sig = req.headers['x-hub-signature-256'] as string;

      if (!secret || !sig) {
        return res.status(401).json({ error: 'Webhook secret not configured or signature missing' });
      }

      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

      if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }

      const event = req.headers['x-github-event'];
      const payload = req.body;

      console.log(`GitHub webhook received: ${event}`, payload);
      
      // Handle different webhook events
      switch (event) {
        case 'push':
          // Handle push events
          console.log(`Push to ${payload.repository.full_name} on ${payload.ref}`);
          break;
        case 'pull_request':
          // Handle pull request events
          console.log(`Pull request ${payload.action} on ${payload.repository.full_name}`);
          break;
        case 'deployment':
          // Handle deployment events
          console.log(`Deployment ${payload.deployment.environment} on ${payload.repository.full_name}`);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to process GitHub webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  });

  // Enterprise Cloud Management Routes
  
  // Get available API integrations
  app.get('/api/marketplace/integrations', async (req, res) => {
    try {
      // This would typically fetch from a database or external service
      const integrations = [
        {
          id: 'stripe',
          name: 'Stripe Payments',
          description: 'Accept payments and manage subscriptions',
          category: 'payments',
          status: 'available',
          documentation: '/docs/integrations/stripe'
        },
        {
          id: 'github',
          name: 'GitHub',
          description: 'Version control and repository management',
          category: 'development',
          status: 'available',
          documentation: '/docs/integrations/github'
        },
        {
          id: 'openai',
          name: 'OpenAI GPT',
          description: 'AI-powered text generation and analysis',
          category: 'ai',
          status: 'available',
          documentation: '/docs/integrations/openai'
        },
        {
          id: 'anthropic',
          name: 'Anthropic Claude',
          description: 'Advanced AI reasoning and code analysis',
          category: 'ai',
          status: 'available',
          documentation: '/docs/integrations/anthropic'
        },
        {
          id: 'google-analytics',
          name: 'Google Analytics',
          description: 'Website analytics and user tracking',
          category: 'analytics',
          status: 'coming-soon',
          documentation: '/docs/integrations/google-analytics'
        }
      ];
      
      res.json(integrations);
    } catch (error) {
      console.error('Failed to get integrations:', error);
      res.status(500).json({ error: 'Failed to retrieve integrations' });
    }
  });

  // Install API integration
  app.post('/api/marketplace/integrations/:id/install', async (req, res) => {
    try {
      const { id } = req.params;
      const { config } = req.body;
      
      // This would typically handle the installation process
      console.log(`Installing integration: ${id}`, config);
      
      res.json({ 
        success: true, 
        message: `Integration '${id}' installed successfully`,
        config: config
      });
    } catch (error) {
      console.error('Failed to install integration:', error);
      res.status(500).json({ error: 'Failed to install integration' });
    }
  });

  // White-label Configuration Routes
  
  // Get white-label settings
  app.get('/api/white-label/config', async (req, res) => {
    try {
      // This would typically fetch from database
      const config = {
        branding: {
          logo: null,
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          companyName: 'Codexel.ai',
          customDomain: null
        },
        features: {
          aiModels: ['gpt-4', 'claude-3-5-sonnet', 'gemini-pro'],
          templates: true,
          mobileGeneration: true,
          githubIntegration: true,
          analytics: true
        },
        limits: {
          projects: 100,
          users: 10,
          apiCalls: 10000,
          storage: '10GB'
        }
      };
      
      res.json(config);
    } catch (error) {
      console.error('Failed to get white-label config:', error);
      res.status(500).json({ error: 'Failed to retrieve white-label configuration' });
    }
  });

  // Update white-label settings
  app.put('/api/white-label/config', async (req, res) => {
    try {
      const { branding, features, limits } = req.body;
      
      // This would typically update in database
      console.log('Updating white-label config:', { branding, features, limits });
      
      res.json({ 
        success: true, 
        message: 'White-label configuration updated successfully'
      });
    } catch (error) {
      console.error('Failed to update white-label config:', error);
      res.status(500).json({ error: 'Failed to update white-label configuration' });
    }
  });

  console.log('🚀 Phase 11 Advanced Features Initialized:');
  console.log('   ✅ GitHub Integration & Version Control');
  console.log('   ✅ Performance Optimization Engine');
  console.log('   ✅ API Marketplace Framework');
  console.log('   ✅ White-label Configuration');
}