export type Severity = 'critical' | 'moderate' | 'stable';

export type RescueStatus = 'reported' | 'dispatched' | 'recovering' | 'resolved';

export interface RescueReport {
  id: string;
  animalType: string;
  problem: string;
  severity: Severity;
  imageUrl: string;
  location: string;
  contact: string;
  timestamp: string;
  status: RescueStatus;
  notes?: string;
  dispatchTime?: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  phone: string;
  capacityStatus: 'open' | 'limited' | 'full';
  distance: string;
  specialty: string;
}
