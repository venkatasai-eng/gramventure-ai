import { describe, it, expect } from 'vitest';
import { t, validateTranslationKeys, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import {
  TAMIL_NADU_DISTRICTS,
  getDistrictDisplayName,
  getTamilNaduDistrictById,
} from '@/data/tamilNaduDistricts';

describe('Multilingual i18n System', () => {
  it('supports exactly English, Telugu, and Tamil with English as default', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(3);
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual(['en', 'te', 'ta']);
    expect(SUPPORTED_LANGUAGES[0].code).toBe('en');
    expect(SUPPORTED_LANGUAGES[1].label).toBe('తెలుగు (Telugu)');
    expect(SUPPORTED_LANGUAGES[2].label).toBe('தமிழ் (Tamil)');
  });

  it('translates core navigation and UI keys across all three languages', () => {
    // English
    expect(t('nav.demand', 'en')).toBe('Demand & Location');
    expect(t('demand.district', 'en')).toBe('Tamil Nadu District');
    expect(t('header.demo', 'en')).toBe('Explore Demo');

    // Telugu
    expect(t('nav.demand', 'te')).toBe('డిమాండ్ & స్థానం');
    expect(t('demand.district', 'te')).toBe('తమిళనాడు జిల్లా');
    expect(t('header.demo', 'te')).toBe('డెమో చూడండి');

    // Tamil
    expect(t('nav.demand', 'ta')).toBe('தேவை & இருப்பிடம்');
    expect(t('demand.district', 'ta')).toBe('தமிழ்நாடு மாவட்டம்');
    expect(t('header.demo', 'ta')).toBe('மாதிரி திட்டம்');
  });

  it('falls back to English when a key is missing in Telugu or Tamil', () => {
    const fallback = t('non.existent.key', 'te');
    expect(fallback).toBe('non.existent.key');
  });

  it('passes the development dictionary key parity audit (zero missing keys)', () => {
    const audit = validateTranslationKeys();
    expect(audit.missingInTe).toEqual([]);
    expect(audit.missingInTa).toEqual([]);
  });

  it('contains all 38 Tamil Nadu districts with localized names in EN, TE, and TA', () => {
    expect(TAMIL_NADU_DISTRICTS).toHaveLength(38);

    TAMIL_NADU_DISTRICTS.forEach((d) => {
      expect(d.id).toBeTruthy();
      expect(d.nameEn).toBeTruthy();
      expect(d.nameTe).toBeTruthy();
      expect(d.nameTa).toBeTruthy();
      expect(d.lat).toBeGreaterThan(8.0);
      expect(d.lat).toBeLessThan(14.0);
      expect(d.lon).toBeGreaterThan(76.0);
      expect(d.lon).toBeLessThan(81.0);

      expect(getDistrictDisplayName(d, 'en')).toBe(d.nameEn);
      expect(getDistrictDisplayName(d, 'te')).toBe(d.nameTe);
      expect(getDistrictDisplayName(d, 'ta')).toBe(d.nameTa);
    });
  });

  it('interpolates template parameters correctly in t()', () => {
    const enResult = t('finance.warning.exceeds', 'en', {
      schemeLimit: '₹9,00,000',
      affordableAmount: '₹3,50,000',
    });
    expect(enResult).toContain('₹9,00,000');
    expect(enResult).toContain('₹3,50,000');
    expect(enResult).not.toContain('{schemeLimit}');
    expect(enResult).not.toContain('{affordableAmount}');

    const teResult = t('finance.warning.exceeds', 'te', {
      schemeLimit: '₹9,00,000',
      affordableAmount: '₹3,50,000',
    });
    expect(teResult).toContain('₹9,00,000');
    expect(teResult).toContain('₹3,50,000');

    const taResult = t('finance.warning.exceeds', 'ta', {
      schemeLimit: '₹9,00,000',
      affordableAmount: '₹3,50,000',
    });
    expect(taResult).toContain('₹9,00,000');
    expect(taResult).toContain('₹3,50,000');
  });

  it('provides translated finance warning titles and messages across all three languages without raw keys', () => {
    ['en', 'te', 'ta'].forEach((lang) => {
      const title = t('finance.warning.exceedsTitle', lang as any);
      expect(title).not.toBe('finance.warning.exceedsTitle');
      expect(title.length).toBeGreaterThan(5);

      const msg = t('finance.warning.exceeds', lang as any, {
        schemeLimit: '₹9,00,000',
        affordableAmount: '₹3,50,000',
      });
      expect(msg).not.toBe('finance.warning.exceeds');
      expect(msg).toContain('₹9,00,000');
    });
  });

  it('preserves canonical district IDs independently of language switching', () => {
    const madurai = getTamilNaduDistrictById('madurai')!;
    expect(madurai).toBeDefined();
    expect(madurai.id).toBe('madurai');
    expect(getDistrictDisplayName(madurai, 'en')).toBe('Madurai');
    expect(getDistrictDisplayName(madurai, 'te')).toBe('మధురై');
    expect(getDistrictDisplayName(madurai, 'ta')).toBe('மதுரை');
  });
});
