import { createContext, useContext, useEffect } from 'react';
import { useStore } from '../stores/store';

const StageContext = createContext();

export function StageProvider({ children }) {
    const currentStage = useStore(state => state.currentStage);
    const stages = useStore(state => state.stages);
    const checkStageProgress = useStore(state => state.checkStageProgress);
    const currency = useStore(state => state.currency);

    useEffect(() => {
        checkStageProgress();
    }, [currency, checkStageProgress]);

    const currentTheme = stages[currentStage].theme;

    // Set CSS variables for the theme
    useEffect(() => {
        document.documentElement.style.setProperty('--color-primary', currentTheme.primary);
        document.documentElement.style.setProperty('--color-secondary', currentTheme.secondary);
        document.documentElement.style.setProperty('--color-background', currentTheme.background);
        document.documentElement.style.setProperty('--color-accent', currentTheme.accent);
    }, [currentTheme]);

    return (
        <StageContext.Provider
            value={{
                currentStage,
                stageName: stages[currentStage].name,
                stageDescription: stages[currentStage].description,
                theme: currentTheme
            }}
        >
            {children}
        </StageContext.Provider>
    );
}

export const useStage = () => useContext(StageContext); 