import useColorMode from './useColorMode';
import { tokensFor, type Tokens } from 'theme/tokens';

/**
 * Resolves the design tokens for the active colour mode.
 * Every component in `components/ui` styles itself through this so light and
 * dark stay in lockstep without per-component `mode === 'dark' ? … : …` forks.
 */
const useTokens = (): Tokens => {
  const { mode } = useColorMode();
  return tokensFor(mode);
};

export default useTokens;
