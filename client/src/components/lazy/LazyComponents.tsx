import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components for code splitting
const LazyAdvancedAnalytics = lazy(() => import('../workspace/AdvancedAnalytics'));
const LazyProductionOptimizer = lazy(() => import('../workspace/ProductionOptimizer'));
const LazyDeploymentManager = lazy(() => import('../workspace/DeploymentManager'));
const LazyTestWorkflows = lazy(() => import('../workspace/TestWorkflows'));
const LazyPerformanceMonitor = lazy(() => import('../workspace/PerformanceMonitor'));
const LazySecurityMonitor = lazy(() => import('../workspace/SecurityMonitor'));
const LazyAISalesAgent = lazy(() => import('../workspace/AISalesAgent'));
const LazyProductionReadiness = lazy(() => import('../workspace/ProductionReadiness'));
const LazyDeploymentCentral = lazy(() => import('../workspace/DeploymentCentral'));

// Loading component for lazy-loaded components
const LoadingFallback = ({ message = "Loading component..." }: { message?: string }) => (
  <Card className="bg-gray-900/50 border-gray-800">
    <CardContent className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </CardContent>
  </Card>
);

// Wrapper components with Suspense
export const AdvancedAnalytics = () => (
  <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
    <LazyAdvancedAnalytics />
  </Suspense>
);

export const ProductionOptimizer = () => (
  <Suspense fallback={<LoadingFallback message="Loading optimizer..." />}>
    <LazyProductionOptimizer />
  </Suspense>
);

export const DeploymentManager = ({ projectId }: { projectId: number }) => (
  <Suspense fallback={<LoadingFallback message="Loading deployment manager..." />}>
    <LazyDeploymentManager projectId={projectId} />
  </Suspense>
);

export const TestWorkflows = ({ projectId }: { projectId: number }) => (
  <Suspense fallback={<LoadingFallback message="Loading test workflows..." />}>
    <LazyTestWorkflows projectId={projectId} />
  </Suspense>
);

export const PerformanceMonitor = () => (
  <Suspense fallback={<LoadingFallback message="Loading performance monitor..." />}>
    <LazyPerformanceMonitor />
  </Suspense>
);

export const SecurityMonitor = () => (
  <Suspense fallback={<LoadingFallback message="Loading security monitor..." />}>
    <LazySecurityMonitor />
  </Suspense>
);

export const AISalesAgent = ({ 
  selectedTemplate, 
  availableStacks, 
  onStackSelection, 
  onComplete 
}: any) => (
  <Suspense fallback={<LoadingFallback message="Loading AI assistant..." />}>
    <LazyAISalesAgent 
      selectedTemplate={selectedTemplate}
      availableStacks={availableStacks}
      onStackSelection={onStackSelection}
      onComplete={onComplete}
    />
  </Suspense>
);

export const ProductionReadiness = () => (
  <Suspense fallback={<LoadingFallback message="Loading production dashboard..." />}>
    <LazyProductionReadiness />
  </Suspense>
);

export const DeploymentCentral = () => (
  <Suspense fallback={<LoadingFallback message="Loading deployment center..." />}>
    <LazyDeploymentCentral />
  </Suspense>
);

// Performance optimization: preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  import('../workspace/AdvancedAnalytics');
  import('../workspace/ProductionReadiness');
  import('../workspace/PerformanceMonitor');
};

// Utility function to check if a component should be lazy loaded
export const shouldLazyLoad = (componentName: string): boolean => {
  // Always lazy load heavy analytics and production components
  const heavyComponents = [
    'AdvancedAnalytics',
    'ProductionOptimizer', 
    'DeploymentManager',
    'TestWorkflows',
    'AISalesAgent',
    'ProductionReadiness'
  ];
  
  return heavyComponents.includes(componentName);
};

export default {
  AdvancedAnalytics,
  ProductionOptimizer,
  DeploymentManager,
  TestWorkflows,
  PerformanceMonitor,
  SecurityMonitor,
  AISalesAgent,
  ProductionReadiness,
  DeploymentCentral,
  preloadCriticalComponents,
  shouldLazyLoad
};