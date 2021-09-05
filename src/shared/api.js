import { useState, useEffect } from "react";
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

// Quiz
// ----------

export function saveQuiz(user, allQs) {
  return firebase
    .database()
    .ref(`/tests/${user.uid}/${Date.now()}/qs`)
    .set(allQs);
}

export function useTests(user) {
  const [isLoading, setIsLoading] = useState(true);
  const [tests, setTests] = useState(null);
  const uid = user.uid;
  useEffect(() => {
    const ref = firebase.database().ref(`/tests/${uid}`);
    ref.on("value", (s) => {
      setTests(s.val() || {});
      setIsLoading(false);
    });
    return () => ref.off();
  }, [uid]);
  return [isLoading, tests];
}
