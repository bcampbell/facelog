package main

// curl -H "Content-Type: application/json" -X POST -d '{"foo": ["foo","bar","wibble"], "xyzzy": 42}' http://localhost:8080/up

import (
	"net/http"
)

var conf struct {
	dataDir string
}

func main() {
	conf.dataDir = "data"

	http.HandleFunc("/api/up", upHandler)
	http.HandleFunc("/api/reg", regHandler)
	http.ListenAndServe(":8080", nil)
}
