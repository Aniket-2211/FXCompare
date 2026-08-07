import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { firestore } from "./firebase";

export async function saveUserDocument(
  uid: string,
  data: Record<string, any>
) {
  await setDoc(
    doc(firestore, "users", uid),
    data,
    {
      merge: true,
    }
  );
}

export async function loadUserDocument(
  uid: string
) {
  const snapshot =
    await getDoc(
      doc(
        firestore,
        "users",
        uid
      )
    );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}