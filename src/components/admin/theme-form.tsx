
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings } from "@/lib/data";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Theme"}
    </Button>
  );
}

// Function to convert HSL string to hex
function hslToHex(hsl: string): string {
    if (!hsl) return '#000000';
    const [h, s, l] = hsl.split(' ').map(val => parseFloat(val.replace('%', '')));
    
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    const toHex = (val: number) => {
        const hex = Math.round(val * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r + m)}${toHex(g + m)}${toHex(b + m)}`;
}

// Function to convert hex to HSL string
function hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


type ThemeFormProps = {
  settings: SiteSettings;
};

export default function ThemeForm({ settings }: ThemeFormProps) {
  const [state, formAction] = useActionState(updateSettings, null);
  const { toast } = useToast();

  const [primary, setPrimary] = useState(settings.theme?.primary || "172 56% 38%");
  const [accent, setAccent] = useState(settings.theme?.accent || "207 24% 63%");
  const [background, setBackground] = useState(settings.theme?.background || "240 14% 97%");

  useEffect(() => {
    if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" });
    }
    if (state?.success) {
      toast({ title: "Success", description: "Theme updated successfully!" });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="max-w-md space-y-8">
        <input type="hidden" name="theme-primary" value={primary} />
        <input type="hidden" name="theme-accent" value={accent} />
        <input type="hidden" name="theme-background" value={background} />
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{primary}</span>
                    <input
                        id="primary-color"
                        type="color"
                        value={hslToHex(primary)}
                        onChange={(e) => setPrimary(hexToHsl(e.target.value))}
                        className="h-8 w-14 rounded-md border p-0 cursor-pointer"
                    />
                </div>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="accent-color">Accent Color</Label>
                 <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{accent}</span>
                    <input
                        id="accent-color"
                        type="color"
                        value={hslToHex(accent)}
                        onChange={(e) => setAccent(hexToHsl(e.target.value))}
                        className="h-8 w-14 rounded-md border p-0 cursor-pointer"
                    />
                </div>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{background}</span>
                    <input
                        id="background-color"
                        type="color"
                        value={hslToHex(background)}
                        onChange={(e) => setBackground(hexToHsl(e.target.value))}
                        className="h-8 w-14 rounded-md border p-0 cursor-pointer"
                    />
                </div>
            </div>
        </div>
      <SubmitButton />
    </form>
  );
}
