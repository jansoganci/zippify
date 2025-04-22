import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface GeneratedListingOutputProps {
  title: string;
  description: string;
  keywords: string[];
  altText: string;
}

const GeneratedListingOutput: React.FC<GeneratedListingOutputProps> = ({
  title,
  description,
  keywords,
  altText,
}) => {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: "Copied to clipboard",
      description: `${section} has been copied to your clipboard.`,
    });
    
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {title && (
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-0">
            <div className="flex items-start justify-between p-4 bg-muted/20">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(title, 'Title')}
                className="mt-1"
              >
                {copiedSection === 'Title' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {description && (
        <Card className="overflow-hidden border-l-4 border-l-primary/80">
          <CardContent className="p-0">
            <div className="flex items-start justify-between p-4 bg-muted/20">
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(description, 'Description')}
              >
                {copiedSection === 'Description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="h-[1px] w-full bg-border" />
            <div className="p-4">
              <ReactMarkdown components={{
                p: ({node, ...props}) => <p className="text-foreground mb-3" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />
              }}>{description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {keywords && keywords.length > 0 && (
        <Card className="overflow-hidden border-l-4 border-l-primary/60">
          <CardContent className="p-0">
            <div className="flex items-start justify-between p-4 bg-muted/20">
              <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(keywords.join(', '), 'Tags')}
              >
                {copiedSection === 'Tags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="h-[1px] w-full bg-border" />
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge 
                    key={`${keyword}-${index}`}
                    variant="secondary"
                    className="text-sm px-3 py-1 rounded-full"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {altText && (
        <Card className="overflow-hidden border-l-4 border-l-primary/40">
          <CardContent className="p-0">
            <div className="flex items-start justify-between p-4 bg-muted/20">
              <h3 className="text-sm font-medium text-muted-foreground">Alt Text for Images</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(altText, 'Alt Text')}
              >
                {copiedSection === 'Alt Text' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="h-[1px] w-full bg-border" />
            <div className="p-4">
              <ReactMarkdown components={{
                p: ({node, ...props}) => <p className="text-foreground mb-3" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />
              }}>{altText}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneratedListingOutput;
