// node
import { existsSync } from "node:fs"
import test from 'node:test'
import assert from 'node:assert'

// self
import download from './download.js'

const invalidUrlRe = /^TypeError: Invalid URL$/
const fetchFailedRe = /^TypeError: fetch failed$/

test("no pathname", async (t) => {
  const g = await download("https://www.google.com")
  assert.ok(g.startsWith("<!doctype html>"))
  assert.ok((g.length > 15000) && (g.length < 25000))
})

test("destination directory", async (t) => {
  const g = await download("https://example.com/index.html", { directory: "woot" })
  assert.ok(existsSync("woot/example.com/index.html"))
  assert.strictEqual(g.length, 1256)
})

test("no encoding", async (t) => {
  const g = await download("https://cdn.cogecolive.com/prod-20241107/selection_from_7_nov_live_lr_grec_1730986147616863.mp3", false)
  assert.strictEqual(g.length, 20832543)
  const g2 = await download("https://cdn.cogecolive.com/prod-20241107/selection_from_7_nov_live_lr_grec_1730986147616863.mp3", { destination: "hola.mp3" })
  assert.notEqual(g2.length, 20832543)
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
