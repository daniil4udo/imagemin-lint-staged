import child_process from 'node:child_process'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import util from 'node:util'

import { describe, expect, it } from 'vitest'

import { minifyFile } from '../lib/index.mjs'

const exec = util.promisify(child_process.exec)

describe('index module', () => {
  const FILENAMES = [
    './__fixtures__/test.gif',
    './__fixtures__/test.jpg',
    './__fixtures__/test.png',
    './__fixtures__/test.svg',
  ]

  const stats = () =>
    Promise.all(
      FILENAMES.map(async (f) => {
        const { size } = await stat(path.resolve(__dirname, f))
        return { f, size }
      }),
    )

  describe('minifyFile function', () => {
    it('should work as expected', async () => {
      const before = await stats()

      await Promise.all(
        FILENAMES.map(f => minifyFile(path.resolve(__dirname, f))),
      )

      const after = await stats()

      await exec('git checkout .')
      expect(after).not.toEqual(before)

      expect(before).toMatchSnapshot()
      expect(after).toMatchSnapshot()
    })
  })
})
