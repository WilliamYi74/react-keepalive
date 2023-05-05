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
    extensions: ['.ts', '.tsx'], // 告诉node要解析的文件扩展名
  }),
  typescript2({
    tsConfig: resolve(__dirname, 'tsconfig.json'), // 指定ts配置文件位置
    // useTsconfigDeclarationDir: true, // 使用配置文件里的DeclarationDir 不开启默认强制生成在和文件同级目录同名文件
  } as Partial<IOptions>),
  babel({
    babelrc: true, // 使用.babelrc配置文件
  }),
  commonjs(), // 这个插件比如加 用来转换成commonjs 然后注入react17新的jsx组件转换函数_JSX react17+不再用createElement 不用这个插件只用babel处理会报错
]
/**
 * @description 根据路径删除目录
 * @param dirs 删除的目录路径
 */
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
  // 每次构建前先删除上一次的产物
  await removeDir('es', 'lib')
  // 生成两个产物 一个esmodule模块 一个umd通用模块
  return [
    {
      input: resolve(__dirname, 'src/index.ts'), // 指定入口文件
      treeshake: true, // 开启treeshaking
      external: ['react', 'react-dom'], // 第三方库使用外部依赖
      output: {
        name: 'ReactAlive', // 这个name用于打包成umd/iife模块时模块挂到全局对象上的key
        file: resolve(__dirname, 'es/index.js'), // 构建的产物输出位置和文件名
        format: 'esm', // 构建产物的模块化类型
        sourcemap: false, // 关闭sourcemap
        // 指定被排除掉的外部依赖在全局对象上的key
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
