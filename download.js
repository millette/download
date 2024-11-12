// node
import { join } from "node:path"
import { existsSync, createWriteStream } from "node:fs"
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { readFile, mkdir, rmdir, rm } from "node:fs/promises"

// npm
import urlToFilename from '@waglo/url-to-filename'

export default async function download(url, options) {
	if (!options) options = {}
	else if (typeof options === "string") options = { destination: options }
	let { destination, verbose } = options

	if (verbose) console.error("Downloading", url)
	if (typeof url === "string") url = new URL(url)
	const { dir, filename } = urlToFilename(url)
	if (!destination) destination = join(dir, filename)
	if (!existsSync(dir)) await mkdir(dir, { recursive: true })

	try {
		if (existsSync(destination)) return readFile(destination, 'utf8')
	  const fileStream = createWriteStream(destination, { flags: 'wx' })
		fileStream.once("error", (e) => { throw e })
  	const res = await fetch(url)
  	await finished(Readable.fromWeb(res.body).pipe(fileStream))
		return readFile(destination, 'utf8')
	} catch (e) {
		await rm(destination)
		await rmdir(dir)
		throw e
	}
}
