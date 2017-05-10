package main

// curl -H "Content-Type: application/json" -X POST -d '{"foo": ["foo","bar","wibble"], "xyzzy": 42}' http://localhost:8080/up

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func upHandler(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}

	//	defer req.Body.Close()
	raw, err := ioutil.ReadAll(req.Body)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	fmt.Printf("---\n%d bytes:\n%s\n---\n", len(raw), string(raw))
}

func main() {
	http.HandleFunc("/up", upHandler)
	http.HandleFunc("/reg", regHandler)
	http.ListenAndServe(":8080", nil)
}
