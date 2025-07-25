import { Button } from "@/components/ui/button";

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="p-6">
        <h1 className="text-2xl font-bold">Codexel.ai</h1>
      </nav>
      
      <main className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Build AI Applications Without Code
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Create powerful AI applications, 3D sales agents, and marketing automation 
          with our revolutionary no-code platform. Deploy in minutes, not months.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = '/workspace'}
          >
            Start Building Free
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.location.href = '/pricing'}
          >
            View Pricing
          </Button>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Multi-AI Models</h3>
            <p className="text-gray-400">GPT-4, Claude, Gemini, and more in one platform</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">No Code Required</h3>
            <p className="text-gray-400">Build complex apps with simple conversations</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Deploy Instantly</h3>
            <p className="text-gray-400">One-click deployment to production</p>
          </div>
        </div>
      </main>
    </div>
  );
}