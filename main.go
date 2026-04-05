package main

import (
	"fmt"
	"log"
	"net/http"

	"bass-lab/media-server/signaling"
)

func main() {
	http.HandleFunc("/ws/signal", signaling.HandleWebSocket)

	fmt.Println("Bass-Lab media server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
