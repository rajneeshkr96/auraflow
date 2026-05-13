"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Filter, Star, Download, Zap, MessageSquare, Bot, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@codeswayam/ui';
import { Badge } from '@codeswayam/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  tags: string[];
  featured: boolean;
  usageCount: number;
}

interface Category {
  name: string;
  count: number;
  label: string;
}

interface TemplateMarketplaceProps {
  templates: Template[];
  categories: Category[];
}

const categoryIcons = {
  LEAD_GENERATION: TrendingUp,
  CUSTOMER_SUPPORT: MessageSquare,
  ENGAGEMENT: Users,
  SALES: Zap,
  CONTENT_PROMOTION: Star,
};

const tierColors = {
  FREE: 'bg-green-100 text-green-800',
  STANDARD: 'bg-blue-100 text-blue-800',
  PRO: 'bg-purple-100 text-purple-800',
  ENTERPRISE: 'bg-orange-100 text-orange-800',
};

export default function TemplateMarketplace({ templates, categories }: TemplateMarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [installing, setInstalling] = useState<string | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || template.tier === selectedTier;
    
    return matchesSearch && matchesCategory && matchesTier;
  });

  const handleInstallTemplate = async (templateId: string) => {
    setInstalling(templateId);
    try {
      const response = await fetch('/api/templates/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Template installed successfully! Check your automations.');
      } else {
        toast.error(result.error || 'Failed to install template');
      }
    } catch (error) {
      toast.error('Failed to install template');
    } finally {
      setInstalling(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 w-full"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Template Library</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter leading-none">
            Automation <br />
            <span className="text-muted-foreground">Templates.</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Get started faster with pre-built automation templates. From lead generation to customer support, 
            find the perfect automation for your needs.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-6 h-12 bg-secondary border border-border rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Package className="w-4 h-4 mr-2" /> {templates.length} Templates
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-full border-border"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 h-12 rounded-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.name} value={category.name}>
                {category.label} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger className="w-full md:w-32 h-12 rounded-full">
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="PRO">Pro</SelectItem>
            <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Templates */}
      {searchTerm === '' && selectedCategory === 'all' && selectedTier === 'all' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tighter">Featured Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.filter(t => t.featured).slice(0, 3).map((template, i) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onInstall={handleInstallTemplate}
                installing={installing === template.id}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tighter">
            {searchTerm || selectedCategory !== 'all' || selectedTier !== 'all' ? 'Search Results' : 'All Templates'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onInstall={handleInstallTemplate}
              installing={installing === template.id}
              delay={i * 0.05}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TemplateCard({ 
  template, 
  onInstall, 
  installing, 
  delay = 0 
}: { 
  template: Template; 
  onInstall: (id: string) => void; 
  installing: boolean;
  delay?: number;
}) {
  const CategoryIcon = categoryIcons[template.category as keyof typeof categoryIcons] || Package;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <CategoryIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              {template.featured && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge className={`text-xs ${tierColors[template.tier as keyof typeof tierColors]}`}>
                {template.tier}
              </Badge>
            </div>
          </div>
          
          <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {template.description}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              {template.usageCount} installs
            </div>
            
            <Button
              onClick={() => onInstall(template.id)}
              disabled={installing}
              size="sm"
              className="rounded-full"
            >
              {installing ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-2" />
                  Install
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}