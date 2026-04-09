import { afterEach, describe, expect, test } from 'bun:test'
import { createCipheriv, pbkdf2Sync } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { Database } from 'bun:sqlite'

import { BROWSERS, TokenExtractor } from './token-extractor'

const CHROMIUM_IV = Buffer.alloc(16, 0x20)
const CHROMIUM_SALT = 'saltysalt'

let createdDirs: string[] = []

afterEach(() => {
  for (const dir of createdDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
  createdDirs = []
})

describe('TokenExtractor', () => {
  test('finds cookie databases for all browsers on macOS', async () => {
    const home = await makeTempDir()

    for (const browser of BROWSERS) {
      createCookieFile(join(home, 'Library', 'Application Support', browser.macPath, 'Default', 'Cookies'))
    }

    const extractor = new TokenExtractor('darwin', home)
    const paths = extractor.findCookieDatabases()

    expect(paths).toHaveLength(BROWSERS.length)
    for (const browser of BROWSERS) {
      expect(paths).toContainEqual(
        join(home, 'Library', 'Application Support', browser.macPath, 'Default', 'Cookies'),
      )
    }
  })

  test('finds cookie databases for all browsers on Linux', async () => {
    const home = await makeTempDir()

    for (const browser of BROWSERS) {
      createCookieFile(join(home, '.config', browser.linuxPath, 'Default', 'Cookies'))
    }

    const extractor = new TokenExtractor('linux', home)
    const paths = extractor.findCookieDatabases()

    expect(paths).toHaveLength(BROWSERS.length)
  })

  test('returns null when no cookie databases exist', async () => {
    const extractor = new TokenExtractor('linux', await makeTempDir())
    expect(await extractor.extract()).toBeNull()
  })

  test('extracts plaintext cookie value', async () => {
    const home = await makeTempDir()
    const dbPath = join(home, '.config', 'google-chrome', 'Default', 'Cookies')
    createCookieDbWithPlaintext(dbPath, 'my-session-id')

    const extractor = new TokenExtractor('linux', home)
    expect(await extractor.extract()).toEqual({ sessionCookie: 'my-session-id' })
  })

  test('decrypts encrypted cookie on Linux', async () => {
    const home = await makeTempDir()
    const dbPath = join(home, '.config', 'google-chrome', 'Default', 'Cookies')
    const encrypted = encryptLinuxCookie('decrypted-session')
    createCookieDbWithEncrypted(dbPath, encrypted)

    const extractor = new TokenExtractor('linux', home)
    expect(await extractor.extract()).toEqual({ sessionCookie: 'decrypted-session' })
  })
})

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'opensoma-token-extractor-'))
  createdDirs.push(dir)
  return dir
}

function createCookieFile(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, '')
}

function createCookieDbWithPlaintext(filePath: string, value: string): void {
  mkdirSync(dirname(filePath), { recursive: true })
  const db = new Database(filePath)
  db.run(
    'CREATE TABLE cookies (host_key TEXT, name TEXT, value TEXT, encrypted_value BLOB, creation_utc INTEGER, expires_utc INTEGER, is_httponly INTEGER, has_expires INTEGER, is_persistent INTEGER, priority INTEGER, samesite INTEGER, source_scheme INTEGER, is_secure INTEGER, path TEXT, last_access_utc INTEGER, last_update_utc INTEGER, source_port INTEGER, source_type INTEGER)',
  )
  db.run("INSERT INTO cookies (host_key, name, value, encrypted_value) VALUES ('swmaestro.ai', 'JSESSIONID', ?, '')", [
    value,
  ])
  db.close()
}

function createCookieDbWithEncrypted(filePath: string, encrypted: Buffer): void {
  mkdirSync(dirname(filePath), { recursive: true })
  const db = new Database(filePath)
  db.run(
    'CREATE TABLE cookies (host_key TEXT, name TEXT, value TEXT, encrypted_value BLOB, creation_utc INTEGER, expires_utc INTEGER, is_httponly INTEGER, has_expires INTEGER, is_persistent INTEGER, priority INTEGER, samesite INTEGER, source_scheme INTEGER, is_secure INTEGER, path TEXT, last_access_utc INTEGER, last_update_utc INTEGER, source_port INTEGER, source_type INTEGER)',
  )
  db.run("INSERT INTO cookies (host_key, name, value, encrypted_value) VALUES ('swmaestro.ai', 'JSESSIONID', '', ?)", [
    encrypted,
  ])
  db.close()
}

function encryptLinuxCookie(value: string): Buffer {
  const key = pbkdf2Sync('peanuts', CHROMIUM_SALT, 1, 16, 'sha1')
  const cipher = createCipheriv('aes-128-cbc', key, CHROMIUM_IV)
  return Buffer.concat([Buffer.from('v10'), cipher.update(value, 'utf8'), cipher.final()])
}
