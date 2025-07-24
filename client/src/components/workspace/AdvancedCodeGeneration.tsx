import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Code2, 
  Wand2, 
  FileCode, 
  Lightbulb, 
  Settings,
  Play,
  Copy,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CodeGenerationRequest {
  description: string;
  context: {
    projectType: string;
    framework: string;
    language: string;
    existingCode?: string;
    dependencies?: string[];
    fileStructure?: string[];
  };
  preferences: {
    codeStyle: 'functional' | 'object-oriented' | 'mixed';
    complexity: 'simple' | 'intermediate' | 'advanced';
    includeComments: boolean;
    includeTests: boolean;
    includeDocumentation: boolean;
  };
}

interface CodeGenerationResult {
  files: {
    path: string;
    content: string;
    language: string;
    description: string;
  }[];
  dependencies: string[];
  instructions: string[];
  estimatedComplexity: number;
  confidence: number;
  suggestions: string[];
}

export function AdvancedCodeGeneration() {
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<CodeGenerationResult | null>(null);
  const { toast } = useToast();

  // Form state
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('web-app');
  const [framework, setFramework] = useState('react');
  const [language, setLanguage] = useState('typescript');
  const [existingCode, setExistingCode] = useState('');
  const [codeStyle, setCodeStyle] = useState<'functional' | 'object-oriented' | 'mixed'>('mixed');
  const [complexity, setComplexity] = useState<'simple' | 'intermediate' | 'advanced'>('intermediate');
  const [includeComments, setIncludeComments] = useState(true);
  const [includeTests, setIncludeTests] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);

  const [templateType, setTemplateType] = useState('');
  const [analysisCode, setAnalysisCode] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of what you want to build.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    const request: CodeGenerationRequest = {
      description,
      context: {
        projectType,
        framework,
        language,
        existingCode: existingCode || undefined,
        dependencies: [],
        fileStructure: []
      },
      preferences: {
        codeStyle,
        complexity,
        includeComments,
        includeTests,
        includeDocumentation
      }
    };

    try {
      const response = await apiRequest('POST', '/api/code-generation/generate', request);
      setGenerationResult(response.result);
      setActiveTab('results');
      
      toast({
        title: "Code Generated Successfully!",
        description: `Generated ${response.result.files.length} files with ${Math.round(response.result.confidence * 100)}% confidence.`
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard."
    });
  };

  return (
    <div className="h-full bg-gray-950">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wand2 className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-white">Advanced Code Generation</h2>
            </div>
            {generationResult && (
              <Badge variant="outline" className="text-green-400 border-green-400">
                {generationResult.files.length} files generated
              </Badge>
            )}
          </div>
          
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="results" disabled={!generationResult}>Results</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="generate" className="h-full p-4 m-0">
            <ScrollArea className="h-full">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Description */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileCode className="w-5 h-5" />
                      What do you want to build?
                    </CardTitle>
                    <CardDescription>
                      Describe your feature, component, or application in natural language
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="I want to build a React component that displays a user profile card with avatar, name, bio, and social links. It should be responsive and include hover effects..."
                      className="min-h-[120px] bg-gray-800 border-gray-700 text-white"
                    />
                  </CardContent>
                </Card>

                {/* Project Context */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Project Context</CardTitle>
                    <CardDescription>
                      Help the AI understand your project setup
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">Project Type</Label>
                        <Select value={projectType} onValueChange={setProjectType}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="web-app">Web Application</SelectItem>
                            <SelectItem value="mobile-app">Mobile App</SelectItem>
                            <SelectItem value="api">API/Backend</SelectItem>
                            <SelectItem value="library">Library/Package</SelectItem>
                            <SelectItem value="cli">CLI Tool</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-white">Framework</Label>
                        <Select value={framework} onValueChange={setFramework}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="react">React</SelectItem>
                            <SelectItem value="vue">Vue.js</SelectItem>
                            <SelectItem value="angular">Angular</SelectItem>
                            <SelectItem value="svelte">Svelte</SelectItem>
                            <SelectItem value="next.js">Next.js</SelectItem>
                            <SelectItem value="express">Express.js</SelectItem>
                            <SelectItem value="fastapi">FastAPI</SelectItem>
                            <SelectItem value="django">Django</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-white">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="csharp">C#</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                            <SelectItem value="rust">Rust</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Existing Code Context (Optional)</Label>
                      <Textarea
                        value={existingCode}
                        onChange={(e) => setExistingCode(e.target.value)}
                        placeholder="Paste any existing code that the AI should consider..."
                        className="mt-2 bg-gray-800 border-gray-700 text-white font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Code Preferences */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Code Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize the generated code style and features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white">Code Style</Label>
                        <Select value={codeStyle} onValueChange={(value: any) => setCodeStyle(value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="functional">Functional</SelectItem>
                            <SelectItem value="object-oriented">Object-Oriented</SelectItem>
                            <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-white">Complexity Level</Label>
                        <Select value={complexity} onValueChange={(value: any) => setComplexity(value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="simple">Simple</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="comments" 
                          checked={includeComments} 
                          onCheckedChange={(checked) => setIncludeComments(checked as boolean)}
                        />
                        <Label htmlFor="comments" className="text-white">Include detailed comments</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="tests" 
                          checked={includeTests} 
                          onCheckedChange={(checked) => setIncludeTests(checked as boolean)}
                        />
                        <Label htmlFor="tests" className="text-white">Generate unit tests</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="docs" 
                          checked={includeDocumentation} 
                          onCheckedChange={(checked) => setIncludeDocumentation(checked as boolean)}
                        />
                        <Label htmlFor="docs" className="text-white">Include documentation</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !description.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Generate Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="results" className="h-full p-4 m-0">
            {generationResult && (
              <div className="h-full">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Generation Results</h3>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        Confidence: {Math.round(generationResult.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        Complexity: {generationResult.estimatedComplexity}/10
                      </Badge>
                    </div>
                  </div>
                  
                  {generationResult.dependencies.length > 0 && (
                    <Card className="bg-gray-900 border-gray-800 mb-4">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Dependencies to Install</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {generationResult.dependencies.map((dep, index) => (
                            <Badge key={index} variant="secondary">{dep}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-200px)]">
                  {/* Generated Files */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Generated Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {generationResult.files.map((file, index) => (
                            <div key={index} className="border border-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-medium">{file.path}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(file.content)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-gray-400 text-sm mb-3">{file.description}</p>
                              <pre className="bg-gray-800 p-3 rounded text-sm text-gray-300 overflow-auto max-h-48">
                                <code>{file.content}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Instructions & Suggestions */}
                  <div className="space-y-4">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Implementation Instructions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-2">
                          {generationResult.instructions.map((instruction, index) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-purple-400 font-bold">{index + 1}.</span>
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {generationResult.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="h-full p-4 m-0">
            <div className="text-center py-12">
              <Wand2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Smart Templates</h3>
              <p className="text-gray-500">AI-enhanced templates coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="h-full p-4 m-0">
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Code Analysis</h3>
              <p className="text-gray-500">Code analysis tools coming soon...</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}