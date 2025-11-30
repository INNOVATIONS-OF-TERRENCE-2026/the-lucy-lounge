import { useNavigate } from "react-router-dom";
import { ToolsMarketplace as ToolsMarketplaceComponent } from "@/components/tools/ToolsMarketplace";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ToolsMarketplace() {
  const navigate = useNavigate();

  const handleToolSelect = (toolId: string) => {
    console.log('[Tools] Selected:', toolId);
    // Navigate to chat with tool pre-selected
    navigate('/chat', { state: { selectedTool: toolId } });
  };

  return (
    <div className="min-h-screen relative">
      <CosmicBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/chat')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chat
        </Button>
        
        <ToolsMarketplaceComponent onToolSelect={handleToolSelect} />
      </div>
    </div>
  );
}
