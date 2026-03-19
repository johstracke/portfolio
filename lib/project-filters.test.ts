import test from 'node:test';
import assert from 'node:assert/strict';
import type { Project } from '@/types';
import {
  countActiveProjectFilters,
  deriveProjectFacets,
  filterProjects,
  normalizeProjectFilters,
} from '@/lib/project-filters';

function makeProject(overrides: Partial<Project>): Project {
  return {
    id: '1',
    title: 'Default Title',
    slug: 'default-title',
    status: 'ongoing',
    ...overrides,
  };
}

const alpha = makeProject({
  id: 'alpha',
  title: 'Alpha Rover',
  slug: 'alpha-rover',
  status: 'completed',
  short_summary: 'Autonomous rover platform',
  domains: ['hardware', 'robotics'],
  context: 'Academic',
  tags: [{ id: '1', name: 'ROS', slug: 'ros', color: null }],
});

const beta = makeProject({
  id: 'beta',
  title: 'CubeSat Groundstation',
  slug: 'cubesat-groundstation',
  status: 'ongoing',
  short_summary: 'Mission operations stack',
  domains: ['software', 'space'],
  context: 'NGO',
  tags: [{ id: '2', name: 'Telemetry', slug: 'telemetry', color: null }],
});

const gamma = makeProject({
  id: 'gamma',
  title: 'Signal Dashboard',
  slug: 'signal-dashboard',
  status: 'paused',
  short_summary: 'Web UI for RF diagnostics',
  domains: ['software'],
  context: 'Personal',
  tags: [{ id: '3', name: 'Telemetry', slug: 'telemetry', color: null }],
});

test('normalizeProjectFilters trims and drops empty values', () => {
  const normalized = normalizeProjectFilters({
    domain: '  software  ',
    tag: ' ',
    status: '',
    context: ['  NGO  '],
    search: '   cubesat ',
  });

  assert.deepEqual(normalized, {
    domain: 'software',
    tag: undefined,
    status: undefined,
    context: 'NGO',
    search: 'cubesat',
  });
});

test('countActiveProjectFilters only counts normalized values', () => {
  const normalized = normalizeProjectFilters({
    domain: 'hardware',
    status: ' ',
    tag: 'ros',
    context: undefined,
    search: '  ',
  });

  assert.equal(countActiveProjectFilters(normalized), 2);
});

test('filterProjects applies canonical matching across all filters', () => {
  const projects = [alpha, beta, gamma];

  const filtered = filterProjects(projects, {
    domain: 'software',
    tag: 'telemetry',
    status: 'ongoing',
    context: 'NGO',
    search: 'operations',
  });

  assert.deepEqual(
    filtered.map((project) => project.id),
    ['beta']
  );
});

test('filterProjects search is case-insensitive and checks title/summary/slug', () => {
  const projects = [alpha, beta, gamma];

  assert.deepEqual(
    filterProjects(projects, { search: 'ROVER' }).map((project) => project.id),
    ['alpha']
  );
  assert.deepEqual(
    filterProjects(projects, { search: 'mission operations' }).map((project) => project.id),
    ['beta']
  );
  assert.deepEqual(
    filterProjects(projects, { search: 'signal-dashboard' }).map((project) => project.id),
    ['gamma']
  );
});

test('deriveProjectFacets returns stable deduplicated facets', () => {
  const facets = deriveProjectFacets([alpha, beta, gamma]);

  assert.deepEqual(facets.domains, ['hardware', 'robotics', 'software', 'space']);
  assert.deepEqual(facets.statuses, ['completed', 'ongoing', 'paused']);
  assert.deepEqual(facets.contexts, ['Academic', 'NGO', 'Personal']);
  assert.deepEqual(facets.tags, [
    { label: 'ROS', value: 'ros' },
    { label: 'Telemetry', value: 'telemetry' },
  ]);
});