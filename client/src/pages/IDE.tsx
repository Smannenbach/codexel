import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import BrowserIDE from "@/components/workspace/BrowserIDE";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IDEPage() {
  const { siteId } = useParams<{ siteId: string }>();

  const { data: site, isLoading, error } = useQuery({
    queryKey: [`/api/sites/${siteId}`],
    enabled: !!siteId,
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg font-medium animate-pulse">Loading Project Workspace...</p>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#1e1e1e] p-6">
        <Card className="max-w-md bg-gray-900 border-gray-800 text-white">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Failed to Load Project</h2>
            <p className="text-gray-400">
              We couldn't find the project data for Site #{siteId}. It might have been deleted or moved.
            </p>
            <Button onClick={() => window.location.href = '/sites'} className="bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Construct initial files from site config if it exists, otherwise use defaults
  const custom = (site as any).config?.customContent;
  let initialFiles = undefined;

  if (custom) {
    // Basic scaffolding for a mortgage site
    initialFiles = {
      'index.js': {
        file: {
          contents: `import express from 'express';\nconst app = express();\nconst port = 3111;\n\n// Site: ${site.name}\n// Niche: ${(site as any).category}\n\napp.get('/', (req, res) => {\n  res.send(\`<h1>Welcome to ${site.name}</h1><p>${custom.heroHeadline || ''}</p>\`);\n});\n\napp.listen(port, () => {\n  console.log(\`Server running on http://localhost:\${port}\`);\n});`
        }
      },
      'package.json': {
        file: {
          contents: `{\n  "name": "${site.domain.split('.')[0]}",\n  "type": "module",\n  "dependencies": {\n    "express": "latest",\n    "nodemon": "latest"\n  },\n  "scripts": {\n    "start": "nodemon index.js"\n  }\n}`
        }
      }
    };
  }

  return <BrowserIDE siteId={siteId} initialFiles={initialFiles} />;
}
