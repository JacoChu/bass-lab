package sdp

import (
	"fmt"
	"regexp"
	"strings"
)

const opusFmtp = "useinbandfec=1;stereo=1;sprop-stereo=1;maxaveragebitrate=128000;minptime=10"

// Modify rewrites an SDP string to enforce Opus 128kbps stereo parameters
// and removes non-VP8 video codecs.
func Modify(sdp string) string {
	sdp = rewriteOpusFmtp(sdp)
	sdp = removeNonVP8Video(sdp)
	return sdp
}

// rewriteOpusFmtp replaces any existing a=fmtp line for Opus with the canonical set of parameters.
func rewriteOpusFmtp(sdp string) string {
	opusPT := extractOpusPayloadType(sdp)
	if opusPT == "" {
		return sdp
	}

	fmtpPattern := regexp.MustCompile(fmt.Sprintf(`(?m)^a=fmtp:%s .*$`, regexp.QuoteMeta(opusPT)))
	replacement := fmt.Sprintf("a=fmtp:%s %s", opusPT, opusFmtp)

	if fmtpPattern.MatchString(sdp) {
		return fmtpPattern.ReplaceAllString(sdp, replacement)
	}
	// No existing fmtp line — insert after the rtpmap line.
	rtpmapPattern := regexp.MustCompile(fmt.Sprintf(`(?m)^(a=rtpmap:%s .*)$`, regexp.QuoteMeta(opusPT)))
	return rtpmapPattern.ReplaceAllString(sdp, "${1}\n"+replacement)
}

func extractOpusPayloadType(sdp string) string {
	re := regexp.MustCompile(`(?mi)^a=rtpmap:(\d+) opus/`)
	m := re.FindStringSubmatch(sdp)
	if len(m) < 2 {
		return ""
	}
	return m[1]
}

// removeNonVP8Video strips all codec-related lines for codecs other than VP8/rtx
// and rewrites the m= payload type list.
func removeNonVP8Video(sdp string) string {
	lines := strings.Split(sdp, "\n")

	// First pass: find VP8 and its rtx payload types.
	inVideo := false
	vp8PT := ""
	rtxPT := ""

	for _, line := range lines {
		trimmed := strings.TrimRight(line, "\r")
		if strings.HasPrefix(trimmed, "m=video") {
			inVideo = true
		} else if strings.HasPrefix(trimmed, "m=") && !strings.HasPrefix(trimmed, "m=video") {
			inVideo = false
		}
		if !inVideo {
			continue
		}
		if m := regexp.MustCompile(`(?i)^a=rtpmap:(\d+) VP8/`).FindStringSubmatch(trimmed); len(m) == 2 {
			vp8PT = m[1]
		}
	}
	if vp8PT != "" {
		aptPattern := regexp.MustCompile(fmt.Sprintf(`^a=fmtp:(\d+) apt=%s$`, regexp.QuoteMeta(vp8PT)))
		for _, line := range lines {
			if m := aptPattern.FindStringSubmatch(strings.TrimRight(line, "\r")); len(m) == 2 {
				rtxPT = m[1]
				break
			}
		}
	}

	keepPTs := map[string]bool{vp8PT: vp8PT != "", rtxPT: rtxPT != ""}

	// Second pass: filter lines.
	inVideo = false
	var result []string
	for _, line := range lines {
		trimmed := strings.TrimRight(line, "\r")

		if strings.HasPrefix(trimmed, "m=video") {
			inVideo = true
			result = append(result, rewriteVideoMLine(trimmed, keepPTs))
			continue
		}
		if strings.HasPrefix(trimmed, "m=") {
			inVideo = false
		}

		if inVideo && skipVideoLine(trimmed, keepPTs) {
			continue
		}
		result = append(result, line)
	}

	return strings.Join(result, "\n")
}

func skipVideoLine(line string, keepPTs map[string]bool) bool {
	for _, prefix := range []string{"a=rtpmap:", "a=fmtp:", "a=rtcp-fb:"} {
		if strings.HasPrefix(line, prefix) {
			rest := line[len(prefix):]
			fields := strings.FieldsFunc(rest, func(r rune) bool { return r == ' ' })
			if len(fields) == 0 {
				return false
			}
			pt := fields[0]
			return !keepPTs[pt]
		}
	}
	return false
}

func rewriteVideoMLine(line string, keepPTs map[string]bool) string {
	parts := strings.Fields(line)
	if len(parts) < 4 {
		return line
	}
	kept := parts[:3]
	for _, pt := range parts[3:] {
		if keepPTs[pt] {
			kept = append(kept, pt)
		}
	}
	return strings.Join(kept, " ")
}
