import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkStageProgressThunk } from '../slices/stageSlice';

const StageContext = createContext();

export function StageProvider({ children }) {
    const dispatch = useDispatch();
    const currentStage = useSelector(state => state.stage.currentStage);
    const stages = useSelector(state => state.stage.stages);
    const currency = useSelector(state => state.business.currency);

    useEffect(() => {
        dispatch(checkStageProgressThunk());
    }, [currency, dispatch]);

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