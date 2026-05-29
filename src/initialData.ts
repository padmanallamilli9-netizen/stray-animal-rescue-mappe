import { RescueReport, Shelter } from './types';

export const INITIAL_REPORTS: RescueReport[] = [
  {
    id: 'rep-1',
    animalType: 'Dog',
    problem: 'Fractured front leg, limping heavily near the construction site. Appears dehydrated and frightened.',
    severity: 'critical',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    location: 'Central Park West Side, Sector 4',
    contact: '+1 (555) 0192-384',
    timestamp: 'May 29, 2026 12:45 UTC',
    status: 'dispatched',
    notes: 'Rescue wagon dispatched. Eta 10 minutes.',
  },
  {
    id: 'rep-2',
    animalType: 'Cat',
    problem: 'A mother cat and three small newborn kittens trapped under a metal sheet during the heavy rain.',
    severity: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    location: '44th Industrial Boulevard Yard',
    contact: '+1 (555) 9821-443',
    timestamp: 'May 29, 2026 11:20 UTC',
    status: 'reported',
  },
  {
    id: 'rep-3',
    animalType: 'Kestrel / Bird',
    problem: 'Slight wing entanglement in plastic mesh. Unable to fly, perched low on a hedge near the public library.',
    severity: 'stable',
    imageUrl: 'https://images.unsplash.com/photo-1460518451285-cd7bc9d9b711?auto=format&fit=crop&q=80&w=600',
    location: 'East Side Public Library Gardens',
    contact: '+1 (555) 7543-982',
    timestamp: 'May 29, 2026 09:15 UTC',
    status: 'recovering',
    notes: 'Brought to Haven Sanctuary. Wing detangled, undergoing 24h rest observation.'
  },
  {
    id: 'rep-4',
    animalType: 'Cow',
    problem: 'Stray cow wandered onto the state highway bypass, causing traffic congestion and highly endangered.',
    severity: 'critical',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600',
    location: 'Highway 101 Bypass Exit 14',
    contact: '+1 (555) 2381-110',
    timestamp: 'May 29, 2026 08:30 UTC',
    status: 'resolved',
    notes: 'Safely guided back to pasture by local unit in coordination with rural safety division.'
  }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'sh-1',
    name: 'Paws & Whiskers Sanctuary',
    address: '882 Serenity Way, Sector 5',
    phone: '+1 (555) 0123-999',
    capacityStatus: 'open',
    distance: '1.2 miles away',
    specialty: 'Dogs & Cats Rehabilitation',
  },
  {
    id: 'sh-2',
    name: 'Haven Avian & Wildlife Rescue',
    address: '14 Woodland Lane, North Outskirts',
    phone: '+1 (555) 4411-220',
    capacityStatus: 'limited',
    distance: '3.8 miles away',
    specialty: 'Birds, Orphans & Small Mammals',
  },
  {
    id: 'sh-3',
    name: 'Greenfield Valley Animal Trust',
    address: 'Highway 12 Rural Junction',
    phone: '+1 (555) 7766-311',
    capacityStatus: 'open',
    distance: '5.5 miles away',
    specialty: 'Livestock & Large Animals Rescue',
  },
  {
    id: 'sh-4',
    name: 'Metropolitan Vet Hospital (24/7)',
    address: '500 Medical Plaza, Central District',
    phone: '+1 (555) 0199-911',
    capacityStatus: 'limited',
    distance: '2.1 miles away',
    specialty: 'Trauma & Emergency Surgeries',
  }
];
