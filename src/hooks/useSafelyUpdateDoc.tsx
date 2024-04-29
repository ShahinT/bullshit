import { useCallback } from 'react';
import { updateDoc, DocumentReference } from 'firebase/firestore';

/**
 * Custom hook for safely updating Firestore documents.
 * @returns A function that can be used to update a document.
 */
function useSafelyUpdateDoc<T>() {
  return useCallback(async (documentRef: DocumentReference, data: Partial<T>): Promise<boolean> => {
    try {
      await updateDoc(documentRef, data);
      console.log('Document successfully updated');
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }, []);
}

export default useSafelyUpdateDoc;