import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DefaultTheme as NavDefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, type ImageSourcePropType } from 'react-native';
import { pickSingle, types, isCancel } from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeProvider } from 'styled-components/native';
import { defaultBrand, type AppTheme } from '../theme/brand';
import { withAlpha } from '../theme/colorUtils';
import {
  copyUriToLogoFile,
  getLogoFileUri,
  logoFileExists,
  removeLogoFile,
  writeBase64ToLogoFile,
  writePhotoAssetToLogoFile,
} from './logoFile';

const STORAGE_KEY = 'vibes_sample_branding_v2';

/** v2: small JSON; logo bytes live on disk only (fixes data: URI + AsyncStorage crashes). */
type PersistedV2 = {
  version: 2;
  colors: Partial<AppTheme>;
  hasCustomLogo: boolean;
};

type LegacyPersisted = {
  colors?: Partial<AppTheme>;
  logo?:
    | { kind: 'none' }
    | { kind: 'base64'; data: string; mime: string }
    | { kind: 'file'; uri: string };
};

function mergeTheme(partial: Partial<AppTheme>): AppTheme {
  return { ...defaultBrand, ...partial } as AppTheme;
}

function serializeColors(t: AppTheme): Partial<AppTheme> {
  const partial = {} as Record<keyof AppTheme, string | undefined>;
  (Object.keys(defaultBrand) as (keyof AppTheme)[]).forEach((k) => {
    if (t[k] !== defaultBrand[k]) {
      partial[k] = t[k];
    }
  });
  return partial as Partial<AppTheme>;
}

