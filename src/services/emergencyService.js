import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

const emergenciesRef = collection(db, "emergencies");

/**
 * Create a new emergency in Firestore
 */
export async function createEmergency(data, userId) {
  const emergencyData = {
    ...data,

    // Who reported it
    reportedBy: userId,

    // Initial workflow state
    status: "reported",

    // Responder assignment
    assignedResponder: null,

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(emergenciesRef, emergencyData);

  return docRef.id;
}

/**
 * Listen for all emergencies in real time
 */
export function subscribeToEmergencies(callback) {
  return onSnapshot(
    emergenciesRef,
    (snapshot) => {
      const emergencies = snapshot.docs.map((item) => {
        const data = item.data();

        return {
          id: item.id,
          ...data,

          createdAt: data.createdAt?.toMillis?.() || Date.now(),
          updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
        };
      });

      callback(emergencies);
    },
    (error) => {
      console.error("Emergency listener error:", error);
    }
  );
}

/**
 * Update an emergency
 */
export async function updateEmergency(emergencyId, updates) {
  const emergencyRef = doc(db, "emergencies", emergencyId);

  await updateDoc(emergencyRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}