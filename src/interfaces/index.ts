export interface Guest {
  id: string;
  eventId: string;
  companionId: string;
  firstName: string;
  lastName: string;
  status: string;
  comment?: string;
}
export interface GuestCreationMaterial {
  firstName: string,
  lastName: string,
  showDropDown: boolean,
}

export interface GuestPayload {
  firstName: string;
  lastName: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string,
  photoURL: string
}

export interface Event {
  id: string;
  userId: string;
  name: string;
  bride: string;
  groom: string;
  startTime: string;
  address: string;
}

export interface Companion {
  id: string;
  eventId: string;
  submitted: boolean;
  url: string
}

export interface AddEventPayload {
  name: string;
  bride: string;
  groom: string;
  startTime: string;
  address: string;
  email: string;
  userId?: string
}