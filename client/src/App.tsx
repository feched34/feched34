import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, memo } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

// Lazy loading ile komponentleri yükle
const VoiceChat = lazy(() => import("@/pages/voice-chat"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading komponenti
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-[#141628]">
    <LoadingOverlay isVisible={true} />
  </div>
));
PageLoader.displayName = "PageLoader";

// Router'ı memoize et
const Router = memo(() => {
  return (
    <Switch>
      <Route path="/">
        <Suspense fallback={<PageLoader />}>
          <VoiceChat />
        </Suspense>
      </Route>
      <Route>
        <Suspense fallback={<PageLoader />}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
});
Router.displayName = "Router";

// Ana App komponenti
const App = memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
});
App.displayName = "App";

export default App;
