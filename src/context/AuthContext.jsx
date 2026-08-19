import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      let adminAccount = false;
      try {
        const adminDoc = await getDoc(doc(db, "admins", nextUser.uid));

        adminAccount = adminDoc.exists();
        setIsAdmin(adminAccount);
      } catch (error) {
        console.error("Could not check admin account:", error);
        setIsAdmin(false);
      }

      try {
        const userRef = doc(db, "users", nextUser.uid);
        const userDoc = await getDoc(userRef);

        if (
          !adminAccount &&
          userDoc.exists() &&
          userDoc.data().banned === true
        ) {
          await signOut(auth);
          setLoading(false);
          window.location.assign(`${import.meta.env.BASE_URL}Banned`);
          return;
        }

        const profileData = {
          email: nextUser.email,
          lastActiveAt: serverTimestamp(),
        };

        if (!userDoc.exists()) {
          profileData.displayName = nextUser.displayName || "F1 Fan";
          profileData.banned = false;
          profileData.createdAt = serverTimestamp();
        }

        await setDoc(userRef, profileData, { merge: true });
      } catch (error) {
        console.error("Could not create or check user profile:", error);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!user || loading || isAdmin) {
      return;
    }

    const stopWatchingProfile = onSnapshot(
      doc(db, "users", user.uid),
      async (profileSnapshot) => {
        if (
          profileSnapshot.exists() &&
          profileSnapshot.data().banned === true
        ) {
          await signOut(auth);
          window.location.assign(`${import.meta.env.BASE_URL}Banned`);
        }
      },
      (error) => {
        console.error("Could not watch user ban status:", error);
      },
    );

    return stopWatchingProfile;
  }, [user, loading, isAdmin]);
  useEffect(() => {
    if (!user) {
      return;
    }

    const updateActivity = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            lastActiveAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error("Could not update user activity:", error);
      }
    };

    updateActivity();

    const activityTimer = setInterval(updateActivity, 60 * 1000);

    return () => clearInterval(activityTimer);
  }, [user]);

  const value = {
    user,
    isAdmin,
    loading,
    logout: () => signOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
