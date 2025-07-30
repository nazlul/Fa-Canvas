"use client";

import dynamic from "next/dynamic";
import { APP_NAME } from "~/lib/constants";
import { AuthProvider } from "~/components/providers/AuthProvider";

// note: dynamic import is required for components that use the Frame SDK
const AppComponent = dynamic(() => import("~/components/App"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {
  return (
    <AuthProvider>
      <AppComponent title={title} />
    </AuthProvider>
  );
}
