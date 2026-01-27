/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ORGANIZATION SWITCHER                                    │
 * │                                                                             │
 * │ Dropdown component for switching between organizations                     │
 * │                                                                             │
 * │ Lucy knows which team you're playing for.                                  │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Check, 
  ChevronsUpDown, 
  Plus, 
  Settings,
  Crown,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useOrganization, UserOrganization } from '@/contexts/OrganizationContext';

// =============================================================================
// TYPES
// =============================================================================

interface OrgSwitcherProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function OrgSwitcher({ className, showLabel = true, size = 'default' }: OrgSwitcherProps) {
  const navigate = useNavigate();
  const { currentOrg, userOrgs, switchOrg, isOrgAdmin } = useOrganization();
  const [open, setOpen] = useState(false);

  const handleSelect = async (org: UserOrganization) => {
    if (org.id !== currentOrg?.id) {
      await switchOrg(org.id);
    }
    setOpen(false);
  };

  const handleCreateOrg = () => {
    setOpen(false);
    navigate('/settings/organizations/new');
  };

  const handleManageOrg = () => {
    setOpen(false);
    navigate('/settings/organization');
  };

  const getOrgIcon = (org: UserOrganization) => {
    if (org.isPlatformOrg) {
      return <Crown className="w-4 h-4 text-amber-500" />;
    }
    if (org.type === 'team' || org.type === 'enterprise') {
      return <Users className="w-4 h-4" />;
    }
    return <Building2 className="w-4 h-4" />;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'platform': return <Badge variant="outline" className="text-xs">Platform</Badge>;
      case 'enterprise': return <Badge variant="outline" className="text-xs">Enterprise</Badge>;
      case 'team': return <Badge variant="outline" className="text-xs">Team</Badge>;
      default: return null;
    }
  };

  // Group orgs by type
  const personalOrgs = userOrgs.filter(o => o.type === 'personal');
  const teamOrgs = userOrgs.filter(o => o.type === 'team' || o.type === 'enterprise');
  const platformOrgs = userOrgs.filter(o => o.type === 'platform');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className={cn(
            "justify-between",
            size === 'sm' && "h-8 text-sm",
            size === 'lg' && "h-12",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {currentOrg ? getOrgIcon(currentOrg) : <Building2 className="w-4 h-4" />}
            {showLabel && (
              <span className="truncate">
                {currentOrg?.name || 'Select organization'}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            
            {/* Personal Organizations */}
            {personalOrgs.length > 0 && (
              <CommandGroup heading="Personal">
                {personalOrgs.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => handleSelect(org)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getOrgIcon(org)}
                      <span className="truncate">{org.name}</span>
                    </div>
                    {currentOrg?.id === org.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Team Organizations */}
            {teamOrgs.length > 0 && (
              <CommandGroup heading="Teams">
                {teamOrgs.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => handleSelect(org)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getOrgIcon(org)}
                      <span className="truncate">{org.name}</span>
                      {getTypeBadge(org.type)}
                    </div>
                    {currentOrg?.id === org.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Platform Organizations */}
            {platformOrgs.length > 0 && (
              <CommandGroup heading="Platform">
                {platformOrgs.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => handleSelect(org)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getOrgIcon(org)}
                      <span className="truncate">{org.name}</span>
                    </div>
                    {currentOrg?.id === org.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            {/* Actions */}
            <CommandGroup>
              {isOrgAdmin && currentOrg && (
                <CommandItem onSelect={handleManageOrg} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Organization
                </CommandItem>
              )}
              <CommandItem onSelect={handleCreateOrg} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// =============================================================================
// COMPACT VERSION
// =============================================================================

export function OrgSwitcherCompact({ className }: { className?: string }) {
  return <OrgSwitcher className={className} showLabel={false} size="sm" />;
}

export default OrgSwitcher;