async function writeTheme(
  theme: AppTheme,
  hasCustomLogo: boolean
): Promise<void> {
  const payload: PersistedV2 = {
    version: 2,
    colors: serializeColors(theme),
    hasCustomLogo,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function loadTheme(raw: string): Promise<{
  colors: Partial<AppTheme>;
  hasCustomLogo: boolean;
  needsDiskRewrite: boolean;
}> {
  let needsDiskRewrite = false;
  try {
    const parsed = JSON.parse(raw) as PersistedV2 | LegacyPersisted;

    if (
      typeof parsed === 'object' &&
      parsed != null &&
      (parsed as PersistedV2).version === 2 &&
      typeof (parsed as PersistedV2).hasCustomLogo === 'boolean'
    ) {
      const p = parsed as PersistedV2;
      const colors = p.colors && typeof p.colors === 'object' ? p.colors : {};
      let has = p.hasCustomLogo;
      if (has && !(await logoFileExists())) {
        has = false;
        needsDiskRewrite = true;
      }
      return { colors, hasCustomLogo: has, needsDiskRewrite };
    }

    // Legacy v1 (inline base64 or ad-hoc file URI in JSON)
    needsDiskRewrite = true;
    const legacy = parsed as LegacyPersisted;
    const colors =
      legacy.colors && typeof legacy.colors === 'object' ? legacy.colors : {};
    const logo = legacy.logo;

    if (!logo || logo.kind === 'none') {
      await removeLogoFile();
      return { colors, hasCustomLogo: false, needsDiskRewrite: true };
    }

    if (logo.kind === 'base64' && logo.data) {
      const ok = await writeBase64ToLogoFile(logo.data);
      return { colors, hasCustomLogo: ok, needsDiskRewrite: true };
    }

    if (logo.kind === 'file' && logo.uri) {
      const ok = await copyUriToLogoFile(logo.uri);
      return { colors, hasCustomLogo: ok, needsDiskRewrite: true };
    }
  } catch {
    needsDiskRewrite = true;
    return { colors: {}, hasCustomLogo: false, needsDiskRewrite: true };
  }

  await removeLogoFile();
  return { colors: {}, hasCustomLogo: false, needsDiskRewrite: true };
}

type BrandingCtx = {
  theme: AppTheme;
  navigationTheme: NavigationTheme;
  headerLogoSource: ImageSourcePropType;
  /** Bump so `<Image key={…} />` remounts after replacing the file at a fixed path. */
  headerLogoKey: number;
  setBrandColor: (key: keyof AppTheme, hex: string) => void;
  resetBrandColors: () => void;
  pickLogoFromPhotos: () => Promise<void>;
  pickLogoFromFiles: () => Promise<void>;
  clearCustomLogo: () => Promise<void>;
};

const Ctx = createContext<BrandingCtx | null>(null);

const bundledLogo = require('../assets/logo.png');

export function BrandingProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [theme, setTheme] = useState<AppTheme>(
    () => ({ ...defaultBrand } as AppTheme)
  );
  const [hasCustomLogo, setHasCustomLogo] = useState(false);
  const [headerLogoKey, setHeaderLogoKey] = useState(0);
  const [ready, setReady] = useState(false);
  const skipNextPersist = useRef(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const {
            colors,
            hasCustomLogo: has,
            needsDiskRewrite,
          } = await loadTheme(raw);
          setTheme(mergeTheme(colors));
          setHasCustomLogo(has);
          if (needsDiskRewrite) {
            await writeTheme(mergeTheme(colors), has);
          }
        }
      } catch {
        // corrupt storage
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    void writeTheme(theme, hasCustomLogo);
  }, [theme, hasCustomLogo, ready]);

  const navigationTheme = useMemo(
    (): NavigationTheme => ({
      ...NavDefaultTheme,
      colors: {
        ...NavDefaultTheme.colors,
        primary: theme.primary,
        background: theme.background,
        card: theme.navBackground,
        text: theme.body,
        border: withAlpha(theme.primary, 0.12),
        notification: theme.primary,
      },
    }),
    [theme]
  );

  const headerLogoSource = useMemo((): ImageSourcePropType => {
    if (hasCustomLogo) {
      return { uri: getLogoFileUri() };
    }
    return bundledLogo;
  }, [hasCustomLogo]);

  const setBrandColor = useCallback((key: keyof AppTheme, hex: string) => {
    setTheme((prev) => ({ ...prev, [key]: hex }));
  }, []);

  const resetBrandColors = useCallback(() => {
    setTheme({ ...defaultBrand } as AppTheme);
  }, []);

  const pickLogoFromPhotos = useCallback(async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: true,
      maxWidth: 720,
      maxHeight: 720,
      quality: 0.5,
    });
    if (res.didCancel || !res.assets?.[0]) {
      return;
    }
    const a = res.assets[0];
    const ok = await writePhotoAssetToLogoFile(a);
    if (!ok) {
      Alert.alert(
        'Could not save image',
        'Try another photo or pick a file from the Files app.'
      );
      return;
    }
    setHasCustomLogo(true);
    setHeaderLogoKey((k) => k + 1);
  }, []);

  const pickLogoFromFiles = useCallback(async () => {
    try {
      const file = await pickSingle({
        type: [types.images],
        copyTo: 'documentDirectory',
      });
      const uri = file.fileCopyUri ?? file.uri;
      if (!uri) {
        Alert.alert('Could not import file', 'No usable file path was returned.');
        return;
      }
      if (file.copyError) {
        Alert.alert('Import warning', file.copyError);
      }
      const ok = await copyUriToLogoFile(uri);
      if (!ok) {
        Alert.alert(
          'Could not save image',
          'Try copying the image to Photos first, or pick a different file.'
        );
        return;
      }
      setHasCustomLogo(true);
      setHeaderLogoKey((k) => k + 1);
    } catch (e) {
      if (isCancel(e)) {
        return;
      }
      Alert.alert(
        'File picker failed',
        e instanceof Error ? e.message : String(e)
      );
    }
  }, []);

  const clearCustomLogo = useCallback(async () => {
    await removeLogoFile();
    setHasCustomLogo(false);
    setHeaderLogoKey((k) => k + 1);
  }, []);

  const value = useMemo(
    (): BrandingCtx => ({
      theme,
      navigationTheme,
      headerLogoSource,
      headerLogoKey,
      setBrandColor,
      resetBrandColors,
      pickLogoFromPhotos,
      pickLogoFromFiles,
      clearCustomLogo,
    }),
    [
      theme,
      navigationTheme,
      headerLogoSource,
      headerLogoKey,
      setBrandColor,
      resetBrandColors,
      pickLogoFromPhotos,
      pickLogoFromFiles,
      clearCustomLogo,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Ctx.Provider>
  );
}

export function useBranding(): BrandingCtx {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return v;
}
