import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Server URL'yi environment variable'dan al, yoksa relative URL kullan (production için)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (window.location.hostname !== 'localhost' ? '' : 'http://localhost:5050');

// Debug için URL'yi yazdır
console.log('Environment:', {
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
  SERVER_URL: SERVER_URL,
  hostname: window.location.hostname
});

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // URL'yi server adresi ile birleştir
  const fullUrl = url.startsWith('http') ? url : `${SERVER_URL}${url}`;
  
  // Debug için URL'yi yazdır
  console.log('API Request:', { method, url, fullUrl, SERVER_URL });
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = (queryKey[0] as string).startsWith('http') 
      ? queryKey[0] as string 
      : `${SERVER_URL}${queryKey[0] as string}`;
      
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
