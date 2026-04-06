import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeviceSelector from './DeviceSelector'

const mockAudioDevices: MediaDeviceInfo[] = [
  { deviceId: 'audio-1', kind: 'audioinput', label: 'Focusrite Scarlett', groupId: '', toJSON: () => ({}) },
  { deviceId: 'audio-2', kind: 'audioinput', label: '', groupId: '', toJSON: () => ({}) },
]
const mockVideoDevices: MediaDeviceInfo[] = [
  { deviceId: 'video-1', kind: 'videoinput', label: 'FaceTime Camera', groupId: '', toJSON: () => ({}) },
  { deviceId: 'video-2', kind: 'videoinput', label: '', groupId: '', toJSON: () => ({}) },
]

function setupMediaDevicesMock(devices: MediaDeviceInfo[] = [...mockAudioDevices, ...mockVideoDevices]) {
  const listeners: Record<string, EventListener> = {}
  const mock = {
    enumerateDevices: vi.fn().mockResolvedValue(devices),
    addEventListener: vi.fn((event: string, cb: EventListener) => { listeners[event] = cb }),
    removeEventListener: vi.fn(),
    dispatchEvent: (ev: Event) => { listeners[ev.type]?.(ev) },
  }
  Object.defineProperty(navigator, 'mediaDevices', { value: mock, writable: true, configurable: true })
  return mock
}

beforeEach(() => {
  setupMediaDevicesMock()
})

test('renders audio and video selects after mount', async () => {
  render(<DeviceSelector onDevicesSelected={vi.fn()} />)
  await waitFor(() => {
    expect(screen.getByRole('combobox', { name: /microphone/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /camera/i })).toBeInTheDocument()
  })
})

test('shows device label when available, fallback index label when empty', async () => {
  render(<DeviceSelector onDevicesSelected={vi.fn()} />)
  await waitFor(() => {
    expect(screen.getByText('Focusrite Scarlett')).toBeInTheDocument()
    expect(screen.getByText('Microphone 2')).toBeInTheDocument()
    expect(screen.getByText('FaceTime Camera')).toBeInTheDocument()
    expect(screen.getByText('Camera 2')).toBeInTheDocument()
  })
})

test('calls onDevicesSelected when user changes selection', async () => {
  const onSelected = vi.fn()
  render(<DeviceSelector onDevicesSelected={onSelected} />)
  await waitFor(() => screen.getByRole('combobox', { name: /microphone/i }))

  await userEvent.selectOptions(screen.getByRole('combobox', { name: /microphone/i }), 'audio-2')
  expect(onSelected).toHaveBeenCalledWith(expect.objectContaining({ audioDeviceId: 'audio-2' }))
})

test('re-enumerates on devicechange event', async () => {
  const mock = setupMediaDevicesMock()
  render(<DeviceSelector onDevicesSelected={vi.fn()} />)
  await waitFor(() => expect(mock.enumerateDevices).toHaveBeenCalledTimes(1))

  act(() => { mock.dispatchEvent(new Event('devicechange')) })
  await waitFor(() => expect(mock.enumerateDevices).toHaveBeenCalledTimes(2))
})
