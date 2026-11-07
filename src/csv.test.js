import { csvField } from './csv';

test('escapes quotes, commas and newlines in a field', () => {
  expect(csvField('A "quoted", line\nnext')).toBe('"A ""quoted"", line\nnext"');
});
