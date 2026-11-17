import { notFound } from 'next/navigation'

// Any address the site does not have (old WordPress links, typos) shows the branded "page not found".
export default function Missing() {
  notFound()
}
