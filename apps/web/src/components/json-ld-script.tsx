interface JsonLdScriptProps {
  data: object
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      // oxlint-disable-next-line security/noDangerouslySetInnerHtml -- JSON-LD must be emitted as raw script text
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
