// node
import { join } from "node:path"
import { existsSync, createWriteStream } from "node:fs"
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { readFile, mkdir, rmdir, rm } from "node:fs/promises"

// npm
import urlToFilename from '@waglo/url-to-filename'

// options can be an object
// if it's a string, it's options.destination
// if it's false, it's options.encoding is null
// options.encoding is otherwise "utf8" by default
export default async function download(url, options) {
	const noEncoding = (options === false) || (options?.encoding === false)
	if (!options) options = {}
	else if (typeof options === "string") options = { destination: options }

	if (!options.encoding) options.encoding = "utf8"
	if (noEncoding) options.encoding = null

	let { destination, verbose, directory, encoding } = options
	if (verbose) console.error("Downloading", url)
	if (typeof url === "string") url = new URL(url)
	let { dir, filename } = urlToFilename(url)
  if (directory) dir = join(directory, dir)
	if (!destination) destination = join(dir, filename)
	if (!existsSync(dir)) await mkdir(dir, { recursive: true })
	try {
		if (existsSync(destination)) return readFile(destination, encoding)
	  const fileStream = createWriteStream(destination, { encoding, flags: 'wx' })
		fileStream.once("error", (e) => { throw e })
  	const res = await fetch(url)
  	await finished(Readable.fromWeb(res.body).pipe(fileStream))
		return readFile(destination, encoding)
	} catch (e) {
		await rm(destination)
		await rmdir(dir)
		throw e
	}
}
