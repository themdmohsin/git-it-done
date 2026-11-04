import { CONFIG } from '../config'
import { ConfigLink, Crumb, NextUp, PageHeader, Section } from '../ui'

export function FirstContribution() {
  return (
    <div className="doc-content">
      <Crumb />
      <PageHeader
        eyebrow="Your first contribution"
        title="Your First Open Source Contribution"
        lead="Let's contribute to MUKTI!"
      />

      <Section title="The MUKTI challenge repository">
        <p>
          This is the repository you will fork and contribute to during this workshop:{' '}
          <ConfigLink href={CONFIG.muktiRepoUrl} label="Open the MUKTI challenge repository" pendingLabel="MUKTI repository URL to be announced" />.
        </p>
      </Section>

      <Section title="The demonstration issue">
        <p>
          The demonstration forks, clones, edits, commits, pushes and opens a pull request live, using this issue:{' '}
          <ConfigLink href={CONFIG.demoIssueUrl} label="Open the demonstration issue" pendingLabel="Demonstration issue URL to be announced" />.
        </p>
      </Section>

      <Section title="What you're expected to accomplish">
        <ul>
          <li>Fork the MUKTI challenge repository into your own GitHub account.</li>
          <li>Clone your fork onto your own computer.</li>
          <li>Make the small, assigned change (see "Find Your Assigned Task" in the MUKTI Challenge section).</li>
          <li>Commit and push your change to your fork.</li>
          <li>Open a pull request back to the original MUKTI repository.</li>
        </ul>
      </Section>

      <Section title="Where to go next">
        <p>
          Follow the next four pages in order &mdash; Fork, Clone, Commit &amp; Push, Create a Pull Request &mdash; and you will
          have made a real open-source contribution by the end. When you're ready to do the full challenge yourself, head to{' '}
          <a className="inline" href="#/learn/challenge">MUKTI Challenge: Your Turn!</a>.
        </p>
      </Section>

      <NextUp />
    </div>
  )
}
