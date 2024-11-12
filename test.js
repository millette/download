// node
import test from 'node:test'
import assert from 'node:assert'

// self
import download from './download.js'

const invalidUrlRe = /^TypeError: Invalid URL$/
const fetchFailedRe = /^TypeError: fetch failed$/

test("no pathname", async (t) => {
  const g = await download("https://www.google.com")
  assert.ok(g.startsWith("<!doctype html>"))
  assert.ok(g.length > 20000)
})

test("index.html", async (t) => {
  const g = await download("https://example.com/index.html")
  assert.strictEqual(g.length, 1256)
})

test("with destination", async (t) => {
  const g = await download("https://example.com/index.html", "example.com/out.html")
  assert.strictEqual(g.length, 1256)
})

test("with destination option", async (t) => {
  const g = await download("https://example.com/index.html", { destination: "example.com/out2.html" })
  assert.strictEqual(g.length, 1256)
})

test(
  'just a string, it throws',
  async (t) => assert.rejects(async () => download("bob"), invalidUrlRe)
)

test(
  'bad server, it throws',
  async (t) => assert.rejects(async () => download("http://notarealserver.example.com/bad.html"), fetchFailedRe)
)
