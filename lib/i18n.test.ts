import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isLocale,
  getLocaleFromPathname,
  withLocalePath,
  toDirectusLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type Locale,
} from '@/lib/i18n';

test('isLocale() validates supported locales', (t) => {
  assert.ok(isLocale('en') === true, 'should accept "en"');
  assert.ok(isLocale('de') === true, 'should accept "de"');
  assert.ok(isLocale('fr') === false, 'should reject "fr"');
  assert.ok(isLocale('EN') === false, 'should reject uppercase "EN"');
  assert.ok(isLocale('') === false, 'should reject empty string');
  assert.ok(isLocale(null as unknown as string) === false, 'should reject null');
  assert.ok(isLocale(undefined as unknown as string) === false, 'should reject undefined');
});

test('getLocaleFromPathname() extracts locale from path', (t) => {
  assert.equal(getLocaleFromPathname('/en/projects'), 'en', 'should extract "en" from /en/projects');
  assert.equal(getLocaleFromPathname('/de/blog/slug'), 'de', 'should extract "de" from /de/blog/slug');
  assert.equal(getLocaleFromPathname('/projects'), 'en', 'should return default "en" for non-localized path');
  assert.equal(getLocaleFromPathname('/'), 'en', 'should return default "en" for root');
  assert.equal(getLocaleFromPathname('/fr/projects'), 'en', 'should return default "en" for unsupported locale');
  assert.equal(getLocaleFromPathname(''), 'en', 'should return default "en" for empty string');
});

test('withLocalePath() prepends locale to pathname', (t) => {
  assert.equal(
    withLocalePath('en', '/projects'),
    '/en/projects',
    'should prepend /en/ to /projects'
  );
  assert.equal(
    withLocalePath('de', '/blog/my-post'),
    '/de/blog/my-post',
    'should prepend /de/ to /blog/my-post'
  );
  assert.equal(
    withLocalePath('en', '/?search=test'),
    '/en/?search=test',
    'should preserve query params'
  );
  assert.equal(
    withLocalePath('de', '/'),
    '/de',
    'should convert / to /de'
  );
});

test('toDirectusLocale() maps locale to Directus language code', (t) => {
  assert.equal(toDirectusLocale('en'), 'en-US', 'should map "en" to "en-US"');
  assert.equal(toDirectusLocale('de'), 'de-DE', 'should map "de" to "de-DE"');
});

test('SUPPORTED_LOCALES contains expected values', (t) => {
  assert.deepEqual(SUPPORTED_LOCALES, ['en', 'de'], 'should contain English and German');
});

test('DEFAULT_LOCALE is English', (t) => {
  assert.equal(DEFAULT_LOCALE, 'en', 'default locale should be English');
});

test('Integration: getLocaleFromPathname + withLocalePath round-trip', (t) => {
  const testCases: Array<[Locale, string]> = [
    ['en', '/projects'],
    ['de', '/blog/post-title'],
    ['en', '/about'],
  ];

  for (const [locale, path] of testCases) {
    const localized = withLocalePath(locale, path);
    const extracted = getLocaleFromPathname(localized);
    assert.equal(
      extracted,
      locale,
      `round-trip: ${path} -> ${localized} -> ${extracted} should preserve locale`
    );
  }

  // Also test that non-localized paths default to en
  assert.equal(
    getLocaleFromPathname('/random-path'),
    'en',
    'random non-localized path should default to "en"'
  );
});
