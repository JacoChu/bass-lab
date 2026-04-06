package sdp

import (
	"strings"
	"testing"
)

const sampleSDP = `v=0
o=- 4611731400430051336 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 126
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96
a=rtpmap:98 VP9/90000
a=rtpmap:99 H264/90000
a=fmtp:99 level-asymmetry-allowed=1
a=rtpmap:100 H264/90000
a=rtpmap:101 AV1/90000
`

func TestModifyOpusFmtp(t *testing.T) {
	out := Modify(sampleSDP)

	if !strings.Contains(out, "useinbandfec=1") {
		t.Error("missing useinbandfec=1")
	}
	if !strings.Contains(out, "stereo=1") {
		t.Error("missing stereo=1")
	}
	if !strings.Contains(out, "sprop-stereo=1") {
		t.Error("missing sprop-stereo=1")
	}
	if !strings.Contains(out, "maxaveragebitrate=128000") {
		t.Error("missing maxaveragebitrate=128000")
	}
	if !strings.Contains(out, "minptime=10") {
		t.Error("missing minptime=10")
	}
}

func TestModifyRemovesNonVP8Video(t *testing.T) {
	out := Modify(sampleSDP)

	// VP8 lines must stay
	if !strings.Contains(out, "VP8") {
		t.Error("VP8 was removed but should remain")
	}

	// Non-VP8 codecs must be gone
	for _, unwanted := range []string{"VP9", "H264", "AV1"} {
		if strings.Contains(out, unwanted) {
			t.Errorf("%s should have been removed but was found in output", unwanted)
		}
	}
}

func TestModifyKeepsAudioCodecs(t *testing.T) {
	out := Modify(sampleSDP)
	if !strings.Contains(out, "opus") {
		t.Error("opus should be kept")
	}
}
