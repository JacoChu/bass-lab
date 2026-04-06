## ADDED Requirements

### Requirement: Disable browser DSP processing on getUserMedia

The system SHALL request the audio stream with all browser-side DSP processing explicitly disabled. The `getUserMedia` audio constraints SHALL set `echoCancellation: false`, `noiseSuppression: false`, and `autoGainControl: false`.

#### Scenario: getUserMedia is called with DSP processing disabled

- **WHEN** the audio pipeline initializes and calls `getUserMedia` for audio
- **THEN** the call is made with constraints `{ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, deviceId: { exact: <selectedDeviceId> } } }`

#### Scenario: Browser ignores echoCancellation:false constraint

- **WHEN** the browser does not support disabling `echoCancellation` via constraints (returns `OverconstrainedError` or silently ignores)
- **THEN** the system logs a warning `"DSP constraint not honored by browser"` and continues with the stream as-is, without blocking the connection

---

### Requirement: Pre-amp gain via GainNode (5x)

After obtaining the raw audio stream, the system SHALL construct a Web Audio API processing graph. The graph SHALL include a `GainNode` with `gain.value = 5` positioned between the `MediaStreamSourceNode` and the downstream splitter. The final output SHALL be taken from a `MediaStreamDestinationNode`.

#### Scenario: Audio pipeline graph is constructed with GainNode

- **WHEN** the raw audio stream is obtained from `getUserMedia`
- **THEN** the system creates: `MediaStreamSourceNode → GainNode(gain=5) → ChannelSplitterNode(2) → [left GainNode(1.0), right GainNode(1.0)] → ChannelMergerNode(2) → MediaStreamDestinationNode`

#### Scenario: Output stream is taken from MediaStreamDestinationNode

- **WHEN** the audio pipeline graph is fully connected
- **THEN** the system uses `MediaStreamDestinationNode.stream` as the audio track source for the `RTCPeerConnection`, not the raw stream from `getUserMedia`

---

### Requirement: Mono-to-stereo channel mapping via ChannelSplitter/Merger

The system SHALL use `ChannelSplitterNode` and `ChannelMergerNode` to handle mono audio interface input. Channel 0 (left) of the raw input SHALL be routed to both channel 0 and channel 1 of the `ChannelMergerNode`, ensuring the output has equal audio on both left and right channels.

#### Scenario: Mono input from audio interface is mapped to both output channels

- **WHEN** the audio interface provides signal only on channel 0 (left)
- **THEN** the `ChannelSplitterNode` output index 0 is connected to both input index 0 and input index 1 of the `ChannelMergerNode`, so both output channels carry the same signal

#### Scenario: Stereo input device passes through correctly

- **WHEN** the audio device provides stereo signal (signal on both channel 0 and channel 1)
- **THEN** channel 0 is connected to merger input 0 and channel 1 is connected to merger input 1, preserving the original stereo signal

---

### Requirement: Audio pipeline teardown on disconnect

The system SHALL close the `AudioContext` and stop all `MediaStreamTrack` instances when the call ends or the component unmounts, to release the microphone hardware.

#### Scenario: Audio pipeline is torn down when call ends

- **WHEN** the WebRTC session ends or the user navigates away from the call page
- **THEN** the system calls `audioContext.close()` and calls `.stop()` on all tracks in the `MediaStreamDestinationNode.stream` and the original `getUserMedia` stream
