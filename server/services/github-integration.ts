// GitHub Integration Service for Phase 11
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface DeploymentConfig {
  branch: string;
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
  domains: string[];
}

class GitHubIntegrationService {
  private apiToken: string | null = null;
  private baseUrl = 'https://api.github.com';

  constructor() {
    this.apiToken = process.env.GITHUB_TOKEN || null;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiToken) {
      throw new Error('GitHub token not configured. Please set GITHUB_TOKEN environment variable.');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Repository Management
  async getUserRepos(): Promise<GitHubRepo[]> {
    const repos = await this.makeRequest('/user/repos?sort=updated&per_page=50');
    return repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    }));
  }

  async createRepo(name: string, description: string, isPrivate: boolean = false): Promise<GitHubRepo> {
    const repo = await this.makeRequest('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      }),
    });

    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    };
  }

  async getRepoContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    return this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`);
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<GitHubCommit> {
    const body: any = {
      message,
      content: Buffer.from(content).toString('base64'),
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      sha: response.commit.sha,
      message: response.commit.message,
      author: {
        name: response.commit.author.name,
        email: response.commit.author.email,
        date: response.commit.author.date,
      },
      url: response.commit.html_url,
    };
  }

  // Commit Management
  async getCommits(owner: string, repo: string, branch?: string): Promise<GitHubCommit[]> {
    const url = `/repos/${owner}/${repo}/commits${branch ? `?sha=${branch}` : ''}`;
    const commits = await this.makeRequest(url);
    
    return commits.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
      },
      url: commit.html_url,
    }));
  }

  async createCommit(
    owner: string,
    repo: string,
    message: string,
    files: Array<{ path: string; content: string }>,
    branch: string = 'main'
  ): Promise<GitHubCommit> {
    // Get the latest commit SHA
    const commits = await this.getCommits(owner, repo, branch);
    const latestCommit = commits[0];

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const blob = await this.makeRequest(`/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          }),
        });
        return { path: file.path, sha: blob.sha };
      })
    );

    // Create tree
    const tree = await this.makeRequest(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: latestCommit.sha,
        tree: blobs.map((blob) => ({
          path: blob.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        })),
      }),
    });

    // Create commit
    const commit = await this.makeRequest(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [latestCommit.sha],
      }),
    });

    // Update branch reference
    await this.makeRequest(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({
        sha: commit.sha,
      }),
    });

    return {
      sha: commit.sha,
      message: commit.message,
      author: {
        name: commit.author.name,
        email: commit.author.email,
        date: commit.author.date,
      },
      url: commit.html_url,
    };
  }

  // Pull Request Management
  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> {
    const prs = await this.makeRequest(`/repos/${owner}/${repo}/pulls?state=${state}`);
    
    return prs.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      user: {
        login: pr.user.login,
        avatar_url: pr.user.avatar_url,
      },
    }));
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string = 'main'
  ): Promise<GitHubPullRequest> {
    const pr = await this.makeRequest(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    });

    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      user: {
        login: pr.user.login,
        avatar_url: pr.user.avatar_url,
      },
    };
  }

  // Branch Management
  async getBranches(owner: string, repo: string): Promise<Array<{ name: string; sha: string }>> {
    const branches = await this.makeRequest(`/repos/${owner}/${repo}/branches`);
    return branches.map((branch: any) => ({
      name: branch.name,
      sha: branch.commit.sha,
    }));
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string = 'main'): Promise<void> {
    // Get the SHA of the source branch
    const branch = await this.makeRequest(`/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`);
    
    // Create new branch
    await this.makeRequest(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: branch.object.sha,
      }),
    });
  }

  // Deployment Integration
  async setupDeployment(
    owner: string,
    repo: string,
    config: DeploymentConfig
  ): Promise<{ success: boolean; webhookUrl?: string }> {
    try {
      // Create deployment workflow file
      const workflowContent = this.generateDeploymentWorkflow(config);
      
      await this.createOrUpdateFile(
        owner,
        repo,
        '.github/workflows/deploy.yml',
        workflowContent,
        'Add automated deployment workflow'
      );

      // Set up webhook for deployment notifications
      const webhook = await this.createWebhook(owner, repo, `${process.env.BASE_URL}/api/github/webhook`);
      
      return { success: true, webhookUrl: webhook.url };
    } catch (error) {
      console.error('Failed to setup deployment:', error);
      return { success: false };
    }
  }

  private generateDeploymentWorkflow(config: DeploymentConfig): string {
    return `name: Deploy to Production

on:
  push:
    branches: [ ${config.branch} ]
  pull_request:
    branches: [ ${config.branch} ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: ${config.buildCommand}
      env:
${Object.entries(config.environmentVariables)
  .map(([key, value]) => `        ${key}: \${{ secrets.${key} }}`)
  .join('\n')}
    
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add your deployment commands here
      env:
        OUTPUT_DIR: ${config.outputDirectory}
`;
  }

  private async createWebhook(owner: string, repo: string, url: string): Promise<{ url: string; id: number }> {
    const webhook = await this.makeRequest(`/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push', 'pull_request', 'deployment'],
        config: {
          url,
          content_type: 'json',
          insecure_ssl: '0',
        },
      }),
    });

    return { url: webhook.url, id: webhook.id };
  }

  // Utilities
  async validateConnection(): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
      const user = await this.makeRequest('/user');
      return { valid: true, user };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  async syncProjectToGitHub(
    projectName: string,
    projectFiles: Array<{ path: string; content: string }>,
    repoName?: string
  ): Promise<{ success: boolean; repoUrl?: string; error?: string }> {
    try {
      // Create repository
      const repo = await this.createRepo(
        repoName || projectName.toLowerCase().replace(/\s+/g, '-'),
        `Generated by Codexel.ai: ${projectName}`,
        false
      );

      // Create initial commit with all project files
      await this.createCommit(
        repo.full_name.split('/')[0],
        repo.name,
        'Initial commit from Codexel.ai',
        projectFiles
      );

      return { success: true, repoUrl: repo.url };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const githubIntegration = new GitHubIntegrationService();