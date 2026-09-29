import {createHash} from 'node:crypto'
import {createReadStream, existsSync} from 'node:fs'
import {mkdir, readFile, rename, rm} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(path.join(root, 'scripts/vsl-media.json'), 'utf8'))
async function digest(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}
await mkdir(path.join(root, 'public/media'), {recursive:true})
for (const asset of manifest) {
  const target = path.join(root, 'public/media', asset.file)
  if (existsSync(target)) {
    if (await digest(target) !== asset.sha256) throw new Error(`Empreinte incorrecte : ${target}`)
    continue
  }
  const pending = `${target}.${process.pid}.download`
  try {
    execFileSync('rclone', ['copyto', asset.source, pending], {stdio:'inherit'})
    if (await digest(pending) !== asset.sha256) throw new Error(`Empreinte incorrecte : ${asset.file}`)
    await rename(pending, target)
  } finally {
    await rm(pending, {force:true})
  }
}
console.log('VSL validée : empreintes MP4 et affiche conformes.')
