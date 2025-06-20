
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown } from 'lucide-react';

interface MobileDropdownProps {
  trigger: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({
  trigger,
  title = "Options",
  children,
  align = 'end'
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="max-h-[80vh] overflow-y-auto rounded-t-xl border-none bg-white shadow-2xl"
        >
          <SheetHeader className="text-left pb-4 border-b">
            <SheetTitle className="font-poppins text-pakistani_green-800">
              {title}
            </SheetTitle>
          </SheetHeader>
          <div className="pt-4 space-y-2">
            {React.Children.map(children, (child, index) => (
              <div 
                key={index}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                onClick={() => setOpen(false)}
              >
                {child}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="min-w-48 bg-white border shadow-lg z-50"
      >
        {React.Children.map(children, (child, index) => (
          <DropdownMenuItem key={index} className="cursor-pointer">
            {child}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileDropdown;
