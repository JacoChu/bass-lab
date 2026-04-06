## ADDED Requirements

### Requirement: Enumerate available media devices

The system SHALL call `navigator.mediaDevices.enumerateDevices()` to retrieve the list of available audio input (`audioinput`) and video input (`videoinput`) devices. The enumeration SHALL be triggered on component mount and each time the user grants or changes device permissions. Each device entry SHALL display its `label` (or a fallback label of `"Microphone <index>"` / `"Camera <index>"` if `label` is empty due to permission not yet granted).

#### Scenario: Devices are enumerated on component mount

- **WHEN** the DeviceSelector component mounts
- **THEN** the system calls `enumerateDevices()` and populates two dropdown menus: one for `audioinput` devices and one for `videoinput` devices

#### Scenario: Device label is empty before permission granted

- **WHEN** `enumerateDevices()` returns an `audioinput` device with an empty `label`
- **THEN** the dropdown renders the entry as "Microphone 1" (using 1-based index)

#### Scenario: Device list refreshes after permission granted

- **WHEN** the user grants microphone permission through the browser permission dialog
- **THEN** the system re-calls `enumerateDevices()` and updates the dropdown to show actual device labels

---

### Requirement: Select specific audio input device by deviceId

The system SHALL allow the user to select a specific audio input device from the dropdown. The selected `deviceId` SHALL be stored in component state. When the user confirms their device selection, the system SHALL call `getUserMedia` with `audio: { deviceId: { exact: <selectedDeviceId> } }` to open the stream from the chosen device.

#### Scenario: User selects a specific audio interface channel

- **WHEN** the user opens the audio input dropdown and selects "Focusrite USB Audio (deviceId: abc123)"
- **THEN** the system stores `selectedAudioDeviceId = "abc123"` in state

#### Scenario: getUserMedia uses the exact selected deviceId

- **WHEN** the user confirms their device selection
- **THEN** the system calls `navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: "abc123" }, ... }, video: { deviceId: { exact: <videoDeviceId> } } })`

#### Scenario: Requested deviceId is no longer available

- **WHEN** `getUserMedia` fails with `OverconstrainedError` because the selected `deviceId` no longer exists
- **THEN** the system displays an error message "Selected device is no longer available. Please choose another." and re-renders the device selector

---

### Requirement: Select specific video input device by deviceId

The system SHALL allow the user to select a specific video input device from the `videoinput` dropdown. The selected `deviceId` SHALL be passed to `getUserMedia` via `video: { deviceId: { exact: <selectedDeviceId> } }`.

#### Scenario: User selects a webcam from the video input dropdown

- **WHEN** the user selects a video device with `deviceId: "cam456"` from the video dropdown
- **THEN** the system stores `selectedVideoDeviceId = "cam456"` in state and uses it on the next `getUserMedia` call
