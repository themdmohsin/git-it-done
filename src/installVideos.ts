import type { OS } from './engine/types'

/*
 * ADD YOUR INSTALLATION VIDEOS HERE. Nothing else needs to change.
 *
 * Each step takes either one address for every system, or a separate address per system:
 *
 *   vscode: { src: 'https://youtu.be/XXXXXXXXXXX', title: 'Installing VS Code' },
 *   'git-install': { src: { windows: 'https://youtu.be/AAA', macos: 'https://youtu.be/BBB', linux: 'https://youtu.be/CCC' } },
 *
 * Accepted addresses:
 *   - YouTube (watch, youtu.be or embed links)
 *   - Vimeo (vimeo.com/123456789)
 *   - A video file: put it in public/videos/ and write 'videos/vscode.mp4' (.mp4, .webm or .ogg)
 *   - Any other https:// link that allows embedding
 *
 * An empty or missing src shows the "Video coming soon" placeholder.
 */
export interface InstallVideo {
  /** One address, or one per system. */
  src?: string | Partial<Record<OS, string>>
  /** Short description, used as the video title for screen readers. */
  title?: string
}

export const INSTALL_VIDEOS: Record<string, InstallVideo> = {
  vscode: { title: 'How to install Visual Studio Code' },
  'git-install': { title: 'How to install Git' },
  'github-account': { title: 'How to create a GitHub account' },
  'gh-install': { title: 'How to install GitHub CLI and log in' },
  identity: { title: 'How to set up your Git identity' },
}

export type VideoKind = { kind: 'iframe'; url: string } | { kind: 'file'; url: string } | { kind: 'none' }

/** Turns a configured address into something the player can show. */
export function resolveVideo(video: InstallVideo | undefined, os: OS): VideoKind {
  const raw = typeof video?.src === 'string' ? video.src : video?.src?.[os]
  const src = (raw ?? '').trim()
  if (!src) return { kind: 'none' }

  const yt = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(src)
  if (yt) return { kind: 'iframe', url: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` }
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(src)
  if (vimeo) return { kind: 'iframe', url: `https://player.vimeo.com/video/${vimeo[1]}` }
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(src)) {
    return { kind: 'file', url: /^https?:\/\//i.test(src) ? src : import.meta.env.BASE_URL + src.replace(/^\/+/, '') }
  }
  if (/^https:\/\//i.test(src)) return { kind: 'iframe', url: src }
  return { kind: 'none' }
}
