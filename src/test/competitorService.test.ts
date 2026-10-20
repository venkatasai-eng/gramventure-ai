import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  filterWithinRadius,
  getDemoCompetitors,
  geocodeLocation,
} from '@/services/competitorService';
import type { ProviderCompetitor } from '@/types';

describe('Competitor Service & Geospatial Intelligence', () => {
  describe('haversineDistance', () => {
    it('returns 0 for identical coordinates', () => {
      const distance = haversineDistance(13.0827, 80.2707, 13.0827, 80.2707);
      expect(distance).toBe(0);
    });

    it('calculates accurate distance between Chennai and Madurai (~420 km)', () => {
      // Chennai: 13.0827, 80.2707
      // Madurai: 9.9252, 78.1198
      const distance = haversineDistance(13.0827, 80.2707, 9.9252, 78.1198);
      expect(distance).toBeGreaterThan(415);
      expect(distance).toBeLessThan(435);
    });

    it('is symmetric: dist(A, B) equals dist(B, A)', () => {
      const d1 = haversineDistance(11.0168, 76.9558, 10.7905, 78.7047);
      const d2 = haversineDistance(10.7905, 78.7047, 11.0168, 76.9558);
      expect(d1).toBeCloseTo(d2, 5);
    });
  });

  describe('filterWithinRadius', () => {
    const centerLat = 9.9252;
    const centerLng = 78.1198;

    const mockCompetitors: ProviderCompetitor[] = [
      {
        id: 'comp-1',
        name: 'Nearby Dairy Shop',
        category: 'dairy',
        lat: 9.9300,
        lon: 78.1250,
        distanceKm: 0.8,
        source: 'OpenStreetMap',
        retrievalTime: '12:00:00',
        attribution: 'OpenStreetMap contributors',
      },
      {
        id: 'comp-2',
        name: 'Out of Range Vendor',
        category: 'grocery',
        lat: 10.1500, // ~25 km away
        lon: 78.3000,
        distanceKm: 26.5,
        source: 'OpenStreetMap',
        retrievalTime: '12:00:00',
        attribution: 'OpenStreetMap contributors',
      },
      {
        id: 'comp-3',
        name: 'Boundary Market',
        category: 'grocery',
        lat: 9.9600,
        lon: 78.1400,
        distanceKm: 4.5,
        source: 'OpenStreetMap',
        retrievalTime: '12:00:00',
        attribution: 'OpenStreetMap contributors',
      },
    ];

    it('retains only competitors strictly within 5 km', () => {
      const filtered = filterWithinRadius(mockCompetitors, centerLat, centerLng, 5);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.id)).toEqual(['comp-1', 'comp-3']);
      filtered.forEach((c) => {
        expect(c.distanceKm).toBeLessThanOrEqual(5);
      });
    });

    it('sorts competitors by ascending distance', () => {
      const filtered = filterWithinRadius(mockCompetitors, centerLat, centerLng, 5);
      expect(filtered[0].distanceKm).toBeLessThan(filtered[1].distanceKm);
    });
  });

  describe('getDemoCompetitors', () => {
    it('returns synthetic competitors strictly within 5 km of center', () => {
      const centerLat = 9.9252;
      const centerLng = 78.1198;
      const demoComps = getDemoCompetitors(centerLat, centerLng, 5);

      expect(demoComps.length).toBeGreaterThan(0);
      demoComps.forEach((c) => {
        expect(c.source).toBe('Demo Provider');
        expect(c.distanceKm).toBeLessThanOrEqual(5);
        expect(c.name).toBeTruthy();
        expect(c.category).toBeTruthy();
      });
    });
  });

  describe('geocodeLocation', () => {
    it('falls back to official Tamil Nadu district centroid when geocoder is unreachable', async () => {
      const result = await geocodeLocation('', 'Madurai');
      expect(result).not.toBeNull();
      expect(result.lat).toBeCloseTo(9.9252, 1);
      expect(result.lng).toBeCloseTo(78.1198, 1);
      expect(result.source).toContain('Centroid');
      expect(result.accuracy).toContain('Centroid');
    });

    it('falls back to default centroid when district name is unknown and query is blank', async () => {
      const result = await geocodeLocation('', 'NonExistentDistrictXYZ');
      expect(result).not.toBeNull();
      expect(result.source).toBe('District Centroid');
    });
  });
});
