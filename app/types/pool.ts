export interface Pool {
  id: string;
  selectedImage: string; // Or a more specific type if images are predefined IDs
  name: string;
  description: string;
  buyIn: number; // Assuming this is a numerical value
  softCap: number; // Assuming this is a numerical value
  rulesLink: string;
  createdAt: Date;
  registrations: number;
  startTime: Date;
  registrationStart: string;
  registrationEnd: string;
  registrationEnabled: boolean;
}
