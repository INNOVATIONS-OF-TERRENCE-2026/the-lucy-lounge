import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Sparkles } from "lucide-react";

interface FeatureSettings {
  experimental_tools: { enabled: boolean };
  public_shares: { enabled: boolean };
  multi_user_rooms: { enabled: boolean };
  advanced_effects: { particles: boolean; backgrounds: boolean };
}

export const FeatureToggles = () => {
  const [settings, setSettings] = useState<FeatureSettings>({
    experimental_tools: { enabled: true },
    public_shares: { enabled: true },
    multi_user_rooms: { enabled: true },
    advanced_effects: { particles: true, backgrounds: true },
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('*');

      if (data) {
        const settingsObj: Partial<FeatureSettings> = {};
        data.forEach((item) => {
          settingsObj[item.setting_key as keyof FeatureSettings] = item.setting_value;
        });
        setSettings((prev) => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: unknown) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings((prev) => ({ ...prev, [key]: value }));

      toast({
        title: "Setting updated",
        description: "Feature toggle has been updated successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-full animate-neural-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Feature Toggles
        </CardTitle>
        <CardDescription>Enable or disable platform features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
          <div className="space-y-0.5">
            <Label htmlFor="experimental-tools" className="text-base">
              Experimental Tools
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable access to experimental AI tools
            </p>
          </div>
          <Switch
            id="experimental-tools"
            checked={settings.experimental_tools?.enabled}
            onCheckedChange={(checked) =>
              updateSetting('experimental_tools', { enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
          <div className="space-y-0.5">
            <Label htmlFor="public-shares" className="text-base">
              Public Share Links
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow users to create public conversation shares
            </p>
          </div>
          <Switch
            id="public-shares"
            checked={settings.public_shares?.enabled}
            onCheckedChange={(checked) =>
              updateSetting('public_shares', { enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
          <div className="space-y-0.5">
            <Label htmlFor="multi-user-rooms" className="text-base">
              Multi-User Rooms
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable collaborative chat rooms feature
            </p>
          </div>
          <Switch
            id="multi-user-rooms"
            checked={settings.multi_user_rooms?.enabled}
            onCheckedChange={(checked) =>
              updateSetting('multi_user_rooms', { enabled: checked })
            }
          />
        </div>

        <div className="space-y-4 p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Label className="text-base">Advanced Visual Effects</Label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="particles" className="text-sm">
                Particle Effects
              </Label>
              <p className="text-xs text-muted-foreground">
                Floating particles and cosmic dust
              </p>
            </div>
            <Switch
              id="particles"
              checked={settings.advanced_effects?.particles}
              onCheckedChange={(checked) =>
                updateSetting('advanced_effects', {
                  ...settings.advanced_effects,
                  particles: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="backgrounds" className="text-sm">
                Dynamic Backgrounds
              </Label>
              <p className="text-xs text-muted-foreground">
                Animated cosmic backgrounds
              </p>
            </div>
            <Switch
              id="backgrounds"
              checked={settings.advanced_effects?.backgrounds}
              onCheckedChange={(checked) =>
                updateSetting('advanced_effects', {
                  ...settings.advanced_effects,
                  backgrounds: checked,
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};