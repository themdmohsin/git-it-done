import { Crumb, NextUp, PageHeader, Section } from '../../ui'
import { guideHref } from '../../router'

const TILES = [
  ['1', 'Start here', 'challenge/start', 'Check your setup and understand what success looks like.'],
  ['2', 'Find your assigned task', 'challenge/task', 'Locate your issue and understand what is being asked.'],
  ['3', 'Complete the task', 'challenge/complete', 'Fork, clone, edit, commit and push your change.'],
  ['4', 'Submit your PR', 'challenge/submit', 'Open a pull request back to the original repository.'],
  ['5', 'Verify your submission', 'challenge/verify', 'Confirm your pull request exists and is awaiting review.'],
  ['6', 'Troubleshooting', 'challenge/troubleshooting', 'Fixes for the most common beginner problems.'],
] as const

export function ChallengeHub() {
  return (
    <div className="doc-content">
      <Crumb />
      <PageHeader
        eyebrow="MUKTI challenge"
        title="MUKTI Challenge: Your Turn!"
        lead="Now it's your turn to make a real contribution. Work through the six steps below, in order."
      />

      <Section title="What is the MUKTI challenge?">
        <p>
          A small, real contribution to the MUKTI challenge repository: fork it, make the change assigned to you, and open a
          pull request. It uses exactly the same workflow as the live demonstration.
        </p>
      </Section>

      <Section title="What counts as a successful submission?">
        <ul>
          <li>You forked the MUKTI challenge repository into your own account.</li>
          <li>You made the specific change described in your assigned task &mdash; nothing more, nothing less.</li>
          <li>You opened a pull request from your fork back to the original repository.</li>
        </ul>
        <p>A merged pull request is a bonus, not a requirement &mdash; see "Verify Your Submission" for why.</p>
      </Section>

      <Section title="Work through these steps">
        <ol className="doc-tiles">
          {TILES.map(([n, title, slug, desc]) => (
            <li key={slug}>
              <a href={guideHref(slug)}>
                <span className="tn">Step {n}</span>
                <span className="tt">{title}</span>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', color: 'var(--muted)' }}>{desc}</p>
              </a>
            </li>
          ))}
        </ol>
      </Section>

      <NextUp />
    </div>
  )
}
