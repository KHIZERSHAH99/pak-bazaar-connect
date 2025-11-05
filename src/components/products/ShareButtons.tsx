import { Share2, Facebook, MessageCircle, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  productName: string;
  productUrl: string;
  productImage?: string;
}

export const ShareButtons = ({ productName, productUrl, productImage }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Product link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this product: ${productName}\n${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-3">Share this product</h4>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span>Share on WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10"
            onClick={handleFacebookShare}
          >
            <Facebook className="h-4 w-4 text-blue-600" />
            <span>Share on Facebook</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copied ? 'Link copied!' : 'Copy link'}</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
