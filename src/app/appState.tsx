import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { persistLocale, resolveInitialLocale, type Locale } from "../i18n";
import type { SceneId } from "../scenes/types";
import { mainNavigationMode, sceneFromSearch, type AppMode, urlWithState } from "./navigation";
import { sceneRegistry } from "./sceneRegistry";

type AppStateValue = {
  locale: Locale;
  mode: AppMode;
  resetVersion: number;
  setLocale: (locale: Locale) => void;
  navigateMain: (direction: "previous" | "next") => void;
  navigateLateral: () => void;
  navigateToScene: (sceneId: SceneId) => void;
  cancelBridge: () => void;
  completeBridge: () => void;
  resetCamera: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(() => resolveInitialLocale());
  const [mode, setMode] = useState<AppMode>(() => ({
    kind: "scene",
    sceneId: sceneFromSearch(window.location.search),
  }));
  const [resetVersion, setResetVersion] = useState(0);

  const updateUrl = useCallback((sceneId: SceneId, nextLocale: Locale) => {
    const nextUrl = urlWithState(window.location.href, { sceneId, locale: nextLocale });
    window.history.replaceState(null, "", nextUrl);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    updateUrl(mode.kind === "scene" ? mode.sceneId : mode.originSceneId, locale);
  }, [locale, mode, updateUrl]);

  useEffect(() => {
    const handlePopState = () => {
      setLocaleState(resolveInitialLocale({ savedLocale: null }));
      setMode({ kind: "scene", sceneId: sceneFromSearch(window.location.search) });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    persistLocale(nextLocale);
    setLocaleState(nextLocale);
  }, []);

  const navigateMain = useCallback((direction: "previous" | "next") => {
    setMode((current) => {
      if (current.kind !== "scene") return current;
      return mainNavigationMode(current.sceneId, direction);
    });
  }, []);

  const navigateLateral = useCallback(() => {
    setMode((current) => {
      if (current.kind !== "scene") return current;
      const lateralSibling = sceneRegistry[current.sceneId].lateralSibling;
      return lateralSibling ? { kind: "scene", sceneId: lateralSibling } : current;
    });
  }, []);

  const cancelBridge = useCallback(() => {
    setMode((current) =>
      current.kind === "bridge" ? { kind: "scene", sceneId: current.originSceneId } : current,
    );
  }, []);

  const completeBridge = useCallback(() => {
    setMode((current) =>
      current.kind === "bridge" ? { kind: "scene", sceneId: current.targetSceneId } : current,
    );
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      locale,
      mode,
      resetVersion,
      setLocale,
      navigateMain,
      navigateLateral,
      navigateToScene: (sceneId) => setMode({ kind: "scene", sceneId }),
      cancelBridge,
      completeBridge,
      resetCamera: () => setResetVersion((version) => version + 1),
    }),
    [
      locale,
      mode,
      resetVersion,
      setLocale,
      navigateMain,
      navigateLateral,
      cancelBridge,
      completeBridge,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// Context and its hook intentionally share this small module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used within AppStateProvider.");
  return value;
}
