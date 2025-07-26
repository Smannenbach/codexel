import React, { useState } from 'react';
import { useProductionAuth } from '@/hooks/useProductionAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, User, Activity, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProductionDashboard() {
  const { user, isLoading, usageAnalytics, checkUsageLimit } = useProductionAuth();
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            Please sign in to access your account dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  const checkAction = async (action: string) => {
    setIsChecking(true);
    try {
      const result = await checkUsageLimit(action);
      toast({
        title: result.canPerform ? "Action Allowed" : "Limit Reached",
        description: result.canPerform 
          ? `You can perform this action`
          : result.reason,
        variant: result.canPerform ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Failed to check usage limits",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6 p-6">
      {/* User Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.email
                }
              </h2>
              <Badge variant="secondary" className="mt-1">
                {user.subscriptionStatus.toUpperCase()}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Usage Overview
          </CardTitle>
          <CardDescription>
            Your current usage for this billing period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* AI Calls */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Calls</span>
                <span>{user.usage.current.aiCalls} / {user.usage.limits.aiCalls}</span>
              </div>
              <Progress 
                value={getUsagePercentage(user.usage.current.aiCalls, user.usage.limits.aiCalls)}
                className="h-2"
              />
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span>{user.usage.current.storageGB.toFixed(1)} / {user.usage.limits.storageGB} GB</span>
              </div>
              <Progress 
                value={getUsagePercentage(user.usage.current.storageGB, user.usage.limits.storageGB)}
                className="h-2"
              />
            </div>

            {/* Workspace Hours */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Workspace Hours</span>
                <span>{user.usage.current.workspaceHours.toFixed(1)} / {user.usage.limits.workspaceHours}</span>
              </div>
              <Progress 
                value={getUsagePercentage(user.usage.current.workspaceHours, user.usage.limits.workspaceHours)}
                className="h-2"
              />
            </div>

            {/* Projects */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Projects</span>
                <span>{user.usage.current.projectCount} / {user.usage.limits.projectCount}</span>
              </div>
              <Progress 
                value={getUsagePercentage(user.usage.current.projectCount, user.usage.limits.projectCount)}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Test your current usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => checkAction('ai-call')}
              disabled={isChecking}
            >
              Check AI Call Limit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => checkAction('create-project')}
              disabled={isChecking}
            >
              Check Project Limit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => checkAction('upload-file')}
              disabled={isChecking}
            >
              Check Storage Limit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {user.usage.recentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your usage over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.usage.recentStats.slice(0, 3).map((stat, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{stat.period}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.metrics.aiCalls} AI calls, {stat.metrics.workspaceMinutes} min workspace
                    </p>
                  </div>
                  <Badge variant="outline">
                    {stat.metrics.tokensUsed.toLocaleString()} tokens
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function FileUploadComponent({ projectId }: { projectId?: number }) {
  const { 
    files, 
    isLoading, 
    isUploading, 
    uploadProgress, 
    uploadFiles, 
    deleteFile, 
    downloadFile 
  } = useFileUpload(projectId);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        await uploadFiles(files);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      try {
        await uploadFiles(files);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          File Attachments
        </CardTitle>
        <CardDescription>
          Upload and manage your project files
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-3">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">Uploading files...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Supports images, PDFs, documents up to 10MB
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.zip"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
              >
                Browse Files
              </Button>
            </div>
          )}
        </div>

        {/* File List */}
        {isLoading ? (
          <div className="mt-6 text-center py-4">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : files.length > 0 ? (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Uploaded Files</h4>
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(file.id, file.originalName)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFile(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No files uploaded yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}