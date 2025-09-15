
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function ThemePage() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    const storedThemeName = localStorage.getItem('selected-theme-name') || themes[0].name;
    setSelectedTheme(storedThemeName);
  }, []);

  const handleThemeSelect = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      const styleString = Object.entries(theme.cssVars)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
        
      localStorage.setItem('selected-theme', styleString);
      localStorage.setItem('selected-theme-name', themeName);
      setSelectedTheme(themeName);
      
      // Force a re-render of the layout by reloading the page
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Theme</h1>
        <p className="text-muted-foreground">Select a color theme for your site.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card key={theme.name} className={cn("overflow-hidden", selectedTheme === theme.name && "border-primary border-2")}>
            <CardHeader>
              <CardTitle>{theme.name}</CardTitle>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-2 overflow-hidden mb-4">
                {Object.values(theme.previewColors).map((color, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-card"
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                ))}
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleThemeSelect(theme.name)}
                variant={selectedTheme === theme.name ? "default" : "outline"}
                disabled={selectedTheme === theme.name}
              >
                {selectedTheme === theme.name ? (
                    <>
                        <Check className="mr-2 h-4 w-4" />
                        Applied
                    </>
                ) : "Apply Theme"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
