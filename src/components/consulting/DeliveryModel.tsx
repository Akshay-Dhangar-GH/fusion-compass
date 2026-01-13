import { cn } from '@/lib/utils';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Building,
  Shield,
  Target,
  Layers,
  Calendar,
  Award
} from 'lucide-react';

export const DeliveryModel = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Consulting Delivery Model</h2>
        <p className="text-muted-foreground mt-1">
          Implementation framework for deploying the Fusion Lifecycle Passport in client engagements
        </p>
      </div>

      {/* Engagement Phases */}
      <div className="flp-card p-6">
        <h3 className="font-semibold text-foreground mb-6">Typical Project Phases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              phase: '1. Discovery',
              duration: '2-4 weeks',
              activities: [
                'Asset inventory and classification',
                'Stakeholder mapping',
                'Current state assessment',
                'Gap analysis against FLP framework',
              ],
              deliverables: ['Discovery Report', 'FLP Roadmap'],
            },
            {
              phase: '2. Framework Design',
              duration: '4-8 weeks',
              activities: [
                'Customise FLP structure to client needs',
                'Define criticality matrix parameters',
                'Design monitoring strategy templates',
                'Establish decision rules',
              ],
              deliverables: ['FLP Framework Document', 'Criticality Matrix'],
            },
            {
              phase: '3. Passport Population',
              duration: '8-16 weeks',
              activities: [
                'Populate passports for critical assets',
                'Capture degradation hypotheses',
                'Document uncertainties explicitly',
                'Cross-functional review workshops',
              ],
              deliverables: ['Asset Passports', 'Uncertainty Register'],
            },
            {
              phase: '4. Operationalisation',
              duration: '4-8 weeks',
              activities: [
                'Integrate with existing AM systems',
                'Train client teams',
                'Establish update governance',
                'Deploy analytics capabilities',
              ],
              deliverables: ['Training Materials', 'Governance Model', 'Analytics Dashboard'],
            },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="p-4 bg-muted/30 rounded-lg h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-foreground">{item.phase.split('. ')[1]}</h4>
                    <p className="text-xs text-muted-foreground">{item.duration}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Activities</p>
                    <ul className="space-y-1">
                      {item.activities.map((activity, j) => (
                        <li key={j} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Deliverables</p>
                    <div className="flex flex-wrap gap-1">
                      {item.deliverables.map((del, j) => (
                        <span key={j} className="text-xs px-2 py-1 bg-secondary rounded text-secondary-foreground">
                          {del}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {i < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stakeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flp-card p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Key Stakeholders
          </h3>
          <div className="space-y-4">
            {[
              { role: 'Engineering Leadership', involvement: 'Technical sign-off on asset classifications and degradation hypotheses' },
              { role: 'Asset Management', involvement: 'Framework ownership, governance, and integration with AM systems' },
              { role: 'Operations', involvement: 'Practical validation of maintainability and monitoring strategies' },
              { role: 'Regulatory Affairs', involvement: 'Alignment with licensing basis and safety case' },
              { role: 'Finance', involvement: 'Lifecycle cost inputs and investment prioritisation' },
              { role: 'Executive Sponsors', involvement: 'Strategic direction and resource allocation decisions' },
            ].map((stakeholder, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{stakeholder.role}</p>
                  <p className="text-xs text-muted-foreground">{stakeholder.involvement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flp-card p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            ISO 55000 Integration
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The FLP framework aligns with and enhances ISO 55000 asset management principles:
            </p>
            {[
              { principle: 'Value', alignment: 'Explicit system value dependency mapping for each asset' },
              { principle: 'Alignment', alignment: 'Clear link between asset decisions and organisational objectives' },
              { principle: 'Leadership', alignment: 'Decision-support tools for informed executive choices' },
              { principle: 'Assurance', alignment: 'Structured uncertainty documentation and reduction tracking' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-status-nominal" />
                  <span className="font-medium text-foreground text-sm">{item.principle}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{item.alignment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="flp-card p-6">
        <h3 className="font-semibold text-foreground mb-6">Key Benefits & Differentiators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: 'Decision Confidence',
              benefits: [
                'Explicit uncertainty quantification',
                'Evidence-based investment prioritisation',
                'Defensible regulatory positions',
              ],
            },
            {
              icon: Building,
              title: 'Operational Excellence',
              benefits: [
                'Proactive maintenance planning',
                'Reduced unplanned outages',
                'Optimised lifecycle costs',
              ],
            },
            {
              icon: Shield,
              title: 'Risk Management',
              benefits: [
                'Early identification of lifecycle risks',
                'Structured learning from FOAK experience',
                'Systematic knowledge capture',
              ],
            },
          ].map((category, i) => {
            const Icon = category.icon;
            return (
              <div key={i} className="p-4 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-3">{category.title}</h4>
                <ul className="space-y-2">
                  {category.benefits.map((benefit, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-status-nominal shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Fusion is a Forcing Function */}
      <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
        <div className="max-w-3xl">
          <Award className="w-10 h-10 mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-3">
            Why Fusion is a Forcing Function for Better Nuclear Asset Management
          </h3>
          <p className="text-primary-foreground/80 leading-relaxed mb-6">
            The extreme uncertainty inherent in fusion FOAK programmes demands an asset management 
            approach that is more rigorous, more explicit about unknowns, and more decision-focused 
            than traditional nuclear practice. The disciplines developed for fusion directly transfer 
            to improving asset management across SMRs, life extensions, and the broader nuclear fleet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              'Uncertainty-explicit thinking',
              'Value of information mindset',
              'Design-stage AM integration',
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
