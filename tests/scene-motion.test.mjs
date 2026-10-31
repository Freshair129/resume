import test from 'node:test';
import assert from 'node:assert/strict';
import { clampProgress, sculpturePose, scrollProgress } from '../src/features/portfolio/sceneMotion.mjs';

test('camera choreography remains finite at boundaries and reversible without accumulated time', () => {
  for (const invalid of [NaN, Infinity, -Infinity, undefined]) assert.equal(clampProgress(invalid), 0);
  assert.deepEqual(sculpturePose(-1), sculpturePose(0));
  assert.deepEqual(sculpturePose(2), sculpturePose(1));
  const forwards = Array.from({ length: 101 }, (_, i) => sculpturePose(i / 100));
  const backwards = Array.from({ length: 101 }, (_, i) => sculpturePose((100 - i) / 100)).reverse();
  assert.deepEqual(forwards, backwards);
  for (const pose of forwards) assert.ok(Object.values(pose).every(Number.isFinite));
  assert.ok(forwards[50].spread > forwards[0].spread + .5, 'The middle shot opens the sculpture.');
  assert.ok(forwards[100].spread < forwards[50].spread, 'The final shot reunites its parts.');
});

test('scroll travel is bounded and handles short/static viewports', () => {
  assert.equal(scrollProgress(-300, 100, 2200, 800), 0);
  assert.equal(scrollProgress(10000, 100, 2200, 800), 1);
  assert.equal(scrollProgress(400, 0, 400, 800), 0);
  assert.equal(scrollProgress(28, 100, 2200, 800), 0);
  assert.equal(scrollProgress(1500, 100, 2200, 800), 1);
});
