import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Check,
  Sparkles,
  Rocket,
  Building2,
  MapPin,
  DollarSign,
  Users,
  BarChart,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectTemplates, type ProjectTemplate } from '@shared/templates';
import { marketingStacks, stackBundles, type MarketingStack } from '@shared/marketing-stacks';
import AISalesAgent from './AISalesAgent';

interface TemplateSelectorProps {
  onComplete: (template: ProjectTemplate, selectedStacks: string[], config: TemplateConfig) => void;
}

interface TemplateConfig {
  states: string[];
  businessName: string;
  primaryColor?: string;
  features: string[];
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

export default function TemplateSelector({ onComplete }: TemplateSelectorProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string>('custom');
  const [showAISalesAgent, setShowAISalesAgent] = useState(false);
  const [config, setConfig] = useState<TemplateConfig>({
    states: [],
    businessName: '',
    features: []
  });

  // Filter for attorney templates
  const attorneyTemplates = projectTemplates.filter(t => 
    t.category === 'Legal' && t.targetRole?.includes('Attorney')
  );

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleStackToggle = (stackId: string) => {
    setSelectedStacks(prev => 
      prev.includes(stackId) 
        ? prev.filter(id => id !== stackId)
        : [...prev, stackId]
    );
  };

  const handleBundleSelect = (bundleId: string) => {
    setSelectedBundle(bundleId);
    if (bundleId !== 'custom' && stackBundles[bundleId]) {
      setSelectedStacks(stackBundles[bundleId].stacks);
    }
  };

  const calculateTotalPrice = () => {
    if (selectedBundle !== 'custom' && stackBundles[selectedBundle]) {
      return stackBundles[selectedBundle].monthlyPrice;
    }
    
    return selectedStacks.reduce((total, stackId) => {
      const stack = marketingStacks.find(s => s.id === stackId);
      return total + (stack?.price || 0);
    }, 0);
  };

  const handleComplete = () => {
    if (selectedTemplate) {
      onComplete(selectedTemplate, selectedStacks, config);
    }
  };

  // Show AI Sales Agent if triggered
  if (showAISalesAgent && selectedTemplate) {
    return (
      <AISalesAgent 
        selectedTemplate={selectedTemplate}
        availableStacks={marketingStacks}
        onStackSelection={(stacks) => {
          setSelectedStacks(stacks);
          setShowAISalesAgent(false);
          setStep(3);
        }}
        onComplete={() => {
          setShowAISalesAgent(false);
          handleComplete();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              1
            </div>
            <div className={cn("w-24 h-1", step >= 2 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              2
            </div>
            <div className={cn("w-24 h-1", step >= 3 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
              step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Choose Your Legal Practice Template</h2>
              <p className="text-lg text-muted-foreground">
                Select a template optimized for your practice area
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attorneyTemplates.map(template => (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary">
                        {template.industry}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {template.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {template.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && selectedTemplate && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Configure Your {selectedTemplate.name}</h2>
              <p className="text-lg text-muted-foreground">
                Customize your website details
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Business Name */}
                  <div>
                    <Label htmlFor="business-name">Law Firm Name</Label>
                    <input
                      id="business-name"
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Smith & Associates Law Firm"
                      value={config.businessName}
                      onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                    />
                  </div>

                  {/* State Selection */}
                  <div>
                    <Label>States Where You're Licensed</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select all states where you can practice law
                    </p>
                    <ScrollArea className="h-48 border rounded-md p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {US_STATES.map(state => (
                          <div key={state.code} className="flex items-center space-x-2">
                            <Checkbox
                              id={state.code}
                              checked={config.states.includes(state.code)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setConfig({ ...config, states: [...config.states, state.code] });
                                } else {
                                  setConfig({ ...config, states: config.states.filter(s => s !== state.code) });
                                }
                              }}
                            />
                            <Label htmlFor={state.code} className="text-sm cursor-pointer">
                              {state.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Practice Areas */}
                  <div>
                    <Label>Primary Practice Areas</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {[
                        'Car Accidents',
                        'Truck Accidents',
                        'Motorcycle Accidents',
                        'Slip & Fall',
                        'Medical Malpractice',
                        'Wrongful Death',
                        'Product Liability',
                        'Workers Compensation'
                      ].map(area => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={config.features.includes(area)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setConfig({ ...config, features: [...config.features, area] });
                              } else {
                                setConfig({ ...config, features: config.features.filter(f => f !== area) });
                              }
                            }}
                          />
                          <Label htmlFor={area} className="text-sm cursor-pointer">
                            {area}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => setStep(3)}
                        disabled={!config.businessName || config.states.length === 0}
                      >
                        Skip AI Assistant
                      </Button>
                      <Button 
                        onClick={() => setShowAISalesAgent(true)}
                        disabled={!config.businessName || config.states.length === 0}
                        className="gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Talk to AI Sales Assistant
                        <Badge variant="secondary" className="ml-1">Recommended</Badge>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Marketing Stack Selection */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Choose Your AI Marketing Stack</h2>
              <p className="text-lg text-muted-foreground">
                Automate your entire marketing strategy with AI
              </p>
              <Badge className="mt-2" variant="secondary">
                <Sparkles className="w-3 h-3 mr-1" />
                Codexel XL Experience
              </Badge>
            </div>

            {/* Bundle Selection */}
            <div className="mb-8">
              <RadioGroup value={selectedBundle} onValueChange={handleBundleSelect}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className={cn(
                    "cursor-pointer transition-all",
                    selectedBundle === 'custom' && "ring-2 ring-primary"
                  )}>
                    <CardHeader className="pb-3">
                      <RadioGroupItem value="custom" id="custom" className="sr-only" />
                      <Label htmlFor="custom" className="cursor-pointer">
                        <CardTitle className="text-lg">Custom Stack</CardTitle>
                        <CardDescription>Choose individual tools</CardDescription>
                      </Label>
                    </CardHeader>
                  </Card>

                  {Object.entries(stackBundles).map(([id, bundle]) => (
                    <Card key={id} className={cn(
                      "cursor-pointer transition-all",
                      selectedBundle === id && "ring-2 ring-primary"
                    )}>
                      <CardHeader className="pb-3">
                        <RadioGroupItem value={id} id={id} className="sr-only" />
                        <Label htmlFor={id} className="cursor-pointer">
                          <div className="flex items-center justify-between mb-1">
                            <CardTitle className="text-lg">{bundle.name}</CardTitle>
                            {bundle.discount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Save {bundle.discount}%
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{bundle.description}</CardDescription>
                          <div className="mt-2 text-2xl font-bold text-primary">
                            ${bundle.monthlyPrice}/mo
                          </div>
                        </Label>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Stack Grid */}
            <Tabs defaultValue="essential" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="essential">Essential</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
              </TabsList>

              {['essential', 'growth', 'enterprise'].map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketingStacks
                      .filter(stack => stack.category === category)
                      .map(stack => (
                        <Card 
                          key={stack.id}
                          className={cn(
                            "cursor-pointer transition-all",
                            selectedStacks.includes(stack.id) && "ring-2 ring-primary"
                          )}
                          onClick={() => selectedBundle === 'custom' && handleStackToggle(stack.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="text-2xl">{stack.icon}</div>
                              <div className="text-right">
                                <div className="text-xl font-bold">${stack.price}</div>
                                <div className="text-xs text-muted-foreground">/month</div>
                              </div>
                            </div>
                            <CardTitle className="text-lg">{stack.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {stack.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {stack.features.slice(0, 3).map((feature, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <Check className="w-4 h-4 text-primary mt-0.5" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                              {stack.features.length > 3 && (
                                <div className="text-sm text-muted-foreground">
                                  +{stack.features.length - 3} more features
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Summary and Total */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Your Selection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Template:</span>
                    <span className="font-semibold">{selectedTemplate?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing Tools:</span>
                    <span className="font-semibold">{selectedStacks.length} selected</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total Monthly:</span>
                    <span className="text-primary">${calculateTotalPrice()}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    size="lg"
                    onClick={handleComplete}
                    className="min-w-[200px]"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch My Law Firm Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}