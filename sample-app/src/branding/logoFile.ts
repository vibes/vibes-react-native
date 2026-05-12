import RNFS from 'react-native-fs';

/** Single on-disk logo (avoids huge data: URIs + megabyte AsyncStorage JSON). */
const LOGO_FILE = 'vibes_header_brand_logo.jpg';

export function getLogoAbsolutePath(): string {
  return `${RNFS.DocumentDirectoryPath}/${LOGO_FILE}`;
}

/** URI suitable for `<Image source={{ uri }} />`. */
export function getLogoFileUri(): string {
  const p = getLogoAbsolutePath();
  return `file://${p}`;
}

export async function logoFileExists(): Promise<boolean> {
  try {
    return await RNFS.exists(getLogoAbsolutePath());
  } catch {
    return false;
  }
}

export async function removeLogoFile(): Promise<void> {
  const p = getLogoAbsolutePath();
  try {
    const ex = await RNFS.exists(p);
    if (ex) {
      await RNFS.unlink(p);
    }
  } catch {
    // ignore
  }
}

/**
 * Writes the picked photo into the fixed logo path (copy when possible, else base64).
 */
export async function writePhotoAssetToLogoFile(asset: {
  uri?: string;
  base64?: string;
}): Promise<boolean> {
  const dest = getLogoAbsolutePath();
  await removeLogoFile();

  if (asset.uri) {
    const candidates = [asset.uri, asset.uri.replace(/^file:\/\//, '')];
    for (const src of candidates) {
      try {
        await RNFS.copyFile(src, dest);
        if (await logoFileExists()) {
          return true;
        }
      } catch {
        // try next
      }
    }
  }

  if (asset.base64) {
    try {
      await RNFS.writeFile(dest, asset.base64, 'base64');
      return await logoFileExists();
    } catch {
      return false;
    }
  }

  return false;
}

/** Copy a picked document (or library file) into the fixed logo path. */
export async function copyUriToLogoFile(fromUri: string): Promise<boolean> {
  const dest = getLogoAbsolutePath();
  await removeLogoFile();
  const candidates = [fromUri, fromUri.replace(/^file:\/\//, '')];
  for (const src of candidates) {
    try {
      await RNFS.copyFile(src, dest);
      if (await logoFileExists()) {
        return true;
      }
    } catch {
      // try next
    }
  }
  return false;
}

/** Writes raw base64 image bytes to the logo file (used for legacy migration). */
export async function writeBase64ToLogoFile(data: string): Promise<boolean> {
  if (data.length > 1_500_000) {
    return false;
  }
  await removeLogoFile();
  try {
    await RNFS.writeFile(getLogoAbsolutePath(), data, 'base64');
    return await logoFileExists();
  } catch {
    return false;
  }
}
