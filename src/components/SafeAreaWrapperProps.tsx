import { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface SafeAreaWrapperProps {
  children: ReactNode;
}

export function SafeAreaWrapper({ children }: SafeAreaWrapperProps) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}