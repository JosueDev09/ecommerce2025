import { useState } from "react";

export const useCheckoutSections = () => {
  const [openSection, setOpenSection] = useState<number>(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const toggleSection = (section: number) => {
    if (section === 1 || completedSections.includes(section - 1)) {
      setOpenSection(openSection === section ? 0 : section);
    }
  };

  const handleSectionComplete = (section: number) => {
    if (!completedSections.includes(section)) {
      setCompletedSections([...completedSections, section]);
    }
    setOpenSection(section + 1);
  };

  return {
    openSection,
    completedSections,
    toggleSection,
    handleSectionComplete,
  };
};
