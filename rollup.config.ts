import nodeResolve from '@rollup/plugin-node-resolve'
import typescript2 from 'rollup-plugin-typescript2'
// @ts-ignore
import babel from 'rollup-plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { join, resolve } from 'path'
import { readdir } from 'fs/promises'
import { RollupOptions, defineConfig } from 'rollup'
import { IOptions } from 'rollup-plugin-typescript2/dist/ioptions'
import { existsSync } from 'fs'
import { unlink, rmdir, lstat } from 'fs/promises'
const commonPlugins = [
  nodeResolve({
    extensions: ['.ts', '.tsx'],
  }),
  typescript2({
    tsConfig: resolve(__dirname, 'tsconfig.json'),
    // useTsconfigDeclarationDir: true, // 使用配置文件里的DeclarationDir 不开启默认强制生成在和文件同级目录同名文件
  } as Partial<IOptions>),
  babel({
    babelrc: true,
  }),
  commonjs(),
]
const removeDir = async (...dirs: string[]) => {
  for (const dir of dirs) {
    const absolutePath = resolve(__dirname, dir)
    if (existsSync(absolutePath)) {
      const dirStack = [absolutePath]
      while (dirStack.length > 0) {
        const initPath = dirStack[dirStack.length - 1]
        const fileStat = await lstat(initPath)
        if (fileStat.isDirectory()) {
          const files = await readdir(initPath)
          if (files.length > 0) {
            dirStack.push(...files.map((e) => join(initPath, e)))
          } else {
            await rmdir(initPath)
            dirStack.pop()
          }
        } else if (fileStat.isFile()) {
          await unlink(initPath)
          dirStack.pop()
        }
      }
    }
  }
}
const resolveRollupOptions = async () => {
  const results: RollupOptions[] = []
  const dirStack = [resolve(__dirname, 'src')]
  while (dirStack.length > 0) {
    const initPath = dirStack.shift()!
    const fileStat = await lstat(initPath)
    if (fileStat.isDirectory()) {
      const files = await readdir(initPath)
      if (files.length > 0) {
        dirStack.push(...files.map((e) => join(initPath, e)))
      }
    } else if (fileStat.isFile()) {
      const rollupOption: RollupOptions =
        process.env.NODE_ENV === 'development'
          ? {
              input: initPath,
              treeshake: false,
              external: ['react', 'react-dom'],
              output: {
                file: initPath
                  .replace(/src/, 'lib')
                  .replace(/\.(tsx|ts)/, '.js'),
                format: 'esm',
                sourcemap: true,
              },
              plugins: commonPlugins,
            }
          : {
              input: initPath,
              treeshake: true,
              external: ['react', 'react-dom'],
              output: {
                file: initPath
                  .replace(/src/, 'lib')
                  .replace(/\.(tsx|ts)/, '.min.js'),
                format: 'esm',
                sourcemap: false,
              },
              plugins: [...commonPlugins],
            }
      results.push(rollupOption)
    }
  }
  return results
}
export default defineConfig(async (/* commandLineArgs */) => {
  await removeDir('es', 'lib')
  // return resolveRollupOptions()
  return [
    {
      input: resolve(__dirname, 'src/index.ts'),
      treeshake: true,
      external: ['react', 'react-dom'],
      output: {
        name: 'ReactAlive',
        file: resolve(__dirname, 'es/index.js'),
        format: 'esm',
        sourcemap: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      plugins: commonPlugins,
    },
    {
      input: resolve(__dirname, 'src/index.ts'),
      treeshake: true,
      external: ['react', 'react-dom'],
      output: {
        name: 'ReactAlive',
        file: resolve(__dirname, 'lib/index.js'),
        format: 'umd',
        sourcemap: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      plugins: commonPlugins,
    },
  ] as RollupOptions[]
})
