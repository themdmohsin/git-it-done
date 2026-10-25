import { fill, missing, validate, saveDetails } from '../src/userDetails.ts'

const failures = []
const eq = (label, got, want) => { if (got !== want) failures.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`) }

const d = { name: 'My "Name" $x', email: 'me@example.com', ghuser: ' @my-user ', repo: 'My Repo!.git' }
eq('name escaped', fill('git config --global user.name "{{name}}"', d), 'git config --global user.name "My \\"Name\\" \\$x"')
eq('repo and ghuser', fill('https://github.com/{{ghuser}}/{{repo}}.git', d), 'https://github.com/my-user/My-Repo.git.git')
eq('empty token kept', fill('{{email}}', { ...d, email: '' }), '{{email}}')
eq('missing true', missing('{{email}}', { ...d, email: '' }), true)
eq('missing false', missing('{{email}} {{name}}', d), false)
for (const bad of ['nope', 'a@b', 'a@@b.com', 'a b@c.com', '@x.com']) eq('invalid email ' + bad, 'error' in validate('email', bad), true)
eq('valid email', 'value' in validate('email', 'a@b.co'), true)
eq('invalid ghuser', 'error' in validate('ghuser', 'bad_name!'), true)
const errs = saveDetails({ ...d, email: 'not-an-email', ghuser: 'ok' })
eq('invalid email rejected on save', !!errs.email, true)
eq('invalid email not stored', fill('{{email}}', undefined), '{{email}}')

if (failures.length) { failures.forEach((f) => console.log('  FAIL ' + f)); process.exit(1) }
console.log('userDetails unit tests passed')
