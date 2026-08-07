import {
  loadUserDocument,
  saveUserDocument,
} from "./firestore";

export async function loadCloudFavouriteProviders(
  uid: string
): Promise<string[] | null> {
  const document =
    await loadUserDocument(uid);

  if (
    !document ||
    typeof document !== "object"
  ) {
    return null;
  }

  const favourites =
    (
      document as {
        favouriteProviders?: unknown;
      }
    ).favouriteProviders;

  if (!Array.isArray(favourites)) {
    return null;
  }

  return favourites.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0
  );
}

export async function saveCloudFavouriteProviders(
  uid: string,
  providers: string[]
) {
  await saveUserDocument(
    uid,
    {
      favouriteProviders:
        providers,
      favouritesUpdatedAt:
        new Date().toISOString(),
    }
  );
}