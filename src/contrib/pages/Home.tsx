import { GROUPS, SECTIONS } from '../sections'
import { guideHref } from '../router'
import { PageHeader, Section } from '../ui'

export function Home() {
  return (
    <div className="doc-content">
      <PageHeader
        eyebrow="Open Source Contribution Guide"
        title="Everything you need to make your first contribution"
        lead="Most of this is demonstrated live on GitHub and Visual Studio Code (VS Code). Use this guide to follow along, re-read any step afterwards, and complete the MUKTI challenge in your own time."
      />
      {GROUPS.map((g) => (
        <Section title={g} key={g}>
          <ul className="doc-tiles">
            {SECTIONS.filter((s) => s.group === g).map((s) => (
              <li key={s.slug}>
                <a href={guideHref(s.slug)}>{s.short}</a>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  )
}
