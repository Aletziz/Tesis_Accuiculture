const consonants = 'bcdfghjklmnpqrstvwxyz'.split('');
const vowels = 'aeiou'.split('');

export function generateWord(minLength = 3, maxLength = 8): string {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let word = '';
  let useVowel = Math.random() > 0.5;

  while (word.length < length) {
    const letters = useVowel ? vowels : consonants;
    word += letters[Math.floor(Math.random() * letters.length)];
    useVowel = !useVowel;
  }

  return word;
}