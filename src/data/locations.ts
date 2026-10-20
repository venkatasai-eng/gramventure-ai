/**
 * GramVenture AI — Location Data Registry
 *
 * Provides Indian state and district hierarchies for selection.
 * Tamil Nadu features all 38 official districts as the primary operational focus.
 * Village/Town entries are user-entered or verified geocoded entities;
 * never fabricated.
 */

import { TAMIL_NADU_DISTRICTS } from './tamilNaduDistricts';

export interface LocationEntry {
  state: string;
  districts: {
    id?: string;
    name: string;
    nameTe?: string;
    nameTa?: string;
    lat?: number;
    lon?: number;
    blocks: {
      name: string;
      villages: string[];
    }[];
  }[];
}

export const INDIAN_LOCATIONS: LocationEntry[] = [
  {
    state: 'Tamil Nadu',
    districts: TAMIL_NADU_DISTRICTS.map((d) => ({
      id: d.id,
      name: d.nameEn,
      nameTe: d.nameTe,
      nameTa: d.nameTa,
      lat: d.lat,
      lon: d.lon,
      blocks: [
        {
          name: `${d.nameEn} Central Block`,
          villages: [],
        },
      ],
    })),
  },
  {
    state: 'Telangana',
    districts: [
      {
        name: 'Warangal',
        blocks: [
          {
            name: 'Dharmasagar',
            villages: ['Rampur', 'Mucheerla', 'Elkurthy', 'Devanoor'],
          },
          {
            name: 'Hanamkonda',
            villages: ['Madikonda', 'Palavelpula', 'Gopalpuram'],
          },
        ],
      },
      {
        name: 'Karimnagar',
        blocks: [
          {
            name: 'Manakondur',
            villages: ['Gatlapally', 'Vemulawada'],
          },
        ],
      },
    ],
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      {
        name: 'Krishna',
        blocks: [
          {
            name: 'Gannavaram',
            villages: ['Mustabada', 'Allapuram'],
          },
        ],
      },
    ],
  },
];
