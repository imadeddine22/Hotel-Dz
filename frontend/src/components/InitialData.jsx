'use client';

import { createContext, useContext } from 'react';

/**
 * Hands data a server layout already fetched to the client page below it, so the page renders
 * its real content in the server HTML (what search engines and AI crawlers read) instead of a
 * "Chargement..." placeholder. The page still re-fetches in the browser to localize it.
 */
const Ctx = createContext(null);

export function InitialData({ value, children }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useInitialData = () => useContext(Ctx);
