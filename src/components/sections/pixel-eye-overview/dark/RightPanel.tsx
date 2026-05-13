import React from 'react';
import { useNavigate } from 'react-router-dom';
import useColorMode from 'hooks/useColorMode';
import type { HighPriorityLead } from '../types';

interface RightPanelProps {
  notifications?: any[];
  actions?: { 
    highPriorityCount?: number;
    highPriorityLeads?: HighPriorityLead[];
  };
}

const RightPanel: React.FC<RightPanelProps> = ({ actions = {} }) => {
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const { 
    highPriorityCount = 0,
    highPriorityLeads = []
  } = actions;

  const displayedLeads = highPriorityLeads.slice(0, 12);
  const remainingCount = Math.max(0, highPriorityCount - displayedLeads.length);

  const handleShowAllContacts = () => {
    navigate('/pages/d/pixeleye/leads');
  };

  const LeadItem = ({ lead }: { lead: HighPriorityLead }) => {
    const initials = (lead.customer_name || 'U')
      .split(' ')
      .map(s => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div className={`flex items-center gap-3 p-2 rounded-md transition-colors group ${
        mode === 'dark' ? 'hover:bg-[#0F1714]' : 'hover:bg-gray-100'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
          mode === 'dark' 
            ? 'bg-[#052E16] text-white border-[#16A34A]/30' 
            : 'bg-green-100 text-green-800 border-green-300'
        }`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold truncate transition-colors ${
            mode === 'dark' 
              ? 'text-white group-hover:text-[#DFFFE3]' 
              : 'text-gray-900 group-hover:text-green-700'
          }`}>
            {lead.customer_name}
          </div>
          <div className={`text-xs truncate ${mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'}`}>
            {lead.phone_number}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#DC2626] shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
        </div>
      </div>
    );
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Action Panel Header */}
      <div className={`pb-3 border-b ${mode === 'dark' ? 'border-[#1E2E25]' : 'border-gray-200'}`}>
        <div className={`text-lg font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Actions</div>
        <div className={`text-xs mt-1 ${mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'}`}>
          Quick access to priority leads
        </div>
      </div>

      {/* Priority Lead Queue */}
      <div>
        <div className={`mb-2 pb-2 border-b ${mode === 'dark' ? 'border-[#0F1B16]' : 'border-gray-200'}`}>
          <div className={`text-sm font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Priority Lead Queue
          </div>
          <div className={`text-xs mt-0.5 ${mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'}`}>
            Showing first {displayedLeads.length} leads
            {remainingCount > 0 && (
              <span className={`font-semibold ${mode === 'dark' ? 'text-[#16A34A]' : 'text-green-600'}`}>
                {' '}(+{remainingCount} more)
              </span>
            )}
          </div>
        </div>
        <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
          {displayedLeads.length > 0 ? (
            displayedLeads.map((lead) => (
              <LeadItem key={lead.id} lead={lead} />
            ))
          ) : (
            <div className={`text-xs py-4 text-center ${mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'}`}>
              No priority leads at the moment
            </div>
          )}
        </div>
        
        {/* Show All Contacts Link */}
        {displayedLeads.length > 0 && (
          <div className={`mt-3 pt-3 border-t ${mode === 'dark' ? 'border-[#0F1B16]' : 'border-gray-200'}`}>
            <button 
              onClick={handleShowAllContacts}
              className={`w-full py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === 'dark'
                  ? 'bg-[#111714] hover:bg-[#1E2E25] border-[#0F1B16] hover:border-[#16A34A]/30 text-[#DFFFE3] hover:text-white'
                  : 'bg-white hover:bg-green-50 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-700'
              }`}
            >
              <span>Show All Contacts</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
