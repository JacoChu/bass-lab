package main

import (
	"flag"
	"log"
	"net/http"

	"bass-lab/media-server/signaling"
)

func main() {
	addr := flag.String("addr", ":8080", "WebSocket server address")
	railsURL := flag.String("rails-url", "http://localhost:3000", "Rails backend base URL")
	flag.Parse()

	signaling.SetRailsBaseURL(*railsURL)

	http.HandleFunc("/ws/signal", signaling.HandleWebSocket)

	log.Printf("Media server listening on %s (Rails: %s)", *addr, *railsURL)
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
