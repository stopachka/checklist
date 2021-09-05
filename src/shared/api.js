import { useState, useEffect, useContext } from "react";
import firebase from "firebase/app";

// Auth State
// ----------

export function useAuthState() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setIsLoading(false);
      setUser(user);
    });
  }, []);
  return [isLoading, user];
}