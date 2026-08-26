'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CauseDonationTarget {
  id: number | string;
  title: string;
  category?: string;
  goal?: number;
  image?: string;
  description?: string;
  raised?: number;
  urgency?: string;
  author?: { name: string };
}

interface DonateContextType {
  isOpen: boolean;
  activeCause: CauseDonationTarget | null;
  openDonateModal: (cause?: CauseDonationTarget | null) => void;
  closeDonateModal: () => void;
}

const DEFAULT_FEATURED_CAUSE: CauseDonationTarget = {
  id: 'general-humanitarian',
  title: 'Clean Water & Community Solar Wells',
  category: 'Clean Water & Health',
  goal: 50000,
  raised: 24500,
  image: '/causes/cause_water_1786200462466.jpg',
  description: 'Funding sustainable solar-powered deep borehole wells across drought-affected East African villages.',
  urgency: 'Featured',
};

const DonateContext = createContext<DonateContextType>({} as DonateContextType);

export function DonateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCause, setActiveCause] = useState<CauseDonationTarget | null>(null);

  const openDonateModal = (cause?: CauseDonationTarget | null) => {
    setActiveCause(cause || DEFAULT_FEATURED_CAUSE);
    setIsOpen(true);
  };

  const closeDonateModal = () => {
    setIsOpen(false);
  };

  return (
    <DonateContext.Provider
      value={{
        isOpen,
        activeCause,
        openDonateModal,
        closeDonateModal,
      }}
    >
      {children}
    </DonateContext.Provider>
  );
}

export const useDonate = () => useContext(DonateContext);
