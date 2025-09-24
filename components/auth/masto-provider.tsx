"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { mastodon } from "masto";
import { createRestAPIClient } from "masto"

export type MastoClient = mastodon.rest.Client;

const MastoContext = createContext<MastoClient | null>(null);

export function useMasto() {
  const client = useContext(MastoContext);
  if (!client) {
    throw new Error("Masto client not initialized. Wrap your app with <MastoProvider>.");
  }
  return client;
}

export function MastoProvider({ children, accessToken, server }: { children: React.ReactNode, accessToken: string, server: string }){
  const [client, setClient] = useState<MastoClient | null>(null)

  useEffect(() => {
    if (accessToken && server) {
      const c = createRestAPIClient({
        url: `https://${server}`,
        accessToken,
      })
      setClient(c)
    }
  }, [server, accessToken])

  return (
    <MastoContext.Provider value={client}>
      {children}
    </MastoContext.Provider>
  )
}
