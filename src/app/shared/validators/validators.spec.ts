import { FormControl, FormGroup } from '@angular/forms';
import { notBlank } from './not-blank.validator';
import { passwordsMatch } from './passwords-match.validator';

describe('notBlank', () => {
  it('rejects a value made only of spaces', () => {
    expect(notBlank(new FormControl('   '))).toEqual({ blank: true });
  });
  it('accepts an empty string (required handles that)', () => {
    expect(notBlank(new FormControl(''))).toBeNull();
  });
  it('accepts normal text', () => {
    expect(notBlank(new FormControl(' Website '))).toBeNull();
  });
});

describe('passwordsMatch', () => {
  const makeGroup = (a: string, b: string) =>
    new FormGroup(
      { password: new FormControl(a), confirmPassword: new FormControl(b) },
      { validators: passwordsMatch('password', 'confirmPassword') },
    );

  it('is valid when the passwords match', () => {
    expect(makeGroup('secret1', 'secret1').hasError('passwordsMismatch')).toBe(false);
  });
  it('is invalid when the passwords differ', () => {
    expect(makeGroup('secret1', 'secret2').hasError('passwordsMismatch')).toBe(true);
  });
});
