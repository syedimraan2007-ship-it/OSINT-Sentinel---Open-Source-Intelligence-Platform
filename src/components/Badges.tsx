import React from 'react';
import { RiskLevel, StatusType } from '../types';

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, className = '' }) => {
  // Controlled Risk System
  // LOW: Green (#3A7D44)
  // GUARDED: Teal (#2A7F7F)
  // MEDIUM: Amber (#B7791F)
  // HIGH: Red (#B23A3A)
  // CRITICAL: Dark Red (#8B1E1E)
  const styles: Record<RiskLevel, { text: string; bg: string; border: string }> = {
    LOW: {
      text: '#3A7D44',
      bg: '#F2F7F3',
      border: '#D3E6D6',
    },
    GUARDED: {
      text: '#2A7F7F',
      bg: '#F0F7F7',
      border: '#D0E6E6',
    },
    MEDIUM: {
      text: '#B7791F',
      bg: '#FDF7EB',
      border: '#F6E4C4',
    },
    HIGH: {
      text: '#B23A3A',
      bg: '#FDF2F2',
      border: '#F9D5D5',
    },
    CRITICAL: {
      text: '#8B1E1E',
      bg: '#FAEDED',
      border: '#F3CCCC',
    },
  };

  const current = styles[risk] || styles.LOW;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded ${className}`}
      style={{
        color: current.text,
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
      }}
    >
      [ {risk} ]
    </span>
  );
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Status Colors:
  // Completed: Green (#3A7D44)
  // In Progress: Teal (#2A7F7F)
  // Needs Review: Amber (#B7791F)
  // Failed: Red (#B23A3A)
  // Unavailable: Gray (#626B73)
  // Potential Match: Navy Blue (#244A73)
  const styles: Record<StatusType, { text: string; bg: string; dot: string }> = {
    Completed: {
      text: '#3A7D44',
      bg: '#F2F7F3',
      dot: '#3A7D44',
    },
    'In Progress': {
      text: '#2A7F7F',
      bg: '#F0F7F7',
      dot: '#2A7F7F',
    },
    'Needs Review': {
      text: '#B7791F',
      bg: '#FDF7EB',
      dot: '#B7791F',
    },
    Failed: {
      text: '#B23A3A',
      bg: '#FDF2F2',
      dot: '#B23A3A',
    },
    Unavailable: {
      text: '#626B73',
      bg: '#F3F4F6',
      dot: '#9CA3AF',
    },
    'Potential Match': {
      text: '#244A73',
      bg: '#F0F4F8',
      dot: '#244A73',
    },
  };

  const current = styles[status] || styles.Unavailable;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded ${className}`}
      style={{
        color: current.text,
        backgroundColor: current.bg,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: current.dot }}
      />
      {status}
    </span>
  );
};
