export interface Attendee {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  turn: boolean;
  dices: number[],
  diceThrowing: boolean;
  dead: boolean
}

export interface Alert {
  show: boolean,
  heading?: string,
  text?: string
}

export interface RoomInterface {
  admin: string,
  id: string,
  currentAssume: {
    currentCountOfDices: number,
    currentNumber: number
  },
  turningPlayerIndex: number,
  diceThrowing: boolean,
  winner: string
}

export interface User {
  uid: string;
  email: string;
  displayName: string,
  photoURL: string
}
