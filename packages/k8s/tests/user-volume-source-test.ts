import { resolveUserVolumeSourcePath } from '../src/k8s/utils'

describe('resolveUserVolumeSourcePath', () => {
  const env = { ...process.env }

  beforeEach(() => {
    process.env.RUNNER_WORKSPACE = '/home/runner/_work/repo'
    process.env.GITHUB_WORKSPACE = '/home/runner/_work/repo/repo'
  })

  afterEach(() => {
    process.env = { ...env }
  })

  it('accepts an absolute path inside GITHUB_WORKSPACE', () => {
    expect(resolveUserVolumeSourcePath('/home/runner/_work/repo/repo')).toBe(
      '/home/runner/_work/repo/repo'
    )
    expect(
      resolveUserVolumeSourcePath('/home/runner/_work/repo/repo/data')
    ).toBe('/home/runner/_work/repo/repo/data')
  })

  it('accepts a path relative to the work folder', () => {
    expect(resolveUserVolumeSourcePath('cache')).toBe(
      '/home/runner/_work/cache'
    )
  })

  it.each([
    '/var/run/secrets/kubernetes.io/serviceaccount',
    '/home/runner/_work/repo/repo-evil',
    '/home/runner/_work/repo/repo/../../../../../etc',
    '../../../var/run/secrets/kubernetes.io/serviceaccount',
    '..'
  ])('rejects %s, which is outside the work folder', source => {
    expect(() => resolveUserVolumeSourcePath(source)).toThrow(
      'Volume mounts outside of the work folder are not supported'
    )
  })

  it('throws when the workspace variables are not set', () => {
    delete process.env.GITHUB_WORKSPACE
    expect(() => resolveUserVolumeSourcePath('cache')).toThrow(
      'GITHUB_WORKSPACE and RUNNER_WORKSPACE must be set'
    )
  })
})
