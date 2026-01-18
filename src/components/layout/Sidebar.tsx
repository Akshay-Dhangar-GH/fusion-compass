import { 
  LayoutDashboard, 
  FileText, 
  Grid3X3, 
  LineChart, 
  Settings,
  ChevronRight,
  Atom,
  Shield,
  Wrench,
  Briefcase,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Executive Summary', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'passports', label: 'Asset Passports', icon: <FileText className="w-5 h-5" />, badge: '6' },
  { id: 'matrix', label: 'Criticality Matrix', icon: <Grid3X3 className="w-5 h-5" /> },
  { id: 'analytics', label: 'Decision Analytics', icon: <LineChart className="w-5 h-5" /> },
  { id: 'costbenefit', label: 'Cost-Benefit Analysis', icon: <Calculator className="w-5 h-5" /> },
  { id: 'consulting', label: 'Delivery Model', icon: <Briefcase className="w-5 h-5" /> },
];

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Atom className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Fusion Lifecycle</h1>
            <p className="text-xs text-sidebar-foreground/60">Passport System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="flp-section-title px-4 mb-3 text-sidebar-foreground/40">Navigation</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              'flp-nav-link w-full text-left',
              activeSection === item.id && 'active'
            )}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                {item.badge}
              </span>
            )}
            {activeSection === item.id && (
              <ChevronRight className="w-4 h-4 opacity-60" />
            )}
          </button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-lg bg-sidebar-accent">
            <p className="text-2xl font-bold text-sidebar-primary">2</p>
            <p className="text-xs text-sidebar-foreground/60">Critical</p>
          </div>
          <div className="p-3 rounded-lg bg-sidebar-accent">
            <p className="text-2xl font-bold text-sidebar-accent-foreground">6</p>
            <p className="text-xs text-sidebar-foreground/60">Assets</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">ISO 55000</p>
            <p className="text-xs text-sidebar-foreground/60">Compliant Framework</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
